const fontSizeInput = document.getElementById('fontSize');
const fontColorInput = document.getElementById('fontColor');
const fontWeightInput = document.getElementById('fontWeight');
const videoSection = document.querySelector('.video-section');

const subtitleOverlay = document.createElement('section');
subtitleOverlay.classList.add('subtitle-overlay'); 

videoSection.appendChild(subtitleOverlay);

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
        
        subtitleOverlay.style.bottom = '40px'; 
        subtitleOverlay.style.left = '50%';
        subtitleOverlay.style.transform = 'translateX(-50%)'; 
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
