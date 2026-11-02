"""Tabla anexa del lago con los enlaces que cada dependencia publicó con sus contratos.

    python lakehouse/etl/enlaces.py

Desde 2023, los contratos de SHCP traen dos columnas de enlaces, URL y URL_DOCUMENTO, que
llena la dependencia: carpetas de Google Drive, portales estatales de transparencia, PDF. El
sitio los enseña en la ficha de cada proyecto, para que se pueda ir de un punto del mapa a lo
que reportó quien hizo la obra. Nadie revisó su contenido: son lo que la dependencia publicó.

Se guardan en anexo.enlaces_contratos y no en plata, que ya está medida con sus diez tablas.
Como en plata, cada ciclo es una instantánea ligada al SHA-256 de su archivo oficial, y el texto
se guarda tal cual lo reportó la fuente.
"""
import json
import sys
import zipfile

import pyarrow as pa

from comun import BUCKET, VERIFICACION, catalogo, fuentes, ruta_local
from plata import ENT, RUTAS, TXT, a_tabla, leer_csv

CICLOS_CON_ENLACES = (2023, 2024, 2025)
ESQUEMA = pa.schema([
    ("folio", TXT), ("ciclo", ENT), ("id_entidad", ENT), ("numero_contrato", TXT),
    ("url", TXT), ("url_documento", TXT)])


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    cat = catalogo()
    cat.create_namespace_if_not_exists("anexo")
    if cat.table_exists("anexo.enlaces_contratos"):
        cat.purge_table("anexo.enlaces_contratos")
    # Prefijo propio en el bucket: así no cuenta en el tamaño que se mide para plata.
    tabla = cat.create_table("anexo.enlaces_contratos", schema=ESQUEMA,
                             location=f"s3://{BUCKET}/anexo/enlaces_contratos",
                             properties={"write.parquet.compression-codec": "zstd"})
    with tabla.update_spec() as u:
        u.add_identity("ciclo")
        u.add_identity("id_entidad")

    por_id = {f["id"]: f for f in fuentes()}
    evidencia = {}
    for ciclo in CICLOS_CON_ENLACES:
        fuente = por_id[f"shcp_ef{ciclo}"]
        with zipfile.ZipFile(ruta_local(fuente)) as z:
            df, ev = leer_csv(z, f"{RUTAS[ciclo]}contratos.csv",
                              {"FOLIO", "ID_ENTIDAD_FEDERATIVA", "NUMERO_CONTRATO", "URL", "URL_DOCUMENTO"})
        df = df.rename(columns={"FOLIO": "folio", "ID_ENTIDAD_FEDERATIVA": "id_entidad",
                                "NUMERO_CONTRATO": "numero_contrato", "URL": "url",
                                "URL_DOCUMENTO": "url_documento"})
        df["ciclo"] = str(ciclo)
        malos = {}
        t = a_tabla(df, ESQUEMA, malos)
        tabla.append(t.sort_by([("id_entidad", "ascending"), ("folio", "ascending")]),
                     snapshot_properties={"ciclo": str(ciclo), "fuente_sha256": fuente["sha256"]})
        enlace = df.url.str.match(r"https?://", case=False) | df.url_documento.str.match(r"https?://", case=False)
        ev.update(no_convertidos=malos, con_enlace_http=int(enlace.sum()))
        evidencia[str(ciclo)] = ev
        print(f"  {ciclo} enlaces_contratos {t.num_rows:>9,} filas, {int(enlace.sum()):,} con enlace http")
    (VERIFICACION / "evidencia_enlaces.json").write_text(
        json.dumps(evidencia, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
