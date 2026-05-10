<?php
// backend/cars/manage_car.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$db = getDB();

// Admin check
$userCheck = $db->prepare('SELECT role FROM users WHERE id = ?');
$userCheck->execute([$userId]);
$userRole = $userCheck->fetchColumn();
if ($userRole !== 'admin') {
    http_response_code(403);
    jsonResponse(false, 'Forbidden');
}

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

if ($action === 'delete') {
    $id = (int)($data['id'] ?? 0);
    $stmt = $db->prepare('DELETE FROM cars WHERE id = ?');
    $stmt->execute([$id]);
    jsonResponse(true, 'Car deleted successfully');
}

if ($action === 'save') {
    $id            = (int)($data['id'] ?? 0);
    $brand         = trim($data['brand'] ?? '');
    $model         = trim($data['model'] ?? '');
    $year          = (int)($data['year'] ?? 0);
    $price         = (float)($data['price'] ?? 0);
    $fuel          = $data['fuel_type'] ?? 'Petrol';
    $body          = $data['body_type'] ?? 'Sedan';
    $seats         = (int)($data['seats'] ?? 5);
    $featured      = (int)($data['is_featured'] ?? 0);
    $image_path    = trim($data['image_path'] ?? 'Asset/Images/porsche.jpg');
    $image2        = trim($data['image2'] ?? '');
    $image3        = trim($data['image3'] ?? '');
    $image4        = trim($data['image4'] ?? '');
    
    // Detailed Specs
    $engine        = trim($data['engine'] ?? '');
    $transmission  = $data['transmission'] ?? 'Manual';
    $mileage       = trim($data['mileage'] ?? '');
    $safety        = trim($data['safety_rating'] ?? '');
    $pros          = trim($data['pros'] ?? '');
    $cons          = trim($data['cons'] ?? '');
    $description   = trim($data['description'] ?? '');

    if (empty($brand) || empty($model)) {
        jsonResponse(false, 'Brand and Model are required.');
    }

    if ($id > 0) {
        // Update
        $sql = "UPDATE cars SET 
                brand=?, model=?, year=?, price_lakh=?, fuel_type=?, body_type=?, seats=?, is_featured=?, image_path=?,
                image2=?, image3=?, image4=?,
                engine=?, transmission=?, mileage=?, safety_rating=?, pros=?, cons=?, description=?
                WHERE id=?";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            $brand, $model, $year, $price, $fuel, $body, $seats, $featured, $image_path,
            $image2, $image3, $image4,
            $engine, $transmission, $mileage, $safety, $pros, $cons, $description,
            $id
        ]);
        jsonResponse(true, 'Car updated successfully');
    } else {
        // Insert
        $sql = "INSERT INTO cars (
                    brand, model, year, price_lakh, fuel_type, body_type, seats, is_featured, image_path,
                    image2, image3, image4,
                    engine, transmission, mileage, safety_rating, pros, cons, description
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            $brand, $model, $year, $price, $fuel, $body, $seats, $featured, $image_path,
            $image2, $image3, $image4,
            $engine, $transmission, $mileage, $safety, $pros, $cons, $description
        ]);
        jsonResponse(true, 'Car added successfully', ['id' => $db->lastInsertId()]);
    }
}

jsonResponse(false, 'Invalid action');
