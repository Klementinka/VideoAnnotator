document.getElementById('register-form').addEventListener('submit', function (e) {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Simple validation
    if (username.length < 3) {
        e.preventDefault();
        document.getElementById("error-message").textContent = "Username must be at least 3 characters long";
        return;
    }
    if (!email.includes('@')) {
        e.preventDefault();
        document.getElementById("error-message").textContent = "Please enter a valid email address.";
        return;
    }
    if (password.length < 6) {
        e.preventDefault();
        document.getElementById("error-message").textContent = "Password must be at least 6 characters long.";
        return;
    }
});
