<?php
// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "videoannotator";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get movie ID from request
$video_id = isset($_GET['video_id']) ? intval($_GET['video_id']) : 0;

if ($video_id > 0) {
    // Prepare and execute the query
    $stmt = $conn->prepare("SELECT subtitle_name, drive_id FROM subtitles WHERE video_id = ?");
    $stmt->bind_param("i", $video_id);
    $stmt->execute();
    $result = $stmt->get_result();

    // Fetch results
    $subtitles = array();
    while ($row = $result->fetch_assoc()) {
        $subtitles[] = $row;
    }

    // Output results as JSON
    header('Content-Type: application/json');
    echo json_encode($subtitles);

    // Close statement
    $stmt->close();
} else {
    echo json_encode(array("error" => "Invalid movie ID"));
}

// Close connection
$conn->close();
?>