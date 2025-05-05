<?php
/**
 * Admin Panel HTML Renderer for ClockWork Gamers
 * 
 * This script provides a direct PHP-based admin panel for the ClockWork Gamers platform.
 * It serves as an alternate admin interface that can be accessed directly.
 */

// Authentication check (should match with our Node.js session system)
session_start();

// Database configuration
$db_config = [
    'host' => getenv('PGHOST'),
    'port' => getenv('PGPORT'),
    'dbname' => getenv('PGDATABASE'),
    'user' => getenv('PGUSER'),
    'password' => getenv('PGPASSWORD')
];

/**
 * Establishes database connection
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
        die("Connection failed: " . (error_get_last()['message'] ?? 'Unknown error'));
    }
    
    return $conn;
}

/**
 * Get user by ID
 */
function get_user($user_id) {
    $conn = connect_db();
    $query = "SELECT * FROM users WHERE id = $1";
    $result = pg_query_params($conn, $query, [$user_id]);
    
    if (!$result || pg_num_rows($result) === 0) {
        return null;
    }
    
    $user = pg_fetch_assoc($result);
    pg_close($conn);
    
    return $user;
}

/**
 * Check if user is admin
 */
function is_admin($user_id) {
    $conn = connect_db();
    $query = "SELECT is_admin FROM users WHERE id = $1";
    $result = pg_query_params($conn, $query, [$user_id]);
    
    if (!$result || pg_num_rows($result) === 0) {
        return false;
    }
    
    $user = pg_fetch_assoc($result);
    pg_close($conn);
    
    return $user['is_admin'] === 't';
}

/**
 * Get all users
 */
function get_all_users() {
    $conn = connect_db();
    $query = "SELECT id, username, email, full_name, role, is_admin, created_at FROM users ORDER BY id";
    $result = pg_query($conn, $query);
    
    $users = [];
    while ($row = pg_fetch_assoc($result)) {
        $users[] = $row;
    }
    
    pg_close($conn);
    
    return $users;
}

/**
 * Get all streamers
 */
function get_all_streamers() {
    $conn = connect_db();
    $query = "SELECT s.*, u.username FROM streamers s JOIN users u ON s.user_id = u.id ORDER BY s.display_name";
    $result = pg_query($conn, $query);
    
    $streamers = [];
    while ($row = pg_fetch_assoc($result)) {
        $streamers[] = $row;
    }
    
    pg_close($conn);
    
    return $streamers;
}

/**
 * Get all news articles
 */
function get_all_news() {
    $conn = connect_db();
    $query = "SELECT n.*, u.username FROM news n JOIN users u ON n.author_id = u.id ORDER BY n.created_at DESC";
    $result = pg_query($conn, $query);
    
    $news = [];
    while ($row = pg_fetch_assoc($result)) {
        $news[] = $row;
    }
    
    pg_close($conn);
    
    return $news;
}

/**
 * Get all rental requests
 */
function get_all_rental_requests() {
    $conn = connect_db();
    $query = "SELECT r.*, u.username FROM rental_requests r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC";
    $result = pg_query($conn, $query);
    
    $requests = [];
    while ($row = pg_fetch_assoc($result)) {
        $requests[] = $row;
    }
    
    pg_close($conn);
    
    return $requests;
}

/**
 * Get database stats
 */
function get_db_stats() {
    $conn = connect_db();
    
    $stats = [
        'users' => 0,
        'streamers' => 0,
        'news' => 0,
        'rentals' => 0,
        'referrals' => 0
    ];
    
    // Users count
    $query = "SELECT COUNT(*) FROM users";
    $result = pg_query($conn, $query);
    $stats['users'] = pg_fetch_row($result)[0];
    
    // Streamers count
    $query = "SELECT COUNT(*) FROM streamers";
    $result = pg_query($conn, $query);
    $stats['streamers'] = pg_fetch_row($result)[0];
    
    // News count
    $query = "SELECT COUNT(*) FROM news";
    $result = pg_query($conn, $query);
    $stats['news'] = pg_fetch_row($result)[0];
    
    // Rentals count
    $query = "SELECT COUNT(*) FROM rental_requests";
    $result = pg_query($conn, $query);
    $stats['rentals'] = pg_fetch_row($result)[0];
    
    // Referrals count
    $query = "SELECT COUNT(*) FROM referrals";
    $result = pg_query($conn, $query);
    $stats['referrals'] = pg_fetch_row($result)[0];
    
    pg_close($conn);
    
    return $stats;
}

