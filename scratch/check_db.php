<?php
require_once __DIR__ . '/backend/config/db.php';
$db = getDB();
$res = $db->query('SELECT id, brand, model, image_path, image2, image3, image4 FROM cars ORDER BY id DESC LIMIT 1')->fetch();
header('Content-Type: application/json');
echo json_encode($res, JSON_PRETTY_PRINT);
