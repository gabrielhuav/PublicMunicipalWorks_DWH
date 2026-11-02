-- Los criterios del capítulo sobre registros reales. Sin verdad de referencia no son
-- detecciones sino una lista para revisar: no dicen que haya irregularidad.
--   c1_ciclo  C1 del capítulo: monto a más de 3 desviaciones de la media del ciclo.
--   c1_tipo   C1 por tipo: costo unitario a más de 3 desviaciones robustas de las
--             obras de igual clasificación y unidad, con al menos 30 pares.
--   c2        Más de 120 días en ejecución después de la fecha de término.
--   c3        Avance físico menor a 30 % con financiero mayor a 80 %.
--   c4        Lo pagado supera en más de 30 puntos al avance físico.
WITH obras AS (
    SELECT * FROM oro_proyecto_ciclo
    WHERE categoria = 'Proyecto de inversión'
), unitario AS (
    SELECT folio, ciclo, clasificacion, unidad, ln(aprobado / meta_fisica) AS log_costo
    FROM obras
    WHERE unidades = 1 AND meta_fisica > 0 AND aprobado > 0
), pares AS (
    SELECT clasificacion, unidad, count(*) AS n, median(log_costo) AS mediana
    FROM unitario
    GROUP BY clasificacion, unidad
    HAVING count(*) >= 30
), dispersion AS (
    SELECT u.clasificacion, u.unidad, 1.4826 * median(abs(u.log_costo - p.mediana)) AS sigma
    FROM unitario u JOIN pares p USING (clasificacion, unidad)
    GROUP BY u.clasificacion, u.unidad
), z_tipo AS (
    SELECT u.folio, u.ciclo, (u.log_costo - p.mediana) / nullif(d.sigma, 0) AS z
    FROM unitario u
    JOIN pares p USING (clasificacion, unidad)
    JOIN dispersion d USING (clasificacion, unidad)
), z_ciclo AS (
    SELECT folio, ciclo,
           abs(aprobado - avg(aprobado) OVER w) / nullif(stddev_pop(aprobado) OVER w, 0) AS z
    FROM obras
    WINDOW w AS (PARTITION BY ciclo)
), base AS (
    SELECT o.folio, o.ciclo, o.id_entidad, o.cvemun, o.clasificacion, o.estatus,
           o.aprobado, o.pagado, o.pct_fisico, o.pct_financiero,
           CASE WHEN o.estatus = 'En Ejecución' AND o.fecha_termino < make_date(o.ciclo, 12, 31)
                THEN date_diff('day', o.fecha_termino, make_date(o.ciclo, 12, 31)) END AS dias_retraso,
           round(zc.z, 3) AS z_ciclo, round(zt.z, 3) AS z_tipo
    FROM obras o
    LEFT JOIN z_ciclo zc USING (folio, ciclo)
    LEFT JOIN z_tipo zt USING (folio, ciclo)
)
SELECT *,
       coalesce(z_ciclo > 3, FALSE) AS c1_ciclo,
       coalesce(z_tipo > 3, FALSE) AS c1_tipo,
       coalesce(dias_retraso > 120, FALSE) AS c2,
       coalesce(pct_fisico < 30 AND pct_financiero > 80, FALSE) AS c3,
       coalesce(pct_financiero - pct_fisico > 30, FALSE) AS c4
FROM base
