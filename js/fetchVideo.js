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
                videoPlayer.load();
            } else {
                alert('Error fetching video:', str(response));
            }
        })
        .catch(err => {
            alert('Error fetching video:', err);
        });
}