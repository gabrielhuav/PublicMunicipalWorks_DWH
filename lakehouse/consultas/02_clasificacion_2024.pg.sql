-- Gasto por entidad y clasificación en 2024.
SELECT f.id_entidad, d.clasificacion, count(*) AS proyectos, sum(f.pagado) AS pagado
FROM warehouse.fact_proyecto_ciclo f
JOIN warehouse.dim_proyecto_federal d USING (proyecto_key)
WHERE f.ciclo = 2024
GROUP BY f.id_entidad, d.clasificacion
ORDER BY f.id_entidad, d.clasificacion;
