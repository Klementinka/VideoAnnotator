function fetchVideo(videoId, token, playerId, sourceId) {

    const videoUrl = `https://www.googleapis.com/drive/v3/files/${videoId}?alt=media`;

    let API_KEY = undefined;
    let CLIENT_ID = undefined;

    fetch('./config.json')
        .then(response => response.json())
        .then(config => {
            API_KEY = config.API_KEY;
            CLIENT_ID = config.CLIENT_ID;
        })
        .catch(error => { alert('Error fetching config:', error); window.history.back(); });

    fetch(videoUrl, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (response.ok) {
                const videoPlayer = document.getElementById(playerId);
                const videoSource = document.getElementById(sourceId);
                videoSource.src = response.url + '&key=' + API_KEY;
                if (videoPlayer) videoPlayer.load();
            } else {
                console.log('Error fetching video:', response);
            }
        })
        .catch(err => {
            console.log('Error fetching video:', err);
        });
}

function loadSecondVideo() {
    const id_db = prompt('Enter id of the second video:');

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
            alert("Not found locally (second video)");
            fetch(`./php/drive_id_by_id.php?id=${id_db}`)
                .then(response => response.json())
                .then(data => {
                    if (data.drive_id) {
                        // params.set('id2', data.drive_id);
                        fetchVideo(data.drive_id, localStorage.getItem('access_token'), 'videoPlayer2', 'videoSource2');
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