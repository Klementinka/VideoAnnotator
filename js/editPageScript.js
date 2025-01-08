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

document.getElementById('set-end-time-button').addEventListener('click', function () {
    const video = document.getElementById('videoPlayer');
    const currentTime = video.currentTime;
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const milliseconds = Math.floor((currentTime % 1) * 1000);
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
    document.getElementById('end-time').value = formattedTime;
});

document.getElementById('set-start-time-button').addEventListener('click', function () {
    const video = document.getElementById('videoPlayer');
    const currentTime = video.currentTime;
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const milliseconds = Math.floor((currentTime % 1) * 1000);
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
    document.getElementById('start-time').value = formattedTime;
});

document.getElementById('next-frame-button').addEventListener('click', function () {
    const video = document.getElementById('videoPlayer');
    const frameRate = 30; // Assuming the video has a frame rate of 30 fps
    video.currentTime += 1 / frameRate;
});

const video = document.getElementById('videoPlayer');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const processButton = document.getElementById('process');
const downloadLink = document.getElementById('download');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');

processButton.addEventListener('click', async () => {

    let startTime = startTimeInput.value.split(':').map(parseFloat);
    startTime = startTime[0] * 60 + startTime[1] + startTime[2] / 1000;
    let endTime = endTimeInput.value.split(':').map(parseFloat);
    endTime = endTime[0] * 60 + endTime[1] + endTime[2] / 1000;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const stream = canvas.captureStream(); // Capture canvas stream
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });

        const url = URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.download = `${getQueryParam('id')}-${startTime}-${endTime}.webm`;
        downloadLink.style.display = 'block';
        downloadLink.textContent = 'Download New Video';
    };

    mediaRecorder.start();

    const frameInterval = Math.floor(video.fps || 30);

    for (let time = Math.max(0, startTime); time < Math.min(endTime, video.duration); time += 1 / frameInterval) {
        console.log('frame', time);
        video.currentTime = time;
        await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    mediaRecorder.stop();
});