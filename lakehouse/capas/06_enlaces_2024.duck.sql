-- Enlaces que la dependencia publicó en SHCP con los contratos de cada proyecto de un estado en
-- 2024: expedientes, documentos o fotografías. Se enseñan tal como los reportó; nadie revisó lo
-- que contienen. Se omiten los de sitios personales de OneDrive (/personal/), porque su ruta
-- lleva la cuenta de correo de quien los subió. Se corre una vez por estado: {entidad} es su clave.
SELECT DISTINCT folio, enlace
FROM (
    SELECT folio, trim(url) AS enlace FROM anexo_enlaces_contratos
    WHERE ciclo = 2024 AND id_entidad = {entidad}
    UNION ALL
    SELECT folio, trim(url_documento) FROM anexo_enlaces_contratos
    WHERE ciclo = 2024 AND id_entidad = {entidad}
)
WHERE regexp_matches(enlace, '^https?://[^ ]+$') AND NOT contains(lower(enlace), '/personal/')
ORDER BY folio, enlace;
