/* Las consultas detrás del mapa, y la comparación del lago contra el almacén tal como la
   escribió lakehouse/verificacion/verificar_lago.py. */
(function () {
  'use strict';

  const S = window.Sitio;
  const TXT = {
    es: {
      titulo: 'Consultas al lago y al almacén',
      lema: 'Lo que muestra el mapa es el resultado de estas consultas. Cada una se puede repetir en la base de datos.',
      'lago.titulo': 'El lago contra el almacén',
      'lago.texto': 'Las mismas consultas, escritas una vez para PostgreSQL y otra para DuckDB sobre el lago, dan resultados idénticos byte por byte.',
      'lago.nota': 'Milisegundos: media y percentil 95 de {n} repeticiones tras una de calentamiento. PostgreSQL {pg} con su configuración por omisión; DuckDB {duck} con {hilos} hilos; {anfitrion}.',
      'capas.titulo': 'Las consultas detrás de cada capa',
      'capas.texto': 'Con el almacén y el lago levantados, estos comandos repiten cada consulta y comparan el sitio con las bases de datos.',
      consulta: 'Consulta', filas: 'Filas', igual: 'Igual', si: 'sí', no: 'NO',
      'filas.n': '{n} filas', primeras: 'Ver las primeras {n} filas', sql: 'Ver SQL', comando: 'Comando',
      'motor.pg': 'PostgreSQL (almacén)', 'motor.duck': 'DuckDB sobre el lago',
    },
    en: {
      titulo: 'Queries to the lake and the warehouse',
      lema: 'What the map shows is the result of these queries. Each one can be repeated in the database.',
      'lago.titulo': 'The lake against the warehouse',
      'lago.texto': 'The same queries, written once for PostgreSQL and once for DuckDB over the lake, return results that are identical byte by byte.',
      'lago.nota': 'Milliseconds: mean and 95th percentile of {n} runs after one warm-up run. PostgreSQL {pg} with its default configuration; DuckDB {duck} with {hilos} threads; {anfitrion}.',
      'capas.titulo': 'The queries behind each layer',
      'capas.texto': 'With the warehouse and the lake running, these commands repeat every query and compare the site with the databases.',
      consulta: 'Query', filas: 'Rows', igual: 'Equal', si: 'yes', no: 'NO',
      'filas.n': '{n} rows', primeras: 'Show the first {n} rows', sql: 'Show SQL', comando: 'Command',
      'motor.pg': 'PostgreSQL (warehouse)', 'motor.duck': 'DuckDB over the lake',
    },
  };
  const t = (k, v) => S.t(TXT, k, v);
  /* En español se usa el comentario de cada consulta; esto es su traducción. */
  const RESUMEN_EN = {
    '01_resumen.pg.sql': 'Summary by fiscal year of what the warehouse holds: states, municipalities, projects, amounts and how many projects each criterion flags. The criteria apply to investment projects only; they flag what to review and do not prove an irregularity.',
    '02_municipios.duck.sql': 'The municipalities of the 2020 Census at the point of their seat (ITER locality 0001), with their population and CONEVAL\'s 2020 social deprivation level. The lake has no municipal polygons, so the map draws one point per municipality.',
    '03_municipio_ciclo.pg.sql': 'By municipality and fiscal year: projects, amounts and how many each criterion flags. Paid per inhabitant divides by the 2020 population. `evaluados` counts investment projects, the only ones the criteria apply to.',
    '04_cruce_cngmd_2022.duck.sql': 'Works contracts in 2022 according to two official sources: what each municipality declared to INEGI in the 2023 CNGMD, and the works contracts SHCP records with a municipality as the contracting party. A difference does not prove an irregularity: the CNGMD covers all municipal resources and SHCP only federally funded spending.',
    '06_enlaces_edomex_2024.duck.sql': 'Links that the agency published with SHCP for the contracts of each project in the State of Mexico in 2024: case files, documents or photographs. They are shown as reported; nobody has reviewed what they contain.',
    '05_obras_edomex_2024.pg.sql':'Projects in the State of Mexico in fiscal year 2024, at the point the reporting agency gave (the mean of its coordinates inside the country). Flags C1 to C4 ask for a review; they do not prove an irregularity. Contractor names are not included.',
  };
  const PASOS = [
    'docker compose -f docker/compose.yml up -d db',
    'docker compose -f lakehouse/compose.yml up -d',
    'lakehouse/.venv/Scripts/python lakehouse/verificacion/verificar_capas.py',
  ].join('\n');

  function celda(v) {
    const s = v == null ? '' : String(v);
    const n = typeof v === 'number';
    return `<td${n ? ' class="n"' : ''}>${S.esc(s.length > 60 ? s.slice(0, 60) + '…' : s)}</td>`;
  }

  function lago(ev) {
    const cab = [t('consulta'), t('filas'), 'SHA-256', t('igual'), 'PostgreSQL ms', 'p95', 'DuckDB ms', 'p95']
      .map(x => `<th>${S.esc(x)}</th>`).join('');
    const filas = Object.entries(ev.consultas).map(([k, r]) => `<tr><td>${S.esc(k)}</td>${celda(r.filas)}
      <td><code>${r.sha256.slice(0, 16)}…</code></td><td>${r.igual ? t('si') : t('no')}</td>
      ${celda(r.pg_ms)}${celda(r.pg_p95)}${celda(r.lago_ms)}${celda(r.lago_p95)}</tr>`).join('');
    document.getElementById('lago').innerHTML = `<table><thead><tr>${cab}</tr></thead><tbody>${filas}</tbody></table>`;
    const e = ev.entorno;
    document.getElementById('lagoNota').textContent = t('lago.nota', { n: e.repeticiones, pg: e.postgresql,
      duck: e.duckdb, hilos: e.hilos_duckdb, anfitrion: e.anfitrion });
  }

  function tarjeta(c, man) {
    const cmd = c.motor === 'pg'
      ? `docker exec -i obras-publicas-db-1 psql -U obras -d obras_publicas < lakehouse/capas/${c.consulta}`
      : `lakehouse/.venv/Scripts/python lakehouse/consultas/lago.py lakehouse/capas/${c.consulta}`;
    const resumen = (S.idioma === 'en' && RESUMEN_EN[c.consulta])
      || c.sql.split('\n').filter(l => l.startsWith('--')).map(l => l.replace(/^--\s?/, '')).join(' ');
    return `<section class="panel tarjeta">
      <h2 class="mono">${S.esc(c.consulta)}</h2>
      <p>${S.esc(resumen)}</p>
      <p class="meta">${S.esc(t('motor.' + c.motor))} · ${S.esc(t('filas.n', { n: S.numero(c.filas) }))} · ${S.esc(man.generado_en)} · SHA-256 <code>${c.sha256_datos.slice(0, 16)}…</code></p>
      <pre>${S.esc(cmd)}</pre>
      <details data-datos="${S.esc(c.datos)}"><summary>${S.esc(t('primeras', { n: Math.min(10, c.filas) }))}</summary><div class="tabla"></div></details>
      <details><summary>${S.esc(t('sql'))}</summary><pre>${S.esc(c.sql)}</pre></details>
    </section>`;
  }

  /* Las filas se bajan solo al abrir la tarjeta: la capa de obras pesa varios MB. */
  function alAbrir(det) {
    det.addEventListener('toggle', async () => {
      const caja = det.querySelector('.tabla');
      if (!det.open || caja.innerHTML) return;
      const capa = await S.json('datos/' + det.dataset.datos);
      const cab = capa.columnas.map(x => `<th>${S.esc(x)}</th>`).join('');
      const cuerpo = capa.filas.slice(0, 10).map(f => `<tr>${f.map(celda).join('')}</tr>`).join('');
      caja.innerHTML = `<table><thead><tr>${cab}</tr></thead><tbody>${cuerpo}</tbody></table>`;
    });
  }

  async function iniciar() {
    S.pintarFijos(TXT);
    document.title = t('titulo');
    document.getElementById('pasos').textContent = PASOS;
    const status = document.getElementById('estado');
    try {
      const man = await S.json('datos/manifiesto.json');
      lago(await S.json('datos/' + man.evidencia.datos));
      document.getElementById('lista').innerHTML = man.consultas.map(c => tarjeta(c, man)).join('');
      document.querySelectorAll('details[data-datos]').forEach(alAbrir);
      status.hidden = true;
    } catch (e) {
      status.textContent = t('error', { msg: e.message });
    }
  }

  iniciar();
})();
