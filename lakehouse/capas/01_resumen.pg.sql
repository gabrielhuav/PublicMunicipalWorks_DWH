-- Resumen por ciclo de lo cargado en el almacén: entidades, municipios, proyectos, montos y
-- cuántos proyectos marca cada criterio. Los criterios solo se calculan para proyectos de
-- inversión; marcan qué revisar y no prueban una irregularidad.
SELECT f.ciclo,
       count(DISTINCT f.id_entidad) AS entidades,
       count(DISTINCT f.municipio_key) AS municipios,
       count(*) AS proyectos,
       sum(f.aprobado) AS aprobado,
       sum(f.pagado) AS pagado,
       count(*) FILTER (WHERE f.es_fais) AS fais,
       count(*) FILTER (WHERE f.c1_tipo IS NOT NULL) AS evaluados,
       count(*) FILTER (WHERE f.c1_tipo) AS c1,
       count(*) FILTER (WHERE f.c2) AS c2,
       count(*) FILTER (WHERE f.c3) AS c3,
       count(*) FILTER (WHERE f.c4) AS c4
FROM warehouse.fact_proyecto_ciclo f
GROUP BY f.ciclo
ORDER BY f.ciclo;
