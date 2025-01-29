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
                fetch(`/videos/${videoId}.mp4`, { method: 'HEAD' })
                    .then(response => {
                        console.log(response);
                        if (!response.ok) {
                            if (localStorage.getItem('offlineMode') == 'true') {
                                alert('Video not available in offline mode.');
                                document.getElementById('videoIdInput').focus();
                            }
                        }
                        else
                            window.location.href = 'edit.html?' + params.toString();
                    });
            } else {
                alert('Video id is required.');
            }
        });
    }
});