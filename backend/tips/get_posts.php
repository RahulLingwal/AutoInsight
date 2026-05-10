<?php
// backend/tips/get_posts.php
// GET ?type=tip|problem|all &sort=votes|date &page=1
// Returns: { success, posts: [...] }

require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$type  = $_GET['type']  ?? 'all';
$sort  = $_GET['sort']  ?? 'votes';
$page  = max(1, (int)($_GET['page'] ?? 1));
$limit = 10;
$offset = ($page - 1) * $limit;

$sortCol = $sort === 'date' ? 'p.created_at' : 'p.votes';

$db = getDB();

$where = '';
$params = [];
if (in_array($type, ['tip', 'problem'])) {
    $where    = 'WHERE p.type = ?';
    $params[] = $type;
}

$sql = "
    SELECT p.id, p.type, p.title, p.description, p.tags, p.votes,
           p.created_at, u.name AS author, u.avatar,
           (SELECT COUNT(*) FROM tips_comments c WHERE c.post_id = p.id) AS comment_count
    FROM   tips_posts p
    JOIN   users u ON u.id = p.user_id
    $where
    ORDER BY $sortCol DESC
    LIMIT  $limit OFFSET $offset
";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$posts = $stmt->fetchAll();

// Convert tags string → array for each post
foreach ($posts as &$post) {
    $post['tags_array'] = array_filter(array_map('trim', explode(',', $post['tags'] ?? '')));
    $post['votes']      = (int) $post['votes'];
    $post['comment_count'] = (int) $post['comment_count'];
}

jsonResponse(true, 'OK', ['posts' => $posts]);
