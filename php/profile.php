<?php
session_start();

if (!isset($_SESSION['user'])) {
    header('Location: login.html');
    exit;
}

header('Content-Type: application/json');
echo json_encode([
    'username' => $_SESSION['user']['username'],
    'email' => $_SESSION['user']['email'],
    'id' => $_SESSION['user']['id'],
]);
?>
