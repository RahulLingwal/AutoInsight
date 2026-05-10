<?php
// backend/community/create_discussion.php
// POST: { category, title, body }
// Requires login. Returns: { success, message, discussion_id }

require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$data   = json_decode(file_get_contents('php://input'), true);

$category = trim($data['category'] ?? 'General Discussion');
$title    = trim($data['title']    ?? '');
$body     = trim($data['body']     ?? '');

if (empty($title) || empty($body)) {
    jsonResponse(false, 'Title and description are required.');
}

$db   = getDB();
$stmt = $db->prepare(
    'INSERT INTO discussions (user_id, category, title, body) VALUES (?, ?, ?, ?)'
);
$stmt->execute([$userId, $category, $title, $body]);

jsonResponse(true, 'Discussion posted!', ['discussion_id' => (int) $db->lastInsertId()]);
