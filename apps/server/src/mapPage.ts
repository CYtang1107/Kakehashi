import type { Home } from '@kakehashi/shared';

// Neighbourhood map: a real street map (OpenFreeMap tiles, 3D buildings) drawn with MapLibre GL.
// Served as a page so the app can show it in an iframe (web) or a WebView (phone, Expo Go).
// All places are demo points, never a real home address.
const MAPLIBRE = 'https://unpkg.com/maplibre-gl@4.7.1/dist';
const STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const WALK_M_PER_MIN = 50; // an unhurried pace for an older walker

const KIND_STYLE: Record<string, { glyph: string; color: string }> = {
  home: { glyph: '家', color: '#2B4C7E' },
  activity: { glyph: '会', color: '#B5562B' },
  clinic: { glyph: '医', color: '#4F6B3A' },
  shop: { glyph: '店', color: '#7A4A6E' },
  station: { glyph: '駅', color: '#5B6273' },
};

function metres(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = 6371000, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

export function mapPage(home: Home, lang: 'en' | 'ja') {
  const ja = lang === 'ja';
  const homePlace = home.places.find((p) => p.kind === 'home');
  const places = home.places.map((p) => {
    const acts = home.activities.filter((a) => a.placeId === p.id && a.status !== 'not-now');
    const lines = acts.map((a) => {
      const status = ja
        ? { suggested: '提案', proposed: '提案済み', accepted: '参加予定', attended: '参加しました', 'not-now': '' }[a.status]
        : { suggested: 'Suggested', proposed: 'Proposed', accepted: 'Going', attended: 'Went', 'not-now': '' }[a.status];
      const withWho = a.companion ? (ja ? `・${a.companion}さんと` : ` · with ${a.companion}`) : '';
      return `${ja ? a.titleJa : a.title} — ${a.date.slice(5, 10).replace('-', '/')} ${a.date.slice(11)} · ${status}${withWho}`;
    });
    const walk = homePlace && p.kind !== 'home' ? Math.max(1, Math.round(metres(homePlace, p) / WALK_M_PER_MIN)) : 0;
    return {
      id: p.id, lat: p.lat, lng: p.lng, ...KIND_STYLE[p.kind],
      name: ja ? p.nameJa : p.name, lines,
      walk: walk ? (ja ? `歩いて約${walk}分` : `About ${walk} min on foot`) : '',
      going: acts.some((a) => a.status === 'accepted' || a.status === 'attended'),
    };
  });
  // Walking routes from her home to each activity she said yes to (straight lines: a sketch, not directions).
  const routes = homePlace ? places.filter((p) => p.going).map((p) => [[homePlace.lng, homePlace.lat], [p.lng, p.lat]]) : [];
  const center = homePlace ?? home.places[0];
  const text = {
    title: ja ? `${home.townJa ?? home.town}のまわり` : `Around her home · ${home.town}`,
    legend: ja ? '点線：一緒に歩いて行く場所' : 'Dotted line: places a student walks with her',
    demo: ja ? 'デモ用の場所です。実際の住所ではありません。' : 'Demo locations, not a real address.',
    failed: ja ? '地図を読み込めませんでした。インターネット接続を確認してください。' : 'The map could not load. Check the internet connection.',
  };
  const data = JSON.stringify({ places, routes, center, text }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${text.title}</title>
<link rel="stylesheet" href="${MAPLIBRE}/maplibre-gl.css">
<style>
  html,body,#map{margin:0;height:100%;background:#E9E6DD;font-family:system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif}
  .pin{width:30px;height:30px;border-radius:8px;color:#fff;font-weight:700;font-size:15px;display:flex;align-items:center;justify-content:center;
       border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);cursor:pointer}
  .pin.home{width:38px;height:38px;font-size:19px;border-radius:10px}
  .card{position:absolute;left:10px;bottom:10px;right:10px;max-width:360px;background:rgba(251,250,247,.95);border-radius:12px;padding:10px 12px;
        font-size:12.5px;color:#1D2433;box-shadow:0 2px 8px rgba(0,0,0,.15)}
  .card b{font-size:14px}
  .maplibregl-popup-content{font-size:13px;line-height:1.5;color:#1D2433;border-radius:10px}
  .walk{color:#2B4C7E;font-weight:700}
  #err{display:none;position:absolute;inset:0;align-items:center;justify-content:center;padding:24px;text-align:center;color:#5B6273}
</style></head>
<body><div id="map"></div><div id="err"></div>
<div class="card"><b id="t"></b><br><span id="l"></span><br><span style="color:#5B6273" id="d"></span></div>
<script>
  var D = ${data};
  document.getElementById('t').textContent = D.text.title;
  document.getElementById('l').textContent = D.text.legend;
  document.getElementById('d').textContent = D.text.demo;
  function fail(){ var e=document.getElementById('err'); e.textContent=D.text.failed; e.style.display='flex'; }
</script>
<script src="${MAPLIBRE}/maplibre-gl.js" onerror="fail()"></script>
<script>
  if (window.maplibregl) {
    var map = new maplibregl.Map({ container: 'map', style: '${STYLE}', center: [D.center.lng, D.center.lat], zoom: 15.8, pitch: 58, bearing: -20, attributionControl: { compact: true } });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.on('error', function (e) { if (!map.loaded() && e && e.error && /style|fetch/i.test(String(e.error.message))) fail(); });
    var layersAdded = false;
    function addLayers() {
      if (layersAdded || !map.isStyleLoaded()) return;
      layersAdded = true;
      // 3D buildings, if the style does not already extrude them.
      var hasExtrusion = map.getStyle().layers.some(function (l) { return l.type === 'fill-extrusion'; });
      var src = Object.keys(map.getStyle().sources)[0];
      if (!hasExtrusion && src) {
        map.addLayer({ id: 'kk-buildings', type: 'fill-extrusion', source: src, 'source-layer': 'building', minzoom: 14,
          paint: { 'fill-extrusion-color': '#D8D2C4', 'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 6], 'fill-extrusion-opacity': 0.85 } });
      }
      map.addSource('routes', { type: 'geojson', data: { type: 'FeatureCollection', features: D.routes.map(function (c) { return { type: 'Feature', geometry: { type: 'LineString', coordinates: c } }; }) } });
      map.addLayer({ id: 'routes', type: 'line', source: 'routes', paint: { 'line-color': '#2B4C7E', 'line-width': 4, 'line-dasharray': [1.2, 1.4] } });
    }
    map.on('styledata', addLayers);
    map.on('load', addLayers);
    // Pins do not wait for the tiles.
    D.places.forEach(function (p) {
        var el = document.createElement('div');
        el.className = 'pin' + (p.glyph === '家' ? ' home' : '');
        el.style.background = p.color;
        el.textContent = p.glyph;
        var box = document.createElement('div');
        var b = document.createElement('b'); b.textContent = p.name; box.appendChild(b);
        p.lines.forEach(function (l) { var d = document.createElement('div'); d.textContent = l; box.appendChild(d); });
        if (p.walk) { var w = document.createElement('div'); w.className = 'walk'; w.textContent = p.walk; box.appendChild(w); }
        new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).setPopup(new maplibregl.Popup({ offset: 22 }).setDOMContent(box)).addTo(map);
      });
  } else { fail(); }
</script>
</body></html>`;
}
