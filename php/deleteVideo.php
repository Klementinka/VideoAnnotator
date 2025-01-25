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

    $driveService = new Google_Service_Drive($client);

    $fileId = "SELECT drive_id FROM videos WHERE id = '$videoId'"; 

    $sql = "DELETE FROM videos WHERE fileID = '$fileId'";
    $driveService->files->delete($fileId);

    echo json_encode([
        'success' => true,
        'message' => 'File deleted successfully.',
        'fileId'  => $fileId,
    ]);

} catch (Exception $e) {
    // Handle any errors
    echo json_encode([
        'success' => false,
        'message' => 'Error deleting file: ' . $e->getMessage(),
    ]);
}
