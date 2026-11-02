"""Ejecuta una consulta sobre el lago e imprime el resultado.

Uso:  python consultas/lago.py archivo.sql
      python consultas/lago.py "SELECT ..."
      python consultas/lago.py --instantanea 2022 "SELECT ... FROM proyectos_entonces"

--instantanea crea la vista proyectos_entonces con plata.proyectos tal como quedó al
cargar ese ciclo.
"""
import argparse
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "etl"))
from comun import BUCKET, catalogo, duck  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("consulta")
    ap.add_argument("--instantanea", type=int)
    args = ap.parse_args()

    con = duck()
    for ruta in (RAIZ / "oro").glob("*.sql"):
        n = ruta.stem.split("_", 1)[1]
        con.execute(f"CREATE VIEW oro_{n} AS SELECT * FROM "
                    f"read_parquet('s3://{BUCKET}/oro/{n}.parquet')")
    if args.instantanea:
        tabla = catalogo().load_table("plata.proyectos")
        foto = next(s for s in tabla.snapshots()
                    if s.summary["ciclo"] == str(args.instantanea))
        con.execute(f"CREATE VIEW proyectos_entonces AS SELECT * FROM iceberg_scan("
                    f"'{tabla.metadata_location}', snapshot_from_id={foto.snapshot_id})")
    ruta = Path(args.consulta)
    sql = ruta.read_text(encoding="utf-8") if ruta.suffix == ".sql" and ruta.exists() else args.consulta
    print(con.sql(sql).df().to_string(index=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
