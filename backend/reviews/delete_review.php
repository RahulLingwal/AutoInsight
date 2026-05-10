<?php
// backend/reviews/delete_review.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$data = json_decode(file_get_contents('php://input'), true);
$reviewId = (int)($data['id'] ?? 0);

if (!$reviewId) {
    jsonResponse(false, 'Invalid ID');
}

$db = getDB();

// Ensure the review belongs to the user
$stmt = $db->prepare("DELETE FROM reviews WHERE id = ? AND user_id = ?");
$stmt->execute([$reviewId, $userId]);

if ($stmt->rowCount() > 0) {
    jsonResponse(true, 'Review deleted successfully');
} else {
    jsonResponse(false, 'Failed to delete or unauthorized');
}
