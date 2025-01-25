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

// Check if username and password are provided via POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (!empty($_POST['username']) && !empty($_POST['password'])) {
        $user = $conn->real_escape_string($_POST['username']);
        $pass = $conn->real_escape_string($_POST['password']);

        // Query to check if the user exists with the provided credentials
        $sql = "SELECT * FROM users WHERE username = '$user' AND password = '$pass'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            // Redirect to index.html upon successful login
            header("Location: ../index.html");
            exit(); // Ensure the script stops execution after redirecting
        } else {
            echo "Invalid username or password.";
        }
    } else {
        echo "Both username and password are required.";
    }
}

$conn->close();
?>
