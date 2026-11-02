-- El municipio del capítulo, ya con registros reales.
SELECT ciclo, count(*) AS proyectos, sum(aprobado) AS aprobado, sum(pagado) AS pagado
FROM oro_proyecto_ciclo
WHERE cvemun = '15086'
GROUP BY ciclo
ORDER BY ciclo;
