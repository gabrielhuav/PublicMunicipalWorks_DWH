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
| `lakehouse/proyecciones/oc4ids.py` | Proyección a OC4IDS 0.9.5 validada con el esquema oficial, copiado en `esquema/` |
| `lakehouse/grafo/` | Grafo RDF: mapeo R2RML, vocabulario, consultas `.rq` con gemelo `.sql` y entorno propio |
| `scripts/evaluacion/eval_criterio_costo.py` | Entrega 3: criterio de costo por tipo y brecha de pago |
| `lakehouse/capas/` | Una consulta por capa del sitio: `.pg.sql` en PostgreSQL, `.duck.sql` en el lago |
| `lakehouse/sitio/` | **Sitio público nuevo** (mapa y consultas). Sus datos los escribe `etl/exportar_capas.py` |
| `lakehouse/publicar/` | `publicar.ps1` arma la copia pública; `README.md` y `pages.yml` van a su raíz |
| `paper/ijcopi/extender_v1.py` | **Arma la v1 extendida** desde la base; los textos nuevos viven aquí |
| `paper/ijcopi/cifras_extension.py` | Cada cifra de la v1 con su archivo de evidencia, y las comprobaciones del texto |
| `paper/ijcopi/word_a_pdf.ps1`, `verificar_amarillo.py`, `capturar_mapa.ps1` | Páginas y palabras en Word, amarillo completo y figura |
| `scripts/cifras_capitulo.py` | Mide las tres cifras del capítulo que la v1 corrige |

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
  en `plata.proyectos`. Plata suma 11.0 millones de filas en 10 tablas. Bronce 2,136 MB; plata 291.5 MB (contra 2,803 MB
  de CSV); oro 139.5 MB; las tablas nuevas de PostgreSQL 753 MB, medidos en el clon limpio. Plata se construye en unos 200 s.
- **Las 7 consultas dan el mismo SHA-256 en PostgreSQL y en el lago.** El lago gana en barridos
  (553 contra 21 ms, 285 contra 12 ms) y PostgreSQL en búsquedas con índice (2.4 contra 33 ms).
  Media de 20 repeticiones; las cifras vigentes son las de `evidencia_lago.json`, que cambian un poco
  en cada corrida. PostgreSQL corre con la configuración por omisión de la pila de referencia.
- **Almacén, conteo exacto:** `dim_municipio` 2,469, `dim_proyecto_federal` 1,157,395 y
  `fact_proyecto_ciclo` 1,537,019. Antes la evidencia traía `reltuples`, una estimación.
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
- **Modalidad, contratos de obra 2023-2025:** adjudicación directa 49.8 % de los contratos y 23.7 %
  del monto (antes decía 49.9 %; lo recalcula `paper/ijcopi/cifras_extension.py`).

### Sitio público (paso 5, 2 nov)

- **Repositorio aprobado por Gabriel el 2 nov:** `gabrielhuav/PublicMunicipalWorks_Lakehouse`, con
  Pages por Actions desde `lakehouse/sitio/`. URL: `https://gabrielhuav.github.io/PublicMunicipalWorks_Lakehouse/`.
- **Publicado el 2 nov con su autorización:** commit `53b9c9d` en `main`. Los 16 archivos del sitio
  dan en vivo el mismo SHA-256 que en local, y la página de consultas muestra las 7 comparaciones.
  Cuando el artículo imprima estas URL, quedan tan inmutables como las del capítulo.
- **Segunda subida, 2 nov, autorizada:** commit `8f259e0` con `scripts/cifras_capitulo.py`, su
  evidencia y la vista de figura. Los 17 archivos del sitio dan en vivo el mismo SHA-256 que en local.
- **Para actualizarlo:** commit en la rama, `lakehouse/publicar/publicar.ps1`, revisar la copia en
  `Documents/GitHub Desktop/PublicMunicipalWorks_Lakehouse` (remoto `origin`), commit ahí y push
  solo con autorización.
- **Capas:** 5 consultas, de 6 a 21,335 filas; `verificar_capas.py` las da iguales byte por byte, y
  falla si se altera un archivo (probado). La capa de obras del Estado de México 2024 pesa 5 MB.
- **2 municipios sin cabecera en ITER** (Francisco León, Chiapas, y Villa de Arista, San Luis Potosí):
  no se dibujan.
- **2025 es el informe definitivo de SHCP, pero trae 91,062 proyectos contra 253,494 de 2024.** No
  se sabe por qué; el mapa lo advierte.
- **Temascaltepec en INEGI:** 35,014 habitantes. CNGMD declara 0 contratos de obra en 2022 y SHCP 16.
- El sitio no copia la demostración sintética del capítulo: enlaza a ella.

### Extensión en Word (paso 6, empezó el 2 nov)

