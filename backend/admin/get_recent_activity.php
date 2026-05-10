<?php
// backend/admin/get_recent_activity.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$db = getDB();

// Admin check
$userCheck = $db->prepare('SELECT role FROM users WHERE id = ?');
$userCheck->execute([$userId]);
$userRole = $userCheck->fetchColumn();
if ($userRole !== 'admin') {
    http_response_code(403);
    jsonResponse(false, 'Forbidden');
}

// Combine latest users and reviews for an activity feed
$activities = [];

// Latest 5 users
$users = $db->query("SELECT name, created_at, 'user_reg' as type FROM users ORDER BY created_at DESC LIMIT 5")->fetchAll();
foreach ($users as $u) {
    $activities[] = [
        'user' => $u['name'],
        'text' => 'Registered as a new user',
        'time' => $u['created_at'],
        'type' => 'user'
    ];
}

// Latest 5 reviews
$reviews = $db->query("
    SELECT u.name, r.created_at, c.brand, c.model, 'review' as type 
    FROM reviews r 
    JOIN users u ON u.id = r.user_id 
    JOIN cars c ON c.id = r.car_id 
    ORDER BY r.created_at DESC LIMIT 5
")->fetchAll();

foreach ($reviews as $r) {
    $activities[] = [
        'user' => $r['name'],
        'text' => "Added a new review for {$r['brand']} {$r['model']}",
        'time' => $r['created_at'],
        'type' => 'review'
    ];
}

// Sort by time
usort($activities, function($a, $b) {
    return strtotime($b['time']) - strtotime($a['time']);
});

jsonResponse(true, 'OK', ['activity' => array_slice($activities, 0, 8)]);
