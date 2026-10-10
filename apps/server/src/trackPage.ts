import type { Item, TrackPoint } from '@kakehashi/shared';

// Where an item is now: its journey on a map (her home, repair shop, recycler, the new owner's AREA as a circle)
// and, during a delivery, a marker moving along the route. Family and students only.
const MAPLIBRE = 'https://unpkg.com/maplibre-gl@4.7.1/dist';
const STYLE = 'https://tiles.openfreemap.org/styles/liberty';

export function trackPage(item: Item, lang: 'en' | 'ja') {
  const ja = lang === 'ja';
  const label = (p: TrackPoint) => (ja ? p.labelJa : p.label);
  // One stop per distinct place, in order.
  const stops: { lat: number; lng: number; label: string; area: boolean; date: string }[] = [];
  for (const j of item.journey) {
    if (!j.pt) continue;
    const prev = stops[stops.length - 1];
    if (prev && prev.lat === j.pt.lat && prev.lng === j.pt.lng) { prev.date = j.at.slice(0, 10); continue; }
    stops.push({ lat: j.pt.lat, lng: j.pt.lng, label: label(j.pt), area: Boolean(j.pt.area), date: j.at.slice(0, 10) });
  }
  const d = item.delivery;
  const delivered = item.journey.some((j) => j.stage === 'delivered');
  const last = stops[stops.length - 1];
  const status = d
    ? (ja ? `${d.by}さんが新しい持ち主のもとへ運んでいます` : `With ${d.by}, on the way to its new owner`)
    : delivered ? (ja ? '新しい持ち主に届きました（地域のみ表示）' : 'Delivered to its new owner (area only)')
    : last ? (ja ? `現在：${last.label}` : `Now: ${last.label}`) : '';
  const data = JSON.stringify({
    stops,
    delivery: d ? { by: d.by, from: d.from, to: { ...d.to, label: label(d.to) }, minutes: d.minutes, startedAt: Date.parse(d.startedAt), simulated: Boolean(d.simulated) } : null,
    text: {
      status,
      left: ja ? '残り約{n}分' : 'About {n} min to go',
      simulated: ja ? 'デモ用に動きを再現しています' : 'Movement simulated for the demo',
      privacy: ja ? '新しい持ち主の住所は表示しません（地域のみ）' : 'The new owner’s address is never shown, only their area',
      failed: ja ? '地図を読み込めませんでした。' : 'The map could not load.',
    },
  }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>${ja ? '今どこ？' : 'Where is it now?'}</title>
<link rel="stylesheet" href="${MAPLIBRE}/maplibre-gl.css">
<style>
  html,body,#map{margin:0;height:100%;background:#EEF0EA;font-family:system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif}
  .stop{width:24px;height:24px;border-radius:50%;background:#2B4C7E;color:#fff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)}
  .mover{width:34px;height:34px;border-radius:50%;background:#B5562B;border:3px solid #fff;box-shadow:0 0 0 8px rgba(181,86,43,.25),0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center}
  .card{position:absolute;left:8px;right:8px;bottom:8px;background:rgba(251,250,247,.95);border-radius:12px;padding:8px 12px;font-size:12px;color:#5B6273;box-shadow:0 2px 8px rgba(0,0,0,.12)}
  .card b{display:block;font-size:13.5px;color:#1D2433}
  .card .eta{color:#B5562B;font-weight:700}
  .maplibregl-popup-content{font-size:12px;color:#1D2433}
  .maplibregl-ctrl-attrib{font-size:9px}
</style></head>
<body><div id="map"></div>
<div class="card"><b id="status"></b><span class="eta" id="eta"></span> <span id="sim"></span><div id="privacy"></div></div>
<script>
  var D = ${data};
  document.getElementById('status').textContent = D.text.status;
  document.getElementById('privacy').textContent = D.text.privacy;
  if (D.delivery && D.delivery.simulated) document.getElementById('sim').textContent = '· ' + D.text.simulated;
</script>
<script src="${MAPLIBRE}/maplibre-gl.js"></script>
<script>
  if (window.maplibregl) {
    var pts = D.stops.map(function (s) { return [s.lng, s.lat]; });
    if (D.delivery) pts.push([D.delivery.to.lng, D.delivery.to.lat]);
    var b = new maplibregl.LngLatBounds(pts[0], pts[0]); pts.forEach(function (p) { b.extend(p); });
    var map = new maplibregl.Map({ container: 'map', style: '${STYLE}', bounds: b, fitBoundsOptions: { padding: { top: 40, bottom: 90, left: 40, right: 40 }, maxZoom: 15 }, attributionControl: { compact: true } });

    // A circle of about 600 m around an area point, so no exact place is shown.
    function circle(lng, lat) {
      var c = [], r = 600 / 111320;
      for (var i = 0; i <= 48; i++) { var a = i / 48 * 2 * Math.PI; c.push([lng + r * Math.cos(a) / Math.cos(lat * Math.PI / 180), lat + r * Math.sin(a)]); }
      return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [c] } };
    }
    var added = false;
    function addLayers() {
      if (added || !map.isStyleLoaded()) return;
      added = true;
      var areas = D.stops.filter(function (s) { return s.area; }).map(function (s) { return circle(s.lng, s.lat); });
      if (D.delivery && D.delivery.to.area) areas.push(circle(D.delivery.to.lng, D.delivery.to.lat));
      map.addSource('areas', { type: 'geojson', data: { type: 'FeatureCollection', features: areas } });
      map.addLayer({ id: 'areas', type: 'fill', source: 'areas', paint: { 'fill-color': '#4F6B3A', 'fill-opacity': 0.18 } });
      map.addLayer({ id: 'areas-edge', type: 'line', source: 'areas', paint: { 'line-color': '#4F6B3A', 'line-width': 2, 'line-dasharray': [2, 1.5] } });
      var done = D.stops.map(function (s) { return [s.lng, s.lat]; });
      if (done.length > 1) {
        map.addSource('done', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: done } } });
        map.addLayer({ id: 'done', type: 'line', source: 'done', paint: { 'line-color': '#2B4C7E', 'line-width': 4 } });
      }
      if (D.delivery) {
        map.addSource('next', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [[D.delivery.from.lng, D.delivery.from.lat], [D.delivery.to.lng, D.delivery.to.lat]] } } });
        map.addLayer({ id: 'next', type: 'line', source: 'next', paint: { 'line-color': '#B5562B', 'line-width': 4, 'line-dasharray': [1.2, 1.4] } });
      }
    }
    map.on('styledata', addLayers);
    map.on('load', addLayers);

    D.stops.forEach(function (s, i) {
      var el = document.createElement('div'); el.className = 'stop'; el.textContent = String(i + 1);
      var box = document.createElement('div'); box.textContent = s.label + ' · ' + s.date;
      new maplibregl.Marker({ element: el }).setLngLat([s.lng, s.lat]).setPopup(new maplibregl.Popup({ offset: 14, closeButton: false }).setDOMContent(box)).addTo(map);
    });

    if (D.delivery) {
      var el = document.createElement('div'); el.className = 'mover';
      el.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
      var mover = new maplibregl.Marker({ element: el }).setLngLat([D.delivery.from.lng, D.delivery.from.lat]).addTo(map);
      var eta = document.getElementById('eta');
      var dv = D.delivery;
      function progress() {
        if (dv.simulated) return ((Date.now() / 1000) % 120) / 120;
        return Math.min(1, Math.max(0, (Date.now() - dv.startedAt) / (dv.minutes * 60000)));
      }
      function tick() {
        var p = progress();
        mover.setLngLat([dv.from.lng + (dv.to.lng - dv.from.lng) * p, dv.from.lat + (dv.to.lat - dv.from.lat) * p]);
        eta.textContent = D.text.left.replace('{n}', String(Math.max(1, Math.round((1 - p) * dv.minutes))));
        requestAnimationFrame(tick);
      }
      tick();
    }
  } else { document.getElementById('status').textContent = D.text.failed; }
</script>
</body></html>`;
}
