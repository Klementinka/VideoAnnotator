document.getElementById('addSubtitle').addEventListener('click', addSubtitle);

let subtitleTable = document.getElementById('subtitleTable').getElementsByTagName('tbody')[0];
let subtitles = [];
function addSubtitle() {
    let startTime = document.getElementById('startTime').value;
    let endTime = document.getElementById('endTime').value;
    let text = document.getElementById('subtitleText').value;

    if (startTime && endTime && text && validateTime(startTime) && validateTime(endTime)) {
        
        let startSeconds = timeToSeconds(startTime);
        let endSeconds = timeToSeconds(endTime);
        
        if (startSeconds >= endSeconds) {
            alert('Start time must be earlier than end time.');
            return;
        }
        
        for (let i = 0; i < subtitles.length; i++) {
            let existingSubtitle = subtitles[i];
            let existingStartSeconds = timeToSeconds(existingSubtitle.startTime);
            let existingEndSeconds = timeToSeconds(existingSubtitle.endTime);
            
            if ((startSeconds >= existingStartSeconds && startSeconds < existingEndSeconds) || 
                (endSeconds > existingStartSeconds && endSeconds <= existingEndSeconds)) {
                alert('Subtitles cannot overlap. The start time or end time conflicts with an existing subtitle.');
                return;
            }
        }

        let existingSubtitleIndex = subtitles.findIndex(sub => sub.startTime === startTime);

        if (existingSubtitleIndex !== -1) {
            subtitles[existingSubtitleIndex] = { startTime, endTime, text };
        } else {
            subtitles.push({ startTime, endTime, text });
        }

        displaySubtitles();
    } else {
        alert('Please fill in all fields with valid times (MM:SS or M:SS).');
    }
}


function displaySubtitles() {
    let tableBody = subtitleTable;
    tableBody.innerHTML = ''; 

    subtitles.sort((a, b) => timeToSeconds(a.startTime) - timeToSeconds(b.startTime));

    subtitles.forEach((sub, index) => {
        let row = tableBody.insertRow();

        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);

        cell1.textContent = sub.startTime;
        cell2.textContent = sub.endTime;
        cell3.textContent = sub.text;

        cell1.contentEditable = true;
        cell2.contentEditable = true;
        cell3.contentEditable = true;

        cell1.addEventListener('input', () => {
            sub.startTime = cell1.textContent.trim();
        });

        cell2.addEventListener('input', () => {
            sub.endTime = cell2.textContent.trim(); 
        });

        cell3.addEventListener('input', () => {
            sub.text = cell3.textContent.trim(); 
        });
    });
}


function timeToSeconds(time) {
    let parts = time.split(':');
    return (+parts[0]) * 60 + (+parts[1]);
}

function validateTime(time) {
    const timeRegex = /^[0-9]?[0-9]:[0-5][0-9]$/;
        return timeRegex.test(time);
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
