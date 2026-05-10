<?php
// backend/reviews/get_reviews.php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$carId  = (int)($_GET['car_id'] ?? 0);
$page   = max(1, (int)($_GET['page'] ?? 1));
$limit  = 6;
$offset = ($page - 1) * $limit;

$db = getDB();
$where = "1=1";
$params = [];

if ($carId) {
    $where = "r.car_id = ?";
    $params[] = $carId;
}

// Reviews with car names and user info
$stmt = $db->prepare("
    SELECT r.*,
           u.name AS author, u.avatar,
           c.brand, c.model
    FROM   reviews r
    JOIN   users u ON u.id = r.user_id
    JOIN   cars c ON c.id = r.car_id
    WHERE  $where
    ORDER  BY r.created_at DESC
    LIMIT  $limit OFFSET $offset
");
$stmt->execute($params);
$reviews = $stmt->fetchAll();

jsonResponse(true, 'OK', ['reviews' => $reviews]);
