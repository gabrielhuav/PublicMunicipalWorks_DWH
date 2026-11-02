"""Arma la versión extendida del artículo 37 para IJCOPI sobre la base congelada en Word.

    py -3 -I paper/ijcopi/extender_v1.py [--sin-figura]

Copia Paper37_IJCOPI_v0_fiel.docx a Paper37_IJCOPI_v1_extendida.docx y le aplica los cambios
de la extensión. Todo lo nuevo o cambiado va resaltado en amarillo y la figura nueva lleva marco
amarillo; la base no se toca. Las cifras salen de cifras_extension.py, que solo lee evidencias
del repositorio, y cada ancla se comprueba antes de editar, así que un cambio en la base detiene
el armado en lugar de insertar texto en otro lugar.

Marcado del texto: `código` va en Courier New, *texto* en cursiva y <https://...> es un enlace.
"""
import copy
import re
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_COLOR_INDEX, WD_UNDERLINE
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import RGBColor
from docx.text.run import Run

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
from cifras_extension import cifras  # noqa: E402

BASE = AQUI / "Paper37_IJCOPI_v0_fiel.docx"
SALIDA = AQUI / "Paper37_IJCOPI_v1_extendida.docx"
# Figuras 4 y 5, de capturar_mapa.ps1: el mapa con la ficha del ejemplo y su antes y ahora
FIGURAS = [AQUI / "figura_ejemplo_mapa.png", AQUI / "figura_ejemplo_satelite.jpg"]
ALTO_FIGURA = int(2.9 * 914400)  # EMU: ninguna figura pasa de 2.9 pulgadas de alto

C, _ = cifras()
doc = Document(str(BASE))
B = [el for el in doc.element.body.iterchildren() if el.tag in (qn("w:p"), qn("w:tbl"))]
assert len(B) == 141, len(B)


def texto(el):
    return "".join(t.text or "" for t in el.iter(qn("w:t")))


def f(plantilla):
    return plantilla.format(**C)


def ancla(i, comienzo):
    assert texto(B[i]).startswith(comienzo), (i, texto(B[i])[:60])
    return B[i]


# ---------------------------------------------------------------- runs y párrafos

def amarillo(r):
    Run(r, None).font.highlight_color = WD_COLOR_INDEX.YELLOW
    return r


def run(txt, rpr=None, codigo=False, italica=False):
    r = OxmlElement("w:r")
    if rpr is not None:
        r.append(copy.deepcopy(rpr))
    t = OxmlElement("w:t")
    t.text = txt
    t.set(qn("xml:space"), "preserve")
    r.append(t)
    fuente = Run(r, None).font
    if codigo:
        fuente.name = "Courier New"
    if italica:
        fuente.italic = True
    return amarillo(r)


def enlace(url, rpr=None):
    h = OxmlElement("w:hyperlink")
    h.set(qn("r:id"), doc.part.relate_to(url, RT.HYPERLINK, is_external=True))
    h.set(qn("w:history"), "1")
    r = run(url, rpr)
    Run(r, None).font.color.rgb = RGBColor(0x05, 0x63, 0xC1)
    Run(r, None).font.underline = WD_UNDERLINE.SINGLE
    h.append(r)
    return h


MARCA = re.compile(r"`([^`]+)`|\*([^*]+)\*|<(https?://[^>]+)>")


def piezas(txt, rpr=None):
    out, pos = [], 0
    for m in MARCA.finditer(txt):
        if m.start() > pos:
            out.append(run(txt[pos:m.start()], rpr))
        if m.group(1):
            out.append(run(m.group(1), rpr, codigo=True))
        elif m.group(2):
            out.append(run(m.group(2), rpr, italica=True))
        else:
            out.append(enlace(m.group(3), rpr))
        pos = m.end()
    if pos < len(txt):
        out.append(run(txt[pos:], rpr))
    return out


def runs_directos(p):
    return [r for r in p if r.tag == qn("w:r")]


def rpr_de(p, i=0):
    rs = runs_directos(p)
    return rs[i].find(qn("w:rPr")) if rs else None


def parrafo(plantilla, txt, rpr=None):
    p = copy.deepcopy(plantilla)
    for hijo in list(p):
        if hijo.tag != qn("w:pPr"):
            p.remove(hijo)
    for x in piezas(txt, rpr):
        p.append(x)
    return p


def despues(ref, *nuevos):
    for n in nuevos:
        ref.addnext(n)
        ref = n
    return ref


def clon(r, txt):
    n = copy.deepcopy(r)
    ts = n.findall(qn("w:t"))
    for t in ts[1:]:
        n.remove(t)
    ts[0].text = txt
    ts[0].set(qn("xml:space"), "preserve")
    return n


def localizar(p, viejo):
    rs = runs_directos(p)
    tx = ["".join(t.text or "" for t in r.findall(qn("w:t"))) for r in rs]
    total = "".join(tx)
    s = total.find(viejo)
    assert s >= 0 and total.find(viejo, s + 1) < 0, (viejo, total[:80])
    return rs, tx, s, s + len(viejo)


def reemplazar(p, viejo, nuevo):
    """Cambia `viejo` por `nuevo`, en amarillo; el resto del párrafo queda igual."""
    rs, tx, s, e = localizar(p, viejo)
    pos, puesto = 0, False
    for r, t in zip(rs, tx):
        a, b = pos, pos + len(t)
        pos = b
        if b <= s or a >= e or not t:
            continue
        nuevos = []
        if s > a:
            nuevos.append(clon(r, t[:s - a]))
        if not puesto:
            nuevos += piezas(nuevo, r.find(qn("w:rPr")))
            puesto = True
        if e < b:
            nuevos.append(clon(r, t[e - a:]))
        for x in nuevos:
            r.addprevious(x)
        p.remove(r)


