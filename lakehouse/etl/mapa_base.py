"""Genera la copia local del mapa base del sitio: sitio/mapa-base/mexico.json.

    python lakehouse/etl/mapa_base.py

Es el último eslabón de la cadena de proveedores de sitio/mapa-teselas.js, el módulo de los mapas
del trabajo 38: si ningún proveedor de teselas responde, el mapa se dibuja con esta copia, servida
desde el mismo sitio. Para un mapa nacional basta con el contorno del país, los límites entre
estados y sus nombres, que salen de Natural Earth 5.1.2 (dominio público). Los tres archivos se
bajan a datos/mapa_base/ y se comparan con el tamaño y el SHA-256 fijados aquí.

El formato es el del generador del trabajo 38 (scripts/generar_mapa_base.py de
Data_Warehouse_static): Douglas-Peucker con tolerancia en metros, enteros de 1e-5 grados y deltas.
También reescribe, entre sus marcas, el respaldo mínimo incrustado en mapa-teselas.js.
"""
import hashlib
import json
import math
import re
import sys
import urllib.request

from comun import DATOS, RAIZ

BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/"
ARCHIVOS = {
    "ne_10m_admin_0_countries": (13287234, "239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255"),
    "ne_10m_admin_1_states_provinces_lines": (21092537, "1a1f30ccaaf4cc9c4bde34266f0b8cbb955d3a4cf254b756912255f2ec7c75b6"),
    "ne_10m_admin_1_label_points": (4384744, "73b90ea0d39cbc081bb9d993510e1fc6410dcc7f07c945a2aa725b70427d6854"),
}
CACHE = DATOS / "mapa_base"
SALIDA = RAIZ / "sitio" / "mapa-base" / "mexico.json"
MODULO = RAIZ / "sitio" / "mapa-teselas.js"

Q = 100000            # 1e-5 grados
TOL = 150             # metros: unos dos píxeles a zoom 10
TOL_MINIMO = {"ciudad": 3000, "limite": 5000}
ISLA_MIN_KM2 = 2.0    # islas más pequeñas no se ven a escala nacional
R = 6378137.0


def merc(lon, lat):
    return math.radians(lon) * R, math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * R


def simplificar(pts, tol):
    """Douglas-Peucker iterativo sobre [(lon, lat)], tolerancia en metros."""
    if len(pts) < 3:
        return pts
    m = [merc(*p) for p in pts]
    queda = [False] * len(pts)
    queda[0] = queda[-1] = True
    pila = [(0, len(pts) - 1)]
    tol2 = tol * tol
    while pila:
        a, b = pila.pop()
        ax, ay = m[a]
        dx, dy = m[b][0] - ax, m[b][1] - ay
        l2 = dx * dx + dy * dy
        mejor, im = -1.0, -1
        for i in range(a + 1, b):
            px, py = m[i]
            t = 0.0 if l2 == 0 else max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / l2))
            d2 = (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2
            if d2 > mejor:
                mejor, im = d2, i
        if mejor > tol2:
            queda[im] = True
            pila += [(a, im), (im, b)]
    return [p for p, k in zip(pts, queda) if k]


def codificar(pts):
    """Enteros a 1e-5 grados en deltas: [lon0, lat0, dlon1, dlat1, ...]."""
    out, px, py = [], None, None
    for lon, lat in pts:
        x, y = round(lon * Q), round(lat * Q)
        if px is None:
            out += [x, y]
        elif (x, y) != (px, py):
            out += [x - px, y - py]
        else:
            continue
        px, py = x, y
    return out


def area_km2(anillo):
    lat0 = math.radians(sum(p[1] for p in anillo) / len(anillo))
    kx, ky = 111.32 * math.cos(lat0), 110.57
    s = 0.0
    for (x1, y1), (x2, y2) in zip(anillo, anillo[1:] + anillo[:1]):
        s += (x1 * kx) * (y2 * ky) - (x2 * kx) * (y1 * ky)
    return abs(s) / 2


def dentro(pt, anillo):
    """Punto en polígono por rayo, sobre (lon, lat)."""
    x, y = pt
    adentro = False
    for (x1, y1), (x2, y2) in zip(anillo, anillo[1:] + anillo[:1]):
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) * (x2 - x1) / (y2 - y1):
            adentro = not adentro
    return adentro


