<?php
// backend/admin/get_users.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

// Only allow admins
if ($_SESSION['user_role'] !== 'admin') {
    jsonResponse(false, 'Unauthorized.');
}

$db = getDB();
$stmt = $db->query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
$users = $stmt->fetchAll();

jsonResponse(true, 'Users fetched', ['users' => $users]);
