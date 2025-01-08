<?php
// Include Google Drive API
require '/vendor/autoload.php';

use Google\Client as Google_Client;
use Google\Service\Drive as Google_Service_Drive;
use Google\Service\Drive\DriveFile as Google_Service_Drive_DriveFile;
// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "videoannotator";
$folderId = "14IWnQhBfaX7-OfVPC_q7tYc_VqzWLIKz"; // Google Drive folder ID

// Connect to the database
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}

// Validate inputs
$videoName = $_POST['videoName'] ?? '';
$videoType = isset($_POST['videoType']) && $_POST['videoType'] === 'on' ? 'Public' : 'Private';

if (empty($videoName) || empty($_FILES['videoUpload'])) {
    die(json_encode(['success' => false, 'message' => 'Invalid input']));
}

$file = $_FILES['videoUpload'];
$fileName = $file['videoName'];
$fileType = $file['videoType'];

// Google Drive API setup
$client = new Google_Client();
$client->setAuthConfig('../config.json'); // Path to your Google API credentials
$client->addScope(Google_Service_Drive::DRIVE_FILE);

$service = new Google_Service_Drive($client);

// File metadata
$fileMetadata = new Google_Service_Drive_DriveFile([
    'name' => $fileName,
    'parents' => [$folderId],
]);

// Upload file to Google Drive
try {
    $content = file_get_contents($tmpFilePath);
    $driveFile = $service->files->create($fileMetadata, [
        'data' => $content,
        'mimeType' => $fileType,
        'uploadType' => 'multipart',
        'fields' => 'id',
    ]);

    // Get the file ID
    $fileId = $driveFile->id;

    // Insert into database
    $stmt = $conn->prepare("INSERT INTO videos (name, drive_id, owner_id, created_on, updated_on, is_private) VALUES (?, ?, ?, NOW(), NOW(), ?)");
    $ownerId = 1010101011; // Replace with dynamic owner ID if necessary
    $stmt->bind_param($videoName, $fileId, $ownerId, $videoType);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Video uploaded successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to insert into database']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error uploading to Google Drive: ' . $e->getMessage()]);
}

$conn->close();
?>
