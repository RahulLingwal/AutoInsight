<?php
// backend/tips/get_comments.php
// GET ?post_id=X
// Returns: { success, comments: [...] }

require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$postId = (int)($_GET['post_id'] ?? 0);
if (!$postId) { jsonResponse(false, 'post_id is required.'); }

$db   = getDB();
$stmt = $db->prepare("
    SELECT c.id, c.comment_text, c.created_at,
           u.name AS author, u.avatar
    FROM   tips_comments c
    JOIN   users u ON u.id = c.user_id
    WHERE  c.post_id = ?
    ORDER  BY c.created_at ASC
");
$stmt->execute([$postId]);

jsonResponse(true, 'OK', ['comments' => $stmt->fetchAll()]);
