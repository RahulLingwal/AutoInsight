<?php
// backend/tips/create_post.php
// POST: { type, title, description, tags }
// Requires login. Returns: { success, message, post_id }

require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$data   = json_decode(file_get_contents('php://input'), true);

$type        = $data['type']        ?? 'tip';
$title       = trim($data['title']       ?? '');
$description = trim($data['description'] ?? '');
$tags        = trim($data['tags']        ?? '');

if (empty($title) || empty($description)) {
    jsonResponse(false, 'Title and description are required.');
}
if (!in_array($type, ['tip', 'problem'])) {
    $type = 'tip';
}

$db   = getDB();
$stmt = $db->prepare(
    'INSERT INTO tips_posts (user_id, type, title, description, tags) VALUES (?, ?, ?, ?, ?)'
);
$stmt->execute([$userId, $type, $title, $description, $tags]);

jsonResponse(true, 'Post created successfully!', ['post_id' => (int) $db->lastInsertId()]);
