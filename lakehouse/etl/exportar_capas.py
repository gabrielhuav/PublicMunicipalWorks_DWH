"""Exporta al sitio estático lo que devuelven las consultas de capas/.

Cada archivo `NN_nombre.pg.sql` corre en PostgreSQL y cada `NN_nombre.duck.sql` en el lago,
y su resultado se guarda tal cual en sitio/datos/NN_nombre.json. No hay otra entrada: ni
archivos de las fuentes ni valores escritos aquí. manifiesto.json guarda el hash de cada
consulta y de su resultado, y verificacion/verificar_capas.py lo comprueba contra las bases.
"""
import datetime as dt
import decimal
import hashlib
import json
import sys

import psycopg2

from comun import BUCKET, PG_DSN, RAIZ, duck

CAPAS = RAIZ / "capas"
SALIDA = RAIZ / "sitio" / "datos"
EVIDENCIA_LAGO = "verificacion/evidencia_lago.json"


def plano(v):
    if isinstance(v, decimal.Decimal):
        return int(v) if v == v.to_integral_value() and abs(v) < 2 ** 53 else float(v)
    if isinstance(v, (dt.date, dt.datetime)):
        return v.isoformat()
    return v


def motor(ruta):
    return ruta.name.rsplit(".", 2)[1]


def texto(ruta):
    return ruta.read_bytes().replace(b"\r\n", b"\n")


class Bases:
    """Abre cada base solo si alguna consulta la usa."""

    def __init__(self):
        self.pg = self.lago = None

    def correr(self, ruta):
        sql = texto(ruta).decode("utf-8")
        if motor(ruta) == "pg":
            if self.pg is None:
                self.pg = psycopg2.connect(PG_DSN)
            with self.pg.cursor() as cur:
                cur.execute(sql)
                columnas = [c.name for c in cur.description]
                filas = cur.fetchall()
        else:
            if self.lago is None:
                self.lago = duck()
                for oro in (RAIZ / "oro").glob("*.sql"):
                    n = oro.stem.split("_", 1)[1]
                    self.lago.execute(f"CREATE VIEW oro_{n} AS SELECT * FROM "
                                      f"read_parquet('s3://{BUCKET}/oro/{n}.parquet')")
            cur = self.lago.execute(sql)
            columnas = [c[0] for c in cur.description]
            filas = cur.fetchall()
        return columnas, [[plano(v) for v in f] for f in filas]

    def cerrar(self):
        if self.pg is not None:
            self.pg.close()


def canonico(columnas, filas):
    return json.dumps({"columnas": columnas, "filas": filas}, ensure_ascii=False,
                      separators=(",", ":")).encode("utf-8")


def sha(datos):
    return hashlib.sha256(datos).hexdigest()


def consultas():
    return sorted(CAPAS.glob("*.sql"))


def nombre(ruta):
    return ruta.name.split(".", 1)[0]


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    SALIDA.mkdir(parents=True, exist_ok=True)
    bases = Bases()
    resumen = []
    try:
        for q in consultas():
            columnas, filas = bases.correr(q)
            datos = canonico(columnas, filas)
            (SALIDA / f"{nombre(q)}.json").write_bytes(datos)
            resumen.append({"consulta": q.name, "motor": motor(q), "datos": f"{nombre(q)}.json",
                            "filas": len(filas), "columnas": columnas,
                            "sha256_consulta": sha(texto(q)), "sha256_datos": sha(datos),
                            "sql": texto(q).decode("utf-8")})
            print(f"{nombre(q):<24}{motor(q):>5}{len(filas):>9,} filas {len(datos) / 1024:>8,.0f} KB")
    finally:
        bases.cerrar()
    # La página de consultas muestra la comparación lago contra almacén tal como la escribió
    # verificar_lago.py; se copia sin cambiar un byte.
    evidencia = (RAIZ / EVIDENCIA_LAGO).read_bytes()
    (SALIDA / "evidencia_lago.json").write_bytes(evidencia)
    manifiesto = {"generado_en": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
                  "consultas": resumen,
                  "evidencia": {"datos": "evidencia_lago.json", "origen": EVIDENCIA_LAGO,
                                "sha256": sha(evidencia)}}
    (SALIDA / "manifiesto.json").write_text(
        json.dumps(manifiesto, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
