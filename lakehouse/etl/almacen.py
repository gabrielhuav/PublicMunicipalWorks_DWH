"""Carga las tablas oro al almacén de PostgreSQL, sin tocar lo que ya existe.

Los dos lados quedan con los mismos datos: DuckDB calcula las versiones SCD 2 sobre
oro, escribe CSV y psycopg2 los carga con COPY. Así verificar_lago.py puede comparar
por hash las mismas consultas en el lago y en el almacén.
"""
import json
import sys
import time

import psycopg2

from comun import DATOS, PG_DSN, RAIZ, VERIFICACION, duck

VERSIONES = """
WITH base AS (
    SELECT folio, ciclo, nombre, categoria, clasificacion, institucion_ejecutora,
           estatus, aprobado,
           lag(ciclo) OVER w AS ciclo_previo,
           lag(estatus) OVER w AS estatus_previo,
           lag(aprobado) OVER w AS aprobado_previo,
           lag(clasificacion) OVER w AS clasificacion_previa
    FROM oro_proyecto_ciclo
    WINDOW w AS (PARTITION BY folio ORDER BY ciclo)
), cambios AS (
    SELECT *, concat_ws(', ',
               CASE WHEN ciclo_previo IS NULL THEN 'alta' END,
               CASE WHEN estatus IS DISTINCT FROM estatus_previo AND ciclo_previo IS NOT NULL THEN 'estatus' END,
               CASE WHEN aprobado IS DISTINCT FROM aprobado_previo AND ciclo_previo IS NOT NULL THEN 'aprobado' END,
               CASE WHEN clasificacion IS DISTINCT FROM clasificacion_previa AND ciclo_previo IS NOT NULL THEN 'clasificacion' END
           ) AS motivo
    FROM base
), numeradas AS (
    SELECT *, sum(CASE WHEN motivo <> '' THEN 1 ELSE 0 END)
              OVER (PARTITION BY folio ORDER BY ciclo) AS version
    FROM cambios
), versiones AS (
    SELECT folio, version, min(ciclo) AS desde,
           arg_min(nombre, ciclo) AS nombre, arg_min(categoria, ciclo) AS categoria,
           arg_min(clasificacion, ciclo) AS clasificacion,
           arg_min(institucion_ejecutora, ciclo) AS institucion_ejecutora,
           arg_min(estatus, ciclo) AS estatus, arg_min(aprobado, ciclo) AS aprobado,
           arg_min(motivo, ciclo) AS motivo_cambio
    FROM numeradas
    GROUP BY folio, version
)
SELECT row_number() OVER (ORDER BY folio, version) AS proyecto_key, folio, version,
       nombre, categoria, clasificacion, institucion_ejecutora, estatus, aprobado,
       make_date(desde, 12, 31) AS fecha_efectiva,
       coalesce(lead(make_date(desde, 12, 31)) OVER (PARTITION BY folio ORDER BY version),
                DATE '9999-12-31') AS fecha_expiracion,
       lead(version) OVER (PARTITION BY folio ORDER BY version) IS NULL AS es_actual,
       motivo_cambio
FROM versiones
"""

HECHOS = """
SELECT year(p.ciclo_fecha) * 10000 + 1231 AS tiempo_key, d.proyecto_key,
       m.municipio_key, p.ciclo, p.id_entidad, p.aprobado, p.pagado_reportado, p.pagado,
       p.pct_fisico, p.pct_financiero, p.n_contratos, p.monto_contratos, p.es_fais,
       p.lat, p.lon, a.c1_ciclo, a.c1_tipo, a.c2, a.c3, a.c4
FROM (SELECT *, make_date(ciclo, 12, 31) AS ciclo_fecha FROM oro_proyecto_ciclo) p
JOIN dim_proyecto d ON d.folio = p.folio
 AND p.ciclo_fecha >= d.fecha_efectiva AND p.ciclo_fecha < d.fecha_expiracion
LEFT JOIN dim_mun m ON m.cvemun = p.cvemun
LEFT JOIN oro_alertas a ON a.folio = p.folio AND a.ciclo = p.ciclo
"""

