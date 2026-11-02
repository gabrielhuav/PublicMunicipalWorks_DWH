"""Materializa el grafo desde el almacén y comprueba cada consulta SPARQL contra SQL.

Nada del grafo se escribe a mano: morph-kgc aplica mapeo.r2rml.ttl sobre PostgreSQL. Cada
archivo consultas/*.rq tiene su gemelo .sql y sus resultados se comparan por SHA-256, así
una tripleta perdida en el mapeo no pasa inadvertida.

Va en un entorno aparte (grafo/requirements.txt): morph-kgc fija otras versiones de pandas.

Uso:  python grafo/materializar.py
"""
import decimal
import gzip
import hashlib
import json
import os
import re
import sys
import tempfile
import time
from pathlib import Path

import morph_kgc
import psycopg2
import pyoxigraph

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

GRAFO = Path(__file__).resolve().parent
RAIZ = GRAFO.parent
DATOS = Path(os.environ.get("LAGO_DATOS", RAIZ / "datos"))
PG = os.environ.get("LAGO_PG", "postgresql://obras:obras_local@localhost:55432/obras_publicas")
ALQUIMIA = PG.replace("postgresql://", "postgresql+psycopg2://")


def materializar():
    # El conector entrega los NULL como "None": sin esto, el grafo afirmaría un dato inexistente.
    cfg = (f"[CONFIGURATION]\noutput_format=N-TRIPLES\nna_values=,#N/A,N/A,NULL,None,none,nan,NaN\n\n"
           f"[DataSource1]\nmappings={(GRAFO / 'mapeo.r2rml.ttl').as_posix()}\ndb_url={ALQUIMIA}\n")
    fh = tempfile.NamedTemporaryFile("w", suffix=".ini", delete=False, encoding="utf-8")
    fh.write(cfg)
    fh.close()
    try:
        return morph_kgc.materialize_oxigraph(fh.name)
    finally:
        os.unlink(fh.name)


def texto(v):
    if v is None:
        return ""
    if isinstance(v, decimal.Decimal):
        return f"{v:.2f}"
    if isinstance(v, pyoxigraph.Literal):
        if v.datatype.value.endswith("#decimal"):
            return f"{decimal.Decimal(v.value):.2f}"
        return v.value
    if isinstance(v, pyoxigraph.NamedNode):
        return v.value
    return str(v)


def huella(filas):
    h = hashlib.sha256()
    for f in filas:
        h.update(("|".join(texto(v) for v in f) + "\n").encode("utf-8"))
    return h.hexdigest()


def main():
    inicio = time.time()
    tienda = materializar()
    tienda.load(str(GRAFO / "esquema.ttl"), mime_type="text/turtle")
    tripletas = len(tienda)
    segundos = time.time() - inicio
    print(f"{tripletas:,} tripletas en {segundos:.1f} s", flush=True)

    destino = DATOS / "publicar"
    destino.mkdir(parents=True, exist_ok=True)
    ruta = destino / "grafo_entidad_15.nt.gz"
    with gzip.open(ruta, "wb") as f:
        tienda.dump(f, "application/n-quads")

    pg = psycopg2.connect(PG)
    pg.autocommit = True
    cur = pg.cursor()
    fallos, consultas = 0, {}
    for rq in sorted((GRAFO / "consultas").glob("*.rq")):
        sparql = rq.read_text(encoding="utf-8")
        inicio = time.perf_counter()
        resultado = tienda.query(sparql)
        filas = [[s[v] for v in resultado.variables] for s in resultado]
        ms = (time.perf_counter() - inicio) * 1000
        cur.execute(rq.with_suffix(".sql").read_text(encoding="utf-8"))
        filas_sql = cur.fetchall()
        igual = huella(filas) == huella(filas_sql)
        fallos += not igual
        consultas[rq.stem] = {"filas": len(filas), "ms": round(ms, 1), "igual": igual,
                              "sha256": huella(filas)}
        print(f"  {'ok   ' if igual else 'FALLA'} {rq.stem:<28} {len(filas):>4} filas {ms:>9.1f} ms", flush=True)
        if not igual:
            for a, b in zip(filas, filas_sql):
                if huella([a]) != huella([b]):
                    print("     rq :", [texto(x) for x in a], "\n     sql:", [texto(x) for x in b])
                    break

    clases = {}
    for s in tienda.query("SELECT ?c (COUNT(?s) AS ?n) WHERE { ?s a ?c } GROUP BY ?c"):
        clases[s["c"].value.rsplit("/", 1)[-1].rsplit("#", 1)[-1]] = int(s["n"].value)
    evidencia = {"tripletas": tripletas, "segundos_materializacion": round(segundos, 1),
                 "bytes_gz": ruta.stat().st_size, "clases": clases, "consultas": consultas,
                 "fallos": fallos}
    (RAIZ / "verificacion" / "evidencia_grafo.json").write_text(
        json.dumps(evidencia, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    print(f"{ruta.stat().st_size / 1e6:.1f} MB; fallos: {fallos}")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
