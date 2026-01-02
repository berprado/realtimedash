<?php
error_reporting(0);
// make is suitable for SSE
header("Cache-Control: no-store");
header("Content-Type: text/event-stream");
// make connection with database
include("db_connection.php");

// lets continue to check data in database with loop
$p = '';
while(true){
// now fetch data from database
$result = $con->query("SELECT
dcs.*,
c.id_operacion,
COALESCE(p.nombre, cc.nombre) AS nombre,
COALESCE(dcs.id_producto, dcs.id_bar_combo_coctel) AS id_producto_combo,
c.tipo_salida,
c.estado_comanda,
c.estado_impresion,
cc.codigo
FROM bar_detalle_comanda_salida dcs
INNER JOIN bar_comanda c ON dcs.id_comanda = c.id
LEFT OUTER JOIN alm_producto p ON dcs.id_producto = p.id
LEFT OUTER JOIN bar_combo_coctel cc ON dcs.id_bar_combo_coctel = cc.id
WHERE c.id_operacion = (
SELECT MAX(id_operacion) FROM bar_comanda
) ORDER BY dcs.id_comanda DESC;");
$r = array();
if($result->num_rows > 0){
    while($row = $result-> fetch_assoc()){
        // get all data in json from
        $r[] = $row;
    }
}
$n = json_encode($r);
if(strcmp($p, $n) !== 0){
    // here data will shown on change
    echo "data:" . $n . "\n\n";
    $p = $n;
}
// here data is shown each time
// but we need data when change
// mean when data add, update or delete then show only

// this will show data even the loading is not completed
ob_end_flush();
flush();

// sleep process for 1 sec
sleep(1);
// but still data will not show
}
?>