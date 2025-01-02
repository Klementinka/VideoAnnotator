<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "videoannotator";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM videos";
$result = $conn->query($sql);

$movies = array();

while($row = $result->fetch_assoc()) {
    $movies[] = $row;
}

$conn->close();

header('Content-Type: application/json');
echo json_encode($movies);
?>