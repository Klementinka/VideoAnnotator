fetch('php/profile.php')
    .then(response => response.json())
    .then(data => {
        document.getElementById('username').textContent = data.username;
        document.getElementById('email').textContent = 'Email: ' + data.email;
    })
    .catch(error => {
        console.error('Error fetching profile data:', error);
        document.getElementById('username').textContent = 'Error';
        document.getElementById('email').textContent = 'Unable to load data';
    });