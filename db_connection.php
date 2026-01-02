<?php
// Function to read .env file
function loadEnv($path) {
    if (!file_exists($path)) {
        throw new Exception(".env file not found");
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Load .env
try {
    loadEnv(__DIR__ . '/.env');
} catch (Exception $e) {
    die("Error: " . $e->getMessage());
}

$server = getenv('DB_HOST');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');
$database = getenv('DB_NAME');

$con = mysqli_connect($server, $user, $pass);
if(!$con){
    echo 'Server not connected';
}
$db = mysqli_select_db($con, $database);
if(!$db){
    echo 'Database not connected';
}
?>