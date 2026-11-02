"""Capa oro: tablas analíticas en Parquet, calculadas con DuckDB sobre plata.

Cada archivo de oro/ es una consulta; el resultado queda en
s3://obras-lago/oro/<nombre>.parquet y las siguientes pueden leerlo. No hay motor
intermedio: nada de esto pasa por PostgreSQL ni por Spark.
"""
import json
import sys
import time

from comun import BUCKET, RAIZ, VERIFICACION, cliente_s3, duck


def main():
    con = duck()
    s3 = cliente_s3()
    evidencia = {}
    for sql in sorted((RAIZ / "oro").glob("*.sql")):
        nombre = sql.stem.split("_", 1)[1]
        ruta = f"s3://{BUCKET}/oro/{nombre}.parquet"
        inicio = time.time()
        con.execute(f"COPY ({sql.read_text(encoding='utf-8')}) TO '{ruta}' "
                    "(FORMAT PARQUET, COMPRESSION ZSTD)")
        con.execute(f"CREATE VIEW oro_{nombre} AS SELECT * FROM read_parquet('{ruta}')")
        filas = con.execute(f"SELECT count(*) FROM oro_{nombre}").fetchone()[0]
        tam = s3.head_object(Bucket=BUCKET, Key=f"oro/{nombre}.parquet")["ContentLength"]
        evidencia[nombre] = {"filas": filas, "bytes": tam,
                             "segundos": round(time.time() - inicio, 1)}
        print(f"{nombre:<18} {filas:>10,} filas {tam / 1e6:>8.1f} MB "
              f"{evidencia[nombre]['segundos']:>6} s", flush=True)
    VERIFICACION.mkdir(exist_ok=True)
    (VERIFICACION / "evidencia_oro.json").write_text(
        json.dumps(evidencia, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