def insertar_tras(p, ancla_txt, nuevo):
    """Agrega `nuevo`, en amarillo, justo después de `ancla_txt`, sin resaltar el ancla."""
    rs, tx, s, e = localizar(p, ancla_txt)
    pos = 0
    for r, t in zip(rs, tx):
        a, b = pos, pos + len(t)
        pos = b
        if a < e <= b:
            nuevos = [clon(r, t[:e - a])] + piezas(nuevo, r.find(qn("w:rPr")))
            if e < b:
                nuevos.append(clon(r, t[e - a:]))
            for x in nuevos:
                r.addprevious(x)
            p.remove(r)
            return
    raise AssertionError(ancla_txt)


def anexar(p, nuevo, rpr=None):
    despues(runs_directos(p)[-1], *piezas(nuevo, rpr))


def fila(tr_plantilla, valores):
    tr = copy.deepcopy(tr_plantilla)
    for tc, v in zip(tr.findall(qn("w:tc")), valores):
        ps = tc.findall(qn("w:p"))
        for extra in ps[1:]:
            tc.remove(extra)
        rs = runs_directos(ps[0])
        rpr = rs[0].find(qn("w:rPr")) if rs else None
        for r in rs:
            ps[0].remove(r)
        for x in piezas(v, rpr):
            ps[0].append(x)
    return tr


def figura(plantilla, ruta, numero):
    p = copy.deepcopy(plantilla)
    rid, img = doc.part.get_or_add_image(str(ruta))
    p.find(".//" + qn("a:blip")).set(qn("r:embed"), rid)
    extension = p.find(".//" + qn("wp:extent"))
    cx = int(extension.get("cx"))
    cy = int(cx * img.px_height / img.px_width)
    if cy > ALTO_FIGURA:
        cx, cy = int(cx * ALTO_FIGURA / cy), ALTO_FIGURA
    extension.set("cx", str(cx))
    extension.set("cy", str(cy))
    for e in p.iter(qn("a:ext")):
        if e.get("cx") is not None:
            e.set("cx", str(cx))
            e.set("cy", str(cy))
    docpr = p.find(".//" + qn("wp:docPr"))
    docpr.set("id", str(4000 + numero))
    docpr.set("name", f"Figure {numero}")
    sppr = p.find(".//" + qn("pic:spPr"))
    for ln in sppr.findall(qn("a:ln")):
        sppr.remove(ln)
    ln = OxmlElement("a:ln")
    ln.set("w", "38100")
    relleno = OxmlElement("a:solidFill")
    color = OxmlElement("a:srgbClr")
    color.set("val", "FFFF00")
    relleno.append(color)
    ln.append(relleno)
    sppr.append(ln)
    return p


# ---------------------------------------------------------------- plantillas de la base

H1 = ancla(86, "7 Results and Evaluation")
H2 = ancla(101, "7.4 Evaluation of the Delay/Alert")
CUERPO = ancla(96, "The result does not flatter")
LEYENDA_TABLA = ancla(104, "Table 2. ")
TABLA2 = B[105]
ESPACIO = B[106]
assert texto(ESPACIO) == ""
FIG_P = ancla(80, "")
LEYENDA_FIG = ancla(81, "Fig. 3. ")
REFERENCIA = ancla(133, "Open Contracting Partnership")
RPR_H1, RPR_H2, RPR_TABLA = rpr_de(H1), rpr_de(H2), rpr_de(LEYENDA_TABLA)


def h1(txt):
    return parrafo(H1, txt, RPR_H1)


def h2(txt):
    return parrafo(H2, txt, RPR_H2)


def cuerpo(txt):
    return parrafo(CUERPO, f(txt))


# ---------------------------------------------------------------- textos nuevos

TITULO = ("From Synthetic Seeds to Federal Records: An Extended Dimensional Data Warehouse for "
          "Municipal Public Works with a Measured Lakehouse Layer")

RESUMEN = (
    "Municipal public-works records are scattered across spreadsheets and transactional systems. "
    "This article presents a dimensional Data Warehouse for monitoring municipal public works —ten "
    "dimensions, five of them Slowly Changing Dimension Type 2, two fact tables and a REST API— and, "
    "in this extended version, the lakehouse layer that the conference version left as future work. "
    "The layer keeps {n_fuentes_palabra} official files on federally funded projects for 2020–2025 "
    "in an S3-compatible object store, as Apache Iceberg tables queried by DuckDB, and loads "
    "{filas_hechos} project-year records into the warehouse without altering its original tables. "
    "Seven paired queries return byte-identical results on PostgreSQL and on the lake; the lake is "
    "faster on national aggregations, the warehouse on single-state queries. Over synthetic ground "
    "truth, a per-type cost criterion raises the detection rule's precision from {r0_p2} to {r2_p2} "
    "and its recall from {r0_r2} to {r2_r2}.")

CLAVES = ("Data Warehouse, Lakehouse, Apache Iceberg, Slowly Changing Dimensions, "
          "Open Government Data, Public Works")

EXTENDIDA = (
    "This extended version keeps that design and implements what the conference version left as "
    "future work. The object store, which only held evidence files, now carries a lakehouse layer "
    "over official records: the federally funded projects that states and municipalities reported "
    "to the Ministry of Finance for 2020 to 2025 (Secretaría de Hacienda y Crédito Público [SHCP], "
    "n.d.), in all {entidades} states, joined with the 2020 Census (INEGI, n.d.-a), the 2023 census "
    "of municipal governments (INEGI, n.d.-b) and the 2020 social deprivation index (Consejo "
    "Nacional de Evaluación de la Política de Desarrollo Social [CONEVAL], n.d.). The version also "
    "recomputes the cost criterion per work type, as the failure analysis of the conference version "
    "suggested, projects the records to the Open Contracting for Infrastructure Data Standard and to "
    "an RDF graph, and corrects three figures of the conference version (Section 7.7).")

