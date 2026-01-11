CREATE OR REPLACE VIEW vw_comanda_ultima_impresion AS
SELECT
    bci.id_comanda,
    bci.ind_estado_impresion
FROM bar_comanda_impresion bci
WHERE bci.id = (
    SELECT MAX(bci2.id)
    FROM bar_comanda_impresion bci2
    WHERE bci2.id_comanda = bci.id_comanda
);
