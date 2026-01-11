<?php
// debug_impresion_v2.php
require_once 'db_connection.php';
header('Content-Type: text/plain');

$test_id = 31;
echo "=== Debug V2: Why is JOIN failing? ===\n\n";

// 1. Direct fetch from parameter_table
$sql = "SELECT id, nombre, HEX(id) as hex_id FROM parameter_table WHERE id = $test_id";
$res = $con->query($sql);
echo "1. Querying parameter_table for ID $test_id:\n";
if ($res && $res->num_rows > 0) {
    $row = $res->fetch_assoc();
    print_r($row);
} else {
    echo "NO RECORD FOUND for ID $test_id in parameter_table.\n";
}

// 2. Direct fetch from VIEW vw_comanda_ultima_impresion
$comanda_id = 63889;
$sql2 = "SELECT ind_estado_impresion FROM vw_comanda_ultima_impresion WHERE id_comanda = $comanda_id";
$res2 = $con->query($sql2);
echo "\n2. ID from View for Comanda $comanda_id:\n";
$view_value = null;
if ($res2 && $res2->num_rows > 0) {
    $row = $res2->fetch_assoc();
    $view_value = $row['ind_estado_impresion'];
    echo "Value: " . $view_value . " (Type: " . gettype($view_value) . ")\n";
} else {
    echo "No matching record found in view for Comanda $comanda_id.\n";
}

// 3. Test Type Mismatch?
if ($view_value !== null) {
    echo "\n3. Testing Mismatch:\n";
    echo "Is '$view_value' == $test_id? " . ($view_value == $test_id ? "YES" : "NO") . "\n";
    echo "Is '$view_value' === $test_id? " . ($view_value === $test_id ? "YES" : "NO") . "\n";
}

?>
