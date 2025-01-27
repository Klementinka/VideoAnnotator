// ==================================
//  censorPageScript.js
// ==================================

const video = document.getElementById('videoPlayer');
const overlayCanvas = document.getElementById('overlayCanvas');
const overlayCtx = overlayCanvas.getContext('2d');

const playBtn = document.getElementById('play-button');
const pauseBtn = document.getElementById('pause-button');
const nextFrameBtn = document.getElementById('next-frame-button');
const prevFrameBtn = document.getElementById('previous-frame-button');
const screenshotBtn = document.getElementById('screenshot-btn');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const timestampSpan = document.getElementById('timestamp');

const brushButton = document.getElementById('brushButton');
const sizeSlider = document.getElementById('size-slider');
const sizeValue = document.getElementById('size-value');
const colorPicker = document.getElementById('colorPicker'); 

const setStartButton = document.getElementById('setStartButton');
const setEndButton = document.getElementById('setEndButton');
const addRegionButton = document.getElementById('addRegionButton');
const startTimeDisplay = document.getElementById('startTimeDisplay');
const endTimeDisplay = document.getElementById('endTimeDisplay');

const saveButton = document.getElementById('saveButton');
const downloadLink = document.getElementById('download');

const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');


let isBrushing = false;

let brushSize = parseFloat(sizeSlider.value);
let brushColor = colorPicker.value; 

let tempCircles = [];

let blurRegions = [];

let currentStartTime = 0;
let currentEndTime = 0;


let showFinal = false;

const frameRate = 30;

