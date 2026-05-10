<?php
// backend/tips/add_comment.php
// POST: { post_id, comment_text }
// Requires login. Returns: { success, message, comment }

require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$data   = json_decode(file_get_contents('php://input'), true);

$postId  = (int) ($data['post_id']      ?? 0);
$comment = trim($data['comment_text']   ?? '');

if (!$postId || empty($comment)) {
    jsonResponse(false, 'post_id and comment_text are required.');
}

$db = getDB();

// Verify post exists
$check = $db->prepare('SELECT id FROM tips_posts WHERE id = ?');
$check->execute([$postId]);
if (!$check->fetch()) {
    jsonResponse(false, 'Post not found.');
}

$stmt = $db->prepare(
    'INSERT INTO tips_comments (post_id, user_id, comment_text) VALUES (?, ?, ?)'
);
$stmt->execute([$postId, $userId, $comment]);
$commentId = (int) $db->lastInsertId();

// Return the new comment with author info
$fetch = $db->prepare("
    SELECT c.id, c.comment_text, c.created_at, u.name AS author, u.avatar
    FROM   tips_comments c
    JOIN   users u ON u.id = c.user_id
    WHERE  c.id = ?
");
$fetch->execute([$commentId]);

jsonResponse(true, 'Comment added!', ['comment' => $fetch->fetch()]);
