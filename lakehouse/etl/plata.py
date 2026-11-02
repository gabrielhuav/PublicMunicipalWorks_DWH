"""Capa plata: tablas Iceberg con un esquema único sobre fuentes que cambian cada año.

Los informes definitivos de SHCP cambian de nombres de columna entre ciclos
(MONTO_GLOBAL_APROBADO y APROBADO, ID_MUNICIPIO_RESPONSABLE e ID_MUNICIPIO) y en
2020 separan metas y avances en dos archivos. Aquí se resuelve eso una sola vez.

Cada ciclo entra como una instantánea de Iceberg cuyas propiedades guardan el
SHA-256 del archivo oficial, así que el linaje de cualquier fila llega hasta la
capa bronce y el viaje en el tiempo reproduce el lago tal como estaba. La columna
USUARIO de las observaciones no sube a plata: identifica a personas y no aporta
nada al análisis. Sigue en bronce, dentro del archivo oficial.

Uso:  python etl/plata.py [--ciclos 2024 2025]
"""
import argparse
import hashlib
import io
import json
import re
import sys
import time
import warnings
import zipfile

import numpy as np
import pandas as pd
import pyarrow as pa

from comun import CICLOS, VERIFICACION, catalogo, fuentes, ruta_local

RUTAS = {
    2020: "cuarto_trimestre_informe_definitivo/",
    2021: "ef2021/cuarto_trimestre_informe_definitivo/",
    2022: "ef2022/cuarto_informe_definitivo/",
    2023: "ef2023/cuarto_informe_definitivo/",
    2024: "ef2024/",
    2025: "",
}

TXT, ENT, LARGO, REAL, FECHA = (pa.string(), pa.int32(), pa.int64(),
                                pa.float64(), pa.date32())
# Precisión 20: PyIceberg 0.9 rechaza su propio Parquet con decimales de 18 o menos.
DINERO = pa.decimal128(20, 2)

PROYECTOS = pa.schema([
    ("folio", TXT), ("ciclo", ENT), ("periodo", ENT),
    ("id_entidad", ENT), ("entidad", TXT), ("id_municipio", ENT), ("municipio", TXT),
    ("id_categoria", ENT), ("categoria", TXT),
    ("id_tipo_programa", ENT), ("tipo_programa", TXT),
    ("id_clasificacion", ENT), ("clasificacion", TXT),
    ("nombre", TXT), ("institucion_ejecutora", TXT), ("numero_proyecto", TXT),
    ("poblacion_beneficiada", TXT), ("mujeres", LARGO), ("hombres", LARGO),
    ("beneficiarios", LARGO), ("fecha_inicio", FECHA), ("fecha_termino", FECHA),
    ("aprobado", DINERO), ("recaudado", DINERO), ("comprometido", DINERO),
    ("devengado", DINERO), ("ejercido", DINERO), ("pagado", DINERO),
    ("id_estatus", ENT), ("estatus", TXT), ("flujo", TXT)])

CONTRATOS = pa.schema([
    ("folio", TXT), ("ciclo", ENT), ("id_entidad", ENT), ("tipo_contratacion", TXT),
    ("id_contrato", TXT), ("numero_contrato", TXT), ("modalidad", TXT),
    ("compranet", TXT), ("contratista", TXT), ("convocante", TXT),
    ("rfc_convocante", TXT), ("monto", DINERO), ("monto_modificado", DINERO),
    ("fecha_firma", FECHA), ("estatus_contrato", TXT), ("fecha_conclusion", FECHA)])

GEO = pa.schema([
    ("folio", TXT), ("ciclo", ENT), ("id_entidad", ENT), ("id_municipio", ENT),
    ("id_localidad", ENT), ("localidad", TXT), ("tipo_geometria", TXT),
    ("direccion", TXT), ("lat", REAL), ("lon", REAL)])

METAS = pa.schema([
    ("folio", TXT), ("ciclo", ENT), ("id_entidad", ENT), ("periodo", ENT),
    ("id_unidad", ENT), ("unidad", TXT), ("meta", REAL),
    ("meta_modificada", REAL), ("avance_fisico", REAL)])

FINANCIAMIENTO = pa.schema([
    ("folio", TXT), ("ciclo", ENT), ("id_entidad", ENT), ("periodo", ENT),
    ("ciclo_recurso", ENT), ("ramo", TXT), ("modalidad", TXT), ("programa", TXT),
    ("tipo_recurso", TXT), ("monto_aprobado", DINERO), ("monto_modificado", DINERO)])

