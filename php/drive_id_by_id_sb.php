<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "videoannotator";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);

    $stmt = $conn->prepare("SELECT drive_id, subtitle_name FROM subtitles WHERE id = ?");
    $stmt->bind_param("i", $id);

    $stmt->execute();

    $stmt->bind_result($drive_id, $name);
    if ($stmt->fetch()) {
        echo json_encode(array("drive_id" => $drive_id, "subtitle_name" => $name));
    } else {
        echo json_encode(array("error" => "No record found"));
    }

    $stmt->close();
} else {
    echo json_encode(array("error" => "No id parameter provided"));
}

$conn->close();
?>