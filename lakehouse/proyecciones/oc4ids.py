"""Proyecta el lago a OC4IDS 0.9 y valida cada proyecto contra el esquema oficial.

El capítulo dejó esta proyección como trabajo futuro. Aquí se mide lo que importa a
quien quiera publicar con ese estándar: cuántos proyectos validan y qué campos se
pueden llenar con lo que SHCP publica. Un campo sin dato se omite, no se rellena, y
la clasificación de SHCP solo se traduce cuando hay un sector equivalente.

Dos límites que no resuelve un script. El estándar pide que el id empiece con un
prefijo registrado y este proyecto no tiene uno, así que el id es el folio. Y el
resultado es una proyección de investigación, no una publicación oficial de SHCP.

Los contratistas se incluyen solo si el nombre es de una persona moral: la fuente
también trae personas físicas, y una proyección pública no debe repetirlas.

Uso:  python proyecciones/oc4ids.py [--entidad 15]
"""
import argparse
import gzip
import json
import re
import sys
import time
from collections import Counter
from datetime import date
from pathlib import Path

from jsonschema import Draft4Validator, FormatChecker

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "etl"))
from comun import BUCKET, DATOS, VERIFICACION, duck, fuentes  # noqa: E402

ESQUEMAS = Path(__file__).resolve().parent / "esquema"
CONSULTADO = "2026-11-02T00:00:00-06:00"

ESTATUS = {"Terminado": "completion", "En Ejecución": "implementation",
           "Cancelado": "cancelled"}
SECTOR = {"Transportes y vialidades": ["transport", "transport.road"],
          "Agua y saneamiento": ["waterAndWaste"], "Educación": ["education"],
          "Salud": ["health"], "Vivienda": ["socialHousing"],
          "Deporte": ["cultureSportsAndRecreation"],
          "Cultura y turismo": ["cultureSportsAndRecreation"],
          "Comunicaciones": ["communications"]}
METODO = (("Adjudicaci", "direct"), ("Invitaci", "limited"), ("Licitaci", "open"))
PERSONA_MORAL = re.compile(
    r"\b(S\.?\s*A\.?|S\.?\s*DE\s*R\.?\s*L\.?|S\.?\s*A\.?\s*S\.?|S\.?\s*C\.?|A\.?\s*C\.?|SAPI)\b"
    r"|CONSTRUCTORA|CONSTRUCCIONES|GRUPO|ARRENDADORA|INGENIER[IÍ]A", re.I)


def valor(monto):
    return {"amount": float(monto), "currency": "MXN"}


def instante(d):
    return f"{d.isoformat()}T00:00:00-06:00"


def contrato(c):
    resumen = {"externalReference": c["numero_contrato"]} if c["numero_contrato"] else {}
    if c["tipo_contratacion"] == "Obra":
        resumen["nature"] = ["construction"]
    if c["modalidad"]:
        metodo = next((m for p, m in METODO if c["modalidad"].startswith(p)), None)
        resumen["tender"] = {"procurementMethodDetails": c["modalidad"]}
        if metodo:
            resumen["tender"]["procurementMethod"] = metodo
    if c["monto"] is not None:
        resumen["contractValue"] = valor(c["monto"])
    if c["contratista"] and PERSONA_MORAL.search(c["contratista"]):
        resumen["suppliers"] = [{"name": c["contratista"]}]
    return {"id": c["id_contrato"] or c["numero_contrato"], "summary": resumen}