OBSERVACIONES = pa.schema([
    ("folio", TXT), ("ciclo", ENT), ("id_entidad", ENT), ("periodo", ENT),
    ("origen", TXT), ("etapa", TXT), ("tipo", TXT), ("observacion", TXT),
    ("fecha", FECHA)])

LOCALIDADES = pa.schema([
    ("cvegeo", TXT), ("id_entidad", ENT), ("id_municipio", ENT), ("id_localidad", ENT),
    ("entidad", TXT), ("municipio", TXT), ("localidad", TXT),
    ("lat", REAL), ("lon", REAL), ("altitud", ENT), ("pobtot", LARGO)])

MUNICIPIOS = pa.schema([
    ("cvemun", TXT), ("id_entidad", ENT), ("id_municipio", ENT), ("entidad", TXT),
    ("municipio", TXT), ("pobtot", LARGO), ("pobfem", LARGO), ("pobmas", LARGO),
    ("localidades", ENT)])

REZAGO = pa.schema([
    ("cvemun", TXT), ("id_entidad", ENT), ("id_municipio", ENT), ("poblacion", LARGO),
    ("irs", REAL), ("grado", TXT), ("lugar", ENT)])

CNGMD = pa.schema([
    ("cvemun", TXT), ("materia", ENT), ("materia_nombre", TXT),
    ("contratos_total", LARGO), ("contratos_ad", LARGO), ("contratos_inv", LARGO),
    ("contratos_lic", LARGO), ("monto_total", DINERO), ("monto_ad", DINERO),
    ("monto_inv", DINERO), ("monto_lic", DINERO)])

ESQUEMAS = {
    "proyectos": (PROYECTOS, ("ciclo", "id_entidad")),
    "contratos": (CONTRATOS, ("ciclo", "id_entidad")),
    "georreferencias": (GEO, ("ciclo", "id_entidad")),
    "metas_avances": (METAS, ("ciclo", "id_entidad")),
    "financiamiento": (FINANCIAMIENTO, ("ciclo", "id_entidad")),
    "observaciones": (OBSERVACIONES, ("ciclo",)),
    "localidades": (LOCALIDADES, ("id_entidad",)),
    "municipios": (MUNICIPIOS, ()),
    "rezago_municipal": (REZAGO, ()),
    "cngmd_contratos": (CNGMD, ()),
}

# Sinónimos entre ciclos, ya en mayúsculas. El contexto de cada tabla decide los
# ambiguos (ESTATUS es del proyecto en ef, del contrato no).
PROY = {"MONTO_GLOBAL_APROBADO": "APROBADO", "ID_MUNICIPIO_RESPONSABLE": "ID_MUNICIPIO",
        "MUNICIPIO_RESPONSABLE": "MUNICIPIO", "ID_TIPO_CLASIFICACION": "ID_CLASIFICACION",
        "MONTO_RECAUDADO": "RECAUDADO", "MONTO_COMPROMETIDO": "COMPROMETIDO",
        "MONTO_DEVENGADO": "DEVENGADO", "MONTO_EJERCIDO": "EJERCIDO",
        "MONTO_PAGADO": "PAGADO", "ID_ESTATUS_PROYECTO": "ID_ESTATUS",
        "DESC_ESTATUS": "ESTATUS"}
COL_PROY = {"FOLIO": "folio", "CICLO": "ciclo", "TRIMESTRE": "periodo",
            "ID_CATEGORIA": "id_categoria", "CATEGORIA": "categoria",
            "APROBADO": "aprobado", "NOMBRE": "nombre",
            "ID_ENTIDAD_FEDERATIVA": "id_entidad", "ENTIDAD_FEDERATIVA": "entidad",
            "ID_MUNICIPIO": "id_municipio", "MUNICIPIO": "municipio",
            "ID_TIPO_PROGRAMA_PROYECTO": "id_tipo_programa",
            "TIPO_PROGRAMA_PROYECTO": "tipo_programa",
            "ID_CLASIFICACION": "id_clasificacion", "CLASIFICACION": "clasificacion",
            "INSTITUCION_EJECUTORA": "institucion_ejecutora",
            "NUMERO_PROYECTO": "numero_proyecto",
            "POBLACION_BENEFICIADA": "poblacion_beneficiada", "MUJERES": "mujeres",
            "HOMBRES": "hombres", "BENEFICIARIOS": "beneficiarios",
            "FECHA_INICIO": "fecha_inicio", "FECHA_ESTIMADA_TERMINO": "fecha_termino",
            "RECAUDADO": "recaudado", "COMPROMETIDO": "comprometido",
            "DEVENGADO": "devengado", "EJERCIDO": "ejercido", "PAGADO": "pagado",
            "ID_ESTATUS": "id_estatus", "ESTATUS": "estatus", "FLUJO": "flujo"}

