-- Proyectos de un estado en el ciclo 2024, en el punto que reportó la dependencia (el promedio
-- de sus coordenadas dentro del país), con sus fechas de inicio y término. Las marcas C1 a C4
-- piden revisar un proyecto; no prueban una irregularidad. No incluye nombres de contratistas.
-- Se corre una vez por estado: {entidad} es su clave.
SELECT o.folio, o.nombre, o.clasificacion, o.estatus, o.cvemun,
       o.aprobado, o.pagado, o.pct_fisico, o.pct_financiero, o.n_contratos,
       a.c1_tipo AS c1, a.c2, a.c3, a.c4,
       o.fecha_inicio, o.fecha_termino,
       round(o.lat, 5) AS lat, round(o.lon, 5) AS lon
FROM oro_proyecto_ciclo o
LEFT JOIN oro_alertas a ON a.folio = o.folio AND a.ciclo = o.ciclo
WHERE o.ciclo = 2024 AND o.id_entidad = {entidad} AND o.lat IS NOT NULL
ORDER BY o.folio;
