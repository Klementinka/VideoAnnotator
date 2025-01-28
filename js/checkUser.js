document.addEventListener('DOMContentLoaded', (event) => {
    fetch('./php/fetchActiveUser.php')
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                window.location.href = './login.html';
            }
        })
        .catch(error => console.error('Error fetching active user:', error));
});