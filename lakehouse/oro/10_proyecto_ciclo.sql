-- Grano: un proyecto por ciclo, en el último periodo informado de ese ciclo.
-- Hasta 2023 un folio aparece en los periodos 4 y 5: quedarse con el último evita
-- contar dos veces, y el periodo 5 es el informe definitivo.
--
-- pagado_reportado es lo que dice la fuente. pagado lo anula cuando el monto es el
-- número del propio folio: tres filas de Sonora lo traen así, por 600.9 mil millones
-- de pesos. El periodo 5 corrige una; las otras dos llegan aquí con 390.8 mil millones.
-- Plata conserva el valor original.
WITH ultimo AS (
    SELECT * EXCLUDE (n) FROM (
        SELECT *, row_number() OVER (PARTITION BY folio, ciclo ORDER BY periodo DESC) AS n
        FROM plata_proyectos)
    WHERE n = 1
), metas AS (
    -- Metas de unidades distintas no se suman: el avance es el promedio de sus
    -- porcentajes, y la meta física solo sirve si hay una unidad.
    SELECT m.folio, m.ciclo,
           count(DISTINCT m.id_unidad) AS unidades,
           min(m.unidad) AS unidad,
           sum(coalesce(m.meta_modificada, m.meta)) AS meta_fisica,
           least(avg(CASE WHEN coalesce(m.meta_modificada, m.meta) > 0
                          THEN m.avance_fisico / coalesce(m.meta_modificada, m.meta) * 100 END),
                 100) AS pct_fisico
    FROM plata_metas_avances m
    JOIN ultimo u ON u.folio = m.folio AND u.ciclo = m.ciclo AND u.periodo = m.periodo
    GROUP BY m.folio, m.ciclo
), contratos AS (
    SELECT folio, ciclo, count(*) AS n_contratos, sum(monto) AS monto_contratos,
           count(*) FILTER (WHERE modalidad ILIKE 'Adjudicaci%') AS n_adjudicacion_directa
    FROM (SELECT DISTINCT folio, ciclo, coalesce(id_contrato, numero_contrato) AS contrato,
                 contratista, monto, modalidad
          FROM plata_contratos)
    GROUP BY folio, ciclo
), geo AS (
    SELECT folio, ciclo, count(*) AS n_puntos, min(id_localidad) AS id_localidad,
           round(avg(lat), 6) AS lat, round(avg(lon), 6) AS lon
    FROM plata_georreferencias
    WHERE lat BETWEEN 14 AND 33 AND lon BETWEEN -119 AND -86
    GROUP BY folio, ciclo
), fondos AS (
    -- FAIS: Ramo 33, programas I003 (estatal) e I004 (municipal).
    SELECT folio, ciclo,
           bool_or(ramo = '33' AND modalidad = 'I' AND try_cast(programa AS INT) IN (3, 4)) AS es_fais
    FROM plata_financiamiento
    GROUP BY folio, ciclo
), revisado AS (
    SELECT *, pagado = try_cast(regexp_extract(folio, '[0-9]+$') AS DECIMAL(20, 2)) AS pagado_es_folio
    FROM ultimo
)
SELECT u.folio, u.ciclo, u.periodo, u.id_entidad, u.entidad, u.id_municipio, u.municipio,
       lpad(u.id_entidad::VARCHAR, 2, '0') || lpad(u.id_municipio::VARCHAR, 3, '0') AS cvemun,
       u.categoria, u.tipo_programa, u.clasificacion, u.nombre, u.institucion_ejecutora,
       u.fecha_inicio, u.fecha_termino, u.estatus, u.flujo, u.beneficiarios,
       u.aprobado,
       u.pagado AS pagado_reportado,
       coalesce(u.pagado_es_folio, FALSE) AS pagado_es_folio,
       CASE WHEN u.pagado_es_folio THEN NULL ELSE u.pagado END AS pagado,
       coalesce(f.es_fais, FALSE) AS es_fais,
       m.unidades, m.unidad, m.meta_fisica, round(m.pct_fisico, 2) AS pct_fisico,
       CASE WHEN u.aprobado > 0 AND NOT coalesce(u.pagado_es_folio, FALSE)
            THEN round(u.pagado / u.aprobado * 100, 2) END AS pct_financiero,
       coalesce(c.n_contratos, 0) AS n_contratos, c.monto_contratos,
       coalesce(c.n_adjudicacion_directa, 0) AS n_adjudicacion_directa,
       g.n_puntos, g.id_localidad, g.lat, g.lon
FROM revisado u
LEFT JOIN metas m USING (folio, ciclo)
LEFT JOIN contratos c USING (folio, ciclo)
LEFT JOIN geo g USING (folio, ciclo)
LEFT JOIN fondos f USING (folio, ciclo)
