<?php
// backend/auth/logout.php
// POST (no body needed)
// Returns: { success, message }

require_once __DIR__ . '/../config/db.php';

session_start();
header('Content-Type: application/json');

$_SESSION = [];
session_destroy();

jsonResponse(true, 'Logged out successfully.');
