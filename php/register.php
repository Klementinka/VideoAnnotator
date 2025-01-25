<?php
// Establish a connection to the database
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "videoannotator";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle POST request
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Validate inputs
    if (!empty($_POST['username']) && !empty($_POST['email']) && !empty($_POST['password'])) {
        $username = $conn->real_escape_string($_POST['username']);
        $email = $conn->real_escape_string($_POST['email']);
        $password = $conn->real_escape_string($_POST['password']);

        // Check if username or email already exists
        $checkUserQuery = "SELECT * FROM users WHERE username = '$username' OR email = '$email'";
        $checkResult = $conn->query($checkUserQuery);

        if ($checkResult->num_rows > 0) {
            // Username or email already exists
            echo "<script>
                alert('Username or email already exists.');
                window.location.href='../register.html';
                </script>";
        } else {
            // Insert new user into the database
            $insertQuery = "INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$password')";
            if ($conn->query($insertQuery) === TRUE) {
                // Redirect to the login page upon successful registration
                echo "<script>
                    alert('Registration successful! Please log in.');
                    window.location.href='../login.html';
                    </script>";
            } else {
                echo "Error: " . $insertQuery . "<br>" . $conn->error;
            }
        }
    } else {
        echo "<script>
            alert('All fields are required.');
            window.location.href='../register.html';
            </script>";
    }
}

$conn->close();
?>
