// Stage 8 demo-boundary checks through Chrome DevTools Protocol. No npm/browser downloads.
// Start preview-design-system.cjs and a headless Chrome at --remote-debugging-port=9223 first.
// Checks the parts of the final demo that earlier stages do not: a private companion conversation never
// reaches family or student screens, and every simulated or fictional feature is labelled as such.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const out = path.resolve(__dirname, '../.impeccable/review'), base = 'http://127.0.0.1:4399';
fs.mkdirSync(out, { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = { groups: [], exceptions: [] };
const SECRET = 'STAGE8-PRIVATE-' + Date.now();

async function main() {
  const target = await (await fetch('http://127.0.0.1:9223/json/new?about:blank', { method: 'PUT' })).json(), ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  let serial = 0; const pending = new Map();
  ws.addEventListener('message', event => {
    const m = JSON.parse(event.data);
    if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(Error(JSON.stringify(m.error))) : p.resolve(m.result); }
    else if (m.method === 'Runtime.exceptionThrown') results.exceptions.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  });
  const cmd = (method, params = {}) => new Promise((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  const ev = async expression => { const r = await cmd('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  const text = () => ev('document.body?.innerText || ""');
  const has = async s => { for (let i = 0; i < 100; i++) { if ((await text()).includes(s)) return; await wait(100); } throw Error('Missing: ' + s); };
  const button = name => `Array.from(document.querySelectorAll('[role="button"],button')).find(e=>(e.getAttribute('aria-label')===${JSON.stringify(name)}||e.textContent.trim()===${JSON.stringify(name)})&&e.getClientRects().length&&!e.closest('[aria-hidden="true"]'))`;
  const click = async name => {
    for (let i = 0; i < 60 && !(await ev(`Boolean(${button(name)})`)); i++) await wait(100);
    const p = await ev(`(()=>{const e=${button(name)};if(!e)throw Error('Missing button '+${JSON.stringify(name)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    await cmd('Input.dispatchMouseEvent', { type: 'mousePressed', ...p, button: 'left', clickCount: 1 });
    await cmd('Input.dispatchMouseEvent', { type: 'mouseReleased', ...p, button: 'left', clickCount: 1 });
    await wait(150);
  };
  let init;
  await cmd('Page.enable'); await cmd('Runtime.enable');
  const navigate = async route => {
    await cmd('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: false });
    if (!init) init = (await cmd('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('kakehashi-lang','en');localStorage.setItem('kakehashi-reading-preferences-v1',JSON.stringify({textMode:'normal',highContrast:false,reduceMotion:true}));` })).identifier;
    await cmd('Page.navigate', { url: base + route });
    await has('Settings'); await ev('document.fonts.ready.then(()=>true)'); await wait(400);
  };
  const record = name => { results.groups.push(name); console.log('ok ' + name); };

  await fetch(base + '/__verification/stage3?weather=demo');

  // 1. A private companion conversation stays on her screen.
  await navigate('/her/companion');
  await ev(`(()=>{const e=Array.from(document.querySelectorAll('textarea,input')).find(e=>e.getAttribute('aria-label')==='Your message'&&e.getClientRects().length);if(!e)throw Error('Missing message box');e.scrollIntoView({block:'center'});e.focus();})()`);
  await cmd('Input.insertText', { text: `My diary note ${SECRET}: I enjoy growing orchids.` });
  await click('Send message'); await has(SECRET);
  const stored = await ev('JSON.stringify(localStorage)');
  record('companion message shown on her own screen');
  for (const route of ['/family', '/family/house', '/family/reports', '/family/plan', '/student', '/student/team']) {
    await navigate(route);
    assert.equal((await text()).includes(SECRET), false, 'private conversation visible on ' + route);
  }
  const requests = await (await fetch(base + '/__verification/requests')).json();
  assert.equal(JSON.stringify(requests).includes(SECRET), false, 'private conversation sent to the server');
  assert.equal(stored.includes(SECRET), false, 'raw conversation text persisted in local storage');
  record('private conversation absent from 4 family and 2 student screens, never sent to the server, not persisted');

  // 2. Fictional and simulated features say so on screen.
  await navigate('/her/friends'); await has('These people and interactions are fictional');
  await navigate('/her/friends/demo'); await has('Fictional demo');
  await navigate('/her/smart-home'); await has('All controls are simulated. No real devices are connected.');
  record('friendship demo, persona switch and smart home are labelled fictional or simulated');

  fs.writeFileSync(path.join(out, 'stage8-verification.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ groups: results.groups.length, exceptions: results.exceptions }));
  ws.close(); await fetch('http://127.0.0.1:9223/json/close/' + target.id);
  process.exitCode = results.exceptions.length ? 1 : 0;
}
main().catch(e => { fs.writeFileSync(path.join(out, 'stage8-error.json'), JSON.stringify({ error: String(e), results }, null, 2)); console.error(e); process.exit(1); });
