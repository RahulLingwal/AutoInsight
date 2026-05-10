<?php
// backend/community/get_discussions.php
// GET ?category=Buying Advice &page=1
// Returns: { success, discussions: [...] }

require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$category = trim($_GET['category'] ?? '');
$page     = max(1, (int)($_GET['page'] ?? 1));
$limit    = 10;
$offset   = ($page - 1) * $limit;

$db     = getDB();
$where  = '';
$params = [];

if (!empty($category)) {
    $where    = 'WHERE d.category = ?';
    $params[] = $category;
}

$sql = "
    SELECT d.id, d.user_id, d.category, d.title, d.body, d.views, d.created_at,
           u.name AS author, u.avatar,
           (SELECT COUNT(*) FROM discussion_replies r WHERE r.discussion_id = d.id) AS reply_count,
           (SELECT MAX(r2.created_at) FROM discussion_replies r2 WHERE r2.discussion_id = d.id) AS last_reply_at
    FROM   discussions d
    JOIN   users u ON u.id = d.user_id
    $where
    ORDER  BY d.created_at DESC
    LIMIT  $limit OFFSET $offset
";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$discussions = $stmt->fetchAll();

foreach ($discussions as &$d) {
    $d['reply_count'] = (int) $d['reply_count'];
    $d['views']       = (int) $d['views'];
}

jsonResponse(true, 'OK', ['discussions' => $discussions]);
