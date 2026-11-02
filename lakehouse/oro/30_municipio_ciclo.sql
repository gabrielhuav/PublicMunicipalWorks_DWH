-- Inversión por municipio, ciclo y habitante, con el rezago social de CONEVAL. Solo
-- proyectos de inversión; id_municipio = 0 es "Gobierno de la Entidad" y queda fuera.
-- Un folio plurianual aparece en varios ciclos con el mismo aprobado global: estas
-- cifras se comparan entre municipios dentro de un ciclo, no se suman entre ciclos.
SELECT o.cvemun, o.ciclo, m.entidad, m.municipio, m.pobtot,
       r.irs, r.grado AS grado_rezago,
       count(*) AS proyectos,
       sum(o.aprobado) AS aprobado,
       sum(o.pagado) AS pagado,
       round(sum(o.pagado) / m.pobtot, 2) AS pagado_por_habitante,
       count(*) FILTER (WHERE o.es_fais) AS proyectos_fais,
       count(*) FILTER (WHERE o.estatus = 'Cancelado') AS cancelados,
       count(*) FILTER (WHERE o.lat IS NOT NULL) AS con_coordenadas
FROM oro_proyecto_ciclo o
JOIN plata_municipios m USING (cvemun)
LEFT JOIN plata_rezago_municipal r USING (cvemun)
WHERE o.categoria = 'Proyecto de inversión'
GROUP BY o.cvemun, o.ciclo, m.entidad, m.municipio, m.pobtot, r.irs, r.grado
