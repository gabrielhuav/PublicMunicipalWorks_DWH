SELECT n.clasificacion, count(DISTINCT n.proyecto_key) AS proyectos
FROM warehouse.dim_proyecto_federal n
JOIN warehouse.dim_proyecto_federal p ON p.folio = n.folio AND p.version = n.version - 1
JOIN warehouse.fact_proyecto_ciclo f ON f.proyecto_key = n.proyecto_key
WHERE f.id_entidad = 15 AND n.estatus = 'Terminado' AND p.estatus = 'En Ejecución'
GROUP BY n.clasificacion
ORDER BY n.clasificacion;
