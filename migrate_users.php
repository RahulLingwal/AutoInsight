<?php
require_once __DIR__ . '/backend/config/db.php';
$db = getDB();

// Add missing columns if they don't exist
try {
    $db->exec("ALTER TABLE users ADD COLUMN country VARCHAR(100) DEFAULT 'Not Specified'");
} catch (PDOException $e) {}

try {
    $db->exec("ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL");
} catch (PDOException $e) {}

try {
    $db->exec("ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL");
} catch (PDOException $e) {}

echo "User table schema updated successfully.";
?>
