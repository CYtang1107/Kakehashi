// Local, disposable verification host. Never imports db.ts or writes prototype data.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
const seed = require('../../server/src/seed.ts');
const shared = require('../../../packages/shared/index.ts');
let home = seed.seedHome();
let items = seed.seedItems().map(item => ({ ...item, photos: [], photoUrl: undefined, audioUrl: undefined }));
home.rooms.forEach(room => { room.photos = []; });
const dist = path.resolve(__dirname, '../dist');
const requests = [];
let failNextHelp = false;
let failNextMutation = false;
let weatherMode = 'unavailable';
let failNextHome = false;
const bundle = () => ({ home, items, plans: seed.plans, seniorProceedsJpy: 0, services: { ai: 'offline', payments: 'demo' } });
const json = (response, status, body) => { response.writeHead(status, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(body)); };
http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/__verification/requests') return json(response, 200, requests);
  if (url.pathname === '/__verification/fail-next-help') { failNextHelp = true; return json(response, 200, { ok: true }); }
  if (url.pathname === '/__verification/fail-next-mutation') { failNextMutation = true; return json(response, 200, { ok: true }); }
  if (url.pathname === '/__verification/fail-next-home') { failNextHome = true; return json(response, 200, { ok: true }); }
  if (url.pathname === '/__verification/photo.svg') { response.writeHead(200, {'Content-Type':'image/svg+xml'}); return response.end('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#E3EFE7"/><text x="40" y="150" font-size="30">Verification image</text></svg>'); }
  if (url.pathname === '/__verification/audio.wav') {
    const wav = Buffer.alloc(44 + 16000); wav.write('RIFF'); wav.writeUInt32LE(wav.length-8,4); wav.write('WAVEfmt ',8); wav.writeUInt32LE(16,16); wav.writeUInt16LE(1,20); wav.writeUInt16LE(1,22); wav.writeUInt32LE(8000,24); wav.writeUInt32LE(16000,28); wav.writeUInt16LE(2,32); wav.writeUInt16LE(16,34); wav.write('data',36); wav.writeUInt32LE(16000,40);
    response.writeHead(200, {'Content-Type':'audio/wav'}); return response.end(wav);
  }
  if (url.pathname === '/__verification/stage2') {
    home = seed.seedHome(); items = seed.seedItems().map(i => ({ ...i, photos: [], photoUrl: undefined, audioUrl: undefined }));
    home.rooms.forEach(r => { r.photos = []; });
    home.services.push({ ...home.services.find(s => s.status === 'done'), id: 'verify-rating', feedback: undefined });
    home.activities[0].status = 'proposed';
    weatherMode = url.searchParams.get('weather') || 'unavailable';
    if (url.searchParams.has('media')) {
      const item = items.find(i=>i.id==='sewing'); item.audioUrl='/__verification/audio.wav';
      item.photos=[{id:'verify1',url:'/__verification/photo.svg',kind:'photo',caption:'Verification photo',by:'Fixture',at:'2026-10-15'}, {id:'verify2',url:'/__verification/photo.svg',kind:'illustration',caption:'Verification illustration',by:'Fixture',at:'2026-10-15'}];
    }
    if (url.searchParams.has('empty')) { home.visits = []; home.calls = []; home.activities = []; home.services = []; items = []; }
    requests.length = 0; return json(response, 200, { ok: true });
  }
  if (url.pathname.startsWith('/api/')) {
    let raw = ''; for await (const chunk of request) raw += chunk;
    let body = {}; try { body = JSON.parse(raw || '{}'); } catch {}
    requests.push({ method: request.method, path: url.pathname, body });
    if (request.method !== 'GET' && failNextMutation) { failNextMutation = false; return json(response, 503, { error: 'Verification-only failure' }); }
    if (request.method === 'PATCH' && /^\/api\/items\/[^/]+$/.test(url.pathname)) {
      const item = items.find(i => i.id === url.pathname.split('/').at(-1));
      if (!item) return json(response, 404, {});
      Object.assign(item, body);
      // Match the existing Express PATCH behavior: edited text invalidates the old translation.
      if (Object.hasOwn(body, 'story')) delete item.storyJa;
      return json(response, 200, item);
    }
    if (request.method === 'POST' && url.pathname.endsWith('/share')) {
      const item = items.find(i => i.id === url.pathname.split('/').at(-2));
      item.share = body.share ? { ...body, at: new Date().toISOString() } : undefined;
      return json(response, 200, item);
    }
    if (request.method === 'POST' && url.pathname.endsWith('/consent')) { home.consent.recording = body.recording; return json(response, 200, home); }
    if (request.method === 'POST' && url.pathname.includes('/activities/')) {
      const activity = home.activities.find(a => a.id === url.pathname.split('/').at(-1));
      Object.assign(activity, body); return json(response, 200, activity);
    }
    if (request.method !== 'GET' && url.pathname === '/api/home/tanaka/services') {
      if (failNextHelp) { failNextHelp = false; return json(response, 503, { error: 'Verification-only connection failure' }); }
      home.services.unshift({ id: 'verification-help-' + requests.length, ...body, status: 'requested', createdAt: '2026-10-15' });
      return json(response, 201, home.services);
    }
    if (request.method !== 'GET' && /\/services\/.+\/status$/.test(url.pathname)) {
      const service = home.services.find(item => item.id === url.pathname.split('/').at(-2));
      if (service) service.feedback = body.feedback;
      return json(response, 200, home.services);
    }
    if (url.pathname === '/api/home/tanaka') { if (failNextHome) { failNextHome=false;return json(response,503,{error:'Verification-only home failure'}); } return json(response, 200, bundle()); }
    if (url.pathname.endsWith('/weather')) return json(response, 200, {
      area: 'Niigata', areaJa: '新潟市', checkedAt: new Date().toISOString(), source: weatherMode,
      alerts: weatherMode === 'demo' ? [{ code: '06', name: 'Heavy rain', nameJa: '大雨', kind: 'rain', callHer: true }] : [], callNeeded: weatherMode === 'demo',
    });
    if (url.pathname === '/api/stories') return json(response, 200, seed.exampleStories().map(story => ({ ...story, photos: [] })));
    if (url.pathname.endsWith('/wallet')) {
      const student = home.students.find(student => student.id === url.pathname.split('/').at(-2));
      return json(response, 200, { student, entries: [], monthJpy: 0, pendingJpy: 0, paidJpy: 0, setAsideJpy: 0, rates: shared.STUDENT_PAY });
    }
    if (url.pathname === '/api/jobs') return json(response, 200, { open: [], mine: [], earned: 0 });
    return json(response, 404, { error: 'No verification fixture for this endpoint' });
  }
  if (/^\/(map|track)\//.test(url.pathname)) {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return response.end('<!doctype html><html><body style="font:18px system-ui">Map unavailable in this isolated verification fixture.</body></html>');
  }
  let file = path.resolve(dist, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(dist + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, 'index.html');
  const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.ttf': 'font/ttf', '.png': 'image/png', '.json': 'application/json' };
  response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
}).listen(4399, '127.0.0.1', () => console.log('Isolated UI fixture http://127.0.0.1:4399 (all writes are disposable memory only)'));
