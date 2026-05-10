<?php
// backend/reviews/submit_review.php
// POST: { edit_id, car_name, rating, title, body, ownership_duration }
// Requires login. Returns: { success, message, review_id }

require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$data   = json_decode(file_get_contents('php://input'), true);

$editId  = (int) ($data['edit_id']  ?? 0);
$carName = trim($data['car_name'] ?? '');
$rating  = (int) ($data['rating']  ?? 0);
$title   = trim($data['title']     ?? '');
$body    = trim($data['body']      ?? '');

if (empty($carName) || $rating < 1 || $rating > 5 || empty($title) || empty($body)) {
    jsonResponse(false, 'All fields are required and rating must be 1-5.');
}

$db = getDB();

// 1. Find Car ID
$carId = (int) ($data['car_id'] ?? 0);
if (!$carId) {
    // Fuzzy search only if no explicit ID provided
    $stmt = $db->prepare("SELECT id FROM cars WHERE CONCAT(brand, ' ', model) LIKE ? LIMIT 1");
    $stmt->execute(['%' . $carName . '%']);
    $car = $stmt->fetch();
    if ($car) $carId = $car['id'];
}
if (!$carId) $carId = null;

if ($editId > 0) {
    // UPDATE existing review
    $stmt = $db->prepare(
        'UPDATE reviews SET car_id = ?, car_name = ?, rating = ?, title = ?, body = ? 
         WHERE id = ? AND user_id = ?'
    );
    $stmt->execute([$carId, $carName, $rating, $title, $body, $editId, $userId]);
    
    if ($stmt->rowCount() >= 0) { // >= 0 because they might save without changes
        jsonResponse(true, 'Review updated successfully!', ['review_id' => $editId]);
    } else {
        jsonResponse(false, 'Failed to update review or unauthorized.');
    }
} else {
    // INSERT new review
    $stmt = $db->prepare(
        'INSERT INTO reviews (user_id, car_id, car_name, rating, title, body) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$userId, $carId, $carName, $rating, $title, $body]);
    jsonResponse(true, 'Review submitted successfully!', ['review_id' => (int) $db->lastInsertId()]);
}