// Check for action parameter
$action = $_GET['action'] ?? 'dashboard';

// Authentication check
$is_authenticated = isset($_SESSION['user_id']);
$current_user = $is_authenticated ? get_user($_SESSION['user_id']) : null;
$is_admin_user = $is_authenticated && is_admin($_SESSION['user_id']);

// Redirect to login if not authenticated
if (!$is_authenticated && $action !== 'login') {
    header('Location: admin_panel.php?action=login');
    exit;
}

// Redirect to dashboard if not admin
if ($action !== 'login' && !$is_admin_user) {
    echo "Access denied. You must be an administrator to access this page.";
    exit;
}

// Handle login form submission
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    $conn = connect_db();
    $query = "SELECT * FROM users WHERE username = $1";
    $result = pg_query_params($conn, $query, [$username]);
    
    if ($result && pg_num_rows($result) > 0) {
        $user = pg_fetch_assoc($result);
        
        // Verify password - assumes password is stored as hash.salt format
        list($hashed, $salt) = explode('.', $user['password']);
        $hashedInput = hash_hmac('sha256', $password, $salt);
        
        if ($hashedInput === $hashed) {
            // Set session
            $_SESSION['user_id'] = $user['id'];
            
            // Redirect to dashboard
            header('Location: admin_panel.php');
            exit;
        }
    }
    
    $login_error = "Invalid username or password";
}

