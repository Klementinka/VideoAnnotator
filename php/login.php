<?php
// Establish a connection to the database
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "videoannotator";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$autoloadPath = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    echo json_encode(['success' => false, 'message' => 'Library not found. Run `composer install` first.']);
    exit;
}
require_once $autoloadPath;
use Google\Client as Google_Client;
use Google\Service\Drive as Google_Service_Drive;
use Google\Service\Drive\DriveFile as Google_Service_Drive_DriveFile;

// 1) Initialize Google Client (same logic as before)
$client = new Google_Client();
$client->setAuthConfig('../config_mine.json');  
$client->setRedirectUri('http://localhost/VideoAnnotator/oauth2callback.php');
$client->addScope(Google_Service_Drive::DRIVE);
$client->setAccessType('offline');
$client->setPrompt('consent');

// Check if username and password are provided via POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (!empty($_POST['username']) && !empty($_POST['password'])) {
        $user = $conn->real_escape_string($_POST['username']);
        $pass = $conn->real_escape_string($_POST['password']);

        // Query to check if the user exists with the provided credentials
        $sql = "SELECT * FROM users WHERE username = '$user' AND password = '$pass'";
        $result = $conn->query($sql);

        // Found the user in the database
        if ($result->num_rows > 0) {
            if ($client->isAccessTokenExpired()) {
                $currentToken = $client->getAccessToken();
                $refreshToken = $currentToken['refresh_token'] ?? ($_SESSION['access_token']['refresh_token'] ?? null);
                if ($refreshToken) {
                    $client->fetchAccessTokenWithRefreshToken($refreshToken);
                    $_SESSION['access_token'] = $client->getAccessToken();
                } else {
                    header("Location: " . $client->createAuthUrl());
                    exit();
                }
            } 
            header('Location: http://localhost/VideoAnnotator/index.html?token=' . $client->getAccessToken());
            exit();
        } else {
            echo "Both username and password are required.";
        }
    }
}

$conn->close();
?>