INDEFINIDOS = re.compile(rb"[\x81\x8d\x8f\x90\x9d]")


def leer_csv(z, miembro, utiles=None, codificacion="cp1252"):
    """Lee un CSV del ZIP como texto. Devuelve datos y evidencia de la lectura."""
    crudo = z.read(miembro)
    utiles = {u.upper() for u in utiles} if utiles else None
    with warnings.catch_warnings(record=True) as avisos:
        warnings.simplefilter("always")
        df = pd.read_csv(
            io.BytesIO(crudo), dtype=str, keep_default_na=False, encoding=codificacion,
            encoding_errors="replace", on_bad_lines="warn", low_memory=False,
            usecols=(lambda c: c.upper().strip().lstrip("ï»¿") in utiles) if utiles else None)
    df.columns = [c.upper().strip().lstrip("ï»¿") for c in df.columns]
    evidencia = {
        "sha256_csv": hashlib.sha256(crudo).hexdigest(),
        "bytes": len(crudo),
        "filas": len(df),
        "lineas_descartadas": sum(str(a.message).count("Skipping line") for a in avisos),
        "bytes_sin_definir": len(INDEFINIDOS.findall(crudo)) if codificacion == "cp1252" else 0,
    }
    return df, evidencia


def dinero(s):
    v = pd.to_numeric(s.str.replace(",", "", regex=False), errors="coerce")
    v = v.where(np.isfinite(v) & (v.abs() < 1e15))
    texto = pd.Series(np.where(v.isna(), None, np.char.mod("%.2f", v.fillna(0).round(2))),
                      dtype=object)
    return pa.array(texto, type=pa.string()).cast(DINERO), v.isna()


def a_tabla(df, esquema, malos):
    """Convierte texto a los tipos del esquema y cuenta lo que no se pudo convertir."""
    n, columnas = len(df), []
    df = df.reset_index(drop=True)
    for campo in esquema:
        if campo.name not in df:
            columnas.append(pa.nulls(n, campo.type))
            continue
        s = df[campo.name].astype(str).str.strip()
        lleno = s != ""
        if campo.type == TXT:
            columnas.append(pa.array(s.where(lleno, None), type=TXT, from_pandas=True))
            continue
        if campo.type == DINERO:
            arr, nulos = dinero(s)
        elif campo.type == FECHA:
            v = pd.to_datetime(s, format="%d/%m/%Y", errors="coerce")
            resto = v.isna() & lleno
            if resto.any():
                v[resto] = pd.to_datetime(s[resto], errors="coerce", format="mixed",
                                          dayfirst=True)
            arr = pa.array(v, type=pa.timestamp("ns"), from_pandas=True).cast(FECHA)
            nulos = v.isna()
        else:
            v = pd.to_numeric(s.str.replace(",", "", regex=False), errors="coerce")
            v = v.where(np.isfinite(v))
            nulos = v.isna()
            if campo.type == REAL:
                arr = pa.array(v, type=REAL, from_pandas=True)
            else:
                v = v.where(v.abs() < 9e18 if campo.type == LARGO else v.abs() < 2e9)
                nulos = v.isna()
                arr = pa.array(v.round().astype("Int64"), type=LARGO).cast(campo.type)
        fallas = int((nulos & lleno).sum())
        if fallas:
            malos[campo.name] = malos.get(campo.name, 0) + fallas
        columnas.append(arr)
    return pa.Table.from_arrays(columnas, schema=esquema)


def renombrar(df, sinonimos, columnas):
    df = df.rename(columns=sinonimos)
    return df.rename(columns=columnas)