// Render the page
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ClockWork Gamers - PHP Admin Panel</title>
    <style>
        /* Base styles */
        body {
            font-family: 'Arial', sans-serif;
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
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        header h1 {
            margin: 0;
            color: #f97316;
        }
        
        nav {
            background-color: #1e293b;
            padding: 10px 20px;
        }
        
        nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
        }
        
        nav ul li {
            margin-right: 15px;
        }
        
        nav ul li a {
            color: #f8fafc;
            text-decoration: none;
            padding: 5px 10px;
            border-radius: 4px;
        }
        
        nav ul li a:hover, nav ul li a.active {
            background-color: #334155;
        }
        
        .card {
            background-color: #1e293b;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .card h2 {
            margin-top: 0;
            color: #f97316;
            border-bottom: 1px solid #334155;
            padding-bottom: 10px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background-color: #334155;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        
        .stat-card h3 {
            margin: 0;
            color: #f8fafc;
            font-size: 16px;
        }
        
        .stat-card p {
            font-size: 28px;
            font-weight: bold;
            margin: 10px 0 0 0;
            color: #f97316;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #334155;
        }
        
        th {
            background-color: #334155;
            color: #f97316;
        }
        
        tr:hover {
            background-color: #334155;
        }
        
        .btn {
            display: inline-block;
            padding: 8px 16px;
            background-color: #f97316;
            color: #ffffff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            font-size: 14px;
        }
        
        .btn:hover {
            background-color: #ea580c;
        }
        
        /* Login form */
        .login-container {
            max-width: 400px;
            margin: 100px auto;
            background-color: #1e293b;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        
        .login-container h2 {
            margin-top: 0;
            color: #f97316;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #f8fafc;
        }
        
        .form-group input {
            width: 100%;
            padding: 10px;
            background-color: #0f172a;
            border: 1px solid #334155;
            color: #f8fafc;
            border-radius: 4px;
            box-sizing: border-box;
        }
        
        .login-btn {
            display: block;
            width: 100%;
            padding: 12px;
            background-color: #f97316;
            color: #ffffff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        
        .login-btn:hover {
            background-color: #ea580c;
        }
        
        .error-message {
            color: #ef4444;
            margin-bottom: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <?php if ($action === 'login'): ?>
        <div class="login-container">
            <h2>ClockWork Gamers Admin</h2>
            
            <?php if (isset($login_error)): ?>
                <div class="error-message"><?php echo $login_error; ?></div>
            <?php endif; ?>
            
            <form method="post" action="admin_panel.php?action=login">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="login-btn">Login</button>
            </form>
        </div>
    <?php else: ?>
        <header>
            <h1>ClockWork Gamers Admin Panel</h1>
            <div>
                <span>Welcome, <?php echo htmlspecialchars($current_user['username']); ?></span>
                <a href="admin_panel.php?action=logout" class="btn">Logout</a>
            </div>
        </header>
        
        <nav>
            <ul>
                <li><a href="admin_panel.php" class="<?php echo $action === 'dashboard' ? 'active' : ''; ?>">Dashboard</a></li>
                <li><a href="admin_panel.php?action=users" class="<?php echo $action === 'users' ? 'active' : ''; ?>">Users</a></li>
                <li><a href="admin_panel.php?action=streamers" class="<?php echo $action === 'streamers' ? 'active' : ''; ?>">Streamers</a></li>
                <li><a href="admin_panel.php?action=news" class="<?php echo $action === 'news' ? 'active' : ''; ?>">News</a></li>
                <li><a href="admin_panel.php?action=rental_requests" class="<?php echo $action === 'rental_requests' ? 'active' : ''; ?>">Rental Requests</a></li>
                <li><a href="admin_panel.php?action=database" class="<?php echo $action === 'database' ? 'active' : ''; ?>">Database</a></li>
            </ul>
        </nav>
        
        <div class="container">
            <?php if ($action === 'dashboard' || $action === ''): ?>
                <?php $stats = get_db_stats(); ?>
                
                <h2>Dashboard</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Total Users</h3>
                        <p><?php echo $stats['users']; ?></p>
                    </div>
                    <div class="stat-card">
                        <h3>Streamers</h3>
                        <p><?php echo $stats['streamers']; ?></p>
                    </div>
                    <div class="stat-card">
                        <h3>News Articles</h3>
                        <p><?php echo $stats['news']; ?></p>
                    </div>
                    <div class="stat-card">
                        <h3>Rental Requests</h3>
                        <p><?php echo $stats['rentals']; ?></p>
                    </div>
                    <div class="stat-card">
                        <h3>Referrals</h3>
                        <p><?php echo $stats['referrals']; ?></p>
                    </div>
                </div>
                
                <div class="card">
                    <h2>Recent Users</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                                $users = get_all_users();
                                $count = 0;
                                foreach ($users as $user): 
                                    if ($count >= 5) break;
                                    $count++;
                            ?>
                                <tr>
                                    <td><?php echo $user['id']; ?></td>
                                    <td><?php echo htmlspecialchars($user['username']); ?></td>
                                    <td><?php echo htmlspecialchars($user['email']); ?></td>
                                    <td><?php echo htmlspecialchars($user['role'] ?? 'User'); ?></td>
                                    <td><?php echo date('Y-m-d', strtotime($user['created_at'])); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                    <p><a href="admin_panel.php?action=users" class="btn">View All Users</a></p>
                </div>
                
                <div class="card">
                    <h2>Recent News</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Author</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                                $news_articles = get_all_news();
                                $count = 0;
                                foreach ($news_articles as $article): 
                                    if ($count >= 5) break;
                                    $count++;
                            ?>
                                <tr>
                                    <td><?php echo $article['id']; ?></td>
                                    <td><?php echo htmlspecialchars($article['title']); ?></td>
                                    <td><?php echo htmlspecialchars($article['category']); ?></td>
                                    <td><?php echo htmlspecialchars($article['username']); ?></td>
                                    <td><?php echo date('Y-m-d', strtotime($article['created_at'])); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                    <p><a href="admin_panel.php?action=news" class="btn">View All News</a></p>
                </div>
                
            <?php elseif ($action === 'users'): ?>
                <div class="card">
                    <h2>User Management</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Full Name</th>
                                <th>Role</th>
                                <th>Admin</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                                $users = get_all_users();
                                foreach ($users as $user): 
                            ?>
                                <tr>
                                    <td><?php echo $user['id']; ?></td>
                                    <td><?php echo htmlspecialchars($user['username']); ?></td>
                                    <td><?php echo htmlspecialchars($user['email']); ?></td>
                                    <td><?php echo htmlspecialchars($user['full_name'] ?? ''); ?></td>
                                    <td><?php echo htmlspecialchars($user['role'] ?? 'User'); ?></td>
                                    <td><?php echo $user['is_admin'] === 't' ? 'Yes' : 'No'; ?></td>
                                    <td><?php echo date('Y-m-d', strtotime($user['created_at'])); ?></td>
                                    <td>
                                        <a href="#" class="btn" onclick="alert('Edit functionality would go here')">Edit</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                
            <?php elseif ($action === 'streamers'): ?>
                <div class="card">
                    <h2>Streamer Management</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Display Name</th>
                                <th>Platform</th>
                                <th>User</th>
                                <th>Is Live</th>
                                <th>Current Game</th>
                                <th>Viewers</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                                $streamers = get_all_streamers();
                                foreach ($streamers as $streamer): 
                            ?>
                                <tr>
                                    <td><?php echo $streamer['id']; ?></td>
                                    <td><?php echo htmlspecialchars($streamer['display_name']); ?></td>
                                    <td><?php echo htmlspecialchars($streamer['platform']); ?></td>
                                    <td><?php echo htmlspecialchars($streamer['username']); ?></td>
                                    <td><?php echo $streamer['is_live'] === 't' ? 'Yes' : 'No'; ?></td>
                                    <td><?php echo htmlspecialchars($streamer['current_game'] ?? ''); ?></td>
                                    <td><?php echo $streamer['viewer_count'] ?? '0'; ?></td>
                                    <td>
                                        <a href="#" class="btn" onclick="alert('Edit functionality would go here')">Edit</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                
            <?php elseif ($action === 'news'): ?>
                <div class="card">
                    <h2>News Management</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Author</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                                $news_articles = get_all_news();
                                foreach ($news_articles as $article): 
                            ?>
                                <tr>
                                    <td><?php echo $article['id']; ?></td>
                                    <td><?php echo htmlspecialchars($article['title']); ?></td>
                                    <td><?php echo htmlspecialchars($article['category']); ?></td>
                                    <td><?php echo htmlspecialchars($article['username']); ?></td>
                                    <td><?php echo date('Y-m-d', strtotime($article['created_at'])); ?></td>
                                    <td>
                                        <a href="#" class="btn" onclick="alert('Edit functionality would go here')">Edit</a>
                                        <a href="#" class="btn" onclick="alert('Delete functionality would go here')">Delete</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                    <p><a href="#" class="btn" onclick="alert('Add news functionality would go here')">Add News</a></p>
                </div>
                
            <?php elseif ($action === 'rental_requests'): ?>
                <div class="card">
                    <h2>Rental Request Management</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Game</th>
                                <th>NFT/Item</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                                $requests = get_all_rental_requests();
                                foreach ($requests as $request): 
                            ?>
                                <tr>
                                    <td><?php echo $request['id']; ?></td>
                                    <td><?php echo htmlspecialchars($request['username']); ?></td>
                                    <td><?php echo htmlspecialchars($request['game']); ?></td>
                                    <td><?php echo htmlspecialchars($request['item_name'] ?? 'N/A'); ?></td>
                                    <td><?php echo $request['duration_hours'] ?? '0'; ?> hours</td>
                                    <td><?php echo htmlspecialchars($request['status']); ?></td>
                                    <td><?php echo date('Y-m-d', strtotime($request['created_at'])); ?></td>
                                    <td>
                                        <a href="#" class="btn" onclick="alert('Approve functionality would go here')">Approve</a>
                                        <a href="#" class="btn" onclick="alert('Reject functionality would go here')">Reject</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                
            <?php elseif ($action === 'database'): ?>
                <div class="card">
                    <h2>Database Info</h2>
                    <p>Host: <?php echo $db_config['host']; ?></p>
                    <p>Database: <?php echo $db_config['dbname']; ?></p>
                    <p>User: <?php echo $db_config['user']; ?></p>
                    
                    <h3>Table Row Counts</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Table</th>
                                <th>Row Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                                $conn = connect_db();
                                $query = "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'";
                                $result = pg_query($conn, $query);
                                
                                while ($row = pg_fetch_assoc($result)):
                                    $table = $row['tablename'];
                                    $count_query = "SELECT COUNT(*) FROM $table";
                                    $count_result = pg_query($conn, $count_query);
                                    $count = pg_fetch_row($count_result)[0];
                            ?>
                                <tr>
                                    <td><?php echo $table; ?></td>
                                    <td><?php echo $count; ?></td>
                                </tr>
                            <?php 
                                endwhile;
                                pg_close($conn);
                            ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    <?php endif; ?>
</body>
</html>