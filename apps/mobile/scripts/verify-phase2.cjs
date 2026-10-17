// Browser checks through Chrome DevTools Protocol. No npm/browser downloads required.
// Start preview-design-system.cjs and a headless Chrome at --remote-debugging-port=9223 first.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const output = path.resolve(__dirname, '../../../docs/ux-phase2');
fs.mkdirSync(output, { recursive: true });
const base = 'http://127.0.0.1:4399';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const results = { matrices: [], interactions: [], routes: [], exceptions: [] };
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const { herLocation } = require('../src/her/navigation.ts');

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
  const buttonExpression = name => `Array.from((document.querySelector('[role="alertdialog"],[role="dialog"]') || document).querySelectorAll('[role="button"],[role="tab"],[role="switch"],[role="radio"],button')).find(element => (element.getAttribute('aria-label') || element.textContent.trim()) === ${JSON.stringify(name)} && element.getClientRects().length && !element.closest('[aria-hidden="true"]'))`;
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
    await command('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key === 'Tab' ? 'Tab' : key === 'a' ? 'KeyA' : key, windowsVirtualKeyCode: key === 'Tab' ? 9 : key === 'Escape' ? 27 : key === 'a' ? 65 : undefined, modifiers });
    await command('Input.dispatchKeyEvent', { type: 'keyUp', key, modifiers });
    await wait(30);
  };
  await command('Page.enable'); await command('Runtime.enable');
  await command('Storage.clearDataForOrigin', {origin:base,storageTypes:'local_storage'});
  let initializer;
  const navigate = async (route, width = 390, language = 'en', mode = 'normal', highContrast = false) => {
    await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    if (initializer) await command('Page.removeScriptToEvaluateOnNewDocument', { identifier: initializer });
    initializer = (await command('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('kakehashi-lang',${JSON.stringify(language)});localStorage.setItem('kakehashi-reading-preferences-v1',${JSON.stringify(JSON.stringify({ textMode: mode, highContrast, reduceMotion: true }))});` })).identifier;
    await command('Page.navigate', { url: base + route });
    for (let attempt = 0; attempt < 120; attempt++) {
      await wait(100);
      const login = language === 'en' ? 'Log in' : 'ログイン';
      if (await evaluate(`Boolean(${buttonExpression(login)})`)) { await click(login); }
      if (await evaluate(`Boolean(document.querySelector('[data-testid="older-adult-shell"]'))`)) break;
      if (attempt === 119) throw new Error('Screen did not load: ' + route);
    }
    await evaluate('document.fonts.ready.then(() => true)'); await wait(200);
  };
  const measure = () => evaluate(`(() => {
    const controls=Array.from(document.querySelectorAll('[role="button"],[role="switch"],[role="tab"],[role="radio"],input,textarea'))
      .filter(element=>element.getClientRects().length && !element.closest('[aria-hidden="true"]'));
    const small=controls.map(element=>({name:element.getAttribute('aria-label')||element.textContent.trim(),width:element.getBoundingClientRect().width,height:element.getBoundingClientRect().height,minimum:element.getAttribute('data-testid')==='icon-button'?48:element.getAttribute('role')==='tab'?(innerWidth>=1430?64:76):56}))
      .filter(box=>box.width<48 || box.height<box.minimum);
    const overflow=Array.from(document.querySelectorAll('*')).filter(element=>{ const box=element.getBoundingClientRect(); const css=getComputedStyle(element); return box.width>0 && box.right>innerWidth+2 && css.position!=='absolute' && !element.closest('svg'); }).slice(0,8).map(element=>element.textContent.slice(0,100));
    return {width:innerWidth,small,overflow,controlCount:controls.length,title:document.querySelector('[role="heading"]')?.textContent};
  })()`);
  const screenshot = async name => {
    await evaluate('Array.from(document.querySelectorAll("div")).filter(element => element.scrollHeight>element.clientHeight+20 && /auto|scroll/.test(getComputedStyle(element).overflowY)).forEach(element=>element.scrollTop=0); window.scrollTo(0,0);');
    const capture = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(capture.data, 'base64'));
  };
  const has = async text => {
    for (let i = 0; i < 70; i++) {
      if (await evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`)) return;
      await wait(100);
    }
    throw new Error('Missing text: ' + text);
  };
  const routeIs = async route => {
    for (let i = 0; i < 70; i++) {
      if (await evaluate('location.pathname + location.search') === route) return;
      await wait(100);
    }
    throw new Error('Did not navigate to ' + route);
  };
  const fill = async (label, text) => {
    await evaluate(`(() => {const e=Array.from(document.querySelectorAll('input,textarea')).find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)}); if(!e)throw Error('Missing input '+${JSON.stringify(label)});e.scrollIntoView({block:'center'});e.focus();e.select();})()`);
    await command('Input.insertText', { text });
    assert.equal(await evaluate(`Array.from(document.querySelectorAll('input,textarea')).find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)}).value`),text);
  };
  const recorded = async () => (await (await fetch(base + '/__verification/requests')).json()).filter(r => r.method !== 'GET');
  const tabs = () => evaluate(`Array.from(document.querySelectorAll('[role="tablist"] [role="tab"]')).map(e=>({name:e.getAttribute('aria-label'),selected:e.getAttribute('aria-selected')}))`);
  const check = name => { results.interactions.push({name, passed:true}); console.log('ok ' + name); };
  const source = fs.readFileSync(path.resolve(__dirname, '../src/i18n.tsx'), 'utf8');
  const en = Function('return ' + source.slice(source.indexOf('const en = ') + 11, source.indexOf('\nexport type Key')).replace(/;\s*$/, ''))();
  const jaStart = source.indexOf('const ja:');
  const ja = Function('return ' + source.slice(source.indexOf('= {', jaStart) + 2, source.indexOf('\n};', jaStart) + 2))();

  for (const route of ['/her/settings','/her/privacy','/her/profile','/her/unknown','/family']) assert.equal(herLocation(route).destination, null);
  assert.equal(herLocation('/her/my-day').parent, 'hToday');
  assert.equal(herLocation('/her/friends/conversation/aiko').label, 'hMessages');
  assert.equal(herLocation('/her/item/sewing').destination, 'memories');
  check('exact child contexts and no fallback Today selection');
  await fetch(base + '/__verification/stage3?weather=demo');
  await command('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const core = ['/her','/her/my-home','/her/my-day','/her/help','/her/helpers'];
  if (!process.argv.includes('--interactions-only')) {
  for (const language of ['en','ja']) for (const width of [320,390,768,1440]) for (const mode of ['normal','extraLarge']) {
    for (const route of core) {
      await navigate(route, width, language, mode);
      await has((language === 'en' ? en : ja)[route === '/her' ? 'hGlance' : route === '/her/my-home' ? 'hHelpVisitors' : route === '/her/my-day' ? 'hMyReminders' : route === '/her/help' ? 'hChooseService' : 'hBookedVisitors']);
      const navigation = await tabs();
      assert.deepEqual(navigation.map(t=>t.name), ['hToday','hMyHome','hMemories','hFriends'].map(k=>(language==='en'?en:ja)[k]));
      assert.equal(navigation.filter(t=>t.selected==='true').length,1);
      results.matrices.push({route,language,mode,...await measure()});
      if ((width===390 || width===1440) && (language==='en' && mode==='normal' || language==='ja' && mode==='extraLarge')) await screenshot(`phase2-${route.split('/').filter(Boolean).join('-')}-${language}-${width}-${mode}`);
      if (route==='/her/my-day' && (width===390 || width===1440) && mode==='extraLarge') {
        await click(language==='en'?'Add a reminder or activity':'リマインダーや活動を追加');
        results.matrices.push({route:'/her/my-day#reminder-form',language,mode,...await measure()});
        if (width===390) await screenshot(`phase2-reminder-form-${language}-390-extraLarge`);
        await key('Escape');
      }
    }
    console.log(`matrix ${language} ${width} ${mode}`);
  }
  for (const appearance of ['dark','contrast']) for (const route of core) {
    await navigate(route,390,'en','extraLarge',appearance==='contrast');
    if (appearance==='dark') {
      await evaluate(`localStorage.setItem('kakehashi-reading-preferences-v1',JSON.stringify({textMode:'extraLarge',darkMode:true,reduceMotion:true}));location.reload()`);
      await wait(450); await click('Log in'); await wait(300);
    }
    results.matrices.push({route,appearance,...await measure()});
  }
  check('94 responsive layout cases: EN/JA, 320/390/768/1440, normal/1.3x, expanded reminder forms, dark/high contrast and reduced motion');
  }

  await navigate('/her');
  assert.equal(await evaluate(`document.querySelectorAll('[aria-label="See My Day"]').length`),1);
  assert.equal(await evaluate(`document.querySelectorAll('[aria-label="My Home"]').length`),1);
  await click(en.hCompanion); await routeIs('/her/companion');
  await click(en.hToday); await routeIs('/her');
  await click(en.hSeeDay); await routeIs('/her/my-day');
  await click(en.hToday); await click(en.hRequestHelp); await routeIs('/her/help');
  await click(en.hHelpers); await routeIs('/her/helpers'); await has(en.doorRule);
  await click(en.hToday); await click(en.hHelpers); await routeIs('/her/helpers');
  check('Today Companion, single My Day action, Help and booked Helpers; duplicate hub rows removed');
  for (const [label,route] of [['hRequestHelp','/her/help'],['hHelpers','/her/helpers'],['hSafety','/her/safety'],['hHouseInfo','/her/house-information'],['hDigital','/her/digital-house'],['hSmart','/her/smart-home']]) {
    await navigate('/her/my-home'); await click(en[label]); await routeIs(route); await wait(150);
    results.routes.push({route,via:'My Home',title:await evaluate(`document.querySelector('[aria-level="1"]')?.textContent`)});
  }
  check('all six My Home destinations remain reachable');
  for (const [label,route] of [['hSettings','/her/settings'],['hMemories','/her/memories'],['hFriends','/her/friends'],['hMyHome','/her/my-home'],['hToday','/her']]) {
    await click(en[label]); await routeIs(route);
  }
  await click(en.hSettings); await click(en.cProfile); await routeIs('/her/profile');
  assert.equal((await tabs()).some(t=>t.selected==='true'),false); await has('Settings / My private profile');
  await click(en.hSettings); await click(en.cPrivacy); await routeIs('/her/privacy');
  assert.equal((await tabs()).some(t=>t.selected==='true'),false); await has('Settings / Companion privacy');
  await navigate('/her/friends/conversation/aiko'); await has('Friends / Messages');
  assert.equal((await tabs()).find(t=>t.selected==='true').name,'Friends');
  check('all four primary destinations; Settings/Profile/Privacy and Friends/Messages orientation');
  await click(en.hSettings); await click(en.appSettingsTitle);
  for (const section of ['settingsAppearance','settingsNotifications','settingsAccessibility','settingsPrivacy','settingsAbout']) await has(en[section]);
  await key('Escape');
  await click(en.hRecording); await wait(200);
  assert.equal((await recorded()).at(-1).path,'/api/home/tanaka/consent');
  assert.equal(typeof (await recorded()).at(-1).body.recording,'boolean');
  await click(en.dsChangeLanguage); await has(ja.hSettings); await click(ja.dsChangeLanguage);
  await click(en.hSharing); await routeIs('/her/memories/collection?filter=sharing');
  check('header Settings retains app preferences, language, separate recording consent and sharing route');

  await navigate('/her/help');
  for (const service of ['garden','cleaning','repair','lifting']) for (const when of ['soon','next-visit']) {
    await click(en['svc_'+service]);
    assert.equal(await evaluate(`Boolean(${buttonExpression(en.svc_garden)})`),false);
    assert.equal(await evaluate('document.activeElement?.getAttribute("aria-label")'),en.hChooseTiming);
    await click(en['when_'+when]); await has(en.hRequestRecorded); await has(en.hChooseService);
    assert.deepEqual((await recorded()).at(-1).body,{kind:service,when,by:'her'});
  }
  await click(en.svc_garden); await click(en.hChangeService); await has(en.hChooseService);
  const before = (await recorded()).length;
  await click(en.svc_cleaning); await fetch(base + '/__verification/fail-next-help');
  await click(en.when_soon); await has(en.dsConnectionBody);
  assert.equal((await recorded()).length,before+1);
  await click(en.when_soon); await has(en.hRequestRecorded);
  assert.deepEqual((await recorded()).at(-1).body,{kind:'cleaning',when:'soon',by:'her'});
  await has(en.hWaitingRequests); await has(en.hRequestedNote); await has(en.hCompletedServices);
  for (const feedback of ['good','okay','not-good']) {
    await fetch(base + '/__verification/stage3'); await navigate('/her/help');
    await click(en['fb_'+feedback]); await wait(250);
    assert.deepEqual((await recorded()).at(-1).body,{feedback});
  }
  await fetch(base + '/__verification/stage3'); await navigate('/her/help');
  await fetch(base + '/__verification/fail-next-mutation'); await click(en.fb_good); await has(en.dsConnectionBody);
  await click(en.fb_good); await has(en.thanksFeedback);
  await click(en.hHelpers); await has(en.doorRule); await has(en.hBookingNote);
  assert.equal(await evaluate(`Boolean(${buttonExpression(en.when_soon)})`),false);
  check('four services x both timings, change/cancel, failed request/rating retry, all ratings and read-only booked visitors');

  await navigate('/her/my-day');
  await click(en.viewMap); await routeIs('/her/digital-house?view=map'); await navigate('/her/my-day');
  assert.equal(await evaluate('document.querySelectorAll("input").length'),0);
  assert.equal(await evaluate(`Boolean(document.querySelector('[aria-label="Past plans"][aria-expanded="false"]'))`),true);
  await click(en.hPlanHistory); await has(en.hPastNote); await click(en.hPlanHistory);
  await click('Add a reminder or activity');
  assert.equal(await evaluate(`document.querySelector('[role="dialog"]')!==null`),true);
  await screenshot('phase2-reminder-form-en-390');
  await evaluate(`document.querySelector('[role="dialog"] [role="button"]').focus()`); await key('Tab',8);
  assert.equal(await evaluate(`document.querySelector('[role="dialog"]').contains(document.activeElement)`),true);
  await key('Escape');
  assert.equal(await evaluate(`document.activeElement?.getAttribute('aria-label')`),'Add a reminder or activity');
  await click('Add a reminder or activity'); await click('Add to My Day'); await has('Enter a title, a valid date');
  await fill('What would you like to remember?','A little reading');
  await fill('Date (YYYY-MM-DD)','2026-02-30'); await click('Add to My Day'); await has('Enter a title, a valid date');
  await fill('Date (YYYY-MM-DD)','2026-10-18'); await fill('Time (24-hour HH:MM)','16:00'); await click('Add to My Day');
  await has('Added to your local My Day.'); await has('A little reading');
  await click('Mark completed · A little reading'); await has('Marked completed.');
  await click('Completed reminders'); await click('Mark as to do · A little reading'); await has('Marked as to do.');
  await click('A gentle suggestion'); await click('Plan a quiet activity');
  assert.equal(await evaluate(`document.querySelector('input[aria-label="What would you like to remember?"]').value`),'Time for a favourite hobby');
  assert.equal(await evaluate(`document.querySelector('input[aria-label="Time (24-hour HH:MM)"]').value`),'15:00');
  await click('Cancel');
  await click('People you trust'); await click('Family contact · Kenji'); await has('No phone number is stored here.');
  await click('Your visiting students'); await routeIs('/her/friends');
  await navigate('/her/my-day'); await has('A little reading');
  await click('People you trust'); await click(en.hHelpers); await routeIs('/her/helpers');
  check('My Day history disclosures, focused reminder form, invalid dates, add, complete, undo, reload persistence, suggestion prefill, cancel and contact routes');

  for (const route of ['/her/companion','/her/friends','/her/friends/communities','/her/friends/demo','/her/friends/permissions','/her/friends/conversation/aiko','/her/digital-house?view=map','/her/house-information','/her/safety','/her/smart-home','/her/memories','/her/item/sewing','/her/settings','/her/profile','/her/privacy',...['all','photos','audio','stories','decisions','wishes','sharing'].map(f=>'/her/memories/collection?filter='+f)]) {
    await navigate(route);
    results.routes.push({route,direct:true,title:await evaluate(`document.querySelector('[aria-level="1"]')?.textContent`)});
    assert.ok(results.routes.at(-1).title,route);
  }
  await fetch(base + '/__verification/fail-next-home'); await navigate('/her'); await has(en.dsConnectionTitle); await click(en.retry); await has(en.hGlance);
  await fetch(base + '/__verification/stage2?empty=1');
  for (const route of core) { await navigate(route); results.matrices.push({route,empty:true,...await measure()}); }
  check('all existing elderly routes and seven collection queries, household error/retry and five empty states');
  results.failures=results.matrices.filter(r=>r.overflow.length||r.small.length);
  fs.writeFileSync(path.join(output,process.argv.includes('--interactions-only')?'interactions.json':'verification.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({matrices:results.matrices.length,failures:results.failures,interactions:results.interactions.length,routes:results.routes.length,exceptions:results.exceptions},null,2));
  ws.close(); await fetch('http://127.0.0.1:9223/json/close/'+target.id);
  process.exitCode=results.failures.length||results.exceptions.length?1:0;
}
main().catch(error=>{fs.writeFileSync(path.join(output,'error.json'),JSON.stringify({error:String(error),results},null,2));console.error(error);process.exit(1);});
