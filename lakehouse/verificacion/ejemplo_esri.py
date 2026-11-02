"""Evidencia del ejemplo de las figuras 4 y 5 del artículo: el proyecto y lo que Esri publica de su punto.

    py -3 -I lakehouse/verificacion/ejemplo_esri.py

Lee el proyecto de las capas del sitio y consulta, igual que mapa.js al comparar antes y ahora, la
lista de versiones de World Imagery Wayback, su servicio tilemap (de qué versión sale el mosaico del
punto) y los metadatos de esa versión (la fecha de la toma). Escribe evidencia_ejemplo.json con lo
leído y la fecha de la consulta: si Esri publica versiones nuevas, otra corrida puede dar otro "ahora".
"""
import datetime as dt
import json
import math
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

AQUI = Path(__file__).resolve().parent
DATOS = AQUI.parent / "sitio" / "datos"
FOLIO, ENTIDAD = "MEX17170401001337", 15
WAYBACK = "https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json"
TILEMAP = "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tilemap"
ZOOM = 17


def leer(url):
    req = urllib.request.Request(url, headers={"User-Agent": "PublicMunicipalWorks_Lakehouse"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def objetos(ruta):
    capa = json.loads(ruta.read_text(encoding="utf-8"))
    return [dict(zip(capa["columnas"], f)) for f in capa["filas"]]


def tesela(lat, lon, z):
    """Columna y fila del mosaico que contiene el punto en el nivel z."""
    n = 2 ** z
    rad = math.radians(lat)
    return (int((lon + 180) / 360 * n),
            int((1 - math.log(math.tan(rad) + 1 / math.cos(rad)) / math.pi) / 2 * n))


def main():
    p = next(x for x in objetos(DATOS / "05_puntos_2024" / f"{ENTIDAD}.json") if x["folio"] == FOLIO)
    d = next(x for x in objetos(DATOS / "06_detalle_2024" / f"{p['cvemun']}.json") if x["folio"] == FOLIO)
    m = next(x for x in objetos(DATOS / "02_municipios.json") if x["cvemun"] == p["cvemun"])

    cfg = leer(WAYBACK)
    versiones = sorted(({"num": k, "fecha": re.search(r"\d{4}-\d{2}-\d{2}", v["itemTitle"]).group(),
                         "titulo": v["itemTitle"], "item": v["itemID"], "meta": v["metadataLayerUrl"]}
                        for k, v in cfg.items() if re.search(r"\d{4}-\d{2}-\d{2}", v.get("itemTitle", ""))),
                       key=lambda v: v["fecha"])
    por_num = {v["num"]: v for v in versiones}
    ahora = versiones[-1]
    antes = [v for v in versiones if v["fecha"] < d["fecha_inicio"]][-1]
    x, y = tesela(p["lat"], p["lon"], ZOOM)

    def lado(v):
        t = leer(f"{TILEMAP}/{v['num']}/{ZOOM}/{y}/{x}")
        assert t.get("data") and t["data"][0], (v["num"], t)
        origen = por_num[str(t["select"][0])] if t.get("select") else v
        punto = json.dumps({"x": p["lon"], "y": p["lat"], "spatialReference": {"wkid": 4326}})
        q = urllib.parse.urlencode({"f": "json", "geometry": punto, "geometryType": "esriGeometryPoint",
                                    "spatialRel": "esriSpatialRelIntersects",
                                    "outFields": "SRC_DATE2,SRC_DESC,NICE_DESC,SAMP_RES", "returnGeometry": "false"})
        meta = leer(f"{origen['meta']}/{23 - ZOOM}/query?{q}")["features"][0]["attributes"]
        item = leer(f"https://www.arcgis.com/sharing/rest/content/items/{v['item']}?f=json")
        return {"version": v["num"], "titulo": v["titulo"], "publicada": v["fecha"], "item": v["item"],
                "credito": item.get("accessInformation"), "mosaico_de": origen["num"],
                "toma": dt.datetime.fromtimestamp(meta["SRC_DATE2"] / 1000, dt.timezone.utc).date().isoformat(),
                "sensor": meta.get("SRC_DESC"), "proveedor": meta.get("NICE_DESC"), "resolucion_m": meta.get("SAMP_RES")}

    evidencia = {
        "consultado": dt.date.today().isoformat(), "folio": FOLIO, "nombre": p["nombre"],
        "cvemun": p["cvemun"], "municipio": m["municipio"], "entidad": m["entidad"],
        "lat": p["lat"], "lon": p["lon"], "estatus": d["estatus"], "marcas": p["marcas"],
        "clasificacion": d["clasificacion"], "fecha_inicio": d["fecha_inicio"], "fecha_termino": d["fecha_termino"],
        "pct_fisico": d["pct_fisico"], "pct_financiero": d["pct_financiero"],
        "aprobado": d["aprobado"], "pagado": d["pagado"], "zoom": ZOOM,
        "antes": lado(antes), "ahora": lado(ahora),
    }
    ruta = AQUI / "evidencia_ejemplo.json"
    ruta.write_text(json.dumps(evidencia, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(evidencia, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
