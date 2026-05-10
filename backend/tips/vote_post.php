<?php
// backend/tips/vote_post.php
// POST: { post_id, vote }  vote = 1 (up) or -1 (down)
// Requires login. Prevents duplicate votes.

require_once __DIR__ . '/../config/db.php';
session_start();
header('Content-Type: application/json');

$userId = requireAuth();
$data   = json_decode(file_get_contents('php://input'), true);
$postId = (int)($data['post_id'] ?? 0);
$vote   = (int)($data['vote']    ?? 1);

if (!$postId || !in_array($vote, [1, -1])) {
    jsonResponse(false, 'Invalid request.');
}

$db = getDB();

// Check for existing vote
$check = $db->prepare('SELECT vote FROM tips_votes WHERE user_id = ? AND post_id = ?');
$check->execute([$userId, $postId]);
$existing = $check->fetch();

if ($existing) {
    if ($existing['vote'] === $vote) {
        // Same vote → undo it
        $db->prepare('DELETE FROM tips_votes WHERE user_id = ? AND post_id = ?')
           ->execute([$userId, $postId]);
        $db->prepare('UPDATE tips_posts SET votes = votes - ? WHERE id = ?')
           ->execute([$vote, $postId]);
        $action = 'removed';
    } else {
        // Changed vote direction
        $db->prepare('UPDATE tips_votes SET vote = ? WHERE user_id = ? AND post_id = ?')
           ->execute([$vote, $userId, $postId]);
        $db->prepare('UPDATE tips_posts SET votes = votes + ? WHERE id = ?')
           ->execute([$vote * 2, $postId]);
        $action = 'changed';
    }
} else {
    // New vote
    $db->prepare('INSERT INTO tips_votes (user_id, post_id, vote) VALUES (?, ?, ?)')
       ->execute([$userId, $postId, $vote]);
    $db->prepare('UPDATE tips_posts SET votes = votes + ? WHERE id = ?')
       ->execute([$vote, $postId]);
    $action = 'added';
}

// Return new vote count
$stmt = $db->prepare('SELECT votes FROM tips_posts WHERE id = ?');
$stmt->execute([$postId]);
$newCount = (int) $stmt->fetchColumn();

jsonResponse(true, 'Vote recorded.', ['votes' => $newCount, 'action' => $action]);
