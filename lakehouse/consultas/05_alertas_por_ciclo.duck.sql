-- Registros que cumplen cada criterio. Son una lista para revisar, no detecciones.
SELECT ciclo, count(*) AS proyectos,
       count(*) FILTER (WHERE c1_ciclo) AS c1_ciclo,
       count(*) FILTER (WHERE c1_tipo) AS c1_tipo,
       count(*) FILTER (WHERE c2) AS c2,
       count(*) FILTER (WHERE c3) AS c3,
       count(*) FILTER (WHERE c4) AS c4
FROM oro_alertas
GROUP BY ciclo
ORDER BY ciclo;
