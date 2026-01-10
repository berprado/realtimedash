<?php
// scripts/migrate_resumen_v7.php
// Script to migrate database to support resumen_comandas_ultima_operacion_v7

require_once __DIR__ . '/../db_connection.php';

function runSqlFile($con, $filepath) {
    if (!file_exists($filepath)) {
        echo "Error: File not found: $filepath\n";
        return false;
    }

    $sql = file_get_contents($filepath);
    if (!$sql) {
        echo "Error: Could not read file: $filepath\n";
        return false;
    }

    // Strip DEFINER clause
    $sql = preg_replace('/DEFINER\s*=\s*\S+@\S+\s*/', '', $sql);
    $sql = preg_replace('/DEFINER=\S+@\S+\s*/', '', $sql);

    // Make idempotent: CREATE OR REPLACE (matches the file content generally, but ensuring)
    // The file already has CREATE OR REPLACE, so just running it is fine.
    
    echo "Executing SQL from " . basename($filepath) . "...\n";
    echo "DB: " . $database . "\n\n";
    
    // Attempt to execute.
    if ($con->query($sql) === TRUE) {
        echo "Success executing " . basename($filepath) . "\n\n";
        return true;
    } else {
        echo "Error executing " . basename($filepath) . ":\n";
        echo $con->error . "\n\n";
        return false;
    }
}

echo "Starting Update to resumen_comandas_ultima_operacion_v7...\n";

// 1. Create Resumen View v7
$viewResumen = __DIR__ . '/../docs/sql/vw_resumen_comandas_ultima_operacion_v7.sql';

if (!runSqlFile($con, $viewResumen)) {
    echo "Migration Failed.\n";
    exit(1);
}

echo "Migration Successful! View 'resumen_comandas_ultima_operacion_v7' created.\n";
?>
