const video = document.getElementById('videoPlayer');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const subtitleTextInput = document.getElementById('subtitleText');
const subtitleTable = document.getElementById('subtitleTable').getElementsByTagName('tbody')[0];

let subtitles = []; 

document.getElementById('setStartTime').addEventListener('click', () => {
    startTimeInput.value = formatTime(video.currentTime);
});

document.getElementById('setEndTime').addEventListener('click', () => {
    endTimeInput.value = formatTime(video.currentTime);
});

document.getElementById('addSubtitle').addEventListener('click', () => {
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const text = subtitleTextInput.value;

    if (!startTime || !endTime || !text) {
        alert('Please fill out all fields before adding a subtitle.');
        return;
    }

    const existingIndex = subtitles.findIndex(sub => sub.startTime === startTime);
    if (existingIndex !== -1) {
        subtitles[existingIndex] = { startTime, endTime, text };
    } else {
        subtitles.push({ startTime, endTime, text });
    }

    displaySubtitles();
    clearInputs();
});

function formatTime(seconds) {
    const date = new Date(seconds * 1000);
    return date.toISOString().substr(11, 8); 
}

function displaySubtitles() {
    subtitleTable.innerHTML = '';
    subtitles.sort((a, b) => a.startTime.localeCompare(b.startTime));
    subtitles.forEach(sub => {
        const row = subtitleTable.insertRow();
        row.insertCell(0).textContent = sub.startTime;
        row.insertCell(1).textContent = sub.endTime;
        row.insertCell(2).textContent = sub.text;
    });
}

function clearInputs() {
    startTimeInput.value = '';
    endTimeInput.value = '';
    subtitleTextInput.value = '';
}
