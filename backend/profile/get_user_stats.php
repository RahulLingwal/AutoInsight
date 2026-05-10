<?php
// backend/profile/get_user_stats.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$db = getDB();

$reviewCount = $db->prepare("SELECT COUNT(*) FROM reviews WHERE user_id = ?");
$reviewCount->execute([$userId]);

$postCount = $db->prepare("SELECT COUNT(*) FROM tips_posts WHERE user_id = ?");
$postCount->execute([$userId]);

$discCount = $db->prepare("SELECT COUNT(*) FROM discussions WHERE user_id = ?");
$discCount->execute([$userId]);

jsonResponse(true, 'Stats fetched', [
    'stats' => [
        'reviews' => (int)$reviewCount->fetchColumn(),
        'posts'   => (int)$postCount->fetchColumn(),
        'discussions' => (int)$discCount->fetchColumn(),
        'reputation'  => 1200 // Mock for now
    ]
]);
