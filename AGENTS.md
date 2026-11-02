# Memoria compartida del proyecto

Este archivo es la memoria común para Claude, ChatGPT, Gemini y cualquier otro
agente que trabaje en este repositorio. Léelo completo antes de empezar.
Al terminar una sesión, actualiza "Estado actual" y "Siguiente paso", y agrega a
"Bitácora" una línea con la fecha, el agente y lo que cambió. Solo escribe aquí lo
que el repositorio no dice por sí mismo.

Conversa con Gabriel en español y sé breve: le importa no gastar créditos.
**Rama de trabajo: `ijcopi-obras`.** `main` queda congelada para ICOKG (regla 2). Actualiza
este archivo conforme avances, no solo al final: si se acaba el límite, otra sesión debe poder
seguir desde aquí.

Repositorio de trabajo: <https://github.com/gabrielhuav/PublicMunicipalWorks_DWH>

Los repositorios son públicos: no escribas aquí enlaces a correos, borradores ni datos personales.

## Reglas que no se negocian

1. **Los enlaces del capítulo de Springer son inmutables.** Los que apuntan a este trabajo son
   `https://gabrielhuav.github.io/PublicMunicipalWorks_DWH/`,
   `https://gabrielhuav.github.io/PublicMunicipalWorks_DWH/mapa/?modo=claro` (el capítulo imprime
   además `&idioma=en`) y `https://github.com/gabrielhuav/PublicMunicipalWorks_DWH`. No renombres
   el repositorio, no muevas páginas y no toques los tags `v1.*-icokg2026` ni sus releases.
2. **Todo va en la rama `ijcopi-obras`.** No fusiones a `main`: cada push a `main` que toque
   `docs/` republica el sitio. No empujes a `upstream` (`Urigc/Obras_publicas`).
3. **Lo público nuevo lleva enlaces nuevos,** en un repositorio nuevo con su propio Pages.
   Gabriel aprueba el nombre antes de crearlo.
4. **No toques la base congelada:** `paper/Paper_37_1.tex` y sus PDF,
   `paper/ijcopi/Paper37_IJCOPI_v0_fiel.docx` y su PDF. `Paper_37_1.tex` tampoco se copia encima.
5. **Antes de cada push** corre
   `powershell -ExecutionPolicy Bypass -File scripts/verificar_enlaces_springer.ps1`
   y comprueba que termine con `fallos: 0`. **Ningún push sin autorización de Gabriel.**
6. **No envíes correos ni solicitudes sin que Gabriel vea el texto y confirme.**
7. **Solo reporta cifras que hayas recalculado.** Cada número del artículo sale de un script del
   repositorio. Si algo no se pudo verificar, dilo. No cites fuentes que no hayas leído o que no
   alimenten datos.
8. **Autores:** antes de tocar el bloque de autores, pregunta a Gabriel.

## El trabajo

Capítulo de ICOKG 2026 (Springer ACSAR), **trabajo ID 37**: "A Dimensional Data Warehouse for
Geospatial Monitoring of Municipal Public Works, with an Evolution Path Toward a Lakehouse
Architecture". Autores en Springer: Uriel González Casiano, Marco Tulio Maldonado Mejía y Gabriel
Hurtado Avilés (autor de correspondencia). Se extiende para el número especial de IJCOPI; el
trabajo 38 va al mismo número y vive en `gabrielhuav/Data_Warehouse_static`, rama `ijcopi-zmvm`.
**No se reutiliza texto del trabajo 38:** se revisa con herramientas de similitud y de IA.

### Requisitos de IJCOPI

- Inglés, ortografía británica; en Microsoft Word y **con la plantilla obligatoria**
  `2027-IJCOPI_template_simple_British_English.docx`, o se rechaza en automático.
- Extender **al menos 40 %** la versión de ICOKG y **marcar los cambios en amarillo**. Las figuras
  nuevas llevan marco amarillo, porque una imagen no admite resaltado.
- **Máximo 15 páginas** en ese formato.
- Resumen de 70 a 150 palabras; 4 a 6 palabras clave; citas y referencias en APA 7.
- Declarar el uso de IA. Se revisa con herramientas de similitud y de IA.
- Contribución de $1,000.00 si se acepta; el correo no aclara la moneda.
- Enviar a icokg@correo.buap.mx con asunto `Special Issue IJCOPI – ID 37 ICOKG 2026`.

