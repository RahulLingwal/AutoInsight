<?php
// backend/community/add_reply.php
// POST: { discussion_id, reply_text }
// Requires login. Returns: { success, message, reply }

require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$data   = json_decode(file_get_contents('php://input'), true);

$discussionId = (int) ($data['discussion_id'] ?? 0);
$replyText    = trim($data['reply_text']      ?? '');

if (!$discussionId || empty($replyText)) {
    jsonResponse(false, 'discussion_id and reply_text are required.');
}

$db = getDB();

// Verify discussion exists
$check = $db->prepare('SELECT id FROM discussions WHERE id = ?');
$check->execute([$discussionId]);
if (!$check->fetch()) {
    jsonResponse(false, 'Discussion not found.');
}

$stmt = $db->prepare(
    'INSERT INTO discussion_replies (discussion_id, user_id, reply_text) VALUES (?, ?, ?)'
);
$stmt->execute([$discussionId, $userId, $replyText]);
$replyId = (int) $db->lastInsertId();

// Return new reply with author info
$fetch = $db->prepare("
    SELECT r.id, r.reply_text, r.created_at, u.name AS author, u.avatar
    FROM   discussion_replies r
    JOIN   users u ON u.id = r.user_id
    WHERE  r.id = ?
");
$fetch->execute([$replyId]);

jsonResponse(true, 'Reply posted!', ['reply' => $fetch->fetch()]);
