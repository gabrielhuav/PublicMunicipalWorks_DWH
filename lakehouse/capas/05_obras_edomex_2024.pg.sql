-- Proyectos del Estado de México en el ciclo 2024, en el punto que reportó la dependencia
-- (el promedio de sus coordenadas dentro del país). Las marcas C1 a C4 piden revisar un
-- proyecto; no prueban una irregularidad. No incluye nombres de contratistas.
SELECT p.folio, p.nombre, p.clasificacion, p.estatus, m.cvemun,
       f.aprobado, f.pagado, f.pct_fisico, f.pct_financiero, f.n_contratos,
       f.c1_tipo AS c1, f.c2, f.c3, f.c4,
       round(f.lat::numeric, 5) AS lat, round(f.lon::numeric, 5) AS lon
FROM warehouse.fact_proyecto_ciclo f
JOIN warehouse.dim_proyecto_federal p USING (proyecto_key)
LEFT JOIN warehouse.dim_municipio m USING (municipio_key)
WHERE f.ciclo = 2024 AND f.id_entidad = 15
ORDER BY p.folio;