| Fecha (2026) | Hito |
| --- | --- |
| 9 nov | Envío de manuscritos |
| 20 nov | Notificación y solicitud de cambios |
| 27 nov | Nueva versión |
| 4 dic | Aceptación |
| 8 dic | Versión final |

### Metas de la extensión

- La base en Word mide 11 páginas y 6,844 palabras: hacen falta **al menos 9,582 palabras** en
  **máximo 15 páginas**.
- El resumen del capítulo pasa de 150 palabras y trae 8 palabras clave: hay que dejarlo en 70-150
  y 4-6.
- Todos los datos del capítulo son sintéticos y las imágenes de obras están generadas con IA, con
  la marca ILUSTRATIVO. Nada sintético puede presentarse como real.
- Conserva la separación entre cifras medidas y proyectadas, y no confundas las tres poblaciones:
  las 6 obras del sitio, las 1,247 del almacén y el conjunto de detección.
- `notas_release.md` está desactualizado (0.9945 y 0.8411 con una semilla). Manda el capítulo
  (0.46 y 0.35 con diez semillas), recalculado con `scripts/evaluacion/`.

## Dónde está cada cosa

| Ruta | Qué es |
| --- | --- |
| `paper/Paper_37_1.tex`, `.pdf` | **Capítulo de ICOKG, congelado** |
| `paper/ijcopi/Paper37_IJCOPI_v0_fiel.docx`, `.pdf` | **Base congelada en Word.** El script que la generó no está en el repositorio |
| `scripts/verificar_enlaces_springer.ps1` | Comprueba los enlaces del capítulo y los tags. Se corre antes de cada push |
| `scripts/evaluacion/` | Evaluación de detección: `generar_dataset_obras.py`, `eval_deteccion_v2.py` |
| `scripts/generate_synthetic_data.py` | Población del almacén; `--verificar` comprueba las cifras sin base de datos |
| `scripts/medir_rendimiento.py` | Latencias contra `docker/compose.yml` |
| `scripts/verificar_scd.py` | Clasificación SCD contra el esquema |
| `docs/` | **Sitio de GitHub Pages de ICOKG. No se toca** |

## Hechos establecidos (no volver a investigar)

### Reproducción del capítulo (1 nov, Docker 29.9.2, PostgreSQL 16.14)

- **Coinciden exacto:** la tabla de detección (`eval_deteccion_v2.py`, 15 valores), el recall por
  causa, 2,581 registros con 17.2 % anómalos, la precisión de .217 a .557 entre prevalencias,
  1,247 obras, $127.4 M, 55 comunidades, 14,885 informes, 29,928 filas mensuales, 8,934 eventos
  directos, 3,421 evidencias, 2,156 propuestas, 8,723 votos, 2,341 pobladores, 10 dimensiones
  (5/3/2), 2 hechos, 6 vistas, 12 disparadores (8+4), 17 tipos de evento, 9 blueprints y 56 rutas.
- **No coinciden:**
  - **Población:** el capítulo dice 64,844 habitantes. INEGI (ITER 2020, 15086) da **35,014** y 65
    localidades con código propio. La cifra no sale de ningún script y debe corregirse en amarillo.
  - **Eventos:** el capítulo dice "about 28,000". Una base limpia tiene **55,740**: cada voto queda
    dos veces, una del generador (`generate_synthetic_data.py:764`) y otra de `trg_evento_voto`.
  - **`/api/public/obras`:** 765,748 bytes, no 753 kB.
- **Latencias:** mismo orden, sin ser iguales. Obras 601.7/681.5 ms contra 566/610; resumen
  593.9/693.4 contra 544/589; 2.7 a 3.0 req/s contra 3.4; alta SCD 0.3 ms contra 0.1.
- **Lighthouse 12.8.2 (1 nov):** la portada repite 85/100/96/90 y FCP 3.1 s. El mapa da 76/100/89/100
  y FCP 3.5 s contra 72/100/93/100 y 3.6 s; el sitio cambió en octubre, así que no es comparable.
