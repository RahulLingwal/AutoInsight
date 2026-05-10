<?php
require_once __DIR__ . '/../config/db.php';

try {
    $db = getDB();
    
    // Add car_name column to reviews
    $db->exec("ALTER TABLE reviews ADD COLUMN car_name VARCHAR(150) DEFAULT NULL AFTER car_id");
    
    // Make car_id nullable
    $db->exec("ALTER TABLE reviews MODIFY car_id INT UNSIGNED DEFAULT NULL");
    
    echo "Reviews table updated successfully!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
