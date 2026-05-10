<?php
// backend/community/edit_discussion.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$data   = json_decode(file_get_contents('php://input'), true);

$id       = (int)($data['discussion_id'] ?? 0);
$title    = trim($data['title'] ?? '');
$category = trim($data['category'] ?? '');
$body     = trim($data['body'] ?? '');

if (!$id || empty($title) || empty($body)) {
    jsonResponse(false, 'Missing fields.');
}

$db = getDB();
$check = $db->prepare('SELECT user_id FROM discussions WHERE id = ?');
$check->execute([$id]);
$d = $check->fetch();

if (!$d || $d['user_id'] != $userId) {
    jsonResponse(false, 'Unauthorized.');
}

$stmt = $db->prepare('UPDATE discussions SET title = ?, category = ?, body = ? WHERE id = ?');
$stmt->execute([$title, $category, $body, $id]);

jsonResponse(true, 'Discussion updated.');
