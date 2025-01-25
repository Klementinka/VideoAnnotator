document.getElementById('addSubtitle').addEventListener('click', addSubtitle);

let subtitleTable = document.getElementById('subtitleTable').getElementsByTagName('tbody')[0];
let subtitles = [];

function addSubtitle() {
    let startTime = document.getElementById('startTime').value;
    let endTime = document.getElementById('endTime').value;
    let text = document.getElementById('subtitleText').value;

    if (startTime && endTime && text) {
        let existingSubtitleIndex = subtitles.findIndex(sub => sub.startTime === startTime);

        if (existingSubtitleIndex !== -1) {
            subtitles[existingSubtitleIndex] = { startTime, endTime, text };
        } else {
            subtitles.push({ startTime, endTime, text });
        }
        displaySubtitles();
    } else {
        alert('Please fill in all fields.');
    }
}


function displaySubtitles() {
    let tableBody = document.getElementById('subtitleTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    subtitles.sort((a, b) => a.startTime.localeCompare(b.startTime));

    subtitles.forEach(sub => {
        let row = tableBody.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);

        cell1.innerHTML = sub.startTime;
        cell2.innerHTML = sub.endTime;
        cell3.innerHTML = sub.text;
    });
}


function timeToSeconds(time) {
    let parts = time.split(':');
    return (+parts[0]) * 3600 + (+parts[1]) * 60 + (+parts[2]);
}


function exportSubtitles() {
    let subtitleData = JSON.stringify(subtitles);
    let blob = new Blob([subtitleData], { type: 'application/json' });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'subtitles.json';
    a.click();
}

function importSubtitles(event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let data = JSON.parse(e.target.result);
            subtitles = data;
            displaySubtitles();
        };
        reader.readAsText(file);
    }
}

function timeToSeconds(time) {
    let parts = time.split(':');
    return (+parts[0]) * 3600 + (+parts[1]) * 60 + (+parts[2]);
}
