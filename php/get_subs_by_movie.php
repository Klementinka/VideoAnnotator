<?php
$config = json_decode(file_get_contents(__DIR__ . '/../config.json'), true);

$servername = $config['db_host'];
$dbname = $config['db_name'];
$username = $config['db_user'];
$password = $config['db_pass'];

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$video_id = isset($_GET['video_id']) ? intval($_GET['video_id']) : 0;

if ($video_id > 0) {
    $stmt = $conn->prepare("SELECT subtitle_name, drive_id FROM subtitles WHERE video_id = ?");
    $stmt->bind_param("i", $video_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $subtitles = array();
    while ($row = $result->fetch_assoc()) {
        $subtitles[] = $row;
    }

    header('Content-Type: application/json');
    echo json_encode($subtitles);

    $stmt->close();
} else {
    echo json_encode(array("error" => "Invalid movie ID"));
}

$conn->close();
?>