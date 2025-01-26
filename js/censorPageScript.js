const video = document.getElementById('videoPlayer');

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.getElementById('videoPlayer').addEventListener('timeupdate', function () {
    const videoPlayer = document.getElementById('videoPlayer');
    const progressBar = document.getElementById('progress-bar');
    const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    progressBar.style.width = percentage + '%';
});

document.getElementById('progress-container').addEventListener('click', function (e) {
    const progressContainer = document.getElementById('progress-container');
    const videoPlayer = document.getElementById('videoPlayer');
    const rect = progressContainer.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / progressContainer.offsetWidth;
    videoPlayer.currentTime = percentage * videoPlayer.duration;
});

document.getElementById('next-frame-button').onclick = function () {
    const video = document.getElementById('videoPlayer');
    const frameRate = 30; // Assuming the video has a frame rate of 30 fps
    video.currentTime += 1 / frameRate;
};

document.getElementById('previous-frame-button').onclick = function () {
    const video = document.getElementById('videoPlayer');
    const frameRate = 30; // Assuming the video has a frame rate of 30 fps
    video.currentTime -= 1 / frameRate;
};

document.getElementById('screenshot-btn').onclick = function () {
    const video = document.getElementById('videoPlayer');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toDataURL('image/png');
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    const currentTime = video.currentTime;
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const milliseconds = Math.floor((currentTime % 1) * 1000);
    const timestamp = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
    a.download = `${timestamp}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

document.getElementById('play-button').onclick = function () {
    const video = document.getElementById('videoPlayer');
    video.play();
};

document.getElementById('pause-button').onclick = function () {
    const video = document.getElementById('videoPlayer');
    video.pause();
};

const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const videoPlayer = document.getElementById('videoPlayer');

speedSlider.addEventListener('input', function () {
    const speed = speedSlider.value;
    videoPlayer.playbackRate = speed;
    speedValue.textContent = speed + 'x';
});

const overlayCanvas = document.getElementById('overlayCanvas');
const overlayCtx = overlayCanvas.getContext('2d');
const brushButton = document.getElementById('brushButton');
const saveButton = document.getElementById('saveButton');
const brushSizeInput = document.getElementById('brushSize');
const downloadLink = document.getElementById('download');

// Variables
let isBrushing = false;
let blurRegions = [];
let currentBrushSize = brushSizeInput.value;

// Resize the canvas to match the video dimensions
function resizeCanvas() {
    overlayCanvas.width = video.clientWidth;
    overlayCanvas.height = video.clientHeight;
}
resizeCanvas();

// Update canvas size on window resize
window.addEventListener('resize', resizeCanvas);

// Handle brush size changes
brushSizeInput.addEventListener('input', () => {
    currentBrushSize = brushSizeInput.value;
});

// Enable brush mode
brushButton.addEventListener('click', () => {
    isBrushing = !isBrushing;
    overlayCanvas.style.cursor = isBrushing ? 'crosshair' : 'default';

    if (!isBrushing) {
        overlayCanvas.style.display = 'none';
    } else {
        overlayCanvas.style.display = 'block';
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
});

// Draw blur regions on canvas
overlayCanvas.addEventListener('mousedown', (e) => {
    if (!isBrushing) return;

    const rect = overlayCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    blurRegions.push({ x, y, size: currentBrushSize });

    overlayCtx.beginPath();
    overlayCtx.arc(x, y, currentBrushSize / 2, 0, 2 * Math.PI);
    overlayCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    overlayCtx.fill();
    overlayCtx.closePath();
});

// Save video with blur effect
saveButton.addEventListener('click', async () => {
    isBrushing = false;
    overlayCanvas.style.cursor = 'default';

    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });

    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
    }

    // Write the input video file
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(video.src));

    // Create blur filters for each region
    const blurFilters = blurRegions.map(({ x, y, size }) => {
        return `boxblur=w=${size}:h=${size}:x=${x}:y=${y}`;
    }).join(',');

    // Run FFmpeg command
    await ffmpeg.run(
        '-i', 'input.mp4',
        '-vf', blurFilters,
        '-c:a', 'copy',
        'output.mp4'
    );

    // Retrieve the processed video
    const data = ffmpeg.FS('readFile', 'output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);

    // Provide the download link
    downloadLink.href = url;
    downloadLink.download = 'censored_video.mp4';
    downloadLink.style.display = 'block';
    downloadLink.textContent = 'Download Censored Video';
    downloadLink.click();
});