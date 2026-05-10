<?php
// ============================================================
// Database Configuration
// Edit these values to match your XAMPP/WAMP setup
// ============================================================

define('DB_HOST', 'localhost');
define('DB_NAME', 'autoinsight');
define('DB_USER', 'root');       // Default XAMPP user
define('DB_PASS', '');           // Default XAMPP password (empty)
define('DB_CHARSET', 'utf8mb4');

// ============================================================
// PDO Connection (singleton pattern)
// ============================================================
function getDB(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            DB_HOST, DB_NAME, DB_CHARSET
        );

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
            exit;
        }
    }

    return $pdo;
}

// ============================================================
// Helper: send a JSON response and exit
// ============================================================
function jsonResponse(bool $success, string $message, array $data = []): void {
    header('Content-Type: application/json');
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $data));
    exit;
}

// ============================================================
// Helper: get current logged-in user id from session
// Returns null if not logged in
// ============================================================
function getAuthUserId(): ?int {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
}

// ============================================================
// Helper: require auth — exits with 401 if not logged in
// ============================================================
function requireAuth(): int {
    $id = getAuthUserId();
    if ($id === null) {
        http_response_code(401);
        jsonResponse(false, 'You must be logged in to do this.');
    }
    return $id;
}

// CORS headers — allow requests from same origin
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
