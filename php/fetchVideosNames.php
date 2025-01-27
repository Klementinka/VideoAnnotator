<?php
session_start();

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "videoannotator";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$movies = array();

if (isset($_GET['filterByUser']) && isset($_SESSION['user']['id'])) {
    $user = $_SESSION['user']['id'];
    $stmt = $conn->prepare("SELECT * FROM videos WHERE owner_id = ? LIMIT 12");
    $stmt->bind_param("i", $user);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $sql = "SELECT * FROM videos LIMIT 12";
    $result = $conn->query($sql);
}

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $movies[] = $row;
    }
    $result->free();
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch videos."]);
    exit;
}

$conn->close();

header('Content-Type: application/json');
echo json_encode($movies);
?>
