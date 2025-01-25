document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    fetch('../VideoAnnotator/config.json')
        .then(response => response.json())
        .then(config => {
            const CLIENT_ID = config.CLIENT_ID;
            window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=http://localhost/VideoAnnotator/oauth2callback.php&response_type=code&scope=https://www.googleapis.com/auth/drive`;
        })
        .catch(error => {
            alert('Error fetching config on login: ' + error);
            window.history.back();
        });
});