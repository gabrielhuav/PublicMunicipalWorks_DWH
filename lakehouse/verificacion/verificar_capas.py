"""Comprueba que el sitio publicado es lo que devuelven las bases de datos.

Repite cada consulta de capas/ en su motor y compara el resultado, byte por byte en forma
canónica, con sitio/datos/. Falla si una consulta cambió, si un archivo se editó a mano o si
el almacén o el lago ya no devuelven lo mismo. Escribe el resultado en evidencia_capas.txt.
"""
import datetime as dt
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "etl"))
from comun import RAIZ  # noqa: E402
from exportar_capas import SALIDA, Bases, canonico, consultas, motor, nombre, sha, texto  # noqa: E402

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
        decir({q.name for q in rutas} == set(declaradas),
              f"{len(rutas)} consultas, las mismas del manifiesto")
        for q in rutas:
            d = declaradas.get(q.name)
            if d is None:
                decir(False, f"{q.name}: no está en el manifiesto")
                continue
            datos = canonico(*bases.correr(q))
            archivo = (SALIDA / d["datos"]).read_bytes()
            iguales = sha(datos) == d["sha256_datos"] == sha(archivo)
            mismo_sql = sha(texto(q)) == d["sha256_consulta"] and texto(q).decode("utf-8") == d["sql"]
            filas = len(json.loads(datos)["filas"])
            decir(iguales and mismo_sql,
                  f"{nombre(q):<22} {motor(q):<4} {filas:>7,} filas  sha256 {sha(datos)[:16]}")
    finally:
        bases.cerrar()
    e = manifiesto["evidencia"]
    origen = (RAIZ / e["origen"]).read_bytes()
    decir(sha(origen) == e["sha256"] == sha((SALIDA / e["datos"]).read_bytes()),
          f"{e['datos']} es copia exacta de {e['origen']}")

    lineas += ["", f"verificaciones fallidas: {fallos}"]
    print(lineas[-1])
    EVIDENCIA.write_text("\n".join(lineas) + "\n", encoding="utf-8", newline="\n")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
