-- Pago por habitante según el grado de rezago social, solo proyectos de inversión.
-- Suma de los promedios municipales: se divide entre municipios al reportar.
WITH t AS (
    SELECT m.cvemun, m.grado_rezago, round(sum(f.pagado) / m.pobtot, 2) AS por_habitante
    FROM warehouse.fact_proyecto_ciclo f
    JOIN warehouse.dim_proyecto_federal d USING (proyecto_key)
    JOIN warehouse.dim_municipio m USING (municipio_key)
    WHERE f.ciclo = 2023 AND d.categoria = 'Proyecto de inversión'
    GROUP BY m.cvemun, m.grado_rezago, m.pobtot
)
SELECT grado_rezago, count(*) AS municipios, sum(por_habitante) AS suma_por_habitante
FROM t
GROUP BY grado_rezago
ORDER BY grado_rezago;
