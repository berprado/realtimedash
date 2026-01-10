CREATE OR REPLACE
	DEFINER = 'root'@'localhost'
VIEW adminerp.resumen_comandas_ultima_operacion_v7
AS
	SELECT
	        `cv7`.`id_producto_combo` AS `id_producto_combo`,
	        `cv7`.`nombre`            AS `nombre`,
	        `cv7`.`categoria`         AS `categoria`,
	        `cv7`.`id_operacion`      AS `id_operacion`,
            
            -- METRICAS DE VENTA
	        SUM((CASE
	                WHEN (`cv7`.`tipo_salida` = 'VENTA')
	                  THEN `cv7`.`cantidad`
	                ELSE 0
	        END))                     AS `cantidad_venta`,
            
	        MAX((CASE
	                WHEN (`cv7`.`tipo_salida` = 'VENTA')
	                  THEN `cv7`.`precio_venta`
	                ELSE 0
	        END))                     AS `precio_unitario`,
            
	        SUM((CASE
	                WHEN (`cv7`.`tipo_salida` = 'VENTA')
	                  THEN `cv7`.`sub_total`
	                ELSE 0
	        END))                     AS `monto_venta`,

            -- METRICAS DE CORTESIA
	        SUM((CASE
	                WHEN (`cv7`.`tipo_salida` = 'CORTESIA')
	                  THEN `cv7`.`cantidad`
	                ELSE 0
	        END))                     AS `cantidad_cortesia`,
            
	        SUM((CASE
	                WHEN (`cv7`.`tipo_salida` = 'CORTESIA')
	                  THEN COALESCE(`cv7`.`cor_subtotal_anterior`, (`cv7`.`precio_venta` * `cv7`.`cantidad`))
	                ELSE 0
	        END))                     AS `monto_cortesia`

	FROM
	        `comandas_v7` `cv7`
	WHERE
	        (
                -- Filtro 1: Solo la ultima operacion
                (`cv7`.`id_operacion` = (SELECT MAX(`bar_comanda`.`id_operacion`) FROM `bar_comanda`))
                
                AND 
                -- Filtro 2: Consistencia con Dashboard (PROCESADO)
                (`cv7`.`estado_comanda` = 'PROCESADO')
	        )
	GROUP BY
	        `cv7`.`id_producto_combo`,
	        `cv7`.`nombre`,
	        `cv7`.`categoria`,
	        `cv7`.`id_operacion`;