RQ4 = ("Can the warehouse evolve into a lakehouse over official public-works records without "
       "altering its schema, and which questions does each architecture answer better?")

CRITERIO_DISENO = (
    "*Design.* The failure analysis above suggests two repairs, and both were fixed before the "
    "evaluation was run. C1 is recomputed per work type: the logarithm of each work's budget is "
    "compared with the median of the works of its type and scaled by their median absolute "
    "deviation (×1.4826), so a work is flagged when it is expensive for its type rather than large "
    "in absolute terms; only upward deviations count. A fourth criterion, C4, flags a work whose "
    "financial progress exceeds its physical progress by more than 30 points, the gap that C3 only "
    "notices when physical progress is below 30%. R1 combines the per-type C1 with C2 and C3, and R2 "
    "adds C4; each runs at thresholds of 2, 2.5 and 3 over the ten seeds and four prevalences of "
    "Table 2, and the repository reports all six variants.")

CRITERIO_RESULTADOS = (
    "*Results.* At 15% prevalence, R2 at z > 3 has the highest precision and the largest areas under "
    "both curves of the six variants: precision {r2_precision} and recall {r2_recall}, against "
    "{r0_precision} and {r0_recall} for the conference rule (Table 2). It now out-ranks Isolation "
    "Forest on both areas under the curve ({r2_roc} and {r2_pr}, against {if_roc} and {if_pr}), and "
    "at its alert budget Isolation Forest reaches {if_precision} precision and {if_recall} recall. Per "
    "cause, recall on overpricing rises from {sob0} to {sob_r2} ({sob_z2} at z > 2), on payments "
    "ahead of execution from {pag0} to {pag_r2}, and on ghost works from {fan0} to {fan_r2}. "
    "Overpricing remains the weakest class: an inflation that stays within the spread of its type "
    "still passes, so the per-type rule narrows the failure of Section 7.4 without closing it.")

CORRECCIONES = (
    "Re-running the published code exposed three figures of the conference version that do not "
    "hold; the text above now gives the measured values. Temascaltepec has {pob_tem} inhabitants in "
    "the 2020 Census (INEGI, n.d.-a), not 64,844, a figure that no script in the repository "
    "produces. A freshly seeded instance holds {eventos} audit events, not about 28,000: its {votos} "
    "votes leave {eventos_voto} vote events, because both the generator and the vote trigger record "
    "each vote. The response of `/api/public/obras` weighs {bytes_api} bytes, not 753 kB. "
    "`scripts/cifras_capitulo.py` measures the three against the reference stack.")

FUENTES = (
    "The layer starts from {n_fuentes_palabra} files, each pinned by size and SHA-256 in a manifest: "
    "the six annual files of federally funded spending that SHCP publishes for 2020 to 2025, with "
    "projects, contracts, georeferences, physical targets and progress, financing and observations "
    "(SHCP, n.d.); the locality results of the 2020 Census (INEGI, n.d.-a); the public-procurement "
    "module of the 2023 census of municipal governments, CNGMD (INEGI, n.d.-b); and the 2020 "
    "municipal social deprivation index (CONEVAL, n.d.). Together they weigh {bronce_mb} MB. A "
    "download that no longer matches its hash stops the build, so the layer cannot drift silently "
    "when a publisher replaces a file.")

CAPAS = (
    "The layers follow the bronze, silver and gold progression usual in lakehouse deployments. "
    "Bronze keeps the files byte for byte in an S3-compatible object store; SeaweedFS (Lu, 2025) "
    "stands in for Cloudflare R2, which exposes the same interface. Silver holds "
    "{tablas_plata_palabra} Apache Iceberg tables with a single schema across years, written with "
    "PyIceberg (Apache Software Foundation, 2025) and partitioned by fiscal year and state: "
    "{filas_plata_millones} million rows, built in about {plata_s} s. Each fiscal year is committed "
    "as its own snapshot, which records the hash of its source file, so any table can be read as it "
    "stood after a given year was loaded. Gold holds analytical tables in Parquet, each the output "
    "of one SQL file run by DuckDB (DuckDB Foundation, 2025), which reads the Iceberg tables directly "
    "from the object store, without Spark.")

DECISIONES = (
    "Silver keeps what each publisher reports, and corrections are made, visibly, in gold. "
    "{folio_n_cap} Sonora records carry as amount paid the digits of their own folio, {folio_bn} "
    "billion pesos together: gold keeps them in a column of reported values and sets them to null in "
    "the column used for sums. Until 2023 a folio appears in two reporting periods of the same year, "
    "and gold keeps the later one. Approved amounts are never added across years, because a "
    "multi-year folio repeats its total every year. The user field of the observations, which "
    "identifies officials, does not reach silver, and the {bytes_sin_definir} bytes that the source "
    "encoding leaves undefined are replaced and counted rather than dropped.")

ADITIVA = (
    "The lake does not replace the warehouse; it feeds it. Three tables join the schema of Section 4 "
    "without changing any of the original ones: `dim_municipality` (`dim_municipio`), a Type 1 "
    "dimension of the {dim_mun} municipalities with population and deprivation level; "
    "`dim_federal_project` (`dim_proyecto_federal`), a Type 2 dimension with {versiones} versions of "
    "{folios} folios; and `fact_project_year` (`fact_proyecto_ciclo`), a snapshot fact table of "
    "{filas_hechos} project-year rows that reuses the time dimension of the conference version. A "
    "new version opens when a folio changes status, approved amount or classification from one year "
    "to the next, so the SCD 2 design of Section 4.2 now records an observed history rather than a "
    "seeded one: of the {multi} folios present in more than one year, {cambia_estatus} "
    "({cambia_estatus_pct}%) change status and {cambia_monto} ({cambia_monto_pct}%) change approved "
    "amount, and none changes classification. The row count and MD5 checksum of each of the "
    "{tablas_originales} original tables are identical before and after the load.")

