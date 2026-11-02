-- Los municipios del Censo 2020 en el punto de su cabecera (la localidad 0001 de ITER), con su
-- población y el rezago social de CONEVAL 2020. El lago no tiene polígonos municipales, así
-- que el mapa dibuja un punto por municipio.
SELECT m.cvemun, m.entidad, m.municipio, m.pobtot,
       round(l.lat, 4) AS lat, round(l.lon, 4) AS lon,
       r.irs, r.grado
FROM plata_municipios m
LEFT JOIN plata_localidades l ON l.cvegeo = m.cvemun || '0001'
LEFT JOIN plata_rezago_municipal r ON r.cvemun = m.cvemun
ORDER BY m.cvemun;
