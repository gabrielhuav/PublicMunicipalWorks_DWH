"""Rutas, llaves locales y utilidades que comparten los pasos del lago."""
import hashlib
import json
import os
import sys
from pathlib import Path

import boto3
import duckdb
from botocore.config import Config
from pyiceberg.catalog.sql import SqlCatalog

# La consola de Windows usa cp1252 y no puede escribir todo lo que imprimimos.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

RAIZ = Path(__file__).resolve().parents[1]
MANIFIESTO = RAIZ / "fuentes.json"
VERIFICACION = RAIZ / "verificacion"
DATOS = Path(os.environ.get("LAGO_DATOS", RAIZ / "datos"))
CACHE = DATOS / "bronce"
CATALOGO = DATOS / "catalogo.db"

BUCKET = "obras-lago"
S3_EXTREMO = os.environ.get("LAGO_S3", "http://localhost:18333")
S3_LLAVE = os.environ.get("LAGO_S3_LLAVE", "lago_local")
S3_SECRETO = os.environ.get("LAGO_S3_SECRETO", "lago_local_clave")
S3_REGION = os.environ.get("LAGO_S3_REGION", "us-east-1")
PG_DSN = os.environ.get(
    "LAGO_PG", "postgresql://obras:obras_local@localhost:55432/obras_publicas")

CICLOS = (2020, 2021, 2022, 2023, 2024, 2025)
TABLAS_PLATA = ("proyectos", "contratos", "georreferencias", "metas_avances",
                "financiamiento", "observaciones", "localidades", "municipios",
                "rezago_municipal", "cngmd_contratos")


def fuentes():
    return json.loads(MANIFIESTO.read_text(encoding="utf-8"))["fuentes"]


def ruta_local(fuente):
    return CACHE / fuente["ruta_bronce"]


def sha256(ruta):
    h = hashlib.sha256()
    with open(ruta, "rb") as f:
        for bloque in iter(lambda: f.read(1 << 20), b""):
            h.update(bloque)
    return h.hexdigest()


def cliente_s3():
    return boto3.client(
        "s3", endpoint_url=S3_EXTREMO, aws_access_key_id=S3_LLAVE,
        aws_secret_access_key=S3_SECRETO, region_name=S3_REGION,
        config=Config(s3={"addressing_style": "path"},
                      retries={"max_attempts": 5}))


def catalogo():
    DATOS.mkdir(parents=True, exist_ok=True)
    return SqlCatalog("lago", **{
        "uri": f"sqlite:///{CATALOGO.as_posix()}",
        "warehouse": f"s3://{BUCKET}/plata",
        "s3.endpoint": S3_EXTREMO,
        "s3.access-key-id": S3_LLAVE,
        "s3.secret-access-key": S3_SECRETO,
        "s3.region": S3_REGION,
        "s3.path-style-access": "true",
    })


def duck(hilos=None):
    """Conexión DuckDB con acceso al lago y una vista por tabla de plata."""
    con = duckdb.connect()
    if hilos:
        con.execute(f"SET threads={int(hilos)}")
    extremo = S3_EXTREMO.split("://", 1)[1]
    con.execute("INSTALL httpfs; LOAD httpfs; INSTALL iceberg; LOAD iceberg;")
    con.execute(f"""CREATE SECRET lago (TYPE S3, KEY_ID '{S3_LLAVE}',
        SECRET '{S3_SECRETO}', REGION '{S3_REGION}', ENDPOINT '{extremo}',
        URL_STYLE 'path', USE_SSL {str(S3_EXTREMO.startswith('https')).lower()})""")
    cat = catalogo()
    for nombre in TABLAS_PLATA:
        if cat.table_exists(f"plata.{nombre}"):
            meta = cat.load_table(f"plata.{nombre}").metadata_location
            con.execute(f"CREATE VIEW plata_{nombre} AS "
                        f"SELECT * FROM iceberg_scan('{meta}')")
    # La tabla anexa de enlaces (etl/enlaces.py) no es parte de plata ni de sus mediciones.
    if cat.table_exists("anexo.enlaces_contratos"):
        meta = cat.load_table("anexo.enlaces_contratos").metadata_location
        con.execute(f"CREATE VIEW anexo_enlaces_contratos AS SELECT * FROM iceberg_scan('{meta}')")
    return con
