document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('id')) {
        const overlay = document.getElementById('popup-overlay');
        overlay.style.display = 'block';

        document.getElementById('videoIdInput').focus();

        document.getElementById('submitEditIdButton').addEventListener('click', function () {
            const videoId = document.getElementById('videoIdInput').value;
            if (videoId) {
                params.set('id', videoId);
                window.location.search = params.toString();
                window.location.href = 'censor.html?' + params.toString();
            } else {
                alert('Video id is required.');
            }
        });
    }
});