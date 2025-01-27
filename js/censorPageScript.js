// ==================================
//  censorPageScript.js
// ==================================

// Grab references
const video = document.getElementById('videoPlayer');
const overlayCanvas = document.getElementById('overlayCanvas');
const overlayCtx = overlayCanvas.getContext('2d');

// Possibly existing controls
const playBtn = document.getElementById('play-button');
const pauseBtn = document.getElementById('pause-button');
const nextFrameBtn = document.getElementById('next-frame-button');
const prevFrameBtn = document.getElementById('previous-frame-button');
const screenshotBtn = document.getElementById('screenshot-btn');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const timestampSpan = document.getElementById('timestamp');

// Brush
const brushButton = document.getElementById('brushButton');
const sizeSlider = document.getElementById('size-slider');
const sizeValue = document.getElementById('size-value');
const colorPicker = document.getElementById('colorPicker'); // <input type="color" id="colorPicker" />

// Time range
const setStartButton = document.getElementById('setStartButton');
const setEndButton = document.getElementById('setEndButton');
const addRegionButton = document.getElementById('addRegionButton');
const startTimeDisplay = document.getElementById('startTimeDisplay');
const endTimeDisplay = document.getElementById('endTimeDisplay');

// Save/download
const saveButton = document.getElementById('saveButton');
const downloadLink = document.getElementById('download');

// Playback speed
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');

// --- Variables ---

// Whether brush mode is active
let isBrushing = false;

// Brush size + color
let brushSize = parseFloat(sizeSlider.value);
let brushColor = colorPicker.value; // e.g. "#ff0000"

// Circles not yet assigned to a region
let tempCircles = [];

// Final regions: each is {start, end, circles: [ {x,y,size,color}, ... ]}
let blurRegions = [];

// Current start/end
let currentStartTime = 0;
let currentEndTime = 0;

// Show final? (After "Save", we'll set this to true)
let showFinal = false;

// Frame stepping
const frameRate = 30;

// --- Init ---
function resizeCanvas() {
    overlayCanvas.width = video.clientWidth;
    overlayCanvas.height = video.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

sizeValue.textContent = brushSize.toString();

// --- Basic Video controls ---

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

// progress
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

// speed
speedSlider.addEventListener('input', () => {
    const spd = parseFloat(speedSlider.value);
    video.playbackRate = spd;
    speedValue.textContent = spd + 'x';
});

// --- Brush ---
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

// Spray frequency in milliseconds (optional)
const SPRAY_INTERVAL = 30; 
let isSpraying = false;
let lastSprayTime = 0; // track the last time we sprayed a circle

overlayCanvas.addEventListener('mousedown', (e) => {
  if (!isBrushing) return;
  isSpraying = true;

  // Immediately place one circle at mousedown location
  const rect = overlayCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  tempCircles.push({ x, y, size: brushSize, color: brushColor });
  drawOverlay(); // re-draw if you want immediate feedback
});

overlayCanvas.addEventListener('mousemove', (e) => {
  if (!isSpraying) return;

  // Throttle how often we place circles to avoid excessive events:
  const now = Date.now();
  if (now - lastSprayTime < SPRAY_INTERVAL) {
    return; // too soon
  }
  lastSprayTime = now;

  // Add a circle at the current mouse location
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


// --- Time Range ---
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

    // Clear them
    tempCircles = [];
    // "Remove" them from the overlay for now
    drawOverlay();

    alert(`Region added for [${currentStartTime.toFixed(2)} - ${currentEndTime.toFixed(2)}].`);
});

// --- Overlay drawing logic ---
function drawOverlay() {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // If we haven't "saved" yet, we do NOT show final region circles
    // After saving, we do show them (only in their time intervals).
    const t = video.currentTime;

    if (showFinal) {
        // Show final region circles in their intervals
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

    // Always show temp circles (the user is still deciding what times they'll be assigned)
    tempCircles.forEach(circle => {
        overlayCtx.beginPath();
        overlayCtx.arc(circle.x, circle.y, circle.size / 2, 0, 2 * Math.PI);
        overlayCtx.fillStyle = circle.color + '88';
        overlayCtx.fill();
        overlayCtx.closePath();
    });
}

// --- Save ---
saveButton.addEventListener('click', async () => {
    // Once we save, we want to show final region circles, so set the flag
    showFinal = true;
    drawOverlay();

    video.currentTime = 0;
    video.pause(); // optional, if you want it paused
    // If user still has unsaved circles
    if (tempCircles.length > 0) {
        const confirmAdd = confirm('You have unsaved circles. Add them as a region first?');
        if (confirmAdd) {
            return;
        } else {
            // discard
            tempCircles = [];
            drawOverlay();
        }
    }

    if (blurRegions.length === 0) {
        alert('No regions to process. Nothing to save.');
        return;
    }


    // Optionally do FFmpeg for black boxes
    // If you want partial blur, you might need a different build or approach.
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });
    try {
        if (!ffmpeg.isLoaded()) await ffmpeg.load();
    } catch (err) {
        alert('Error loading FFmpeg: ' + err);
        return;
    }

    // Write input
    try {
        const response = await fetch(video.src);
        const videoBlob = await response.blob();
        const videoData = new Uint8Array(await videoBlob.arrayBuffer());
        ffmpeg.FS('writeFile', 'input.mp4', videoData);
    } catch (err) {
        alert('Error reading video data: ' + err);
        return;
    }

    // Build delogo filters
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

            // black box
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
            '-vf', newFilter, // now includes both scale and delogo
            '-c:a', 'copy',
            'output.mp4'
        );
    } catch (err) {
        alert('FFmpeg run error: ' + err);
        return;
    }

    // read output
    try {
        const data = ffmpeg.FS('readFile', 'output.mp4');
        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.download = 'censored_video.mp4';
        downloadLink.style.display = 'inline-block';
        downloadLink.textContent = 'Download Censored Video';
        // Optionally auto-click:
        // downloadLink.click();
    } catch (err) {
        alert('Error reading output: ' + err);
    }

    alert('Done encoding with FFmpeg. Now region circles appear at the correct intervals.');
});
