<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['videoUpload']) && $_FILES['videoUpload']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/';
        $uploadFile = $uploadDir . basename($_FILES['videoUpload']['name']);
        
        if (move_uploaded_file($_FILES['videoUpload']['tmp_name'], $uploadFile)) {
            echo json_encode(['status' => 'success', 'filePath' => $uploadFile]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'File upload failed']);
        }
    }   

    if (isset($_FILES['importSubtitles']) && $_FILES['importSubtitles']['error'] === UPLOAD_ERR_OK) {
        $subtitlesData = file_get_contents($_FILES['importSubtitles']['tmp_name']);
        $subtitles = json_decode($subtitlesData, true);

        if (is_array($subtitles)) {
            file_put_contents('subtitles.json', json_encode($subtitles));
            echo json_encode(['status' => 'success', 'message' => 'Subtitles imported']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid subtitle file']);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['export'])) {
    if (file_exists('subtitles.json')) {
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="subtitles.json"');
        readfile('subtitles.json');
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No subtitles available']);
    }
}
?>