- **Las 3,421 evidencias son un contador** (`fact_obra_mensual.imagenes_evidencia`):
  `public.imagenes_informe` tiene 0 filas.

### Fuentes de datos reales (verificadas el 1 nov)

- **SHCP, gasto federalizado: sirve.** URL:
  `https://www.transparenciapresupuestaria.gob.mx/work/models/PTP/DatosAbiertos/Entidades_Federativas/<año>/ef<año>.zip`.
  Existen 2020 a 2025; 2013-2019 y 2026 dan 404 con ese nombre (2026 va por trimestre,
  `ef2026_2T.zip`). `ef2025.zip`: 23,653,848 bytes, SHA-256 `8ea8f91a...`, 91,062 proyectos.
- **Temascaltepec es entidad 15, municipio 86.** En 2020-2025 hay 718 filas folio-ejercicio y 602
  folios: $492.9 M aprobados y $435.1 M pagados en su último estado, 577 terminados, 18 cancelados y
  7 en ejecución. Por año: 250, 89, 85, 86, 149 y 59. Son cifras preliminares de exploración.
- **Estado de México:** 185,070 filas, 80,022 folios, 126 valores de municipio (incluye el 0,
  "Gobierno de la Entidad"), 118 MB en CSV.
- **FAIS va dentro de SHCP:** Ramo 33, I004. Son las 59 obras de 2025 y 142 de 149 en 2024. No hay
  conjunto aparte de FAIS o MIDS en `datos.gob.mx`.
- **Compras MX y CompraNet: no sirven aquí.** `Contratos_CompraNet_2023.csv` (185.8 MB) tiene 183,389
  líneas y solo 1 menciona Temascaltepec, de un organismo estatal. SHCP marca 0 de 263 contratos del
  municipio de 2023 a 2025 como CompraNet. Solo se revisó el archivo de 2023.
- **CNGMD 2023 sirve como contraste.** `.../cngmd/2023/datosabiertos/m2/contrata_publica_cngmd2023_csv.zip`,
  tabla `m2s8p8`, `timateri_e=2` es obra pública. Temascaltepec declara **0** contratos en 2022; SHCP
  lista ese año **16 contratos "Obra" convocados por el municipio, $19.36 M**, y 76 de administración
  directa. Es una inconsistencia entre fuentes oficiales, no una prueba de irregularidad.
- **Censo ITER:** `.../ccpv/2020/datosabiertos/iter/iter_15_cpv2020_csv.zip`.
- **Rezago social (CONEVAL):** CC BY 4.0 en `datos.gob.mx`, paquete `rezago_social`, por municipio y
  localidad. Solo se leyó el metadato; falta bajarlo.
- **Pendiente:** confirmar los términos de uso de los datos de SHCP.

### Hallazgos exploratorios sobre los datos reales

- De 93 folios presentes en más de un ejercicio, **61 cambian de estatus y solo 2 de monto**.
- La regla C3 (físico < 30 y financiero > 80) se cumple en 2 de 389 pares con ambos datos.
- Unos pocos puntos caen fuera del recuadro de Temascaltepec (1 de 59 en 2025, 4 de 149 en 2024).
  Falta medirlo contra el polígono municipal.

### Repositorios de alumnos

- **`Actronix09/fuentes-alternas`, carpeta `obra-publica-srft/`: útil.** ZIP y 5 extractos coinciden
  con su manifiesto y con la descarga oficial. Solo cubre 2025 (59 obras) y no usa `observaciones.csv`.
- **`Xavxd/PublicMunicipalWorks_DWH`: solo como referencia.** `etl_ef2023.py` mapea columnas de 2023,
  pero escribe en tablas operativas con personal "de sistema" y una ruta fija. No se ejecutó.
- **`giovaniscoo/PublicMunicipalWorks_DWH`: no se usa.** `seleccionar_96_obras.py` fabrica registros:
  toma programas presupuestarios como obras, reparte 3 por estado y pone $1,500,000 y las coordenadas
  de la CDMX a todos. `obras_reales.csv` son 14 filas sin montos ni coordenadas, fuera de Temascaltepec.
