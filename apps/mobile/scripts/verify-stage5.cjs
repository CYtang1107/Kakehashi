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
  const buttonExpression = name => `Array.from((document.querySelector('[role="alertdialog"],[role="dialog"]') || document).querySelectorAll('[role="button"],[role="tab"],[role="switch"],[role="radio"],[role="checkbox"],button')).find(element => (element.getAttribute('aria-label') === ${JSON.stringify(name)} || element.textContent.trim() === ${JSON.stringify(name)}) && element.getClientRects().length && !element.closest('[aria-hidden="true"]'))`;
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
    const controls=Array.from(document.querySelectorAll('[role="button"],[role="switch"],[role="tab"],[role="radio"],[role="checkbox"],input,textarea'))
      .filter(element=>element.getClientRects().length && !element.closest('[aria-hidden="true"]'));
    const small=controls.map(element=>({name:element.getAttribute('aria-label')||element.textContent.trim(),width:element.getBoundingClientRect().width,height:element.getBoundingClientRect().height}))
      .filter(box=>box.width<44 || box.height<44);
    const overflow=Array.from(document.querySelectorAll('*')).filter(element=>{ const box=element.getBoundingClientRect(); const css=getComputedStyle(element); return box.width>0 && box.right>innerWidth+2 && css.position!=='absolute' && !element.closest('svg'); }).slice(0,8).map(element=>element.textContent.slice(0,100));
    return {width:innerWidth,small,overflow,controlCount:controls.length,title:document.querySelector('[role="heading"]')?.textContent};
  })()`);
  const screenshot = async (name, fromTop = true) => {
    if (fromTop) await evaluate('Array.from(document.querySelectorAll("div")).filter(element => element.scrollHeight>element.clientHeight+20 && /auto|scroll/.test(getComputedStyle(element).overflowY)).forEach(element=>element.scrollTop=0); window.scrollTo(0,0);');
    const capture = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(capture.data, 'base64'));
  };

  const dictionary = language => language === 'ja' ? japanese : translations;
  const has = async text => { for(let i=0;i<70;i++){ if(await evaluate('document.body.innerText.includes('+JSON.stringify(text)+')'))return;await wait(100); } throw Error('Missing text: '+text); };
  const recorded = async () => (await (await fetch(base+'/__verification/requests')).json()).filter(r=>r.method!=='GET');
  const field = async (label,text) => {
    // Existing route heading focus settles after 150ms; type after that transition.
    await wait(200);
    await evaluate('(()=>{const e=Array.from(document.querySelectorAll("input,textarea")).find(e=>e.getClientRects().length && !e.closest(\'[aria-hidden="true"]\') && e.getAttribute("aria-label")==='+JSON.stringify(label)+');if(!e)throw Error("Missing input: "+'+JSON.stringify(label)+');e.scrollIntoView({block:"center"});e.focus();})()');
    await key('a',2); await command('Input.insertText',{text});await wait(40);
    assert.equal(await evaluate('Array.from(document.querySelectorAll("input,textarea")).find(e=>e.getClientRects().length && !e.closest(\'[aria-hidden="true"]\') && e.getAttribute("aria-label")==='+JSON.stringify(label)+').value'),text);
  };
  const clickSelector = async selector => { const point=await evaluate('(()=>{const e=document.querySelector('+JSON.stringify(selector)+');if(!e)throw Error("Missing selector");e.scrollIntoView({block:"center"});const b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2};})()');await command('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await command('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});await wait(150); };

  const profileKey='kakehashi-evercircle-tanaka-v1',socialKey='kakehashi-social-demo-v1';
  const stored=k=>evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(k)})||'null')`);
  const put=(k,value)=>evaluate(`localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(JSON.stringify(value))})`);
  const label=(key,values={})=>Object.entries(values).reduce((s,[k,v])=>s.replaceAll('{'+k+'}',v),translations[key]);
  const record=name=>results.interactions.push({name,passed:true});
  const acceptDialog=async key=>{await has(translations[key]);await click(translations[key]);await wait(150);};
  const switchAccount=async name=>{await navigate('/her/friends/demo');await click(label('sUseDemo',{name}));await wait(180);};
  await fetch(base+'/__verification/stage3?weather=demo');await navigate('/her/friends');await evaluate(`localStorage.removeItem('${profileKey}');localStorage.removeItem('${socialKey}')`);await navigate('/her/companion');
  await field(translations.cMessage,'I enjoy growing orchids.');await click(translations.cSend);await has(translations.cRemember);
  // Each Remember is disabled while the previous save runs; wait for each save before the next tap.
  const approvedCount=async n=>{for(let i=0;i<50;i++){if(((await stored(profileKey))?.approved.length||0)===n)return;await wait(100);}assert.equal((await stored(profileKey))?.approved.length||0,n);};
  assert.equal((await stored(profileKey)).approved.length,0);await click(translations.cRemember);await approvedCount(1);await click(translations.cRemember);await approvedCount(2);
  await navigate('/her/friends');await has(translations.sEligibility_optedOut);assert.equal(await evaluate('document.body.innerText.includes("Aiko Mori")'),false);
  await click(translations.sPermissions);await click(translations.sMaster);
  await click(label('cShareInterest',{interest:translations.cInterest_gardening}));await click(label('cShareInterest',{interest:translations.cInterest_orchids}));await click(translations.sIdentity);await click(translations.sBackFriends);
  await has(label('sSharedHobbies',{values:translations.cInterest_gardening+' / '+translations.cInterest_orchids}));await has(label('sScore',{score:40}));
  await screenshot('stage5-discovery-ready-en-390');
  await evaluate(`(${buttonExpression(translations.sInvite+': Aiko Mori')}).scrollIntoView({block:'center'})`);await screenshot('stage5-recommendation-en-390',false);
  await click(translations.sInvite+': Aiko Mori');await has(label('sInviteTitle',{name:'Aiko Mori'}));assert.equal((await stored(socialKey)).relations.length,0);await click(translations.dsCancel);assert.equal((await stored(socialKey)).relations.length,0);
  await click(translations.sInvite+': Aiko Mori');await acceptDialog('sConfirmInvite');await has(translations.sState_sent);assert.equal((await stored(socialKey)).relations[0].status,'pending');
  record('conversation, explicit approval, independent sharing, 40-point recommendation, invitation Cancel/confirmation');
  await switchAccount('Aiko Mori');await has(translations.sState_received);await click(translations.sAccept+': Michiko Tanaka');await acceptDialog('sAccept');assert.equal((await stored(socialKey)).relations[0].status,'accepted');
  await click(translations.sOpenMessages+': Michiko Tanaka');await field(label('sMessageTo',{name:'Michiko Tanaka'}),'Hello Michiko, let us talk about orchids.');await click(translations.sSend);await has('Hello Michiko, let us talk about orchids.');await click(translations.sSimulateReply);await has(translations.sMockReply);
  await switchAccount('Michiko Tanaka');await click(translations.sOpenMessages+': Aiko Mori');await has('Hello Michiko, let us talk about orchids.');await field(label('sMessageTo',{name:'Aiko Mori'}),'I would enjoy that.');await click(translations.sSend);assert.equal((await stored(socialKey)).messages.length,3);
  await wait(350);await screenshot('stage5-message-sent-en-390',false);record('recipient account acceptance, bidirectional accepted-only text and explicitly scripted reply, reload consistency');
  const readyProfile=await stored(profileKey),acceptedSocial=await stored(socialKey);
  await navigate('/her/friends/permissions');await click(translations.sMaster);assert.equal((await stored(profileKey)).matchingEnabled,false);assert.equal((await stored(profileKey)).approved.length,2);
  await navigate('/her/friends');await has(translations.sNoMatches);await click(translations.sOpenMessages+': Aiko Mori');await field(label('sMessageTo',{name:'Aiko Mori'}),'We can still talk.');await click(translations.sSend);await has('We can still talk.');
  await click(translations.sReport);await has(translations.sReportBody);await acceptDialog('sConfirmReport');assert.equal((await stored(socialKey)).reports.length,1);
  await click(translations.sBlock);await acceptDialog('sBlock');await has(translations.sMessageClosed);assert.equal(await evaluate(`Array.from(document.querySelectorAll('textarea')).find(e=>e.getClientRects().length&&!e.closest('[aria-hidden="true"]')).readOnly`),true);
  await switchAccount('Aiko Mori');await navigate('/her/friends/conversation/tanaka');await has(translations.sMessageClosed);assert.equal(await evaluate('document.body.innerText.includes("We can still talk.")'),false);
  record('matching opt-out keeps friendship/memory; local report; bilateral block disables already-open composer and hides conversation');
  await switchAccount('Michiko Tanaka');await navigate('/her/friends/permissions');await click(translations.sBlockedPeople);await click(translations.sUnblock+': aiko');assert.equal((await stored(socialKey)).relations.length,0);
  await put(profileKey,readyProfile);await navigate('/her/friends');await click(translations.sInvite+': Aiko Mori');await acceptDialog('sConfirmInvite');await switchAccount('Aiko Mori');await click(translations.sDecline);await acceptDialog('sDecline');assert.equal((await stored(socialKey)).relations[0].status,'declined');
  record('unblocking does not restore connection; recipient decline remains disconnected');
  await navigate('/her/friends/communities');await click(translations.sJoin+': '+translations.sCommunity_gardening);await acceptDialog('sJoin');await has(translations.sJoined);assert.equal((await stored(socialKey)).memberships[0].personId,'aiko');await click(translations.sLeave+': '+translations.sCommunity_gardening);assert.equal((await stored(socialKey)).memberships.length,0);
  await switchAccount('Michiko Tanaka');await navigate('/her/profile');await field(translations.cDisplayName,'Changed private name');await click(translations.cSaveProfile);await navigate('/her/friends');await has(translations.sEligibility_identityPrivate);assert.equal(await evaluate('document.body.innerText.includes("Compatibility: ")'),false);
  record('community join/leave, account isolation, private-profile edit invalidates disclosure and recommendations');
  await put(profileKey,readyProfile);await put(socialKey,acceptedSocial);await navigate('/her/friends/conversation/aiko');
  await evaluate(`(()=>{const original=Storage.prototype.setItem;window.restoreSocial=()=>Storage.prototype.setItem=original;Storage.prototype.setItem=function(k,v){if(k==='${socialKey}')throw Error('Simulated disk failure');return original.call(this,k,v);};})()`);
  await click(translations.sBlock);await acceptDialog('sBlock');await has(translations.sStorageError);await has(translations.sMessageClosed);await evaluate('window.restoreSocial()');await click(translations.cRetrySave);assert.equal((await stored(socialKey)).settings.tanaka.blocked.includes('aiko'),true);
  await evaluate(`localStorage.setItem('${socialKey}','{')`);await navigate('/her/friends');await has(translations.sLoadError);await click(translations.cContinueSession);await has(translations.sSession);assert.equal(await evaluate(`localStorage.getItem('${socialKey}')`),'{');
  record('write failure pauses actions while blocking immediately; retry persists; corrupt storage session fallback preserves bytes');
  assert.deepEqual(await recorded(),[]);record('social journey makes no household API mutations');
  await put(profileKey,readyProfile);await put(socialKey,acceptedSocial);
  if(!process.argv.includes('--interactions-only'))for(const language of ['en','ja'])for(const width of [320,390,768,1440])for(const mode of ['normal','extraLarge'])for(const route of ['/her/friends','/her/friends/permissions','/her/friends/demo','/her/friends/communities','/her/friends/conversation/aiko']){
    await navigate(route,width,language,mode,mode==='extraLarge');await has(dictionary(language).sDemoIdentity.split('{')[0]);results.matrices.push({route,language,mode,...await measure()});
    if([390,1440].includes(width)&&mode==='extraLarge'){
      if(route.includes('conversation')){await wait(350);await screenshot('stage5-history-'+language+'-'+width,false);}
      await screenshot('stage5-'+(route.includes('conversation')?'conversation':route.split('/').at(-1))+'-'+language+'-'+width);
    }
  }
  results.failures=results.matrices.filter(r=>r.small.length||r.overflow.length);
  fs.writeFileSync(path.join(output,'stage5-verification.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({matrices:results.matrices.length,failures:results.failures,interactions:results.interactions,exceptions:results.exceptions},null,2));
  ws.close();await fetch('http://127.0.0.1:9223/json/close/'+target.id);process.exitCode=results.failures.length||results.exceptions.length?1:0;
}
const source=fs.readFileSync(path.resolve(__dirname,'../src/i18n.tsx'),'utf8');
const ts=require('typescript');
const dict=source.slice(source.indexOf('const en = ')+11,source.indexOf('\nexport type Key'));
const translations=Function('return '+dict.replace(/;\s*$/,''))();
const jaStart=source.indexOf('const ja:');
const jaBody=source.slice(source.indexOf('= {',jaStart)+2,source.indexOf('\n};',jaStart)+2);
const japanese=Function('return '+jaBody)();
main().catch(error=>{fs.writeFileSync(path.join(output,'stage5-error.json'),JSON.stringify({error:String(error),results},null,2));console.error(error);process.exit(1);});