def proyecto(p, contratos):
    salida = {"id": p["folio"], "updated": CONSULTADO, "language": "es", "title": p["nombre"],
              "identifiers": [{"id": p["folio"], "scheme": "MX-SHCP-SRFT"}]}
    if p["estatus"] in ESTATUS:
        salida["status"] = ESTATUS[p["estatus"]]
    if p["clasificacion"] in SECTOR:
        salida["sector"] = SECTOR[p["clasificacion"]]
    periodo = {}
    if p["fecha_inicio"]:
        periodo["startDate"] = instante(p["fecha_inicio"])
    if p["fecha_termino"] and p["fecha_termino"] >= date(1990, 1, 1):
        periodo["endDate"] = instante(p["fecha_termino"])
    if periodo:
        salida["period"] = periodo
    if p["aprobado"] is not None:
        salida["budget"] = {"amount": valor(p["aprobado"])}
    if p["institucion_ejecutora"]:
        autoridad = {"id": "ejecutora", "name": p["institucion_ejecutora"]}
        salida["publicAuthority"] = autoridad
        salida["parties"] = [{**autoridad, "roles": ["publicAuthority"]}]
    if p["lat"] is not None:
        salida["locations"] = [{
            "id": "1", "description": f"{p['municipio']}, {p['entidad']}",
            "geometry": {"type": "Point", "coordinates": [p["lon"], p["lat"]]}}]
    if p["estatus"] == "Terminado" and p["pagado"] is not None:
        salida["completion"] = {"finalValue": valor(p["pagado"])}
    if p["pct_fisico"] is not None:
        salida["metrics"] = [{"id": "avance_fisico", "title": "Avance físico",
                              "observations": [{"id": str(p["ciclo"]),
                                                "measure": float(p["pct_fisico"]),
                                                "unit": {"name": "porcentaje"}}]}]
    if contratos:
        salida["contractingProcesses"] = [contrato(c) for c in contratos]
    return salida


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--entidad", type=int, default=15)
    args = ap.parse_args()

    con = duck()
    con.execute(f"CREATE VIEW oro_proyecto_ciclo AS SELECT * FROM "
                f"read_parquet('s3://{BUCKET}/oro/proyecto_ciclo.parquet')")
    cur = con.execute(f"""
        SELECT * FROM oro_proyecto_ciclo WHERE id_entidad = {args.entidad}
        AND categoria = 'Proyecto de inversión'
        QUALIFY row_number() OVER (PARTITION BY folio ORDER BY ciclo DESC) = 1
        ORDER BY folio""")
    nombres = [d[0] for d in cur.description]
    proyectos = [dict(zip(nombres, f)) for f in cur.fetchall()]
    # Todos los ciclos del folio, para no perder contratos de años anteriores.
    cur = con.execute(f"""
        SELECT DISTINCT c.folio, coalesce(c.id_contrato, c.numero_contrato) AS id_contrato,
               c.numero_contrato, c.tipo_contratacion, c.modalidad, c.monto, c.contratista
        FROM plata_contratos c
        WHERE c.folio IN (SELECT folio FROM oro_proyecto_ciclo WHERE id_entidad = {args.entidad})
          AND coalesce(c.id_contrato, c.numero_contrato) IS NOT NULL""")
    nombres = [d[0] for d in cur.description]
    por_folio = {}
    vistos = Counter()
    for f in cur.fetchall():
        c = dict(zip(nombres, f))
        vistos[(c["folio"], c["id_contrato"])] += 1
        if vistos[(c["folio"], c["id_contrato"])] == 1:
            por_folio.setdefault(c["folio"], []).append(c)

    esquema = json.loads((ESQUEMAS / "project-schema.json").read_text(encoding="utf-8"))
    validador = Draft4Validator(esquema, format_checker=FormatChecker())
    inicio = time.time()
    resultado, errores, campos, ejemplos = [], Counter(), Counter(), {}
    sin_proveedor = con_proveedor = 0
    for p in proyectos:
        d = proyecto(p, por_folio.get(p["folio"], []))
        fallas = list(validador.iter_errors(d))
        for e in fallas:
            clave = "/".join(str(x) for x in e.absolute_path if not isinstance(x, int)) or e.validator
            errores[clave] += 1
            ejemplos.setdefault(clave, e.message[:160])
        campos.update(d.keys())
        for cp in d.get("contractingProcesses", []):
            if "suppliers" in cp["summary"]:
                con_proveedor += 1
            else:
                sin_proveedor += 1
        resultado.append(d)
    segundos = time.time() - inicio

    n = len(resultado)
    cobertura = {k: round(100 * campos[k] / n, 1) for k in sorted(esquema["properties"]) if campos[k]}
    vacios = sorted(k for k in esquema["properties"] if not campos[k])
    evidencia = {
        "version_oc4ids": "0.9.5", "entidad": args.entidad, "proyectos": n,
        "con_errores": sum(errores.values()), "errores": dict(errores), "ejemplos": ejemplos,
        "campos_de_primer_nivel": len(esquema["properties"]),
        "campos_con_dato": len(cobertura), "cobertura_pct": cobertura, "sin_dato": vacios,
        "contratos": con_proveedor + sin_proveedor, "contratos_con_proveedor": con_proveedor,
        "segundos_validacion": round(segundos, 1),
        "fuentes": [f["sha256"][:16] for f in fuentes() if f["id"].startswith("shcp")],
    }
    (VERIFICACION / "evidencia_oc4ids.json").write_text(
        json.dumps(evidencia, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    paquete = {
        "uri": "https://github.com/gabrielhuav/PublicMunicipalWorks_DWH",
        "publisher": {"name": "Proyección de investigación sobre datos abiertos de SHCP"},
        "publishedDate": CONSULTADO, "version": "0.9", "projects": resultado}
    destino = DATOS / "publicar"
    destino.mkdir(parents=True, exist_ok=True)
    ruta = destino / f"oc4ids_entidad_{args.entidad:02d}.json.gz"
    with gzip.open(ruta, "wt", encoding="utf-8") as f:
        json.dump(paquete, f, ensure_ascii=False)
    print(f"{n:,} proyectos, {evidencia['con_errores']} errores, {len(cobertura)} de "
          f"{len(esquema['properties'])} campos, {segundos:.1f} s, {ruta.stat().st_size / 1e6:.1f} MB")
    for k, v in ejemplos.items():
        print(" ", k, errores[k], v)
    print(cobertura)
    print("sin dato:", vacios)
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
