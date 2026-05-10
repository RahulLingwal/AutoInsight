<?php
// backend/community/delete_discussion.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$data   = json_decode(file_get_contents('php://input'), true);
$id     = (int)($data['discussion_id'] ?? 0);

if (!$id) jsonResponse(false, 'Invalid ID.');

$db = getDB();
$check = $db->prepare('SELECT user_id FROM discussions WHERE id = ?');
$check->execute([$id]);
$d = $check->fetch();

if (!$d || $d['user_id'] != $userId) {
    jsonResponse(false, 'Unauthorized or not found.');
}

$stmt = $db->prepare('DELETE FROM discussions WHERE id = ?');
$stmt->execute([$id]);

jsonResponse(true, 'Discussion deleted.');
