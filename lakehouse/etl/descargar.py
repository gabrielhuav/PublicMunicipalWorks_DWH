"""Baja cada fuente del manifiesto y comprueba sus bytes contra el hash fijado.

Usa curl porque el servidor de SHCP no envía la cadena completa de certificados
y Python no puede validarla. Si un archivo oficial cambia, el paso falla: no se
acepta en silencio una versión distinta de la que se midió.

Uso:  python etl/descargar.py [--solo id] [--fijar]
      --fijar anota bytes y SHA-256 en fuentes.json (solo al agregar una fuente).
"""
import argparse
import json
import subprocess
import sys

from comun import MANIFIESTO, fuentes, ruta_local, sha256

AGENTE = "Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0"


def bajar(fuente):
    destino = ruta_local(fuente)
    destino.parent.mkdir(parents=True, exist_ok=True)
    temporal = destino.with_suffix(destino.suffix + ".parcial")
    subprocess.run(["curl", "-fsSL", "--retry", "3", "-A", AGENTE, "-o",
                    str(temporal), fuente["url"]], check=True)
    temporal.replace(destino)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--solo")
    ap.add_argument("--fijar", action="store_true")
    args = ap.parse_args()

    doc = json.loads(MANIFIESTO.read_text(encoding="utf-8"))
    fallos = 0
    for f in fuentes():
        if args.solo and f["id"] != args.solo:
            continue
        ruta = ruta_local(f)
        if not ruta.exists():
            print(f"bajando {f['id']} ...", flush=True)
            bajar(f)
        tam, suma = ruta.stat().st_size, sha256(ruta)
        if args.fijar:
            original = next(x for x in doc["fuentes"] if x["id"] == f["id"])
            original["bytes"], original["sha256"] = tam, suma
            print(f"fijada  {f['id']}  {tam:>13,}  {suma[:16]}")
        elif tam != f["bytes"] or suma != f["sha256"]:
            print(f"FALLA   {f['id']}: {tam:,} bytes, {suma[:16]}; "
                  f"se esperaba {f['bytes']:,}, {f['sha256'][:16]}")
            fallos += 1
        else:
            print(f"ok      {f['id']}  {tam:>13,}  {suma[:16]}")
    if args.fijar:
        MANIFIESTO.write_text(
            json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"fuentes con fallo: {fallos}")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
