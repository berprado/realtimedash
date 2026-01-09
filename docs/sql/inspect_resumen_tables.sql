-- Query to inspect the structure of tables used by 'vw_resumen_comandas_ultima_operacion'.
-- Since this view depends on 'comandas_v6', the underlying tables are the same.
-- We verify the structure of all dependencies to ensure the view's calculations (SUM, MAX) are valid.

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
    TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME IN (
        -- Dependencies of comandas_v6
        'bar_detalle_comanda_salida', 
        'bar_comanda', 
        'alm_producto', 
        'bar_combo_coctel', 
        'alm_categoria', 
        'parameter_table',
        -- The views themselves (optional, depending on DB permissions)
        'comandas_v6',
        'resumen_comandas_ultima_operacion'
    )
ORDER BY 
    TABLE_NAME, 
    ORDINAL_POSITION;
