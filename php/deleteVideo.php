<?php

$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);

$videoId = $data['videoId'] ?? null;
$accessToken = $data['access_token'] ?? null;

if (!$videoId || !$accessToken) {
    echo json_encode(['success' => false, 'message' => 'Invalid video ID or access token.']);
    exit;
}

require_once __DIR__ . '/../vendor/autoload.php';

use Google\Client as Google_Client;
use Google\Service\Drive as Google_Service_Drive;

session_start();

try {
    $client = new Google_Client();
    $client->setAuthConfig('../config_mine.json');
    $client->addScope(Google_Service_Drive::DRIVE);
    $client->setAccessType('offline');

    if (isset($_SESSION['access_token']) && $_SESSION['access_token']) {
        $client->setAccessToken($_SESSION['access_token']);

        if ($client->isAccessTokenExpired()) {
            $client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());
            $_SESSION['access_token'] = $client->getAccessToken();
        }
    } else {
        throw new Exception('Access token is missing. Please authenticate.');
    }

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

    $fileIdQuery = "SELECT drive_id FROM videos WHERE id = ?";
    $stmt = $conn->prepare($fileIdQuery);
    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'DB prepare failed: ' . $conn->error,
        ]);
        $conn->close();
        exit();
    }

    $stmt->bind_param('i', $videoId);
    $stmt->execute();
    $stmt->bind_result($fileId);
    $stmt->fetch();
    $stmt->close();

    if (!$fileId) {
        echo json_encode([
            'success' => false,
            'message' => 'No file found with the provided video ID.',
        ]);
        $conn->close();
        exit();
    }

    $driveService = new Google_Service_Drive($client);
    try {
        $driveService->files->delete($fileId);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete file from Google Drive: ' . $e->getMessage(),
        ]);
        $conn->close();
        exit();
    }

    $deleteQuery = "DELETE FROM videos WHERE id = ?";
    $stmt = $conn->prepare($deleteQuery);
    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'DB prepare failed: ' . $conn->error,
        ]);
        $conn->close();
        exit();
    }

    $stmt->bind_param('i', $videoId);
    $stmt->execute();
    $stmt->close();

    $projectRoot = __DIR__ . '/../'; 
    $videosDir = $projectRoot . 'videos/';
    $localFilename = $videosDir . $videoId . '.mp4';

    if (file_exists($localFilename)) {
        if (!unlink($localFilename)) {
        }
    }

    $conn->close();

    echo json_encode([
        'success' => true,
        'message' => 'File deleted successfully from Drive, DB, and local folder (if present).',
        'fileId'  => $fileId,
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error deleting file: ' . $e->getMessage(),
    ]);
}
