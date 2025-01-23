<?php
session_start();

require_once __DIR__ . '/../vendor/autoload.php';

use Google\Client as Google_Client;
use Google\Service\Drive as Google_Service_Drive;
use Google\Service\Drive\DriveFile as Google_Service_Drive_DriveFile;

// ---------------------- CONFIGURE THESE ---------------------- //
$folderId = "14IWnQhBfaX7-OfVPC_q7tYc_VqzWLIKz"; // The Drive folder ID where you want to upload
$configPath = '../config_mine.json';           // Path to your Google API credentials
// ------------------------------------------------------------ //

// Set the response to JSON
header('Content-Type: application/json');

// 1. Initialize Google Client
$client = new Google_Client();
$client->setAuthConfig($configPath);
$client->setRedirectUri('http://localhost/VideoAnnotator/oauth2callback.php');
$client->addScope(Google_Service_Drive::DRIVE);
$client->setAccessType('offline');
$client->setPrompt('consent');

// 2. Retrieve the token from session (most common) or from POST (if your JS sends it)
if (isset($_POST['access_token'])) {
    // If your front-end is sending the FULL token JSON, parse it:
    $tokenJson = $_POST['access_token'];

    $decodedToken = json_decode($tokenJson, true);
    if (is_array($decodedToken)) {
        // This array should have access_token, refresh_token, expires_in, etc.
        $client->setAccessToken($decodedToken);
        
        // Optionally also store it in session for future use
        $_SESSION['access_token'] = $decodedToken;
    } else {
        echo json_encode(['success' => false, 'message' => 'No array']);
    exit;
        // If not valid JSON, maybe it's just a string of the access token (missing refresh_token, etc.)
        // This won't help with refreshing. We'll set it anyway, but you'll likely see "no refresh token".
        $client->setAccessToken($tokenJson);
    }
} elseif (isset($_SESSION['access_token'])) {
    // Use the entire token array from session
    $client->setAccessToken($_SESSION['access_token']);
} else {
    // No token found anywhere
    echo json_encode(['success' => false, 'message' => 'Access token is missing or expired']);
    exit;
}

// 3. If token is expired, try to refresh (only works if we have a refresh_token)
if ($client->isAccessTokenExpired()) {
    $currentToken = $client->getAccessToken(); // array
    $refreshToken = $currentToken['refresh_token'] ?? null;
    
    // If refresh token is not in $currentToken, check if we stored it separately
    if (!$refreshToken && isset($_SESSION['access_token']['refresh_token'])) {
        $refreshToken = $_SESSION['access_token']['refresh_token'];
    }

    if ($refreshToken) {
        // Refresh the token
        $client->fetchAccessTokenWithRefreshToken($refreshToken);
        
        // Save the new token array back to session (it should contain new expiry time)
        $_SESSION['access_token'] = $client->getAccessToken();
    } else {
        // We cannot refresh, so we must ask the user to reauthorize
        echo json_encode([
            'success' => false,
            'message' => 'Access token expired and no refresh token available. Please reauthorize.'
        ]);
        exit();
    }
}

// 4. Validate we have the correct scope
$token = $client->getAccessToken();
if (
    !isset($token['scope']) || 
    strpos($token['scope'], 'https://www.googleapis.com/auth/drive') === false
) {
    echo json_encode([
        'success' => false,
        'message' => 'Token has insufficient scopes. Please reauthenticate.'
    ]);
    exit();
}

// 5. Validate form input (video name, path, etc.)
$videoName = $_POST['videoName'] ?? null;
$videoType = (isset($_POST['videoType']) && $_POST['videoType'] === 'off') ? 'Public' : 'Private';

if (empty($videoName) || empty($_POST['videoPath'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$filePath = $_POST['videoPath'];
$fileName = basename($filePath);

$fileMimeType = @mime_content_type($filePath);
if (!$fileMimeType) {
    $fileMimeType = 'application/octet-stream';
}

// 6. Attempt the Drive upload
try {
    $service = new Google_Service_Drive($client);

    // Prepare file metadata
    $fileMetadata = new Google_Service_Drive_DriveFile([
        'name' => $fileName,
    ]);
    
    // If we have a folder ID, place file inside it
    if (!empty($folderId)) {
        $fileMetadata->setParents([$folderId]);
    }

    // Read the file contents into a variable
    $fileContent = file_get_contents($filePath);

    // Upload to Drive
    $driveFile = $service->files->create(
        $fileMetadata,
        [
            'data' => $fileContent,
            'mimeType' => $fileMimeType,
            'uploadType' => 'multipart',
            'fields' => 'id',
            // If it's a shared drive, you also need:
            // 'supportsAllDrives' => true,
        ]
    );

    // Get the file ID
    $fileId = $driveFile->id;

    echo json_encode([
        'success' => true,
        'message' => 'Successfully uploaded to Google Drive',
        'fileId'   => $fileId,
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error uploading to Google Drive: ' . $e->getMessage()
    ]);
}
exit();
