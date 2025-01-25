<?php
session_start();

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "videoannotator";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    if (isset($_SESSION['username'])) {
        $username = $_SESSION['username'];
        $sql = "SELECT username, email FROM users WHERE username = '$username'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo json_encode($row);
        } else {
            echo "User not found.";
        }
    } else {
        echo "User not logged in.";
    }
}
?>