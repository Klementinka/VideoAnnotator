<?php
// oauth2callback.php

// Check if the 'code' parameter is present in the query string
if (isset($_GET['code'])) {
    $authCode = $_GET['code'];

    $config = json_decode(file_get_contents('config.json'), true);
    $clientId = $config['CLIENT_ID'];
    $clientSecret = $config['CLIENT_SECRET'];
    $redirectUri = 'http://localhost/VideoAnnotator/oauth2callback.php';
    
    // Prepare the POST data to exchange the authorization code for an access token
    $postData = [
        'code' => $authCode,
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'redirect_uri' => $redirectUri,
        'grant_type' => 'authorization_code',
    ];

    // Initialize cURL session
    $ch = curl_init();

    // Set cURL options
    curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Disable SSL verification for testing

    // Execute cURL request
    $response = curl_exec($ch);

    // Check for cURL errors
    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
        exit;
    }

    // Close the cURL session
    curl_close($ch);

    // Decode the response
    $data = json_decode($response, true);

    // If access token is present, redirect to edit.html with the token
    if (isset($data['access_token'])) {
        $accessToken = $data['access_token'];
        header('Location: http://localhost/VideoAnnotator/index.html?token=' . $accessToken);
        exit;
    } else {
        // Handle the error if no access token is returned
        echo 'Error: ' . $response;
    }
} else {
    // If no code is present, handle the missing authorization code error
    echo 'No authorization code received.';
}
?>
