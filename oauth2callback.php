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

    $postData = [
        'code'          => $authCode,
        'client_id'     => $clientId,
        'client_secret' => $clientSecret,
        'redirect_uri'  => $redirectUri,
        'grant_type'    => 'authorization_code',
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

        $accessToken = $data['access_token'];

        header('Location: http://localhost/'. $relativePath .'/index.html?token=' . $accessToken);
        exit();
    } else {
        echo 'Error retrieving token: ' . $response;
    }
} else {
    echo 'No authorization code received.';
}
exit();