OC4IDS = (
    "Two projections, scoped to the State of Mexico, implement item (2) of the conference future "
    "work. The first maps each investment project to OC4IDS 0.9.5 (Open Contracting Partnership & "
    "CoST – The Infrastructure Transparency Initiative, n.d.) —status, sector, period, budget, public "
    "authority, location, completion value, physical progress and contracting processes, naming "
    "suppliers only when they are companies— and validates the result against the official schema: "
    "{oc_proy} projects, with no errors. The exercise also measures the source: SHCP fills "
    "{oc_campos} of the {oc_total} top-level fields of the standard, so purpose, milestones, "
    "documents and transactions cannot be disclosed from these records however well they are mapped.")

GRAFO = (
    "The second materialises the warehouse tables as an RDF graph through an R2RML mapping run by "
    "morph-kgc (Arenas-Guerrero, 2026) and stored in Oxigraph (Pellissier Tanon, 2023): {tripletas} "
    "triples in {grafo_s} s, {grafo_mb} MB compressed. Each project version is linked to the "
    "previous one with `prov:wasRevisionOf`, so the history of Section 8.2 can be walked in SPARQL, "
    "and every georeferenced observation carries a GeoSPARQL geometry. Each of the "
    "{grafo_consultas_palabra} SPARQL queries in the repository has a SQL twin, and the two return "
    "the same SHA-256; the comparison caught two mapping errors —sums over missing values and "
    "integer version numbers written as decimals— before any result was reported. The namespace, "
    "under w3id.org, has not yet been registered, so its IRIs identify resources but do not resolve.")

ENTORNO = (
    "All measurements in this section were taken on one Windows workstation (version {anfitrion}), "
    "with PostgreSQL {pg_version} in its default configuration and DuckDB {duck_version} with "
    "{hilos} threads; the repository holds the script behind each figure and its output.")

EQUIVALENCIA = (
    "Seven questions were written twice, in SQL for the warehouse and in SQL for DuckDB over the "
    "lake, from national totals by year to the history of a single folio. In every pair the two "
    "results have the same SHA-256, computed over their rows in order (Table 3). Latency splits by "
    "access pattern. The lake is faster on five of the seven queries, including every national "
    "aggregation —{q05_lago} against {q05_pg} ms for the projects flagged by each criterion, "
    "{q04_lago} against {q04_pg} ms for the amount paid per inhabitant by deprivation level— as "
    "expected of a columnar engine that scans compressed data in parallel. The warehouse is faster "
    "on the two queries restricted to one state or one municipality, which its indexes answer in "
    "{q03_pg} and {q07_pg} ms, against {q03_lago} and {q07_lago} ms on the lake. The two stores "
    "therefore complement each other: the warehouse keeps serving the interface, and the lake takes "
    "the analytical scans.")

LEYENDA_T3 = (
    "Seven questions asked of the warehouse and of the lake: rows returned and latency in "
    "milliseconds, mean and p95 of {reps} runs after one warm-up run. In every pair, both results "
    "have the same SHA-256.")

FILAS_T3 = [
    ("Projects and amounts by year", "01"),
    ("Spending by state and type, 2024", "02"),
    ("State of Mexico, 2024", "03"),
    ("Paid per head by deprivation, 2023", "04"),
    ("Flags by criterion and year", "05"),
    ("Status of one folio in each year", "06"),
    ("Temascaltepec by year", "07"),
]

PROPIEDADES = (
    "The properties that justify a lakehouse were checked rather than assumed. *Partition pruning:* "
    "a filter on one year and one state plans {poda_archivos} of the {poda_total} data files of the "
    "projects table, {poda_mb} of {poda_total_mb} MB. *Time travel:* each of the "
    "{n_instantaneas_palabra} snapshots returns exactly the rows accumulated up to its year. *Schema "
    "evolution:* adding a column to a test table left its data file untouched. *Storage:* silver "
    "occupies {plata_mb} MB, against {csv_mb} MB for the CSV files of the six years, gold {oro_mb} MB "
    "and the three new warehouse tables {pg_mb} MB. *Reproducibility:* a rebuild from a clean clone, "
    "with a new Python environment, database and object store, finished in {clon_s} s and returned "
    "the same SHA-256 for all seven queries; it reused source files already downloaded, after "
    "checking their hashes, because the publisher's server was too slow that night to fetch them "
    "again.")

HALLAZGOS = (
    "Read through the warehouse, the records support a few descriptive findings and, more often, "
    "questions for the agencies that publish them; without ground truth, none of them establishes an "
    "irregularity. Georeferences are mostly close to their declared locality, at a median distance of "
    "{geo_med_min} to {geo_med_max} km depending on the year, but the share farther than 25 km fell "
    "from {geo25_alto_min}–{geo25_alto_max}% in 2020–2022 to {geo25_bajo_min}–{geo25_bajo_max}% from "
    "2023 onwards. For 2022 the two official sources on municipal contracting disagree: "
    "{cngmd_menos} of {cngmd_total} municipalities declared to the census fewer works contracts than "
    "SHCP lists with the municipality as contracting party, and {cngmd_cero} of them declared none. "
    "Temascaltepec is among the latter, with no contracts in the census against {tem_shcp} worth "
    "{tem_shcp_mill} million pesos in SHCP. The universes differ —the census covers all municipal "
    "resources and SHCP only federal ones, and a contract listed in 2022 may have been signed "
    "earlier— so the comparison selects municipalities to ask, not to accuse.")

