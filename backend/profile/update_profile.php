<?php
// backend/profile/update_profile.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$data   = json_decode(file_get_contents('php://input'), true);

$name    = trim($data['name']    ?? '');
$country = trim($data['country'] ?? '');
$bio     = trim($data['bio']     ?? '');

if (empty($name)) {
    jsonResponse(false, 'Name cannot be empty.');
}

$db = getDB();
$stmt = $db->prepare('UPDATE users SET name = ?, country = ?, bio = ? WHERE id = ?');
$success = $stmt->execute([$name, $country, $bio, $userId]);

if ($success) {
    // Update session as well
    $_SESSION['user_name'] = $name;
    
    // Fetch updated user to return
    $stmt = $db->prepare('SELECT id, name, email, role, country, bio, avatar FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    jsonResponse(true, 'Profile updated successfully!', ['user' => $user]);
} else {
    jsonResponse(false, 'Failed to update profile.');
}
