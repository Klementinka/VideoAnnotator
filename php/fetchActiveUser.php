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

// Check if the session has a user_id
if (isset($_SESSION['user']['id'])) {
    $userId = $_SESSION['user']['id'];

    // Query the database to fetch user details
    $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'No user is logged in.']);
}
?>
