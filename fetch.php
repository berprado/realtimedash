<?php
// fetch.php
// Live Monitor Endpoint
// Switched to Polling for better compatibility with local WAMP server (avoids blocking).

header('Content-Type: application/json');
header('Cache-Control: no-cache');

require_once 'db_connection.php';

$result = $con->query("SELECT * FROM comandas_v6 ORDER BY id DESC");

$data = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

echo json_encode($data);
?>