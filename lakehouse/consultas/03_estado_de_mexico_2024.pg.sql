-- Municipios del Estado de México en 2024. En el lago lee plata en Iceberg: la
-- partición por ciclo y entidad descarta el resto de los archivos sin abrirlos.
SELECT right(m.cvemun, 3)::INT AS id_municipio, count(*) AS proyectos, sum(f.aprobado) AS aprobado
FROM warehouse.fact_proyecto_ciclo f
JOIN warehouse.dim_municipio m USING (municipio_key)
WHERE f.ciclo = 2024 AND f.id_entidad = 15
GROUP BY id_municipio
ORDER BY id_municipio;
