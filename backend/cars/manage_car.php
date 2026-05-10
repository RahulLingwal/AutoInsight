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

// Since we are sending FormData, we use $_POST and $_FILES
$action = $_POST['action'] ?? '';

// Helper for file upload
function uploadCarImage($fileKey, $targetDir = "../../Asset/Images/cars/") {
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    
    // Create dir if not exists
    if (!is_dir(__DIR__ . '/' . $targetDir)) {
        mkdir(__DIR__ . '/' . $targetDir, 0777, true);
    }

    $fileName = time() . '_' . $fileKey . '_' . basename($_FILES[$fileKey]["name"]);
    $targetFilePath = __DIR__ . '/' . $targetDir . $fileName;
    $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);

    // Allow certain file formats
    $allowTypes = array('jpg','png','jpeg','gif', 'webp', 'avif');
    if(in_array(strtolower($fileType), $allowTypes)){
        if(move_uploaded_file($_FILES[$fileKey]["tmp_name"], $targetFilePath)){
            return "Asset/Images/cars/" . $fileName;
        }
    }
    return null;
}

if ($action === 'delete') {
    $id = (int)($_POST['id'] ?? 0);
    // If it was JSON, we'd use php://input, but for consistency let's check both
    if (!$id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = (int)($data['id'] ?? 0);
    }
    $stmt = $db->prepare('DELETE FROM cars WHERE id = ?');
    $stmt->execute([$id]);
    jsonResponse(true, 'Car deleted successfully');
}

if ($action === 'save') {
    $id            = (int)($_POST['id'] ?? 0);
    $brand         = trim($_POST['brand'] ?? '');
    $model         = trim($_POST['model'] ?? '');
    $year          = (int)($_POST['year'] ?? 0);
    $price         = (float)($_POST['price'] ?? 0);
    $fuel          = $_POST['fuel_type'] ?? 'Petrol';
    $body          = $_POST['body_type'] ?? 'Sedan';
    $seats         = (int)($_POST['seats'] ?? 5);
    $featured      = (int)($_POST['is_featured'] ?? 0);
    
    // Detailed Specs
    $engine        = trim($_POST['engine'] ?? '');
    $transmission  = $_POST['transmission'] ?? 'Manual';
    $mileage       = trim($_POST['mileage'] ?? '');
    $safety        = trim($_POST['safety_rating'] ?? '');
    $pros          = trim($_POST['pros'] ?? '');
    $cons          = trim($_POST['cons'] ?? '');
    $description   = trim($_POST['description'] ?? '');

    if (empty($brand) || empty($model)) {
        jsonResponse(false, 'Brand and Model are required.');
    }

    // Handle Uploads
    $imgMain = uploadCarImage('image_main');
    $imgSide = uploadCarImage('image_side');
    $imgInt  = uploadCarImage('image_interior');
    $imgRear = uploadCarImage('image_rear');

    if ($id > 0) {
        // Update
        // First get existing paths in case no new files uploaded
        $curr = $db->prepare("SELECT image_path, image2, image3, image4 FROM cars WHERE id = ?");
        $curr->execute([$id]);
        $old = $curr->fetch();

        $image_path = $imgMain ?: $old['image_path'];
        $image2     = $imgSide ?: $old['image2'];
        $image3     = $imgInt  ?: $old['image3'];
        $image4     = $imgRear ?: $old['image4'];

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
        $image_path = $imgMain ?: 'Asset/Images/porsche.jpg';
        $image2     = $imgSide ?: '';
        $image3     = $imgInt  ?: '';
        $image4     = $imgRear ?: '';

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
