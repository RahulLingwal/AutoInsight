<?php
// backend/tips/delete_post.php
require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$data   = json_decode(file_get_contents('php://input'), true);
$postId = (int)($data['post_id'] ?? 0);

if (!$postId) {
    jsonResponse(false, 'Invalid post ID.');
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
    jsonResponse(false, 'You do not have permission to delete this post.');
}

// Delete post (comments will be deleted via CASCADE if set up in SQL, else manual delete)
$stmt = $db->prepare('DELETE FROM tips_posts WHERE id = ?');
$stmt->execute([$postId]);

jsonResponse(true, 'Post deleted successfully!');
