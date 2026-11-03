# Prompt de relevo (2 nov 2026)

Este archivo es el prompt para la sesión que continúa el trabajo. Está en la raíz del repositorio:
`PROMPT_RELEVO.md`, rama `ijcopi-obras`.

- En línea: <https://github.com/gabrielhuav/PublicMunicipalWorks_DWH/blob/ijcopi-obras/PROMPT_RELEVO.md>
- En esta PC: `C:\Users\gabri\Documents\GitHub Desktop\PublicMunicipalWorks_DWH\PROMPT_RELEVO.md`

---

Continúas la extensión del trabajo 37 de ICOKG 2026 para el número especial de IJCOPI. Trabajas para Gabriel Hurtado Avilés: háblale en español y sé breve, le importa no gastar créditos.

Repositorio: <https://github.com/gabrielhuav/PublicMunicipalWorks_DWH>, rama `ijcopi-obras`
(<https://github.com/gabrielhuav/PublicMunicipalWorks_DWH/tree/ijcopi-obras>). En esta PC:
`C:\Users\gabri\Documents\GitHub Desktop\PublicMunicipalWorks_DWH`. Sitio público del lago:
<https://github.com/gabrielhuav/PublicMunicipalWorks_Lakehouse> y
<https://gabrielhuav.github.io/PublicMunicipalWorks_Lakehouse/>.

Antes de hacer cualquier cosa, lee completo `AGENTS.md`
(<https://github.com/gabrielhuav/PublicMunicipalWorks_DWH/blob/ijcopi-obras/AGENTS.md>). Es la memoria compartida: tiene las reglas que no se negocian, los hechos ya verificados y la sección "Relevo". Actualízala conforme avances y agrega tu línea a la Bitácora.

## Reglas principales (el detalle está en AGENTS.md)

- Ningún push sin autorización explícita de Gabriel. Antes de cada push, `scripts/verificar_enlaces_springer.ps1` debe terminar con `fallos: 0`. Nunca uses `git push --tags`. No fusiones a `main` ni toques `docs/`.
- No modifiques la base congelada: `paper/Paper_37_1.tex` y sus PDF, y `paper/ijcopi/Paper37_IJCOPI_v0_fiel.docx` y su PDF.
- No envíes correos sin que Gabriel vea el texto y lo apruebe.
- Cada cifra del artículo sale de un script del repositorio. Si no puedes verificar algo, dilo.
- El título y el bloque de autores ya están aprobados: no los toques.
- El .docx no se edita a mano: lo arma `paper/ijcopi/extender_v1.py` (los textos nuevos viven en ese script y las cifras en `cifras_extension.py`). Todo lo nuevo va resaltado en amarillo, y las figuras nuevas con marco amarillo. Escribe en inglés británico.
- Límites: máximo 15 páginas (hoy tiene exactamente 15) y al menos 9,582 palabras (hoy tiene 10,172). Mide con `paper/ijcopi/word_a_pdf.ps1` (usa Word), corre `verificar_amarillo.py` y revisa el PDF a ojo.

## Estado al cerrar la sesión del 2 de noviembre de 2026 (Gemini)

1. **Tarea 1 resuelta (Street View en el artículo):** Gabriel eligió la **Opción 1** (enlazar en la sección 9.4 al comparador en vivo `<https://gabrielhuav.github.io/PublicMunicipalWorks_Lakehouse/?estado=15&folio=MEX17170401001337&comparar=1>` sin meter capturas de Street View en el `.docx`, cumpliendo las reglas de Google).
2. **Filtro nuevo en la web (`?evidencia=16`):** Se agregó en `lakehouse/sitio/mapa.js` el chip **"Con Street View antes y después"** / **"With Street View before and after"** dentro de *Evidencia verificable*, cruzado con `lakehouse/sitio/ejemplos.json` sin alterar los JSON de capas verificados byte por byte.
3. **Corrección de puntos fuera de los estados y nueva Figura 4:**
   - Al elegir un estado se ocultan los círculos municipales de los demás estados y se excluyen del mapa y del botón *Acercar el mapa a estos proyectos* los registros cuyas coordenadas en SHCP caen fuera del estado seleccionado (`p.fuera`).
   - `paper/ijcopi/figura_ejemplo_mapa.png` se recapturó con el Estado de México completo, todos los filtros visibles en el panel izquierdo y la ficha del proyecto `MEX17170401001337` abierta a la derecha.
4. **Verificación completa de `Paper37_IJCOPI_v1_extendida.docx` y `.pdf`:**
   - **15 páginas** (máximo 15), **10,180 palabras** (mínimo 9,582), resumen de **140 palabras**, **6 palabras clave** y **`palabras agregadas sin amarillo: 0`** (`verificar_amarillo.py`).
   - Todas las cifras coinciden con sus scripts y evidencias (`cifras_extension.py`, `verificar_scd.py`); las **28 referencias** en APA 7 coinciden con las citas en el texto; las **32 URL y DOI** responden `200 OK` / DOI válido; y `verificar_enlaces_springer.ps1` da `fallos: 0`.

## Lo que tiene este proyecto (`PublicMunicipalWorks_DWH`) que el artículo de agua (`Data_Warehouse_static`) aún no tiene

Para llevar estas mejoras al proyecto hermano de agua (trabajo 38 de ICOKG / IJCOPI):
- **Repositorio de trabajo (agua):** `C:\Users\gabri\Documents\GitHub Desktop\Data_Warehouse_static`, rama `ijcopi-zmvm` (<https://github.com/gabrielhuav/Data_Warehouse_static/tree/ijcopi-zmvm>).
- **Sitio público extendido (agua):** `C:\Users\gabri\Documents\GitHub Desktop\Data_Warehouse_ZMVM` (<https://github.com/gabrielhuav/Data_Warehouse_ZMVM>, publicado en <https://gabrielhuav.github.io/Data_Warehouse_ZMVM/>).
- **Archivos de referencia en este proyecto (obras):** `lakehouse/sitio/index.html`, `lakehouse/sitio/mapa.js`, `lakehouse/sitio/sitio.css`, `lakehouse/sitio/sitio.js`, `lakehouse/sitio/mapa-teselas.js`, `lakehouse/publicar/comprobar_en_vivo.py` y `paper/ijcopi/capturar_mapa.ps1`.

Funciones que tiene el mapa de obras (`lakehouse/sitio/`) y que faltan en el mapa de agua (`ijcopi/mapa-zm.html` y `ijcopi/mapa-zm.js`):
1. **Buscador unificado tipo mapa de calles (`buscar`, `elegir`, `normal` en `lakehouse/sitio/mapa.js`):**
   - Caja de búsqueda flotante arriba a la izquierda con autocompletado instantáneo (sin acentos), navegación con teclado (`↑`, `↓`, `Enter`, `Escape`) y resultados agrupados por categoría: busca tanto en los elementos propios del almacén (estados, municipios, colonias, pozos, presas, estaciones, claves) como en cualquier calle o lugar mediante geocodificador abierto sin clave (`Photon` de Komoot con respaldo automático a `Nominatim` de OpenStreetMap).
2. **Mapa a pantalla completa con paneles flotantes y diseño móvil (`lakehouse/sitio/sitio.css`):**
   - En lugar de rejilla estática de tres columnas, el mapa ocupa toda la ventana con buscador y panel de filtros flotantes a la izquierda, cajón de detalle a la derecha que se abre al elegir un elemento (marcándolo con un aro en el mapa), y hojas inferiores (*bottom sheets*) en teléfono.
3. **Filtros por fichas (*chips*) con conteo en vivo y encuadre (`pintarFiltros`, `verFiltrados` en `lakehouse/sitio/mapa.js`):**
   - Botones tipo píldora con conteo dinámico y acción *"Acercar el mapa a estos..."* excluyendo puntos con coordenadas fuera de la región.
4. **Trazabilidad por registro en la ficha de detalle (`abrirMunicipio`, `abrirProyecto` en `lakehouse/sitio/mapa.js`):**
   - Cada ficha individual muestra el archivo oficial exacto del que proviene ese dato junto con su hash (`SHA-256` / `MD5`) y enlaces verificables (con respaldo a Internet Archive).
5. **Comparador satelital antes/ahora (Esri Wayback con fecha real de captura `SRC_DATE2`) y Street View incrustado sin clave (`comparar`, `origenTesela`, `fechaToma` en `lakehouse/sitio/mapa.js`):**
   - Útil en agua para ver presas, pozos, plantas o zonas de hundimiento/inundación en dos fechas del archivo satelital de Esri y a nivel de calle en Google Street View.
6. **Estado completo en la URL (`setUrl` en `lakehouse/sitio/mapa.js`) y verificador en vivo (`lakehouse/publicar/comprobar_en_vivo.py`):**
   - Guarda posición (`?c=lat,lon,zoom`), indicador, filtros y elemento abierto en la URL para enlazar hallazgos desde el artículo, y comprueba tras publicar que todos los archivos en GitHub Pages tengan el mismo SHA-256 que en local.

### Mensaje para iniciar la conversación en el proyecto de agua (`Data_Warehouse_static`)

```text
Hola. Vas a trabajar en mi artículo y sitio del trabajo 38 (agua en la ZMVM) para IJCOPI.
- Repositorio de trabajo en esta PC: C:\Users\gabri\Documents\GitHub Desktop\Data_Warehouse_static, rama ijcopi-zmvm (en línea: https://github.com/gabrielhuav/Data_Warehouse_static/tree/ijcopi-zmvm).
- Copia y sitio público: C:\Users\gabri\Documents\GitHub Desktop\Data_Warehouse_ZMVM (https://github.com/gabrielhuav/Data_Warehouse_ZMVM y https://gabrielhuav.github.io/Data_Warehouse_ZMVM/).

Primero lee completo AGENTS.md en C:\Users\gabri\Documents\GitHub Desktop\Data_Warehouse_static\AGENTS.md y respeta todas sus reglas (ningún push sin mi autorización, no tocar enlaces de ICOKG, no reutilizar texto del trabajo 37). Háblame en español y sé breve.

Después lee la sección "Lo que tiene este proyecto (PublicMunicipalWorks_DWH) que el artículo de agua (Data_Warehouse_static) aún no tiene" en C:\Users\gabri\Documents\GitHub Desktop\PublicMunicipalWorks_DWH\PROMPT_RELEVO.md (en línea: https://github.com/gabrielhuav/PublicMunicipalWorks_DWH/blob/ijcopi-obras/PROMPT_RELEVO.md) y revisa cómo están implementados el mapa y el buscador en C:\Users\gabri\Documents\GitHub Desktop\PublicMunicipalWorks_DWH\lakehouse\sitio\ (index.html, mapa.js, sitio.css, sitio.js, mapa-teselas.js) y lakehouse/publicar/comprobar_en_vivo.py.

Quiero llevar al sitio de agua (ijcopi/mapa-zm.html, ijcopi/mapa-zm.js, ijcopi/zm.css) esas mejoras, empezando por el buscador unificado (que busque alcaldías/municipios, colonias, pozos, presas, acuíferos, estaciones y lugares abiertos por Photon/Nominatim con autocompletado y teclado) y lo que este proyecto de obras tiene y el de agua aún no, adaptándolo a las capas de agua y actualizando la sección correspondiente del .docx sin pasar de 15 páginas. Antes de editar, dime un plan breve de qué vas a integrar en el sitio de agua y en el artículo.
```

## Después, en este orden (ver "Relevo" en AGENTS.md)

1. Gabriel decide si los alumnos de los repositorios de referencia van en agradecimientos.
2. Gabriel revisa la v1 completa, sobre todo la declaración de IA.
3. Envío a IJCOPI antes del 9 de noviembre de 2026, a la dirección y con el asunto que indica AGENTS.md, con el texto del correo aprobado por Gabriel.

## Avisos técnicos

En Windows usa `py -3 -I` y `PYTHONIOENCODING=utf-8`. Windows PowerShell 5.1 lee mal los acentos de un .ps1 sin BOM. Si en `paper/ijcopi/` hay un archivo `~$...`, Word tiene el .docx abierto. Hay más en la sección "Avisos técnicos" de AGENTS.md.
