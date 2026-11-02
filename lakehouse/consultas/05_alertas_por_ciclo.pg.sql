-- Registros que cumplen cada criterio. Son una lista para revisar, no detecciones.
SELECT f.ciclo, count(*) AS proyectos,
       count(*) FILTER (WHERE f.c1_ciclo) AS c1_ciclo,
       count(*) FILTER (WHERE f.c1_tipo) AS c1_tipo,
       count(*) FILTER (WHERE f.c2) AS c2,
       count(*) FILTER (WHERE f.c3) AS c3,
       count(*) FILTER (WHERE f.c4) AS c4
FROM warehouse.fact_proyecto_ciclo f
JOIN warehouse.dim_proyecto_federal d USING (proyecto_key)
WHERE d.categoria = 'Proyecto de inversión'
GROUP BY f.ciclo
ORDER BY f.ciclo;
