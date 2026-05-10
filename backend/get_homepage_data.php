<?php
// backend/get_homepage_data.php
require_once __DIR__ . '/config/db.php';
header('Content-Type: application/json');

$db = getDB();

// 1. Featured Cars (Join with reviews to get real stats - handling both ID and name matching)
$featured = $db->query("
    SELECT c.*, AVG(r.rating) as avg_rating, COUNT(r.id) as review_count 
    FROM cars c 
    LEFT JOIN reviews r ON (r.car_id = c.id OR (r.car_id IS NULL AND r.car_name = CONCAT(c.brand, ' ', c.model)))
    GROUP BY c.id 
    ORDER BY c.is_featured DESC, c.id DESC LIMIT 4
")->fetchAll();

// 2. Top Rated Cars
$topRated = $db->query("
    SELECT c.*, AVG(r.rating) as avg_rating, COUNT(r.id) as review_count 
    FROM cars c 
    LEFT JOIN reviews r ON (r.car_id = c.id OR (r.car_id IS NULL AND r.car_name = CONCAT(c.brand, ' ', c.model)))
    GROUP BY c.id 
    ORDER BY avg_rating DESC, review_count DESC LIMIT 4
")->fetchAll();

// 3. Latest Owner Reviews
$latestReviews = $db->query("
    SELECT r.*, u.name as user_name, u.avatar as user_avatar, c.brand, c.model 
    FROM reviews r 
    JOIN users u ON u.id = r.user_id 
    LEFT JOIN cars c ON c.id = r.car_id 
    ORDER BY r.created_at DESC LIMIT 3
")->fetchAll();

// 4. Stats
$carCount = $db->query("SELECT COUNT(*) FROM cars")->fetchColumn();
$reviewCount = $db->query("SELECT COUNT(*) FROM reviews")->fetchColumn();
$userCount = $db->query("SELECT COUNT(*) FROM users WHERE role != 'admin'")->fetchColumn();

jsonResponse(true, 'Homepage data fetched', [
    'featured' => $featured,
    'topRated' => $topRated,
    'latestReviews' => $latestReviews,
    'stats' => [
        'cars' => $carCount,
        'reviews' => $reviewCount,
        'users' => $userCount
    ]
]);
