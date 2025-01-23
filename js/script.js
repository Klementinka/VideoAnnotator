function fetchVideo(videoId, token, playerId, sourceId) {

    const videoUrl = `https://www.googleapis.com/drive/v3/files/${videoId}?alt=media`;

    let API_KEY = undefined;
    let CLIENT_ID = undefined;

    fetch('../VideoAnnotator/config.json')
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
                if (videoSource) {
                    videoSource.src = response.url + '&key=' + API_KEY;
                    videoPlayer.load();
                }
                else {
                    console.log(videoPlayer.id);
                    videoPlayer.src = response.url + '&key=' + API_KEY;
                    console.log(videoPlayer.src);
                }
            } else {
                console.log('Error fetching video:', response);
            }
        })
        .catch(err => {
            console.log('Error fetching video:', err);
        });
}

document.addEventListener('DOMContentLoaded', (event) => {

    document.getElementById('authButton').addEventListener('click', function () {
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=http://localhost/VideoAnnotator/oauth2callback.php&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly`;
    });

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        console.log(token, "available");
        fetch('./php/fetchVideosNames.php')
            .then(response => response.json())
            .then(data => {
                const videosList = document.getElementById('lastVideos');
                videosList.innerHTML = '';
                data.forEach(video => {
                    const listItem = document.createElement('li');
                    const queryParams = new URLSearchParams(window.location.search);
                    queryParams.forEach((value, key) => {
                        listItem.dataset[key] = value;
                    });
                    const url = new URL(`./VideoAnnotator/edit.html?id=${video.id}`, window.location.origin);
                    queryParams.forEach((value, key) => {
                        url.searchParams.append(key, value);
                    });
                    listItem.innerHTML = `<h3><video id='last-${video.id}' width='300px' height='200px' crossorigin='anonymous' controls><source type='video/mp4' id=cover-${video.id} src='unknown' alt='thumbnail TODO'></source></video><a href='${url.toString()}'>${video.name}</a></h3>`;
                    listItem.id = `video-${video.id}`;
                    fetchVideo(video.drive_id, queryParams.get('token'), `last-${video.id}`, `cover-${video.id}`);
                    videosList.appendChild(listItem);
                });
            })
            .catch(error => console.error('Error fetching videos:', error));
    }
});