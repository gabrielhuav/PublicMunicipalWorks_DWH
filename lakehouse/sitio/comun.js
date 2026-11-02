/* Lo que comparten las páginas: idioma, tema, formato de números y lectura de datos/.
   Se carga en el <head>, para poner el tema y el idioma antes de pintar la página. */
(function () {
  'use strict';

  const CONFERENCIA = 'https://gabrielhuav.github.io/PublicMunicipalWorks_DWH/';
  const TXT = {
    es: {
      marca: 'Obra pública federalizada',
      'nav.mapa': 'Mapa', 'nav.consultas': 'Consultas', 'nav.repo': 'Repositorio', idioma: 'EN', menu: 'Menú',
      'idioma.titulo': 'Read in English',
      'tema.titulo': 'Tema de color', 'tema.guinda': 'Guinda', 'tema.azul': 'Azul',
      'modo.auto': 'Automático', 'modo.claro': 'Claro', 'modo.oscuro': 'Oscuro',
      'modo.titulo': 'Modo: {modo}. Cambiar',
      aviso: `Datos reales de fuentes oficiales. La demostración del capítulo de ICOKG 2026, con obras sintéticas, sigue en <a href="${CONFERENCIA}">su propio sitio</a>; aquí no se mezclan.`,
      cargando: 'Cargando datos…', error: 'No se pudieron cargar los datos: {msg}',
      sindato: 'Sin dato',
    },
    en: {
      marca: 'Federally funded public works',
      'nav.mapa': 'Map', 'nav.consultas': 'Queries', 'nav.repo': 'Repository', idioma: 'ES', menu: 'Menu',
      'idioma.titulo': 'Leer en español',
      'tema.titulo': 'Colour theme', 'tema.guinda': 'Maroon', 'tema.azul': 'Blue',
      'modo.auto': 'Automatic', 'modo.claro': 'Light', 'modo.oscuro': 'Dark',
      'modo.titulo': 'Mode: {modo}. Change',
      aviso: `Real data from official sources. The ICOKG 2026 chapter demonstration, with synthetic works, remains on <a href="${CONFERENCIA}">its own site</a>; the two are not mixed.`,
      cargando: 'Loading data…', error: 'The data could not be loaded: {msg}',
      sindato: 'No data',
    },
  };

  const leer = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } };

  const q = new URLSearchParams(location.search).get('lang');
  const idioma = q === 'en' || q === 'es' ? q : ((navigator.language || '').startsWith('en') ? 'en' : 'es');
  const locale = idioma === 'en' ? 'en-GB' : 'es-MX';
  const html = document.documentElement;
  html.lang = idioma;

  /* Tema guinda o azul, cada uno en modo automático (el del sistema), claro u oscuro. Se recuerdan
     en este navegador. mapa-teselas.js escucha 'temacambiado' para cambiar el mapa base. */
  const MODOS = ['auto', 'claro', 'oscuro'];
  let tema = leer('obraslago-tema') === 'azul' ? 'azul' : 'guinda';
  let modo = MODOS.includes(leer('obraslago-modo')) ? leer('obraslago-modo') : 'auto';
  const sistemaOscuro = () => !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const oscuro = () => modo === 'oscuro' || (modo === 'auto' && sistemaOscuro());

  function aplicarTema() {
    html.setAttribute('data-tema', tema);
    if (modo === 'auto') html.removeAttribute('data-modo'); else html.setAttribute('data-modo', modo);
    document.dispatchEvent(new Event('temacambiado'));
  }
  aplicarTema();
  if (window.matchMedia) {
    const m = matchMedia('(prefers-color-scheme: dark)');
    const avisar = () => { if (modo === 'auto') aplicarTema(); };
    if (m.addEventListener) m.addEventListener('change', avisar); else if (m.addListener) m.addListener(avisar);
  }

  function t(propios, k, v) {
    const s = (propios && propios[idioma] && propios[idioma][k]) || TXT[idioma][k] || k;
    return v ? s.replace(/\{(\w+)\}/g, (m, n) => (n in v ? v[n] : m)) : s;
  }

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function numero(v, decimales) {
    if (v == null) return TXT[idioma].sindato;
    return Number(v).toLocaleString(locale, { maximumFractionDigits: decimales == null ? 0 : decimales });
  }

  function pesos(v) {
    if (v == null) return TXT[idioma].sindato;
    const a = Math.abs(v);
    if (a >= 1e9) return '$' + numero(v / 1e9, 1) + (idioma === 'en' ? ' bn' : ' mil millones');
    if (a >= 1e6) return '$' + numero(v / 1e6, 1) + (idioma === 'en' ? ' m' : ' millones');
    return '$' + numero(v, 0);
  }

  /* Filas de una capa como objetos, con los nombres de columna que dio la consulta. */
  function objetos(capa) {
    return capa.filas.map(f => Object.fromEntries(capa.columnas.map((c, i) => [c, f[i]])));
  }

  async function json(ruta) {
    // no-cache revalida con el servidor: tras publicar, el código nuevo nunca lee datos viejos
    const r = await fetch(ruta, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`${ruta}: ${r.status}`);
    return r.json();
  }

  /* Textos fijos de la página y controles de la barra: idioma, tema y modo. */
  function pintarFijos(propios) {
    document.querySelectorAll('[data-t]').forEach(el => {
      const s = t(propios, el.dataset.t);
      if (el.hasAttribute('data-html')) el.innerHTML = s; else el.textContent = s;
    });
    document.querySelectorAll('[data-t-aria]').forEach(el => el.setAttribute('aria-label', t(propios, el.dataset.tAria)));

    const b = document.getElementById('idioma');
    if (b) {
      b.textContent = TXT[idioma].idioma;
      b.title = b.ariaLabel = TXT[idioma]['idioma.titulo'];
      b.addEventListener('click', () => {
        const u = new URL(location.href);
        u.searchParams.set('lang', idioma === 'en' ? 'es' : 'en');
        location.href = u.toString();
      });
    }
    const botonesTema = document.querySelectorAll('[data-tema-boton]');
    const marcarTema = () => botonesTema.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.temaBoton === tema)));
    botonesTema.forEach(x => x.addEventListener('click', () => {
      tema = x.dataset.temaBoton;
      guardar('obraslago-tema', tema);
      marcarTema();
      aplicarTema();
    }));
    marcarTema();
    const bm = document.getElementById('modo');
    if (bm) {
      const pintarModo = () => {
        bm.textContent = TXT[idioma]['modo.' + modo];
        bm.title = bm.ariaLabel = t(null, 'modo.titulo', { modo: TXT[idioma]['modo.' + modo] });
      };
      bm.addEventListener('click', () => {
        modo = MODOS[(MODOS.indexOf(modo) + 1) % MODOS.length];
        guardar('obraslago-modo', modo);
        pintarModo();
        aplicarTema();
      });
      pintarModo();
    }
    /* En el teléfono, las secciones y los controles caben en un menú. */
    const menu = document.getElementById('abrirMenu');
    if (menu) {
      const barra = menu.closest('.barra');
      const abrir = si => { barra.classList.toggle('abierta', si); menu.setAttribute('aria-expanded', String(si)); };
      menu.addEventListener('click', () => abrir(!barra.classList.contains('abierta')));
      document.addEventListener('click', ev => { if (!ev.target.closest('.barra')) abrir(false); });
      document.addEventListener('keydown', ev => { if (ev.key === 'Escape') abrir(false); });
    }
    /* Los enlaces internos conservan el idioma. */
    document.querySelectorAll('.barra a[href]').forEach(a => {
      if (a.href.startsWith(location.origin) && q) {
        const u = new URL(a.href);
        u.searchParams.set('lang', idioma);
        a.href = u.toString();
      }
    });
  }

  /* Un valor de color del tema actual, como lo calcula la hoja de estilos. */
  const color = nombre => getComputedStyle(html).getPropertyValue(nombre).trim();

  /* Textos del control del mapa base (mapa-teselas.js, el módulo del trabajo 38), que los pide a
     window.I18N.t como en aquel sitio. */
  const TESELAS = {
    es: {
      'teselas.pregunta': '¿No carga el mapa?', 'teselas.probar': 'Probar otro proveedor',
      'teselas.elegir': 'Elegir el proveedor del mapa base', 'teselas.titulo': 'Mapa base',
      'teselas.explica': 'Cada proveedor se comprueba antes de usarlo; si deja de responder, el mapa pasa solo al siguiente. La copia local se sirve desde este mismo sitio y no depende de ningún servidor externo.',
      'teselas.local': 'Copia local', 'teselas.aviso': '{antes} no respondía; ahora el mapa usa {ahora}.',
      'teselas.usando': 'Ahora el mapa usa {nombre}.',
      'teselas.estado.uso': 'en uso', 'teselas.estado.ok': 'disponible',
      'teselas.estado.falla': 'no responde', 'teselas.estado.comprobando': 'comprobando…',
      'teselas.nota.gris': 'gris claro u oscuro; nombres en inglés',
      'teselas.nota.osm': 'nombres en español', 'teselas.nota.calles': 'callejero',
      'teselas.nota.hot': 'estilo humanitario; nombres en español', 'teselas.nota.topo': 'topográfico',
      'teselas.nota.satelite': 'imagen de satélite', 'teselas.nota.carto': 'sólo si no muestra marca de agua',
      'teselas.nota.local': 'Natural Earth, servido desde este sitio',
    },
    en: {
      'teselas.pregunta': 'Map not loading?', 'teselas.probar': 'Try another provider',
      'teselas.elegir': 'Choose the basemap provider', 'teselas.titulo': 'Basemap',
      'teselas.explica': 'Each provider is checked before it is used; if it stops answering, the map moves to the next one on its own. The local copy is served from this same site and depends on no external server.',
      'teselas.local': 'Local copy', 'teselas.aviso': '{antes} was not answering; the map now uses {ahora}.',
      'teselas.usando': 'The map now uses {nombre}.',
      'teselas.estado.uso': 'in use', 'teselas.estado.ok': 'available',
      'teselas.estado.falla': 'not answering', 'teselas.estado.comprobando': 'checking…',
      'teselas.nota.gris': 'light or dark grey; English names',
      'teselas.nota.osm': 'local (Spanish) names', 'teselas.nota.calles': 'street map',
      'teselas.nota.hot': 'humanitarian style', 'teselas.nota.topo': 'topographic',
      'teselas.nota.satelite': 'satellite imagery', 'teselas.nota.carto': 'only if it shows no watermark',
      'teselas.nota.local': 'Natural Earth, served from this site',
    },
  };
  window.I18N = { t: (k, v) => t(TESELAS, k, v) };

  window.Sitio = { idioma, locale, t, esc, numero, pesos, objetos, json, pintarFijos, oscuro, color,
                   tema: () => tema };
})();
