<?php
// backend/tips/edit_post.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$data   = json_decode(file_get_contents('php://input'), true);

$postId      = (int)($data['post_id'] ?? 0);
$title       = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');
$tags        = trim($data['tags'] ?? '');

if (!$postId || empty($title) || empty($description)) {
    jsonResponse(false, 'All fields are required.');
}

$db = getDB();

// Check ownership
$check = $db->prepare('SELECT user_id FROM tips_posts WHERE id = ?');
$check->execute([$postId]);
$post = $check->fetch();

if (!$post) {
    jsonResponse(false, 'Post not found.');
}

if ($post['user_id'] != $userId) {
    jsonResponse(false, 'You do not have permission to edit this post.');
}

$stmt = $db->prepare('UPDATE tips_posts SET title = ?, description = ?, tags = ? WHERE id = ?');
$stmt->execute([$title, $description, $tags, $postId]);

jsonResponse(true, 'Post updated successfully!');
