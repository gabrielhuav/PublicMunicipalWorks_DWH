-- Cada punto de SHCP contra las coordenadas de su localidad en el Censo 2020. No hace
-- falta el polígono de cada municipio para saber si un punto cayó lejos de donde dice.
WITH puntos AS (
    SELECT g.folio, g.ciclo, g.id_entidad, g.id_municipio, g.id_localidad, g.lat, g.lon,
           g.lat BETWEEN 14 AND 33 AND g.lon BETWEEN -119 AND -86 AS en_mexico
    FROM plata_georreferencias g
), medidos AS (
    SELECT p.*, l.cvegeo IS NOT NULL AS localidad_en_censo,
           CASE WHEN p.en_mexico AND l.lat IS NOT NULL THEN 2 * 6371.0088 * asin(sqrt(
               pow(sin(radians(p.lat - l.lat) / 2), 2)
               + cos(radians(l.lat)) * cos(radians(p.lat))
                 * pow(sin(radians(p.lon - l.lon) / 2), 2))) END AS km
    FROM puntos p
    LEFT JOIN plata_localidades l
      ON l.id_entidad = p.id_entidad AND l.id_municipio = p.id_municipio
     AND l.id_localidad = p.id_localidad
)
SELECT ciclo, count(*) AS puntos,
       count(*) FILTER (WHERE en_mexico) AS en_mexico,
       count(*) FILTER (WHERE localidad_en_censo) AS localidad_en_censo,
       count(km) AS medidos,
       round(median(km), 3) AS km_mediana,
       round(quantile_cont(km, 0.95), 3) AS km_p95,
       count(*) FILTER (WHERE km <= 5) AS hasta_5_km,
       count(*) FILTER (WHERE km > 25) AS mas_de_25_km
FROM medidos
GROUP BY ciclo
ORDER BY ciclo
