-- Enlaces que la dependencia publicó en SHCP con los contratos de cada proyecto del Estado de
-- México en 2024: expedientes, documentos o fotografías. Se enseñan tal como los reportó;
-- nadie revisó lo que contienen. Se omiten los de sitios personales de OneDrive (/personal/),
-- porque su ruta lleva la cuenta de correo de quien los subió.
SELECT DISTINCT folio, enlace
FROM (
    SELECT folio, trim(url) AS enlace FROM anexo_enlaces_contratos
    WHERE ciclo = 2024 AND id_entidad = 15
    UNION ALL
    SELECT folio, trim(url_documento) FROM anexo_enlaces_contratos
    WHERE ciclo = 2024 AND id_entidad = 15
)
WHERE regexp_matches(enlace, '^https?://[^ ]+$') AND NOT contains(lower(enlace), '/personal/')
ORDER BY folio, enlace;