- **Base medida el 2 nov con `paper/ijcopi/word_a_pdf.ps1`:** 11 páginas y 6,844 palabras. Meta:
  al menos 9,582 palabras en 15 páginas como máximo.
- **Método:** `paper/ijcopi/extender_v1.py` copia la base a `Paper37_IJCOPI_v1_extendida.docx` y le
  inserta lo nuevo en amarillo con python-docx; la base no se toca. Las cifras salen de
  `paper/ijcopi/cifras_extension.py`, que solo lee evidencias del repositorio.
- **Estructura nueva:** RQ4; 7.5 criterio de costo por tipo (filas nuevas en la tabla 2); 7.7
  correcciones; 8 capa lakehouse sobre registros oficiales; 9 evaluación medida (tabla 3, siete
  consultas); 10 conclusiones (antes 8). Título propuesto y autores sin tocar hasta que Gabriel decida.
- **Hecho el 2 nov: `paper/ijcopi/Paper37_IJCOPI_v1_extendida.docx` y su PDF.** 15 páginas, 9,795
  palabras (meta 9,582), resumen de 140, seis palabras clave y 0 palabras agregadas sin amarillo
  según `verificar_amarillo.py` (ajustado para separar párrafos). La última página queda a la mitad.
  Revisado a ojo en el PDF.
- **Figura 4** (`figura_mapa_lago.png`, marco amarillo) se capturó con `capturar_mapa.ps1`, con la
  vista de figura de `sitio.css` (leyenda encima, sin botones), ya publicada.
- **Autores (2 nov):** Gabriel dijo que estaban mal. Quedaron como en el trabajo 38: Gabriel Hurtado
  Avilés, Roberto Eswart Zagal Flores, Uriel González Casiano y Marco Tulio Maldonado Mejía, todos con
  afiliación 1, y los correos reordenados igual que en el 38. Lo movido o nuevo va en amarillo.
- **Correcciones medidas con `scripts/cifras_capitulo.py`:** 35,014 habitantes (no 64,844),
  55,740 eventos de auditoría (no "about 28,000"; 8,723 votos dejan 17,993 eventos de voto) y
  765,748 bytes en `/api/public/obras` (no 753 kB).
- El puerto 55432 puede estar tomado como puerto efímero por otro programa: usa un override de
  Compose con `ports: !override` y otro puerto, y pasa `LAGO_PG` con ese puerto.

### Interoperabilidad (entrega 5, 2 nov, Estado de México)

- **OC4IDS:** 78,826 proyectos validados contra el esquema 0.9.5, con 0 errores. SHCP llena 15 de los
  37 campos de primer nivel. El id es el folio porque no hay prefijo registrado.
- **Grafo:** 2,821,739 tripletas en 69 s y 29.9 MB comprimido. Las 5 consultas SPARQL dan el mismo
  SHA-256 que su gemelo SQL. El contraste atrapó dos errores del mapeo: sumas con datos faltantes
  y `v1.0` en los enlaces entre versiones, porque pandas volvía flotante un entero con nulos.
- El prefijo `w3id.org/obras-mx/` no está registrado: los IRI identifican, pero no resuelven.

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
- morph-kgc convierte en flotante una columna entera con nulos: en una plantilla IRI, castea a texto.
- `LIKE '15%'` rompe morph-kgc por el `%`: usa `left(cvemun, 2) = '15'`.
- morph-kgc 2.10 obliga a pyoxigraph 0.3, cuya API difiere de la 0.5.
- `curl` de Git Bash da error 43 en `standard.open-contracting.org`; usa `C:/Windows/System32/curl.exe`.
- La noche del 2 nov SHCP entregaba 150 KB/s; el día anterior, los 2.1 GB en minutos.
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
- La evidencia JSON se escribe con LF y `lakehouse/.gitattributes` la marca `-text`: el sitio copia
  `evidencia_lago.json` byte por byte. Con `write_text` sin `newline="\n"`, Windows escribe CRLF.
- En Python 3.10, `platform.release()` dice "10" en Windows 11: usa `platform.version()`.
- CARTO sigue sin pasar la prueba de dos teselas; el sitio cae en Esri Canvas.
- Windows PowerShell 5.1 lee como ANSI un `.ps1` sin BOM: no pongas acentos en los scripts.
- El DOI de Cambridge `10.1017/S0007123417000461` a veces tarda más de 30 s y el verificador de
  enlaces da `fallos: 1`. El DOI resuelve; espera y vuelve a correrlo, sin tocar el script.
- Actions avisa que Node 20 está obsoleto en `checkout@v4`, `configure-pages@v5`,
  `upload-pages-artifact@v3` y `deploy-pages@v4`; el 2 nov corrían forzadas en Node 24 y publicaban bien.
