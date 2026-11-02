"""Comprueba el lago y mide lo que el artículo reporta de él.

  1. Cada consulta de consultas/ da los mismos resultados en PostgreSQL y en el lago:
     se compara el SHA-256 de las filas, no una muestra.
  2. Mide la latencia de esas consultas en los dos motores.
  3. Poda de particiones: cuántos archivos planea Iceberg con y sin filtro.
  4. Viaje en el tiempo: cada instantánea devuelve las filas acumuladas de su ciclo.
  5. Evolución de esquema: agregar una columna no reescribe ningún dato.
  6. Almacenamiento por capa, contra el almacén y contra los CSV originales.

Uso:  python verificacion/verificar_lago.py [--repeticiones 20] [--sin-latencia]
"""
import argparse
import decimal
import hashlib
import json
import platform
import statistics
import sys
import time
from pathlib import Path

import psycopg2

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "etl"))
from comun import BUCKET, CICLOS, PG_DSN, RAIZ, TABLAS_PLATA, VERIFICACION, catalogo, cliente_s3, duck  # noqa: E402


def texto(v):
    if v is None:
        return ""
    if isinstance(v, (decimal.Decimal, float)):
        return f"{v:.2f}"
    return str(v)


def huella(filas):
    h = hashlib.sha256()
    for f in filas:
        h.update(("|".join(texto(v) for v in f) + "\n").encode("utf-8"))
    return h.hexdigest()


