// Browser checks through Chrome DevTools Protocol. No npm/browser downloads required.
// Start preview-design-system.cjs and a headless Chrome at --remote-debugging-port=9223 first.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const output = path.resolve(__dirname, '../.impeccable/review');
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
  let initializer;
  const navigate = async (route, width = 390, language = 'en', mode = 'normal', highContrast = false) => {
    await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    if (initializer) await command('Page.removeScriptToEvaluateOnNewDocument', { identifier: initializer });
    initializer = (await command('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('kakehashi-lang',${JSON.stringify(language)});localStorage.setItem('kakehashi-reading-preferences-v1',${JSON.stringify(JSON.stringify({ textMode: mode, highContrast, reduceMotion: true }))});` })).identifier;
    await command('Page.navigate', { url: base + route });
    for (let attempt = 0; attempt < 120; attempt++) {
      await wait(100);
      if (await evaluate(`document.body?.innerText.includes(${JSON.stringify(language === 'en' ? 'Settings' : '\u8a2d\u5b9a')})`)) break;
      if (attempt === 119) throw new Error('Screen did not load: ' + route);
    }
    await evaluate('document.fonts.ready.then(() => true)'); await wait(120);
  };
  const measure = () => evaluate(`(() => {
    const controls=Array.from(document.querySelectorAll('[role="button"],[role="switch"],[role="tab"],[role="radio"],input,textarea'))
      .filter(element=>element.getClientRects().length && !element.closest('[aria-hidden="true"]'));
    const small=controls.map(element=>({name:element.getAttribute('aria-label')||element.textContent.trim(),width:element.getBoundingClientRect().width,height:element.getBoundingClientRect().height}))
      .filter(box=>box.width<44 || box.height<44);
    const overflow=Array.from(document.querySelectorAll('*')).filter(element=>{ const box=element.getBoundingClientRect(); const css=getComputedStyle(element); return box.width>0 && box.right>innerWidth+2 && css.position!=='absolute' && !element.closest('svg'); }).slice(0,8).map(element=>element.textContent.slice(0,100));
    return {width:innerWidth,small,overflow,controlCount:controls.length,title:document.querySelector('[role="heading"]')?.textContent};
  })()`);
  const screenshot = async name => {
    await evaluate('Array.from(document.querySelectorAll("div")).filter(element => element.scrollHeight>element.clientHeight+20 && /auto|scroll/.test(getComputedStyle(element).overflowY)).forEach(element=>element.scrollTop=0); window.scrollTo(0,0);');
    const capture = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(capture.data, 'base64'));
  };
  if (process.argv.includes('--editor-only')) {
    await fetch(base + '/__verification/stage2');
    const home = await (await fetch(base + '/api/home/tanaka')).json();
    const expected = home.items.find(i=>i.id==='sewing').storyJa;
    await navigate('/her/item/sewing',390,'ja','extraLarge',true);
    assert.equal(await evaluate("document.querySelector('textarea').value"),expected);
    const writes = async () => (await (await fetch(base+'/__verification/requests')).json()).filter(r=>r.method==='PATCH');
    const before=(await writes()).length;
    await click(japanese.saveStory); assert.equal((await writes()).length,before);
    assert.equal((await (await fetch(base+'/api/home/tanaka')).json()).items.find(i=>i.id==='sewing').storyJa,expected);
    const edited=expected+' 新しい思い出を大切にしています。';
    await evaluate("document.querySelector('textarea').scrollIntoView({block:'center'});document.querySelector('textarea').focus()");
    await key('a',2); await command('Input.insertText',{text:edited});
    await click(japanese.hSettings); await click(japanese.dsChangeLanguage); await click('Back');
    await wait(300); assert.equal(await evaluate("document.querySelector('textarea').value"),edited);
    assert.equal(await evaluate("document.body.innerText.includes('Your unsaved draft is in 日本語')"),true);
    await evaluate("document.querySelector('textarea').scrollIntoView({block:'center'})");
    let capture=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,'stage2-editor-draft-390.png'),Buffer.from(capture.data,'base64'));
    await click(translations.saveStory); await wait(300); assert.deepEqual((await writes()).at(-1).body,{story:edited});
    await navigate('/her/item/sewing',1440,'ja','extraLarge',true);
    assert.equal(await evaluate("document.querySelector('textarea').value"),edited);
    assert.equal(await evaluate(`document.body.innerText.includes(${JSON.stringify(edited)})`),true);
    await evaluate("document.querySelector('textarea').scrollIntoView({block:'center'})");
    capture=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,'stage2-editor-saved-1440.png'),Buffer.from(capture.data,'base64'));
    results.interactions.push({name:'Japanese draft matches displayed prose; unchanged save makes no PATCH; dirty draft survives language switch; edited Japanese survives save and reload with server translation invalidation',passed:true});
    await fetch(base+'/__verification/stage2?weather=demo');
    for(const language of ['en','ja']) for(const width of [390,1440]) for(const route of ['/her','/her/help','/her/memories','/her/item/sewing']) {
      await navigate(route,width,language,'extraLarge',true);results.matrices.push({route,language,...await measure()});
      await screenshot(`stage2-${route.split('/').filter(Boolean).join('-')}-${language}-${width}`);
    }
    results.failures=results.matrices.filter(r=>r.small.length||r.overflow.length);
    fs.writeFileSync(path.join(output,'stage2-editor.json'),JSON.stringify(results,null,2));
    console.log(JSON.stringify({interactions:results.interactions,matrices:results.matrices.length,failures:results.failures,exceptions:results.exceptions},null,2));
    ws.close(); await fetch('http://127.0.0.1:9223/json/close/'+target.id);process.exitCode=results.failures.length||results.exceptions.length?1:0;return;
  }
  await fetch(base + '/__verification/stage2?weather=demo');
  const routes = ['/her','/her/friends','/her/my-home','/her/memories','/her/my-day','/her/help','/her/helpers','/her/settings','/her/safety','/her/house-information','/her/companion','/her/smart-home','/her/memories/collection','/her/item/sewing','/her/digital-house?view=map'];
  if (!process.argv.includes('--interactions-only')) for (const language of ['en','ja']) for (const width of [320,390,768,1440]) {
    for (const route of routes) {
      await navigate(route, width, language, 'extraLarge', true);
      results.matrices.push({route,language,mode:'extraLarge',...(await measure())});
      if ([390,1440].includes(width) && ['/her','/her/help','/her/memories','/her/item/sewing'].includes(route))
        await screenshot(`stage2-${route.split('/').filter(Boolean).join('-')}-${language}-${width}`);
    }
  }
  const recorded = async () => (await (await fetch(base + '/__verification/requests')).json()).filter(r => r.method !== 'GET');
  if (!process.argv.includes('--interactions-only')) for (const language of ['en','ja']) for (const width of [390,1440]) for (const mode of ['normal','large']) for (const route of ['/her','/her/friends','/her/my-home','/her/memories']) {
    await navigate(route,width,language,mode);
    results.matrices.push({route,language,mode,...await measure()});
  }
  const bodyHas = async text => { for(let i=0;i<50;i++){if(await evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`))return; await wait(100);}throw Error('Missing text: '+text); };
  await navigate('/her');
  await click('Talk to Companion'); await bodyHas('A scripted demo. Chat stays in this session.');
  await click('Back'); await bodyHas('A little company.');
  for (const tab of ['Friends','My Home','Memories','Home']) { await click(tab); assert.equal(await evaluate(`document.querySelector('[role=tab][aria-selected=true]').getAttribute('aria-label')`),tab); }
  results.interactions.push({name:'four primary destinations, companion entry and back',passed:true});
  await navigate('/her/help');
  await fetch(base + '/__verification/fail-next-help'); await click('Garden'); await click('Soon'); await bodyHas('Check your connection and try again.');
  await click('Soon'); await wait(250);
  assert.deepEqual((await recorded()).at(-1).body,{kind:'garden',when:'soon',by:'her'});
  // Every original category and both timing contracts.
  // Source translations are loaded by the fixture's TS hook below instead of guessed labels.
  for (const kind of ['garden','cleaning','repair','lifting']) for (const timing of ['soon','next-visit']) {
    await navigate('/her/help');
    const label = await evaluate(`Array.from(document.querySelectorAll('[role=button]')).find(e=>e.getAttribute('aria-label') && e.getBoundingClientRect().height>=120 && e.getAttribute('aria-label')===${JSON.stringify(translations['svc_'+kind])})?.getAttribute('aria-label')`);
    await click(label); await click(translations['when_'+timing]); await wait(250);
    assert.deepEqual((await recorded()).at(-1).body,{kind,when:timing,by:'her'});
  }
  for(const feedback of ['good','okay','not-good']) {
    await fetch(base + '/__verification/stage2'); await navigate('/her/help');
    await click(translations['fb_'+feedback]); await wait(250);
    assert.deepEqual((await recorded()).at(-1).body,{feedback});
  }
  results.interactions.push({name:'help failure/retry, four categories, both timings, three feedback values',passed:true});
  await fetch(base + '/__verification/stage2'); await navigate('/her/item/sewing');
  const before = (await recorded()).length;
  await click(translations.decision_keep); await click('Cancel'); assert.equal((await recorded()).length,before);
  await click(translations.decision_keep); await click(translations.decision_keep); await wait(250);
  assert.deepEqual((await recorded()).at(-1).body,{decision:'keep'});
  await click(translations.decision_open); await wait(250); assert.deepEqual((await recorded()).at(-1).body,{decision:'open'});
  await fetch(base + '/__verification/fail-next-mutation'); await click(translations.decision_family); await click(translations.decision_family); await bodyHas('Could not save. Please try again.');
  assert.equal(await evaluate("Boolean(document.querySelector('[role=alertdialog]'))"),true); await click('Cancel');
  const input = await evaluate("(() => {const e=document.querySelector('textarea');e.scrollIntoView({block:'center'});e.focus();const r=e.getBoundingClientRect();return {x:r.x+20,y:r.y+20};})()");
  await command('Input.dispatchMouseEvent',{type:'mousePressed',...input,button:'left',clickCount:1}); await command('Input.dispatchMouseEvent',{type:'mouseReleased',...input,button:'left',clickCount:1});
  await key('a',2); await command('Input.insertText',{text:'My saved memory.'}); await click(translations.saveStory); await wait(250); assert.equal((await recorded()).at(-1).body.story,'My saved memory.');
  await click(translations.shareWithdraw); await wait(250); assert.deepEqual((await recorded()).at(-1).body,{share:false});
  await click('I agree to share this story publicly'); await wait(250); assert.equal((await recorded()).at(-1).body.share,true);
  results.interactions.push({name:'item decision cancel/confirm/Not now/failure, story save, sharing withdrawal/opt-in',passed:true});
  await navigate('/her/settings'); await click('Allow audio recording'); await wait(250); assert.equal(typeof (await recorded()).at(-1).body.recording,'boolean');
  await click('Reading settings'); await key('Escape'); assert.equal(await evaluate("document.querySelector('[role=dialog]')===null"),true);
  await navigate('/her/friends'); await click('I’d like to go'); await wait(250); assert.deepEqual((await recorded()).at(-1).body,{status:'accepted'});
  await fetch(base + '/__verification/stage2'); await navigate('/her/friends'); await click(translations['act_not-now']); await wait(250); assert.deepEqual((await recorded()).at(-1).body,{status:'not-now'});
  results.interactions.push({name:'recording consent, reading settings, activity acceptance/defer',passed:true});
  await fetch(base + '/__verification/stage2?media=1'); await navigate('/her/item/sewing');
  await click(translations.next); await bodyHas('Verification illustration'); await click(translations.previous); await bodyHas('Verification photo');
  await click(translations.playStory); await bodyHas('Pause story'); await click('Pause story');
  await navigate('/her/memories/collection?filter=audio'); await bodyHas('Open Sewing machine');
  await navigate('/her/memories/collection?filter=photos'); await bodyHas('Open Sewing machine');
  await navigate('/her/digital-house');
  for(const view of ['view2d','viewMemory','viewMap','view3d']) { await click(translations[view]); await wait(200); }
  await click(translations.photosShort); await bodyHas(translations.photosShort);
  results.interactions.push({name:'photo previous/next, saved-audio play/pause, media collections, four digital-house views',passed:true});
  await fetch(base + '/__verification/fail-next-home'); await navigate('/her'); await bodyHas('We could not connect'); await click(translations.retry); await bodyHas('A little company.');
  await navigate('/her/my-day'); await bodyHas('Weather advice is unavailable');
  await fetch(base + '/__verification/stage2?weather=demo'); await navigate('/her'); await bodyHas('Heavy rain'); await bodyHas(translations.wxDemoLabel);
  results.interactions.push({name:'home fetch failure/retry, unavailable weather and labelled demo warning',passed:true});
  await fetch(base + '/__verification/stage2?empty=1');
  for(const route of ['/her','/her/my-day','/her/helpers','/her/memories/collection']) {await navigate(route);results.routes.push({route,empty:true,...await measure()});}
  await fetch(base + '/__verification/stage2');
  for(const route of ['/family','/family/house','/student','/item/sewing','/item/sewing?as=student','/stories']) {await navigate(route);results.routes.push({route,legacy:true,...await measure()});}
  results.failures=results.matrices.filter(r=>r.overflow.length||r.small.length);
  fs.writeFileSync(path.join(output,process.argv.includes('--interactions-only')?'stage2-interactions.json':'stage2-verification.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({matrices:results.matrices.length,failures:results.failures,interactions:results.interactions,exceptions:results.exceptions},null,2));
  ws.close(); await fetch('http://127.0.0.1:9223/json/close/'+target.id);
  process.exitCode=results.failures.length||results.exceptions.length?1:0;
}
const source=fs.readFileSync(path.resolve(__dirname,'../src/i18n.tsx'),'utf8');
const ts=require('typescript');
const dict=source.slice(source.indexOf('const en = ')+11,source.indexOf('\nexport type Key'));
const translations=Function('return '+dict.replace(/;\s*$/,''))();
const jaStart=source.indexOf('const ja:');
const jaBody=source.slice(source.indexOf('= {',jaStart)+2,source.indexOf('\n};',jaStart)+2);
const japanese=Function('return '+jaBody)();
main().catch(error=>{fs.writeFileSync(path.join(output,'stage2-error.json'),JSON.stringify({error:String(error),results},null,2));console.error(error);process.exit(1);});
