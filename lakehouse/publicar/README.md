# Federally Funded Public Works in Mexico: a Measured Lakehouse Layer

Reproducible artefact of the extended version of a chapter accepted at the **5th International
Conference on Ontologies and Knowledge Graphs (ICOKG 2026)**, prepared for the special issue of the
*International Journal of Combinatorial Optimization Problems and Informatics*.

- **Map → <https://gabrielhuav.github.io/PublicMunicipalWorks_Lakehouse/>**
- **Queries → <https://gabrielhuav.github.io/PublicMunicipalWorks_Lakehouse/consultas.html>**

The conference version is unchanged in
[`gabrielhuav/PublicMunicipalWorks_DWH`](https://github.com/gabrielhuav/PublicMunicipalWorks_DWH), with its
demonstration at <https://gabrielhuav.github.io/PublicMunicipalWorks_DWH/>. That demonstration runs on
**synthetic** works. Everything this repository adds comes from **official records**, and the two are
never mixed.

## What it adds

The chapter left a lakehouse architecture as future work. This repository implements it on the
federally funded spending that the Ministry of Finance (SHCP) publishes, for fiscal years 2020 to 2025,
joined with INEGI's 2020 Census and 2023 municipal government census and CONEVAL's 2020 social
deprivation index.

| Layer | Where | Content |
| --- | --- | --- |
| Bronze | S3 bucket `obras-lago/bronce/` | The nine official files, byte for byte, pinned by SHA-256 in `lakehouse/fuentes.json` |
| Silver | `obras-lago/plata/` | Ten Apache Iceberg tables with one schema; each fiscal year is a snapshot tied to the hash of its file |
| Gold | `obras-lago/oro/` | Analytical Parquet tables, one per query in `lakehouse/oro/` |
| Warehouse | PostgreSQL `warehouse.*` | Three new tables, loaded additively into the chapter's warehouse |

The object store is SeaweedFS behind the S3 API; DuckDB reads the Iceberg tables directly, without
Spark. `lakehouse/README.md` describes each step, and `lakehouse/consultas/README.md` gives the
queries and the commands to run them.

## The map is the database

The site is static: it does not query a database live. `lakehouse/etl/exportar_capas.py` runs each
query in `lakehouse/capas/`, in PostgreSQL or in the lake, and stores its result in
`lakehouse/sitio/datos/` with a hash. `lakehouse/verificacion/verificar_capas.py` repeats every query
and compares the result byte by byte with the published file
([evidence](lakehouse/verificacion/evidencia_capas.txt)). The Pages workflow publishes
`lakehouse/sitio/` exactly as the repository holds it.

## Rebuilding it

You need Docker, Python 3.10 and at least 6 GB of disk. On Windows, clone into a short path. From the
repository root:

```bash
docker compose -f docker/compose.yml up -d db
```

```bash
docker compose -f docker/compose.yml --profile tools run --rm seed
```

```bash
docker compose -f lakehouse/compose.yml up -d
```

```bash
py -3 -m venv lakehouse/.venv
```

```bash
lakehouse/.venv/Scripts/python -m pip install -r lakehouse/requirements.txt
```

```bash
lakehouse/.venv/Scripts/python lakehouse/etl/ejecutar.py
```

```bash
lakehouse/.venv/Scripts/python lakehouse/verificacion/verificar_capas.py
```

The first two commands build the chapter's warehouse with its synthetic population, which the lake
leaves untouched: `lakehouse/verificacion/evidencia_aditiva.json` holds the row count and md5 of each
original table before and after the load. `ejecutar.py` downloads the official files, stops if one of
them no longer matches its hash, builds the layers, loads the warehouse and compares 7 queries between
PostgreSQL and the lake ([evidence](lakehouse/verificacion/evidencia_lago.json)). A rebuild from a
clean clone gave the same query hashes; that run reused official files already downloaded, after
checking their hashes ([evidence](lakehouse/verificacion/evidencia_clon_limpio.txt)).

`scripts/cifras_capitulo.py` measures the three figures of the chapter that the extended version
corrects. It also needs the API, started with `docker compose -f docker/compose.yml up -d db api`
([evidence](lakehouse/verificacion/cifras_capitulo.json)).

## Limits of the data

- The records cover federally funded spending reported to SHCP, not all the works of any municipality.
- Criteria C1 to C4 produce a list to review. Without ground truth they are not detections and do not
  prove an irregularity.
- Each project is drawn where the reporting agency placed it. Municipalities are drawn at their seat,
  because the lake holds no municipal polygons.
- The 2025 file is SHCP's definitive report, yet it holds fewer projects than earlier years. Why has
  not been verified.
- The CNGMD and SHCP count contracts over different universes, so a difference between them is a
  question, not a finding.

## Credit and licences

`backend/`, `db/`, `docker/` and `scripts/` come from the chapter's repository,
[`gabrielhuav/PublicMunicipalWorks_DWH`](https://github.com/gabrielhuav/PublicMunicipalWorks_DWH), whose
origin is [`Urigc/Obras_publicas`](https://github.com/Urigc/Obras_publicas) by Uriel González Casiano and
Marco Tulio Maldonado Mejía. The extension is `lakehouse/` and two scripts:
`scripts/evaluacion/eval_criterio_costo.py`, which evaluates the per-type cost criterion, and
`scripts/cifras_capitulo.py`. Code is released under the MIT licence; see `LICENSE.md`.

Data keep the terms of their publishers, listed file by file in `lakehouse/fuentes.json`: SHCP under
its [terms of use](https://www.transparenciapresupuestaria.gob.mx/es/PTP/Terminos_y_Condiciones),
INEGI as open data and CONEVAL under CC BY 4.0. Leaflet 1.9.4 is included in `lakehouse/sitio/vendor/`
under its BSD-2-Clause licence. Base maps are © OpenStreetMap contributors (ODbL), with tiles from
CARTO or Esri as credited on the map.
