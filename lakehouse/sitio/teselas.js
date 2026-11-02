/* Mapa base con una cadena de proveedores gratuitos y sin clave.

   Un proveedor puede contestar 200 OK con una marca de agua en lugar del mapa, como hizo CARTO en
   2026. Por eso, antes de usar uno se bajan dos teselas contiguas: tienen que llegar, ser imágenes
   y ser distintas entre sí. Ya en uso, si las teselas fallan, se pasa al siguiente. Si ninguno
   sirve, el mapa sigue funcionando sin fondo: los municipios se dibujan sobre sus coordenadas.
   ?teselas=<id> fija uno y ?teselas=ninguno no pide nada fuera del sitio. */
(function () {
  'use strict';

  const OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  const ARCGIS = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
  const PROVEEDORES = [
    { id: 'carto', nombre: 'CARTO', claro: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      oscuro: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', max: 19,
      atribucion: OSM + ' &copy; <a href="https://carto.com/attributions">CARTO</a>' },
    { id: 'esri', nombre: 'Esri Canvas', claro: ARCGIS + 'Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      oscuro: ARCGIS + 'Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', max: 16,
      atribucion: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, ' + OSM },
    { id: 'osm', nombre: 'OpenStreetMap', claro: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', max: 19,
      atribucion: OSM },
    { id: 'esri-calles', nombre: 'Esri World Street Map', claro: ARCGIS + 'World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      max: 19, atribucion: 'Tiles &copy; Esri' },
  ];
  const ESPERA = 4000;
  const FALLOS_PARA_CAMBIAR = 6;

  const oscuro = () => window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  const plantilla = p => (oscuro() && p.oscuro) || p.claro;

  async function bajar(url) {
    const ctl = new AbortController();
    const reloj = setTimeout(() => ctl.abort(), ESPERA);
    try {
      const r = await fetch(url, { mode: 'cors', credentials: 'omit', signal: ctl.signal });
      const tipo = r.headers.get('content-type') || '';
      if (!r.ok || !tipo.startsWith('image/')) throw new Error(r.status + ' ' + tipo);
      return new Uint8Array(await r.arrayBuffer());
    } finally {
      clearTimeout(reloj);
    }
  }

  function iguales(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  /* Dos teselas contiguas sobre el centro de México a zoom 6. */
  async function sirve(p) {
    const url = (x, y) => plantilla(p).replace('{z}', 6).replace('{x}', x).replace('{y}', y);
    try {
      const [a, b] = await Promise.all([bajar(url(14, 28)), bajar(url(15, 28))]);
      return !iguales(a, b);
    } catch (e) {
      return false;
    }
  }

  window.Teselas = {
    PROVEEDORES,
    /* Pone en `mapa` el primer proveedor que sirva y llama a `aviso(id)` cuando cambia. */
    async iniciar(mapa, aviso) {
      const fijo = new URLSearchParams(location.search).get('teselas');
      let capa = null;
      let orden = PROVEEDORES.slice();
      if (fijo === 'ninguno') { aviso('ninguno'); return; }
      const elegido = PROVEEDORES.find(p => p.id === fijo);
      if (elegido) orden = [elegido].concat(PROVEEDORES.filter(p => p !== elegido));

      async function siguiente() {
        while (orden.length) {
          const p = orden.shift();
          if (await sirve(p)) { poner(p); return; }
        }
        if (capa) mapa.removeLayer(capa);
        capa = null;
        aviso('ninguno');
      }

      function poner(p) {
        if (capa) mapa.removeLayer(capa);
        let fallos = 0;
        capa = L.tileLayer(plantilla(p), { maxZoom: p.max, attribution: p.atribucion, crossOrigin: true });
        capa.on('tileerror', () => { if (++fallos === FALLOS_PARA_CAMBIAR) siguiente(); });
        capa.addTo(mapa);
        capa.bringToBack();
        aviso(p.id);
      }

      await siguiente();
    },
  };
})();