def bajar(nombre):
    """Devuelve el GeoJSON, bajándolo si falta, y se detiene si no es el archivo fijado."""
    tam, sha = ARCHIVOS[nombre]
    ruta = CACHE / f"{nombre}.geojson"
    if not ruta.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(BASE + ruta.name, headers={"User-Agent": "PublicMunicipalWorks_Lakehouse"})
        with urllib.request.urlopen(req, timeout=300) as r:
            ruta.write_bytes(r.read())
    datos = ruta.read_bytes()
    if len(datos) != tam or hashlib.sha256(datos).hexdigest() != sha:
        raise SystemExit(f"{ruta.name} no es el archivo fijado ({len(datos)} bytes)")
    return json.loads(datos)


def anillos_de(geom):
    poligonos = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    return [[tuple(p) for p in pol[0]] for pol in poligonos]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    pais = next(f for f in bajar("ne_10m_admin_0_countries")["features"]
                if f["properties"]["ADM0_A3"] == "MEX")
    ciudad = sorted((a for a in anillos_de(pais["geometry"]) if area_km2(a) >= ISLA_MIN_KM2),
                    key=area_km2, reverse=True)
    limites = []
    for f in bajar("ne_10m_admin_1_states_provinces_lines")["features"]:
        if f["properties"]["ADM0_A3"] != "MEX":
            continue
        g = f["geometry"]
        partes = [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"]
        limites += [[tuple(p) for p in parte] for parte in partes]
    # Un estado tiene varios puntos de rótulo, uno por parte; se queda el de mayor jerarquía
    # (scalerank menor) dentro del territorio continental, para que Colima no se rotule en las islas
    # Revillagigedo. Natural Earth 5.1.2 aún llama Distrito Federal a la Ciudad de México.
    puntos = {}
    for f in bajar("ne_10m_admin_1_label_points")["features"]:
        p = f["properties"]
        if p.get("iso_a2") != "MX" or p.get("featurecla") != "Admin-1 scale rank":
            continue
        clave = (not dentro(f["geometry"]["coordinates"], ciudad[0]), p["scalerank"], p["OBJECTID_1"])
        if p["adm1_code"] not in puntos or clave < puntos[p["adm1_code"]][0]:
            puntos[p["adm1_code"]] = (clave, p["name"], f["geometry"]["coordinates"])
    renombrar = {"Distrito Federal": "Ciudad de México"}
    estados = sorted((renombrar.get(n, n), xy) for _, n, xy in puntos.values())
    assert len(estados) == 32, len(estados)

    doc = {
        "fuente": "Natural Earth 5.1.2 (public domain)",
        "q": Q,
        "ciudad": [codificar(simplificar(a, TOL)) for a in ciudad],
        "capas": {"limite": [codificar(simplificar(l, TOL)) for l in limites]},
        "lugares": [[n, 0, round(x * Q), round(y * Q)] for n, (x, y) in estados],
    }
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")), encoding="utf-8",
                      newline="\n")
    print(f"{SALIDA.relative_to(RAIZ)}: {SALIDA.stat().st_size / 1024:.0f} KB, {len(ciudad)} anillos, "
          f"{len(limites)} límites, {len(estados)} estados")

    minimos = {
        "CONTORNO_MINIMO": [codificar(simplificar(ciudad[0], TOL_MINIMO["ciudad"]))],
        "LIMITES_MINIMOS": [codificar(simplificar(l, TOL_MINIMO["limite"])) for l in limites],
        "ESTADOS_MINIMOS": doc["lugares"],
    }
    js = MODULO.read_text(encoding="utf-8")
    for nombre, valor in minimos.items():
        patron = re.compile(r"(var " + nombre + r" = ).*?(;\s*// fin " + nombre + ")", re.S)
        texto = json.dumps(valor, ensure_ascii=False, separators=(",", ":"))
        js, n = patron.subn(lambda m: m.group(1) + texto + m.group(2), js)
        if n != 1:
            raise SystemExit(f"No encuentro {nombre} en {MODULO.name}")
    MODULO.write_bytes(js.encode("utf-8"))
    tam = sum(len(json.dumps(v, ensure_ascii=False, separators=(",", ":"))) for v in minimos.values())
    print(f"{MODULO.relative_to(RAIZ)}: respaldo incrustado de {tam / 1024:.1f} KB")
    print("estados:", ", ".join(n for n, _ in estados))
    return 0


if __name__ == "__main__":
    sys.exit(main())
