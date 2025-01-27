document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent default form submission

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
        // Redirect to the main page
        window.location.href = "index.html";
    } else {
        // Show error message
        document.getElementById("error-message").textContent = result.message;
    }
});