<?php
// backend/cars/get_car_details.php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$carId = (int)($_GET['id'] ?? 0);
if (!$carId) jsonResponse(false, 'Invalid Car ID');

$db = getDB();

// 1. Fetch Car Specs
$stmt = $db->prepare("SELECT * FROM cars WHERE id = ?");
$stmt->execute([$carId]);
$car = $stmt->fetch();

if (!$car) jsonResponse(false, 'Car not found');

// 2. Fetch Reviews for this car (Direct ID match OR name match if ID is null)
$stmt = $db->prepare("
    SELECT r.*, u.name as user_name, u.avatar as user_avatar 
    FROM reviews r 
    JOIN users u ON u.id = r.user_id 
    WHERE r.car_id = ? 
       OR (r.car_id IS NULL AND r.car_name LIKE ?)
    ORDER BY r.created_at DESC
");
$stmt->execute([$carId, '%' . $car['model'] . '%']);
$reviews = $stmt->fetchAll();

// 3. Calculate avg rating
$avgRating = 0;
if (count($reviews) > 0) {
    $sum = array_reduce($reviews, fn($carry, $item) => $carry + $item['rating'], 0);
    $avgRating = round($sum / count($reviews), 1);
}

jsonResponse(true, 'Car details fetched', [
    'car' => $car,
    'reviews' => $reviews,
    'avgRating' => $avgRating,
    'reviewCount' => count($reviews)
]);
