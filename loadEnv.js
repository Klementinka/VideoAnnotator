function loadConfig() {
    fetch('http://localhost/VideoAnnotator/config.json')
        .then(response => response.json())
        .then(config => {
            window.config = config;

            console.log('API Key:', window.config.API_KEY);
            console.log('Client ID:', window.config.CLIENT_ID);
        })
        .catch(error => {
            console.error('Error loading config:', error);
        });
}

loadConfig();

console.log('loaded environment variables!')