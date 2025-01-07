<?php
// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "videoannotator";
$driveID =  "https://drive.google.com/drive/u/1/folders/14IWnQhBfaX7-OfVPC_q7tYc_VqzWLIKz";
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$videoName = $_POST['videoName'];         // Video name
$videoType = $_POST['videoType'] ?? 'Private'; // Default to Private if unchecked
$file = $_FILES['videoUpload'];          // Uploaded file
// Google Drive API configuration
require_once __DIR__ . '/vendor/autoload.php';

$client = new Google_Client();
$client->useApplicationDefaultCredentials();
$client->addScope(Google_Service_Drive::DRIVE_FILE);

$service = new Google_Service_Drive($client);

// File metadata
$fileMetadata = new Google_Service_Drive_DriveFile(array(
    'name' => $file['name'],
    'parents' => array('14IWnQhBfaX7-OfVPC_q7tYc_VqzWLIKz')
));

// File content
$content = file_get_contents($file['tmp_name']);

// Upload file to Google Drive
$driveFile = $service->files->create($fileMetadata, array(
    'data' => $content,
    'mimeType' => $file['type'],
    'uploadType' => 'multipart',
    'fields' => 'id'
));


// Insert video details into the database
$sql = "INSERT INTO `videos` (`id`, `name`,`drive_id`, `owner_id`, `created_on`, `updated_on`,`private`) VALUES
( $videoName, $driveID, 1010101011, NOW(), NOW(), $videoType)";

if ($conn->query($sql) === TRUE) {
    echo "New record created successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
$sql = "INSERT INTO `videos` (`id`, `drive_id`, `owner_id`, `created_on`, `updated_on`) VALUES
(10, '', 1010101011, '2025-01-02 12:33:12', '2025-01-02 12:33:12')";
?>
