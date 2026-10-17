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
let stage3 = false, failRead = null;
const today = () => new Date().toISOString().slice(0,10);
const wallet = sid => {
  const student = home.students.find(s=>s.id===sid), entries=home.pay.filter(p=>p.studentId===sid);
  const sum = list => list.reduce((n,p)=>n+p.amountJpy,0), paidJpy=sum(entries.filter(p=>p.status==='paid'));
  return {student,entries,monthJpy:sum(entries.filter(p=>p.date.startsWith(today().slice(0,7)))),pendingJpy:sum(entries.filter(p=>p.status==='pending')),paidJpy,goal:student.goal,setAsideJpy:Math.round(paidJpy*(student.goal?.setAsidePct||0)/100),rates:shared.STUDENT_PAY};
};
const listing = s => ({...s, homeId:home.id,area:'Niigata (area only)',areaJa:'新潟（地域のみ）',youReceiveJpy:Math.round(s.priceJpy*shared.WORKER_SHARE),feeJpy:s.priceJpy-Math.round(s.priceJpy*shared.WORKER_SHARE)});
const publicStories = () => [...items.filter(i=>i.share&&(i.story||i.storyJa)).map(i=>({...i,teller:'Someone in Niigata',tellerJa:'新潟の方',lat:37.9,lng:139,sharedAt:i.share.at,photos:i.share.photos?i.photos.filter(p=>p.kind==='photo'):[],audioUrl:i.share.audio?i.audioUrl:undefined,comments:(i.comments||[]).filter(c=>c.status==='shown')})),...seed.exampleStories().map(s=>({...s,photos:[]}))];
const bundle = () => ({ home, items, plans: seed.plans, seniorProceedsJpy: 0, services: { ai: 'offline', payments: 'demo' } });
const json = (response, status, body) => { response.writeHead(status, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(body)); };
http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/__verification/requests') return json(response, 200, requests);
  if (url.pathname === '/__verification/fail-next-read') { failRead=url.searchParams.get('kind'); return json(response,200,{ok:true}); }
  if (url.pathname === '/__verification/fail-next-help') { failNextHelp = true; return json(response, 200, { ok: true }); }
  if (url.pathname === '/__verification/fail-next-mutation') { failNextMutation = true; return json(response, 200, { ok: true }); }
  if (url.pathname === '/__verification/fail-next-home') { failNextHome = true; return json(response, 200, { ok: true }); }
  if (url.pathname === '/__verification/photo.svg') { response.writeHead(200, {'Content-Type':'image/svg+xml'}); return response.end('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#E3EFE7"/><text x="40" y="150" font-size="30">Verification image</text></svg>'); }
  if (url.pathname === '/__verification/audio.wav') {
    const wav = Buffer.alloc(44 + 16000); wav.write('RIFF'); wav.writeUInt32LE(wav.length-8,4); wav.write('WAVEfmt ',8); wav.writeUInt32LE(16,16); wav.writeUInt16LE(1,20); wav.writeUInt16LE(1,22); wav.writeUInt32LE(8000,24); wav.writeUInt32LE(16000,28); wav.writeUInt16LE(2,32); wav.writeUInt16LE(16,34); wav.write('data',36); wav.writeUInt32LE(16000,40);
    response.writeHead(200, {'Content-Type':'audio/wav'}); return response.end(wav);
  }
  if (['/__verification/stage2','/__verification/stage3'].includes(url.pathname)) {
    stage3=url.pathname.endsWith('stage3'); failRead=null;
    home = seed.seedHome(); items = seed.seedItems().map(i => ({ ...i, photos: [], photoUrl: undefined, audioUrl: undefined }));
    home.rooms.forEach(r => { r.photos = []; });
    home.services.push({ ...home.services.find(s => s.status === 'done'), id: 'verify-rating', feedback: undefined });
    home.activities[0].status = 'proposed';
    if(stage3) {
      home.services.push({id:'verify-open',kind:'garden',when:'soon',by:'her',status:'open',priceJpy:4000,date:'2026-10-20',hours:2,createdAt:today()});
      home.services.push({id:'verify-request',kind:'cleaning',when:'soon',by:'her',status:'requested',createdAt:today()});
      const sewing=items.find(i=>i.id==='sewing'); delete sewing.delivery; sewing.holdUntil=undefined;
      sewing.share={at:today(),name:'anonymous',audio:false,photos:false};
    }
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
    if(request.method==='GET' && failRead && url.pathname.endsWith('/'+failRead)) { failRead=null; return json(response,503,{error:'Verification-only read failure'}); }
    if (request.method !== 'GET' && failNextMutation) { failNextMutation = false; return json(response, 503, { error: 'Verification-only failure' }); }
    if(stage3) {
      const parts=url.pathname.split('/'), student=home.students.find(s=>s.id===parts.at(-2));
      if(url.pathname.endsWith('/wallet')) return json(response,200,wallet(student.id));
      if(url.pathname.endsWith('/goal')) { if(body.clear) delete student.goal; else student.goal={name:body.name,targetJpy:body.targetJpy,setAsidePct:body.setAsidePct}; return json(response,200,wallet(student.id)); }
      if(url.pathname.endsWith('/payout')) { home.pay.filter(p=>p.studentId===student.id&&p.status==='pending').forEach(p=>{p.status='paid';p.paidAt=today();}); return json(response,200,wallet(student.id)); }
      if(url.pathname.endsWith('/step') && student) {
        if(body.step==='signoff'&&body.passed&&shared.READINESS.some(s=>s!=='signoff'&&!student.passed[s])) return json(response,409,{error:'Every other step must be passed before sign-off.'});
        if(body.passed) student.passed[body.step]=today(); else {delete student.passed[body.step];delete student.passed.signoff;} return json(response,200,student);
      }
      if(url.pathname==='/api/report/check') return json(response,200,{ok:!body.text.includes('junk'),flags:body.text.includes('junk')?[{phrase:'junk',reason:'Use respectful wording.',suggestion:'belongings'}]:[],source:'offline'});
      if(url.pathname==='/api/home/tanaka/report') {
        if(!body.readConfirmed||body.text.includes('junk')) return json(response,422,{error:'Read and check the report.'});
        const visit={id:'verify-report',date:today(),roomId:'washitsu',summary:body.text,status:'done',checked:'offline',readBy:body.by};home.visits.unshift(visit);return json(response,200,visit);
      }
      if(url.pathname.endsWith('/fieldnotes')) {home.fieldNotes.unshift({id:'verify-note',date:today(),...body});return json(response,200,home.fieldNotes);}
      if(url.pathname==='/api/checkout') { const plan=seed.plans.find(p=>p.id===body.planId);home.planId=plan.id;const payment={id:'verify-payment',at:new Date().toISOString(),amountJpy:plan.priceJpy,mode:'demo',status:'paid',planId:plan.id};home.payments.unshift(payment);return json(response,200,{mode:'demo',payment}); }
      if(url.pathname.endsWith('/proceeds')) {home.proceedsChoice=body.choice;return json(response,200,home);}
      if(url.pathname==='/api/jobs') {const worker=home.workers.find(w=>w.id===url.searchParams.get('workerId'));if(!shared.isCleared(worker))return json(response,403,{error:'Finish your checks.'});const mine=home.services.filter(s=>s.workerId===worker.id&&['booked','done'].includes(s.status)).map(listing);return json(response,200,{open:home.services.filter(s=>s.status==='open'&&worker.skills.includes(s.kind)).map(listing),mine,earned:mine.filter(s=>s.status==='done').reduce((n,s)=>n+s.youReceiveJpy,0)});}
      if(url.pathname.startsWith('/api/jobs/')&&url.pathname.endsWith('/accept')) {const s=home.services.find(s=>s.id===parts.at(-2));s.status='booked';s.workerId=body.workerId;return json(response,200,listing(s));}
      if(/\/services\/.+\/(post|book)$/.test(url.pathname)) {const s=home.services.find(s=>s.id===parts.at(-2));Object.assign(s,body,{status:parts.at(-1)==='post'?'open':'booked'});return json(response,200,home.services);}
      if(url.pathname==='/api/items'&&request.method==='POST') {const item={...items[0],id:'verify-created',...body,story:'',storyJa:undefined,photos:[],audioUrl:undefined,decision:'open',journey:[],thanks:[],comments:[],share:undefined};items.push(item);return json(response,201,item);}
      if(url.pathname==='/api/estimate') return json(response,200,{category:'household',priceLowJpy:1000,priceHighJpy:2000,routeIfLetGo:'pass',reason:'Verification-only example estimate',source:'offline'});
      if(url.pathname.endsWith('/wish')&&url.pathname.startsWith('/api/items/')) {const item=items.find(i=>i.id===parts.at(-2));item.wish={kind:body.kind,from:home.childName,at:today()};return json(response,200,item);}
      if(url.pathname.endsWith('/handover')) {const item=items.find(i=>i.id===parts.at(-2));item.journey.push({stage:body.stage,by:body.by,at:today()});return json(response,200,item);}
      if(url.pathname.endsWith('/delivery')) {const item=items.find(i=>i.id===parts.at(-2));item.delivery={by:body.by,startedAt:new Date().toISOString(),arrivesAt:new Date(Date.now()+600000).toISOString(),from:{lat:37.9,lng:139},to:{lat:37.9,lng:139.1},demo:true};return json(response,200,item);}
      if(url.pathname.startsWith('/api/items/')&&/\/comments\//.test(url.pathname)) {const item=items.find(i=>i.id===parts[3]);item.comments.find(c=>c.id===parts.at(-1)).status=body.status;return json(response,200,item);}
      if(url.pathname.endsWith('/icon')) return json(response,200,items.find(i=>i.id===parts.at(-2)));
      if(url.pathname.endsWith('/heart')) {const item=items.find(i=>i.id===parts.at(-2));item.hearts=Math.max(0,(item.hearts||0)+(body.undo?-1:1));return json(response,200,{hearts:item.hearts});}
      if(url.pathname.endsWith('/comments')&&url.pathname.startsWith('/api/stories/')) {const item=items.find(i=>i.id===parts.at(-2));if(/https?:|www\.|@/.test(body.message))return json(response,400,{error:'Leave out contact details.'});(item.comments||=[]).push({id:'verify-comment',...body,status:'pending',at:today()});return json(response,201,{ok:true,pending:true});}
      if(url.pathname==='/api/stories') return json(response,200,publicStories());
      if(url.pathname.endsWith('/letters')&&request.method==='POST') {let letter=home.letters.find(l=>l.month===today().slice(0,7));if(!letter){letter={id:'verify-letter',month:today().slice(0,7),itemIds:['sewing'],note:'',status:'draft'};home.letters.unshift(letter);}if(body.note!==undefined)letter.note=body.note;return json(response,200,letter);}
      if(url.pathname.startsWith('/api/letters/')&&url.pathname.endsWith('/status')) {const l=home.letters.find(l=>l.id===parts.at(-2));Object.assign(l,body);return json(response,200,l);}
      if(url.pathname.endsWith('/calls')) {home.calls.unshift({id:'verify-call',date:today(),status:'done',...body});return json(response,200,home.calls);}
      if(url.pathname.includes('/future/')) {const f=home.future;if(parts.at(-1)==='note')f.familyNotes.push({...body,at:today()});if(parts.at(-1)==='step')f.steps[body.step]=body.done?today():undefined;if(parts.at(-1)==='condition')f.condition[body.part]={level:body.level};if(parts.at(-1)==='wish')Object.assign(f,{wish:body.wish,words:body.words});return json(response,200,f);}
      if(url.pathname.endsWith('/safety')&&request.method==='POST'){home.safety.push({id:'verify-fix',status:'suggested',...body});return json(response,200,home.safety);}
      if(url.pathname.includes('/safety/')&&request.method==='POST'){home.safety.find(f=>f.id===parts.at(-1)).status=body.status;return json(response,200,home.safety);}
    }
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
      if (service) Object.assign(service,body);
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
  const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript', '.ttf': 'font/ttf', '.png': 'image/png', '.json': 'application/json' };
  response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
}).listen(4399, '127.0.0.1', () => console.log('Isolated UI fixture http://127.0.0.1:4399 (all writes are disposable memory only)'));
