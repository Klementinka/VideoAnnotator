<?php
// oauth2callback.php
session_start();

// Check if the 'code' parameter is present in the query string
if (isset($_GET['code'])) {
    $authCode = $_GET['code'];

    // Read from config.json (contains CLIENT_ID and CLIENT_SECRET)
    $config = json_decode(file_get_contents('config.json'), true);
    $clientId = $config['CLIENT_ID'];
    $clientSecret = $config['CLIENT_SECRET'];
    
    // Must match the URI you set in Google Cloud Console
    $redirectUri = 'http://localhost/VideoAnnotator/oauth2callback.php';

    // Prepare the POST data to exchange the authorization code for an access token
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

    // Initialize cURL session
    $ch = curl_init();

    // Set cURL options
    curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // not recommended for production

    // Execute cURL request
    $response = curl_exec($ch);

    // Check for cURL errors
    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
        exit;
    }

    // Close the cURL session
    curl_close($ch);

    // Decode the response from Google
    $data = json_decode($response, true);

    // If access token is present
    if (isset($data['access_token'])) {
        // Store the access token in $_SESSION
        if(!isset($data['created'])) {
            $data['created'] = time();
        }
        $_SESSION['access_token'] = $data;

        // If Google provided a refresh token, store it as well
        if (isset($data['refresh_token'])) {
            $_SESSION['refresh_token'] = $data['refresh_token'];
        }

        // (Optional) pass the access token back via the URL if you need it client-side
        $accessToken = $data['access_token'];
        header('Location: http://localhost/VideoAnnotator/index.html?token=' . $accessToken);
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
