<?php
// oauth2callback.php
$currentPath = dirname(__FILE__);
$relativePath = explode("htdocs\\", $currentPath, 2)[1];
$relativePath = str_replace('\\', '/', $relativePath);

$working = 'http://localhost/' .$relativePath . '/oauth2callback.php';
session_start();

if (isset($_GET['code'])) {
    $authCode = $_GET['code'];

    $config = json_decode(file_get_contents('config.json'), true);
    $clientId = $config['CLIENT_ID'];
    $clientSecret = $config['CLIENT_SECRET'];

    $currentPath = __FILE__;
    
    $redirectUri = $working;
    // $redirectUri = 'http://localhost/VideoAnnotator/oauth2callback.php';

    $postData = [
        'code'          => $authCode,
        'client_id'     => $clientId,
        'client_secret' => $clientSecret,
        'redirect_uri'  => $redirectUri,
        'grant_type'    => 'authorization_code',
        // No need to include these here if you already did in your auth URL:
        // 'access_type' => 'offline',
        // 'prompt' => 'consent',
    ];

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
        exit;
    }

    curl_close($ch);

    $data = json_decode($response, true);

    if (isset($data['access_token'])) {
        if(!isset($data['created'])) {
            $data['created'] = time();
        }
        $_SESSION['access_token'] = $data;

        if (isset($data['refresh_token'])) {
            $_SESSION['refresh_token'] = $data['refresh_token'];
        }

        // (Optional) pass the access token back via the URL if you need it client-side
        $accessToken = $data['access_token'];

        header('Location: http://localhost/w23/day1_2025_01_28/4MI0800017_7MI0800016_7MI0800029_3MI0800036_videoanotator/index.html?token=' . $accessToken);
        exit();
    } else {
        // Handle the error if no access token is returned
        echo 'Error retrieving token: ' . $response;
    }
} else {
    // If no code is present, handle the missing authorization code error
    echo 'No authorization code received.';
}
exit();