CRITERIOS_REALES = (
    "The criteria behave on the {al_proyectos} investment project-years as Section 7.4 anticipated. "
    "The conference C1 flags {al_c1_ciclo} of them and the per-type C1 {al_c1_tipo}, computed here on "
    "unit cost —approved amount over physical target— within each classification and unit with at "
    "least 30 peers; only {al_c1_ambos} are flagged by both, which confirms on real records that the "
    "original criterion selects large works rather than expensive ones. C2 flags {al_c2}, C3 {al_c3} "
    "of the {al_con_ambos_avances} with both progress figures, and C4 {al_c4}: review lists to rank "
    "for an oversight office, not detections. Spending follows need: in 2023 the median amount paid "
    "per inhabitant on investment projects rises from {rez_bajo} pesos in municipalities of very low "
    "deprivation to {rez_alto} pesos in those of very high deprivation, with a Spearman correlation "
    "of {sp_min} to {sp_max} across years. Direct award accounts for {ad_pct}% of the works contracts "
    "of 2023–2025, but for only {ad_monto_pct}% of their amount.")

SITIO = (
    "The results are published as a static map with a query page{ref_figura}, apart from the "
    "conference site so that the links printed in the chapter stay as they are. Each of its "
    "{capas_palabra} layers is the stored result of one SQL file run on the warehouse or on the "
    "lake. The query of each project layer also names the column that splits its result into files, "
    "one per state for the map points and one per municipality for the details, so that a reader "
    "downloads only what they open, and a verification script repeats every query and compares the "
    "result byte by byte with the published files, failing if a file is edited by hand or if the "
    "databases stop returning the same bytes. The details of every municipality and project name the "
    "official file they come from, with its SHA-256, so that a reader can find the record in the "
    "source; {docs_proy} of the {obras_2024} mapped projects of 2024 also list the links that the reporting "
    "agency published with their contracts ({pdf_proy} include a PDF and {foto_proy} an image), kept in "
    "an annex table of the lake and shown as reported. Projects can be filtered by status, flag and "
    "kind of evidence; a search box finds municipalities, projects and, through an OpenStreetMap "
    "geocoder, any place; and each project can be compared in two releases of Esri's public "
    "satellite-imagery archive: the last one published before the project started and the latest. "
    "The base map tries a chain of key-free tile providers, each checked before use, and falls back "
    "to an outline of the country served by the site itself.")

EJEMPLO = (
    "Fig. 4 opens one flagged project: a drinking-water tank in {ej_municipio}, State of Mexico, "
    "scheduled from {ej_inicio} to {ej_termino}, which the 2024 report still lists as in progress with "
    "{ej_fisico}% physical and {ej_financiero}% financial progress, so C2, C3 and C4 all mark it. "
    "Fig. 5 shows its point in two releases of Esri's archive (Esri, {ej_anio_antes}, {ej_anio_ahora}), "
    "dated by the capture there as Esri's metadata records it: {ej_toma_antes} and {ej_toma_ahora}. "
    "Only the later one shows a round structure beside the point, and the Google Street View panoramas "
    "that the site embeds, from {ej_sv_antes} and {ej_sv_despues}, show the corner without and with a "
    "tank (Google does not allow printing them). The images do not prove that this contract built it; "
    "they turn three flags into one question for the agency: whether the record of a finished work was "
    "never updated. Both views open at "
    "<https://gabrielhuav.github.io/PublicMunicipalWorks_Lakehouse/?estado={ej_estado}&folio={ej_folio}&comparar=1>.")

LEYENDA_F4 = (
    "Fig. 4. The public map filtered to the State of Mexico and opened on the example project: "
    "2024 projects coloured by status, evidence and review filters, and its record with amounts, "
    "progress, flags and evidence. Basemap by Esri (n.d.).")

LEYENDA_F5 = (
    "Fig. 5. The example project in two releases of Esri's World Imagery Wayback (Esri, "
    "{ej_anio_antes}, {ej_anio_ahora}), point circled: captures of {ej_toma_antes} (left) and "
    "{ej_toma_ahora} (right).")

CONCLUSION = (
    "RQ4 is answered in Sections 8 and 9. The warehouse evolved into a lakehouse over {filas_hechos} "
    "official project-year records without altering any of its original tables, and the two "
    "architectures proved complementary rather than rival: both returned identical results to every "
    "paired query, the lake was faster on national aggregations and the warehouse on queries "
    "restricted to one state or municipality. The real records also turned the Type 2 dimensions "
    "into a measured history, and showed how much of what an infrastructure disclosure standard asks "
    "for the source does not record. The per-type criterion repairs part of the failure found in "
    "Section 7.4, but overpricing remains hard to detect from amounts alone.")

LIMITES = (
    " (8) The official records cover only the federally funded spending reported to SHCP, not every "
    "work of a municipality; and the 2025 file, although SHCP's definitive report, holds {p2025} "
    "projects against {p2024} in 2024, for reasons not yet verified. (9) The lake was measured on one "
    "workstation, with PostgreSQL in its default configuration, and against SeaweedFS rather than "
    "R2. (10) The rebuild from a clean clone reused source files already downloaded.")

FUTURO = (
    " This version implements item (0), on an S3-compatible store other than R2, and items (2) and "
    "(5) (Sections 8 and 7.5), and covers every municipality in the country without the pre/post "
    "measurement of item (6). Two items follow from it: (7) registering the w3id.org namespace and "
    "publishing the OC4IDS projection for every state, and (8) taking to SHCP and INEGI the records "
    "that Section 9.3 selects.")