MUNICIPIOS = """
SELECT row_number() OVER (ORDER BY m.cvemun) AS municipio_key, m.cvemun, m.entidad,
       m.municipio, m.pobtot, r.irs, r.grado AS grado_rezago
FROM plata_municipios m
LEFT JOIN plata_rezago_municipal r USING (cvemun)
"""


def huella(cur):
    """Filas y md5 de cada tabla que ya existía, para probar que no se tocaron."""
    cur.execute("""SELECT schemaname || '.' || tablename FROM pg_tables
                   WHERE schemaname IN ('public', 'warehouse')
                     AND tablename NOT IN ('dim_municipio', 'dim_proyecto_federal',
                                           'fact_proyecto_ciclo')
                   ORDER BY 1""")
    salida = {}
    for (tabla,) in cur.fetchall():
        cur.execute(f"""SELECT count(*), md5(coalesce(string_agg(h, '' ORDER BY h), ''))
                        FROM (SELECT md5(t::text) AS h FROM {tabla} t) s""")
        salida[tabla] = list(cur.fetchone())
    return salida


def main():
    inicio = time.time()
    con = duck()
    for nombre in ("proyecto_ciclo", "alertas"):
        con.execute(f"CREATE VIEW oro_{nombre} AS SELECT * FROM "
                    f"read_parquet('s3://obras-lago/oro/{nombre}.parquet')")
    con.execute(f"CREATE TEMP TABLE dim_mun AS {MUNICIPIOS}")
    con.execute(f"CREATE TEMP TABLE dim_proyecto AS {VERSIONES}")
    con.execute(f"CREATE TEMP TABLE hechos AS {HECHOS}")

    tmp = DATOS / "tmp"
    tmp.mkdir(parents=True, exist_ok=True)
    pg = psycopg2.connect(PG_DSN)
    cur = pg.cursor()
    antes = huella(cur)
    cur.execute((RAIZ / "ddl" / "10_almacen_federal.sql").read_text(encoding="utf-8"))
    for tabla_duck, tabla_pg in (("dim_mun", "dim_municipio"),
                                 ("dim_proyecto", "dim_proyecto_federal"),
                                 ("hechos", "fact_proyecto_ciclo")):
        ruta = tmp / f"{tabla_pg}.csv"
        con.execute(f"COPY {tabla_duck} TO '{ruta.as_posix()}' (HEADER, DELIMITER ',')")
        with open(ruta, encoding="utf-8") as f:
            cur.copy_expert(f"COPY warehouse.{tabla_pg} FROM STDIN CSV HEADER", f)
        cur.execute(f"SELECT count(*) FROM warehouse.{tabla_pg}")
        print(f"{tabla_pg:<24} {cur.fetchone()[0]:>10,} filas", flush=True)
        ruta.unlink()
    pg.commit()
    pg.autocommit = True
    # En serie: el contenedor solo tiene 64 MB de memoria compartida.
    cur.execute("SET max_parallel_maintenance_workers = 0")
    for tabla in ("dim_municipio", "dim_proyecto_federal", "fact_proyecto_ciclo"):
        cur.execute(f"VACUUM ANALYZE warehouse.{tabla}")
    despues = huella(cur)
    identicas = antes == despues
    (VERIFICACION / "evidencia_aditiva.json").write_text(json.dumps(
        {"identicas": identicas, "tablas": despues}, ensure_ascii=False, indent=1) + "\n",
        encoding="utf-8", newline="\n")
    print(f"tablas originales: {len(antes)}, idénticas: {identicas}")
    print(f"almacén cargado en {time.time() - inicio:.1f} s")
    return 0 if identicas else 1


if __name__ == "__main__":
    sys.exit(main())
