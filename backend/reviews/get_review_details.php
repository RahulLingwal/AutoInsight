<?php
// backend/reviews/get_review_details.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$id = (int)($_GET['id'] ?? 0);

if (!$id) jsonResponse(false, 'Invalid ID');

$db = getDB();
$stmt = $db->prepare("SELECT * FROM reviews WHERE id = ? AND user_id = ?");
$stmt->execute([$id, $userId]);
$review = $stmt->fetch();

if ($review) {
    jsonResponse(true, 'Review fetched', ['review' => $review]);
} else {
    jsonResponse(false, 'Review not found or unauthorized');
}
