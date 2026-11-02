/* Mapa del lago de datos de obra pública federalizada.

   Todo lo que dibuja viene de datos/, que lakehouse/etl/exportar_capas.py genera con las consultas
   de lakehouse/capas/. Aquí no hay cifras escritas a mano: solo se decide cómo pintarlas. Los datos
   se bajan por partes: los municipios al abrir, los puntos de un estado al elegirlo y el detalle de
   un municipio al abrir uno de sus proyectos. La URL admite ?ind=, ?ciclo=, ?estado=, ?estatus=,
   ?evidencia=, ?marcas=1, ?folio=, ?comparar=1, ?c=lat,lng,zoom, ?lang=, ?teselas= y ?vista=figura. */
(function () {
  'use strict';

  const S = window.Sitio;
  const q = new URLSearchParams(location.search);

  const TXT = {
    es: {
      titulo: 'Obra pública federalizada en México, 2020-2025',
      lema: 'Registros oficiales de SHCP, INEGI y CONEVAL en un lago de datos. Cada capa es el resultado de una consulta a la base de datos.',
      'mapa.region': 'Mapa', 'panel.abrir': 'Capas y filtros', 'panel.cerrar': 'Cerrar el panel',
      'b.placeholder': 'Busca un lugar, municipio, proyecto o folio', 'b.lugares': 'Lugares',
      'b.estados': 'Estados', 'b.municipios': 'Municipios', 'b.proyectos': 'Proyectos del estado cargado',
      'b.nada': 'Sin resultados.', 'b.buscando': 'Buscando lugares…', 'b.sinred': 'No se pudo consultar el buscador de lugares.',
      'b.fuente': 'Los lugares se buscan en OpenStreetMap (Photon).',
      's.municipios': 'Municipios', 's.proyectos': 'Proyectos de 2024',
      'c.indicador': 'Indicador', 'c.ciclo': 'Ciclo', 'c.estado': 'Estado',
      'c.estado.elige': 'Elige un estado…',
      'c.estado.nota': 'Elige un estado, busca un lugar o acércate en el mapa: los proyectos se cargan por estado.',
      'c.temascaltepec': 'Ejemplo: Temascaltepec, el municipio del capítulo',
      'f.estatus': 'Estatus', 'f.evidencia': 'Evidencia verificable', 'f.revision': 'Revisión',
      'f.marcas': 'Con alguna marca C1 a C4', 'f.conteo': 'Se ven {n} de {total} proyectos de {estado}.',
      'f.ver': 'Acercar el mapa a estos proyectos',
      'e.0': 'Terminado', 'e.1': 'En ejecución', 'e.2': 'Cancelado', 'e.3': 'Otro estatus',
      'ev.1': 'Con documentos', 'ev.2': 'Con PDF', 'ev.4': 'Con imagen', 'ev.8': 'Con antes y después',
      cargandoEstado: 'Cargando los proyectos de {estado}…',
      'n.entidades': 'Entidades', 'n.municipios': 'Municipios con proyectos', 'n.proyectos': 'Proyectos',
      'n.aprobado': 'Aprobado', 'n.pagado': 'Pagado', 'n.evaluados': 'Proyectos de inversión', 'n.ciclo': 'Ciclo {c}',
      'nota.cortes': 'Los colores dividen en cinco grupos iguales a los municipios con valor mayor que cero en el ciclo elegido.',
      'nota.revisar': 'Marca un proyecto para revisarlo; no prueba una irregularidad. Se aplica solo a proyectos de inversión.',
      'nota.2025': '2025 tiene {n} proyectos y 2024 tiene {m}. No se ha verificado por qué la fuente trae menos; compara ese ciclo con cautela.',
      'nota.fijo': 'Este indicador tiene un solo año; el ciclo no lo cambia.',
      'ley.cero': '0', 'ley.hasta': 'hasta {b}', 'ley.entre': '{a} a {b}', 'ley.mas': 'más de {a}',
      'ley.tam': 'El tamaño del círculo crece con la población.', 'ley.obras': 'Proyectos de {estado}, 2024',
      'o.titulo': 'De dónde sale cada capa', 'o.texto': '{sql}, en {motor}: {filas} filas, exportadas el {fecha}. SHA-256 {hash}…',
      'o.parte': 'Se ve el archivo {archivo}, uno de {n}.', 'o.sql': 'Ver la consulta', 'o.cmd': 'Para ver lo mismo en la base de datos:',
      'o.verif': 'lakehouse/verificacion/verificar_capas.py repite cada consulta y compara el resultado con estos archivos, byte por byte.',
      'motor.pg': 'PostgreSQL (almacén)', 'motor.duck': 'DuckDB sobre el lago',
      'd.cerrar': 'Cerrar la ficha', 'd.entidad': 'Entidad', 'd.pob': 'Población 2020', 'd.grado': 'Rezago social 2020',
      'd.ciclo': 'Ciclo {c}', 'd.proyectos': 'Proyectos', 'd.aprobado': 'Aprobado', 'd.pagado': 'Pagado',
      'd.pagado_hab': 'Pagado por habitante', 'd.fais': 'Del FAIS', 'd.evaluados': 'De inversión',
      'd.c1': 'C1 costo atípico', 'd.c2': 'C2 retraso', 'd.c3': 'C3 avance bajo, pago alto', 'd.c4': 'C4 pago sobre avance',
      'd.cngmd': 'Contratos de obra 2022', 'd.cngmd.n': 'CNGMD {a}, SHCP {b}', 'd.sinciclo': 'Sin proyectos en este ciclo.',
      'd.verestado': 'Ver los proyectos de 2024 de {estado}',
      'd.fisico': 'Avance físico',
      'd.financiero': 'Avance financiero', 'd.contratos': 'Contratos', 'd.inicio': 'Inicio', 'd.termino': 'Término',
      'd.marcas': 'Marcas de revisión', 'd.ninguna': 'Ninguna.', 'd.noaplica': 'No aplica: no es proyecto de inversión.',
      'd.evidencia': 'Evidencia', 'd.fuente': 'Fuente oficial', 'd.cargando': 'Cargando el detalle…',
      'fu.folio': 'Busca el folio {folio} en el archivo {archivo} de SHCP (SHA-256 {sha}…), tal como se descargó el {fecha}.',
      'fu.mun': 'Busca la clave {cvemun} en estos archivos oficiales:',
      'fu.pob': 'Población: INEGI, Censo 2020', 'fu.rezago': 'Rezago social: CONEVAL 2020',
      'fu.shcp': 'Proyectos y montos: SHCP', 'fu.cngmd': 'Contratos 2022: INEGI, CNGMD 2023',
      'fu.docs': 'Documentos que reportó la dependencia ({n})', 'fu.mas': 'y {n} más.',
      'fu.docs.nota': 'Enlaces tal como los publicó la dependencia en SHCP; nadie revisó lo que contienen y algunos ya no responden: para esos, Internet Archive puede tener una copia guardada. Se omiten los que llevan la cuenta de correo de quien los subió.',
      'fu.archivo': 'copia en Internet Archive',
      'fu.sindocs': 'La dependencia no publicó enlaces para este proyecto.', 'fu.imagen': 'Imagen publicada por la dependencia',
      'sat.boton': 'Ver el lugar antes y ahora: satélite y Street View',
      'sat.nota': 'Imagen de satélite del archivo histórico de Esri (World Imagery Wayback) y panoramas de Google Street View.',
      'sat.sin': 'Sin imagen de satélite de antes: el proyecto empezó antes de la primera versión del archivo de Esri o no trae fecha.',
      'cmp.cerrar': 'Cerrar', 'cmp.cargando': 'Cargando…',
      'cmp.error': 'No se pudo consultar el archivo de Esri. Cierra y vuelve a intentarlo.',
      'cmp.satelite': 'Satélite: Esri World Imagery Wayback', 'cmp.sv': 'A nivel de calle: Google Street View',
      'cmp.antes': 'Antes: versión publicada el {fecha}, previa al inicio del proyecto ({inicio}).',
      'cmp.antes.toma': 'Antes: toma del {toma} en el punto, en la versión del {version}, previa al inicio del proyecto ({inicio}).',
      'cmp.sinantes': 'Esri no tiene una versión publicada antes del inicio del proyecto ({inicio}).',
      'cmp.reciente': 'Ahora: versión más reciente, publicada el {fecha}.',
      'cmp.ahora.toma': 'Ahora: toma del {toma} en el punto, en la versión del {version}.',
      'cmp.igual': 'Ahora: la misma toma del {toma}; Esri no tiene una imagen más reciente de este punto.',
      'cmp.termino': 'Término reportado: {termino}.', 'cmp.previa': 'La toma es anterior al término reportado.',
      'cmp.nota': 'Cada fecha es la de la toma en el punto del proyecto, según los metadatos de Esri; si no se pudieron leer, va la de la versión. El círculo amarillo es el punto que reportó la dependencia. Las imágenes enseñan el lugar; no prueban la obra.',
      'sv.antes': 'Antes: panorama de {fecha}.', 'sv.despues': 'Después: panorama de {fecha}.',
      'sv.ejemplo': 'Panoramas que los autores eligieron en Google Maps para el ejemplo del artículo; Google fecha cada toma por mes.',
      'sv.cerca': 'El panorama más cercano al punto, si Google tiene uno.',
      'sv.nota': 'Sin clave, Google no deja listar las fechas anteriores de un lugar; se pueden recorrer al abrirlo en Google Maps.',
      'sv.abrir': 'Abrir en Google Maps',
    },
    en: {
      titulo: 'Federally funded public works in Mexico, 2020-2025',
      lema: 'Official records from SHCP, INEGI and CONEVAL in a data lake. Every layer is the result of a query to the database.',
      'mapa.region': 'Map', 'panel.abrir': 'Layers and filters', 'panel.cerrar': 'Close the panel',
      'b.placeholder': 'Search a place, municipality, project or folio', 'b.lugares': 'Places',
      'b.estados': 'States', 'b.municipios': 'Municipalities', 'b.proyectos': 'Projects of the loaded state',
      'b.nada': 'No results.', 'b.buscando': 'Searching places…', 'b.sinred': 'The place search could not be reached.',
      'b.fuente': 'Places are searched in OpenStreetMap (Photon).',
      's.municipios': 'Municipalities', 's.proyectos': 'Projects in 2024',
      'c.indicador': 'Indicator', 'c.ciclo': 'Fiscal year', 'c.estado': 'State',
      'c.estado.elige': 'Choose a state…',
      'c.estado.nota': 'Choose a state, search a place or zoom in on the map: projects load one state at a time.',
      'c.temascaltepec': "Example: Temascaltepec, the chapter's municipality",
      'f.estatus': 'Status', 'f.evidencia': 'Verifiable evidence', 'f.revision': 'Review',
      'f.marcas': 'With a C1 to C4 flag', 'f.conteo': 'Showing {n} of {total} projects in {estado}.',
      'f.ver': 'Zoom the map to these projects',
      'e.0': 'Completed', 'e.1': 'In progress', 'e.2': 'Cancelled', 'e.3': 'Other status',
      'ev.1': 'With documents', 'ev.2': 'With PDF', 'ev.4': 'With image', 'ev.8': 'With before and after',
      cargandoEstado: 'Loading the projects of {estado}…',
      'n.entidades': 'States', 'n.municipios': 'Municipalities with projects', 'n.proyectos': 'Projects',
      'n.aprobado': 'Approved', 'n.pagado': 'Paid', 'n.evaluados': 'Investment projects', 'n.ciclo': 'Fiscal year {c}',
      'nota.cortes': 'Colours split the municipalities with a value above zero in the chosen year into five equal groups.',
      'nota.revisar': 'It flags a project for review; it does not prove an irregularity. It applies to investment projects only.',
      'nota.2025': '2025 has {n} projects and 2024 has {m}. Why the source holds fewer has not been verified; compare that year with care.',
      'nota.fijo': 'This indicator covers a single year; the fiscal year selector does not change it.',
      'ley.cero': '0', 'ley.hasta': 'up to {b}', 'ley.entre': '{a} to {b}', 'ley.mas': 'over {a}',
      'ley.tam': 'Circle size grows with population.', 'ley.obras': 'Projects in {estado}, 2024',
      'o.titulo': 'Where each layer comes from', 'o.texto': '{sql}, on {motor}: {filas} rows, exported on {fecha}. SHA-256 {hash}…',
      'o.parte': 'The map shows file {archivo}, one of {n}.', 'o.sql': 'Show the query', 'o.cmd': 'To see the same result in the database:',
      'o.verif': 'lakehouse/verificacion/verificar_capas.py repeats every query and compares the result with these files, byte by byte.',
      'motor.pg': 'PostgreSQL (warehouse)', 'motor.duck': 'DuckDB over the lake',
      'd.cerrar': 'Close the details', 'd.entidad': 'State', 'd.pob': 'Population 2020', 'd.grado': 'Social deprivation 2020',
      'd.ciclo': 'Fiscal year {c}', 'd.proyectos': 'Projects', 'd.aprobado': 'Approved', 'd.pagado': 'Paid',
      'd.pagado_hab': 'Paid per inhabitant', 'd.fais': 'From FAIS', 'd.evaluados': 'Investment',
      'd.c1': 'C1 atypical cost', 'd.c2': 'C2 delay', 'd.c3': 'C3 low progress, high payment', 'd.c4': 'C4 payment above progress',
      'd.cngmd': 'Works contracts 2022', 'd.cngmd.n': 'CNGMD {a}, SHCP {b}', 'd.sinciclo': 'No projects in this year.',
      'd.verestado': 'See the 2024 projects of {estado}',
      'd.fisico': 'Physical progress',
      'd.financiero': 'Financial progress', 'd.contratos': 'Contracts', 'd.inicio': 'Start', 'd.termino': 'End',
      'd.marcas': 'Review flags', 'd.ninguna': 'None.', 'd.noaplica': 'Not applicable: not an investment project.',
      'd.evidencia': 'Evidence', 'd.fuente': 'Official source', 'd.cargando': 'Loading the details…',
      'fu.folio': "Look up folio {folio} in SHCP's file {archivo} (SHA-256 {sha}…), as downloaded on {fecha}.",
      'fu.mun': 'Look up code {cvemun} in these official files:',
      'fu.pob': 'Population: INEGI, 2020 Census', 'fu.rezago': 'Social deprivation: CONEVAL 2020',
      'fu.shcp': 'Projects and amounts: SHCP', 'fu.cngmd': 'Contracts 2022: INEGI, CNGMD 2023',
      'fu.docs': 'Documents reported by the agency ({n})', 'fu.mas': 'and {n} more.',
      'fu.docs.nota': "Links as the agency published them with SHCP; nobody has reviewed what they contain, and some no longer answer: for those, the Internet Archive may hold a saved copy. Links that carry the uploader's e-mail account are left out.",
      'fu.archivo': 'Internet Archive copy',
      'fu.sindocs': 'The agency published no links for this project.', 'fu.imagen': 'Image published by the agency',
      'sat.boton': 'See the place before and now: satellite and Street View',
      'sat.nota': "Satellite imagery from Esri's archive (World Imagery Wayback) and Google Street View panoramas.",
      'sat.sin': "No satellite image from before: the project started before Esri's first archived release, or has no start date.",
      'cmp.cerrar': 'Close', 'cmp.cargando': 'Loading…',
      'cmp.error': "Esri's archive could not be reached. Close and try again.",
      'cmp.satelite': 'Satellite: Esri World Imagery Wayback', 'cmp.sv': 'Street level: Google Street View',
      'cmp.antes': 'Before: release published on {fecha}, prior to the project start ({inicio}).',
      'cmp.antes.toma': 'Before: captured on {toma} at the point, in the release of {version}, prior to the project start ({inicio}).',
      'cmp.sinantes': 'Esri has no release published before the project start ({inicio}).',
      'cmp.reciente': 'Now: latest release, published on {fecha}.',
      'cmp.ahora.toma': 'Now: captured on {toma} at the point, in the release of {version}.',
      'cmp.igual': 'Now: the same capture of {toma}; Esri has no newer image of this point.',
      'cmp.termino': 'Reported end: {termino}.', 'cmp.previa': 'The capture predates the reported end.',
      'cmp.nota': "Each date is the capture date at the project point, from Esri's metadata; when it could not be read, the release date is shown. The yellow circle is the point the agency reported. The images show the place; they do not prove the work.",
      'sv.antes': 'Before: panorama of {fecha}.', 'sv.despues': 'After: panorama of {fecha}.',
      'sv.ejemplo': "Panoramas chosen by the authors in Google Maps for the article's example; Google dates each capture by month.",
      'sv.cerca': 'The panorama closest to the point, if Google has one.',
      'sv.nota': "Without a key, Google does not list a place's earlier dates; they can be browsed by opening it in Google Maps.",
      'sv.abrir': 'Open in Google Maps',
    },
  };
  const t = (k, v) => S.t(TXT, k, v);
  const en = S.idioma === 'en';

  const GRADOS = ['Muy bajo', 'Bajo', 'Medio', 'Alto', 'Muy alto'];
  const GRADOS_EN = { 'Muy bajo': 'Very low', Bajo: 'Low', Medio: 'Medium', Alto: 'High', 'Muy alto': 'Very high' };
  const RELACIONES = [
    ['CNGMD mayor o igual que SHCP', 'CNGMD equal to or above SHCP', '#4c78a8'],
    ['SHCP mayor que CNGMD', 'SHCP above CNGMD', '#f58518'],
    ['CNGMD con contratos, SHCP en cero', 'CNGMD with contracts, SHCP at zero', '#54a24b'],
    ['CNGMD en cero, SHCP con contratos', 'CNGMD at zero, SHCP with contracts', '#d62728'],
    ['ambas en cero', 'both at zero', '#b5a99f'],
  ];
  const ESTATUS = ['#2e7d32', '#1565c0', '#c62828', '#7a7a7a'];
  const EVIDENCIAS = [1, 2, 4, 8];
  const IMAGEN = /\.(jpe?g|png|gif|webp)(\?|$)/i;
  const seq = () => [1, 2, 3, 4, 5].map(i => S.color(`--seq-${i}`));

  const pct = (a, b) => (b ? 100 * a / b : null);
  const INDICADORES = [
    { id: 'pagado_hab', capa: '03_municipio_ciclo', valor: r => r.pagado_hab, formato: v => S.pesos(v),
      es: 'Pagado por habitante (pesos)', en: 'Paid per inhabitant (pesos)',
      nes: 'Lo pagado en el ciclo entre la población de 2020. Es solo el gasto federalizado que SHCP registra, no todo el gasto del municipio.',
      nen: 'Paid in the year divided by the 2020 population. It is only the federally funded spending that SHCP records, not all municipal spending.' },
    { id: 'proyectos', capa: '03_municipio_ciclo', valor: r => r.proyectos, formato: v => S.numero(v),
      es: 'Proyectos reportados', en: 'Reported projects',
      nes: 'Folios con registro en el ciclo, de todas las categorías.', nen: 'Folios with a record in the year, of every category.' },
    { id: 'fais', capa: '03_municipio_ciclo', valor: r => pct(r.fais, r.proyectos), formato: v => S.numero(v, 1) + ' %',
      es: 'Proyectos del FAIS (%)', en: 'FAIS projects (%)',
      nes: 'Fondo de Aportaciones para la Infraestructura Social: ramo 33, programas 3 y 4.',
      nen: 'Social Infrastructure Contributions Fund: budget line 33, programmes 3 and 4.' },
    { id: 'c1', capa: '03_municipio_ciclo', valor: r => pct(r.c1, r.evaluados), formato: v => S.numero(v, 1) + ' %', revisar: true,
      es: 'C1: costo unitario atípico para su tipo de obra (%)', en: 'C1: atypical unit cost for its type of work (%)',
      nes: 'Más de 3 desviaciones robustas sobre las obras de igual clasificación y unidad, con al menos 30 pares.',
      nen: 'More than 3 robust deviations above works of the same classification and unit, with at least 30 peers.' },
    { id: 'c2', capa: '03_municipio_ciclo', valor: r => pct(r.c2, r.evaluados), formato: v => S.numero(v, 1) + ' %', revisar: true,
      es: 'C2: en ejecución 120 días después de su término (%)', en: 'C2: in progress 120 days after its end date (%)',
      nes: 'Sigue en ejecución más de 120 días después de su fecha de término, contados al cierre del ciclo.',
      nen: 'Still in progress more than 120 days after its end date, counted at the close of the year.' },
    { id: 'c3', capa: '03_municipio_ciclo', valor: r => pct(r.c3, r.evaluados), formato: v => S.numero(v, 1) + ' %', revisar: true,
      es: 'C3: avance físico bajo con pago alto (%)', en: 'C3: low physical progress with high payment (%)',
      nes: 'Avance físico menor a 30 % con avance financiero mayor a 80 %.', nen: 'Physical progress below 30 % with financial progress above 80 %.' },
    { id: 'c4', capa: '03_municipio_ciclo', valor: r => pct(r.c4, r.evaluados), formato: v => S.numero(v, 1) + ' %', revisar: true,
      es: 'C4: pago por encima del avance (%)', en: 'C4: payment ahead of progress (%)',
      nes: 'El avance financiero supera al físico por más de 30 puntos.', nen: 'Financial progress exceeds physical progress by more than 30 points.' },
    { id: 'rezago', capa: '02_municipios', fijo: true, valor: r => r.grado, ordinal: true,
      es: 'Grado de rezago social, 2020', en: 'Social deprivation level, 2020',
      nes: 'CONEVAL, índice de rezago social municipal 2020.', nen: 'CONEVAL, 2020 municipal social deprivation index.' },
    { id: 'cngmd', capa: '04_cruce_cngmd_2022', fijo: true, valor: r => r.relacion, categorias: RELACIONES,
      es: 'Contratos de obra 2022: INEGI contra SHCP', en: 'Works contracts 2022: INEGI against SHCP',
      nes: 'Lo que el municipio declaró en el CNGMD 2023 contra los contratos de obra que SHCP registra con el municipio como convocante. Una diferencia no prueba irregularidad: el CNGMD cubre todos los recursos del municipio y SHCP solo el gasto federalizado.',
      nen: 'What the municipality declared in the 2023 CNGMD against the works contracts SHCP records with the municipality as the contracting party. A difference does not prove an irregularity: the CNGMD covers all municipal resources and SHCP only federally funded spending.' },
  ];
  const categorias = ind => (ind.ordinal ? GRADOS.map((g, i) => [g, GRADOS_EN[g], seq()[i]]) : ind.categorias);

  const lista = (p, todos) => {
    const v = (q.get(p) || '').split(',').filter(Boolean).map(Number).filter(x => todos.includes(x));
    return new Set(v.length ? v : (p === 'estatus' ? todos : []));
  };
  const estado = {
    ind: INDICADORES.find(i => i.id === q.get('ind')) || INDICADORES[0],
    ciclo: Number(q.get('ciclo')) || 2024,
    entidad: Number(q.get('estado')) || 0,
    estatus: lista('estatus', [0, 1, 2, 3]),
    evidencia: lista('evidencia', EVIDENCIAS),
    soloMarcas: q.get('marcas') === '1',
  };
  const datos = {};
  const puntosPorEstado = new Map(), detallesPorMunicipio = new Map();
  let manifiesto, mapa, capaMunicipios, capaPuntos = null, puntos = [], abierto = null, pedido = 0;
  const normal = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const sitio = id => document.getElementById(id);

  if (q.get('vista') === 'figura') document.body.classList.add('figura');

  function setUrl() {
    const u = new URL(location.href);
    const poner = (k, v) => (v == null || v === '' ? u.searchParams.delete(k) : u.searchParams.set(k, v));
    poner('ind', estado.ind.id);
    poner('ciclo', estado.ciclo);
    poner('estado', estado.entidad || null);
    poner('estatus', estado.estatus.size < 4 ? [...estado.estatus].join(',') : null);
    poner('evidencia', estado.evidencia.size ? [...estado.evidencia].join(',') : null);
    poner('marcas', estado.soloMarcas ? '1' : null);
    poner('folio', abierto && abierto.folio ? abierto.folio : null);
    poner('comparar', sitio('comparar').hidden ? null : '1');
    if (mapa) {
      const c = mapa.getCenter();
      poner('c', `${c.lat.toFixed(4)},${c.lng.toFixed(4)},${mapa.getZoom()}`);
    }
    history.replaceState(null, '', u.toString());
  }

  /* ------------------------------------------------------------- municipios */

  function cortes(valores) {
    const v = valores.filter(x => x != null && x > 0).sort((a, b) => a - b);
    if (!v.length) return [];
    const b = [0.2, 0.4, 0.6, 0.8].map(p => v[Math.min(v.length - 1, Math.floor(p * v.length))]);
    return b.filter((x, i) => i === 0 || x > b[i - 1]);
  }

  const claseColor = (i, n) => seq()[Math.round(i * 4 / Math.max(1, n))];

  function color(ind, v, b) {
    if (v == null) return null;
    const cats = categorias(ind);
    if (cats) {
      const c = cats.find(x => x[0] === v);
      return c ? c[2] : null;
    }
    if (v <= 0) return S.color('--cero');
    let i = 0;
    while (i < b.length && v > b[i]) i++;
    return claseColor(i, b.length);
  }

  function filaIndicador(ind, cvemun) {
    if (ind.capa === '02_municipios') return datos.municipios.get(cvemun);
    if (ind.capa === '04_cruce_cngmd_2022') return datos.cruce.get(cvemun);
    return datos.porCiclo.get(cvemun + '|' + estado.ciclo);
  }

  function valor(ind, cvemun) {
    const r = filaIndicador(ind, cvemun);
    return r ? ind.valor(r) : (ind.capa === '03_municipio_ciclo' ? 0 : null);
  }

  function pintarMunicipios() {
    const ind = estado.ind;
    const b = categorias(ind) ? [] : cortes([...datos.municipios.keys()].map(k => valor(ind, k)));
    const borde = S.color('--borde-punto');
    /* Con un estado cargado, los municipios pasan a segundo plano para que se vean los proyectos. */
    const opacidad = estado.entidad ? 0.3 : 0.85;
    capaMunicipios.eachLayer(m => {
      const c = color(ind, valor(ind, m.cvemun), b);
      m.setStyle(c ? { fillColor: c, fillOpacity: opacidad, color: borde, weight: 0.6 }
                   : { fillOpacity: 0, color: S.color('--texto-3'), weight: 1.2 });
    });
    leyenda(b);
    nota();
    conteos();
    origen();
    setUrl();
  }

  function leyenda(b) {
    const ind = estado.ind;
    sitio('leyendaTitulo').textContent = en ? ind.en : ind.es;
    const filas = [];
    const item = (c, txt) => filas.push(`<div class="ley"><i style="background:${c}"></i>${S.esc(txt)}</div>`);
    const cats = categorias(ind);
    if (cats) {
      cats.forEach(c => item(c[2], en ? c[1] : c[0]));
    } else {
      item(S.color('--cero'), t('ley.cero'));
      b.forEach((x, i) => item(claseColor(i, b.length),
        i === 0 ? t('ley.hasta', { b: ind.formato(x) }) : t('ley.entre', { a: ind.formato(b[i - 1]), b: ind.formato(x) })));
      if (b.length) item(claseColor(b.length, b.length), t('ley.mas', { a: ind.formato(b[b.length - 1]) }));
    }
    filas.push(`<div class="ley"><i class="hueco"></i>${S.esc(t('sindato'))}</div>`);
    filas.push(`<p class="nota">${S.esc(t('ley.tam'))}</p>`);
    if (estado.entidad) {
      filas.push(`<p class="subtitulo">${S.esc(t('ley.obras', { estado: nombreEstado(estado.entidad) }))}</p>`);
      [0, 1, 2, 3].forEach(g => item(ESTATUS[g], t('e.' + g)));
    }
    sitio('leyenda').innerHTML = filas.join('');
  }

  function nota() {
    const ind = estado.ind;
    const partes = [en ? ind.nen : ind.nes];
    if (ind.revisar) partes.push(t('nota.revisar'));
    if (ind.fijo) partes.push(t('nota.fijo'));
    else if (!categorias(ind)) partes.push(t('nota.cortes'));
    if (!ind.fijo && estado.ciclo === 2025) {
      partes.push(t('nota.2025', { n: S.numero(datos.resumen.get(2025).proyectos), m: S.numero(datos.resumen.get(2024).proyectos) }));
    }
    sitio('notaIndicador').textContent = partes.join(' ');
    sitio('ciclo').disabled = !!ind.fijo;
  }

  function conteos() {
    const r = datos.resumen.get(estado.ciclo);
    const li = (k, v) => `<li><span>${S.esc(t(k))}</span><b>${S.esc(v)}</b></li>`;
    sitio('conteos').innerHTML = `<li><b>${S.esc(t('n.ciclo', { c: estado.ciclo }))}</b></li>`
      + li('n.entidades', S.numero(r.entidades)) + li('n.municipios', S.numero(r.municipios))
      + li('n.proyectos', S.numero(r.proyectos)) + li('n.evaluados', S.numero(r.evaluados))
      + li('n.aprobado', S.pesos(r.aprobado)) + li('n.pagado', S.pesos(r.pagado));
  }

  /* ------------------------------------------------------------- origen */

  function bloqueOrigen(consulta, archivo) {
    const c = manifiesto.consultas.find(x => x.consulta.startsWith(consulta));
    if (!c) return '';
    const cmd = c.motor === 'pg'
      ? `docker exec -i obras-publicas-db-1 psql -U obras -d obras_publicas < lakehouse/capas/${c.consulta}`
      : `lakehouse/.venv/Scripts/python lakehouse/consultas/lago.py lakehouse/capas/${c.consulta}`;
    return `<p>${S.esc(t('o.texto', { sql: c.consulta, motor: t('motor.' + c.motor), filas: S.numero(c.filas),
      fecha: manifiesto.generado_en, hash: c.sha256_datos.slice(0, 16) }))}`
      + (c.particion && archivo ? ' ' + S.esc(t('o.parte', { archivo: `${c.datos}${archivo}.json`, n: S.numero(c.archivos) })) : '')
      + `</p><details><summary>${S.esc(t('o.sql'))}</summary><pre>${S.esc(c.sql)}</pre></details>`
      + `<p class="nota">${S.esc(t('o.cmd'))}</p><pre>${S.esc(cmd)}</pre>`;
  }

  function origen() {
    let html = bloqueOrigen(estado.ind.capa) + (estado.ind.capa === '02_municipios' ? '' : bloqueOrigen('02_municipios'));
    if (estado.entidad) html += bloqueOrigen('05_puntos_2024', estado.entidad);
    if (abierto && abierto.cvemun) html += bloqueOrigen('06_detalle_2024', abierto.cvemun);
    sitio('origen').innerHTML = html + `<p class="nota">${S.esc(t('o.verif'))}</p>`;
  }

  /* ------------------------------------------------------------- proyectos por estado */

  const nombreEstado = id => (datos.estados.get(id) || {}).nombre || '';

  /* Lo que tapan el buscador, el panel y la ficha, para encuadrar en lo que queda a la vista. En el
     teléfono el panel y la ficha son hojas que suben desde abajo. */
  function margenes() {
    const ancho = window.innerWidth > 760;
    const panel = sitio('panel'), cajon = sitio('detalle');
    let abajo = ancho ? 10 : 70;
    if (!ancho && !cajon.hidden) abajo = 0.6 * mapa.getSize().y;
    else if (!ancho && panel.classList.contains('abierto')) abajo = panel.offsetHeight;
    return { paddingTopLeft: [ancho ? 384 : 10, 64], paddingBottomRight: [ancho && !cajon.hidden ? 414 : 10, abajo] };
  }

  /* Los saltos del mapa van sin animación: Leaflet ignora un salto pedido mientras anima otro, y con
     la pestaña oculta guarda la animación y la aplica al volver, encima de lo que se eligió después. */
  const SIN_ANIMAR = { animate: false };
  function ir(centro, zoom) {
    const m = margenes();
    const corrimiento = L.point(m.paddingBottomRight[0] - m.paddingTopLeft[0], m.paddingBottomRight[1] - m.paddingTopLeft[1]).divideBy(2);
    mapa.setView(mapa.unproject(mapa.project(centro, zoom).add(corrimiento), zoom), zoom, SIN_ANIMAR);
  }

  /* El estado de un punto: el de la cabecera municipal más cercana. */
  function estadoEn(lat, lon) {
    let mejor = null, d = Infinity;
    for (const m of datos.municipios.values()) {
      if (m.lat == null) continue;
      const x = (m.lat - lat) ** 2 + ((m.lon - lon) * Math.cos(lat * Math.PI / 180)) ** 2;
      if (x < d) { d = x; mejor = m; }
    }
    return mejor ? Number(mejor.cvemun.slice(0, 2)) : 0;
  }

  function cargando(texto) {
    const c = sitio('cargando');
    c.textContent = texto || '';
    c.hidden = !texto;
  }

  /* Se dibujan primero los terminados, que son la mayoría, y al final los cancelados, para que los
     estatus escasos no queden enterrados. El radio crece al acercarse. */
  const CAPA_ESTATUS = [0, 2, 3, 1];
  const radioPuntos = () => (mapa.getZoom() <= 7 ? 3 : mapa.getZoom() <= 9 ? 4 : 5.5);
  let radioActual = 0;
  function ajustarRadio(forzar) {
    const r = radioPuntos();
    if (r === radioActual && !forzar) return;
    radioActual = r;
    puntos.forEach(p => p.m.setRadius(r));
  }

  function puntosDe(id) {
    if (!puntosPorEstado.has(id)) {
      const promesa = S.json(`datos/05_puntos_2024/${id}.json`).then(capa => S.objetos(capa).map(p => {
        p.entidad = id;
        p.m = L.circleMarker([p.lat, p.lon], { pane: 'obras', radius: radioPuntos(), weight: 0.8, color: S.oscuro() ? '#111' : '#fff',
          fillColor: ESTATUS[p.g], fillOpacity: 0.92 });
        p.m.on('click', () => abrirProyecto(p));
        p.busqueda = normal(`${p.nombre} ${p.folio} ${(datos.municipios.get(p.cvemun) || {}).municipio || ''}`);
        return p;
      }).sort((a, b) => CAPA_ESTATUS[a.g] - CAPA_ESTATUS[b.g]));
      promesa.catch(() => puntosPorEstado.delete(id));
      puntosPorEstado.set(id, promesa);
    }
    return puntosPorEstado.get(id);
  }

  /* "Elige un estado…" vuelve a la vista de municipios. */
  function quitarEstado() {
    ++pedido;
    estado.entidad = 0;
    if (capaPuntos) mapa.removeLayer(capaPuntos);
    capaPuntos = null;
    puntos = [];
    sitio('filtros').hidden = true;
    sitio('estadoObras').value = 0;
    pintarMunicipios();
  }

  async function cargarEstado(id, encuadrar) {
    if (!id) return quitarEstado();
    if (encuadrar) {
      const e = datos.estados.get(id);
      mapa.fitBounds([[e.sur, e.oeste], [e.norte, e.este]], Object.assign({ maxZoom: 10 }, margenes(), SIN_ANIMAR));
    }
    if (id === estado.entidad && capaPuntos) return;
    estado.entidad = id;
    sitio('estadoObras').value = id;
    const mio = ++pedido;
    cargando(t('cargandoEstado', { estado: nombreEstado(id) }));
    let lista;
    try {
      lista = await puntosDe(id);
    } catch (e) {
      cargando(t('error', { msg: e.message }));
      setTimeout(() => cargando(''), 4000);
      return;
    }
    if (mio !== pedido) return;
    cargando('');
    if (capaPuntos) mapa.removeLayer(capaPuntos);
    capaPuntos = L.layerGroup().addTo(mapa);
    puntos = lista;
    ajustarRadio(true);
    sitio('filtros').hidden = false;
    pintarFiltros();
    filtrar();
    pintarMunicipios();
  }

  const visible = p => estado.estatus.has(p.g) && (!estado.soloMarcas || p.marcas > 0)
    && [...estado.evidencia].every(b => (p.evidencia & b) === b);

  function filtrar() {
    if (!capaPuntos) return;
    capaPuntos.clearLayers();
    let n = 0;
    puntos.forEach(p => { if (visible(p)) { p.m.addTo(capaPuntos); n++; } });
    sitio('filtroConteo').textContent = t('f.conteo', { n: S.numero(n), total: S.numero(puntos.length), estado: nombreEstado(estado.entidad) });
    sitio('verFiltrados').hidden = !n;
    setUrl();
  }

  /* Encuadra los proyectos que dejan los filtros: con pocos, sueltos en el estado, cuesta hallarlos. */
  function verFiltrados() {
    const vistos = puntos.filter(visible).map(p => [p.lat, p.lon]);
    if (!vistos.length) return;
    cerrarPanel();
    if (vistos.length === 1) ir(vistos[0], 15);
    else mapa.fitBounds(vistos, Object.assign({ maxZoom: 15 }, margenes(), SIN_ANIMAR));
  }

  function ficha(etiqueta, n, activa, punto) {
    return `<button type="button" class="ficha" aria-pressed="${activa}">`
      + (punto ? `<i style="background:${punto}"></i>` : '') + `${S.esc(etiqueta)} <small>${S.numero(n)}</small></button>`;
  }

  function pintarFiltros() {
    const porEstatus = [0, 0, 0, 0], porEvidencia = { 1: 0, 2: 0, 4: 0, 8: 0 };
    let conMarca = 0;
    puntos.forEach(p => {
      porEstatus[p.g]++;
      EVIDENCIAS.forEach(b => { if (p.evidencia & b) porEvidencia[b]++; });
      if (p.marcas > 0) conMarca++;
    });
    const cajaE = sitio('filtrosEstatus');
    cajaE.innerHTML = [0, 1, 2, 3].map(g => ficha(t('e.' + g), porEstatus[g], estado.estatus.has(g), ESTATUS[g])).join('');
    cajaE.querySelectorAll('button').forEach((b, g) => b.addEventListener('click', () => {
      if (estado.estatus.has(g)) estado.estatus.delete(g); else estado.estatus.add(g);
      b.setAttribute('aria-pressed', String(estado.estatus.has(g)));
      filtrar();
    }));
    const cajaV = sitio('filtrosEvidencia');
    cajaV.innerHTML = EVIDENCIAS.map(v => ficha(t('ev.' + v), porEvidencia[v], estado.evidencia.has(v))).join('');
    cajaV.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => {
      const v = EVIDENCIAS[i];
      if (estado.evidencia.has(v)) estado.evidencia.delete(v); else estado.evidencia.add(v);
      b.setAttribute('aria-pressed', String(estado.evidencia.has(v)));
      filtrar();
    }));
    const bm = sitio('soloMarcas');
    bm.innerHTML = `${S.esc(t('f.marcas'))} <small>${S.numero(conMarca)}</small>`;
    bm.setAttribute('aria-pressed', String(estado.soloMarcas));
  }

  /* ------------------------------------------------------------- fichas de detalle */

  function abrirCajon(html) {
    sitio('detalleContenido').innerHTML = html;
    sitio('detalle').hidden = false;
    sitio('detalle').scrollTop = 0;
    cerrarPanel();
  }

  function cerrarCajon() {
    sitio('detalle').hidden = true;
    abierto = null;
    resaltar(null);
    origen();
    setUrl();
  }

  function archivoOficial(id) {
    const f = datos.fuentes.get(id);
    return f ? `<a href="${S.esc(f.url)}" target="_blank" rel="noopener noreferrer">${S.esc(f.url.split('/').pop())}</a>` : '';
  }

  const cifra = (k, v) => `<div class="cifra"><span>${S.esc(t(k))}</span><b>${S.esc(v)}</b></div>`;

  function abrirMunicipio(cvemun) {
    const m = datos.municipios.get(cvemun);
    const r = datos.porCiclo.get(cvemun + '|' + estado.ciclo);
    const x = datos.cruce.get(cvemun);
    const id = Number(cvemun.slice(0, 2));
    abierto = { cvemun: null };
    resaltar(m.lat == null ? null : [m.lat, m.lon]);
    let html = `<h2>${S.esc(m.municipio)}</h2><p class="sub">${S.esc(m.entidad)} · ${S.esc(cvemun)}</p>`
      + '<div class="cifras">' + cifra('d.pob', S.numero(m.pobtot))
      + cifra('d.grado', m.grado == null ? t('sindato') : (en ? GRADOS_EN[m.grado] : m.grado));
    if (x) html += cifra('d.cngmd', t('d.cngmd.n', { a: x.contratos_cngmd == null ? t('sindato') : S.numero(x.contratos_cngmd), b: S.numero(x.contratos_shcp) }));
    html += '</div>';
    html += `<div class="bloque"><h3>${S.esc(t('d.ciclo', { c: estado.ciclo }))}</h3>`;
    if (!r) {
      html += `<p>${S.esc(t('d.sinciclo'))}</p>`;
    } else {
      const de = (a, b) => `${S.numero(a)} / ${S.numero(b)}`;
      html += '<table class="tabla-simple">' + [
        [t('d.proyectos'), S.numero(r.proyectos)], [t('d.aprobado'), S.pesos(r.aprobado)], [t('d.pagado'), S.pesos(r.pagado)],
        [t('d.pagado_hab'), S.pesos(r.pagado_hab)], [t('d.fais'), de(r.fais, r.proyectos)], [t('d.evaluados'), S.numero(r.evaluados)],
        [t('d.c1'), de(r.c1, r.evaluados)], [t('d.c2'), de(r.c2, r.evaluados)], [t('d.c3'), de(r.c3, r.evaluados)],
        [t('d.c4'), de(r.c4, r.evaluados)],
      ].map(([k, v]) => `<tr><td>${S.esc(k)}</td><td>${S.esc(v)}</td></tr>`).join('') + '</table>';
    }
    html += `<button type="button" class="boton-principal" data-estado="${id}">${S.esc(t('d.verestado', { estado: nombreEstado(id) }))}</button></div>`;
    const ids = [['inegi_iter2020', 'fu.pob'], ['coneval_irs2020', 'fu.rezago'], [`shcp_ef${estado.ciclo}`, 'fu.shcp'], ['inegi_cngmd2023', 'fu.cngmd']];
    html += `<div class="bloque"><h3>${S.esc(t('d.fuente'))}</h3><p>${S.esc(t('fu.mun', { cvemun }))}</p><ul class="docs">`
      + ids.map(([i, k]) => `<li>${S.esc(t(k))}: ${archivoOficial(i)}</li>`).join('') + '</ul></div>';
    abrirCajon(html);
    origen();
    setUrl();
  }

  function detallesDe(cvemun) {
    if (!detallesPorMunicipio.has(cvemun)) {
      const promesa = S.json(`datos/06_detalle_2024/${cvemun}.json`).then(capa => new Map(S.objetos(capa).map(d => [d.folio, d])));
      promesa.catch(() => detallesPorMunicipio.delete(cvemun));
      detallesPorMunicipio.set(cvemun, promesa);
    }
    return detallesPorMunicipio.get(cvemun);
  }

  function etiquetaEnlace(u) {
    try {
      const x = new URL(u);
      let ultimo = x.pathname.split('/').filter(Boolean).pop() || '';
      try { ultimo = decodeURIComponent(ultimo); } catch (e) { /* se queda codificado */ }
      return x.hostname + (ultimo ? ' · ' + (ultimo.length > 34 ? ultimo.slice(0, 34) + '…' : ultimo) : '');
    } catch (e) {
      return u.slice(0, 40);
    }
  }

  function cabeceraProyecto(p, clasificacion) {
    const m = datos.municipios.get(p.cvemun);
    return `<h2>${S.esc(p.nombre)}</h2><p class="sub">${S.esc(m ? m.municipio + ', ' + m.entidad : nombreEstado(p.entidad))}</p>`
      + `<span class="chip"><i style="background:${ESTATUS[p.g]}"></i>${S.esc(t('e.' + p.g))}</span>`
      + (clasificacion ? ` <span class="chip">${S.esc(clasificacion)}</span>` : '');
  }

  /* Un aro alrededor del proyecto o del municipio abierto, para encontrarlo entre los demás puntos. */
  let resaltado = null;
  function resaltar(centro) {
    if (resaltado) resaltado.remove();
    resaltado = centro ? L.circleMarker(centro, { pane: 'obras', radius: 11, weight: 3, color: S.color('--marca'),
      fill: false, interactive: false }).addTo(mapa) : null;
  }

  /* El avance como barra; la cifra se muestra tal cual, aunque pase de 100. */
  function avance(k, v) {
    const ancho = v == null ? 0 : Math.max(0, Math.min(100, v));
    return `<div class="avance"><span>${S.esc(t(k))}</span><div class="avance__barra"><i style="width:${ancho}%"></i></div>`
      + `<b>${S.esc(v == null ? t('sindato') : S.numero(v, 1) + ' %')}</b></div>`;
  }

  async function abrirProyecto(p) {
    abierto = { cvemun: p.cvemun, folio: p.folio };
    resaltar([p.lat, p.lon]);
    abrirCajon(cabeceraProyecto(p) + `<p class="nota">${S.esc(t('d.cargando'))}</p><div class="esqueleto"></div><div class="esqueleto"></div>`);
    origen();
    let d;
    try {
      d = (await detallesDe(p.cvemun)).get(p.folio) || {};
    } catch (e) {
      d = {};
    }
    if (!abierto || abierto.folio !== p.folio) return;
    let html = cabeceraProyecto(p, d.clasificacion) + '<div class="cifras">'
      + cifra('d.aprobado', S.pesos(d.aprobado)) + cifra('d.pagado', S.pesos(d.pagado)) + '</div>'
      + avance('d.fisico', d.pct_fisico) + avance('d.financiero', d.pct_financiero)
      + `<p class="fechas">${S.esc(t('d.inicio'))} <b>${S.esc(d.fecha_inicio || t('sindato'))}</b> · ${S.esc(t('d.termino'))} `
      + `<b>${S.esc(d.fecha_termino || t('sindato'))}</b> · ${S.esc(t('d.contratos'))} <b>${S.esc(S.numero(d.n_contratos))}</b></p>`;
    const marcas = p.marcas == null ? t('d.noaplica')
      : (['c1', 'c2', 'c3', 'c4'].filter((k, i) => p.marcas & (1 << i)).map(k => t('d.' + k)).join(' · ') || t('d.ninguna'));
    html += `<div class="bloque"><h3>${S.esc(t('d.marcas'))}</h3><p>${S.esc(marcas)}</p><p class="nota">${S.esc(t('nota.revisar'))}</p></div>`;

    html += `<div class="bloque"><h3>${S.esc(t('d.evidencia'))}</h3>`;
    const docs = d.enlaces || [];
    const fotos = docs.filter(u => IMAGEN.test(u)).slice(0, 3);
    if (fotos.length) {
      html += '<div class="miniaturas">' + fotos.map(u => `<a href="${S.esc(u)}" target="_blank" rel="noopener noreferrer nofollow">`
        + `<img src="${S.esc(u)}" alt="${S.esc(t('fu.imagen'))}" loading="lazy" referrerpolicy="no-referrer"></a>`).join('') + '</div>';
    }
    html += `<button type="button" class="boton-principal" data-comparar="${S.esc(p.folio)}">${S.esc(t('sat.boton'))}</button>`
      + `<p class="nota">${S.esc(t(p.evidencia & 8 ? 'sat.nota' : 'sat.sin'))}</p>`;
    /* Muchos enlaces de las dependencias ya no responden; Internet Archive guarda copias de una parte. */
    const archivada = u => `https://web.archive.org/web/2024/${u}`;
    if (docs.length) {
      html += `<p><b>${S.esc(t('fu.docs', { n: S.numero(docs.length) }))}</b></p><ul class="docs">`
        + docs.slice(0, 8).map(u => `<li><a href="${S.esc(u)}" target="_blank" rel="noopener noreferrer nofollow">${S.esc(etiquetaEnlace(u))}</a>`
          + ` · <a class="archivada" href="${S.esc(archivada(u))}" target="_blank" rel="noopener noreferrer nofollow">${S.esc(t('fu.archivo'))}</a></li>`).join('')
        + '</ul>' + (docs.length > 8 ? `<p class="nota">${S.esc(t('fu.mas', { n: S.numero(docs.length - 8) }))}</p>` : '')
        + `<p class="nota">${S.esc(t('fu.docs.nota'))}</p>`;
    } else {
      html += `<p class="nota">${S.esc(t('fu.sindocs'))}</p>`;
    }
    html += '</div>';
    const f = datos.fuentes.get('shcp_ef2024');
    html += `<div class="bloque"><h3>${S.esc(t('d.fuente'))}</h3><p>${t('fu.folio', {
      folio: `<code>${S.esc(p.folio)}</code>`, archivo: archivoOficial('shcp_ef2024'),
      sha: S.esc(f.sha256.slice(0, 16)), fecha: S.esc(datos.consultado) })}</p></div>`;
    abierto.p = p;
    abierto.d = d;
    abrirCajon(html);
    setUrl();
  }

  /* ------------------------------------------------------------- antes y ahora (Esri Wayback) */

  /* "Antes" es la última versión publicada antes de la fecha de inicio: su toma es, a lo sumo, de
     ese día, así que es anterior a la obra. Cada versión repite el mosaico de la última que cambió
     ese lugar: el servicio tilemap de Esri dice de cuál viene, y los metadatos de esa versión dan la
     fecha de la toma en el punto (una capa por nivel de zoom; la 0 es el nivel 23). Así cada imagen
     lleva su fecha real, y si antes y ahora son la misma toma, se dice. */
  const WAYBACK = 'https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json';
  const TILEMAP = 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tilemap';
  let versionesWayback = null, comparacion = null, pedidoComparar = 0;
  /* Con plazo: un servicio que no contesta no deja la comparación esperando para siempre. */
  function leerJson(u, ms = 20000) {
    const ctl = new AbortController();
    const reloj = setTimeout(() => ctl.abort(), ms);
    return fetch(u, { signal: ctl.signal }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .finally(() => clearTimeout(reloj));
  }

  function wayback() {
    if (!versionesWayback) {
      versionesWayback = leerJson(WAYBACK).then(d => Object.entries(d).map(([num, v]) => ({
        num, item: v.itemID, meta: v.metadataLayerUrl, fecha: ((v.itemTitle || '').match(/\d{4}-\d{2}-\d{2}/) || [])[0],
        url: (v.itemURL || '').replace('{level}', '{z}').replace('{row}', '{y}').replace('{col}', '{x}'),
      })).filter(v => v.fecha && v.url.startsWith('https://')).sort((a, b) => a.fecha.localeCompare(b.fecha)));
      versionesWayback.catch(() => { versionesWayback = null; });
    }
    return versionesWayback;
  }

  /* La versión de la que sale el mosaico del punto en el nivel z, o null si ahí no hay imagen. */
  async function origenTesela(v, lat, lon, z) {
    const n = 2 ** z, rad = lat * Math.PI / 180;
    const x = Math.floor((lon + 180) / 360 * n);
    const y = Math.floor((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * n);
    const d = await leerJson(`${TILEMAP}/${v.num}/${z}/${y}/${x}`);
    if (!d.data || !d.data[0]) return null;
    return d.select && d.select[0] != null ? String(d.select[0]) : v.num;
  }

  async function fechaToma(v, lat, lon, z) {
    const punto = encodeURIComponent(JSON.stringify({ x: lon, y: lat, spatialReference: { wkid: 4326 } }));
    const d = await leerJson(`${v.meta}/${23 - z}/query?f=json&geometry=${punto}&geometryType=esriGeometryPoint`
      + '&spatialRel=esriSpatialRelIntersects&outFields=SRC_DATE2&returnGeometry=false');
    const ms = d.features && d.features.length ? d.features[0].attributes.SRC_DATE2 : null;
    return ms ? new Date(ms).toISOString().slice(0, 10) : null;
  }

  /* El crédito de cada versión, como lo publica Esri en su ficha. */
  const creditos = v => leerJson(`https://www.arcgis.com/sharing/rest/content/items/${v.item}?f=json`)
    .then(d => d.accessInformation || '').catch(() => '');

  function cerrarComparar() {
    const caja = sitio('comparar');
    if (caja.hidden) return false;
    caja.hidden = true;
    pedidoComparar++;
    if (comparacion) comparacion.forEach(m => m.remove());
    comparacion = null;
    sitio('svMapas').innerHTML = sitio('svNota').innerHTML = '';
    setUrl();
    return true;
  }

  async function comparar(p, d) {
    const caja = sitio('comparar');
    const [pieAntes, pieAhora] = caja.querySelectorAll('.comparar__satelite figcaption');
    const mio = ++pedidoComparar;
    sitio('compararTitulo').textContent = p.nombre;
    pieAntes.textContent = pieAhora.textContent = t('cmp.cargando');
    caja.hidden = false;
    setUrl();
    if (comparacion) comparacion.forEach(m => m.remove());
    comparacion = null;
    if (!document.body.classList.contains('figura')) streetView(p, mio);
    let vs;
    try {
      vs = await wayback();
    } catch (e) {
      pieAntes.textContent = t('cmp.error');
      pieAhora.textContent = '';
      return;
    }
    const porNum = new Map(vs.map(v => [v.num, v]));
    const ahora = vs[vs.length - 1];
    const antes = d.fecha_inicio ? [...vs].reverse().find(v => v.fecha < d.fecha_inicio) : null;
    if (mio !== pedidoComparar) return;

    /* Las imágenes salen en cuanto se sabe qué versiones comparar, con la fecha de la versión; la de la
       toma y el crédito se agregan cuando Esri responde, que a veces tarda. En la vista de figura se
       acerca un nivel, ampliando los mosaicos, para que en papel se distinga la obra. */
    const figura = document.body.classList.contains('figura');
    const crear = (id, v) => {
      const m = L.map(id, { zoomControl: false }).setView([p.lat, p.lon], figura ? 18 : 17);
      m.capa = v ? L.tileLayer(v.url, { maxZoom: 19, maxNativeZoom: figura ? 17 : 19, attribution: 'Esri World Imagery Wayback' }).addTo(m) : null;
      L.circleMarker([p.lat, p.lon], { radius: 9, color: '#ffeb3b', weight: 3, fill: false }).addTo(m);
      if (v) creditos(v).then(c => { if (c && m._loaded) m.attributionControl.addAttribution(S.esc(c)); });
      return m;
    };
    comparacion = [crear('mapaAntes', antes), crear('mapaAhora', ahora)];
    let moviendo = false;
    comparacion.forEach((m, i) => m.on('move', () => {
      if (moviendo) return;
      moviendo = true;
      comparacion[1 - i].setView(m.getCenter(), m.getZoom(), { animate: false });
      moviendo = false;
    }));
    const pies = (tAntes, tAhora, igual) => {
      pieAntes.textContent = !antes ? t('cmp.sinantes', { inicio: d.fecha_inicio || t('sindato') })
        : tAntes ? t('cmp.antes.toma', { toma: tAntes, version: antes.fecha, inicio: d.fecha_inicio })
          : t('cmp.antes', { fecha: antes.fecha, inicio: d.fecha_inicio });
      let txt = igual ? t('cmp.igual', { toma: tAhora || ahora.fecha })
        : tAhora ? t('cmp.ahora.toma', { toma: tAhora, version: ahora.fecha }) : t('cmp.reciente', { fecha: ahora.fecha });
      txt += ' ' + t('cmp.termino', { termino: d.fecha_termino || t('sindato') });
      if (tAhora && d.fecha_termino && tAhora < d.fecha_termino) txt += ' ' + t('cmp.previa');
      pieAhora.textContent = txt;
    };
    pies(null, null, false);

    /* El nivel más cercano en que las dos versiones tienen imagen del punto; si Esri no responde, se
       quedan el nivel 17 y las fechas de las versiones. */
    let z = 17, oAhora = null, oAntes = null;
    try {
      for (z = 17; z >= 14; z--) {
        [oAhora, oAntes] = await Promise.all([origenTesela(ahora, p.lat, p.lon, z),
          antes ? origenTesela(antes, p.lat, p.lon, z) : null]);
        if (oAhora && (!antes || oAntes)) break;
      }
      if (z < 14) { z = 17; oAhora = oAntes = null; }
    } catch (e) {
      z = 17;
      oAhora = oAntes = null;
    }
    if (mio !== pedidoComparar) return;
    if (z !== 17) {
      comparacion.forEach(m => {
        if (m.capa && figura) { m.capa.options.maxNativeZoom = z; m.capa.redraw(); }
        m.setView([p.lat, p.lon], figura ? z + 1 : z, { animate: false });
      });
    }
    const toma = (o, v) => (o ? fechaToma(porNum.get(o) || v, p.lat, p.lon, z).catch(() => null) : null);
    const [tAhora, tAntes] = await Promise.all([toma(oAhora, ahora), toma(oAntes, antes)]);
    if (mio !== pedidoComparar) return;
    pies(tAntes, tAhora, !!oAntes && oAntes === oAhora);
  }

  /* ------------------------------------------------------------- Street View (Google) */

  /* Street View se incrusta como Google lo permite en un sitio web; sus reglas no dejan imprimirlo
     ni capturarlo, por eso no va en la vista de figura. ejemplos.json guarda los panoramas de antes y
     después que los autores eligieron en Google Maps para el ejemplo del artículo; en los demás
     proyectos va el panorama más cercano al punto, si hay, y un enlace para recorrer sus fechas. */
  let ejemplos = null;
  const leerEjemplos = () => (ejemplos = ejemplos || S.json('ejemplos.json').catch(() => ({})));
  const mesAnio = f => new Date(f + '-15T12:00:00Z').toLocaleDateString(S.locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });

  async function streetView(p, mio) {
    const marco = (src, pie) => `<figure><iframe class="comparar__mapa" src="${S.esc(src)}" title="Google Street View" `
      + `loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe><figcaption>${S.esc(pie)}</figcaption></figure>`;
    const panorama = s => `https://www.google.com/maps/embed?pb=!4v1730000000000!6m8!1m7!1s${encodeURIComponent(s.pano)}`
      + `!2m2!1d${s.lat}!2d${s.lon}!3f${s.rumbo}!4f${s.inclinacion}!5f0.78`;
    const enlace = `<a href="https://www.google.com/maps/@?api=1&amp;map_action=pano&amp;viewpoint=${p.lat},${p.lon}" `
      + `target="_blank" rel="noopener noreferrer">${S.esc(t('sv.abrir'))}</a>`;
    const ej = ((await leerEjemplos()).streetview || {})[p.folio];
    if (mio !== pedidoComparar) return;
    if (ej) {
      sitio('svMapas').innerHTML = marco(panorama(ej.antes), t('sv.antes', { fecha: mesAnio(ej.antes.fecha) }))
        + marco(panorama(ej.despues), t('sv.despues', { fecha: mesAnio(ej.despues.fecha) }));
      sitio('svNota').innerHTML = `${S.esc(t('sv.ejemplo'))} ${enlace}`;
    } else {
      sitio('svMapas').innerHTML = marco(`https://maps.google.com/maps?layer=c&cbll=${p.lat},${p.lon}&cbp=11,0,0,0,0&output=svembed&hl=${S.idioma}`,
        t('sv.cerca'));
      sitio('svNota').innerHTML = `${S.esc(t('sv.nota'))} ${enlace}`;
    }
  }

  /* ------------------------------------------------------------- buscador */

  /* Como en un mapa de calles: primero lo que el sitio ya tiene (estados, municipios y proyectos del
     estado cargado), al instante; después lugares de OpenStreetMap, por Photon y, si no responde, por
     Nominatim. Ninguno pide clave. */
  const PHOTON = 'https://photon.komoot.io/api/';
  const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
  const CAJA_MX = [-118.6, 14.3, -86.5, 32.8];
  let sugerencias = [], seleccion = -1, relojBusqueda = null, controlLugares = null;

  function locales(texto) {
    const palabras = normal(texto).split(/\s+/).filter(Boolean);
    const coincide = s => palabras.every(w => s.includes(w));
    const est = [...datos.estados.values()].filter(e => coincide(normal(e.nombre))).slice(0, 3)
      .map(e => ({ tipo: 'estado', titulo: e.nombre, e }));
    const mun = datos.indiceMunicipios.filter(([s]) => coincide(s)).slice(0, 5)
      .map(([, m]) => ({ tipo: 'municipio', titulo: m.municipio, sub: m.entidad, m }));
    const pro = puntos.filter(p => coincide(p.busqueda)).slice(0, 6)
      .map(p => ({ tipo: 'proyecto', titulo: p.nombre, sub: p.folio, p }));
    return [...est, ...mun, ...pro];
  }

  function pintarSugerencias(lugares, estadoLugares) {
    const ul = sitio('sugerencias');
    const grupos = [['b.estados', 'estado'], ['b.municipios', 'municipio'], ['b.proyectos', 'proyecto']];
    let html = '';
    let i = 0;
    const boton = s => `<li><button type="button" role="option" data-i="${i++}">${S.esc(s.titulo)}`
      + (s.sub ? `<small>${S.esc(s.sub)}</small>` : '') + '</button></li>';
    const items = [];
    grupos.forEach(([k, tipo]) => {
      const g = sugerencias.filter(s => s.tipo === tipo);
      if (g.length) { html += `<li class="grupo">${S.esc(t(k))}</li>`; g.forEach(s => { items.push(s); html += boton(s); }); }
    });
    if (lugares && lugares.length) {
      html += `<li class="grupo">${S.esc(t('b.lugares'))}</li>`;
      lugares.forEach(s => { items.push(s); html += boton(s); });
    }
    if (estadoLugares) html += `<li class="vacio">${S.esc(estadoLugares)}</li>`;
    if (!items.length && !estadoLugares) html += `<li class="vacio">${S.esc(t('b.nada'))}</li>`;
    html += `<li class="vacio">${S.esc(t('b.fuente'))}</li>`;
    sugerencias = items;
    seleccion = -1;
    ul.innerHTML = html;
    ul.hidden = false;
  }

  async function lugares(texto, señal) {
    const etiquetar = (nombre, partes) => ({ tipo: 'lugar', titulo: nombre, sub: partes.filter(Boolean).join(', ') });
    try {
      const u = `${PHOTON}?q=${encodeURIComponent(texto)}&limit=6&bbox=${CAJA_MX.join(',')}`;
      const r = await fetch(u, { signal: señal });
      if (!r.ok) throw new Error(r.status);
      const d = await r.json();
      return d.features.filter(f => (f.properties.countrycode || 'MX') === 'MX').map(f => {
        const pr = f.properties;
        return Object.assign(etiquetar(pr.name || pr.street || texto, [pr.street && pr.name !== pr.street ? pr.street : '', pr.city || pr.county, pr.state]),
          { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], clase: pr.osm_value || pr.type });
      });
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      const u = `${NOMINATIM}?format=jsonv2&countrycodes=mx&limit=5&accept-language=${S.idioma}&q=${encodeURIComponent(texto)}`;
      const r = await fetch(u, { signal: señal });
      if (!r.ok) throw new Error(r.status);
      return (await r.json()).map(x => Object.assign(etiquetar(x.name || x.display_name.split(',')[0], [x.display_name.split(',').slice(1, 3).join(',')]),
        { lat: Number(x.lat), lon: Number(x.lon), clase: x.type }));
    }
  }

  /* Al escribir de nuevo o al elegir, la búsqueda de lugares pendiente se descarta. */
  function cancelarBusqueda() {
    clearTimeout(relojBusqueda);
    if (controlLugares) controlLugares.abort();
    controlLugares = null;
  }

  function buscar(texto) {
    cancelarBusqueda();
    if (texto.trim().length < 2) {
      sitio('sugerencias').hidden = true;
      return;
    }
    sugerencias = locales(texto);
    pintarSugerencias(null, texto.trim().length >= 3 ? t('b.buscando') : null);
    if (texto.trim().length < 3) return;
    relojBusqueda = setTimeout(async () => {
      controlLugares = new AbortController();
      const propias = sugerencias.filter(s => s.tipo !== 'lugar');
      try {
        const encontrados = await lugares(texto.trim(), controlLugares.signal);
        sugerencias = propias;
        pintarSugerencias(encontrados, null);
      } catch (e) {
        if (e.name === 'AbortError') return;
        sugerencias = propias;
        pintarSugerencias(null, t('b.sinred'));
      }
    }, 450);
  }

  function elegir(s) {
    cancelarBusqueda();
    sitio('sugerencias').hidden = true;
    sitio('buscar').value = s.titulo;
    if (s.tipo === 'estado') {
      cargarEstado(s.e.id, true);
    } else if (s.tipo === 'municipio') {
      abrirMunicipio(s.m.cvemun);
      ir([s.m.lat, s.m.lon], 12);
      cargarEstado(Number(s.m.cvemun.slice(0, 2)));
    } else if (s.tipo === 'proyecto') {
      mostrarProyecto(s.p);
    } else {
      const z = /house|building|street|road|residential|footway|path/.test(s.clase || '') ? 17
        : /suburb|neighbourhood|quarter|hamlet|village/.test(s.clase || '') ? 15
          : /town|city|locality|municipality/.test(s.clase || '') ? 13 : /county|district/.test(s.clase || '') ? 11
            : /state|region/.test(s.clase || '') ? 8 : 14;
      ir([s.lat, s.lon], z);
      cargarEstado(estadoEn(s.lat, s.lon));
    }
  }

  function mostrarProyecto(p) {
    if (!estado.estatus.has(p.g)) estado.estatus.add(p.g);
    if (estado.soloMarcas && !(p.marcas > 0)) estado.soloMarcas = false;
    if ([...estado.evidencia].some(b => (p.evidencia & b) !== b)) estado.evidencia.clear();
    pintarFiltros();
    filtrar();
    abrirProyecto(p);
    ir([p.lat, p.lon], 16);
  }

  /* ------------------------------------------------------------- panel y controles */

  function cerrarPanel() {
    sitio('panel').classList.remove('abierto');
    sitio('abrirPanel').setAttribute('aria-expanded', 'false');
  }

  function controles() {
    const sel = sitio('indicador');
    sel.innerHTML = INDICADORES.map(i => `<option value="${i.id}">${S.esc(en ? i.en : i.es)}</option>`).join('');
    sel.value = estado.ind.id;
    sel.addEventListener('change', () => { estado.ind = INDICADORES.find(i => i.id === sel.value); pintarMunicipios(); });

    const ciclo = sitio('ciclo');
    ciclo.innerHTML = [...datos.resumen.keys()].map(c => `<option>${c}</option>`).join('');
    if (!datos.resumen.has(estado.ciclo)) estado.ciclo = 2024;
    ciclo.value = estado.ciclo;
    ciclo.addEventListener('change', () => { estado.ciclo = Number(ciclo.value); pintarMunicipios(); });

    const selEstado = sitio('estadoObras');
    selEstado.innerHTML = `<option value="0">${S.esc(t('c.estado.elige'))}</option>`
      + [...datos.estados.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, S.locale))
        .map(e => `<option value="${e.id}">${S.esc(e.nombre)}</option>`).join('');
    selEstado.value = estado.entidad;
    selEstado.addEventListener('change', () => cargarEstado(Number(selEstado.value), true));

    sitio('verFiltrados').addEventListener('click', verFiltrados);
    sitio('soloMarcas').addEventListener('click', () => {
      estado.soloMarcas = !estado.soloMarcas;
      sitio('soloMarcas').setAttribute('aria-pressed', String(estado.soloMarcas));
      filtrar();
    });
    sitio('temascaltepec').addEventListener('click', () => {
      const m = datos.municipios.get('15086');
      abrirMunicipio('15086');
      ir([m.lat, m.lon], 12);
      cargarEstado(15);
    });

    const caja = sitio('buscar');
    caja.placeholder = t('b.placeholder');
    caja.setAttribute('aria-label', t('b.placeholder'));
    caja.addEventListener('input', () => buscar(caja.value));
    caja.addEventListener('keydown', ev => {
      const n = sugerencias.length;
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        if (!n) return;
        ev.preventDefault();
        seleccion = (seleccion + (ev.key === 'ArrowDown' ? 1 : n - 1)) % n;
        sitio('sugerencias').querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-selected', String(i === seleccion)));
      } else if (ev.key === 'Enter' && n) {
        ev.preventDefault();
        elegir(sugerencias[Math.max(0, seleccion)]);
      }
    });
    sitio('sugerencias').addEventListener('click', ev => {
      const b = ev.target.closest('button[data-i]');
      if (b) elegir(sugerencias[Number(b.dataset.i)]);
    });
    document.addEventListener('click', ev => { if (!ev.target.closest('.buscador')) sitio('sugerencias').hidden = true; });

    sitio('abrirPanel').addEventListener('click', () => {
      const p = sitio('panel');
      const abrir = !p.classList.contains('abierto');
      p.classList.toggle('abierto', abrir);
      sitio('abrirPanel').setAttribute('aria-expanded', String(abrir));
    });
    sitio('cerrarPanel').addEventListener('click', cerrarPanel);
    sitio('cerrarDetalle').addEventListener('click', cerrarCajon);
    sitio('cerrarComparar').addEventListener('click', cerrarComparar);
    sitio('detalle').addEventListener('click', ev => {
      const e = ev.target.closest('[data-estado]');
      if (e) cargarEstado(Number(e.dataset.estado), true);
      const c = ev.target.closest('[data-comparar]');
      if (c && abierto && abierto.p) comparar(abierto.p, abierto.d);
    });
    document.addEventListener('keydown', ev => {
      if (ev.key !== 'Escape') return;
      if (!cerrarComparar() && !sitio('detalle').hidden) cerrarCajon();
      sitio('sugerencias').hidden = true;
    });
    /* El tema y el modo cambian los colores de los círculos. */
    document.addEventListener('temacambiado', () => {
      if (!capaMunicipios) return;
      pintarMunicipios();
      if (resaltado) resaltado.setStyle({ color: S.color('--marca') });
      const borde = S.oscuro() ? '#111' : '#fff';
      puntosPorEstado.forEach(pr => pr.then(lista => lista.forEach(p => p.m.setStyle({ color: borde }))).catch(() => {}));
    });
  }

  /* Sin ?c=, el país entero en el espacio que dejan libre el buscador, el panel y el botón del teléfono. */
  function vistaInicial() {
    const c = (q.get('c') || '').split(',').map(Number);
    if (c.length === 3 && c.every(Number.isFinite)) mapa.setView([c[0], c[1]], c[2]);
    else if (document.body.classList.contains('figura')) mapa.setView([23.6, -102.5], 5);  // encuadre de la figura del artículo
    else mapa.fitBounds([[14.5, -117.3], [32.7, -86.7]], margenes());
  }

  async function iniciar() {
    S.pintarFijos(TXT);
    document.title = t('titulo');
    try {
      manifiesto = await S.json('datos/manifiesto.json');
      const [resumen, municipios, porCiclo, cruce, fuentes] = await Promise.all(
        ['01_resumen', '02_municipios', '03_municipio_ciclo', '04_cruce_cngmd_2022', 'fuentes'].map(n => S.json(`datos/${n}.json`)));
      datos.resumen = new Map(S.objetos(resumen).map(r => [r.ciclo, r]));
      datos.municipios = new Map(S.objetos(municipios).map(r => [r.cvemun, r]));
      datos.porCiclo = new Map(S.objetos(porCiclo).map(r => [r.cvemun + '|' + r.ciclo, r]));
      datos.cruce = new Map(S.objetos(cruce).map(r => [r.cvemun, r]));
      datos.fuentes = new Map(fuentes.fuentes.map(f => [f.id, f]));
      datos.consultado = fuentes.consultado;
    } catch (e) {
      cargando(t('error', { msg: e.message }));
      return;
    }
    datos.estados = new Map();
    for (const m of datos.municipios.values()) {
      const id = Number(m.cvemun.slice(0, 2));
      if (!datos.estados.has(id)) datos.estados.set(id, { id, nombre: m.entidad, sur: 90, norte: -90, oeste: 180, este: -180 });
      if (m.lat == null) continue;
      const e = datos.estados.get(id);
      e.sur = Math.min(e.sur, m.lat); e.norte = Math.max(e.norte, m.lat);
      e.oeste = Math.min(e.oeste, m.lon); e.este = Math.max(e.este, m.lon);
    }
    datos.indiceMunicipios = [...datos.municipios.values()].filter(m => m.lat != null)
      .map(m => [normal(`${m.municipio} ${m.entidad} ${m.cvemun}`), m]);

    mapa = L.map('mapa', { preferCanvas: true, minZoom: 4, zoomControl: false });
    vistaInicial();
    L.control.zoom({ position: 'topright' }).addTo(mapa);
    mapa.createPane('obras').style.zIndex = 450;
    mapa.on('moveend', setUrl);
    mapa.on('zoomend', () => ajustarRadio());
    /* Al acercarse, se cargan los proyectos del estado que está a la vista. */
    let relojAuto = null;
    mapa.on('moveend', () => {
      clearTimeout(relojAuto);
      relojAuto = setTimeout(() => {
        if (mapa.getZoom() < 9) return;
        const c = mapa.getCenter();
        const id = estadoEn(c.lat, c.lng);
        if (id && id !== estado.entidad) cargarEstado(id);
      }, 500);
    });

    const pobMax = Math.max(...[...datos.municipios.values()].map(m => m.pobtot || 0));
    capaMunicipios = L.featureGroup();
    [...datos.municipios.values()]
      .filter(m => m.lat != null)
      .sort((a, b) => b.pobtot - a.pobtot)
      .forEach(m => {
        const c = L.circleMarker([m.lat, m.lon], { radius: 2 + 9 * Math.sqrt((m.pobtot || 0) / pobMax) });
        c.cvemun = m.cvemun;
        c.on('click', () => abrirMunicipio(m.cvemun));
        c.addTo(capaMunicipios);
      });
    capaMunicipios.addTo(mapa);

    controles();
    pintarMunicipios();
    if (estado.entidad) cargarEstado(estado.entidad, !q.get('c'));
    /* ?folio= abre la ficha de un proyecto del estado cargado, para compartirlo; ?comparar=1 abre
       además su antes y ahora (así se capturan las figuras del artículo). */
    const folio = q.get('folio');
    if (folio && estado.entidad) {
      puntosDe(estado.entidad).then(async lista => {
        const p = lista.find(x => x.folio === folio);
        if (!p) return;
        await abrirProyecto(p);
        if (!q.get('c')) ir([p.lat, p.lon], 16);
        if (q.get('comparar') === '1' && abierto && abierto.p === p) comparar(p, abierto.d);
      }).catch(() => {});
    }
    MapaTeselas.montar(mapa, { maxZoom: 19 });
  }

  iniciar();
})();
