<?php
// backend/admin/get_admin_stats.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

// Security: Check if user is admin
$userId = requireAuth();
$db = getDB();

$userCheck = $db->prepare('SELECT role FROM users WHERE id = ?');
$userCheck->execute([$userId]);
$user = $userCheck->fetch();

if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    jsonResponse(false, 'Unauthorized. Admin access only.');
}

// 1. Total Cars
$carsCount = $db->query('SELECT COUNT(*) FROM cars')->fetchColumn();

// 2. Total Users
$usersCount = $db->query('SELECT COUNT(*) FROM users')->fetchColumn();

// 3. Total Reviews
$reviewsCount = $db->query('SELECT COUNT(*) FROM reviews')->fetchColumn();

// 4. Total Posts (Tips/Problems)
$postsCount = $db->query('SELECT COUNT(*) FROM tips_posts')->fetchColumn();

jsonResponse(true, 'Stats fetched successfully', [
    'stats' => [
        'cars'    => (int)$carsCount,
        'users'   => (int)$usersCount,
        'reviews' => (int)$reviewsCount,
        'posts'   => (int)$postsCount
    ]
]);
