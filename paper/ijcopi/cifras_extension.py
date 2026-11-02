"""Cifras de la versión extendida, leídas de las evidencias del repositorio.

Ningún número del texto nuevo se escribe a mano: extender_v1.py los toma de aquí, y cada uno
dice de qué archivo sale. También comprueba las afirmaciones cualitativas del texto (qué base
es más rápida en cada consulta, qué variante gana), para que el artículo no se arme si una
corrida nueva las contradice.

    py -3 -I paper/ijcopi/cifras_extension.py      imprime cada cifra con su fuente
"""
import datetime as dt
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
LAGO = RAIZ / "lakehouse"
V = LAGO / "verificacion"
PALABRA = {2: "two", 5: "five", 6: "six", 7: "seven", 9: "nine", 10: "ten"}


def leer(ruta):
    return json.loads(ruta.read_text(encoding="utf-8"))


def ent(n):
    return f"{int(round(n)):,}"


def dec(x, d=1):
    return f"{x:,.{d}f}"


def prop(x, d=3):
    """Proporción al estilo APA, sin cero inicial: .462."""
    s = f"{x:.{d}f}"
    return s[1:] if s.startswith("0.") else s


def con_ic(par):
    return f"{prop(par[0])} ± {prop(par[1])}"


def pct(a, b):
    return dec(100 * a / b)


