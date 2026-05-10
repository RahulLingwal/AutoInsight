<?php
// fix_admin.php
// Visit this file in your browser once (e.g. localhost/AutoInsight/fix_admin.php) to fix the admin account.

require_once __DIR__ . '/backend/config/db.php';

try {
    $db = getDB();
    
    // 1. Ensure the database exists (though it should)
    $db->exec("CREATE DATABASE IF NOT EXISTS autoinsight CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $db->exec("USE autoinsight");

    // 2. Clear old admin if any
    $stmt = $db->prepare("DELETE FROM users WHERE email = ?");
    $stmt->execute(['admin@autoinsight.com']);

    // 3. Insert fresh admin
    // Password is 'admin123' for maximum clarity
    $password = 'admin123';
    $hash = password_hash($password, PASSWORD_BCRYPT);
    
    $stmt = $db->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
    $stmt->execute(['Admin', 'admin@autoinsight.com', $hash, 'admin']);

    echo "<h1 style='color:green;'>Admin Fixed Successfully!</h1>";
    echo "<p>You can now login with:</p>";
    echo "<ul>";
    echo "<li><b>Email:</b> admin@autoinsight.com</li>";
    echo "<li><b>Password:</b> admin123</li>";
    echo "</ul>";
    echo "<p><a href='HTML/login.html'>Go to Login Page</a></p>";
    
} catch (Exception $e) {
    echo "<h1 style='color:red;'>Error Fixing Admin</h1>";
    echo "<p>" . $e->getMessage() . "</p>";
}
