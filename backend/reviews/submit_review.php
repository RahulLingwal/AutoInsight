<?php
// backend/reviews/submit_review.php
// POST: { car_id, rating, title, body }
// Requires login. Returns: { success, message, review_id }

require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$data   = json_decode(file_get_contents('php://input'), true);

$carId  = (int) ($data['car_id'] ?? 0);
$rating = (int) ($data['rating'] ?? 0);
$title  = trim($data['title']    ?? '');
$body   = trim($data['body']     ?? '');

if (!$carId || $rating < 1 || $rating > 5 || empty($title) || empty($body)) {
    jsonResponse(false, 'All fields are required and rating must be 1-5.');
}

$db = getDB();

// Verify car exists
$check = $db->prepare('SELECT id FROM cars WHERE id = ?');
$check->execute([$carId]);
if (!$check->fetch()) {
    jsonResponse(false, 'Car not found.');
}

$stmt = $db->prepare(
    'INSERT INTO reviews (user_id, car_id, rating, title, body) VALUES (?, ?, ?, ?, ?)'
);
$stmt->execute([$userId, $carId, $rating, $title, $body]);

jsonResponse(true, 'Review submitted successfully!', ['review_id' => (int) $db->lastInsertId()]);
