<?php
// fetch_summary.php
// Endpoint to fetch aggregated product data from 'resumen_comandas_ultima_operacion' view.
// Standard JSON API (Non-blocking).

header('Content-Type: application/json');
header('Cache-Control: no-cache');

require_once 'db_connection.php';

// Fetch data from the aligned view
$sql = "SELECT 
            id_producto_combo, 
            nombre, 
            categoria, 
            cantidad_venta, 
            precio_unitario, 
            monto_venta, 
            cantidad_cortesia, 
            monto_cortesia 
        FROM resumen_comandas_ultima_operacion_v7 
        ORDER BY nombre ASC";

$result = mysqli_query($con, $sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => mysqli_error($con)]);
    exit;
}

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode($data);
?>
