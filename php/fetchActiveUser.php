<?php
session_start();

$config = json_decode(file_get_contents(__DIR__ . '/../config.json'), true);

$host = $config['db_host'];
$db = $config['db_name'];
$user = $config['db_user'];
$pass = $config['db_pass'];

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die('Database connection error: ' . $conn->connect_error);
}

if (isset($_SESSION['user']['id'])) {
    $userId = $_SESSION['user']['id'];

    $sql = "SELECT * FROM users WHERE id = $userId";
    $result = $conn->query($sql);

    if ($result->num_rows >  0) {
        $user = $result->fetch_assoc();
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Userbbbb not found.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'No user is logged in.']);
}
?>
