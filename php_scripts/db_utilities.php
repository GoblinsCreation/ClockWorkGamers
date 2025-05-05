<?php
/**
 * Database Utilities for ClockWork Gamers
 * 
 * This script provides PHP-based database utilities for the ClockWork Gamers platform.
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
 * Generate a database report
 */
function generate_db_report() {
    $conn = connect_db();
    
    // Get tables list
    $tables_query = "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'";
    $tables_result = pg_query($conn, $tables_query);
    
    if (!$tables_result) {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to query tables'
        ]);
        exit;
    }
    
    $tables = [];
    while ($row = pg_fetch_assoc($tables_result)) {
        $table_name = $row['tablename'];
        
        // Get row count for each table
        $count_query = "SELECT COUNT(*) FROM $table_name";
        $count_result = pg_query($conn, $count_query);
        $count = pg_fetch_row($count_result)[0];
        
        // Get column info
        $columns_query = "SELECT column_name, data_type FROM information_schema.columns 
                         WHERE table_schema = 'public' AND table_name = '$table_name'";
        $columns_result = pg_query($conn, $columns_query);
        
        $columns = [];
        while ($column = pg_fetch_assoc($columns_result)) {
            $columns[] = $column;
        }
        
        $tables[] = [
            'name' => $table_name,
            'row_count' => $count,
            'columns' => $columns
        ];
    }
    
    // Generate report
    $report = [
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'tables' => $tables
    ];
    
    pg_close($conn);
    
    echo json_encode($report, JSON_PRETTY_PRINT);
}

/**
 * Run a custom database query
 */
function run_custom_query($query) {
    $conn = connect_db();
    
    $result = pg_query($conn, $query);
    
    if (!$result) {
        echo json_encode([
            'success' => false,
            'error' => pg_last_error($conn)
        ]);
        exit;
    }
    
    $rows = [];
    while ($row = pg_fetch_assoc($result)) {
        $rows[] = $row;
    }
    
    $response = [
        'success' => true,
        'rows' => $rows,
        'row_count' => pg_num_rows($result)
    ];
    
    pg_close($conn);
    
    echo json_encode($response, JSON_PRETTY_PRINT);
}

/**
 * Main execution section
 */
// Get command from arguments
$command = $argv[1] ?? '';
$param = $argv[2] ?? '';

switch ($command) {
    case 'report':
        generate_db_report();
        break;
    case 'query':
        if (empty($param)) {
            echo json_encode([
                'success' => false,
                'error' => 'No query provided'
            ]);
            exit;
        }
        run_custom_query($param);
        break;
    default:
        echo json_encode([
            'success' => false,
            'error' => 'Unknown command'
        ]);
}
?>