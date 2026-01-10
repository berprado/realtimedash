<?php
// scripts/migrate_v7.php
// Script to migrate database to support comandas_v7

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

    // Make idempotent: CREATE VIEW -> CREATE OR REPLACE VIEW
    // This allows re-running the script without "View already exists" errors.
    $sql = preg_replace('/^CREATE\s+VIEW/i', 'CREATE OR REPLACE VIEW', trim($sql));
    
    echo "Executing SQL from " . basename($filepath) . "...\n";
    
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

echo "Starting Migration to comandas_v7...\n";
echo "DB: " . $database . "\n\n";

// 1. Create Helper View
$viewHelper = __DIR__ . '/../docs/sql/vw_comanda_ultima_impresion.sql';
if (!runSqlFile($con, $viewHelper)) {
    echo "Migration Failed at step 1.\n";
    exit(1);
}

// 2. Create Main View
$viewMain = __DIR__ . '/../docs/sql/comandas_v7.sql';
if (!runSqlFile($con, $viewMain)) {
    echo "Migration Failed at step 2.\n";
    exit(1);
}

echo "Migration Successful!\n";
?>
