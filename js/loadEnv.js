function loadConfig() {
    const currentPath = window.location.pathname;
    const relativePath = currentPath.substring(0, currentPath.lastIndexOf('/')).substring(1);
    fetch(`http://localhost/${relativePath}/config.json`)
        .then(response => response.json())
        .then(config => {
            window.config = config;

        })
        .catch(error => {
            console.error('Error loading config:', error);
        });
}

loadConfig();
