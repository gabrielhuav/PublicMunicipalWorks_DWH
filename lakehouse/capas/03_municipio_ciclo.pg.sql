-- Por municipio y ciclo: proyectos, montos y cuántos marca cada criterio. El pago por
-- habitante divide entre la población de 2020. `evaluados` cuenta los proyectos de inversión,
-- los únicos a los que se aplican los criterios.
SELECT m.cvemun, f.ciclo,
       count(*) AS proyectos,
       sum(f.aprobado) AS aprobado,
       sum(f.pagado) AS pagado,
       round(sum(f.pagado) / nullif(m.pobtot, 0), 2) AS pagado_hab,
       count(*) FILTER (WHERE f.es_fais) AS fais,
       count(*) FILTER (WHERE f.c1_tipo IS NOT NULL) AS evaluados,
       count(*) FILTER (WHERE f.c1_tipo) AS c1,
       count(*) FILTER (WHERE f.c2) AS c2,
       count(*) FILTER (WHERE f.c3) AS c3,
       count(*) FILTER (WHERE f.c4) AS c4
FROM warehouse.fact_proyecto_ciclo f
JOIN warehouse.dim_municipio m USING (municipio_key)
GROUP BY m.cvemun, m.pobtot, f.ciclo
ORDER BY m.cvemun, f.ciclo;
