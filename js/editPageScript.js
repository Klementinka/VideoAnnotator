function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', function () {
    const videoId = getQueryParam('id');
    if (videoId) {
        const videoUrl = `https://www.googleapis.com/drive/v3/files/${videoId}?alt=media&key=AIzaSyBqb-lZLqa_bSQDFcX89Tu3EVlbU2oyhJY`;
        document.getElementById('videoSource').src = videoUrl;
        fetch(videoUrl, { mode: 'no-cors' }).then(response => {
            if (response.status === 403) {
                document.body.innerHTML += '<p>Access to the video is forbidden. Please check your permissions.</p>';
            }
        })
            .catch(error => {
                document.body.innerHTML += `<p>Error fetching the video: ${error.message}</p>`;
            });
        document.getElementById('videoPlayer').load();
    } else {
        document.body.innerHTML += '<p>No video ID provided in the query parameters.</p>';
    }

});

document.getElementById('videoPlayer').addEventListener('timeupdate', function () {
    const videoPlayer = document.getElementById('videoPlayer');
    const progressBar = document.getElementById('progress-bar');
    const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    progressBar.style.width = percentage + '%';
});

document.querySelector('.progress-container').addEventListener('click', function (e) {
    const progressContainer = document.querySelector('.progress-container');
    const videoPlayer = document.getElementById('videoPlayer');
    const rect = progressContainer.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / progressContainer.offsetWidth;
    videoPlayer.currentTime = percentage * videoPlayer.duration;
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', function () {
    const videoId = getQueryParam('id');
    if (videoId) {
        const videoUrl = `https://www.googleapis.com/drive/v3/files/${videoId}?alt=media&key=AIzaSyBqb-lZLqa_bSQDFcX89Tu3EVlbU2oyhJY`;
        document.getElementById('videoSource').src = videoUrl;
        document.getElementById('videoSource').src = videoUrl;
        fetch(videoUrl)
            .then(response => {
                if (response.status === 403) {
                    document.body.innerHTML += '<p>Access to the video is forbidden. Please check your permissions.</p>';
                }
            })
            .catch(error => {
                document.body.innerHTML += `<p>Error fetching the video: ${error.message}</p>`;
            });
        document.getElementById('videoPlayer').load();
    } else {
        document.body.innerHTML += '<p>No video ID provided in the query parameters.</p>';
    }
});