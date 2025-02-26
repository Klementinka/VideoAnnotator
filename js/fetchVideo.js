function fetchVideo(videoId, token, playerId, API_KEY) {

    const videoUrl = `https://www.googleapis.com/drive/v3/files/${videoId}?alt=media&key=${API_KEY}`;

    fetch(videoUrl, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Range': 'bytes=0-5999999'
        }
    })
    
        .then(response => {
            if (response.ok) {
                const videoPlayer = document.getElementById(playerId);
                response.blob().then(blob => {
                    videoPlayer.src = URL.createObjectURL(blob);
                });
                videoPlayer.load();
            } else {
                throw new Error('Response not ok');
            }
        })
        .catch(err => {
            console.log('Error fetching video:', err);
        });
}


function loadSecondVideo() {
    const id_db = prompt('Enter id of the second video:');

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('id2', id_db);
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState(null, '', newUrl);

    fetch(`videos/${id_db}.mp4`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Video not found');
            }
            return response.blob();
        })
        .then(blob => {
            const videoPlayer = document.getElementById('videoPlayer2');
            const videoSource = document.getElementById('videoSource2');
            videoSource.src = URL.createObjectURL(blob);
            videoPlayer.load();
            fetch(`./php/drive_id_by_id.php?id=${id_db}`)
                .then(response => response.json())
                .then(data => {
                    if (data.drive_id) {
                        document.getElementById('video-name2').textContent = data.name
                    } else {
                        alert('No drive_id found for the given video id.');
                    }
                })
                .catch(error => {
                    alert(error);
                });
        })
        .catch(error => {
            console.log("Not found locally (second video)");
            fetch(`./php/drive_id_by_id.php?id=${id_db}`)
                .then(response => response.json())
                .then(data => {
                    if (data.drive_id) {
                        fetchVideo(data.drive_id, localStorage.getItem('access_token'), 'videoPlayer2');
                        document.getElementById('video-name2').textContent = data.name
                    } else {
                        alert('No drive_id found for the given video id.');
                    }
                })
                .catch(error => {
                    alert(error);
                });

        });
}