const fontSizeInput = document.getElementById('fontSize');
const fontColorInput = document.getElementById('fontColor');
const fontWeightInput = document.getElementById('fontWeight');

const subtitleOverlay = document.createElement('div');
subtitleOverlay.style.position = 'absolute';
subtitleOverlay.style.bottom = '10%';
subtitleOverlay.style.left = '10%';
subtitleOverlay.style.textAlign = 'center';
subtitleOverlay.style.zIndex = 1000;
document.body.appendChild(subtitleOverlay); 


function timeToSeconds(timeStr) {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
}

function updateGlobalStyles() {
    const currentTime = videoPlayer.currentTime;
    let subtitleToDisplay = null;

    subtitles.forEach(sub => {
        const startTimeInSeconds = timeToSeconds(sub.startTime);
        const endTimeInSeconds = timeToSeconds(sub.endTime);

        if (currentTime >= startTimeInSeconds && currentTime <= endTimeInSeconds) {
            subtitleToDisplay = sub; 
        }
    });

    if (subtitleToDisplay) {
        subtitleOverlay.textContent = subtitleToDisplay.text;

        subtitleOverlay.style.fontSize = `${subtitleToDisplay.fontSize || fontSizeInput.value}px`;
        subtitleOverlay.style.color = subtitleToDisplay.fontColor || fontColorInput.value;
        subtitleOverlay.style.fontWeight = subtitleToDisplay.fontWeight || fontWeightInput.value;
    } else {
        subtitleOverlay.textContent = ''; 
    }
}

fontSizeInput.addEventListener('input', () => updateGlobalStyles());
fontColorInput.addEventListener('input', () => updateGlobalStyles());
fontWeightInput.addEventListener('change', () => updateGlobalStyles());

const videoPlayer = document.getElementById('videoPlayer');
videoPlayer.addEventListener('timeupdate', () => {
    updateGlobalStyles(); 
});

updateGlobalStyles();
