"""Compara por SHA-256 cada archivo del sitio con lo que sirve GitHub Pages, después de publicar.

    py -3 -I lakehouse/publicar/comprobar_en_vivo.py <carpeta sitio> <url base> <commit>

<carpeta sitio> es `lakehouse/sitio` de la copia pública; <commit> va en la URL de cada archivo
(?v=...) para que la CDN no devuelva una copia vieja. Termina con "distintos: 0" si todo coincide.
"""
import hashlib
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sitio, base, marca = Path(sys.argv[1]), sys.argv[2].rstrip("/") + "/", sys.argv[3]
archivos = sorted(p for p in sitio.rglob("*") if p.is_file())


def bajar(url):
    ultimo = None
    for intento in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "comprobacion-sitio"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.status, r.read()
        except Exception as e:  # noqa: BLE001 - se reintenta y, al final, se reporta
            ultimo = e
            time.sleep(2 * (intento + 1))
    return None, repr(ultimo).encode()


def comprobar(p):
    rel = p.relative_to(sitio).as_posix()
    estado, cuerpo = bajar(f"{base}{rel}?v={marca}")
    local = hashlib.sha256(p.read_bytes()).hexdigest()
    vivo = hashlib.sha256(cuerpo).hexdigest() if estado == 200 else None
    return rel, estado, local == vivo


with ThreadPoolExecutor(16) as ex:
    res = list(ex.map(comprobar, archivos))

malos = [r for r in res if not r[2]]
for rel, estado, _ in malos[:20]:
    print("DISTINTO", estado, rel)
print(f"archivos: {len(res)}, iguales: {len(res) - len(malos)}, distintos: {len(malos)}")
sys.exit(1 if malos else 0)
