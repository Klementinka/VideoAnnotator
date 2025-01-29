document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('id')) {
        const overlay = document.getElementById('popup-overlay');
        overlay.style.display = 'block';

        document.getElementById('videoIdInput').focus();

        document.getElementById('submitEditIdButton').addEventListener('click', function () {
            const videoId = document.getElementById('videoIdInput').value;
            if (videoId) {
                fetch(`/videos/${videoId}.mp4`, { method: 'HEAD' })
                    .then(response => {
                        if (!response.ok) {
                            if (localStorage.getItem('offlineMode') == 'true') {
                                alert('Video not available in offline mode.');
                                document.getElementById('videoIdInput').focus();
                            }
                        }
                        else {
                            params.set('id', videoId);
                            window.location.search = params.toString();
                            window.location.href = 'add_subtitles.html?' + params.toString();
                        }
                    });
            } else {
                alert('Video id is required.');
            }
        });
    }
});