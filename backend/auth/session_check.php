<?php
// backend/auth/session_check.php
// GET — returns current session user (used by frontend on page load)
// Returns: { success, loggedIn, user? }

require_once __DIR__ . '/../config/db.php';

session_start();
header('Content-Type: application/json');

$userId = getAuthUserId();

if ($userId) {
    echo json_encode([
        'success'  => true,
        'loggedIn' => true,
        'user'     => [
            'id'    => $userId,
            'name'  => $_SESSION['user_name']  ?? '',
            'email' => $_SESSION['user_email'] ?? '',
        ]
    ]);
} else {
    echo json_encode([
        'success'  => true,
        'loggedIn' => false,
    ]);
}
