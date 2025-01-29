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

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

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
    const currentTime = video.currentTime;
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const milliseconds = Math.floor((currentTime % 1) * 1000);
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
    document.getElementById('start-time').value = formattedTime;
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

const canvas = document.getElementById('canvas');
const canvas2 = document.getElementById('canvas2');
const ctx = canvas.getContext('2d');
const ctx2 = canvas2.getContext('2d');
const processButton = document.getElementById('process');
const downloadLink = document.getElementById('download');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');

processButton.onclick = async function () {

    let startTime = startTimeInput.value.split(':').map(parseFloat);
    startTime = startTime[0] * 60 + startTime[1] + startTime[2] / 1000;
    let endTime = endTimeInput.value.split(':').map(parseFloat);
    endTime = endTime[0] * 60 + endTime[1] + endTime[2] / 1000;

    const timesTable = document.getElementById('timestamps-table');
    const startTimes = [];
    const endTimes = [];
    const ids = [];
    for (let row of timesTable.rows) {
        const cell0 = row.cells[0];
        const cell1 = row.cells[1];
        const cell2 = row.cells[2];
        if (cell2) {
            let endTime = cell2.textContent.split(':').map(parseFloat);
            endTime = endTime[0] * 60 + endTime[1] + endTime[2] / 1000;
            if (!isNaN(endTime)) {
                endTimes.push(endTime);
            }
        }
        if (cell1) {
            let startTime = cell1.textContent.split(':').map(parseFloat);
            startTime = startTime[0] * 60 + startTime[1] + startTime[2] / 1000;
            if (!isNaN(startTime)) {
                startTimes.push(startTime);
            }
        }
        if (cell0) {
            if (cell0.textContent === '1' || cell0.textContent === '2')
                ids.push(cell0.textContent);
        }
    }

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
        downloadLink.download = `${getQueryParam('id')}-${getQueryParam('id2')}_cut.webm`;
        // downloadLink.style.display = 'block';
        downloadLink.textContent = 'Download New Video';
        downloadLink.click();
    };

    mediaRecorder.start();

    const frameInterval = Math.floor(video.fps || 30);
    const frameInterval2 = Math.floor(video2.fps || 30);

    for (let i = 0; i < startTimes.length; i++) {
        for (let time = Math.max(0, startTimes[i]); time < Math.min(endTimes[i], video.duration); time += (ids[i] === '1' ? 1 / frameInterval : 1 / frameInterval2)) {
            if (ids[i] === '1') {
                video.currentTime = time;
                await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            }
            else {
                video2.currentTime = time;
                await new Promise(resolve => video2.addEventListener('seeked', resolve, { once: true }));
                ctx.drawImage(video2, 0, 0, canvas.width, canvas.height);
            }
        }
    }

    mediaRecorder.stop();
};

const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const videoPlayer = document.getElementById('videoPlayer');

speedSlider.addEventListener('input', function () {
    const speed = speedSlider.value;
    videoPlayer.playbackRate = speed;
    speedValue.textContent = speed + 'x';
});

document.getElementById('play-button').onclick = function () {
    const video = document.getElementById('videoPlayer');
    video.play();
};

document.getElementById('pause-button').onclick = function () {
    const video = document.getElementById('videoPlayer');
    video.pause();
};

document.getElementById('clear-table-button').onclick = function () {
    const table = document.getElementById('timestamps-table').getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    document.getElementById('timestamps-table').style.display = "none";
    document.getElementById('process').style.display = "none";
    document.getElementById('clear-table-button').style.display = 'none';
};

// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------


const video2 = document.getElementById('videoPlayer2');

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.getElementById('videoPlayer2').addEventListener('timeupdate', function () {
    const videoPlayer = document.getElementById('videoPlayer2');
    const progressBar = document.getElementById('progress-bar2');
    const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    progressBar.style.width = percentage + '%';
});

document.getElementById('progress-container2').addEventListener('click', function (e) {
    const progressContainer = document.getElementById('progress-container2');
    const videoPlayer2 = document.getElementById('videoPlayer2');
    const rect = progressContainer.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / progressContainer.offsetWidth;
    videoPlayer2.currentTime = percentage * videoPlayer2.duration;
});

document.getElementById('set-end-time-button2').addEventListener('click', function () {
    const currentTime = video2.currentTime;
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const milliseconds = Math.floor((currentTime % 1) * 1000);
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
    document.getElementById('end-time2').value = formattedTime;
});

document.getElementById('set-start-time-button2').addEventListener('click', function () {
    const currentTime = video2.currentTime;
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const milliseconds = Math.floor((currentTime % 1) * 1000);
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
    document.getElementById('start-time2').value = formattedTime;
});

document.getElementById('next-frame-button2').onclick = function () {
    const video = document.getElementById('videoPlayer2');
    const frameRate = 30;
    video.currentTime += 1 / frameRate;
};

document.getElementById('previous-frame-button2').onclick = function () {
    const video = document.getElementById('videoPlayer2');
    const frameRate = 30;
    video.currentTime -= 1 / frameRate;
};

document.getElementById('screenshot-btn2').onclick = function () {
    const video = document.getElementById('videoPlayer2');
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

const startTimeInput2 = document.getElementById('start-time');
const endTimeInput2 = document.getElementById('end-time');

const speedSlider2 = document.getElementById('speed-slider2');
const speedValue2 = document.getElementById('speed-value2');
const videoPlayer2 = document.getElementById('videoPlayer2');

speedSlider2.addEventListener('input', function () {
    const speed = speedSlider2.value;
    videoPlayer2.playbackRate = speed;
    speedValue2.textContent = speed + 'x';
});

document.getElementById('play-button2').onclick = function () {
    const video = document.getElementById('videoPlayer2');
    video.play();
};

document.getElementById('pause-button2').onclick = function () {
    const video = document.getElementById('videoPlayer2');
    video.pause();
};

document.getElementById('add-video').onclick = function () {
    loadSecondVideo();
    document.getElementById('secondVideo').style.display = 'flex';
}

document.getElementById('save-timestamp2').onclick = function () {
    const startTime = document.getElementById('start-time2').value;
    const endTime = document.getElementById('end-time2').value;

    if (startTime && endTime) {
        document.getElementById('process').style.display = 'block';
        document.getElementById('clear-table-button').style.display = 'block';
        const tableElement = document.getElementById('timestamps-table');
        tableElement.style.display = 'block';
        const table = tableElement.getElementsByTagName('tbody')[0];
        const newRow = table.insertRow();

        const id = newRow.insertCell(0);
        const startCell = newRow.insertCell(1);
        const endCell = newRow.insertCell(2);

        id.textContent = '2';
        startCell.textContent = startTime;
        endCell.textContent = endTime;

        document.getElementById('start-time2').value = '';
        document.getElementById('end-time2').value = '';
    } else {
        alert('Please enter both start and end times.');
    }
};