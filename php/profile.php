<?php
session_start();

if (!isset($_SESSION['user'])) {
    header('Location: login.html'); // Redirect to login if not logged in
    exit;
}

// Pass the session data as JSON for the frontend to use
header('Content-Type: application/json');
echo json_encode([
    'username' => $_SESSION['user']['username'],
    'email' => $_SESSION['user']['email']
]);
?>