def por_ciclo(ciclo, sha, cat):
    z = zipfile.ZipFile(ruta_local(next(
        f for f in fuentes() if f["id"] == f"shcp_ef{ciclo}")))
    p = RUTAS[ciclo]
    evidencia, resumen = {}, {}

    # Proyectos --------------------------------------------------------------
    utiles = set(COL_PROY) | set(PROY)
    df, ev = leer_csv(z, f"{p}ef{ciclo}.csv", utiles)
    df = renombrar(df, PROY, COL_PROY)
    entidad = (df.assign(k=pd.to_numeric(df.id_entidad, errors="coerce"))
               .drop_duplicates("folio").set_index("folio")["k"])
    guardar(cat, "proyectos", df, PROYECTOS, ciclo, sha, ev, evidencia)
    repetidos = int(df.duplicated(["folio", "periodo"]).sum())
    evidencia["proyectos"]["repetidos_folio_periodo"] = repetidos

    def con_entidad(d):
        d["ciclo"] = str(ciclo)
        d["id_entidad"] = d["folio"].map(entidad)
        d["id_entidad"] = d["id_entidad"].astype("Int64").astype(str).replace("<NA>", "")
        return d

    # Contratos --------------------------------------------------------------
    df, ev = leer_csv(z, f"{p}contratos.csv")
    df = df.rename(columns={
        "FOLIO": "folio", "CONTRATACION": "tipo_contratacion",
        "TIPO_OBRA": "tipo_contratacion", "ID_CONTRATO_ADMINISTRACION": "id_contrato",
        "ID_CONTRATO": "id_contrato", "NUMERO_CONTRATO": "numero_contrato",
        "MODALIDAD_CONTRATACION": "modalidad", "COMPRANET": "compranet",
        "COMPRANET_SN": "compranet", "CONTRATISTA": "contratista",
        "CONVOCANTE": "convocante", "RFC_CONVOCANTE": "rfc_convocante", "MONTO": "monto",
        "MONTO_MODIFICADO": "monto_modificado", "IMPORTE_MODIFICADO": "monto_modificado",
        "FECHA_FIRMA": "fecha_firma", "ESTATUS_CONTRATO": "estatus_contrato",
        "FECHA_CONCLUSION_CONTRATO": "fecha_conclusion"})
    df = df.loc[:, ~df.columns.duplicated()]
    ev["huerfanos"] = int((~df.folio.isin(entidad.index)).sum())
    guardar(cat, "contratos", con_entidad(df), CONTRATOS, ciclo, sha, ev, evidencia)

    # Georreferencias --------------------------------------------------------
    df, ev = leer_csv(z, f"{p}georreferencias.csv")
    df = df.rename(columns={
        "FOLIO": "folio", "ID_ENTIDAD_FEDERATIVA": "id_entidad",
        "ID_MUNICIPIO": "id_municipio", "ID_LOCALIDAD": "id_localidad",
        "LOCALIDAD": "localidad", "DIRECCION": "direccion", "LAT": "lat", "LATITUD": "lat",
        "LON": "lon", "LONGITUD": "lon", "TIPO_GEORREFERENCIA": "tipo_geometria",
        "TIPO_ELEMENTO_GEOMETRICO": "tipo_geometria"})
    df["ciclo"] = str(ciclo)
    ev["huerfanos"] = int((~df.folio.isin(entidad.index)).sum())
    guardar(cat, "georreferencias", df, GEO, ciclo, sha, ev, evidencia)

    # Metas y avance físico --------------------------------------------------
    if ciclo == 2020:
        m, ev = leer_csv(z, f"{p}metas.csv")
        a, ev2 = leer_csv(z, f"{p}avances_fisicos.csv")
        llave = ["FOLIO", "TRIMESTRE", "ID_UNIDAD_MEDIDA"]
        m["_n"] = m.groupby(llave).cumcount()
        a["_n"] = a.groupby(llave).cumcount()
        df = m.merge(a[llave + ["_n", "AVANCE"]], how="left", on=llave + ["_n"])
        df = df.rename(columns={"AVANCE": "AVANCE_FISICO"})
        ev["sha256_csv_avances"] = ev2["sha256_csv"]
    else:
        df, ev = leer_csv(z, f"{p}metas_avances.csv")
    df = df.rename(columns={
        "FOLIO": "folio", "TRIMESTRE": "periodo", "ID_UNIDAD_MEDIDA": "id_unidad",
        "UNIDAD_MEDIDA": "unidad", "META": "meta", "META_MODIFICADA": "meta_modificada",
        "AVANCE_FISICO": "avance_fisico"})
    guardar(cat, "metas_avances", con_entidad(df), METAS, ciclo, sha, ev, evidencia)

    # Fuentes de financiamiento ----------------------------------------------
    df, ev = leer_csv(z, f"{p}fuentes_financiamiento.csv")
    df = df.rename(columns={
        "FOLIO": "folio", "TRIMESTRE": "periodo", "CICLO_RECURSO": "ciclo_recurso",
        "ID_RAMO": "ramo", "RAMO": "ramo", "ID_MODALIDAD": "modalidad",
        "MODALIDAD": "modalidad", "ID_PP": "programa", "PROGR_PRES": "programa",
        "TIPO_RECURSO": "tipo_recurso", "MONTO_APROBADO": "monto_aprobado",
        "MONTO_MODIFICADO": "monto_modificado"})
    guardar(cat, "financiamiento", con_entidad(df), FINANCIAMIENTO, ciclo, sha, ev, evidencia)

    # Observaciones ----------------------------------------------------------
    partes = []
    if ciclo == 2020:
        ev = {"filas": 0, "lineas_descartadas": 0, "bytes": 0, "bytes_sin_definir": 0}
        for origen in ("capturista", "revisor"):
            d, e = leer_csv(z, f"{p}observaciones_{origen}.csv")
            d["origen"] = origen
            partes.append(d)
            for k in ev:
                ev[k] += e[k]
        df = pd.concat(partes, ignore_index=True)
    else:
        df, ev = leer_csv(z, f"{p}observaciones.csv")
    df = df.drop(columns=["USUARIO"], errors="ignore").rename(columns={
        "FOLIO": "folio", "TRIMESTRE": "periodo", "TRIMESTRE_OBSERVACION": "periodo",
        "PERIODO": "periodo", "ETAPA_OBSERVACION": "etapa", "TIPO_OBSERVACION": "tipo",
        "TIPO_OBS": "tipo", "OBSERVACION": "observacion", "FECHA": "fecha"})
    guardar(cat, "observaciones", con_entidad(df), OBSERVACIONES, ciclo, sha, ev, evidencia)
    return evidencia


