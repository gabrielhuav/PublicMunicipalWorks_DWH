"""Reconstruye el lago desde las fuentes oficiales y lo verifica.

Requiere el almacén (docker/compose.yml, servicio db) y el almacén de objetos
(lakehouse/compose.yml) en marcha. Es repetible: plata se recrea y las tablas nuevas
del almacén se vuelven a cargar, sin tocar las originales.

Uso:  python etl/ejecutar.py [--repeticiones 20]
"""
import argparse
import subprocess
import sys

from comun import RAIZ


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--repeticiones", default="20")
    args = ap.parse_args()
    for paso in ("descargar.py", "bronce.py", "plata.py", "oro.py", "almacen.py"):
        print(f"== {paso}", flush=True)
        subprocess.run([sys.executable, str(RAIZ / "etl" / paso)], check=True)
    print("== verificar_lago.py", flush=True)
    return subprocess.run([sys.executable, str(RAIZ / "verificacion" / "verificar_lago.py"),
                           "--repeticiones", args.repeticiones]).returncode


if __name__ == "__main__":
    sys.exit(main())
