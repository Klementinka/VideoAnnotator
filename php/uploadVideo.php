<?php
session_start();


$autoloadPath = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    echo json_encode(['success' => false, 'message' => 'Library not found. Run `composer install` first.']);
    exit;
}
require_once $autoloadPath;
use Google\Client as Google_Client;
use Google\Service\Drive as Google_Service_Drive;
use Google\Service\Drive\DriveFile as Google_Service_Drive_DriveFile;

// Folder ID in Drive where you want to upload
$folderId = "14IWnQhBfaX7-OfVPC_q7tYc_VqzWLIKz";

// Set the response content type
header('Content-Type: application/json');

// 1) Initialize Google Client (same logic as before)
$client = new Google_Client();
$client->setAuthConfig('../config_mine.json');  
$client->setRedirectUri('http://localhost/VideoAnnotator/oauth2callback.php');
$client->addScope(Google_Service_Drive::DRIVE);
$client->setAccessType('offline');
$client->setPrompt('consent');

// 2) Retrieve the token from session (or POST, if you use that approach)
if (isset($_SESSION['access_token'])) {
    $client->setAccessToken($_SESSION['access_token']);
} else {
    echo json_encode(['success' => false, 'message' => 'Access token missing or expired.']);
    exit;
}
// 3) Refresh token if expired (same logic as before)
if ($client->isAccessTokenExpired()) {
    $currentToken = $client->getAccessToken();
    $refreshToken = $currentToken['refresh_token'] ?? null;
    if (!$refreshToken && isset($_SESSION['access_token']['refresh_token'])) {
        $refreshToken = $_SESSION['access_token']['refresh_token'];
    }
    if ($refreshToken) {
        $client->fetchAccessTokenWithRefreshToken($refreshToken);
        $_SESSION['access_token'] = $client->getAccessToken();
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Access token expired and no refresh token available. Please reauthorize.'
        ]);
        exit();
    }
}

// 4) Check if the user actually uploaded a file
if (!isset($_FILES['videoPath']) || $_FILES['videoPath']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'No video file was uploaded or upload failed.']);
    exit();
}

// 5) Check other form inputs
$videoName = $_POST['videoName'] ?? '';
$videoType = (!empty($_POST['videoType']) && $_POST['videoType'] === 'on') ? 'Private' : 'Public';
// (You can rename or handle this logic as you like)

// 6) Get the uploaded file info
$tmpFilePath = $_FILES['videoPath']['tmp_name']; // The temporary file path on the server
$originalName = $_FILES['videoPath']['name'];    // The original name of the file
$fileMimeType = mime_content_type($tmpFilePath); // Attempt to detect the MIME type

if (!$fileMimeType) {
    // Fallback if MIME detection fails
    $fileMimeType = 'application/octet-stream';
}
// 7) Upload to Google Drive
try {
    $service = new Google_Service_Drive($client);

    // File metadata
    // If you want to rename the file on Drive to something from $videoName, do:
    // 'name' => $videoName
    // or keep the original file name:
    $fileMetadata = new Google_Service_Drive_DriveFile([
        'name' => $videoName ?: $originalName,
    ]);

    // If uploading into a specific folder:
    if (!empty($folderId)) {
        $fileMetadata->setParents([$folderId]);
    }

    // Read file contents
    $fileContent = file_get_contents($tmpFilePath);

    // Create file in Drive
    $driveFile = $service->files->create($fileMetadata, [
        'data' => $fileContent,
        'mimeType' => $fileMimeType,
        'uploadType' => 'multipart',
        'fields' => 'id',
        // If it's a shared drive:
        // 'supportsAllDrives' => true,
    ]);

    // Done
    $fileId = $driveFile->id;

    
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "videoannotator";

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        // If connection fails, handle the error (log, echo, etc.)
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $conn->connect_error,
        ]);
        exit();
    }

    $sql = "INSERT INTO videos (name, drive_id, owner_id, created_on, updated_on, is_private)
            VALUES (?, ?, ?, NOW(), NOW(), ?)";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'DB prepare failed: ' . $conn->error,
        ]);
        $conn->close();
        exit();
    }

    //Should be changed to the actual owner id
    $ownerId = 2;
    $stmt->bind_param("ssib",$videoName, $fileId, $ownerId, $videoType);

    // Execute the query
    if (!$stmt->execute()) {
        echo json_encode([
            'success' => false,
            'message' => 'DB insert failed: ' . $stmt->error,
        ]);
        $stmt->close();
        $conn->close();
        exit();
    }

    $insertedId = $stmt->insert_id;

    $stmt->close();
    $conn->close();

    echo json_encode([
        'success' => true,
        'message' => 'Successfully uploaded to Google Drive.',
        'fileId' => $fileId,
        'dbId'    => $insertedId, 
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error uploading to Google Drive: ' . $e->getMessage()
    ]);
}
exit();
