// Browser checks through Chrome DevTools Protocol. No npm/browser downloads required.
// Start preview-design-system.cjs and a headless Chrome at --remote-debugging-port=9223 first.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const output = path.resolve(__dirname, '../../../docs/ux-phase1');
fs.mkdirSync(output, { recursive: true });
const base = 'http://127.0.0.1:4399';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const results = { matrices: [], interactions: [], routes: [], exceptions: [] };

async function main() {
  const target = await (await fetch('http://127.0.0.1:9223/json/new?about:blank', { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map(); let next = 0;
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
  ws.addEventListener('message', event => {
    const message = JSON.parse(String(event.data));
    if (message.id) {
      const task = pending.get(message.id); if (!task) return;
      pending.delete(message.id); message.error ? task.reject(new Error(JSON.stringify(message.error))) : task.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') results.exceptions.push(message.params.exceptionDetails.text + ': ' + (message.params.exceptionDetails.exception?.description || ''));
  });
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++next; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const buttonExpression = name => `Array.from((document.querySelector('[role="alertdialog"],[role="dialog"]') || document).querySelectorAll('[role="button"],button')).find(element => (element.getAttribute('aria-label') || element.textContent.trim()) === ${JSON.stringify(name)} && element.getClientRects().length && !element.closest('[aria-hidden="true"]'))`;
  const click = async name => {
    for (let attempt=0; attempt<60; attempt++) {
      if (await evaluate(`Boolean(${buttonExpression(name)})`)) break;
      await wait(100);
    }
    const point = await evaluate(`(() => { const element=${buttonExpression(name)}; if(!element)throw Error('Missing button: '+${JSON.stringify(name)}); element.scrollIntoView({block:'center'}); const box=element.getBoundingClientRect(); return {x:box.x+box.width/2,y:box.y+box.height/2}; })()`);
    await command('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await command('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
    await wait(80);
  };
  const key = async (key, modifiers = 0) => {
    await command('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key === 'Tab' ? 'Tab' : key, windowsVirtualKeyCode: key === 'Tab' ? 9 : key === 'Escape' ? 27 : undefined, modifiers });
    await command('Input.dispatchKeyEvent', { type: 'keyUp', key, modifiers });
    await wait(30);
  };
  await command('Page.enable'); await command('Runtime.enable');
  let initializer;
  const navigate = async (route, width = 390, language = 'en', mode = 'normal', highContrast = false, darkMode = false) => {
    await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    if (initializer) await command('Page.removeScriptToEvaluateOnNewDocument', { identifier: initializer });
    initializer = (await command('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('kakehashi-lang',${JSON.stringify(language)});localStorage.setItem('kakehashi-reading-preferences-v1',${JSON.stringify(JSON.stringify({ textMode: mode, highContrast, darkMode, reduceMotion: true }))});` })).identifier;
    await command('Page.navigate', { url: base + route });
    for (let attempt = 0; attempt < 120; attempt++) {
      await wait(100);
      const login = language === 'en' ? 'Log in' : 'ログイン';
      if (await evaluate(`Boolean(${buttonExpression(login)})`)) { await click(login); await wait(150); }
      if (await evaluate(`Boolean(document.querySelector('[aria-level="1"]')) && !Boolean(${buttonExpression(login)})`)) break;
      if (attempt === 119) throw new Error('Screen did not load: ' + route);
    }
    await evaluate('document.fonts.ready.then(() => true)'); await wait(120);
  };
  const measure = () => evaluate(`(() => {
    const controls=Array.from(document.querySelectorAll('[role="button"],[role="switch"],[role="tab"],input,textarea'))
      .filter(element=>element.getClientRects().length && !element.closest('[aria-hidden="true"]'));
    const small=controls.map(element=>({name:element.getAttribute('aria-label')||element.textContent.trim(),width:element.getBoundingClientRect().width,height:element.getBoundingClientRect().height}))
      .filter(box=>box.width<44 || box.height<44);
    const overflow=Array.from(document.querySelectorAll('*')).filter(element=>{ const box=element.getBoundingClientRect(); const css=getComputedStyle(element); return box.width>0 && box.right>innerWidth+2 && css.position!=='absolute' && !element.closest('svg'); }).slice(0,8).map(element=>element.textContent.slice(0,100));
    const shared=controls.filter(e=>['premium-button','icon-button'].includes(e.dataset.testid));
    const sharedFailures=shared.filter(e=>{const b=e.getBoundingClientRect();return b.width<48 || b.height<(e.dataset.testid==='icon-button'?48:56) || !e.getAttribute('aria-label');}).map(e=>e.getAttribute('aria-label'));
    const luminance=rgb=>{const c=rgb.match(/[\\d.]+/g).slice(0,3).map(v=>{v=Number(v)/255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;});return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
    const contrastFailures=shared.filter(e=>e.dataset.testid==='premium-button').flatMap(e=>{
      const label=Array.from(e.querySelectorAll('[dir="auto"]')).find(t=>t.textContent===e.getAttribute('aria-label'));
      if(!label)return [];
      const bg=getComputedStyle(e).backgroundColor;
      if(bg==='rgba(0, 0, 0, 0)')return [];
      const a=luminance(getComputedStyle(label).color),b=luminance(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      return ratio<4.5?[{label:label.textContent,ratio}]:[];
    });
    return {width:innerWidth,small,sharedFailures,contrastFailures,overflow,controlCount:controls.length,title:document.querySelector('[role="heading"]')?.textContent};
  })()`);
  const screenshot = async name => {
    await evaluate('Array.from(document.querySelectorAll("div")).filter(element => element.scrollHeight>element.clientHeight+20 && /auto|scroll/.test(getComputedStyle(element).overflowY)).forEach(element=>element.scrollTop=0); window.scrollTo(0,0);');
    const capture = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(capture.data, 'base64'));
  };
  if (process.argv.includes('--worker-only')) {
    const observations = [];
    for (const language of ['en', 'ja']) for (const width of [320,390,768,1440]) for (const mode of ['normal','extraLarge']) {
      await navigate('/worker', width, language, mode, mode === 'extraLarge');
      observations.push({ language, mode, ...(await measure()) });
      if (width === 390 && mode === 'extraLarge') await screenshot(`worker-${language}-390-extraLarge`);
    }
    const failures = observations.filter(observation => observation.overflow.length);
    fs.writeFileSync(path.join(output, 'worker-verification.json'), JSON.stringify({ observations, failures }, null, 2));
    console.log(JSON.stringify({ workerChecks: observations.length, failures }, null, 2));
    ws.close(); await fetch('http://127.0.0.1:9223/json/close/' + target.id);
    process.exitCode = failures.length ? 1 : 0;
    return;
  }
  for (const language of ['en', 'ja']) for (const width of [320, 390, 768, 1440]) for (const mode of ['normal', 'large', 'extraLarge']) {
    await navigate('/design-system', width, language, mode, mode === 'extraLarge');
    const observation = { route: '/design-system', language, mode, ...(await measure()) };
    results.matrices.push(observation);
    if ((width === 390 || width === 1440) && (mode === 'normal' || mode === 'extraLarge')) await screenshot(`reference-${language}-${width}-${mode}`);
  }
  for (const route of ['/', '/family', '/student', '/her', '/worker']) for (const language of ['en','ja']) for (const width of [390,1440]) for (const mode of ['normal','extraLarge']) {
    await navigate(route, width, language, mode);
    results.matrices.push({ route, language, mode, ...(await measure()) });
    if (mode === 'normal' || language === 'ja' && width === 390) await screenshot(`${route === '/' ? 'public' : route.slice(1)}-${language}-${width}-${mode}`);
  }
  for (const route of ['/design-system','/her','/family','/student']) for (const appearance of ['dark','contrast']) {
    await navigate(route,390,'ja','extraLarge',appearance === 'contrast',appearance === 'dark');
    results.matrices.push({route,appearance,language:'ja',mode:'extraLarge',...await measure()});
    await screenshot(`${route.slice(1)}-${appearance}-ja-390-extraLarge`);
  }
  await navigate('/design-system');
  await click('Save example note');
  assert.equal(await evaluate("document.body.innerText.includes('Write a short note before continuing.')"), true);
  const inputPoint = await evaluate("(() => {const element=document.querySelector('textarea');element.scrollIntoView({block:'center'});const b=element.getBoundingClientRect();return {x:b.x+30,y:b.y+30};})()");
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', ...inputPoint, button: 'left', clickCount: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', ...inputPoint, button: 'left', clickCount: 1 });
  await command('Input.insertText', { text: 'A memory I want to keep.' });
  await click('Save example note');
  assert.equal(await evaluate("document.body.innerText.includes('Example note saved for this session.')"), true);
  await click('Remove example note');
  assert.equal(await evaluate("document.querySelector('[role=alertdialog]') !== null"), true);
  await evaluate("document.querySelector('[role=alertdialog] [role=button]').focus()");
  await key('Tab', 8);
  assert.equal(await evaluate("document.querySelector('[role=alertdialog]').contains(document.activeElement)"), true);
  await key('Escape');
  assert.equal(await evaluate("document.querySelector('[role=alertdialog]') === null"), true);
  assert.equal(await evaluate("document.activeElement?.getAttribute('aria-label')"), 'Remove example note');
  results.interactions.push({name:'confirmation keyboard containment, Escape, trigger focus restored',passed:true});
  await click('Remove example note');
  await click('Cancel');
  assert.equal(await evaluate("document.querySelector('textarea').value"), 'A memory I want to keep.');
  await click('Remove example note');
  await click('Remove example note');
  assert.equal(await evaluate("document.querySelector('textarea').value"), '');
  results.interactions.push({ name: 'labelled input validation, save, destructive review cancel/confirm', passed: true });
  await navigate('/her/help');
  const before = (await (await fetch(base + '/__verification/requests')).json()).length;
  await fetch(base + '/__verification/fail-next-help');
  await click('Garden'); await click('Soon');
  assert.equal(await evaluate("document.body.innerText.includes('Check your connection and try again.')"), true);
  await click('Soon'); await wait(200);
  const helpRequests = (await (await fetch(base + '/__verification/requests')).json()).slice(before).filter(request => request.method === 'POST');
  assert.equal(helpRequests.length, 2);
  assert.deepEqual(helpRequests[1].body, { kind: 'garden', when: 'soon', by: 'her' });
  results.interactions.push({ name: 'existing two-tap help, failed mutation feedback and retry', passed: true, requests: helpRequests });
  for (const route of ['/', '/family', '/family/house', '/family/plan', '/family/reports', '/student', '/student/add', '/student/team', '/student/wallet', '/worker', '/stories', '/item/sewing']) {
    await navigate(route, 390);
    const observation = await measure();
    results.routes.push({ route, textLength: (await evaluate('document.body.innerText')).length, overflow: observation.overflow, smallExistingControls: observation.small });
  }
  results.failures = results.matrices.filter(observation => observation.small.length || observation.sharedFailures.length || observation.contrastFailures.length || observation.overflow.length);
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ matrices: results.matrices.length, failures: results.failures, interactions: results.interactions, routes: results.routes, exceptions: results.exceptions }, null, 2));
  ws.close(); await fetch('http://127.0.0.1:9223/json/close/' + target.id);
  process.exitCode = results.failures.length || results.exceptions.length ? 1 : 0;
}
main().catch(error => { fs.writeFileSync(path.join(output, 'verification-error.json'), JSON.stringify({ error: String(error), results }, null, 2)); console.error(error); process.exit(1); });
