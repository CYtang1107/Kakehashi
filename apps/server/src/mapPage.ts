import { walkMinutes, type Home, type PlaceKind } from '@kakehashi/shared';

// Neighbourhood map: a street map (MapLibre GL, OpenFreeMap tiles from OpenStreetMap) with her places as lettered
// pins and every other real place nearby as a small dot. Served as a page so the app shows it in an iframe (web)
// or a WebView (phone, Expo Go). The app can focus a place: postMessage({ focus: id }) or window.__focus(id).
const MAPLIBRE = 'https://unpkg.com/maplibre-gl@4.7.1/dist';
const STYLE = 'https://tiles.openfreemap.org/styles/liberty';

export const KIND: Record<PlaceKind, { color: string; en: string; ja: string }> = {
  home: { color: '#2B4C7E', en: 'Her home', ja: 'ご自宅' },
  community: { color: '#B5562B', en: 'Community centre', ja: '地域の拠点' },
  care: { color: '#9A6A12', en: 'Care and salons', ja: '介護・地域の茶の間' },
  clinic: { color: '#4F6B3A', en: 'Clinic', ja: '医療機関' },
  pharmacy: { color: '#3E7C8A', en: 'Pharmacy', ja: '薬局' },
  shop: { color: '#7A4A6E', en: 'Supermarket', ja: 'スーパー' },
  library: { color: '#5B6273', en: 'Library', ja: '図書館' },
};

