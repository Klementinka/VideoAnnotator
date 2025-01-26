    // -----------------------------
    // Basic video + progress + screenshot + next/prev frame
    // -----------------------------
    const video = document.getElementById('videoPlayer');
    const videoSource = document.getElementById('videoSource');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const timestampContainer = document.getElementById('timestamp');
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');
    const nextFrameButton = document.getElementById('next-frame-button');
    const prevFrameButton = document.getElementById('previous-frame-button');
    const screenshotButton = document.getElementById('screenshot-btn');


    video.addEventListener('timeupdate', () => {
      const percentage = (video.currentTime / video.duration) * 100;
      progressBar.style.width = percentage + '%';

      // Also update the timestamp
      const minutes = Math.floor(video.currentTime / 60);
      const seconds = Math.floor(video.currentTime % 60);
      const milliseconds = Math.floor((video.currentTime % 1) * 1000);
      const formattedTime = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}:${String(milliseconds).padStart(3,'0')}`;
      timestampContainer.textContent = formattedTime;
    });

    // Click on progress bar to seek
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = offsetX / progressContainer.offsetWidth;
      video.currentTime = percentage * video.duration;
    });

    // Frame-by-frame
    const frameRate = 30; // Adjust if you know your actual frame rate
    nextFrameButton.onclick = () => {
      video.currentTime += 1 / frameRate;
    };
    prevFrameButton.onclick = () => {
      video.currentTime -= 1 / frameRate;
    };

    // Screenshot
    screenshotButton.onclick = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL('image/png');

      // Name the screenshot with current time
      const currentTime = video.currentTime;
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      const milliseconds = Math.floor((currentTime % 1) * 1000);
      const timestamp = `${minutes.toString().padStart(2, '0')}_${seconds.toString().padStart(2, '0')}_${milliseconds.toString().padStart(3, '0')}`;

      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `frame_${timestamp}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    // Play / Pause
    playButton.onclick = () => video.play();
    pauseButton.onclick = () => video.pause();

    // Speed slider
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    speedSlider.addEventListener('input', () => {
      const speed = parseFloat(speedSlider.value);
      video.playbackRate = speed;
      speedValue.textContent = speed + 'x';
    });

    // -----------------------------
    // Overlay canvas + brushing
    // -----------------------------
    const overlayCanvas = document.getElementById('overlayCanvas');
    const overlayCtx = overlayCanvas.getContext('2d');
    const brushButton = document.getElementById('brushButton');
    const sizeSlider = document.getElementById('size-slider');
    const sizeValue = document.getElementById('size-value');

    let brushSize = parseFloat(sizeSlider.value);
    sizeValue.textContent = brushSize.toString();

    // Resize overlayCanvas to match the VIDEO's display size
    function resizeCanvas() {
      // We want the canvas to match the displayed (CSS) size of the video
      overlayCanvas.width = video.clientWidth;
      overlayCanvas.height = video.clientHeight;
    }
    // Call once initially
    resizeCanvas();
    // Also on window resize or any time the video might change size
    window.addEventListener('resize', resizeCanvas);

    // Brush size slider
    sizeSlider.addEventListener('input', () => {
      brushSize = parseFloat(sizeSlider.value);
      sizeValue.textContent = brushSize.toString();
    });

    // We only draw on the overlayCanvas while brushing is active
    let isBrushing = false;

    brushButton.addEventListener('click', () => {
      // Toggle brush mode
      isBrushing = !isBrushing;
      if (isBrushing) {
        overlayCanvas.style.pointerEvents = 'auto';  // let us capture clicks
        overlayCanvas.style.cursor = 'crosshair';
      } else {
        overlayCanvas.style.pointerEvents = 'none';
        overlayCanvas.style.cursor = 'default';
      }
    });

    // For storing the blur circles we draw on the current frame *before* we finalize
    // But each "region" can then be associated with start/end times, etc.
    // We'll store them in a local array until user hits "Add Region".
    let tempCircles = [];

    overlayCanvas.addEventListener('mousedown', (e) => {
      if (!isBrushing) return;

      const rect = overlayCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Add a circle to temp
      tempCircles.push({ x, y, size: brushSize });

      // Immediately draw it in red as a preview
      overlayCtx.beginPath();
      overlayCtx.arc(x, y, brushSize / 2, 0, 2 * Math.PI);
      overlayCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      overlayCtx.fill();
      overlayCtx.closePath();
    });

    // -----------------------------
    // Time-range-based blur logic
    // -----------------------------
    const setStartButton = document.getElementById('setStartButton');
    const setEndButton = document.getElementById('setEndButton');
    const addRegionButton = document.getElementById('addRegionButton');
    const startTimeDisplay = document.getElementById('startTimeDisplay');
    const endTimeDisplay = document.getElementById('endTimeDisplay');

    let currentStartTime = 0;
    let currentEndTime = 0;

    // Keep a final array of blur “regions”:
    // Each item: { start: number, end: number, circles: [ { x, y, size }, ... ] }
    // For simplicity, this example lumps all circles drawn between "Set Start" / "Set End" into one region.
    let blurRegions = [];

    setStartButton.addEventListener('click', () => {
      currentStartTime = video.currentTime;
      startTimeDisplay.textContent = currentStartTime.toFixed(2);
    });
    setEndButton.addEventListener('click', () => {
      currentEndTime = video.currentTime;
      endTimeDisplay.textContent = currentEndTime.toFixed(2);
    });

    // Once we have a set of circles that the user drew, we "Add Region" to store them with the time range
    addRegionButton.addEventListener('click', () => {
      if (currentEndTime < currentStartTime) {
        alert('End time must be >= start time');
        return;
      }
      if (tempCircles.length === 0) {
        alert('No circles drawn. Draw with the brush first, then add region.');
        return;
      }

      // Store the region (the array of circles + times)
      blurRegions.push({
        start: currentStartTime,
        end: currentEndTime,
        circles: [...tempCircles]
      });

      // Clear the temp circles and canvas
      tempCircles = [];
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      alert(`Region added for time [${currentStartTime.toFixed(2)} - ${currentEndTime.toFixed(2)}] with ${blurRegions[blurRegions.length-1].circles.length} circles.`);
    });

    // -----------------------------
    // Save the video with the blur
    // -----------------------------
    const saveButton = document.getElementById('saveButton');
    const downloadLink = document.getElementById('download');

    saveButton.addEventListener('click', async () => {
        // Turn off brushing
        isBrushing = false;
        overlayCanvas.style.pointerEvents = 'none';
        overlayCanvas.style.cursor = 'default';
      
        // If user still has circles not added...
        if (tempCircles.length > 0) {
          const confirmAdd = confirm('You have unsaved brush circles. Add them as a region first?');
          if (confirmAdd) {
            return; // let them click "Add Region" first
          } else {
            // or we just discard them
            tempCircles = [];
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          }
        }
      
        if (blurRegions.length === 0) {
          alert('No blur regions to process.');
          return;
        }
      
        // Using FFmpeg.js in the browser
        const { createFFmpeg, fetchFile } = FFmpeg;
        const ffmpeg = createFFmpeg({ log: true });
      
        try {
          if (!ffmpeg.isLoaded()) {
            await ffmpeg.load();
          }
        } catch (err) {
          alert('Error loading FFmpeg: ' + err);
          return;
        }
      
        // Write the input video file to FFmpeg's virtual FS
        try {
          // video.src might be an object URL, so fetch it as a blob
          const response = await fetch(video.src);
          const videoBlob = await response.blob();
          const videoFile = new Uint8Array(await videoBlob.arrayBuffer());
          ffmpeg.FS('writeFile', 'input.mp4', videoFile);
        } catch (err) {
          alert('Error reading video data: ' + err);
          return;
        }
      
        let filterGraphParts = [];
      
        // Build a 'delogo' filter for each region/circle
        blurRegions.forEach((region) => {
          region.circles.forEach((circle) => {
            // Approximate a bounding box around the circle
            const radius = circle.size / 2;
            const x = Math.max(0, circle.x - radius);
            const y = Math.max(0, circle.y - radius);
            const w = Math.min(overlayCanvas.width, radius * 2);
            const h = Math.min(overlayCanvas.height, radius * 2);
      
            // Round to integers for delogo
            const xInt = Math.round(x);
            const yInt = Math.round(y);
            const wInt = Math.round(w);
            const hInt = Math.round(h);
      
            // The times
            const start = region.start;
            const end = region.end;
      
            // Construct the partial filter using 'delogo'
            // band=10 is an example blur strength
            const blurCmd =
              `delogo=x=${xInt}:y=${yInt}:w=${wInt}:h=${hInt}:show=0:enable='between(t,${start},${end})'`;
      
            filterGraphParts.push(blurCmd);
          });
        });
      
        // Join all filters with commas
        const finalFilter = filterGraphParts.join(',');
        if (!finalFilter) {
          alert('No valid blur filters constructed.');
          return;
        }
      
        // Run FFmpeg with the delogo filters
        try {
            await ffmpeg.run(
                '-i', 'input.mp4',
                '-vf', finalFilter, // e.g. "delogo=...,delogo=..., ..."
                '-c:a', 'copy',
                'output.mp4'
              );
        } catch (err) {
          alert('FFmpeg run error: ' + err);
          return;
        }
      
        // Read the result and create a download link
        try {
          const data = ffmpeg.FS('readFile', 'output.mp4');
          const blob = new Blob([data.buffer], { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
      
          downloadLink.href = url;
          downloadLink.download = 'censored_video.mp4';
          downloadLink.style.display = 'block';
          downloadLink.textContent = 'Download Censored Video';
          downloadLink.click();
        } catch (err) {
          alert('Error reading output file: ' + err);
        }
      });
      