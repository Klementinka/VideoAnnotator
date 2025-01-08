document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Video uploaded successfully!');
            // Optionally, update the video list here
        } else {
            alert('Failed to upload video.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while uploading the video.');
    });
});