def medir(ejecutar, sql, repeticiones):
    ejecutar(sql)  # La primera calienta cachés y no cuenta.
    t = []
    for _ in range(repeticiones):
        inicio = time.perf_counter()
        ejecutar(sql)
        t.append((time.perf_counter() - inicio) * 1000)
    t.sort()
    return round(statistics.mean(t), 1), round(t[min(len(t) - 1, int(0.95 * len(t)))], 1)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--repeticiones", type=int, default=20)
    ap.add_argument("--sin-latencia", action="store_true")
    args = ap.parse_args()

    con = duck()
    for ruta in (RAIZ / "oro").glob("*.sql"):
        n = ruta.stem.split("_", 1)[1]
        con.execute(f"CREATE VIEW oro_{n} AS SELECT * FROM read_parquet('s3://{BUCKET}/oro/{n}.parquet')")
    pg = psycopg2.connect(PG_DSN)
    pg.autocommit = True
    cur = pg.cursor()

    def en_pg(sql):
        cur.execute(sql)
        return cur.fetchall()

    def en_lago(sql):
        return con.execute(sql).fetchall()

    salida = {"entorno": {
        # La versión y no release(): en Python 3.10, release() dice "10" también en Windows 11.
        "anfitrion": f"{platform.system()} {platform.version()}",
        "duckdb": con.execute("SELECT version()").fetchone()[0],
        "postgresql": en_pg("SHOW server_version")[0][0],
        "hilos_duckdb": con.execute("SELECT current_setting('threads')").fetchone()[0],
        "repeticiones": 0 if args.sin_latencia else args.repeticiones,
    }}
    fallos = 0

    print("1. Consultas: PostgreSQL contra lago")
    salida["consultas"] = {}
    for ruta in sorted((RAIZ / "consultas").glob("*.pg.sql")):
        nombre = ruta.name[:-len(".pg.sql")]
        sql_pg = ruta.read_text(encoding="utf-8")
        sql_lago = ruta.with_name(f"{nombre}.duck.sql").read_text(encoding="utf-8")
        filas_pg, filas_lago = en_pg(sql_pg), en_lago(sql_lago)
        hp, hl = huella(filas_pg), huella(filas_lago)
        igual = hp == hl
        fallos += not igual
        r = {"filas": len(filas_pg), "sha256": hp, "igual": igual}
        if not args.sin_latencia:
            r["pg_ms"], r["pg_p95"] = medir(en_pg, sql_pg, args.repeticiones)
            r["lago_ms"], r["lago_p95"] = medir(en_lago, sql_lago, args.repeticiones)
        salida["consultas"][nombre] = r
        tiempos = (f"pg {r['pg_ms']:>8} ms  lago {r['lago_ms']:>8} ms"
                   if not args.sin_latencia else "")
        print(f"  {'ok   ' if igual else 'FALLA'} {nombre:<28} {len(filas_pg):>4} filas {hp[:12]} {tiempos}", flush=True)
        if not igual:
            for a, b in zip(filas_pg, filas_lago):
                if huella([a]) != huella([b]):
                    print("     pg  :", a, "\n     lago:", b)
                    break

    print("2. Poda de particiones en plata.proyectos")
    tabla = catalogo().load_table("plata.proyectos")
    todos = list(tabla.scan().plan_files())
    filtrados = list(tabla.scan(row_filter="ciclo == 2024 and id_entidad == 15").plan_files())
    salida["poda"] = {
        "archivos_total": len(todos), "archivos_filtro": len(filtrados),
        "bytes_total": sum(t.file.file_size_in_bytes for t in todos),
        "bytes_filtro": sum(t.file.file_size_in_bytes for t in filtrados)}
    print(f"  {salida['poda']}")

    print("3. Viaje en el tiempo en plata.proyectos")
    salida["viaje"] = []
    meta = tabla.metadata_location
    acumulado = 0
    por_ciclo = dict(con.execute(
        "SELECT ciclo, count(*) FROM plata_proyectos GROUP BY ciclo").fetchall())
    for instantanea in tabla.snapshots():
        ciclo = int(instantanea.summary["ciclo"])
        acumulado += por_ciclo[ciclo]
        n = con.execute(f"SELECT count(*) FROM iceberg_scan('{meta}', "
                        f"snapshot_from_id={instantanea.snapshot_id})").fetchone()[0]
        bien = n == acumulado
        fallos += not bien
        salida["viaje"].append({"ciclo": ciclo, "instantanea": str(instantanea.snapshot_id),
                                "filas": n, "esperadas": acumulado,
                                "fuente_sha256": instantanea.summary["fuente_sha256"][:16]})
        print(f"  {'ok   ' if bien else 'FALLA'} ciclo {ciclo}: {n:,} filas "
              f"(archivo oficial {instantanea.summary['fuente_sha256'][:12]})")

    print("4. Evolución de esquema")
    cat = catalogo()
    if cat.table_exists("plata.prueba_esquema"):
        cat.purge_table("plata.prueba_esquema")
    prueba = cat.create_table("plata.prueba_esquema", schema=tabla.schema())
    prueba.append(tabla.scan(row_filter="ciclo == 2025 and id_entidad == 15").to_arrow())
    antes = sorted(t.file.file_path for t in prueba.scan().plan_files())
    inicio = time.perf_counter()
    with prueba.update_schema() as u:
        from pyiceberg.types import StringType
        u.add_column("revision_humana", StringType())
    ms = (time.perf_counter() - inicio) * 1000
    despues = sorted(t.file.file_path for t in cat.load_table("plata.prueba_esquema").scan().plan_files())
    salida["evolucion"] = {"archivos_iguales": antes == despues, "archivos": len(antes),
                           "milisegundos": round(ms, 1)}
    fallos += antes != despues
    print(f"  {salida['evolucion']}")
    cat.purge_table("plata.prueba_esquema")

    print("5. Almacenamiento")
    s3 = cliente_s3()
    capas = {}
    for pagina in s3.get_paginator("list_objects_v2").paginate(Bucket=BUCKET):
        for o in pagina.get("Contents", []):
            capa = o["Key"].split("/", 1)[0]
            c = capas.setdefault(capa, {"objetos": 0, "bytes": 0})
            c["objetos"] += 1
            c["bytes"] += o["Size"]
    # count(*) y no reltuples: reltuples es una estimación de ANALYZE.
    tablas_pg = [(t, *en_pg(f"SELECT pg_total_relation_size('warehouse.{t}'), count(*) "
                            f"FROM warehouse.{t}")[0])
                 for t in ("dim_municipio", "dim_proyecto_federal", "fact_proyecto_ciclo")]
    plata = json.loads((VERIFICACION / "evidencia_plata.json").read_text(encoding="utf-8"))
    csv_total = sum(t["bytes"] for c in plata["ciclos"].values() for t in c.values())
    salida["almacenamiento"] = {
        "capas": capas, "csv_seis_ciclos_bytes": csv_total,
        "postgresql_bytes": sum(t[1] for t in tablas_pg),
        "postgresql_tablas": {t[0]: {"bytes": t[1], "filas": t[2]} for t in tablas_pg}}
    filas = {}
    for n in TABLAS_PLATA:
        filas[n] = con.execute(f"SELECT count(*) FROM plata_{n}").fetchone()[0]
    salida["almacenamiento"]["filas_plata"] = filas
    for k, v in capas.items():
        print(f"  {k:<8} {v['objetos']:>6} objetos {v['bytes'] / 1e6:>10.1f} MB")
    print(f"  CSV de los seis ciclos: {csv_total / 1e6:,.1f} MB; "
          f"PostgreSQL: {salida['almacenamiento']['postgresql_bytes'] / 1e6:,.1f} MB")

    salida["fallos"] = fallos
    (VERIFICACION / "evidencia_lago.json").write_text(
        json.dumps(salida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    print(f"fallos: {fallos}")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
