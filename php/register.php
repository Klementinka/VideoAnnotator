<?php

$config = json_decode(file_get_contents(__DIR__ . '/../config.json'), true);

$servername = $config['db_host'];
$dbname = $config['db_name'];
$username = $config['db_user'];
$password = $config['db_pass'];

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (!empty($_POST['username']) && !empty($_POST['email']) && !empty($_POST['password'])) {
        $username = $conn->real_escape_string($_POST['username']);
        $email = $conn->real_escape_string($_POST['email']);
        $password = $_POST['password'];

        $checkUserQuery = "SELECT * FROM users WHERE username = '$username' OR email = '$email'";
        $checkResult = $conn->query($checkUserQuery);

        if ($checkResult->num_rows > 0) {
            // Username or email already exists
            echo "<script>
                alert('Username or email already exists.');
                window.location.href='../register.html';
                </script>";
        } else {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            $insertQuery = "INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$hashedPassword')";
            if ($conn->query($insertQuery) === TRUE) {
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
