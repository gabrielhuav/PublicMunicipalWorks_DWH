"""Comprueba que el sitio publicado es lo que devuelven las bases de datos.

Repite cada consulta de capas/ en su motor y compara el resultado, byte por byte en forma
canónica, con sitio/datos/. En las consultas repartidas por una columna compara cada parte y
que no sobre ni falte ninguna. Falla si una consulta cambió, si un archivo se editó a mano o si
el almacén o el lago ya no devuelven lo mismo. Escribe el resultado en evidencia_capas.txt.
"""
import datetime as dt
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "etl"))
from comun import RAIZ  # noqa: E402
from exportar_capas import (SALIDA, Bases, canonico, consultas, motor, nombre, particion,  # noqa: E402
                            repartir, sha, texto)

EVIDENCIA = Path(__file__).resolve().parent / "evidencia_capas.txt"


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    manifiesto = json.loads((SALIDA / "manifiesto.json").read_text(encoding="utf-8"))
    declaradas = {c["consulta"]: c for c in manifiesto["consultas"]}
    lineas = [f"Evidencia de las capas del sitio, generada {dt.datetime.now(dt.timezone.utc):%Y-%m-%d %H:%M} UTC",
              f"Exportación comprobada: {manifiesto['generado_en']}", ""]
    fallos = 0

    def decir(ok, linea):
        nonlocal fallos
        fallos += 0 if ok else 1
        lineas.append(f"[{'OK ' if ok else 'MAL'}] {linea}")
        print(lineas[-1])

    bases = Bases()
    try:
        rutas = consultas()
        decir({q.name for q in rutas} == set(declaradas), f"{len(rutas)} consultas, las mismas del manifiesto")
        for q in rutas:
            d = declaradas.get(q.name)
            if d is None:
                decir(False, f"{q.name}: no está en el manifiesto")
                continue
            columnas, filas = bases.correr(q)
            datos = canonico(columnas, filas)
            bien = (sha(datos) == d["sha256_datos"] and sha(texto(q)) == d["sha256_consulta"]
                    and texto(q).decode("utf-8") == d["sql"])
            col = particion(q)
            if col is None:
                bien = bien and sha((SALIDA / d["datos"]).read_bytes()) == d["sha256_datos"]
                detalle = ""
            else:
                carpeta = SALIDA / nombre(q)
                _, partes = repartir(columnas, filas, col)
                indice = json.loads((carpeta / "indice.json").read_text(encoding="utf-8"))
                en_disco = {p.stem for p in carpeta.glob("*.json") if p.name != "indice.json"}
                bien = (bien and en_disco == set(partes) == set(indice["archivos"])
                        and all(sha((carpeta / f"{v}.json").read_bytes()) == sha(c) == indice["archivos"][v]
                                for v, c in partes.items()))
                detalle = f" en {len(partes):,} archivos por {col}"
            decir(bien, f"{nombre(q):<22} {motor(q):<4} {len(filas):>9,} filas{detalle}  sha256 {sha(datos)[:16]}")
    finally:
        bases.cerrar()
    for e in manifiesto["copias"]:
        origen = (RAIZ / e["origen"]).read_bytes()
        decir(sha(origen) == e["sha256"] == sha((SALIDA / e["datos"]).read_bytes()),
              f"{e['datos']} es copia exacta de {e['origen']}")

    lineas += ["", f"verificaciones fallidas: {fallos}"]
    print(lineas[-1])
    EVIDENCIA.write_text("\n".join(lineas) + "\n", encoding="utf-8", newline="\n")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
