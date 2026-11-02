-- Proyectos, aprobado y pagado por ciclo, con los montos ya limpios.
SELECT ciclo, count(*) AS proyectos, sum(aprobado) AS aprobado, sum(pagado) AS pagado
FROM warehouse.fact_proyecto_ciclo
GROUP BY ciclo
ORDER BY ciclo;
