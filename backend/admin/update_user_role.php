<?php
// backend/admin/update_user_role.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

// Only allow admins
if ($_SESSION['user_role'] !== 'admin') {
    jsonResponse(false, 'Unauthorized.');
}

$data = json_decode(file_get_contents('php://input'), true);
$userId = (int) ($data['id'] ?? 0);
$newRole = ($data['role'] === 'admin') ? 'user' : 'admin';

if (!$userId) {
    jsonResponse(false, 'Invalid user ID.');
}

$db = getDB();
// Prevent admin from demoting themselves (optional safety)
if ($userId === (int)$_SESSION['user_id']) {
    jsonResponse(false, 'You cannot change your own role.');
}

$stmt = $db->prepare('UPDATE users SET role = ? WHERE id = ?');
$success = $stmt->execute([$newRole, $userId]);

if ($success) {
    jsonResponse(true, 'User role updated successfully!');
} else {
    jsonResponse(false, 'Failed to update user role.');
}
