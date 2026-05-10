<?php
// backend/cars/get_cars.php
// GET ?brand=Honda &fuel=Petrol &body=SUV &price_max=20 &page=1
// Returns: { success, cars: [...], total }

require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$brand    = trim($_GET['brand']     ?? '');
$fuel     = trim($_GET['fuel']      ?? '');
$body     = trim($_GET['body']      ?? '');
$priceMax = isset($_GET['price_max']) ? (float) $_GET['price_max'] : null;
$page     = max(1, (int)($_GET['page'] ?? 1));
$limit    = 12;
$offset   = ($page - 1) * $limit;

$db     = getDB();
$where  = ['1=1'];
$params = [];

if (!empty($brand)) {
    $where[]  = 'c.brand = ?';
    $params[] = $brand;
}
if (!empty($fuel)) {
    $where[]  = 'c.fuel_type = ?';
    $params[] = $fuel;
}
if (!empty($body)) {
    $where[]  = 'c.body_type = ?';
    $params[] = $body;
}
if ($priceMax !== null) {
    $where[]  = 'c.price_lakh <= ?';
    $params[] = $priceMax;
}

$whereStr = implode(' AND ', $where);

// Total count
$countStmt = $db->prepare("SELECT COUNT(*) FROM cars c WHERE $whereStr");
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();

// Cars with average rating
$sql = "
    SELECT c.*,
           ROUND(AVG(r.rating), 1)  AS avg_rating,
           COUNT(r.id)              AS review_count
    FROM   cars c
    LEFT JOIN reviews r ON r.car_id = c.id
    WHERE  $whereStr
    GROUP  BY c.id
    ORDER  BY c.brand, c.model
    LIMIT  $limit OFFSET $offset
";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$cars = $stmt->fetchAll();

foreach ($cars as &$car) {
    $car['avg_rating']    = $car['avg_rating']    ? (float) $car['avg_rating'] : null;
    $car['review_count']  = (int) $car['review_count'];
    $car['price_lakh']    = (float) $car['price_lakh'];
}

jsonResponse(true, 'OK', ['cars' => $cars, 'total' => $total]);
