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

    // Log the `response` object directly
console.log(response);

// Log specific properties of the `response` object
console.log("Status:", response.status); // HTTP status code (e.g., 200, 404)
console.log("Status Text:", response.statusText); // Text associated with the status (e.g., OK, Not Found)
console.log("Headers:", response.headers); // Headers object

// Log the response body as JSON (if the server response is in JSON format)

    const result = await response.json();
    console.log(result);

    if (result.success) {
        // Redirect to the main page
        window.location.href = "index.html";
    } else {
        // Show error message
        document.getElementById("error-message").textContent = result.message;
    }
});
