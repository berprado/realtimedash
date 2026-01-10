<?php
// fetch_v7_test.php
// Live Monitor Endpoint Test for comandas_v7

header('Content-Type: application/json');
header('Cache-Control: no-cache');

require_once 'db_connection.php';

$result = $con->query("SELECT * FROM comandas_v7 ORDER BY id DESC LIMIT 5");

$data = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
} else {
	if ($con->error) {
		$data['error'] = $con->error;
	}
}

echo json_encode($data, JSON_PRETTY_PRINT);
?>