- Los alumnos son fuente de ideas, no de datos: todo se recalcula desde la fuente oficial.

## Avisos técnicos

- **Nunca uses `git push --tags`.** Hay 10 tags `v1.*-icokg2026` locales, pero en `origin` solo
  `v1.2.0` (`515a1c6`) y `v1.7.3` (`8feb73c`), los dos con release.
- El nombre de columnas de SHCP cambia por año. En 2020: `ID_MUNICIPIO_RESPONSABLE`, `MONTO_*`, `ESTATUS`,
  `metas.csv` y `avances_fisicos.csv`. Hasta 2023 un folio aparece en los periodos 4 y 5: toma el último.
- Los CSV de SHCP van en cp1252 con bytes sueltos (`0x90`): lee con `encoding_errors='replace'`.
- `WebFetch` falla con el certificado de SHCP; `curl` funciona.
- El servidor de Compras MX responde 403 a `HEAD`, pero entrega el archivo con `GET`.
- En INEGI, un nombre de archivo equivocado devuelve 200 con HTML. La lista real sale de
  `/app/api/descarga/componente/descargamasiva/lista/archivoscompaginacion` con `idBiinegi=3298`.
- `medir_rendimiento.py` apunta al proyecto `obras-publicas`: con otro `-p` de Compose fallan las
  mediciones SQL. El volumen `obras-publicas_datos` ya está poblado; no vuelvas a sembrarlo encima.
- En esta PC, Python necesita `PYTHONIOENCODING=utf-8` para `eval_deteccion_v2.py`.
- Esta PC tiene `core.autocrlf=true`, y `.gitattributes` de la raíz fuerza `* text=auto eol=lf`.
  Los datos crudos necesitan su propio `.gitattributes` con `binary`; sin eso, el hash del
  manifiesto falla en un clon.
- `datos_sinteticos/` está ignorado: el conjunto de detección se regenera.
- Clona en una ruta corta: con rutas largas, como el scratchpad de una sesión, `git clone` y las DLL
  de `shapely` pueden fallar en Windows.
- Si `paper/ijcopi/` tiene un archivo `~$...`, Word tiene ese `.docx` abierto: no lo sobrescribas.

## Estado actual

- **Hecho (1 nov):** rama `ijcopi-obras`, esta memoria, `scripts/verificar_enlaces_springer.ps1` (21
  enlaces y 2 tags), reproducción de las cifras, verificación de fuentes y revisión de los
  repositorios de alumnos. Nada subido a `origin`.
- **Descargas de trabajo:** los ZIP de SHCP y los extractos están en el scratchpad de la sesión, no
  en el repositorio. Otra sesión debe volver a bajarlos.
- **Sin recalcular:** las 11 páginas y 6,844 palabras de la base en Word. Se miden con
  `word_a_pdf.ps1` antes de escribir.
- **Riesgo de páginas:** faltan 2,738 palabras en 4 páginas, 684 por página contra 622 de la base.
  Cabe, como mucho, una figura nueva.

### Pendientes para Gabriel

- Aprobar el plan, el nombre del repositorio nuevo y el título.
- Confirmar el bloque de autores y si los alumnos van en agradecimientos o como autores.

## Siguiente paso

1. [x] Reproducir las cifras principales y reportar cuáles no coinciden.
2. [ ] Plan ordenado por valor y esfuerzo. **Entregado el 1 nov; espera la aprobación de Gabriel.**
3. [ ] ETL completo y reproducible, con manifiesto, hashes y prueba desde un clon limpio.
4. [ ] Consultas SQL y comandos para verlas en la base de datos.
5. [ ] Páginas nuevas en el repositorio nuevo, verificadas contra la base.
6. [ ] Extensión en `paper/ijcopi/`, con la plantilla, amarillo y revisión del PDF a ojo.

## Bitácora

- 2026-11-01, Claude (Claude Code, Opus 5.5): creó la rama `ijcopi-obras`, esta memoria y el
  verificador de enlaces. Reprodujo las cifras del capítulo: encontró el error de población y el
  conteo de eventos. Verificó fuentes reales y revisó los repositorios de alumnos. No hizo push.
