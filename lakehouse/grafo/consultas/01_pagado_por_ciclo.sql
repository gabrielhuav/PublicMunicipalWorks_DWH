SELECT ciclo, count(*) AS proyectos, sum(pagado) AS pagado
FROM warehouse.fact_proyecto_ciclo
WHERE id_entidad = 15
GROUP BY ciclo
ORDER BY ciclo;
