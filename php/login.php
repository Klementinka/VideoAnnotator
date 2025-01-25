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
    die(json_encode(['success' => false, 'message' => 'Database connection failed.']));
}

require_once __DIR__ . '/../vendor/autoload.php';
use Google\Client as Google_Client;

// Initialize Google Client
$client = new Google_Client();
$client->setAuthConfig('../config_mine.json');
$client->setRedirectUri('http://localhost/VideoAnnotator/oauth2callback.php');
$client->addScope(Google_Service_Drive::DRIVE);
$client->setAccessType('offline');
$client->setPrompt('consent');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $conn->real_escape_string($_POST['username'] ?? '');
    $password = $conn->real_escape_string($_POST['password'] ?? '');

    if (!empty($username) && !empty($password)) {
        // Check user credentials
        $query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
        $result = $conn->query($query);

        if ($result->num_rows > 0) {
            session_start();

            // Check for existing Google tokens
            if (isset($_SESSION['access_token']) && !$client->isAccessTokenExpired()) {
                $accessToken = $_SESSION['access_token']['access_token'];
                echo json_encode(['success' => true, 'token' => $accessToken]);
            } else {
                // Generate Google auth URL
                $authUrl = $client->createAuthUrl();
                echo json_encode(['success' => true, 'authUrl' => $authUrl]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

$conn->close();
?>
