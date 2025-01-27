function fetchVideo(videoId, token, playerId, API_KEY) {

    const videoUrl = `https://www.googleapis.com/drive/v3/files/${videoId}?alt=media&key=${API_KEY}`;

    fetch(videoUrl, {
        headers: {
            'Authorization': `Bearer ${token}`,
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

document.addEventListener('DOMContentLoaded', (event) => {

    document.getElementById('authButton').addEventListener('click', function () {
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=http://localhost/VideoAnnotator/oauth2callback.php&response_type=code&scope=https://www.googleapis.com/auth/drive`;
    });
    const token = localStorage.getItem('access_token');

    if (token) {
        fetch('./config.json')
            .then(response => response.json())
            .then(config => {
                const API_KEY = config.API_KEY;
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
                            listItem.innerHTML = `<h3 class='videoContainerTemp'><video id='last-${video.id}' width='500px' height='400px' crossorigin='anonymous' controls></video><a href='${url.toString()}'>${video.name}</a></h3>`;
                            listItem.id = `video-${video.id}`;
                            fetchVideo(video.drive_id, localStorage.getItem('access_token'), `last-${video.id}`, API_KEY);
                            videosList.appendChild(listItem);
                        });
                    })
                    .catch(error => console.error('Error fetching videos:', error));
            })
            .catch(error => console.error('Error fetching config:', error));

    }
});