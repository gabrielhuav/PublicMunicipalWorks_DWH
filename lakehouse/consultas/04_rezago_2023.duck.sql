-- Pago por habitante según el grado de rezago social, solo proyectos de inversión.
-- Suma de los promedios municipales: se divide entre municipios al reportar.
SELECT grado_rezago, count(*) AS municipios, sum(pagado_por_habitante) AS suma_por_habitante
FROM oro_municipio_ciclo
WHERE ciclo = 2023
GROUP BY grado_rezago
ORDER BY grado_rezago;