DISPONIBILIDAD = (
    "The lakehouse layer, its queries, both projections, the per-type criterion and the output of "
    "every measurement in Sections 7.5, 7.7, 8 and 9 are archived at "
    "<https://github.com/gabrielhuav/PublicMunicipalWorks_Lakehouse>, and its map and query page "
    "are published at <https://gabrielhuav.github.io/PublicMunicipalWorks_Lakehouse/>. One command, "
    "`lakehouse/etl/ejecutar.py`, downloads the {n_fuentes_palabra} source files, stops if one no "
    "longer matches its hash, builds the layers, loads the warehouse and compares the seven paired "
    "queries; `lakehouse/verificacion/verificar_capas.py` then checks the published site against "
    "both databases. The per-type criterion is reproduced by "
    "`scripts/evaluacion/eval_criterio_costo.py` and the corrections of Section 7.7 by "
    "`scripts/cifras_capitulo.py`.")

IA = (" For this extended version they used Claude (Anthropic) and Gemini (Google), under the same "
      "direction, to write and run the code of the lakehouse layer, the projections and the "
      "verification scripts, to trace each new figure to the script that produces it, and to draft "
      "the new sections, which the authors revised and approved.")

REFERENCIAS = [
    (122, "Ambituuni", [
        "Apache Software Foundation. (2025). *PyIceberg* (Version 0.9.1) [Computer software]. "
        "<https://py.iceberg.apache.org/>",
        "Arenas-Guerrero, J. (2026). *morph-kgc* (Version 2.10.0) [Computer software]. "
        "<https://github.com/morph-kgc/morph-kgc>"]),
    (124, "Barreto", [
        "Consejo Nacional de Evaluación de la Política de Desarrollo Social. (n.d.). *Índice de rezago "
        "social por municipio, 2020* [Social deprivation index by municipality, 2020] [Data set]. "
        "datos.gob.mx. Retrieved {consultado}, from <{url_coneval}>",
        "DuckDB Foundation. (2025). *DuckDB* (Version 1.3.2) [Computer software]. <https://duckdb.org/>"]),
    (125, "Espinoza-Arias", [
        "Esri. (n.d.). *Light Gray Canvas Base* [Basemap]. ArcGIS Online. Retrieved {esri_consultado}, "
        "from <https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer>",
        "Esri. ({ej_anio_antes}). *{ej_titulo_antes}* [Satellite imagery]. ArcGIS Online. "
        "<https://www.arcgis.com/home/item.html?id={ej_item_antes}>",
        "Esri. ({ej_anio_ahora}). *{ej_titulo_ahora}* [Satellite imagery]. ArcGIS Online. "
        "<https://www.arcgis.com/home/item.html?id={ej_item_ahora}>"]),
    (128, "Hogan", [
        "Instituto Nacional de Estadística y Geografía. (n.d.-a). *Censo de Población y Vivienda 2020: "
        "Principales resultados por localidad (ITER)* [2020 Population and Housing Census: Main results "
        "by locality] [Data set]. Retrieved {consultado}, from <{url_iter}>",
        "Instituto Nacional de Estadística y Geografía. (n.d.-b). *Censo Nacional de Gobiernos "
        "Municipales y Demarcaciones Territoriales 2023: Contrataciones públicas* [2023 National Census "
        "of Municipal Governments: Public procurement] [Data set]. Retrieved {consultado}, from "
        "<{url_cngmd}>"]),
    (132, "Lourenço", [
        "Lu, C. (2025). *SeaweedFS* (Version 3.87) [Computer software]. "
        "<https://github.com/seaweedfs/seaweedfs>"]),
    (133, "Open Contracting", [
        "Pellissier Tanon, T. (2023). *Oxigraph* (Version 0.3.22) [Computer software]. "
        "<https://github.com/oxigraph/oxigraph>"]),
    (135, "Rivest", [
        "Secretaría de Hacienda y Crédito Público. (n.d.). *Gasto federalizado: Destino del gasto, "
        "2020–2025* [Federally funded spending: Use of funds, 2020–2025] [Data set]. Transparencia "
        "Presupuestaria. Retrieved {consultado}, from <https://www.transparenciapresupuestaria.gob.mx/>"]),
]


# ---------------------------------------------------------------- autores

# Como en el trabajo 38: Gabriel primero, el Dr. Zagal segundo y después los autores de la versión de
# congreso en su orden. Lo movido o nuevo va en amarillo, también las comas que lo separan.
CORREOS_ALUMNOS = "{ugonzalezc2400, mmaldonadom2200}@alumno.ipn.mx"
CORREOS_IPN = "ghurtadoa@ipn.mx, rzagalf@ipn.mx"
CORREOS_GMAIL = "gonzalezcasianouriel@gmail.com, marcotuliomm.s45@gmail.com"


def autores():
    p = ancla(1, "Uriel González Casiano")
    rs = runs_directos(p)
    assert [texto(r) for r in rs[1:]] == ["Uriel González Casiano", "1", ", ", "Marco Tulio Maldonado Mejía",
                                           "1", ", ", "Gabriel Hurtado Avilés", "1"]
    nombre, sup, coma = rs[1], rs[2], rs[3]
    for r in rs[6:]:
        p.remove(r)
    nuevos = []
    for n in ("Gabriel Hurtado Avilés", "Roberto Eswart Zagal Flores"):
        nuevos += [amarillo(clon(nombre, n)), amarillo(clon(sup, "1")), amarillo(clon(coma, ", "))]
    despues(rs[0], *nuevos)

    p = ancla(3, CORREOS_ALUMNOS)
    linea1, salto, linea2 = runs_directos(p)
    assert texto(linea1) == CORREOS_ALUMNOS + ", ghurtadoa@ipn.mx" and texto(salto) == ""
    assert texto(linea2) == CORREOS_GMAIL + ", gabrielhuav@gmail.com"
    nuevos = [amarillo(clon(linea1, CORREOS_IPN)), amarillo(copy.deepcopy(salto)),
              clon(linea1, CORREOS_ALUMNOS), copy.deepcopy(salto),
              amarillo(clon(linea2, "gabrielhuav@gmail.com, ")), clon(linea2, CORREOS_GMAIL)]
    for r in (linea1, salto, linea2):
        p.remove(r)
    for x in nuevos:
        p.append(x)


