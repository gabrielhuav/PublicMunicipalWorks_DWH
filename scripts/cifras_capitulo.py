"""Mide las tres cifras del capítulo de ICOKG que la versión extendida corrige.

Requiere la pila de docker/compose.yml sembrada y con la API arriba:
    docker compose -f docker/compose.yml up -d db api
    python scripts/cifras_capitulo.py

1. Habitantes de Temascaltepec: el capítulo dice 64,844. Sale de la capa 02_municipios del
   sitio del lago, que es el Censo 2020 (ITER) tal como lo devuelve la consulta.
2. Eventos de auditoría de una instancia sembrada: el capítulo dice "about 28,000".
3. Tamaño de la respuesta de /api/public/obras: el capítulo dice 753 kB.
Escribe lakehouse/verificacion/cifras_capitulo.json.
"""
import json
import os
import sys
import urllib.request
from pathlib import Path

import psycopg2

RAIZ = Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "lakehouse" / "verificacion" / "cifras_capitulo.json"
PG = os.environ.get("LAGO_PG", "postgresql://obras:obras_local@localhost:55432/obras_publicas")
API = os.environ.get("OBRAS_API", "http://localhost:5000")


def main():
    capa = json.loads((RAIZ / "lakehouse/sitio/datos/02_municipios.json").read_text(encoding="utf-8"))
    fila = dict(zip(capa["columnas"], next(f for f in capa["filas"] if f[0] == "15086")))
    con = psycopg2.connect(PG)
    with con.cursor() as cur:
        cur.execute("""
            SELECT (SELECT count(*) FROM warehouse.fact_eventos_auditoria),
                   (SELECT count(*) FROM warehouse.fact_eventos_auditoria f
                    JOIN warehouse.dim_tipo_evento t USING (tipo_evento_key)
                    WHERE t.codigo_evento = 'VOTO_EMITIDO'),
                   (SELECT count(*) FROM public.votos_propuestas)""")
        eventos, eventos_voto, votos = cur.fetchone()
    con.close()
    with urllib.request.urlopen(f"{API}/api/public/obras") as r:
        cuerpo = r.read()
    salida = {
        "temascaltepec": {"cvemun": "15086", "pobtot_censo_2020": fila["pobtot"],
                          "fuente": "lakehouse/sitio/datos/02_municipios.json", "capitulo": 64844},
        "eventos_auditoria": {"total": eventos, "de_voto": eventos_voto, "votos": votos,
                              "capitulo": "about 28,000"},
        "api_public_obras": {"bytes": len(cuerpo), "capitulo": "753 kB"},
    }
    SALIDA.write_text(
        json.dumps(salida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(salida, ensure_ascii=False, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
