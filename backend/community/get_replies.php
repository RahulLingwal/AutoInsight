<?php
// backend/community/get_replies.php
// GET ?discussion_id=X
// Also increments the view counter for the discussion.
// Returns: { success, replies: [...] }

require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$discussionId = (int)($_GET['discussion_id'] ?? 0);
if (!$discussionId) { jsonResponse(false, 'discussion_id is required.'); }

$db = getDB();

// Increment views
$db->prepare('UPDATE discussions SET views = views + 1 WHERE id = ?')
   ->execute([$discussionId]);

$stmt = $db->prepare("
    SELECT r.id, r.reply_text, r.created_at, u.name AS author, u.avatar
    FROM   discussion_replies r
    JOIN   users u ON u.id = r.user_id
    WHERE  r.discussion_id = ?
    ORDER  BY r.created_at ASC
");
$stmt->execute([$discussionId]);

jsonResponse(true, 'OK', ['replies' => $stmt->fetchAll()]);