def cifras():
    C, F = {}, {}

    def pon(clave, valor, fuente):
        assert clave not in C, clave
        C[clave], F[clave] = valor, fuente

    # Fuentes
    fu = leer(LAGO / "fuentes.json")
    pon("n_fuentes_palabra", PALABRA[len(fu["fuentes"])], "fuentes.json")
    pon("consultado", dt.date.fromisoformat(fu["consultado"]).strftime("%B %-d, %Y")
        if sys.platform != "win32" else dt.date.fromisoformat(fu["consultado"]).strftime("%B %#d, %Y"),
        "fuentes.json")
    url = {f["id"]: f["url"] for f in fu["fuentes"]}
    pon("url_iter", url["inegi_iter2020"], "fuentes.json")
    pon("url_cngmd", url["inegi_cngmd2023"], "fuentes.json")
    pon("url_coneval", url["coneval_irs2020"], "fuentes.json")
    pon("bronce_mb", dec(sum(f["bytes"] for f in fu["fuentes"]) / 1e6), "fuentes.json")

    # Lago contra almacén
    lago = leer(V / "evidencia_lago.json")
    assert lago["fallos"] == 0
    q = lago["consultas"]
    assert all(r["igual"] for r in q.values()) and len(q) == 7
    for k, r in q.items():
        n = k[:2]
        pon(f"q{n}_filas", ent(r["filas"]), "evidencia_lago.json")
        for campo, clave in (("pg_ms", "pg"), ("pg_p95", "pgp95"), ("lago_ms", "lago"), ("lago_p95", "lagop95")):
            pon(f"q{n}_{clave}", dec(r[campo]), "evidencia_lago.json")
    rapido_lago = sorted(k[:2] for k, r in q.items() if r["lago_ms"] < r["pg_ms"])
    assert rapido_lago == ["01", "02", "04", "05", "06"], rapido_lago
    e = lago["entorno"]
    pon("pg_version", e["postgresql"], "evidencia_lago.json")
    pon("duck_version", e["duckdb"].lstrip("v"), "evidencia_lago.json")
    pon("hilos", str(e["hilos_duckdb"]), "evidencia_lago.json")
    pon("reps", str(e["repeticiones"]), "evidencia_lago.json")
    pon("anfitrion", e["anfitrion"].split(" ", 1)[1], "evidencia_lago.json")
    p = lago["poda"]
    pon("poda_archivos", str(p["archivos_filtro"]), "evidencia_lago.json")
    pon("poda_total", str(p["archivos_total"]), "evidencia_lago.json")
    pon("poda_mb", dec(p["bytes_filtro"] / 1e6), "evidencia_lago.json")
    pon("poda_total_mb", dec(p["bytes_total"] / 1e6), "evidencia_lago.json")
    assert all(v["filas"] == v["esperadas"] for v in lago["viaje"])
    pon("n_instantaneas_palabra", PALABRA[len(lago["viaje"])], "evidencia_lago.json")
    assert lago["evolucion"]["archivos_iguales"]
    a = lago["almacenamiento"]
    t = a["postgresql_tablas"]
    pon("dim_mun", ent(t["dim_municipio"]["filas"]), "evidencia_lago.json")
    pon("versiones", ent(t["dim_proyecto_federal"]["filas"]), "evidencia_lago.json")
    pon("filas_hechos", ent(t["fact_proyecto_ciclo"]["filas"]), "evidencia_lago.json")
    pon("tablas_plata_palabra", PALABRA[len(a["filas_plata"])], "evidencia_lago.json")
    pon("filas_plata_millones", dec(sum(a["filas_plata"].values()) / 1e6), "evidencia_lago.json")

    # Clon limpio: el tamaño de cada capa sale de esta reconstrucción, que no arrastra corridas previas
    clon = (V / "evidencia_clon_limpio.txt").read_text(encoding="utf-8")
    assert "con fallos: 0" in clon and "diferencias con el lago principal: 0" in clon
    pon("clon_s", re.search(r"salida 0 en (\d+) s", clon).group(1), "evidencia_clon_limpio.txt")
    for capa in ("plata", "oro"):
        m = re.search(rf"capa {capa}\s+(\d+) objetos\s+([\d.]+) MB", clon)
        pon(f"{capa}_mb", dec(float(m.group(2))), "evidencia_clon_limpio.txt")
    m = re.search(r"CSV de los seis ciclos ([\d,.]+) MB; tablas nuevas de PostgreSQL ([\d,.]+) MB", clon)
    pon("csv_mb", m.group(1), "evidencia_clon_limpio.txt")
    pon("pg_mb", m.group(2), "evidencia_clon_limpio.txt")

    plata = leer(V / "evidencia_plata.json")
    pon("plata_s", ent(plata["segundos"]), "evidencia_plata.json")
    pon("bytes_sin_definir", ent(sum(x.get("bytes_sin_definir", 0) for c in plata["ciclos"].values()
                                     for x in c.values())), "evidencia_plata.json")
    aditiva = leer(V / "evidencia_aditiva.json")
    assert aditiva["identicas"]
    pon("tablas_originales", str(len(aditiva["tablas"])), "evidencia_aditiva.json")

    # Auditoría de los registros reales
    au = leer(V / "evidencia_auditoria.json")
    pon("folios", ent(au["poblacion"]["folios"]), "evidencia_auditoria.json")
    pon("entidades", str(au["poblacion"]["entidades"]), "evidencia_auditoria.json")
    pf = au["pagado_es_folio"]
    assert all(x["entidad"] == "Sonora" for x in pf)
    pon("folio_n_cap", PALABRA[len(pf)].capitalize(), "evidencia_auditoria.json")
    pon("folio_bn", dec(sum(x["pagado_reportado"] for x in pf) / 1e9), "evidencia_auditoria.json")
    geo = au["calidad_geo"]
    meds = [g["km_mediana"] for g in geo]
    pon("geo_med_min", dec(min(meds), 2), "evidencia_auditoria.json")
    pon("geo_med_max", dec(max(meds), 2), "evidencia_auditoria.json")
    lejos = {g["ciclo"]: 100 * g["mas_de_25_km"] / g["medidos"] for g in geo}
    alto = [lejos[c] for c in (2020, 2021, 2022)]
    bajo = [lejos[c] for c in (2023, 2024, 2025)]
    assert min(alto) > max(bajo)
    pon("geo25_alto_min", dec(min(alto)), "evidencia_auditoria.json")
    pon("geo25_alto_max", dec(max(alto)), "evidencia_auditoria.json")
    pon("geo25_bajo_min", dec(min(bajo)), "evidencia_auditoria.json")
    pon("geo25_bajo_max", dec(max(bajo)), "evidencia_auditoria.json")
    cr = {x["relacion"]: x for x in au["cruce_cngmd"]}
    pon("cngmd_total", ent(sum(x["municipios"] for x in cr.values())), "evidencia_auditoria.json")
    cero = cr["CNGMD en cero, SHCP con contratos"]["municipios"]
    pon("cngmd_menos", ent(cr["SHCP mayor que CNGMD"]["municipios"] + cero), "evidencia_auditoria.json")
    pon("cngmd_cero", ent(cero), "evidencia_auditoria.json")
    tem = au["cruce_temascaltepec"]
    assert tem["contratos_cngmd"] == 0
    pon("tem_shcp", ent(tem["contratos_shcp"]), "evidencia_auditoria.json")
    pon("tem_shcp_mill", dec(tem["monto_shcp"] / 1e6), "evidencia_auditoria.json")
    al = au["alertas"]
    for k in ("proyectos", "c1_ciclo", "c1_tipo", "c1_ambos", "c2", "c3", "con_ambos_avances", "c4"):
        pon(f"al_{k}", ent(al[k]), "evidencia_auditoria.json")
    ve = au["versiones"]
    assert ve["cambian_clasificacion"] == 0
    pon("multi", ent(ve["en_varios_ciclos"]), "evidencia_auditoria.json")
    pon("cambia_estatus", ent(ve["cambian_estatus"]), "evidencia_auditoria.json")
    pon("cambia_estatus_pct", pct(ve["cambian_estatus"], ve["en_varios_ciclos"]), "evidencia_auditoria.json")
    pon("cambia_monto", ent(ve["cambian_monto"]), "evidencia_auditoria.json")
    pon("cambia_monto_pct", pct(ve["cambian_monto"], ve["en_varios_ciclos"]), "evidencia_auditoria.json")
    rz = {x["grado_rezago"]: x["mediana_por_habitante"] for x in au["rezago"] if x["ciclo"] == 2023}
    orden = ["Muy bajo", "Bajo", "Medio", "Alto", "Muy alto"]
    assert all(rz[a] < rz[b] for a, b in zip(orden, orden[1:]))
    pon("rez_bajo", ent(rz["Muy bajo"]), "evidencia_auditoria.json")
    pon("rez_alto", ent(rz["Muy alto"]), "evidencia_auditoria.json")
    sp = [x["spearman"] for x in au["rezago_spearman"]]
    assert min(sp) > 0
    pon("sp_min", prop(min(sp), 2), "evidencia_auditoria.json")
    pon("sp_max", prop(max(sp), 2), "evidencia_auditoria.json")
    mo = {x["modalidad"]: x for x in au["modalidad"]}
    ad = next(v for k, v in mo.items() if k.startswith("Adjudicaci"))
    pon("ad_pct", pct(ad["contratos"], sum(x["contratos"] for x in mo.values())), "evidencia_auditoria.json")
    pon("ad_monto_pct", pct(ad["monto"], sum(x["monto"] for x in mo.values())), "evidencia_auditoria.json")

    # Criterio de costo por tipo, 15 % de prevalencia
    cc = leer(V / "criterio_costo.json")["0.15"]
    r0 = cc["R0 capítulo"]
    r2 = cc["R2 tipo z>3.0 + brecha"]
    bosque = next(v for k, v in cc.items() if k.startswith("Isolation Forest"))
    variantes = {k: v for k, v in cc.items() if k.startswith(("R1", "R2"))}
    assert len(variantes) == 6
    for m in ("precision", "roc", "pr"):
        assert max(variantes, key=lambda k: variantes[k]["metricas"][m][0]) == "R2 tipo z>3.0 + brecha", m
    for m in ("precision", "recall", "roc", "pr"):
        assert r2["metricas"][m][0] > bosque["metricas"][m][0], m
    for nombre, x in (("r0", r0), ("r2", r2), ("if", bosque)):
        for m in ("precision", "recall", "f1", "roc", "pr"):
            pon(f"{nombre}_{m}", prop(x["metricas"][m][0]), "criterio_costo.json")
            pon(f"{nombre}_{m}_ic", con_ic(x["metricas"][m]), "criterio_costo.json")
        pon(f"{nombre}_p2", prop(x["metricas"]["precision"][0], 2), "criterio_costo.json")
        pon(f"{nombre}_r2", prop(x["metricas"]["recall"][0], 2), "criterio_costo.json")
    causa = lambda x, c: prop(x["causas"][c][0])  # noqa: E731
    r1z2 = cc["R1 tipo z>2.0"]
    pon("sob0", causa(r0, "sobreprecio"), "criterio_costo.json")
    pon("sob_r2", causa(r2, "sobreprecio"), "criterio_costo.json")
    pon("sob_z2", causa(r1z2, "sobreprecio"), "criterio_costo.json")
    pon("pag0", causa(r0, "pago_adelantado"), "criterio_costo.json")
    pon("pag_r2", causa(r2, "pago_adelantado"), "criterio_costo.json")
    pon("fan0", causa(r0, "obra_fantasma"), "criterio_costo.json")
    pon("fan_r2", causa(r2, "obra_fantasma"), "criterio_costo.json")

    # Proyecciones
    oc = leer(V / "evidencia_oc4ids.json")
    assert oc["con_errores"] == 0
    assert {"purpose", "milestones", "documents", "transactions"} <= set(oc["sin_dato"])
    pon("oc_proy", ent(oc["proyectos"]), "evidencia_oc4ids.json")
    pon("oc_campos", str(oc["campos_con_dato"]), "evidencia_oc4ids.json")
    pon("oc_total", str(oc["campos_de_primer_nivel"]), "evidencia_oc4ids.json")
    gr = leer(V / "evidencia_grafo.json")
    assert gr["fallos"] == 0 and all(x["igual"] for x in gr["consultas"].values())
    assert gr["clases"]["Geometry"] == gr["clases"]["ObservacionCiclo"]
    pon("tripletas", ent(gr["tripletas"]), "evidencia_grafo.json")
    pon("grafo_s", dec(gr["segundos_materializacion"]), "evidencia_grafo.json")
    pon("grafo_mb", dec(gr["bytes_gz"] / 1e6), "evidencia_grafo.json")
    pon("grafo_consultas_palabra", PALABRA[len(gr["consultas"])], "evidencia_grafo.json")

    # Correcciones al capítulo
    ca = leer(V / "cifras_capitulo.json")
    pon("pob_tem", ent(ca["temascaltepec"]["pobtot_censo_2020"]), "cifras_capitulo.json")
    pon("eventos", ent(ca["eventos_auditoria"]["total"]), "cifras_capitulo.json")
    pon("eventos_voto", ent(ca["eventos_auditoria"]["de_voto"]), "cifras_capitulo.json")
    pon("votos", ent(ca["eventos_auditoria"]["votos"]), "cifras_capitulo.json")
    pon("bytes_api", ent(ca["api_public_obras"]["bytes"]), "cifras_capitulo.json")
    pon("kb_api", ent(ca["api_public_obras"]["bytes"] / 1000), "cifras_capitulo.json")

    # Sitio publicado
    man = leer(LAGO / "sitio" / "datos" / "manifiesto.json")
    assert "verificaciones fallidas: 0" in (V / "evidencia_capas.txt").read_text(encoding="utf-8")
    pon("capas_palabra", PALABRA[len({c["consulta"] for c in man["consultas"]})], "sitio/datos/manifiesto.json")
    datos_sitio = LAGO / "sitio" / "datos"

    def columna(capa, nombre):
        """Los valores de una columna en todos los archivos de una capa repartida."""
        valores = []
        for r in sorted((datos_sitio / capa).glob("*.json")):
            if r.name != "indice.json":
                c = leer(r)
                i = c["columnas"].index(nombre)
                valores += [f[i] for f in c["filas"]]
        return valores

    evidencia = columna("05_puntos_2024", "evidencia")
    enlaces = columna("06_detalle_2024", "enlaces")
    assert len(evidencia) == len(enlaces)
    con_enlaces = sum(1 for e in enlaces if e)
    assert con_enlaces == sum(1 for e in evidencia if e & 1)
    pon("obras_2024", ent(len(evidencia)), "sitio/datos/05_puntos_2024/*.json")
    pon("docs_proy", ent(con_enlaces), "sitio/datos/06_detalle_2024/*.json")
    pon("pdf_proy", ent(sum(1 for e in evidencia if e & 2)), "sitio/datos/05_puntos_2024/*.json")
    pon("foto_proy", ent(sum(1 for e in evidencia if e & 4)), "sitio/datos/05_puntos_2024/*.json")
    res = leer(LAGO / "sitio" / "datos" / "01_resumen.json")
    por_ciclo = {f[0]: dict(zip(res["columnas"], f)) for f in res["filas"]}
    pon("p2024", ent(por_ciclo[2024]["proyectos"]), "sitio/datos/01_resumen.json")
    pon("p2025", ent(por_ciclo[2025]["proyectos"]), "sitio/datos/01_resumen.json")
    return C, F


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    c, f = cifras()
    for k in c:
        print(f"{k:<24} {c[k]:<32} {f[k]}")