def guardar(cat, nombre, df, esquema, ciclo, sha, ev, evidencia):
    malos = {}
    t = a_tabla(df, esquema, malos)
    ev["no_convertidos"] = malos
    orden = [(c, "ascending") for c in ("id_entidad", "id_municipio", "folio")
             if c in esquema.names]
    cat.load_table(f"plata.{nombre}").append(
        t.sort_by(orden) if orden else t,
        snapshot_properties={"ciclo": str(ciclo), "fuente_sha256": sha})
    evidencia[nombre] = ev
    print(f"  {ciclo} {nombre:<16} {t.num_rows:>9,} filas", flush=True)


def dms(s):
    m = s.str.extract(r"(\d+)\D+(\d+)\D+([\d.]+)")
    v = (pd.to_numeric(m[0], errors="coerce") + pd.to_numeric(m[1], errors="coerce") / 60
         + pd.to_numeric(m[2], errors="coerce") / 3600)
    return v.round(6).astype(str).where(v.notna(), "")


def referencias(cat):
    ev = {}
    f = {x["id"]: x for x in fuentes()}

    z = zipfile.ZipFile(ruta_local(f["inegi_iter2020"]))
    n = next(i.filename for i in z.infolist()
             if i.filename.endswith(".csv") and "conjunto" in i.filename)
    d, e = leer_csv(z, n, ("ENTIDAD", "NOM_ENT", "MUN", "NOM_MUN", "LOC", "NOM_LOC",
                           "LONGITUD", "LATITUD", "ALTITUD", "POBTOT", "POBFEM", "POBMAS"),
                    codificacion="utf-8-sig")
    base = d.assign(cvemun=d.ENTIDAD + d.MUN, cvegeo=d.ENTIDAD + d.MUN + d.LOC,
                    id_entidad=d.ENTIDAD, id_municipio=d.MUN, id_localidad=d.LOC,
                    entidad=d.NOM_ENT, municipio=d.NOM_MUN, localidad=d.NOM_LOC,
                    altitud=d.ALTITUD, pobtot=d.POBTOT, pobfem=d.POBFEM, pobmas=d.POBMAS)
    loc = base[(base.MUN != "000") & ~base.LOC.isin(("0000", "9998", "9999"))].copy()
    loc["lat"], loc["lon"] = dms(loc.LATITUD), dms(loc.LONGITUD)
    loc["lon"] = "-" + loc["lon"]
    guardar_ref(cat, "localidades", loc, LOCALIDADES, f["inegi_iter2020"], e, ev)
    mun = base[(base.MUN != "000") & (base.LOC == "0000")].copy()
    mun["localidades"] = mun.cvemun.map(loc.groupby("cvemun").size()).astype(str)
    guardar_ref(cat, "municipios", mun, MUNICIPIOS, f["inegi_iter2020"], dict(e), ev)

    z = zipfile.ZipFile(ruta_local(f["inegi_cngmd2023"]))
    nom = "conjunto_de_datos/m2s8p{}_cngmd2023.csv"
    d8, e = leer_csv(z, nom.format(8), codificacion="latin-1")
    d9, _ = leer_csv(z, nom.format(9), codificacion="latin-1")
    cat_m, _ = leer_csv(z, "catalogos/timateri_e_cngmd2023.csv", codificacion="latin-1")
    mat = dict(zip(cat_m.TIMATERI_E, cat_m.DESCRIP))

    def licitacion(d):
        v = d[["PRORIGS3", "PRORIGS4", "PRORIGS5"]].apply(pd.to_numeric, errors="coerce")
        return v.sum(axis=1, min_count=1).astype(str).replace("nan", "")

    r = pd.DataFrame({
        "cvemun": d8.UBICAGEO_F.str.zfill(5), "materia": d8.TIMATERI_E,
        "materia_nombre": d8.TIMATERI_E.map(mat), "contratos_total": d8.PRORIGTT,
        "contratos_ad": d8.PRORIGS1, "contratos_inv": d8.PRORIGS2,
        "contratos_lic": licitacion(d8)})
    s = pd.DataFrame({
        "cvemun": d9.UBICAGEO_F.str.zfill(5), "materia": d9.TIMATERI_E,
        "monto_total": d9.PRORIGTT, "monto_ad": d9.PRORIGS1, "monto_inv": d9.PRORIGS2,
        "monto_lic": licitacion(d9)})
    r = r.merge(s, how="left", on=["cvemun", "materia"]).replace("NA", "")
    guardar_ref(cat, "cngmd_contratos", r, CNGMD, f["inegi_cngmd2023"], e, ev)

    crudo = ruta_local(f["coneval_irs2020"]).read_bytes()
    d = pd.read_csv(io.BytesIO(crudo), dtype=str, keep_default_na=False, encoding="utf-8-sig")
    cvemun = d.clave_municipio.str.zfill(5)
    r = pd.DataFrame({"cvemun": cvemun, "id_entidad": cvemun.str[:2],
                      "id_municipio": cvemun.str[2:], "poblacion": d.poblacion,
                      "irs": d.irs, "grado": d.grs, "lugar": d.lugar})
    e = {"sha256_csv": hashlib.sha256(crudo).hexdigest(), "bytes": len(crudo), "filas": len(r)}
    guardar_ref(cat, "rezago_municipal", r, REZAGO, f["coneval_irs2020"], e, ev)
    return ev