# ---------------------------------------------------------------- cambios

def main():
    con_figura = "--sin-figura" not in sys.argv and all(r.exists() for r in FIGURAS)
    C["ref_figura"] = " (Fig. 4)" if con_figura else ""
    resumen = f(RESUMEN)
    n_resumen = len(resumen.split())
    assert 70 <= n_resumen <= 150, n_resumen

    # Título, resumen y palabras clave
    reemplazar(ancla(0, "A Dimensional Data Warehouse"), texto(B[0]), TITULO)
    autores()
    celda = list(B[6].iter(qn("w:p")))
    p_resumen = next(p for p in celda if texto(p).startswith("Abstract. "))
    reemplazar(p_resumen, texto(p_resumen)[len("Abstract. "):], resumen)
    p_claves = next(p for p in celda if texto(p).startswith("Keywords: "))
    reemplazar(p_claves, texto(p_claves)[len("Keywords: "):], CLAVES)

    # 1 Introducción
    reemplazar(ancla(10, "The lakehouse paradigm"), "is proposed as an evolution path (Section 8)",
               "was proposed as an evolution path and is implemented in this version (Section 8)")
    p11 = ancla(11, "This article presents a prototype")
    reemplazar(p11, "(64,844 inhabitants across 55 communities)",
               f("({pob_tem} inhabitants in the 2020 Census; Instituto Nacional de Estadística y "
                 "Geografía [INEGI], n.d.-a)"))
    despues(p11, cuerpo(EXTENDIDA))
    rq3 = ancla(15, "RQ3.")
    rq4 = copy.deepcopy(rq3)
    etiqueta, tab, _ = runs_directos(rq4)
    etiqueta.find(qn("w:t")).text = "RQ4."
    for r in runs_directos(rq4)[2:]:
        rq4.remove(r)
    for r in (etiqueta, tab):
        amarillo(r)
    for x in piezas(RQ4):
        rq4.append(x)
    despues(rq3, rq4)
    p16 = ancla(16, "The three structure")
    reemplazar(p16, "The three structure", "The four structure")
    reemplazar(p16, "(Section 8); RQ2", "(Section 10); RQ2")
    reemplazar(p16, "and RQ3 by the evaluation of the detection module (Section 7.4).",
               "RQ3 by the evaluation of the detection module (Sections 7.4 and 7.5); and RQ4 by the "
               "lakehouse layer and its evaluation (Sections 8 and 9).")
    anexar(ancla(18, "The contribution is threefold"),
           " This extended version adds (4) a lakehouse layer over the 2020–2025 federal records, "
           "loaded additively into the warehouse and checked against it query by query (RQ4), and "
           "(5) a per-type cost criterion that addresses the failure diagnosed in Section 7.4.")
    p19 = ancla(19, "Over a seeded test scenario")
    reemplazar(p19, "Every figure in this article comes from synthetic data",
               "Except in Sections 8 and 9, which measure official records, every figure in this "
               "article comes from synthetic data")
    anexar(p19, " Section 9.3 reports what the official records list for Temascaltepec, which is not a "
                "claim about how its works were executed either.")
    reemplazar(ancla(20, "The remainder of the article"),
               "Section 7 reports results; and Section 8 concludes.",
               "Section 7 reports results; Section 8 builds the lakehouse layer over official records "
               "and Section 9 evaluates it; and Section 10 concludes.")

    # 2 a 6: referencias cruzadas y correcciones en su lugar
    reemplazar(ancla(30, "A directly relevant body"), "A natural convergence (Section 8) is",
               "A natural convergence (Section 8.3) is")
    reemplazar(ancla(42, "A Flask/Python REST API"), "limitations in Section 8.2.",
               "limitations in Section 10.2.")
    reemplazar(ancla(65, "fact_audit_events has a grain"),
               "so a populated instance holds about 28,000.",
               f("so a freshly seeded instance holds {eventos} (Section 7.7)."))
    reemplazar(ancla(73, "These are standard SQL views"), "64,844 inhabitants",
               f("{pob_tem} inhabitants"))
    reemplazar(ancla(75, "The object layer uses Cloudflare R2"),
               "is proposed as future work (Section 8).",
               "was proposed as future work and is implemented in Section 8.")

    # 7 Resultados
    tabla1 = ancla(93, "Operation")
    celda_api = next(p for p in tabla1.iter(qn("w:p")) if "753 kB" in texto(p))
    reemplazar(celda_api, "753 kB", f("{kb_api} kB"))
    p88 = ancla(88, "Measured results and projections")
    reemplazar(p88, "Sections 7.2, 7.3 and 7.4)", "Sections 7.2 to 7.5 and 7.7)")
    reemplazar(p88, "deployment: Section 7.5)", "deployment: Section 7.6)")
    reemplazar(p88, "No number in this article is a measurement taken on real municipal data.",
               "Outside Sections 8 and 9, no number in this article is a measurement taken on real "
               "municipal data.")
    anexar(ancla(89, "Three synthetic populations"),
           " Sections 8 and 9 add a fourth population, of official records, which is never combined "
           "with the three synthetic ones.")
    anexar(LEYENDA_TABLA, " The last two rows are added in this version (Section 7.5).", RPR_TABLA)
    filas2 = TABLA2.findall(qn("w:tr"))
    nueva = fila(filas2[-1], ["Per-type rule R2, z > 3", f("{r2_precision_ic}"), f("{r2_recall_ic}"),
                              f("{r2_f1_ic}"), f("{r2_roc_ic}"), f("{r2_pr_ic}")])
    despues(filas2[-1], nueva, fila(filas2[-1], [
        "Isolation Forest (R2 budget)", f("{if_precision_ic}"), f("{if_recall_ic}"),
        f("{if_f1_ic}"), f("{if_roc_ic}"), f("{if_pr_ic}")]))
    h76 = ancla(109, "7.5 Illustrative")
    for x in (h2("7.5 A Per-Type Cost Criterion (Measured)"), cuerpo(CRITERIO_DISENO),
              cuerpo(CRITERIO_RESULTADOS)):
        h76.addprevious(x)
    reemplazar(h76, "7.5 ", "7.6 ")

    insertar_tras(ancla(110, "The warehouse answers questions"),
                  "until the model is populated with municipal records.",
                  " Section 9.3 reports the first observations of this kind, from federal records.")

    # 7.7, 8 y 9, después de la sección 7.6
    tabla3 = copy.deepcopy(TABLA2)
    trs = tabla3.findall(qn("w:tr"))
    cabecera, modelo = trs[0], trs[1]
    for tr in trs[1:]:
        tabla3.remove(tr)
    ref = despues(cabecera, fila(cabecera, ["Question", "Rows", "PostgreSQL mean", "PostgreSQL p95",
                                            "Lake mean", "Lake p95"]))
    tabla3.remove(cabecera)
    for nombre, n in FILAS_T3:
        ref = despues(ref, fila(modelo, [nombre, C[f"q{n}_filas"], C[f"q{n}_pg"], C[f"q{n}_pgp95"],
                                         C[f"q{n}_lago"], C[f"q{n}_lagop95"]]))
    leyenda_t3 = parrafo(LEYENDA_TABLA, "Table 3. " + f(LEYENDA_T3), RPR_TABLA)
    nuevos = [
        h2("7.7 Corrections to the Conference Version (Measured)"), cuerpo(CORRECCIONES),
        h1("8 A Lakehouse Layer over Official Records"),
        h2("8.1 Sources and Layers"), cuerpo(FUENTES), cuerpo(CAPAS), cuerpo(DECISIONES),
        h2("8.2 Additive Integration with the Warehouse"), cuerpo(ADITIVA),
        h2("8.3 Interoperability: OC4IDS and an RDF Graph"), cuerpo(OC4IDS), cuerpo(GRAFO),
        h1("9 Evaluation over Official Records (Measured)"), cuerpo(ENTORNO),
        h2("9.1 Equivalence and Latency"), cuerpo(EQUIVALENCIA), leyenda_t3, tabla3,
        copy.deepcopy(ESPACIO),
        h2("9.2 Lakehouse Properties"), cuerpo(PROPIEDADES),
        h2("9.3 What the Records Show"), cuerpo(HALLAZGOS), cuerpo(CRITERIOS_REALES),
        h2("9.4 A Public Site Verified against the Databases"), cuerpo(SITIO),
    ]
    if con_figura:
        nuevos += [cuerpo(EJEMPLO), figura(FIG_P, FIGURAS[0], 4), parrafo(LEYENDA_FIG, LEYENDA_F4),
                   figura(FIG_P, FIGURAS[1], 5), parrafo(LEYENDA_FIG, f(LEYENDA_F5))]
    despues(ancla(110, "The warehouse answers questions"), *nuevos)

    # 10 Conclusiones (antes 8)
    for i, viejo, nuevo in ((111, "8 ", "10 "), (112, "8.1 ", "10.1 "), (115, "8.2 ", "10.2 "),
                            (117, "8.3 ", "10.3 "), (119, "8.4 ", "10.4 ")):
        reemplazar(ancla(i, viejo), viejo, nuevo)
    despues(ancla(114, "The proposal shows"), cuerpo(CONCLUSION))
    p116 = ancla(116, "(1) There is no hosted")
    insertar_tras(p116, "nothing here has been validated against real ones.",
                  " Sections 8 and 9 use official records, but without ground truth: they test the "
                  "architecture, not the detector.")
    insertar_tras(p116, "is not queried analytically.",
                  " Section 8 lifts this limitation for official records, though not yet for the "
                  "binary evidence.")
    anexar(p116, f(LIMITES))
    anexar(ancla(118, "(0) Evolve the object layer"), FUTURO)
    # Alineado a la izquierda: justificado, las rutas largas dejan huecos de media línea
    disponibilidad = cuerpo(DISPONIBILIDAD)
    disponibilidad.find(qn("w:pPr")).find(qn("w:jc")).set(qn("w:val"), "left")
    despues(ancla(120, "The warehouse DDL"), disponibilidad)
    p_ia = ancla(139, "Declaration on the Use of Generative AI")
    anexar(p_ia, IA, rpr_de(p_ia, 2))

    # Referencias, en orden alfabético
    for i, comienzo, nuevas in REFERENCIAS:
        despues(ancla(i, comienzo), *(parrafo(REFERENCIA, f(r)) for r in nuevas))

    doc.save(str(SALIDA))
    print(f"{SALIDA.name}: resumen de {n_resumen} palabras, figura {'sí' if con_figura else 'no'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
