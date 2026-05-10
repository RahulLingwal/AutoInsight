<?php
// backend/reviews/get_reviews.php
// GET ?car_id=X &page=1
// Returns: { success, reviews: [...], avg_rating, total }

require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$carId  = (int)($_GET['car_id'] ?? 0);
$page   = max(1, (int)($_GET['page'] ?? 1));
$limit  = 5;
$offset = ($page - 1) * $limit;

if (!$carId) { jsonResponse(false, 'car_id is required.'); }

$db = getDB();

// Average rating + total count
$meta = $db->prepare('SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM reviews WHERE car_id = ?');
$meta->execute([$carId]);
$stats = $meta->fetch();

// Paginated reviews
$stmt = $db->prepare("
    SELECT r.id, r.rating, r.title, r.body, r.created_at,
           u.name AS author, u.avatar
    FROM   reviews r
    JOIN   users u ON u.id = r.user_id
    WHERE  r.car_id = ?
    ORDER  BY r.created_at DESC
    LIMIT  $limit OFFSET $offset
");
$stmt->execute([$carId]);

jsonResponse(true, 'OK', [
    'reviews'    => $stmt->fetchAll(),
    'avg_rating' => $stats['avg_rating'] ? round((float) $stats['avg_rating'], 1) : null,
    'total'      => (int) $stats['total'],
]);
