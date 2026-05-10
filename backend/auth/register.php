<?php
// backend/auth/register.php
// POST: { name, email, password }
// Returns: { success, message, user: { id, name, email } }

require_once __DIR__ . '/../config/db.php';

session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed.');
}

$data = json_decode(file_get_contents('php://input'), true);

// ── Validate inputs ──────────────────────────────────────────
$name     = trim($data['name']     ?? '');
$email    = trim($data['email']    ?? '');
$password = trim($data['password'] ?? '');

if (empty($name) || empty($email) || empty($password)) {
    jsonResponse(false, 'All fields are required.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, 'Invalid email address.');
}

if (strlen($password) < 6) {
    jsonResponse(false, 'Password must be at least 6 characters.');
}

// ── Check if email already exists ───────────────────────────
$db   = getDB();
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);

if ($stmt->fetch()) {
    jsonResponse(false, 'An account with this email already exists.');
}

// ── Insert new user ──────────────────────────────────────────
$hash = password_hash($password, PASSWORD_BCRYPT);

$insert = $db->prepare(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
);
$insert->execute([$name, $email, $hash]);

$userId = (int) $db->lastInsertId();

// ── Start session ────────────────────────────────────────────
$_SESSION['user_id']   = $userId;
$_SESSION['user_name'] = $name;
$_SESSION['user_email']= $email;

jsonResponse(true, 'Account created successfully!', [
    'user' => [
        'id'    => $userId,
        'name'  => $name,
        'email' => $email,
    ]
]);