- La plantilla de IJCOPI no está en este repositorio: está en
  `Data_Warehouse_static/paper/ijcopi/2027-IJCOPI_template_simple_British_English.docx`.

## Estado actual

- **Hecho (1 nov):** rama `ijcopi-obras`, esta memoria, `scripts/verificar_enlaces_springer.ps1` (21
  enlaces y 2 tags), reproducción de las cifras, verificación de fuentes y revisión de los
  repositorios de alumnos. Nada subido a `origin`.
- **Descargas de trabajo:** los ZIP de SHCP y los extractos están en el scratchpad de la sesión, no
  en el repositorio. Otra sesión debe volver a bajarlos.
- **Hecho (2 nov):** las cinco entregas del plan: lago, auditoría, criterio de costo, OC4IDS y grafo.
- **Recalculado el 2 nov con `word_a_pdf.ps1`:** la base tiene 11 páginas y 6,844 palabras.
- **Hecho (2 nov):** la v1 extendida, con 15 páginas y 9,795 palabras. Quedan media página y unas 200
  palabras de margen: un cambio grande en autores o título cabe, una figura más no.

- **Hecho (2 nov):** el sitio del lago, verificado contra las bases y publicado en
  `gabrielhuav/PublicMunicipalWorks_Lakehouse`. La rama `ijcopi-obras` sigue sin subirse a `origin`.

### Pendientes para Gabriel

- Aprobar el título. El 2 nov dijo "el nombre te lo confirmo" al autorizar la subida; se tomó como el
  nombre del repositorio, no como el título. La v1 ya trae el título propuesto, en amarillo.
- Decidir si los alumnos de los repositorios de referencia van en agradecimientos.
- Revisar la v1 completa, sobre todo la declaración de IA, que dice que los autores revisaron y
  aprobaron el texto nuevo.

## Siguiente paso

1. [x] Reproducir las cifras principales y reportar cuáles no coinciden.
2. [x] Plan ordenado por valor y esfuerzo. Aprobado el 2 nov.
3. [x] ETL completo y reproducible. Probado desde un clon limpio (`verificacion/evidencia_clon_limpio.txt`), con los
   archivos oficiales tomados de la caché porque SHCP estaba lento; se comprobó su SHA-256.
4. [x] Consultas SQL y comandos para verlas en la base de datos (`lakehouse/consultas/`).
5. [x] Páginas nuevas en el repositorio nuevo, verificadas contra la base y en vivo.
6. [ ] Extensión en `paper/ijcopi/`, con la plantilla, amarillo y revisión del PDF a ojo. Primera
   versión completa armada y medida; falta la revisión de Gabriel, el título y los autores.

## Bitácora

- 2026-11-01, Claude (Claude Code, Opus 5.5): creó la rama `ijcopi-obras`, esta memoria y el
  verificador de enlaces. Reprodujo las cifras del capítulo: encontró el error de población y el
  conteo de eventos. Verificó fuentes reales y revisó los repositorios de alumnos. No hizo push.
- 2026-11-02, Claude (Claude Code, Opus 5.5): con el plan aprobado, implementó `lakehouse/` con datos
  nacionales: SeaweedFS, Iceberg, DuckDB y carga aditiva a PostgreSQL. Evaluó el criterio de costo,
  proyectó a OC4IDS y materializó el grafo RDF. Sin push.
- 2026-11-02, Claude (Claude Code, Opus 5.5): Gabriel aprobó el nombre `PublicMunicipalWorks_Lakehouse`.
  Hizo el sitio (5 capas verificadas byte por byte) y la copia pública local. Corrigió la evidencia
  del lago: conteos exactos, oro al día, sistema operativo y saltos de línea. Sin push.
- 2026-11-02, Claude (Claude Code, Opus 5.5): con autorización de Gabriel, corrió el verificador de
  enlaces (`fallos: 0`), creó `gabrielhuav/PublicMunicipalWorks_Lakehouse`, subió `main`, activó Pages
  y comprobó en vivo los 16 archivos del sitio. No subió la rama `ijcopi-obras`.
- 2026-11-02, Claude (Claude Code, Opus 5.5): midió la base en Word (11 páginas, 6,844 palabras) y armó
  la v1 extendida con `extender_v1.py`: 15 páginas, 9,790 palabras, todo lo nuevo en amarillo. Midió
  las tres correcciones del capítulo con `scripts/cifras_capitulo.py`. Sin push.
- 2026-11-02, Claude (Claude Code, Opus 5.5): con autorización de Gabriel subió al repositorio público
  el script de las correcciones y la vista de figura (`8f259e0`). Corrigió los autores de la v1 como
  en el trabajo 38: 15 páginas, 9,795 palabras, 0 sin amarillo. La rama sigue sin subirse.
