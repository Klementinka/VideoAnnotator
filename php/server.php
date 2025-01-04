<?php
// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "my_database"; // Replace with your database name

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL query to fetch all users
$sql = "SELECT id, name, email FROM users";
$result = $conn->query($sql);

$users = [];
if ($result->num_rows > 0) {
    // Fetch all users
    while($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
} else {
    $users = []; // No users found
}

$conn->close();

// Return the data as JSON
echo json_encode($users);
?>
