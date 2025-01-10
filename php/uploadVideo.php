<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include Google Drive API
require_once __DIR__ . '/../vendor/autoload.php';

use Google\Client as Google_Client;
use Google\Service\Drive as Google_Service_Drive;
use Google\Service\Drive\DriveFile as Google_Service_Drive_DriveFile;

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "videoannotator";
$folderId = "14IWnQhBfaX7-OfVPC_q7tYc_VqzWLIKz"; // Google Drive folder ID

// Debugging output
echo "Hello";
ob_flush();
flush();


echo "Connected successfully";
ob_flush();
flush();

// Validate inputs
$videoName = $_POST['videoName'];
$videoType = isset($_POST['videoType']) && $_POST['videoType'] === 'off' ? 'Public' : 'Private';

if (empty($videoName) || empty($_POST['videoPath'])) {
    die(json_encode(['success' => false, 'message' => 'Invalid input']));
}

echo $_POST['videoPath'];
ob_flush();
flush();

$filePath = $_POST['videoPath'];
$fileName = basename($filePath);
$fileMimeType = mime_content_type($filePath);

// Google Drive API setup
$client = new Google_Client();
$client->setAuthConfig('../config.json'); // Path to your Google API credentials
$client->addScope(Google_Service_Drive::DRIVE_FILE);

$service = new Google_Service_Drive($client);

// File metadata for upload
$fileMetadata = new Google_Service_Drive_DriveFile([
    'name' => $fileName, // Use the original file name
]);

// Add the file to a folder, if folderId is set
if (!empty($folderId)) {
    $fileMetadata->setParents([$folderId]);
}

// Upload file to Google Drive
try {
    $fileContent = file_get_contents($filePath); // Read the file content

    $driveFile = $service->files->create($fileMetadata, [
        'data' => $fileContent,
        'mimeType' => $fileMimeType, // Detect MIME type
        'uploadType' => 'multipart',
        'fields' => 'id',
    ]);

    // Get the file ID
    $fileId = $driveFile->id;

    echo "Successfully uploaded to Google Drive";
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error uploading to Google Drive: ' . $e->getMessage()]);
}

exit(); // Ensure no further execution
?>
