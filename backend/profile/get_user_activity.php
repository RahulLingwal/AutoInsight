<?php
// backend/profile/get_user_activity.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$db = getDB();

$activities = [];

// 1. Get Reviews
$reviews = $db->prepare("
    SELECT r.id, r.title, r.rating, r.created_at, 'review' as type,
           r.car_name, c.brand, c.model 
    FROM reviews r 
    LEFT JOIN cars c ON c.id = r.car_id 
    WHERE r.user_id = ? 
    ORDER BY r.created_at DESC LIMIT 10
");
$reviews->execute([$userId]);
foreach ($reviews->fetchAll() as $r) {
    $displayName = $r['car_name'] ?: "{$r['brand']} {$r['model']}";
    $activities[] = [
        'id'    => $r['id'],
        'type'  => 'review',
        'title' => "Reviewed " . $displayName,
        'desc'  => $r['title'],
        'date'  => $r['date'] ?? $r['created_at']
    ];
}

// 2. Get Community Posts (Tips/Problems)
$posts = $db->prepare("
    SELECT id, title, type, created_at 
    FROM tips_posts 
    WHERE user_id = ? 
    ORDER BY created_at DESC LIMIT 10
");
$posts->execute([$userId]);
foreach ($posts->fetchAll() as $p) {
    $activities[] = [
        'id'    => $p['id'],
        'type'  => $p['type'], // 'tip' or 'problem'
        'title' => ($p['type'] === 'tip' ? 'Shared a Tip: ' : 'Reported a Problem: ') . $p['title'],
        'date'  => $p['created_at']
    ];
}

// 3. Get Discussion Threads
$discussions = $db->prepare("
    SELECT id, title, created_at 
    FROM discussions 
    WHERE user_id = ? 
    ORDER BY created_at DESC LIMIT 10
");
$discussions->execute([$userId]);
foreach ($discussions->fetchAll() as $d) {
    $activities[] = [
        'id'    => $d['id'],
        'type'  => 'discussion',
        'title' => "Started a discussion: " . $d['title'],
        'date'  => $d['created_at']
    ];
}

// Sort all by date descending
usort($activities, function($a, $b) {
    return strtotime($b['date']) - strtotime($a['date']);
});

jsonResponse(true, 'Activity fetched', ['activities' => array_slice($activities, 0, 15)]);
