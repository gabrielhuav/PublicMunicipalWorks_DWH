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
      'c.obras': 'Proyectos del Estado de México, 2024',
      'c.obras.nota': 'Un punto por proyecto, donde lo ubicó la dependencia que lo reporta.',
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
      'ley.obras': 'Proyectos del Estado de México, 2024',
      'o.titulo': 'De dónde sale esta capa', 'o.texto': '{sql}, en {motor}: {filas} filas, exportadas el {fecha}. SHA-256 {hash}…',
      'o.sql': 'Ver la consulta', 'o.cmd': 'Para ver lo mismo en la base de datos:',
      'o.verif': 'lakehouse/verificacion/verificar_capas.py repite la consulta y compara el resultado con este archivo, byte por byte.',
      'motor.pg': 'PostgreSQL (almacén)', 'motor.duck': 'DuckDB sobre el lago',
      'tes.titulo': 'Mapa base', 'tes.ninguno': 'Ningún proveedor respondió; los datos se dibujan sin fondo.',
      'tes.usa': 'Usando {n}.',
      'd.entidad': 'Entidad', 'd.pob': 'Población 2020', 'd.grado': 'Rezago social 2020', 'd.irs': 'Índice de rezago social',
      'd.ciclo': 'Ciclo {c}', 'd.proyectos': 'Proyectos', 'd.aprobado': 'Aprobado', 'd.pagado': 'Pagado',
      'd.pagado_hab': 'Pagado por habitante', 'd.fais': 'Del FAIS', 'd.evaluados': 'Proyectos de inversión',
      'd.c1': 'C1 costo atípico', 'd.c2': 'C2 retraso', 'd.c3': 'C3 avance bajo, pago alto', 'd.c4': 'C4 pago sobre avance',
      'd.cngmd': 'Contratos de obra 2022', 'd.cngmd.n': 'CNGMD {a}, SHCP {b}', 'd.sinciclo': 'Sin proyectos en este ciclo.',
      'd.folio': 'Folio', 'd.clasif': 'Clasificación', 'd.estatus': 'Estatus', 'd.municipio': 'Municipio',
      'd.fisico': 'Avance físico', 'd.financiero': 'Avance financiero', 'd.contratos': 'Contratos', 'd.marcas': 'Marcas',
      'd.ninguna': 'ninguna', 'd.noaplica': 'no aplica',
      'e.Terminado': 'Terminado', 'e.En Ejecución': 'En ejecución', 'e.Cancelado': 'Cancelado', 'e.otro': 'Otro estatus',
    },
    en: {
      titulo: 'Federally funded public works in Mexico, 2020-2025',
      lema: 'A data lake of official records from SHCP, INEGI and CONEVAL. Every layer is the result of a query to the database, not a separate copy.',
      'c.indicador': 'Indicator by municipality', 'c.ciclo': 'Fiscal year',
      'c.obras': 'Projects in the State of Mexico, 2024',
      'c.obras.nota': 'One point per project, where the reporting agency placed it.',
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
      'ley.obras': 'Projects in the State of Mexico, 2024',
      'o.titulo': 'Where this layer comes from', 'o.texto': '{sql}, on {motor}: {filas} rows, exported on {fecha}. SHA-256 {hash}…',
      'o.sql': 'Show the query', 'o.cmd': 'To see the same result in the database:',
      'o.verif': 'lakehouse/verificacion/verificar_capas.py repeats the query and compares the result with this file, byte by byte.',
      'motor.pg': 'PostgreSQL (warehouse)', 'motor.duck': 'DuckDB over the lake',
      'tes.titulo': 'Base map', 'tes.ninguno': 'No provider answered; the data are drawn without a background.',
      'tes.usa': 'Using {n}.',
      'd.entidad': 'State', 'd.pob': 'Population 2020', 'd.grado': 'Social deprivation 2020', 'd.irs': 'Social deprivation index',
      'd.ciclo': 'Fiscal year {c}', 'd.proyectos': 'Projects', 'd.aprobado': 'Approved', 'd.pagado': 'Paid',
      'd.pagado_hab': 'Paid per inhabitant', 'd.fais': 'From FAIS', 'd.evaluados': 'Investment projects',
      'd.c1': 'C1 atypical cost', 'd.c2': 'C2 delay', 'd.c3': 'C3 low progress, high payment', 'd.c4': 'C4 payment above progress',
      'd.cngmd': 'Works contracts 2022', 'd.cngmd.n': 'CNGMD {a}, SHCP {b}', 'd.sinciclo': 'No projects in this year.',
      'd.folio': 'Folio', 'd.clasif': 'Classification', 'd.estatus': 'Status', 'd.municipio': 'Municipality',
      'd.fisico': 'Physical progress', 'd.financiero': 'Financial progress', 'd.contratos': 'Contracts', 'd.marcas': 'Flags',
      'd.ninguna': 'none', 'd.noaplica': 'not applicable',
      'e.Terminado': 'Completed', 'e.En Ejecución': 'In progress', 'e.Cancelado': 'Cancelled', 'e.otro': 'Other status',
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

  const estado = {
    ind: INDICADORES.find(i => i.id === q.get('ind')) || INDICADORES[0],
    ciclo: Number(q.get('ciclo')) || 2024,
    obras: q.get('obras') === '1',
  };
  const datos = {};
  let manifiesto, mapa, capaMunicipios, capaObras, porCvemun = {};

  if (q.get('vista') === 'figura') document.body.classList.add('figura');

  function setUrl() {
    const u = new URL(location.href);
    u.searchParams.set('ind', estado.ind.id);
    u.searchParams.set('ciclo', estado.ciclo);
    if (estado.obras) u.searchParams.set('obras', '1'); else u.searchParams.delete('obras');
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
      filas.push(`<p class="nota"><b>${S.esc(t('ley.obras'))}</b></p>`);
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
    const cmd = c.motor === 'pg'
      ? `docker exec -i obras-publicas-db-1 psql -U obras -d obras_publicas < lakehouse/capas/${c.consulta}`
      : `lakehouse/.venv/Scripts/python lakehouse/consultas/lago.py lakehouse/capas/${c.consulta}`;
    return `<p>${S.esc(t('o.texto', { sql: c.consulta, motor: t('motor.' + c.motor), filas: S.numero(c.filas),
      fecha: manifiesto.generado_en, hash: c.sha256_datos.slice(0, 16) }))}</p>
      <details><summary>${S.esc(t('o.sql'))}</summary><pre>${S.esc(c.sql)}</pre></details>
      <p class="nota">${S.esc(t('o.cmd'))}</p><pre>${S.esc(cmd)}</pre>`;
  }

  function origen() {
    const capas = [estado.ind.capa, '02_municipios'].filter((x, i, a) => a.indexOf(x) === i);
    if (estado.obras) capas.push('05_obras_edomex_2024');
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
    if (!r) return html + `<p>${S.esc(t('d.sinciclo'))}</p>`;
    const de = (a, b) => `${S.numero(a)} / ${S.numero(b)}`;
    return html + tabla([
      [t('d.proyectos'), S.numero(r.proyectos)], [t('d.aprobado'), S.pesos(r.aprobado)],
      [t('d.pagado'), S.pesos(r.pagado)], [t('d.pagado_hab'), S.pesos(r.pagado_hab)],
      [t('d.fais'), de(r.fais, r.proyectos)], [t('d.evaluados'), S.numero(r.evaluados)],
      [t('d.c1'), de(r.c1, r.evaluados)], [t('d.c2'), de(r.c2, r.evaluados)],
      [t('d.c3'), de(r.c3, r.evaluados)], [t('d.c4'), de(r.c4, r.evaluados)],
    ]);
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
    ]);
  }

  async function ponerObras() {
    if (!estado.obras) {
      if (capaObras) mapa.removeLayer(capaObras);
    } else {
      if (!capaObras) {
        const capa = await S.json('datos/05_obras_edomex_2024.json');
        capaObras = L.layerGroup();
        S.objetos(capa).forEach(o => {
          if (o.lat == null) return;
          L.circleMarker([o.lat, o.lon], { pane: 'obras', radius: 3.5, weight: 0.5, color: '#fff',
            fillColor: ESTATUS[o.estatus] || OTRO, fillOpacity: 0.9 })
            .bindPopup(() => popupObra(o), { maxWidth: 320 }).addTo(capaObras);
        });
      }
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
    } catch (e) {
      status.textContent = t('error', { msg: e.message });
      return;
    }
    status.hidden = true;

    const [centro, zoom] = vistaInicial();
    mapa = L.map('mapa', { preferCanvas: true, minZoom: 4 }).setView(centro, zoom);
    mapa.createPane('obras').style.zIndex = 450;
    mapa.on('moveend', setUrl);

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

    const tes = document.getElementById('teselas');
    Teselas.iniciar(mapa, id => {
      const p = Teselas.PROVEEDORES.find(x => x.id === id);
      tes.innerHTML = `<h2>${S.esc(t('tes.titulo'))}</h2><p class="nota">${S.esc(p ? t('tes.usa', { n: p.nombre }) : t('tes.ninguno'))}</p>`;
    });
  }

  iniciar();
})();
