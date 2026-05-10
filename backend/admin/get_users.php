<?php
// backend/admin/get_users.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$db = getDB();

// Admin check
$userCheck = $db->prepare('SELECT role FROM users WHERE id = ?');
$userCheck->execute([$userId]);
$role = $userCheck->fetchColumn();
if ($role !== 'admin') jsonResponse(false, 'Forbidden');

$users = $db->query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC")->fetchAll();

jsonResponse(true, 'OK', ['users' => $users]);