def guardar_ref(cat, nombre, df, esquema, fuente, ev, evidencia):
    malos = {}
    t = a_tabla(df, esquema, malos)
    ev["no_convertidos"] = malos
    cat.load_table(f"plata.{nombre}").append(
        t, snapshot_properties={"fuente": fuente["id"], "fuente_sha256": fuente["sha256"]})
    evidencia[nombre] = ev
    print(f"  ref  {nombre:<16} {t.num_rows:>9,} filas", flush=True)


def preparar(cat, nombres):
    cat.create_namespace_if_not_exists("plata")
    for nombre in nombres:
        esquema, particion = ESQUEMAS[nombre]
        if cat.table_exists(f"plata.{nombre}"):
            cat.purge_table(f"plata.{nombre}")
        t = cat.create_table(f"plata.{nombre}", schema=esquema, properties={
            "write.parquet.compression-codec": "zstd"})
        if particion:
            with t.update_spec() as u:
                for c in particion:
                    u.add_identity(c)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--ciclos", type=int, nargs="*", default=list(CICLOS))
    args = ap.parse_args()

    inicio = time.time()
    cat = catalogo()
    preparar(cat, list(ESQUEMAS))
    sumas = {f["id"]: f["sha256"] for f in fuentes()}
    evidencia = {"ciclos": {}, "referencias": None}
    for ciclo in args.ciclos:
        evidencia["ciclos"][str(ciclo)] = por_ciclo(ciclo, sumas[f"shcp_ef{ciclo}"], cat)
    evidencia["referencias"] = referencias(cat)
    evidencia["segundos"] = round(time.time() - inicio, 1)
    VERIFICACION.mkdir(exist_ok=True)
    (VERIFICACION / "evidencia_plata.json").write_text(
        json.dumps(evidencia, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    print(f"plata lista en {evidencia['segundos']} s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
