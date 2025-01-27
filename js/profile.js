fetch('php/profile.php')
    .then(response => response.json())
    .then(data => {
        document.getElementById('username').textContent = data.username;
        document.getElementById('email').textContent = data.email;
    })
    .catch(error => {
        console.error('Error fetching profile data:', error);
        document.getElementById('username').textContent = 'Error';
        document.getElementById('email').textContent = 'Unable to load data';
    });


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

document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('access_token');
    if (token) {
        fetch('./php/fetchVideosNames.php?filterByUser=true')
            .then(response => response.json())
            .then(data => {
                const videosList = document.getElementById('yourVideos');
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
                    listItem.innerHTML = `<h3 class='videoContainerTemp'><video id='last-${video.id}' width='300px' height='200px' crossorigin='anonymous' controls></video><a href='${url.toString()}'>${video.name}</a></h3>`;
                    listItem.id = `video-${video.id}`;
                    fetchVideo(video.drive_id, localStorage.getItem('access_token'), `last-${video.id}`);
                    videosList.appendChild(listItem);
                });
            })
            .catch(error => console.error('Error fetching videos:', error));
    }
});