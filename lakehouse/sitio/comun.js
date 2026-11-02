/* Lo que comparten las páginas: idioma, formato de números y lectura de datos/. */
(function () {
  'use strict';

  const CONFERENCIA = 'https://gabrielhuav.github.io/PublicMunicipalWorks_DWH/';
  const TXT = {
    es: {
      'nav.mapa': 'Mapa', 'nav.consultas': 'Consultas', 'nav.repo': 'Repositorio', idioma: 'English',
      aviso: `Datos reales de fuentes oficiales. La demostración del capítulo de ICOKG 2026, con obras sintéticas, sigue en <a href="${CONFERENCIA}">su propio sitio</a>; aquí no se mezclan.`,
      cargando: 'Cargando datos…', error: 'No se pudieron cargar los datos: {msg}',
      sindato: 'Sin dato',
    },
    en: {
      'nav.mapa': 'Map', 'nav.consultas': 'Queries', 'nav.repo': 'Repository', idioma: 'Español',
      aviso: `Real data from official sources. The ICOKG 2026 chapter demonstration, with synthetic works, remains on <a href="${CONFERENCIA}">its own site</a>; the two are not mixed.`,
      cargando: 'Loading data…', error: 'The data could not be loaded: {msg}',
      sindato: 'No data',
    },
  };

  const q = new URLSearchParams(location.search).get('lang');
  const idioma = q === 'en' || q === 'es' ? q : ((navigator.language || '').startsWith('en') ? 'en' : 'es');
  const locale = idioma === 'en' ? 'en-GB' : 'es-MX';

  function t(propios, k, v) {
    const s = (propios[idioma] && propios[idioma][k]) || TXT[idioma][k] || k;
    return v ? s.replace(/\{(\w+)\}/g, (m, n) => (n in v ? v[n] : m)) : s;
  }

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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

  /* Rellena los textos fijos de la página y el botón de idioma. */
  function pintarFijos(propios) {
    document.documentElement.lang = idioma;
    document.querySelectorAll('[data-t]').forEach(el => {
      const s = t(propios, el.dataset.t);
      if (el.hasAttribute('data-html')) el.innerHTML = s; else el.textContent = s;
    });
    const b = document.getElementById('idioma');
    if (b) {
      b.textContent = TXT[idioma].idioma;
      b.addEventListener('click', () => {
        const u = new URL(location.href);
        u.searchParams.set('lang', idioma === 'en' ? 'es' : 'en');
        location.href = u.toString();
      });
    }
    /* El enlace al mapa conserva el idioma. */
    document.querySelectorAll('.barra nav a[href]').forEach(a => {
      if (a.href.startsWith(location.origin) && q) {
        const u = new URL(a.href);
        u.searchParams.set('lang', idioma);
        a.href = u.toString();
      }
    });
  }

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
      'teselas.nota.gris': 'el de la figura del artículo; gris claro u oscuro',
      'teselas.nota.osm': 'el estándar de OpenStreetMap', 'teselas.nota.calles': 'callejero',
      'teselas.nota.hot': 'estilo humanitario', 'teselas.nota.topo': 'topográfico',
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
      'teselas.nota.gris': "the one in the paper's figure; light or dark grey",
      'teselas.nota.osm': 'standard OpenStreetMap', 'teselas.nota.calles': 'street map',
      'teselas.nota.hot': 'humanitarian style', 'teselas.nota.topo': 'topographic',
      'teselas.nota.satelite': 'satellite imagery', 'teselas.nota.carto': 'only if it shows no watermark',
      'teselas.nota.local': 'Natural Earth, served from this site',
    },
  };
  window.I18N = { t: (k, v) => t(TESELAS, k, v) };

  window.Sitio = { idioma, locale, t, esc, numero, pesos, objetos, json, pintarFijos };
})();
