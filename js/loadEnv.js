function loadConfig() {
    fetch('http://localhost/VideoAnnotator/config.json')
        .then(response => response.json())
        .then(config => {
            window.config = config;

        })
        .catch(error => {
            console.error('Error loading config:', error);
        });
}

loadConfig();
