# Lago de datos de obra pública federalizada

Convierte en datos reales lo que el capítulo de ICOKG 2026 dejó como trabajo futuro:
una capa consultable sobre almacenamiento de objetos, con formato de tabla abierto y
sin Spark. **Aquí todo viene de fuentes oficiales.** Las obras sintéticas del capítulo
siguen en su sitio y nunca se mezclan con estas.

```text
Fuentes oficiales ──► bronce ──► plata ──────► oro ──────► almacén PostgreSQL
SHCP, INEGI,          ZIP y CSV   Iceberg      Parquet     tablas nuevas, aditivas
CONEVAL               intactos    esquema      analítico
                                  único
```

| Capa | Dónde | Qué guarda |
| --- | --- | --- |
| Bronce | `s3://obras-lago/bronce/` | Los archivos oficiales, byte por byte, en rutas hive |
| Plata | `s3://obras-lago/plata/` | 10 tablas Iceberg con esquema único; cada ciclo es una instantánea ligada al SHA-256 de su archivo |
| Oro | `s3://obras-lago/oro/` | Tablas analíticas en Parquet, una por archivo de `oro/` |
| Almacén | `warehouse.*` en PostgreSQL | `dim_municipio`, `dim_proyecto_federal` (SCD 2) y `fact_proyecto_ciclo` |

El almacén de objetos es SeaweedFS con API S3, la misma que usa Cloudflare R2. Para
usar R2 basta con definir `LAGO_S3`, `LAGO_S3_LLAVE` y `LAGO_S3_SECRETO`; no se ha probado
contra R2 porque el proyecto no tiene un bucket. El catálogo Iceberg es un SQLite local.

## Reproducir

Requiere Docker, Python 3.10 y 3 GB libres para la descarga.

```bash
docker compose -f docker/compose.yml up -d db
docker compose -f docker/compose.yml --profile tools run --rm seed
docker compose -f lakehouse/compose.yml up -d
py -3 -m venv lakehouse/.venv
lakehouse/.venv/Scripts/python -m pip install -r lakehouse/requirements.txt
lakehouse/.venv/Scripts/python lakehouse/etl/ejecutar.py
```

`ejecutar.py` baja las 9 fuentes de `fuentes.json`, compara sus bytes con el SHA-256
fijado y falla si alguna cambió. Después construye las capas, carga el almacén y corre
`verificacion/verificar_lago.py`. SeaweedFS tarda unos segundos en aceptar conexiones.

Los archivos oficiales no se guardan en Git, porque suman 2.1 GB: se bajan de su origen.
`lakehouse/.gitattributes` protege los archivos de evidencia de `core.autocrlf`.

## Qué comprueba `verificacion/`

| Archivo | Comprueba |
| --- | --- |
| `verificar_lago.py` | Las 7 consultas dan el mismo SHA-256 en PostgreSQL y en el lago, y mide latencia, poda, viaje en el tiempo, evolución de esquema y tamaños |
| `resumen_auditoria.py` | Las cifras de la auditoría sobre datos reales |
| `evidencia_aditiva.json` | Filas y md5 de las 34 tablas originales, idénticas antes y después de cargar |
| `evidencia_plata.json` | Por archivo: SHA-256, filas, líneas descartadas, huérfanos y valores no convertidos |
| `verificar_capas.py` | Cada capa del sitio es, byte por byte, lo que devuelve su consulta (`evidencia_capas.txt`) |

Las consultas y los comandos para verlas están en [`consultas/README.md`](consultas/README.md).

## Sitio

`sitio/` es un mapa estático con su página de consultas. Se publica con GitHub Pages desde un
repositorio propio, `gabrielhuav/PublicMunicipalWorks_Lakehouse`, para que el sitio del capítulo no
cambie. Cada capa es el resultado de una consulta de `capas/`: las `.pg.sql` corren en PostgreSQL y
las `.duck.sql` en el lago. Para regenerarlas y comprobarlas:

```bash
lakehouse/.venv/Scripts/python lakehouse/etl/exportar_capas.py
lakehouse/.venv/Scripts/python lakehouse/verificacion/verificar_capas.py
```

El mapa base usa el módulo de los mapas del trabajo 38 (`sitio/mapa-teselas.js`): prueba una
cadena de proveedores sin clave, deja elegir otro a mano y, si ninguno responde, dibuja una copia
local con el contorno del país y los límites estatales, de Natural Earth, que genera
`etl/mapa_base.py`. Leaflet va copiado en `sitio/vendor/` para no depender de una CDN.

La ficha de cada municipio y de cada proyecto nombra el archivo oficial del que sale, con su
SHA-256. Los proyectos enlazan además los documentos que la dependencia publicó con sus contratos:
`etl/enlaces.py` los guarda en la tabla anexa `anexo.enlaces_contratos` (2023 a 2025), fuera de
plata, y la capa omite los que llevan la cuenta de correo de quien los subió. Los proyectos se
pueden filtrar por estatus y por marcas C1 a C4.

## Interoperabilidad

Alcance: el Estado de México. Las dos salidas se generan de los datos, sin edición a mano, y
quedan en `lakehouse/datos/publicar/`, que Git ignora.

**OC4IDS.** `proyecciones/oc4ids.py` proyecta cada proyecto de inversión a OC4IDS 0.9.5 y lo
valida contra el esquema oficial, copiado en `proyecciones/esquema/`. Un campo sin dato se
omite, no se rellena. El id es el folio porque el proyecto no tiene un prefijo registrado, y el
resultado es una proyección de investigación, no una publicación de SHCP.

**Grafo RDF.** `grafo/materializar.py` aplica el mapeo R2RML `grafo/mapeo.r2rml.ttl` sobre
PostgreSQL con morph-kgc, y usa PROV para volver recorrible el historial SCD 2. Cada consulta
`grafo/consultas/*.rq` tiene un gemelo `.sql` y se comparan por SHA-256. Instala su entorno aparte:

```bash
py -3 -m venv lakehouse/grafo/.venv
lakehouse/grafo/.venv/Scripts/python -m pip install -r lakehouse/grafo/requirements.txt
lakehouse/grafo/.venv/Scripts/python lakehouse/grafo/materializar.py
```

```bash
lakehouse/.venv/Scripts/python lakehouse/proyecciones/oc4ids.py
```

## Decisiones sobre los datos

- **Plata conserva lo que dice la fuente y oro lo corrige a la vista.** Tres filas de
  Sonora traen como monto pagado los dígitos de su folio, por 600.9 mil millones de pesos.
  El periodo 5 corrige una; `pagado_reportado` conserva las otras dos y `pagado` las anula.
- **Por ciclo se toma el último periodo.** Hasta 2023 un folio aparece en los periodos 4 y 5.
- **`aprobado` no se suma entre ciclos.** Un folio plurianual repite su monto global.
- **Las reglas C1 a C4 dan una lista para revisar.** Sin verdad de referencia no son
  detecciones, ni prueban irregularidad.
- **La cobertura es el gasto federalizado.** No son todas las obras de ningún municipio.
- **USUARIO de las observaciones no sube a plata:** identifica a personas.

Datos de SHCP según sus
[términos de uso](https://www.transparenciapresupuestaria.gob.mx/es/PTP/Terminos_y_Condiciones),
que permiten redistribuir citando la fuente; datos de CONEVAL con CC BY 4.0, e INEGI
como datos abiertos. Las URL y fechas de consulta están en `fuentes.json`.
