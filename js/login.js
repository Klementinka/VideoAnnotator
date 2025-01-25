document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        // Send login credentials to the server
        const response = await fetch('php/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                username: username,
                password: password,
            }),
        });

        if (response.ok) {
            const result = await response.json();

            if (result.success) {
                // If Google authentication is required, redirect to the Google auth URL
                if (result.authUrl) {
                    window.location.href = result.authUrl;
                } else {
                    // Otherwise, redirect to the application dashboard
                    window.location.href = 'http://localhost/VideoAnnotator/index.html?token=' + result.token;
                }
            } else {
                errorMessage.textContent = result.message || 'Login failed. Please try again.';
            }
        } else {
            errorMessage.textContent = 'Error connecting to the server. Please try again later.';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An unexpected error occurred. Please try again.';
    }
});
