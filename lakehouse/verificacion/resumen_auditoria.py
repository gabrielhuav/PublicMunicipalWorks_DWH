"""Calcula las cifras de la auditoría sobre datos reales que usa el artículo.

Todas salen de oro y plata. Son hechos sobre lo que las fuentes publican, no juicios:
un registro señalado es un registro por revisar.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "etl"))
from comun import BUCKET, RAIZ, VERIFICACION, duck  # noqa: E402

con = duck()
for ruta in (RAIZ / "oro").glob("*.sql"):
    n = ruta.stem.split("_", 1)[1]
    con.execute(f"CREATE VIEW oro_{n} AS SELECT * FROM read_parquet('s3://{BUCKET}/oro/{n}.parquet')")


def filas(sql):
    c = con.execute(sql)
    nombres = [d[0] for d in c.description]
    return [dict(zip(nombres, (float(v) if v.__class__.__name__ == "Decimal" else v for v in f)))
            for f in c.fetchall()]


s = {}
s["poblacion"] = filas("""
    SELECT count(*) AS filas_folio_ciclo, count(DISTINCT folio) AS folios,
           count(DISTINCT cvemun) FILTER (WHERE id_municipio > 0) AS municipios,
           count(DISTINCT id_entidad) AS entidades FROM oro_proyecto_ciclo""")[0]
s["por_ciclo"] = filas("""
    SELECT ciclo, count(*) AS folios,
           count(*) FILTER (WHERE categoria = 'Proyecto de inversión') AS proyectos_inversion,
           sum(aprobado) AS aprobado, sum(pagado_reportado) AS pagado_reportado, sum(pagado) AS pagado
    FROM oro_proyecto_ciclo GROUP BY ciclo ORDER BY ciclo""")
s["pagado_es_folio"] = filas("""
    SELECT folio, ciclo, entidad, aprobado, pagado_reportado FROM oro_proyecto_ciclo
    WHERE pagado_es_folio ORDER BY pagado_reportado DESC""")
s["pagado_mas_de_10_veces"] = filas("""
    SELECT count(*) AS registros, sum(pagado) AS pagado FROM oro_proyecto_ciclo
    WHERE pagado > 10 * aprobado AND aprobado > 0""")[0]
s["calidad_geo"] = filas("SELECT * FROM oro_calidad_geo ORDER BY ciclo")
s["cruce_cngmd"] = filas("""
    SELECT relacion, count(*) AS municipios, sum(contratos_cngmd) AS contratos_cngmd,
           sum(contratos_shcp) AS contratos_shcp FROM oro_cruce_cngmd
    GROUP BY relacion ORDER BY municipios DESC""")
s["cruce_temascaltepec"] = filas("SELECT * FROM oro_cruce_cngmd WHERE cvemun = '15086'")[0]
s["alertas"] = filas("""
    SELECT count(*) AS proyectos, count(*) FILTER (WHERE c1_ciclo) AS c1_ciclo,
           count(*) FILTER (WHERE c1_tipo) AS c1_tipo, count(*) FILTER (WHERE c2) AS c2,
           count(*) FILTER (WHERE c3) AS c3, count(*) FILTER (WHERE c4) AS c4,
           count(*) FILTER (WHERE c1_ciclo AND c1_tipo) AS c1_ambos,
           count(*) FILTER (WHERE pct_fisico IS NOT NULL AND pct_financiero IS NOT NULL) AS con_ambos_avances,
           count(*) FILTER (WHERE z_tipo IS NOT NULL) AS con_costo_unitario
    FROM oro_alertas""")[0]
s["versiones"] = filas("""
    WITH h AS (
        SELECT folio, count(*) AS ciclos, count(DISTINCT estatus) AS estatus,
               count(DISTINCT aprobado) AS montos, count(DISTINCT clasificacion) AS clases
        FROM oro_proyecto_ciclo GROUP BY folio)
    SELECT count(*) AS folios, count(*) FILTER (WHERE ciclos > 1) AS en_varios_ciclos,
           count(*) FILTER (WHERE ciclos > 1 AND estatus > 1) AS cambian_estatus,
           count(*) FILTER (WHERE ciclos > 1 AND montos > 1) AS cambian_monto,
           count(*) FILTER (WHERE ciclos > 1 AND clases > 1) AS cambian_clasificacion FROM h""")[0]
s["rezago"] = filas("""
    SELECT ciclo, grado_rezago, count(*) AS municipios,
           round(median(pagado_por_habitante), 2) AS mediana_por_habitante
    FROM oro_municipio_ciclo WHERE ciclo IN (2023, 2024) AND grado_rezago IS NOT NULL
    GROUP BY ciclo, grado_rezago ORDER BY ciclo, mediana_por_habitante""")
s["rezago_spearman"] = filas("""
    WITH r AS (
        SELECT ciclo, rank() OVER (PARTITION BY ciclo ORDER BY irs) AS a,
               rank() OVER (PARTITION BY ciclo ORDER BY pagado_por_habitante) AS b
        FROM oro_municipio_ciclo WHERE irs IS NOT NULL AND pagado_por_habitante IS NOT NULL)
    SELECT ciclo, count(*) AS municipios, round(corr(a, b), 3) AS spearman
    FROM r GROUP BY ciclo ORDER BY ciclo""")
s["fais"] = filas("""
    SELECT ciclo, round(100.0 * count(*) FILTER (WHERE es_fais) / count(*), 1) AS pct_proyectos_fais
    FROM oro_proyecto_ciclo GROUP BY ciclo ORDER BY ciclo""")
s["modalidad"] = filas("""
    SELECT coalesce(modalidad, 'sin dato') AS modalidad, count(*) AS contratos, sum(monto) AS monto
    FROM (SELECT DISTINCT folio, ciclo, id_contrato, modalidad, monto FROM plata_contratos
          WHERE ciclo >= 2023 AND tipo_contratacion = 'Obra')
    GROUP BY modalidad ORDER BY contratos DESC""")
s["temascaltepec"] = filas("""
    SELECT ciclo, count(*) AS proyectos, sum(aprobado) AS aprobado, sum(pagado) AS pagado,
           count(*) FILTER (WHERE lat IS NOT NULL) AS con_coordenadas
    FROM oro_proyecto_ciclo WHERE cvemun = '15086' GROUP BY ciclo ORDER BY ciclo""")
s["temascaltepec_ultimo"] = filas("""
    WITH u AS (SELECT * FROM oro_proyecto_ciclo WHERE cvemun = '15086'
               QUALIFY row_number() OVER (PARTITION BY folio ORDER BY ciclo DESC) = 1)
    SELECT count(*) AS folios, sum(aprobado) AS aprobado, sum(pagado) AS pagado,
           count(*) FILTER (WHERE estatus = 'Terminado') AS terminados,
           count(*) FILTER (WHERE estatus = 'Cancelado') AS cancelados FROM u""")[0]

(VERIFICACION / "evidencia_auditoria.json").write_text(
    json.dumps(s, ensure_ascii=False, indent=1, default=str) + "\n", encoding="utf-8", newline="\n")
print(json.dumps(s, ensure_ascii=False, indent=0, default=str))
