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

    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    $sql = "SELECT * FROM users WHERE username = '$username'";
    $result = $conn->query($sql);

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        $hashedPassword = $user['password'];

        if (password_verify($password, $hashedPassword)) {
            $_SESSION['user'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
            ];
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Incorrect password.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Userccccc not found.']);
    }
?>
