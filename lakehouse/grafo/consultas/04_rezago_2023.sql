SELECT m.grado_rezago AS grado, count(DISTINCT m.cvemun) AS municipios, sum(f.pagado) AS pagado
FROM warehouse.fact_proyecto_ciclo f
JOIN warehouse.dim_municipio m USING (municipio_key)
WHERE f.ciclo = 2023 AND f.id_entidad = 15 AND f.pagado IS NOT NULL
GROUP BY m.grado_rezago
ORDER BY m.grado_rezago;
