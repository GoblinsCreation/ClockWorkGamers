<?php
/**
 * User Utilities for ClockWork Gamers
 * 
 * This script provides user-related utilities for the admin panel
 */

// Get database credentials from environment
$dbHost = $_ENV['PGHOST'] ?? 'localhost';
$dbPort = $_ENV['PGPORT'] ?? '5432';
$dbName = $_ENV['PGDATABASE'] ?? 'postgres';
$dbUser = $_ENV['PGUSER'] ?? 'postgres';
$dbPassword = $_ENV['PGPASSWORD'] ?? '';

// Command line arguments
$action = $argv[1] ?? '';

// Database connection function
function connectToDatabase() {
    global $dbHost, $dbPort, $dbName, $dbUser, $dbPassword;
    
    $dsn = "pgsql:host=$dbHost;port=$dbPort;dbname=$dbName;user=$dbUser;password=$dbPassword";
    
    try {
        $conn = new PDO($dsn);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        error_log("Connection failed: " . $e->getMessage());
        throw $e;
    }
}

// Generate user activity report
function generateUserActivityReport() {
    try {
        $db = connectToDatabase();
        
        // User registration over time
        $registrationSql = "
            SELECT 
                date_trunc('month', created_at) as month,
                COUNT(*) as count
            FROM 
                users
            GROUP BY 
                date_trunc('month', created_at)
            ORDER BY 
                month;
        ";
        
        $registrationStmt = $db->query($registrationSql);
        $registrations = $registrationStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // User roles distribution
        $rolesSql = "
            SELECT 
                role, 
                COUNT(*) as count
            FROM 
                users
            GROUP BY 
                role
            ORDER BY 
                count DESC;
        ";
        
        $rolesStmt = $db->query($rolesSql);
        $roles = $rolesStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Recent logins
        $loginsSql = "
            SELECT 
                id, 
                username, 
                email,
                last_login_at
            FROM 
                users
            WHERE 
                last_login_at IS NOT NULL
            ORDER BY 
                last_login_at DESC
            LIMIT 20;
        ";
        
        $loginsStmt = $db->query($loginsSql);
        $recentLogins = $loginsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Most active users by profile updates
        $activeUsersSql = "
            SELECT 
                u.id, 
                u.username, 
                u.email,
                up.updated_at as last_profile_update
            FROM 
                users u
            JOIN 
                user_profiles up ON u.id = up.user_id
            ORDER BY 
                up.updated_at DESC
            LIMIT 20;
        ";
        
        $activeUsersStmt = $db->query($activeUsersSql);
        $activeUsers = $activeUsersStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $report = [
            'success' => true,
            'registrations_by_month' => $registrations,
            'role_distribution' => $roles,
            'recent_logins' => $recentLogins,
            'most_active_users' => $activeUsers
        ];
        
        echo json_encode($report, JSON_PRETTY_PRINT);
        
    } catch (PDOException $e) {
        $error = [
            'success' => false,
            'error' => $e->getMessage()
        ];
        echo json_encode($error, JSON_PRETTY_PRINT);
    }
}

// Generate referral report
function generateReferralReport() {
    try {
        $db = connectToDatabase();
        
        // Top referrers
        $topReferrersSql = "
            SELECT 
                u.id as user_id,
                u.username,
                COUNT(r.id) as referral_count
            FROM 
                users u
            JOIN 
                referrals r ON u.id = r.referrer_id
            GROUP BY 
                u.id, u.username
            ORDER BY 
                referral_count DESC
            LIMIT 20;
        ";
        
        $topReferrersStmt = $db->query($topReferrersSql);
        $topReferrers = $topReferrersStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Referrals over time
        $referralsTrendSql = "
            SELECT 
                date_trunc('month', created_at) as month,
                COUNT(*) as count
            FROM 
                referrals
            GROUP BY 
                date_trunc('month', created_at)
            ORDER BY 
                month;
        ";
        
        $referralsTrendStmt = $db->query($referralsTrendSql);
        $referralsTrend = $referralsTrendStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Recent referrals
        $recentReferralsSql = "
            SELECT 
                r.id,
                u_referrer.username as referrer_username,
                u_referred.username as referred_username,
                r.created_at,
                r.status
            FROM 
                referrals r
            JOIN 
                users u_referrer ON r.referrer_id = u_referrer.id
            JOIN 
                users u_referred ON r.referred_id = u_referred.id
            ORDER BY 
                r.created_at DESC
            LIMIT 50;
        ";
        
        $recentReferralsStmt = $db->query($recentReferralsSql);
        $recentReferrals = $recentReferralsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $report = [
            'success' => true,
            'top_referrers' => $topReferrers,
            'referrals_trend' => $referralsTrend,
            'recent_referrals' => $recentReferrals
        ];
        
        echo json_encode($report, JSON_PRETTY_PRINT);
        
    } catch (PDOException $e) {
        $error = [
            'success' => false,
            'error' => $e->getMessage()
        ];
        echo json_encode($error, JSON_PRETTY_PRINT);
    }
}

// Reset a user's password
function resetUserPassword($userId, $newPasswordHash) {
    try {
        // Validate inputs
        if (empty($userId) || !is_numeric($userId)) {
            echo json_encode(['success' => false, 'error' => 'Invalid user ID']);
            return;
        }
        
        if (empty($newPasswordHash)) {
            echo json_encode(['success' => false, 'error' => 'Password hash cannot be empty']);
            return;
        }
        
        $db = connectToDatabase();
        
        // Update the user's password
        $updateSql = "
            UPDATE users
            SET password = :password_hash
            WHERE id = :user_id
            RETURNING id, username, email;
        ";
        
        $stmt = $db->prepare($updateSql);
        $stmt->bindParam(':password_hash', $newPasswordHash);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode(['success' => false, 'error' => 'User not found']);
            return;
        }
        
        $response = [
            'success' => true,
            'message' => 'Password reset successfully',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email']
            ]
        ];
        
        echo json_encode($response, JSON_PRETTY_PRINT);
        
    } catch (PDOException $e) {
        $error = [
            'success' => false,
            'error' => $e->getMessage()
        ];
        echo json_encode($error, JSON_PRETTY_PRINT);
    }
}

// Main command processing
switch ($action) {
    case 'activity':
        generateUserActivityReport();
        break;
        
    case 'referrals':
        generateReferralReport();
        break;
        
    case 'reset-password':
        $userId = $argv[2] ?? '';
        $newPasswordHash = isset($argv[3]) ? trim($argv[3], '"\'') : '';
        
        if (empty($userId) || empty($newPasswordHash)) {
            echo json_encode([
                'success' => false, 
                'error' => 'User ID and password hash are required'
            ]);
            exit(1);
        }
        
        resetUserPassword($userId, $newPasswordHash);
        break;
        
    default:
        echo json_encode(['success' => false, 'error' => 'Unknown action: ' . $action]);
        exit(1);
}