export function mapPage(home: Home, lang: 'en' | 'ja') {
  const ja = lang === 'ja';
  const me = home.places.find((p) => p.kind === 'home')!;
  let letter = 0;
  const places = home.places.filter((p) => p.kind !== 'home').map((p) => {
    const acts = home.activities.filter((a) => a.placeId === p.id && a.status !== 'not-now');
    const status = (s: string) => (ja
      ? ({ suggested: '提案', proposed: '提案済み', accepted: '参加予定', attended: '参加しました' } as Record<string, string>)[s]
      : ({ suggested: 'Suggested', proposed: 'Proposed', accepted: 'Going', attended: 'Went' } as Record<string, string>)[s]);
    return {
      id: p.id, lat: p.lat, lng: p.lng, color: KIND[p.kind].color, kind: ja ? KIND[p.kind].ja : KIND[p.kind].en,
      letter: p.mine ? String.fromCharCode(65 + letter++) : '',
      name: p.nameJa, hours: p.hours ?? '',
      walk: ja ? `歩いて約${walkMinutes(me, p)}分` : `About ${walkMinutes(me, p)} min on foot`,
      lines: acts.map((a) => `${ja ? a.titleJa : a.title} · ${a.date.slice(5, 10).replace('-', '/')} · ${status(a.status)}${a.companion ? (ja ? `（${a.companion}さんと）` : ` with ${a.companion}`) : ''}`),
      going: acts.some((a) => a.status === 'accepted' || a.status === 'attended'),
    };
  });
  const routes = places.filter((p) => p.going).map((p) => [[me.lng, me.lat], [p.lng, p.lat]]);
  const text = {
    home: ja ? 'ご自宅（デモ）' : 'Her home (demo point)',
    directions: ja ? '道順（徒歩）' : 'Walking directions',
    note: ja ? '場所：OpenStreetMap ・ ご自宅と活動は例です' : 'Places: OpenStreetMap · her home and activities are examples',
    failed: ja ? '地図を読み込めませんでした。インターネット接続を確認してください。' : 'The map could not load. Check the internet connection.',
  };
  const data = JSON.stringify({ me: { lat: me.lat, lng: me.lng }, places, routes, text }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>${ja ? 'ご自宅のまわり' : 'Around her home'}</title>
<link rel="stylesheet" href="${MAPLIBRE}/maplibre-gl.css">
<style>
  html,body,#map{margin:0;height:100%;background:#EEF0EA;font-family:system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif}
  .pin{width:32px;height:42px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));cursor:pointer}.pin svg{display:block}
  .dot{width:13px;height:13px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.35);cursor:pointer}
  .home{width:36px;height:36px;border-radius:10px;background:#2B4C7E;color:#fff;font-weight:700;font-size:18px;display:flex;align-items:center;justify-content:center;
        border:3px solid #fff;box-shadow:0 0 0 7px rgba(43,76,126,.22),0 2px 6px rgba(0,0,0,.3)}
  .pop b{font-size:13.5px;color:#1D2433}.pop div{font-size:12px;color:#5B6273;margin-top:2px;line-height:1.45}
  .pop .walk{color:#2B4C7E;font-weight:700}.pop .act{color:#1D2433}
  .pop a{display:inline-block;margin-top:6px;color:#2B4C7E;font-weight:700;font-size:12px;text-decoration:none}
  .note{position:absolute;left:8px;top:8px;background:rgba(251,250,247,.92);border-radius:99px;padding:4px 10px;font-size:11px;color:#5B6273}
  .maplibregl-ctrl-attrib{font-size:9px}
  #err{display:none;position:absolute;inset:0;align-items:center;justify-content:center;padding:24px;text-align:center;color:#5B6273}
</style></head>
<body><div id="map"></div><div class="note" id="note"></div><div id="err"></div>
<script>
  var D = ${data};
  document.getElementById('note').textContent = D.text.note;
  function fail(){ var e=document.getElementById('err'); e.textContent=D.text.failed; e.style.display='flex'; }
</script>
<script src="${MAPLIBRE}/maplibre-gl.js" onerror="fail()"></script>
<script>
  var markers = {};
  if (window.maplibregl) {
    var map = new maplibregl.Map({ container: 'map', style: '${STYLE}', center: [D.me.lng, D.me.lat], zoom: 15, attributionControl: { compact: true } });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    var b = new maplibregl.LngLatBounds([D.me.lng, D.me.lat], [D.me.lng, D.me.lat]);
    D.places.forEach(function (p) { if (p.letter) b.extend([p.lng, p.lat]); });
    map.fitBounds(b, { padding: { top: 46, bottom: 30, left: 36, right: 36 }, maxZoom: 16, duration: 0 });

    var added = false;
    function addRoutes() {
      if (added || !map.isStyleLoaded()) return;
      added = true;
      map.addSource('routes', { type: 'geojson', data: { type: 'FeatureCollection', features: D.routes.map(function (c) { return { type: 'Feature', geometry: { type: 'LineString', coordinates: c } }; }) } });
      map.addLayer({ id: 'routes', type: 'line', source: 'routes', paint: { 'line-color': '#2B4C7E', 'line-width': 3.5, 'line-dasharray': [1.2, 1.4] } });
    }
    map.on('styledata', addRoutes);
    map.on('load', addRoutes);

    function line(cls, t) { var d = document.createElement('div'); if (cls) d.className = cls; d.textContent = t; return d; }
    // Dots first, then lettered pins on top, then her home.
    D.places.slice().sort(function (a, b) { return (a.letter ? 1 : 0) - (b.letter ? 1 : 0); }).forEach(function (p) {
      var el = document.createElement('div');
      if (p.letter) {
        el.className = 'pin';
        el.innerHTML = '<svg width="32" height="42" viewBox="0 0 32 42"><path d="M16 40.5C16 40.5 3 26 3 15a13 13 0 0 1 26 0c0 11-13 25.5-13 25.5z" fill="' + p.color + '" stroke="#fff" stroke-width="2.5"/><text x="16" y="20" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="14" fill="#fff">' + p.letter + '</text></svg>';
      } else { el.className = 'dot'; el.style.background = p.color; }
      var box = document.createElement('div'); box.className = 'pop';
      var t = document.createElement('b'); t.textContent = (p.letter ? p.letter + '  ' : '') + p.name; box.appendChild(t);
      box.appendChild(line('', p.kind + (p.hours ? ' · ' + p.hours : '')));
      p.lines.forEach(function (l) { box.appendChild(line('act', l)); });
      box.appendChild(line('walk', p.walk));
      var a = document.createElement('a'); a.target = '_blank'; a.rel = 'noopener';
      a.href = 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=' + p.lat + ',' + p.lng; a.textContent = D.text.directions; box.appendChild(a);
      var pop = new maplibregl.Popup({ offset: p.letter ? [0, -36] : [0, -8], closeButton: false, maxWidth: '240px' }).setDOMContent(box);
      markers[p.id] = new maplibregl.Marker({ element: el, anchor: p.letter ? 'bottom' : 'center' }).setLngLat([p.lng, p.lat]).setPopup(pop).addTo(map);
    });
    var h = document.createElement('div'); h.className = 'home'; h.textContent = '家'; h.title = D.text.home;
    new maplibregl.Marker({ element: h }).setLngLat([D.me.lng, D.me.lat]).addTo(map);

    window.__focus = function (id) {
      var m = markers[id]; if (!m) return;
      Object.keys(markers).forEach(function (k) { var pp = markers[k].getPopup(); if (pp && pp.isOpen()) markers[k].togglePopup(); });
      map.easeTo({ center: m.getLngLat(), zoom: Math.max(map.getZoom(), 16), duration: 600 });
      m.togglePopup();
    };
    window.addEventListener('message', function (e) { try { var d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; if (d && d.focus) window.__focus(d.focus); } catch (_) {} });
  } else { fail(); }
</script>
</body></html>`;
}
