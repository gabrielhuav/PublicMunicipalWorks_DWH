-- Municipios del Estado de México en 2024. En el lago lee plata en Iceberg: la
-- partición por ciclo y entidad descarta el resto de los archivos sin abrirlos.
SELECT id_municipio, count(*) AS proyectos, sum(aprobado) AS aprobado
FROM plata_proyectos
WHERE ciclo = 2024 AND id_entidad = 15 AND id_municipio > 0
GROUP BY id_municipio
ORDER BY id_municipio;
