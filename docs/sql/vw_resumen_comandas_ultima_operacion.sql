CREATE OR REPLACE
	DEFINER = 'root'@'localhost'
VIEW adminerp.resumen_comandas_ultima_operacion
AS
	SELECT
	        `cv6`.`id_producto_combo` AS `id_producto_combo`,
	        `cv6`.`nombre`            AS `nombre`,
	        -- `cv6`.`descripcion`       AS `descripcion`, -- Optional, removing to reduce group by complexity if not needed
	        `cv6`.`categoria`         AS `categoria`,
	        `cv6`.`id_operacion`      AS `id_operacion`,
            
            -- METRICAS DE VENTA
	        SUM((CASE
	                WHEN (`cv6`.`tipo_salida` = 'VENTA')
	                  THEN `cv6`.`cantidad`
	                ELSE 0
	        END))                     AS `cantidad_venta`,
            
	        MAX((CASE
	                WHEN (`cv6`.`tipo_salida` = 'VENTA')
	                  THEN `cv6`.`precio_venta`
	                ELSE 0
	        END))                     AS `precio_unitario`, -- Simplificado a MAX precio encontrado
            
	        SUM((CASE
	                WHEN (`cv6`.`tipo_salida` = 'VENTA')
	                  THEN `cv6`.`sub_total`
	                ELSE 0
	        END))                     AS `monto_venta`,

            -- METRICAS DE CORTESIA
	        SUM((CASE
	                WHEN (`cv6`.`tipo_salida` = 'CORTESIA')
	                  THEN `cv6`.`cantidad`
	                ELSE 0
	        END))                     AS `cantidad_cortesia`,
            
	        SUM((CASE
	                WHEN (`cv6`.`tipo_salida` = 'CORTESIA')
	                  THEN COALESCE(`cv6`.`cor_subtotal_anterior`, (`cv6`.`precio_venta` * `cv6`.`cantidad`))
	                ELSE 0
	        END))                     AS `monto_cortesia`

	FROM
	        `comandas_v6` `cv6`
	WHERE
	        (
                -- Filtro 1: Solo la ultima operacion (Igual que el dashboard)
                (`cv6`.`id_operacion` = (SELECT MAX(`bar_comanda`.`id_operacion`) FROM `bar_comanda`))
                
                AND 
                -- Filtro 2: Consistencia con Dashboard (PROCESADO)
                (`cv6`.`estado_comanda` = 'PROCESADO')
	        )
	GROUP BY
	        `cv6`.`id_producto_combo`,
	        `cv6`.`nombre`,
	        `cv6`.`categoria`,
	        `cv6`.`id_operacion`;
