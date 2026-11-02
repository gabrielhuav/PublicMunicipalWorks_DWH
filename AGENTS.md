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
| `lakehouse/` | **Lago de datos** (bronce, plata, oro) e integración aditiva. Su `README.md` explica cómo reproducirlo |
| `lakehouse/fuentes.json` | Manifiesto: 9 fuentes con bytes y SHA-256 |
| `lakehouse/etl/ejecutar.py` | Reconstruye todo y verifica |
| `lakehouse/oro/` | Una consulta por tabla oro |
| `lakehouse/consultas/` | 7 pares de consultas (PostgreSQL y DuckDB) y una solo de lago; su `README.md` trae los comandos |
| `lakehouse/verificacion/` | `verificar_lago.py`, `resumen_auditoria.py` y sus evidencias. De ahí salen las cifras del artículo |
| `scripts/evaluacion/eval_criterio_costo.py` | Entrega 3: criterio de costo por tipo y brecha de pago |

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
- **Términos de SHCP (leídos el 2 nov):** permiten redistribuir y crear derivados citando conjunto,
  dependencia, liga y fecha, y sin variar el sentido original de la información.

### Hallazgos exploratorios sobre los datos reales

- De 93 folios presentes en más de un ejercicio, **61 cambian de estatus y solo 2 de monto**.
- La regla C3 (físico < 30 y financiero > 80) se cumple en 2 de 389 pares con ambos datos.
- Unos pocos puntos caen fuera del recuadro de Temascaltepec (1 de 59 en 2025, 4 de 149 en 2024).
  Falta medirlo contra el polígono municipal.

### Lago de datos (2 nov, reconstruido con `lakehouse/etl/`)

- **Gabriel decidió el 2 nov que el lago se puebla con todo el país:** no importa que los datos no
  sean de Temascaltepec. El plan de cinco entregas está aprobado.
- **Tamaño:** 6 ciclos, 32 entidades, 967,495 folios, 1,537,019 filas folio-ciclo y 2,008,738 filas
  en `plata.proyectos`. Bronce 2,136 MB; plata 298 MB (contra 2,803 MB de CSV); oro 139 MB; las tablas
  nuevas de PostgreSQL 752 MB. Plata se construye en unos 200 s.
- **Las 7 consultas dan el mismo SHA-256 en PostgreSQL y en el lago.** El lago gana en barridos
  (566 contra 25 ms, 291 contra 14 ms) y PostgreSQL en búsquedas con índice (1.5 contra 30 ms).
  PostgreSQL corre con la configuración por omisión de la pila de referencia.
- **Poda:** el filtro por ciclo y entidad planea 1 de 192 archivos. **Viaje en el tiempo:** 6
  instantáneas, cada una con sus filas acumuladas. **Evolución:** agregar una columna no reescribe datos.
- **Aditivo:** las 34 tablas originales quedan idénticas por md5 (`evidencia_aditiva.json`).
- **Error de captura en SHCP:** 3 filas de Sonora traen como pagado los dígitos del folio, $600.9 mil
  millones. El periodo 5 corrige una; 2 llegan a oro ($390.8 mil millones) y se anulan en `pagado`.
- **En 2020, periodo 5,** 119,009 puntos traen nombres donde van claves: quedan fuera de la distancia.
- **Calidad de coordenadas:** mediana de 0.4 km a la localidad del Censo. Más de 25 km: 2.6 a 3.7 % en
  2020-2022 y 0.2 a 0.4 % desde 2023.
- **CNGMD contra SHCP en 2022, 2,469 municipios:** 947 declaran menos contratos de obra que los que
  registra SHCP (94 declaran cero, entre ellos Temascaltepec). Los universos difieren y SHCP puede
  incluir contratos firmados antes de 2022: es una inconsistencia que revisar, no una prueba.
- **Versiones:** de 356,914 folios en más de un ciclo, 137,644 cambian de estatus (38.6 %), 60,696 de
  monto (17.0 %) y ninguno de clasificación.
- **Reglas sobre 1,465,856 proyectos:** C1 del capítulo 2,010; C1 por tipo 57,797, y solo 491 cumplen
  ambas, lo que confirma con datos reales que C1 señala obras grandes, no caras.
- **Rezago:** la mediana de pago por habitante sube de $840 (muy bajo) a $4,268 (muy alto) en 2023;
  Spearman de .39 a .57 entre ciclos.
- **Modalidad, contratos de obra 2023-2025:** adjudicación directa 49.9 % de los contratos y 23.7 %
  del monto.

### Criterio de costo (entrega 3, 2 nov)

- A 15 % de prevalencia, R0 repite el capítulo (.462 y .351). R2 (C1 por tipo con z > 3 más brecha de
  pago) da .511 de precisión, .411 de recall, ROC-AUC .677 y PR-AUC .457; Isolation Forest da .650 y
  .342. El recall de sobreprecio sube de .093 a .192 y el de pago adelantado de .061 a .167.
- Los umbrales se fijaron antes de ver resultados y se reportan todos.

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
- **MinIO ya no se puede bajar de Docker Hub ni de quay.io (2 nov):** por eso el lago usa SeaweedFS.
  Tarda unos segundos en aceptar conexiones después de arrancar.
- `VACUUM` paralelo falla en el contenedor por sus 64 MB de `/dev/shm`: `almacen.py` lo hace en serie.
- PyIceberg 0.9 rechaza decimales de precisión 18 o menor: `plata.py` usa `decimal(20,2)`.
- Bash rechazó dos veces bloques largos con heredocs y comillas: usa el Write para scripts largos.
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
- **Hecho (2 nov):** lago completo (entregas 1, 2 y 4) y criterio de costo (entrega 3). Falta la
  entrega 5 (OC4IDS y RDF).
- **Sin recalcular:** las 11 páginas y 6,844 palabras de la base en Word. Se miden con
  `word_a_pdf.ps1` antes de escribir.
- **Riesgo de páginas:** faltan 2,738 palabras en 4 páginas, 684 por página contra 622 de la base.
  Cabe, como mucho, una figura nueva.

### Pendientes para Gabriel

- Aprobar el nombre del repositorio nuevo y el título.
- Confirmar el bloque de autores y si los alumnos van en agradecimientos o como autores.

## Siguiente paso

1. [x] Reproducir las cifras principales y reportar cuáles no coinciden.
2. [x] Plan ordenado por valor y esfuerzo. Aprobado el 2 nov.
3. [ ] ETL completo y reproducible, con manifiesto y hashes. Falta anotar la prueba desde un clon limpio.
4. [x] Consultas SQL y comandos para verlas en la base de datos (`lakehouse/consultas/`).
5. [ ] Páginas nuevas en el repositorio nuevo, verificadas contra la base.
6. [ ] Extensión en `paper/ijcopi/`, con la plantilla, amarillo y revisión del PDF a ojo.

## Bitácora

- 2026-11-01, Claude (Claude Code, Opus 5.5): creó la rama `ijcopi-obras`, esta memoria y el
  verificador de enlaces. Reprodujo las cifras del capítulo: encontró el error de población y el
  conteo de eventos. Verificó fuentes reales y revisó los repositorios de alumnos. No hizo push.
- 2026-11-02, Claude (Claude Code, Opus 5.5): con el plan aprobado, implementó `lakehouse/` con datos
  nacionales: SeaweedFS, Iceberg, DuckDB y carga aditiva a PostgreSQL. Evaluó el criterio de costo. Sin push.
