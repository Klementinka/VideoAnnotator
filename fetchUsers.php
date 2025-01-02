<?php
header('Content-Type: application/json'); // Ensure the response is treated as JSON

// Database connection and query code
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "videoannotator";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT id, username, email FROM users";
$result = $conn->query($sql);

$users = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}

$conn->close();

echo json_encode($users);
?>
