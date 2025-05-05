<?php
/**
 * User Utilities for ClockWork Gamers
 * 
 * This script provides PHP-based user management utilities for the ClockWork Gamers platform.
 * It can be executed via the Node.js server using child_process.
 */

// Database configuration - should match our PostgreSQL database
$db_config = [
    'host' => getenv('PGHOST'),
    'port' => getenv('PGPORT'),
    'dbname' => getenv('PGDATABASE'),
    'user' => getenv('PGUSER'),
    'password' => getenv('PGPASSWORD')
];

/**
 * Establishes database connection using the configuration
 */
function connect_db() {
    global $db_config;
    
    $connection_string = sprintf(
        "host=%s port=%s dbname=%s user=%s password=%s",
        $db_config['host'],
        $db_config['port'],
        $db_config['dbname'],
        $db_config['user'],
        $db_config['password']
    );
    
    $conn = pg_connect($connection_string);
    
    if (!$conn) {
        $error = error_get_last();
        echo json_encode([
            'success' => false,
            'error' => $error['message'] ?? 'Failed to connect to database'
        ]);
        exit;
    }
    
    return $conn;
}

/**
 * Generate user activity report
 */
function generate_user_activity_report() {
    $conn = connect_db();
    
    // Get user activity data
    $query = "
        SELECT 
            u.id, 
            u.username, 
            u.email,
            u.created_at,
            (SELECT COUNT(*) FROM chat_messages WHERE user_id = u.id) as message_count,
            (SELECT MAX(created_at) FROM chat_messages WHERE user_id = u.id) as last_message,
            (SELECT COUNT(*) FROM referrals WHERE referrer_id = u.id) as referral_count
        FROM 
            users u
        ORDER BY 
            u.created_at DESC
    ";
    
    $result = pg_query($conn, $query);
    
    if (!$result) {
        echo json_encode([
            'success' => false,
            'error' => pg_last_error($conn)
        ]);
        exit;
    }
    
    $users = [];
    while ($row = pg_fetch_assoc($result)) {
        $users[] = $row;
    }
    
    // Generate report
    $report = [
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'users' => $users,
        'total_users' => count($users)
    ];
    
    pg_close($conn);
    
    echo json_encode($report, JSON_PRETTY_PRINT);
}

/**
 * Generate referral performance report
 */
function generate_referral_report() {
    $conn = connect_db();
    
    // Get referral data
    $query = "
        SELECT 
            u.id,
            u.username,
            u.referral_code,
            COUNT(r.id) as referrals_count,
            SUM(CASE WHEN ru.is_active = true THEN 1 ELSE 0 END) as active_referrals
        FROM 
            users u
        LEFT JOIN 
            referrals r ON u.id = r.referrer_id
        LEFT JOIN 
            users ru ON r.referred_id = ru.id
        GROUP BY 
            u.id, u.username, u.referral_code
        ORDER BY 
            referrals_count DESC
    ";
    
    $result = pg_query($conn, $query);
    
    if (!$result) {
        echo json_encode([
            'success' => false,
            'error' => pg_last_error($conn)
        ]);
        exit;
    }
    
    $referrals = [];
    while ($row = pg_fetch_assoc($result)) {
        $referrals[] = $row;
    }
    
    // Generate report
    $report = [
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'referrals' => $referrals,
        'total_referrals' => array_sum(array_column($referrals, 'referrals_count'))
    ];
    
    pg_close($conn);
    
    echo json_encode($report, JSON_PRETTY_PRINT);
}

/**
 * Reset a user's password
 */
function reset_user_password($user_id, $new_password_hash) {
    $conn = connect_db();
    
    // Update user password
    $query = "UPDATE users SET password = $1 WHERE id = $2 RETURNING id, username, email";
    $result = pg_query_params($conn, $query, [$new_password_hash, $user_id]);
    
    if (!$result) {
        echo json_encode([
            'success' => false,
            'error' => pg_last_error($conn)
        ]);
        exit;
    }
    
    if (pg_num_rows($result) === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'User not found'
        ]);
        exit;
    }
    
    $user = pg_fetch_assoc($result);
    
    pg_close($conn);
    
    echo json_encode([
        'success' => true,
        'message' => 'Password has been reset',
        'user' => $user
    ]);
}

/**
 * Main execution section
 */
// Get command from arguments
$command = $argv[1] ?? '';
$param1 = $argv[2] ?? '';
$param2 = $argv[3] ?? '';

switch ($command) {
    case 'activity':
        generate_user_activity_report();
        break;
    case 'referrals':
        generate_referral_report();
        break;
    case 'reset-password':
        if (empty($param1) || empty($param2)) {
            echo json_encode([
                'success' => false,
                'error' => 'User ID and new password hash are required'
            ]);
            exit;
        }
        reset_user_password($param1, $param2);
        break;
    default:
        echo json_encode([
            'success' => false,
            'error' => 'Unknown command'
        ]);
}
?>