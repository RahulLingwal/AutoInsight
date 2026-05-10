<?php
// backend/auth/login.php
// POST: { email, password }
// Returns: { success, message, user: { id, name, email } }

require_once __DIR__ . '/../config/db.php';

session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed.');
}

$data = json_decode(file_get_contents('php://input'), true);

$email    = trim($data['email']    ?? '');
$password = trim($data['password'] ?? '');

if (empty($email) || empty($password)) {
    jsonResponse(false, 'Email and password are required.');
}

// ── Look up user ─────────────────────────────────────────────
$db   = getDB();
$stmt = $db->prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    jsonResponse(false, 'Invalid email or password.');
}

// ── Start session ────────────────────────────────────────────
$_SESSION['user_id']    = $user['id'];
$_SESSION['user_name']  = $user['name'];
$_SESSION['user_email'] = $user['email'];

jsonResponse(true, 'Logged in successfully!', [
    'user' => [
        'id'    => $user['id'],
        'name'  => $user['name'],
        'email' => $user['email'],
    ]
]);
