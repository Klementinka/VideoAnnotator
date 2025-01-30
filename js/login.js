document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault(); 

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("php/login.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    });

    const result = await response.json();

    if (result.success) {
        if (localStorage.getItem('offlineMode') === 'false') {
            localStorage.setItem('offlineMode', 'true');
        }
        localStorage.setItem('access_token', '');
        window.location.href = "index.html";
    } else {
        document.getElementById("error-message").textContent = result.message;
    }
});