<?php
/**
 * Database Utilities for ClockWork Gamers
 * 
 * This script provides database-related utilities for the admin panel
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

// Generate database report
function generateDbReport() {
    try {
        $db = connectToDatabase();
        
        // Table sizes
        $tableSizesSql = "
            SELECT
                table_name,
                pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size,
                pg_total_relation_size(quote_ident(table_name)) as raw_size
            FROM
                information_schema.tables
            WHERE
                table_schema = 'public'
            ORDER BY
                raw_size DESC;
        ";
        
        $tableStmt = $db->query($tableSizesSql);
        $tables = $tableStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Database size
        $dbSizeSql = "
            SELECT pg_size_pretty(pg_database_size(current_database())) as size,
                   pg_database_size(current_database()) as raw_size;
        ";
        
        $dbSizeStmt = $db->query($dbSizeSql);
        $dbSize = $dbSizeStmt->fetch(PDO::FETCH_ASSOC);
        
        // Record counts
        $recordCounts = [];
        foreach ($tables as $table) {
            $tableName = $table['table_name'];
            $countSql = "SELECT COUNT(*) as count FROM \"$tableName\";";
            $countStmt = $db->query($countSql);
            $count = $countStmt->fetch(PDO::FETCH_ASSOC);
            $recordCounts[$tableName] = $count['count'];
        }
        
        $report = [
            'success' => true,
            'database' => [
                'name' => $dbName,
                'size' => $dbSize['size'],
                'raw_size' => (int)$dbSize['raw_size']
            ],
            'tables' => $tables,
            'record_counts' => $recordCounts
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

// Execute a custom query
function executeQuery($query) {
    try {
        $db = connectToDatabase();
        
        // Basic security check to prevent destructive queries
        $lowerQuery = strtolower(trim($query));
        
        // Prevent direct data modifications unless explicitly authorized
        if (preg_match('/^\s*(delete|drop|truncate|update|alter)/i', $lowerQuery)) {
            $error = [
                'success' => false,
                'error' => 'Destructive queries are not allowed through this interface'
            ];
            echo json_encode($error, JSON_PRETTY_PRINT);
            return;
        }
        
        $stmt = $db->query($query);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $response = [
            'success' => true,
            'query' => $query,
            'rowCount' => $stmt->rowCount(),
            'results' => $results
        ];
        
        echo json_encode($response, JSON_PRETTY_PRINT);
        
    } catch (PDOException $e) {
        $error = [
            'success' => false,
            'query' => $query,
            'error' => $e->getMessage()
        ];
        echo json_encode($error, JSON_PRETTY_PRINT);
    }
}

// Main command processing
switch ($action) {
    case 'report':
        generateDbReport();
        break;
        
    case 'query':
        $query = isset($argv[2]) ? trim($argv[2], '"\'') : '';
        
        if (empty($query)) {
            echo json_encode(['success' => false, 'error' => 'No query provided']);
            exit(1);
        }
        
        executeQuery($query);
        break;
        
    default:
        echo json_encode(['success' => false, 'error' => 'Unknown action: ' . $action]);
        exit(1);
}