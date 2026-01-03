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

$app_env = getenv('APP_ENV') ?: 'test'; // Default to test

if ($app_env === 'production') {
    $server = getenv('PROD_DB_HOST');
    $user = getenv('PROD_DB_USER');
    $pass = getenv('PROD_DB_PASS');
    $database = getenv('PROD_DB_NAME');
    $port = getenv('PROD_DB_PORT');
} else {
    // Default to Test/Local
    $server = getenv('TEST_DB_HOST');
    $user = getenv('TEST_DB_USER');
    $pass = getenv('TEST_DB_PASS');
    $database = getenv('TEST_DB_NAME');
    $port = getenv('TEST_DB_PORT') ?: 3306;
}

// Convert port to integer as mysqli expects an int
$port = (int)$port;

$con = mysqli_connect($server, $user, $pass, $database, $port);

if(!$con){
    // In SSE it's better not to echo plain text errors if possible, 
    // but sticking to original pattern for now with a slight improvement
    die('Server not connected: ' . mysqli_connect_error());
}

// Set charset to utf8 to handle accents and ñ correctly
mysqli_set_charset($con, "utf8");

// mysqli_connect with 4th param selects DB, but keeping the check if needed
// though strictly selecting it again is redundant if passed to connect.
// To be safe and minimal change:
if(!mysqli_select_db($con, $database)){
    echo 'Database not connected';
}
?>