function resizeCanvas() {
    overlayCanvas.width = video.clientWidth;
    overlayCanvas.height = video.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

sizeValue.textContent = brushSize.toString();

playBtn.onclick = () => video.play();
pauseBtn.onclick = () => video.pause();

nextFrameBtn.onclick = () => { video.currentTime += 1 / frameRate; };
prevFrameBtn.onclick = () => { video.currentTime -= 1 / frameRate; };

screenshotBtn.onclick = () => {
    const c = document.createElement('canvas');
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(video, 0, 0, c.width, c.height);
    const dataURL = c.toDataURL('image/png');

    const t = video.currentTime;
    const mm = Math.floor(t / 60);
    const ss = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 1000);
    const stamp = `${mm}_${ss}_${ms}`;

    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `frame_${stamp}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    progressBar.style.width = pct + '%';

    const m = Math.floor(video.currentTime / 60);
    const s = Math.floor(video.currentTime % 60);
    const ms = Math.floor((video.currentTime % 1) * 1000);
    timestampSpan.textContent =
        `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(ms).padStart(3, '0')}`;

    drawOverlay();
});

progressContainer.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const ratio = offsetX / progressContainer.offsetWidth;
    video.currentTime = ratio * video.duration;
});

speedSlider.addEventListener('input', () => {
    const spd = parseFloat(speedSlider.value);
    video.playbackRate = spd;
    speedValue.textContent = spd + 'x';
});

brushButton.addEventListener('click', () => {
    isBrushing = !isBrushing;
    overlayCanvas.style.pointerEvents = isBrushing ? 'auto' : 'none';
    overlayCanvas.style.cursor = isBrushing ? 'crosshair' : 'default';
});

sizeSlider.addEventListener('input', () => {
    brushSize = parseFloat(sizeSlider.value);
    sizeValue.textContent = brushSize.toString();
});

colorPicker.addEventListener('input', () => {
    brushColor = colorPicker.value;
});

const SPRAY_INTERVAL = 30; 
let isSpraying = false;
let lastSprayTime = 0; 

overlayCanvas.addEventListener('mousedown', (e) => {
  if (!isBrushing) return;
  isSpraying = true;

  const rect = overlayCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  tempCircles.push({ x, y, size: brushSize, color: brushColor });
  drawOverlay();
});

overlayCanvas.addEventListener('mousemove', (e) => {
  if (!isSpraying) return;

  const now = Date.now();
  if (now - lastSprayTime < SPRAY_INTERVAL) {
    return;
  }
  lastSprayTime = now;

  const rect = overlayCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  tempCircles.push({ x, y, size: brushSize, color: brushColor });
  drawOverlay();
});

overlayCanvas.addEventListener('mouseup', (e) => {
  if (!isBrushing) return;
  isSpraying = false;
});

setStartButton.addEventListener('click', () => {
    currentStartTime = video.currentTime;
    startTimeDisplay.textContent = currentStartTime.toFixed(2);
});

setEndButton.addEventListener('click', () => {
    currentEndTime = video.currentTime;
    endTimeDisplay.textContent = currentEndTime.toFixed(2);
});

addRegionButton.addEventListener('click', () => {
    if (currentEndTime < currentStartTime) {
        alert('End time must be >= start time');
        return;
    }
    if (tempCircles.length === 0) {
        alert('No circles to add. Brush on the video first!');
        return;
    }

    blurRegions.push({
        start: currentStartTime,
        end: currentEndTime,
        circles: [...tempCircles]
    });

    tempCircles = [];
    drawOverlay();

    alert(`Region added for [${currentStartTime.toFixed(2)} - ${currentEndTime.toFixed(2)}].`);
});

function drawOverlay() {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    const t = video.currentTime;

    if (showFinal) {
        blurRegions.forEach(region => {
            if (t >= region.start && t <= region.end) {
                region.circles.forEach(circle => {
                    overlayCtx.beginPath();
                    overlayCtx.arc(circle.x, circle.y, circle.size / 2, 0, 2 * Math.PI);
                    overlayCtx.fillStyle = circle.color + '88';
                    overlayCtx.fill();
                    overlayCtx.closePath();
                });
            }
        });
    }

    tempCircles.forEach(circle => {
        overlayCtx.beginPath();
        overlayCtx.arc(circle.x, circle.y, circle.size / 2, 0, 2 * Math.PI);
        overlayCtx.fillStyle = circle.color + '88';
        overlayCtx.fill();
        overlayCtx.closePath();
    });
}

saveButton.addEventListener('click', async () => {
    showFinal = true;
    drawOverlay();

    video.currentTime = 0;
    video.pause(); 
    if (tempCircles.length > 0) {
        const confirmAdd = confirm('You have unsaved circles. Add them as a region first?');
        if (confirmAdd) {
            return;
        } else {
            tempCircles = [];
            drawOverlay();
        }
    }

    if (blurRegions.length === 0) {
        alert('No regions to process. Nothing to save.');
        return;
    }

    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });
    try {
        if (!ffmpeg.isLoaded()) await ffmpeg.load();
    } catch (err) {
        alert('Error loading FFmpeg: ' + err);
        return;
    }

    try {
        const response = await fetch(video.src);
        const videoBlob = await response.blob();
        const videoData = new Uint8Array(await videoBlob.arrayBuffer());
        ffmpeg.FS('writeFile', 'input.mp4', videoData);
    } catch (err) {
        alert('Error reading video data: ' + err);
        return;
    }

    let filterParts = [];
    blurRegions.forEach(region => {
        const { start, end } = region;
        region.circles.forEach(circle => {
            const r = circle.size / 2;
            const x = Math.max(0, circle.x - r);
            const y = Math.max(0, circle.y - r);
            const w = Math.min(overlayCanvas.width, r * 2);
            const h = Math.min(overlayCanvas.height, r * 2);
            const xInt = Math.round(x);
            const yInt = Math.round(y);
            const wInt = Math.round(w);
            const hInt = Math.round(h);

            const delogoCmd = `delogo=x=${xInt}:y=${yInt}:w=${wInt}:h=${hInt}:show=0:enable='between(t,${start},${end})'`;
            filterParts.push(delogoCmd);
        });
    });

    if (filterParts.length === 0) {
        alert('No filters constructed.');
        return;
    }

    const finalFilter = filterParts.join(',');

    try {
        const newFilter = `scale=1280:-1,${finalFilter}`;

        await ffmpeg.run(
            '-i', 'input.mp4',
            '-vf', newFilter, 
            '-c:a', 'copy',
            'output.mp4'
        );
    } catch (err) {
        alert('FFmpeg run error: ' + err);
        return;
    }

    try {
        const data = ffmpeg.FS('readFile', 'output.mp4');
        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.download = 'censored_video.mp4';
        downloadLink.style.display = 'inline-block';
        downloadLink.textContent = 'Download Censored Video';

    } catch (err) {
        alert('Error reading output: ' + err);
    }

    alert('Done encoding with FFmpeg. Now region circles appear at the correct intervals.');
});
