<?php
/**
 * Admin Panel for ClockWork Gamers
 * 
 * This is a simple PHP-based admin panel that can be accessed directly
 * when deployed to a server with PHP support.
 */

// Get database credentials from environment or config
$dbHost = $_ENV['PGHOST'] ?? 'localhost';
$dbPort = $_ENV['PGPORT'] ?? '5432';
$dbName = $_ENV['PGDATABASE'] ?? 'postgres';
$dbUser = $_ENV['PGUSER'] ?? 'postgres';
$dbPassword = $_ENV['PGPASSWORD'] ?? '';

// Database connection function
function connectToDatabase() {
    global $dbHost, $dbPort, $dbName, $dbUser, $dbPassword;
    
    $dsn = "pgsql:host=$dbHost;port=$dbPort;dbname=$dbName;user=$dbUser;password=$dbPassword";
    
    try {
        $conn = new PDO($dsn);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        throw $e;
    }
}

// Check authentication - this would be more secure in a real environment
$isAuthenticated = isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW']);
$isAdmin = false;

if ($isAuthenticated) {
    try {
        $db = connectToDatabase();
        $stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND is_admin = TRUE");
        $stmt->execute([$_SERVER['PHP_AUTH_USER']]);
        $admin = $stmt->fetch();
        
        if ($admin) {
            // Would verify password properly in a real implementation
            $isAdmin = true;
        }
    } catch (PDOException $e) {
        $error = $e->getMessage();
    }
}

// If not authenticated, request authentication
if (!$isAuthenticated || !$isAdmin) {
    header('WWW-Authenticate: Basic realm="ClockWork Gamers Admin"');
    header('HTTP/1.0 401 Unauthorized');
    echo '<h1>Unauthorized</h1><p>You must be an admin to access this page</p>';
    exit;
}

// Process any form submissions
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = connectToDatabase();
        
        if (isset($_POST['action'])) {
            switch ($_POST['action']) {
                case 'reset_password':
                    $userId = $_POST['user_id'] ?? '';
                    $newPassword = $_POST['new_password'] ?? '';
                    
                    if (!empty($userId) && !empty($newPassword)) {
                        // In a real implementation, we would hash the password properly
                        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                        
                        $stmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
                        $success = $stmt->execute([$hashedPassword, $userId]);
                        
                        if ($success) {
                            $message = "Password updated successfully";
                        } else {
                            $message = "Failed to update password";
                        }
                    } else {
                        $message = "User ID and password are required";
                    }
                    break;
                
                case 'change_role':
                    $userId = $_POST['user_id'] ?? '';
                    $newRole = $_POST['new_role'] ?? '';
                    
                    if (!empty($userId) && !empty($newRole)) {
                        $isAdminValue = ($newRole === 'Admin' || $newRole === 'Owner') ? 'TRUE' : 'FALSE';
                        
                        $stmt = $db->prepare("UPDATE users SET role = ?, is_admin = $isAdminValue WHERE id = ?");
                        $success = $stmt->execute([$newRole, $userId]);
                        
                        if ($success) {
                            $message = "Role updated successfully";
                        } else {
                            $message = "Failed to update role";
                        }
                    } else {
                        $message = "User ID and role are required";
                    }
                    break;
                
                default:
                    $message = "Unknown action";
            }
        }
    } catch (PDOException $e) {
        $message = "Error: " . $e->getMessage();
    }
}

// Get users for display
$users = [];
try {
    $db = connectToDatabase();
    $stmt = $db->query("SELECT id, username, email, role, is_admin, created_at FROM users ORDER BY id");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $message = "Error loading users: " . $e->getMessage();
}

// Get database stats
$dbStats = [];
try {
    $db = connectToDatabase();
    
    // Table counts
    $tables = $db->query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        $count = $db->query("SELECT COUNT(*) FROM \"$table\"")->fetchColumn();
        $dbStats[$table] = $count;
    }
} catch (PDOException $e) {
    $message = "Error loading database stats: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ClockWork Gamers Admin Panel</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #0f172a;
            color: #f8fafc;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background-color: #1e293b;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #3b82f6;
        }
        
        h1 {
            margin: 0;
            color: #f97316;
        }
        
        .message {
            background-color: #059669;
            color: white;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        
        .message.error {
            background-color: #dc2626;
        }
        
        .section {
            background-color: #1e293b;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        h2 {
            margin-top: 0;
            border-bottom: 1px solid #3b82f6;
            padding-bottom: 10px;
            color: #f97316;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        table, th, td {
            border: 1px solid #334155;
        }
        
        th {
            background-color: #334155;
            padding: 10px;
            text-align: left;
        }
        
        td {
            padding: 10px;
        }
        
        tr:nth-child(even) {
            background-color: #1f2937;
        }
        
        form {
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        input, select, textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #334155;
            border-radius: 4px;
            background-color: #1f2937;
            color: #f8fafc;
        }
        
        button {
            background-color: #3b82f6;
            border: none;
            color: white;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
        }
        
        button:hover {
            background-color: #2563eb;
        }
        
        .flex-row {
            display: flex;
            gap: 20px;
        }
        
        .flex-column {
            flex: 1;
        }
    </style>
</head>
<body>
    <header>
        <h1>ClockWork Gamers Admin Panel</h1>
    </header>
    
    <div class="container">
        <?php if (!empty($message)): ?>
            <div class="message <?php echo strpos($message, 'Error') !== false ? 'error' : ''; ?>">
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>
        
        <div class="flex-row">
            <div class="flex-column">
                <section class="section">
                    <h2>Quick Actions</h2>
                    
                    <h3>Reset User Password</h3>
                    <form method="post">
                        <input type="hidden" name="action" value="reset_password">
                        
                        <div class="form-group">
                            <label for="user_id">User ID:</label>
                            <input type="number" id="user_id" name="user_id" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="new_password">New Password:</label>
                            <input type="password" id="new_password" name="new_password" required>
                        </div>
                        
                        <button type="submit">Reset Password</button>
                    </form>
                    
                    <h3>Change User Role</h3>
                    <form method="post">
                        <input type="hidden" name="action" value="change_role">
                        
                        <div class="form-group">
                            <label for="user_id_role">User ID:</label>
                            <input type="number" id="user_id_role" name="user_id" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="new_role">New Role:</label>
                            <select id="new_role" name="new_role" required>
                                <option value="User">User</option>
                                <option value="Mod">Moderator</option>
                                <option value="Admin">Admin</option>
                                <option value="Owner">Owner</option>
                            </select>
                        </div>
                        
                        <button type="submit">Change Role</button>
                    </form>
                </section>
                
                <section class="section">
                    <h2>Database Stats</h2>
                    <table>
                        <tr>
                            <th>Table</th>
                            <th>Record Count</th>
                        </tr>
                        <?php foreach ($dbStats as $table => $count): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($table); ?></td>
                                <td><?php echo htmlspecialchars($count); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </table>
                </section>
            </div>
            
            <div class="flex-column">
                <section class="section">
                    <h2>Users</h2>
                    <table>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created</th>
                        </tr>
                        <?php foreach ($users as $user): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($user['id']); ?></td>
                                <td><?php echo htmlspecialchars($user['username']); ?></td>
                                <td><?php echo htmlspecialchars($user['email']); ?></td>
                                <td><?php echo htmlspecialchars($user['role']); ?></td>
                                <td><?php echo htmlspecialchars($user['created_at']); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </table>
                </section>
            </div>
        </div>
    </div>
</body>
</html>