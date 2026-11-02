-- Detalle de los proyectos de 2024, un archivo por municipio, que el mapa baja al abrir un
-- proyecto: montos, avances, fechas y los enlaces que la dependencia publicó en SHCP con sus
-- contratos. Los enlaces se enseñan tal como los reportó; nadie revisó lo que contienen. Se
-- omiten los de sitios personales de OneDrive (/personal/), porque su ruta lleva la cuenta de
-- correo de quien los subió. No incluye nombres de contratistas.
-- particion: cvemun
WITH enlaces AS (
    SELECT folio, list_sort(list_distinct(list(e))) AS enlaces
    FROM (SELECT folio, trim(url) AS e FROM anexo_enlaces_contratos WHERE ciclo = 2024
          UNION ALL
          SELECT folio, trim(url_documento) FROM anexo_enlaces_contratos WHERE ciclo = 2024)
    WHERE regexp_matches(e, '^https?://[^ ]+$') AND NOT contains(lower(e), '/personal/')
    GROUP BY folio
)
SELECT coalesce(o.cvemun, lpad(o.id_entidad::VARCHAR, 2, '0') || '000') AS cvemun,
       o.folio, o.clasificacion, o.estatus, o.aprobado, o.pagado, o.pct_fisico, o.pct_financiero,
       o.n_contratos, o.fecha_inicio, o.fecha_termino, coalesce(e.enlaces, []) AS enlaces
FROM oro_proyecto_ciclo o
LEFT JOIN enlaces e ON e.folio = o.folio
WHERE o.ciclo = 2024 AND o.lat IS NOT NULL
ORDER BY 1, o.folio;
