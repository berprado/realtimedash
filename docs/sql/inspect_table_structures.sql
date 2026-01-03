-- Query to inspect the structure of tables used by the 'comandas_v6' view.
-- Run this in your MySQL client (e.g., PHPMyAdmin, HeidiSQL, or CLI).

SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT, 
    COLUMN_KEY, 
    EXTRA,
    COLUMN_COMMENT
FROM 
    INFORMATION_SCHEMA.COLUMNS 
WHERE 
    -- Uses the currently selected database to ensure compatibility with both 'adminerp' and 'adminerp_copy'
    TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME IN (
        'bar_detalle_comanda_salida', 
        'bar_comanda', 
        'alm_producto', 
        'bar_combo_coctel', 
        'alm_categoria', 
        'parameter_table'
    )
ORDER BY 
    TABLE_NAME, 
    ORDINAL_POSITION;
