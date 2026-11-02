-- Gasto por entidad y clasificación en 2024.
SELECT id_entidad, clasificacion, count(*) AS proyectos, sum(pagado) AS pagado
FROM oro_proyecto_ciclo
WHERE ciclo = 2024
GROUP BY id_entidad, clasificacion
ORDER BY id_entidad, clasificacion;
