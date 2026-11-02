-- Proyectos de 2024 como puntos del mapa, un archivo por estado: lo que hace falta para
-- dibujarlos, filtrarlos y buscarlos. g es el estatus (0 terminado, 1 en ejecución, 2 cancelado,
-- 3 otro); marcas suma C1 = 1, C2 = 2, C3 = 4 y C4 = 8, y es nula si el proyecto no es de
-- inversión; evidencia suma 1 si la dependencia publicó enlaces, 2 si alguno es PDF, 4 si alguno es
-- una foto y 8 si empezó después de la primera versión del archivo de imágenes de Esri
-- (2014-02-20), así que hay imagen de antes. Las marcas piden revisar; no prueban una irregularidad.
-- particion: id_entidad
WITH enlaces AS (
    SELECT folio,
           bool_or(regexp_matches(lower(e), '\.pdf(\?|$)')) AS pdf,
           bool_or(regexp_matches(lower(e), '\.(jpe?g|png|gif|webp)(\?|$)')) AS foto
    FROM (SELECT folio, trim(url) AS e FROM anexo_enlaces_contratos WHERE ciclo = 2024
          UNION ALL
          SELECT folio, trim(url_documento) FROM anexo_enlaces_contratos WHERE ciclo = 2024)
    WHERE regexp_matches(e, '^https?://[^ ]+$') AND NOT contains(lower(e), '/personal/')
    GROUP BY folio
)
SELECT o.id_entidad, o.folio, left(o.nombre, 120) AS nombre,
       coalesce(o.cvemun, lpad(o.id_entidad::VARCHAR, 2, '0') || '000') AS cvemun,
       CASE o.estatus WHEN 'Terminado' THEN 0 WHEN 'En Ejecución' THEN 1 WHEN 'Cancelado' THEN 2 ELSE 3 END AS g,
       CASE WHEN a.c1_tipo IS NULL THEN NULL
            ELSE a.c1_tipo::INT + 2 * a.c2::INT + 4 * a.c3::INT + 8 * a.c4::INT END AS marcas,
       (e.folio IS NOT NULL)::INT + 2 * coalesce(e.pdf, false)::INT + 4 * coalesce(e.foto, false)::INT
           + 8 * coalesce(o.fecha_inicio > DATE '2014-02-20', false)::INT AS evidencia,
       round(o.lat, 5) AS lat, round(o.lon, 5) AS lon
FROM oro_proyecto_ciclo o
LEFT JOIN oro_alertas a ON a.folio = o.folio AND a.ciclo = o.ciclo
LEFT JOIN enlaces e ON e.folio = o.folio
WHERE o.ciclo = 2024 AND o.lat IS NOT NULL
ORDER BY o.id_entidad, o.folio;
