document.getElementById('exportButton').addEventListener('click', exportSubtitles);

function exportSubtitles() {
    const format = document.getElementById('exportType').value;
    if (subtitles.length === 0) {
        alert("No subtitles to export!");
        return;
    }

    let content = '';

    if (format === 'srt') {
        content = generateSRT();
    } else if (format === 'sub') {
        content = generateSUB();
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subtitles.${format}`;
    link.click();
}

function generateSRT() {
    let srtContent = '';
    subtitles.forEach((sub, index) => {
        srtContent += `${index + 1}\n`;
        srtContent += `${formatTimeSRT(sub.startTime)} --> ${formatTimeSRT(sub.endTime)}\n`;
        srtContent += `${sub.text}\n\n`;
    });
    return srtContent;
}

function generateSUB() {
    let subContent = '';
    subtitles.forEach((sub, index) => {
        subContent += `{${convertToFrames(sub.startTime)}}{${convertToFrames(sub.endTime)}}${sub.text}\n`;
    });
    return subContent;
}

function formatTimeSRT(time) {
    const [minutes, seconds] = time.split(':');
    return `${minutes}:${seconds},000`;
}

function convertToFrames(time) {
    const [minutes, seconds] = time.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds; 
    return Math.floor(totalSeconds * 25); 
}
