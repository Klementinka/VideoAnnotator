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

header('Content-Type: application/json');


$folderId = "107iWLIPK0Ooydvyr7D281w3eK4g_g3x9"; 

$configFilePath = '../config.json';

if (!file_exists($configFilePath)) {
    echo json_encode(['success' => false, 'message' => 'Config file not found.']);
    exit;
}

$config = json_decode(file_get_contents($configFilePath), true);

$client = new Google_Client();
$client->setClientId($config['CLIENT_ID']); 
$client->setClientSecret($config['CLIENT_SECRET']);
$client->setRedirectUri('http://localhost/VideoAnnotator/oauth2callback.php');
$client->addScope(Google_Service_Drive::DRIVE);
$client->setAccessType('offline');
$client->setPrompt('consent');

if (isset($_SESSION['access_token'])) {
    $client->setAccessToken($_SESSION['access_token']);
} else {
    echo json_encode(['success' => false, 'message' => 'Access token missing or expired.']);
    exit;
}

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

if (!isset($_FILES['subtitlesFile']) || $_FILES['subtitlesFile']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'No subtitle file was uploaded or upload failed.']);
    exit();
}

$videoId = $_POST['videoId'] ?? null;
if (!$videoId) {
    echo json_encode(['success' => false, 'message' => 'No video ID provided.']);
    exit();
}

$subtitlesTmpPath = $_FILES['subtitlesFile']['tmp_name'];
$originalName = $_FILES['subtitlesFile']['name'];   
$fileMimeType = mime_content_type($subtitlesTmpPath); 

if (!in_array($fileMimeType, ['text/plain', 'application/octet-stream', 'text/x-srt', 'text/vtt'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid subtitle file format. Only .srt, .vtt, or .txt files are allowed.']);
    exit();
}

try {
    $service = new Google_Service_Drive($client);

    $fileMetadata = new Google_Service_Drive_DriveFile([
        'name' => $originalName,
    ]);

    if (!empty($folderId)) {
        $fileMetadata->setParents([$folderId]);
    }

    $fileContent = file_get_contents($subtitlesTmpPath);

    $driveFile = $service->files->create($fileMetadata, [
        'data' => $fileContent,
        'mimeType' => $fileMimeType,
        'uploadType' => 'multipart',
        'fields' => 'id',
    ]);

    $fileId = $driveFile->id;

    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "videoannotator";

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $conn->connect_error,
        ]);
        exit();
    }

    $sql = "INSERT INTO subtitles (video_id, subtitle_name, drive_id, created_on)
            VALUES (?, ?, ?, NOW())";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'DB prepare failed: ' . $conn->error,
        ]);
        $conn->close();
        exit();
    }

    $stmt->bind_param("iss", $videoId, $originalName, $fileId);

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
        'message' => 'Subtitle uploaded and linked to video successfully.',
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
