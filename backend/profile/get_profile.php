<?php
// backend/profile/get_profile.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$db = getDB();

$stmt = $db->prepare('SELECT id, name, email, role, country, bio, avatar, created_at FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if ($user) {
    jsonResponse(true, 'Profile fetched', ['user' => $user]);
} else {
    jsonResponse(false, 'User not found');
}
