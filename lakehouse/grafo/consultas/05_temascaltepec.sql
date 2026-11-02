SELECT f.ciclo, count(*) AS proyectos, sum(f.pagado) AS pagado
FROM warehouse.fact_proyecto_ciclo f
JOIN warehouse.dim_municipio m USING (municipio_key)
WHERE m.cvemun = '15086'
GROUP BY f.ciclo
ORDER BY f.ciclo;
