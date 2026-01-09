CREATE 
	DEFINER = 'root'@'localhost'
VIEW adminerp.resumen_comandas_ultima_operacion
AS
	SELECT
	        `cv6`.`id_producto_combo` AS `id_producto_combo`,
	        `cv6`.`nombre`            AS `nombre`,
	        `cv6`.`descripcion`       AS `descripcion`,
	        `cv6`.`categoria`         AS `categoria`,
	        `cv6`.`id_operacion`      AS `id_operacion`,
	        SUM((CASE
	                WHEN (`cv6`.`tipo_salida` = 'VENTA')
	                  THEN
	                  `cv6`.`cantidad`
	                ELSE
	                0
	        END))                     AS `cantidad_venta`,
	        MAX((CASE
	                WHEN (`cv6`.`tipo_salida` = 'VENTA')
	                  THEN
	                  `cv6`.`precio_venta`
	                ELSE
	                NULL
	        END))                     AS `precio_venta`,
	        SUM((CASE
	                WHEN (`cv6`.`tipo_salida` = 'VENTA')
	                  THEN
	                  `cv6`.`sub_total`
	                ELSE
	                0
	        END))                     AS `monto_venta`,
	        SUM((CASE
	                WHEN (`cv6`.`tipo_salida` = 'CORTESIA')
	                  THEN
	                  `cv6`.`cantidad`
	                ELSE
	                0
	        END))                     AS `cantidad_cortesia`,
	        SUM((CASE
	                WHEN (`cv6`.`tipo_salida` = 'CORTESIA')
	                  THEN
	                  COALESCE(
	                    `cv6`.`cor_subtotal_anterior`,
	                    (`cv6`.`precio_venta` * `cv6`.`cantidad`))
	                ELSE
	                0
	        END))                     AS `monto_cortesia`
	FROM
	        `comandas_v6` `cv6`
	WHERE
	        (       (`cv6`.`estado_impresion` = 'IMPRESO')
	                AND (`cv6`.`id_operacion` = (SELECT
	                            MAX(`bar_comanda`.`id_operacion`)
	                    FROM
	                            `bar_comanda`)
	                ))
	GROUP BY
	        `cv6`.`id_producto_combo`,
	        `cv6`.`nombre`,
	        `cv6`.`descripcion`,
	        `cv6`.`categoria`,
	        `cv6`.`id_operacion`;