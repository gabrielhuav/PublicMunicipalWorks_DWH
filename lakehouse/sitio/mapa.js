/* Mapa del lago de datos de obra pública federalizada.

   Todo lo que dibuja viene de datos/, que lakehouse/etl/exportar_capas.py genera con las
   consultas de lakehouse/capas/. Aquí no hay cifras escritas a mano: solo se decide cómo
   pintarlas. La URL admite ?ind=, ?ciclo=, ?obras=1, ?c=lat,lng,zoom, ?lang=, ?teselas= y
   ?vista=figura, la vista limpia para las figuras del artículo. */
(function () {
  'use strict';

  const S = window.Sitio;
  const q = new URLSearchParams(location.search);

  const TXT = {
    es: {
      titulo: 'Obra pública federalizada en México, 2020-2025',
      lema: 'Lago de datos con registros oficiales de SHCP, INEGI y CONEVAL. Cada capa es el resultado de una consulta a la base de datos, no una copia aparte.',
      'c.indicador': 'Indicador por municipio', 'c.ciclo': 'Ciclo',
      'c.obras': 'Proyectos de 2024', 'c.estado': 'Estado de los proyectos',
      'c.obras.nota': 'Un punto por proyecto, donde lo ubicó la dependencia que lo reporta. Se carga un estado a la vez.',
      'd.verestado': 'Ver los proyectos de 2024 de {estado}',
      'b.titulo': 'Buscar', 'b.placeholder': 'Municipio, proyecto o folio', 'b.nada': 'Sin resultados.',
      'b.nota': 'Busca municipios de todo el país y proyectos del estado cargado, por nombre, folio o clasificación.',
      'fu.imagen': 'Imagen publicada por la dependencia',
      'cmp.cerrar': 'Cerrar', 'cmp.cargando': 'Cargando…', 'cmp.error': 'No se pudo consultar el historial de Esri.',
      'cmp.antes': 'Antes: versión publicada el {fecha}, previa al inicio del proyecto ({inicio}).',
      'cmp.sinantes': 'Esri no tiene una versión publicada antes del inicio del proyecto ({inicio}).',
      'cmp.sinfecha': 'El proyecto no trae fecha de inicio.',
      'cmp.reciente': 'Ahora: versión más reciente, publicada el {fecha}. Término reportado: {termino}.',
      'cmp.nota': 'Esri fecha cada versión al publicarla; la toma de cada lugar puede ser anterior y repetirse entre versiones. El círculo amarillo es el punto que reportó la dependencia. Las imágenes enseñan el lugar; no prueban la obra.',
      'c.temascaltepec': 'Ir a Temascaltepec',
      'n.entidades': 'Entidades', 'n.municipios': 'Municipios con proyectos', 'n.proyectos': 'Proyectos',
      'n.aprobado': 'Aprobado', 'n.pagado': 'Pagado', 'n.evaluados': 'Proyectos de inversión',
      'n.dibujados': 'Municipios en el mapa', 'n.de': '{n} de {total}',
      'nota.cortes': 'Los colores dividen en cinco grupos iguales a los municipios con valor mayor que cero en el ciclo elegido.',
      'nota.revisar': 'Marca un proyecto para revisarlo; no prueba una irregularidad. Se aplica solo a proyectos de inversión.',
      'nota.2025': '2025 tiene {n} proyectos y 2024 tiene {m}. No se ha verificado por qué la fuente trae menos; compara ese ciclo con cautela.',
      'nota.fijo': 'Este indicador tiene un solo año; el ciclo no lo cambia.',
      'nota.sincab': '{n} municipios no tienen cabecera en ITER y no se dibujan.',
      'ley.cero': '0', 'ley.hasta': 'hasta {b}', 'ley.entre': '{a} a {b}', 'ley.mas': 'más de {a}',
      'ley.tam': 'El tamaño del círculo crece con la población.',
      'ley.obras': 'Proyectos de {estado}, 2024',
      'o.titulo': 'De dónde sale esta capa', 'o.texto': '{sql}, en {motor}: {filas} filas, exportadas el {fecha}. SHA-256 {hash}…',
      'o.sql': 'Ver la consulta', 'o.cmd': 'Para ver lo mismo en la base de datos:',
      'o.verif': 'lakehouse/verificacion/verificar_capas.py repite la consulta y compara el resultado con este archivo, byte por byte.',
      'motor.pg': 'PostgreSQL (almacén)', 'motor.duck': 'DuckDB sobre el lago',
      'd.entidad': 'Entidad', 'd.pob': 'Población 2020', 'd.grado': 'Rezago social 2020', 'd.irs': 'Índice de rezago social',
      'd.ciclo': 'Ciclo {c}', 'd.proyectos': 'Proyectos', 'd.aprobado': 'Aprobado', 'd.pagado': 'Pagado',
      'd.pagado_hab': 'Pagado por habitante', 'd.fais': 'Del FAIS', 'd.evaluados': 'Proyectos de inversión',
      'd.c1': 'C1 costo atípico', 'd.c2': 'C2 retraso', 'd.c3': 'C3 avance bajo, pago alto', 'd.c4': 'C4 pago sobre avance',
      'd.cngmd': 'Contratos de obra 2022', 'd.cngmd.n': 'CNGMD {a}, SHCP {b}', 'd.sinciclo': 'Sin proyectos en este ciclo.',
      'd.folio': 'Folio', 'd.clasif': 'Clasificación', 'd.estatus': 'Estatus', 'd.municipio': 'Municipio',
      'd.fisico': 'Avance físico', 'd.financiero': 'Avance financiero', 'd.contratos': 'Contratos', 'd.marcas': 'Marcas',
      'd.ninguna': 'ninguna', 'd.noaplica': 'no aplica',
      'e.Terminado': 'Terminado', 'e.En Ejecución': 'En ejecución', 'e.Cancelado': 'Cancelado', 'e.otro': 'Otro estatus',
      'f.titulo': 'Mostrar proyectos', 'f.marcas': 'Solo con alguna marca C1 a C4',
      'f.conteo': 'Se ven {n} de {total} proyectos.',
      'fu.titulo': 'Fuente oficial', 'fu.folio': 'Busca el folio {folio} en el archivo {archivo} de SHCP (SHA-256 {sha}…), tal como se descargó el {fecha}.',
      'fu.mun': 'Busca la clave {cvemun} en estos archivos oficiales:',
      'fu.pob': 'Población: INEGI, Censo 2020', 'fu.rezago': 'Rezago social: CONEVAL 2020',
      'fu.shcp': 'Proyectos y montos: SHCP', 'fu.cngmd': 'Contratos 2022: INEGI, CNGMD 2023',
      'fu.docs': 'Documentos que reportó la dependencia ({n})', 'fu.mas': 'y {n} más.',
      'fu.docs.nota': 'Enlaces tal como los publicó la dependencia en SHCP; nadie revisó lo que contienen. Se omiten los que llevan la cuenta de correo de quien los subió.',
      'fu.sindocs': 'No hay enlaces publicables de la dependencia para este proyecto.', 'fu.cargando': 'Cargando enlaces…',
      'sat.boton': 'Comparar en imagen de satélite: antes y ahora',
      'sat.nota': 'Imágenes de Esri Wayback, con la fecha en que Esri publicó cada versión.',
    },
    en: {
      titulo: 'Federally funded public works in Mexico, 2020-2025',
      lema: 'A data lake of official records from SHCP, INEGI and CONEVAL. Every layer is the result of a query to the database, not a separate copy.',
      'c.indicador': 'Indicator by municipality', 'c.ciclo': 'Fiscal year',
      'c.obras': 'Projects in 2024', 'c.estado': 'State of the projects',
      'c.obras.nota': 'One point per project, where the reporting agency placed it. One state is loaded at a time.',
      'd.verestado': 'See the 2024 projects of {estado}',
      'b.titulo': 'Search', 'b.placeholder': 'Municipality, project or folio', 'b.nada': 'No results.',
      'b.nota': 'Searches municipalities across the country and projects of the loaded state, by name, folio or classification.',
      'fu.imagen': 'Image published by the agency',
      'cmp.cerrar': 'Close', 'cmp.cargando': 'Loading…', 'cmp.error': "Esri's archive could not be reached.",
      'cmp.antes': 'Before: release published on {fecha}, prior to the project start ({inicio}).',
      'cmp.sinantes': 'Esri has no release published before the project start ({inicio}).',
      'cmp.sinfecha': 'The project has no start date.',
      'cmp.reciente': 'Now: latest release, published on {fecha}. Reported end: {termino}.',
      'cmp.nota': 'Esri dates each release when it is published; the capture of a given place may be older and repeat across releases. The yellow circle is the point the agency reported. The images show the place; they do not prove the work.',
      'c.temascaltepec': 'Go to Temascaltepec',
      'n.entidades': 'States', 'n.municipios': 'Municipalities with projects', 'n.proyectos': 'Projects',
      'n.aprobado': 'Approved', 'n.pagado': 'Paid', 'n.evaluados': 'Investment projects',
      'n.dibujados': 'Municipalities on the map', 'n.de': '{n} of {total}',
      'nota.cortes': 'Colours split the municipalities with a value above zero in the chosen year into five equal groups.',
      'nota.revisar': 'It flags a project for review; it does not prove an irregularity. It applies to investment projects only.',
      'nota.2025': '2025 has {n} projects and 2024 has {m}. Why the source holds fewer has not been verified; compare that year with care.',
      'nota.fijo': 'This indicator covers a single year; the fiscal year selector does not change it.',
      'nota.sincab': '{n} municipalities have no seat in ITER and are not drawn.',
      'ley.cero': '0', 'ley.hasta': 'up to {b}', 'ley.entre': '{a} to {b}', 'ley.mas': 'over {a}',
      'ley.tam': 'Circle size grows with population.',
      'ley.obras': 'Projects in {estado}, 2024',
      'o.titulo': 'Where this layer comes from', 'o.texto': '{sql}, on {motor}: {filas} rows, exported on {fecha}. SHA-256 {hash}…',
      'o.sql': 'Show the query', 'o.cmd': 'To see the same result in the database:',
      'o.verif': 'lakehouse/verificacion/verificar_capas.py repeats the query and compares the result with this file, byte by byte.',
      'motor.pg': 'PostgreSQL (warehouse)', 'motor.duck': 'DuckDB over the lake',
      'd.entidad': 'State', 'd.pob': 'Population 2020', 'd.grado': 'Social deprivation 2020', 'd.irs': 'Social deprivation index',
      'd.ciclo': 'Fiscal year {c}', 'd.proyectos': 'Projects', 'd.aprobado': 'Approved', 'd.pagado': 'Paid',
      'd.pagado_hab': 'Paid per inhabitant', 'd.fais': 'From FAIS', 'd.evaluados': 'Investment projects',
      'd.c1': 'C1 atypical cost', 'd.c2': 'C2 delay', 'd.c3': 'C3 low progress, high payment', 'd.c4': 'C4 payment above progress',
      'd.cngmd': 'Works contracts 2022', 'd.cngmd.n': 'CNGMD {a}, SHCP {b}', 'd.sinciclo': 'No projects in this year.',
      'd.folio': 'Folio', 'd.clasif': 'Classification', 'd.estatus': 'Status', 'd.municipio': 'Municipality',
      'd.fisico': 'Physical progress', 'd.financiero': 'Financial progress', 'd.contratos': 'Contracts', 'd.marcas': 'Flags',
      'd.ninguna': 'none', 'd.noaplica': 'not applicable',
      'e.Terminado': 'Completed', 'e.En Ejecución': 'In progress', 'e.Cancelado': 'Cancelled', 'e.otro': 'Other status',
      'f.titulo': 'Show projects', 'f.marcas': 'Only those with a C1 to C4 flag',
      'f.conteo': 'Showing {n} of {total} projects.',
      'fu.titulo': 'Official source', 'fu.folio': "Look up folio {folio} in SHCP's file {archivo} (SHA-256 {sha}…), as downloaded on {fecha}.",
      'fu.mun': 'Look up code {cvemun} in these official files:',
      'fu.pob': 'Population: INEGI, 2020 Census', 'fu.rezago': 'Social deprivation: CONEVAL 2020',
      'fu.shcp': 'Projects and amounts: SHCP', 'fu.cngmd': 'Contracts 2022: INEGI, CNGMD 2023',
      'fu.docs': 'Documents reported by the agency ({n})', 'fu.mas': 'and {n} more.',
      'fu.docs.nota': "Links as the agency published them with SHCP; nobody has reviewed what they contain. Links that carry the uploader's e-mail account are left out.",
      'fu.sindocs': 'There are no publishable links from the agency for this project.', 'fu.cargando': 'Loading links…',
      'sat.boton': 'Compare in satellite imagery: before and now',
      'sat.nota': 'Esri Wayback imagery, dated by when Esri published each release.',
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
  /* En modo oscuro el valor alto es el más luminoso, para que destaque sobre el fondo. */
  const OSCURO = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  const SECUENCIA = OSCURO ? ['#1d4744', '#2a6e69', '#3d9a92', '#68c7bc', '#b3efe6']
                           : ['#c8e6e4', '#8ccbc6', '#4fa9a3', '#25807b', '#0b5450'];
  const ORDINAL = OSCURO ? ['#4a3426', '#7a4524', '#b65a26', '#ec8a3a', '#ffd08a']
                         : ['#fee8c8', '#fdbb84', '#fc8d59', '#e34a33', '#b30000'];
  const CERO = OSCURO ? '#3a414a' : '#e2e5e9';
  const ESTATUS = { Terminado: '#2e7d32', 'En Ejecución': '#1565c0', Cancelado: '#c62828' };
  const OTRO = '#757575';

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
    { id: 'rezago', capa: '02_municipios', fijo: true, valor: r => r.grado,
      categorias: GRADOS.map((g, i) => [g, GRADOS_EN[g], ORDINAL[i]]),
      es: 'Grado de rezago social, 2020', en: 'Social deprivation level, 2020',
      nes: 'CONEVAL, índice de rezago social municipal 2020.', nen: 'CONEVAL, 2020 municipal social deprivation index.' },
    { id: 'cngmd', capa: '04_cruce_cngmd_2022', fijo: true, valor: r => r.relacion, categorias: RELACIONES,
      es: 'Contratos de obra 2022: INEGI contra SHCP', en: 'Works contracts 2022: INEGI against SHCP',
      nes: 'Lo que el municipio declaró en el CNGMD 2023 contra los contratos de obra que SHCP registra con el municipio como convocante. Una diferencia no prueba irregularidad: el CNGMD cubre todos los recursos del municipio y SHCP solo el gasto federalizado.',
      nen: 'What the municipality declared in the 2023 CNGMD against the works contracts SHCP records with the municipality as the contracting party. A difference does not prove an irregularity: the CNGMD covers all municipal resources and SHCP only federally funded spending.' },
  ];

  /* Grupos del filtro de proyectos: los tres estatus con color propio y el resto juntos. */
  const GRUPOS = ['Terminado', 'En Ejecución', 'Cancelado', 'otro'];
  const grupo = o => (ESTATUS[o.estatus] ? o.estatus : 'otro');
  const conMarca = o => !!(o.c1 || o.c2 || o.c3 || o.c4);

  const estado = {
    ind: INDICADORES.find(i => i.id === q.get('ind')) || INDICADORES[0],
    ciclo: Number(q.get('ciclo')) || 2024,
    obras: q.get('obras') === '1',
    estatus: new Set((q.get('estatus') || GRUPOS.join(',')).split(',').filter(g => GRUPOS.includes(g))),
    soloMarcas: q.get('marcas') === '1',
    entidadObras: Math.min(32, Math.max(1, Number(q.get('estado')) || 15)),
  };
  const datos = {};
  let manifiesto, mapa, capaMunicipios, capaObras, marcadores = [], promesaEnlaces = null;
  let obraPorFolio = new Map(), indiceObras = [], indiceMunicipios = [], resultados = [], pedidoObras = 0;
  const dosCifras = n => String(n).padStart(2, '0');
  const normal = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const IMAGEN = /\.(jpe?g|png|gif|webp)(\?|$)/i;

  if (q.get('vista') === 'figura') document.body.classList.add('figura');

  function setUrl() {
    const u = new URL(location.href);
    u.searchParams.set('ind', estado.ind.id);
    u.searchParams.set('ciclo', estado.ciclo);
    if (estado.obras) u.searchParams.set('obras', '1'); else u.searchParams.delete('obras');
    if (estado.obras) u.searchParams.set('estado', estado.entidadObras); else u.searchParams.delete('estado');
    if (estado.obras && estado.estatus.size < GRUPOS.length) u.searchParams.set('estatus', [...estado.estatus].join(','));
    else u.searchParams.delete('estatus');
    if (estado.obras && estado.soloMarcas) u.searchParams.set('marcas', '1'); else u.searchParams.delete('marcas');
    if (mapa) {
      const c = mapa.getCenter();
      u.searchParams.set('c', `${c.lat.toFixed(4)},${c.lng.toFixed(4)},${mapa.getZoom()}`);
    }
    history.replaceState(null, '', u.toString());
  }

  /* Quintiles de los valores mayores que cero; el cero es su propia clase. */
  function cortes(valores) {
    const v = valores.filter(x => x != null && x > 0).sort((a, b) => a - b);
    if (!v.length) return [];
    const b = [0.2, 0.4, 0.6, 0.8].map(p => v[Math.min(v.length - 1, Math.floor(p * v.length))]);
    return b.filter((x, i) => i === 0 || x > b[i - 1]);
  }

  function color(ind, v, b) {
    if (v == null) return null;
    if (ind.categorias) {
      const c = ind.categorias.find(x => x[0] === v);
      return c ? c[2] : null;
    }
    if (v <= 0) return CERO;
    let i = 0;
    while (i < b.length && v > b[i]) i++;
    return SECUENCIA[Math.round(i * (SECUENCIA.length - 1) / Math.max(1, b.length))];
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
    const b = ind.categorias ? [] : cortes([...datos.municipios.keys()].map(k => valor(ind, k)));
    capaMunicipios.eachLayer(m => {
      const c = color(ind, valor(ind, m.cvemun), b);
      m.setStyle(c ? { fillColor: c, fillOpacity: 0.85, color: 'rgba(0,0,0,.35)', weight: 0.6 }
                   : { fillOpacity: 0, color: '#9aa3ad', weight: 1.2 });
    });
    leyenda(ind, b);
    nota();
    origen();
    conteos();
    setUrl();
  }

  function leyenda(ind, b) {
    document.getElementById('leyendaTitulo').textContent = en ? ind.en : ind.es;
    const filas = [];
    const item = (c, txt) => filas.push(`<div class="ley"><i style="background:${c}"></i>${S.esc(txt)}</div>`);
    if (ind.categorias) {
      ind.categorias.forEach(c => item(c[2], en ? c[1] : c[0]));
    } else {
      const f = ind.formato;
      item(CERO, t('ley.cero'));
      b.forEach((x, i) => {
        const cl = SECUENCIA[Math.round(i * (SECUENCIA.length - 1) / Math.max(1, b.length))];
        item(cl, i === 0 ? t('ley.hasta', { b: f(x) }) : t('ley.entre', { a: f(b[i - 1]), b: f(x) }));
      });
      if (b.length) item(SECUENCIA[SECUENCIA.length - 1], t('ley.mas', { a: f(b[b.length - 1]) }));
    }
    filas.push(`<div class="ley"><i class="hueco"></i>${S.esc(t('sindato'))}</div>`);
    filas.push(`<p class="nota">${S.esc(t('ley.tam'))}</p>`);
    if (estado.obras) {
      filas.push(`<p class="nota"><b>${S.esc(t('ley.obras', { estado: datos.estados.get(estado.entidadObras) }))}</b></p>`);
      Object.entries(ESTATUS).forEach(([k, c]) => item(c, t('e.' + k)));
      item(OTRO, t('e.otro'));
    }
    document.getElementById('leyenda').innerHTML = filas.join('');
  }

  function nota() {
    const ind = estado.ind;
    const partes = [en ? ind.nen : ind.nes];
    if (ind.revisar) partes.push(t('nota.revisar'));
    if (ind.fijo) partes.push(t('nota.fijo'));
    else if (!ind.categorias) partes.push(t('nota.cortes'));
    if (!ind.fijo && estado.ciclo === 2025) {
      const r = datos.resumen;
      partes.push(t('nota.2025', { n: S.numero(r.get(2025).proyectos), m: S.numero(r.get(2024).proyectos) }));
    }
    document.getElementById('notaIndicador').textContent = partes.join(' ');
    document.getElementById('ciclo').disabled = !!ind.fijo;
  }

  function bloqueOrigen(nombre) {
    const c = manifiesto.consultas.find(x => x.datos === nombre + '.json');
    if (!c) return '';
    const cmd = c.motor === 'pg'
      ? `docker exec -i obras-publicas-db-1 psql -U obras -d obras_publicas < lakehouse/capas/${c.consulta}`
      : `lakehouse/.venv/Scripts/python lakehouse/consultas/lago.py lakehouse/capas/${c.consulta}${c.entidad != null ? ` --entidad ${c.entidad}` : ''}`;
    return `<p>${S.esc(t('o.texto', { sql: c.consulta, motor: t('motor.' + c.motor), filas: S.numero(c.filas),
      fecha: manifiesto.generado_en, hash: c.sha256_datos.slice(0, 16) }))}</p>
      <details><summary>${S.esc(t('o.sql'))}</summary><pre>${S.esc(c.sql)}</pre></details>
      <p class="nota">${S.esc(t('o.cmd'))}</p><pre>${S.esc(cmd)}</pre>`;
  }

  function origen() {
    const capas = [estado.ind.capa, '02_municipios'].filter((x, i, a) => a.indexOf(x) === i);
    if (estado.obras) capas.push(`05_obras_2024_${dosCifras(estado.entidadObras)}`, `06_enlaces_2024_${dosCifras(estado.entidadObras)}`);
    document.getElementById('origen').innerHTML = `<h2>${S.esc(t('o.titulo'))}</h2>`
      + capas.map(bloqueOrigen).join('') + `<p class="nota">${S.esc(t('o.verif'))}</p>`;
  }

  function conteos() {
    const r = datos.resumen.get(estado.ciclo);
    const total = datos.municipios.size;
    const dibujados = capaMunicipios.getLayers().length;
    const li = (k, v) => `<li><span>${S.esc(t(k))}</span><b>${S.esc(v)}</b></li>`;
    document.getElementById('conteos').innerHTML = [
      `<li><b>${S.esc(t('d.ciclo', { c: estado.ciclo }))}</b></li>`,
      li('n.entidades', S.numero(r.entidades)), li('n.municipios', S.numero(r.municipios)),
      li('n.proyectos', S.numero(r.proyectos)), li('n.evaluados', S.numero(r.evaluados)),
      li('n.aprobado', S.pesos(r.aprobado)), li('n.pagado', S.pesos(r.pagado)),
      li('n.dibujados', t('n.de', { n: S.numero(dibujados), total: S.numero(total) })),
    ].join('') + (total > dibujados ? `<li class="nota">${S.esc(t('nota.sincab', { n: total - dibujados }))}</li>` : '');
  }

  function tabla(filas) {
    return '<table>' + filas.map(([k, v]) => `<tr><td>${S.esc(k)}</td><td>${S.esc(v)}</td></tr>`).join('') + '</table>';
  }

  function popupMunicipio(cvemun) {
    const m = datos.municipios.get(cvemun);
    const r = datos.porCiclo.get(cvemun + '|' + estado.ciclo);
    const x = datos.cruce.get(cvemun);
    const filas = [
      [t('d.entidad'), m.entidad], [t('d.pob'), S.numero(m.pobtot)],
      [t('d.grado'), m.grado == null ? t('sindato') : (en ? GRADOS_EN[m.grado] : m.grado)],
    ];
    if (x) filas.push([t('d.cngmd'), t('d.cngmd.n', { a: x.contratos_cngmd == null ? t('sindato') : S.numero(x.contratos_cngmd),
      b: S.numero(x.contratos_shcp) })]);
    let html = `<b>${S.esc(m.municipio)}</b> <span class="nota">${S.esc(cvemun)}</span>` + tabla(filas);
    html += `<p><b>${S.esc(t('d.ciclo', { c: estado.ciclo }))}</b></p>`;
    if (!r) return html + `<p>${S.esc(t('d.sinciclo'))}</p>` + botonEstado(cvemun) + fuentesMunicipio(cvemun);
    const de = (a, b) => `${S.numero(a)} / ${S.numero(b)}`;
    return html + tabla([
      [t('d.proyectos'), S.numero(r.proyectos)], [t('d.aprobado'), S.pesos(r.aprobado)],
      [t('d.pagado'), S.pesos(r.pagado)], [t('d.pagado_hab'), S.pesos(r.pagado_hab)],
      [t('d.fais'), de(r.fais, r.proyectos)], [t('d.evaluados'), S.numero(r.evaluados)],
      [t('d.c1'), de(r.c1, r.evaluados)], [t('d.c2'), de(r.c2, r.evaluados)],
      [t('d.c3'), de(r.c3, r.evaluados)], [t('d.c4'), de(r.c4, r.evaluados)],
    ]) + botonEstado(cvemun) + fuentesMunicipio(cvemun);
  }

  /* Enlace a un archivo oficial del manifiesto de fuentes, que el sitio publica copiado. */
  function archivoOficial(id) {
    const f = datos.fuentes.get(id);
    return f ? `<a href="${S.esc(f.url)}" target="_blank" rel="noopener noreferrer">${S.esc(f.url.split('/').pop())}</a>` : '';
  }

  function botonEstado(cvemun) {
    const id = Number(cvemun.slice(0, 2));
    return `<button type="button" class="boton-estado" data-entidad="${id}">`
      + `${S.esc(t('d.verestado', { estado: datos.estados.get(id) }))}</button>`;
  }

  function fuentesMunicipio(cvemun) {
    const ids = [['inegi_iter2020', 'fu.pob'], ['coneval_irs2020', 'fu.rezago'],
                 [`shcp_ef${estado.ciclo}`, 'fu.shcp'], ['inegi_cngmd2023', 'fu.cngmd']];
    return `<div class="fuentes"><b>${S.esc(t('fu.titulo'))}</b><p>${S.esc(t('fu.mun', { cvemun }))}</p><ul class="docs">`
      + ids.map(([id, k]) => `<li>${S.esc(t(k))}: ${archivoOficial(id)}</li>`).join('') + '</ul></div>';
  }

  /* El sitio y el último tramo de la ruta, que suele ser el nombre del archivo: así dos enlaces
     del mismo portal no se ven iguales. */
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

  function fuentesObra(o) {
    const f = datos.fuentes.get('shcp_ef2024');
    let html = `<div class="fuentes"><b>${S.esc(t('fu.titulo'))}</b><p>${t('fu.folio', {
      folio: `<code>${S.esc(o.folio)}</code>`, archivo: archivoOficial('shcp_ef2024'),
      sha: S.esc(f.sha256.slice(0, 16)), fecha: S.esc(datos.consultado) })}</p>`;
    if (!datos.enlaces) {
      html += `<p class="nota">${S.esc(t('fu.cargando'))}</p>`;
    } else {
      const docs = datos.enlaces.get(o.folio) || [];
      if (!docs.length) {
        html += `<p class="nota">${S.esc(t('fu.sindocs'))}</p>`;
      } else {
        /* Las pocas fotos que la dependencia enlazó directamente se enseñan en miniatura. */
        const fotos = docs.filter(u => IMAGEN.test(u)).slice(0, 3);
        html += `<p><b>${S.esc(t('fu.docs', { n: S.numero(docs.length) }))}</b></p>`
          + (fotos.length ? '<div class="miniaturas">' + fotos.map(u => `<a href="${S.esc(u)}" target="_blank" rel="noopener noreferrer nofollow">`
            + `<img src="${S.esc(u)}" alt="${S.esc(t('fu.imagen'))}" loading="lazy" referrerpolicy="no-referrer"></a>`).join('') + '</div>' : '')
          + '<ul class="docs">'
          + docs.slice(0, 6).map(u => `<li><a href="${S.esc(u)}" target="_blank" rel="noopener noreferrer nofollow">${S.esc(etiquetaEnlace(u))}</a></li>`).join('')
          + '</ul>' + (docs.length > 6 ? `<p class="nota">${S.esc(t('fu.mas', { n: S.numero(docs.length - 6) }))}</p>` : '')
          + `<p class="nota">${S.esc(t('fu.docs.nota'))}</p>`;
      }
    }
    return html + `<button type="button" class="boton-sat" data-folio="${S.esc(o.folio)}">${S.esc(t('sat.boton'))}</button>`
      + `<p class="nota">${S.esc(t('sat.nota'))}</p></div>`;
  }

  /* Antes y ahora en el archivo histórico de imágenes de Esri (World Imagery Wayback), público
     y sin clave. "Antes" es la última versión publicada antes de la fecha de inicio del proyecto:
     su toma es, a lo sumo, de ese día, así que es anterior a la obra. */
  const WAYBACK = 'https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json';
  let versionesWayback = null, comparacion = null;

  function wayback() {
    if (!versionesWayback) {
      versionesWayback = fetch(WAYBACK).then(r => r.json()).then(d => Object.entries(d).map(([num, v]) => ({
        num, fecha: ((v.itemTitle || '').match(/\d{4}-\d{2}-\d{2}/) || [])[0],
        url: (v.itemURL || '').replace('{level}', '{z}').replace('{row}', '{y}').replace('{col}', '{x}'),
      })).filter(v => v.fecha && v.url.startsWith('https://')).sort((a, b) => a.fecha.localeCompare(b.fecha)));
      versionesWayback.catch(() => { versionesWayback = null; });
    }
    return versionesWayback;
  }

  function cerrarComparar() {
    const caja = document.getElementById('comparar');
    if (caja.hidden) return;
    caja.hidden = true;
    if (comparacion) comparacion.forEach(m => m.remove());
    comparacion = null;
  }

  async function comparar(o) {
    const caja = document.getElementById('comparar');
    const [pieAntes, pieAhora] = caja.querySelectorAll('figcaption');
    caja.querySelector('h2').textContent = o.nombre;
    pieAntes.textContent = pieAhora.textContent = t('cmp.cargando');
    caja.hidden = false;
    let vs;
    try {
      vs = await wayback();
    } catch (e) {
      pieAntes.textContent = t('cmp.error');
      pieAhora.textContent = '';
      return;
    }
    const ahora = vs[vs.length - 1];
    const antes = o.fecha_inicio ? [...vs].reverse().find(v => v.fecha < o.fecha_inicio) : null;
    if (comparacion) comparacion.forEach(m => m.remove());
    const crear = (id, v) => {
      const m = L.map(id, { zoomControl: false }).setView([o.lat, o.lon], 17);
      if (v) L.tileLayer(v.url, { maxZoom: 19, attribution: 'Esri World Imagery Wayback' }).addTo(m);
      L.circleMarker([o.lat, o.lon], { radius: 9, color: '#ffeb3b', weight: 3, fill: false }).addTo(m);
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
    pieAntes.textContent = antes ? t('cmp.antes', { fecha: antes.fecha, inicio: o.fecha_inicio })
      : (o.fecha_inicio ? t('cmp.sinantes', { inicio: o.fecha_inicio }) : t('cmp.sinfecha'));
    pieAhora.textContent = t('cmp.reciente', { fecha: ahora.fecha, termino: o.fecha_termino || t('sindato') });
  }

  /* Búsqueda por palabras: todas deben aparecer, sin importar acentos ni mayúsculas. */
  function buscar(texto) {
    const lista = document.getElementById('resultados');
    const palabras = normal(texto).split(/\s+/).filter(Boolean);
    if (texto.trim().length < 2 || !palabras.length) {
      lista.hidden = true;
      lista.innerHTML = '';
      return;
    }
    const coincide = s => palabras.every(p => s.includes(p));
    resultados = [
      ...indiceMunicipios.filter(([s]) => coincide(s)).slice(0, 6).map(([, m]) => ({ m })),
      ...indiceObras.filter(([s]) => coincide(s)).slice(0, 10).map(([, x]) => ({ x })),
    ];
    lista.innerHTML = resultados.length ? resultados.map((r, i) => `<li><button type="button" data-i="${i}">`
      + (r.m ? `<b>${S.esc(r.m.municipio)}</b> <span class="nota">${S.esc(r.m.entidad)}</span>`
        : `${S.esc(r.x.o.nombre.length > 70 ? r.x.o.nombre.slice(0, 70) + '…' : r.x.o.nombre)} <span class="nota">${S.esc(r.x.o.folio)}</span>`)
      + '</button></li>').join('') : `<li class="nota">${S.esc(t('b.nada'))}</li>`;
    lista.hidden = false;
  }

  function mostrarObra(x) {
    if (!estado.estatus.has(grupo(x.o))) {
      estado.estatus.add(grupo(x.o));
      pintarFiltros();
    }
    if (estado.soloMarcas && !conMarca(x.o)) {
      estado.soloMarcas = false;
      document.getElementById('soloMarcas').checked = false;
    }
    filtrarObras();
    mapa.setView([x.o.lat, x.o.lon], 16);
    x.m.openPopup();
  }

  function verEstado(id) {
    estado.entidadObras = id;
    estado.obras = true;
    document.getElementById('obras').checked = true;
    document.getElementById('estadoObras').value = id;
    mapa.closePopup();
    ponerObras();
  }

  function popupObra(o) {
    const m = datos.municipios.get(o.cvemun);
    const marcas = o.c1 == null ? t('d.noaplica')
      : (['c1', 'c2', 'c3', 'c4'].filter(k => o[k]).map(k => k.toUpperCase()).join(', ') || t('d.ninguna'));
    return `<b>${S.esc(o.nombre)}</b>` + tabla([
      [t('d.folio'), o.folio], [t('d.clasif'), o.clasificacion], [t('d.estatus'), o.estatus],
      [t('d.municipio'), m ? m.municipio : o.cvemun], [t('d.aprobado'), S.pesos(o.aprobado)],
      [t('d.pagado'), S.pesos(o.pagado)], [t('d.fisico'), o.pct_fisico == null ? t('sindato') : S.numero(o.pct_fisico, 1) + ' %'],
      [t('d.financiero'), o.pct_financiero == null ? t('sindato') : S.numero(o.pct_financiero, 1) + ' %'],
      [t('d.contratos'), S.numero(o.n_contratos)], [t('d.marcas'), marcas],
    ]) + fuentesObra(o);
  }

  /* Los enlaces de los contratos se bajan al abrir la primera ficha, no antes. */
  function cargarEnlaces() {
    const id = estado.entidadObras;
    if (!promesaEnlaces || promesaEnlaces.id !== id) {
      promesaEnlaces = S.json(`datos/06_enlaces_2024_${dosCifras(id)}.json`).then(capa => {
        const porFolio = new Map();
        capa.filas.forEach(([folio, enlace]) => {
          if (!porFolio.has(folio)) porFolio.set(folio, []);
          porFolio.get(folio).push(enlace);
        });
        if (estado.entidadObras === id) datos.enlaces = porFolio;
      }, () => { if (estado.entidadObras === id) datos.enlaces = new Map(); });
      promesaEnlaces.id = id;
    }
    return promesaEnlaces;
  }

  function filtrarObras() {
    capaObras.clearLayers();
    let n = 0;
    marcadores.forEach(({ o, m }) => {
      if (estado.estatus.has(grupo(o)) && (!estado.soloMarcas || conMarca(o))) {
        m.addTo(capaObras);
        n++;
      }
    });
    document.getElementById('filtroConteo').textContent =
      t('f.conteo', { n: S.numero(n), total: S.numero(marcadores.length) });
    setUrl();
  }

  function pintarFiltros() {
    const cuenta = {};
    marcadores.forEach(({ o }) => { cuenta[grupo(o)] = (cuenta[grupo(o)] || 0) + 1; });
    const caja = document.getElementById('filtrosEstatus');
    caja.innerHTML = GRUPOS.map(g => `<label class="casilla"><input type="checkbox" data-grupo="${S.esc(g)}"`
      + `${estado.estatus.has(g) ? ' checked' : ''}> <i class="punto" style="background:${ESTATUS[g] || OTRO}"></i>`
      + `${S.esc(t('e.' + g))} <span class="nota">(${S.numero(cuenta[g] || 0)})</span></label>`).join('');
    caja.querySelectorAll('input').forEach(i => i.addEventListener('change', () => {
      if (i.checked) estado.estatus.add(i.dataset.grupo); else estado.estatus.delete(i.dataset.grupo);
      filtrarObras();
    }));
  }

  /* Los proyectos se cargan por estado: un archivo por estado, del tamaño que el navegador aguanta. */
  async function ponerObras() {
    document.getElementById('filtros').hidden = !estado.obras;
    if (capaObras) mapa.removeLayer(capaObras);
    if (estado.obras) {
      if (!capaObras || capaObras.entidad !== estado.entidadObras) {
        const pedido = ++pedidoObras;
        const id = estado.entidadObras;
        const capa = await S.json(`datos/05_obras_2024_${dosCifras(id)}.json`);
        if (pedido !== pedidoObras) return;
        capaObras = L.layerGroup();
        capaObras.entidad = id;
        datos.enlaces = null;
        obraPorFolio = new Map();
        marcadores = S.objetos(capa).filter(o => o.lat != null).map(o => {
          const m = L.circleMarker([o.lat, o.lon], { pane: 'obras', radius: 3.5, weight: 0.5, color: '#fff',
            fillColor: ESTATUS[o.estatus] || OTRO, fillOpacity: 0.9 });
          m.bindPopup(() => popupObra(o), { maxWidth: 340 });
          m.on('popupopen', () => {
            if (!datos.enlaces) cargarEnlaces().then(() => m.setPopupContent(popupObra(o)));
          });
          const x = { o, m };
          obraPorFolio.set(o.folio, x);
          return x;
        });
        indiceObras = marcadores.map(x => [normal([x.o.nombre, x.o.folio, x.o.clasificacion,
          (datos.municipios.get(x.o.cvemun) || {}).municipio].join(' ')), x]);
        pintarFiltros();
      }
      filtrarObras();
      capaObras.addTo(mapa);
    }
    leyenda(estado.ind, estado.ind.categorias ? [] : cortes([...datos.municipios.keys()].map(k => valor(estado.ind, k))));
    origen();
    setUrl();
  }

  function controles() {
    const sel = document.getElementById('indicador');
    sel.innerHTML = INDICADORES.map(i => `<option value="${i.id}">${S.esc(en ? i.en : i.es)}</option>`).join('');
    sel.value = estado.ind.id;
    sel.addEventListener('change', () => { estado.ind = INDICADORES.find(i => i.id === sel.value); pintarMunicipios(); });

    const ciclo = document.getElementById('ciclo');
    ciclo.innerHTML = [...datos.resumen.keys()].map(c => `<option>${c}</option>`).join('');
    if (!datos.resumen.has(estado.ciclo)) estado.ciclo = 2024;
    ciclo.value = estado.ciclo;
    ciclo.addEventListener('change', () => { estado.ciclo = Number(ciclo.value); pintarMunicipios(); });

    const obras = document.getElementById('obras');
    obras.checked = estado.obras;
    obras.addEventListener('change', () => { estado.obras = obras.checked; ponerObras(); });
    const marcas = document.getElementById('soloMarcas');
    marcas.checked = estado.soloMarcas;
    marcas.addEventListener('change', () => { estado.soloMarcas = marcas.checked; if (capaObras) filtrarObras(); });

    const selEstado = document.getElementById('estadoObras');
    selEstado.setAttribute('aria-label', t('c.estado'));
    selEstado.innerHTML = [...datos.estados.entries()].sort((a, b) => a[0] - b[0])
      .map(([id, n]) => `<option value="${id}">${S.esc(n)}</option>`).join('');
    selEstado.value = estado.entidadObras;
    selEstado.addEventListener('change', () => {
      estado.entidadObras = Number(selEstado.value);
      if (estado.obras) ponerObras(); else setUrl();
    });

    const caja = document.getElementById('buscar');
    caja.placeholder = t('b.placeholder');
    let reloj = null;
    caja.addEventListener('input', () => {
      clearTimeout(reloj);
      reloj = setTimeout(() => buscar(caja.value), 200);
    });
    document.getElementById('resultados').addEventListener('click', ev => {
      const b = ev.target.closest('button[data-i]');
      if (!b) return;
      const r = resultados[Number(b.dataset.i)];
      if (r.m) {
        const c = capaMunicipios.getLayers().find(x => x.cvemun === r.m.cvemun);
        if (c) {
          mapa.setView(c.getLatLng(), 11);
          c.openPopup();
        }
      } else {
        mostrarObra(r.x);
      }
      document.getElementById('resultados').hidden = true;
    });

    document.getElementById('temascaltepec').addEventListener('click', () => {
      const m = capaMunicipios.getLayers().find(x => x.cvemun === '15086');
      mapa.setView(m.getLatLng(), 11);
      m.openPopup();
    });
  }

  function vistaInicial() {
    const c = (q.get('c') || '').split(',').map(Number);
    return c.length === 3 && c.every(Number.isFinite) ? [[c[0], c[1]], c[2]] : [[23.6, -102.5], 5];
  }

  async function iniciar() {
    S.pintarFijos(TXT);
    document.title = t('titulo');
    const status = document.getElementById('estado');
    try {
      manifiesto = await S.json('datos/manifiesto.json');
      const [resumen, municipios, porCiclo, cruce] = await Promise.all(
        ['01_resumen', '02_municipios', '03_municipio_ciclo', '04_cruce_cngmd_2022'].map(n => S.json(`datos/${n}.json`)));
      datos.resumen = new Map(S.objetos(resumen).map(r => [r.ciclo, r]));
      datos.municipios = new Map(S.objetos(municipios).map(r => [r.cvemun, r]));
      datos.porCiclo = new Map(S.objetos(porCiclo).map(r => [r.cvemun + '|' + r.ciclo, r]));
      datos.cruce = new Map(S.objetos(cruce).map(r => [r.cvemun, r]));
      const fuentes = await S.json('datos/fuentes.json');
      datos.fuentes = new Map(fuentes.fuentes.map(f => [f.id, f]));
      datos.consultado = fuentes.consultado;
      datos.estados = new Map([...datos.municipios.values()].map(m => [Number(m.cvemun.slice(0, 2)), m.entidad]));
      indiceMunicipios = [...datos.municipios.values()].filter(m => m.lat != null)
        .map(m => [normal(`${m.municipio} ${m.entidad} ${m.cvemun}`), m]);
    } catch (e) {
      status.textContent = t('error', { msg: e.message });
      return;
    }
    status.hidden = true;

    const [centro, zoom] = vistaInicial();
    mapa = L.map('mapa', { preferCanvas: true, minZoom: 4 }).setView(centro, zoom);
    mapa.createPane('obras').style.zIndex = 450;
    mapa.on('moveend', setUrl);
    /* Botones dentro de las fichas: comparar en satélite y ver los proyectos de un estado. */
    mapa.getContainer().addEventListener('click', ev => {
      const b = ev.target.closest('.boton-sat');
      if (b) {
        const x = obraPorFolio.get(b.dataset.folio);
        if (x) comparar(x.o);
        return;
      }
      const e = ev.target.closest('.boton-estado');
      if (e) verEstado(Number(e.dataset.entidad));
    });
    document.getElementById('cerrarComparar').addEventListener('click', cerrarComparar);
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') cerrarComparar(); });

    const pobMax = Math.max(...[...datos.municipios.values()].map(m => m.pobtot || 0));
    capaMunicipios = L.featureGroup();
    [...datos.municipios.values()]
      .filter(m => m.lat != null)
      .sort((a, b) => b.pobtot - a.pobtot)
      .forEach(m => {
        const c = L.circleMarker([m.lat, m.lon], { radius: 2 + 9 * Math.sqrt((m.pobtot || 0) / pobMax) });
        c.cvemun = m.cvemun;
        c.bindPopup(() => popupMunicipio(m.cvemun), { maxWidth: 320 });
        c.addTo(capaMunicipios);
      });
    capaMunicipios.addTo(mapa);

    controles();
    pintarMunicipios();
    if (estado.obras) ponerObras();
    MapaTeselas.montar(mapa, { maxZoom: 19 });
  }

  iniciar();
})();
