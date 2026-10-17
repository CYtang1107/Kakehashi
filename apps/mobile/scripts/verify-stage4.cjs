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

  const featureKey='kakehashi-evercircle-tanaka-v1';
  const saved=()=>evaluate('JSON.parse(localStorage.getItem('+JSON.stringify(featureKey)+')||"null")');
  const seed=async state=>evaluate('localStorage.setItem('+JSON.stringify(featureKey)+','+JSON.stringify(JSON.stringify(state))+')');
  await fetch(base+'/__verification/stage3?weather=demo');await navigate('/her/companion');await evaluate('localStorage.removeItem('+JSON.stringify(featureKey)+')');await navigate('/her/companion');
  if(process.argv.includes('--resume-interactions'))results.matrices=JSON.parse(fs.readFileSync(path.join(output,'stage4-layouts.json'),'utf8')).matrices;
  if(!process.argv.includes('--interactions-only')&&!process.argv.includes('--resume-interactions')) {
    for(const language of ['en','ja'])for(const width of [320,390,768,1440])for(const mode of ['normal','extraLarge'])for(const route of ['/her/companion','/her/profile','/her/privacy']){
      await navigate(route,width,language,mode,mode==='extraLarge');await has(dictionary(language)[route.endsWith('companion')?'cWelcome':route.endsWith('profile')?'cDisplayName':'cMatching']);results.matrices.push({route,language,mode,...await measure()});
      if([390,1440].includes(width)&&mode==='extraLarge')await screenshot('stage4-'+route.split('/').at(-1)+'-'+language+'-'+width);
    }
    fs.writeFileSync(path.join(output,'stage4-layouts.json'),JSON.stringify(results,null,2));
  }
  const say=async text=>{await field(translations.cMessage,text);await click(translations.cSend);await wait(500);};
  await navigate('/her/companion');await say('I enjoy growing orchids.');await has(translations.cPending);
  assert.equal((await saved()).approved.length,0);assert.deepEqual((await saved()).pending,[]);assert.equal((await saved()).matchingEnabled,false);assert.equal(JSON.stringify(await saved()).includes('orchids'),false);assert.equal(JSON.stringify(await saved()).includes('I enjoy'),false);await has(translations.cInterest_gardening);await has(translations.cInterest_orchids);
  await click(translations.cRemember);await wait(100);assert.equal((await saved()).approved[0].id,'gardening');assert.equal((await saved()).approved[0].shareForMatching,false);
  await click(translations.cNotNow);await wait(100);assert.deepEqual((await saved()).pending,[]);await has(translations.cRejected);
  results.interactions.push({name:'orchid normalization, pending-only detection, explicit private approval, Not now, no transcript persistence',passed:true});
  await click(translations.cPrivacy);await click(translations.cMatching);await wait(100);assert.equal((await saved()).matchingEnabled,true);assert.equal((await saved()).approved[0].shareForMatching,false);await has(translations.cEligibleNone);
  const shareLabel=translations.cShareInterest.replace('{interest}',translations.cInterest_gardening);await click(shareLabel);await wait(100);assert.equal((await saved()).approved[0].shareForMatching,true);
  await click(translations.cProfile);await click(translations.cEdit);await click(translations.cInterest_chess);await click(translations.cSaveChanges);await wait(100);assert.equal((await saved()).approved[0].id,'chess');assert.equal((await saved()).approved[0].shareForMatching,false);
  await click(translations.cPrivacy);await click(translations.cShareInterest.replace('{interest}',translations.cInterest_chess));await wait(100);await click(translations.cProfile);
  await click(translations.cDelete);await click(translations.dsCancel);assert.equal((await saved()).approved.length,1);await click(translations.cDelete);await click(translations.cDelete);await wait(100);assert.deepEqual((await saved()).approved,[]);
  await click(translations.cPrivacy);await has(translations.cEligibleNone);results.interactions.push({name:'matching master plus interest opt-in; edit revokes grant; confirmed deletion removes matching interest; Cancel preserves it',passed:true});
  await click(translations.cProfile);await field(translations.cDisplayName,'Michiko demo');
  for(const [group,choice] of [['cLanguages','cOption_ja'],['cActivities','cOption_tea'],['cTimes','cOption_morning'],['cCommunication','cOption_text'],['cLocations','cOption_library']]){await click(translations[group]);await click(translations[choice]);}
  await click(translations.cSaveProfile);await wait(100);await has(translations.cProfileSaved);
  const expected={displayName:'Michiko demo',languages:['ja'],activities:['tea'],times:['morning'],communication:['text'],locations:['library']};assert.deepEqual((await saved()).profile,expected);
  await navigate('/her/profile');assert.equal(await evaluate('document.querySelector("input").value'),'Michiko demo');assert.deepEqual((await saved()).profile,expected);
  await navigate('/her/companion');assert.equal(await evaluate('document.body.innerText.includes("I enjoy growing orchids.")'),false);results.interactions.push({name:'private profile fields saved; state survives screen/reload; chat remains session-only',passed:true});
  await say('I want to record the story behind my old sewing machine.');await has(translations.cMemoryReply);await click(translations.cOpenMemories);assert.equal(await evaluate('location.pathname'),'/her/memories');
  await click(translations.hHome);await click(translations.hCompanion);await say('Help me with my home.');await has(translations.cHelpReply);await click(translations.hRequestHelp);assert.equal(await evaluate('location.pathname'),'/her/help');
  await click(translations.hHome);await click(translations.hCompanion);await say('What is planned for today?');await click(translations.hDay);assert.equal(await evaluate('location.pathname'),'/her/my-day');
  await click(translations.hHome);await click(translations.hCompanion);await say('I want to make new friends.');await has(translations.sEligibility_identityPrivate);await click(translations.cProfile);assert.equal(await evaluate('location.pathname'),'/her/profile');
  await click(translations.hCompanion);await say('Adjust my thermostat.');await has(translations.cDeviceReply);await say('Set a reminder.');await has(translations.cReminderReply);await say('Buy me an airplane ticket.');await has(translations.cUnsupported);
  assert.deepEqual(await recorded(),[]);results.interactions.push({name:'memory/help/day/friend-profile navigation and honest device/reminder/unsupported states, no mutation requests',passed:true});
  // Fully synthetic setup to verify grant revocation despite a blocked persistence write.
  let demo=await saved();demo.approved=[{id:'gardening',revision:1,shareForMatching:true}];demo.matchingEnabled=true;await seed(demo);await navigate('/her/privacy');
  await evaluate('(()=>{const original=Storage.prototype.setItem;window.restoreFeatureStorage=()=>Storage.prototype.setItem=original;Storage.prototype.setItem=function(k,v){if(k==='+JSON.stringify(featureKey)+')throw Error("Verification storage failure");return original.call(this,k,v);};})()');
  await click(translations.cMatching);await has(translations.cStorageError);await has(translations.cEligibleNone);await evaluate('window.restoreFeatureStorage()');await click(translations.cRetrySave);await wait(100);assert.equal((await saved()).matchingEnabled,false);assert.equal((await saved()).approved[0].shareForMatching,false);results.interactions.push({name:'permission revocation immediately removes eligibility during failed write; retry persists revocation',passed:true});
  await evaluate('localStorage.setItem('+JSON.stringify(featureKey)+',"{")');await navigate('/her/privacy');await has(translations.cLoadError);await click(translations.cContinueSession);await has(translations.cSession);assert.equal(await evaluate('localStorage.getItem('+JSON.stringify(featureKey)+')'),'{');
  await navigate('/her/privacy');await has(translations.cLoadError);await seed({...demo,householdId:'another-household',profile:{...demo.profile,displayName:'Another private resident'}});await navigate('/her/profile');await has(translations.cLoadError);assert.equal(await evaluate('document.body.innerText.includes("Another private resident")'),false);results.interactions.push({name:'corrupt or unrelated household state fails closed; session fallback does not overwrite saved bytes',passed:true});
  await seed(demo);await navigate('/her/privacy');await click(translations.cClearProfile);await click(translations.dsCancel);assert.equal((await saved()).approved.length,1);await click(translations.cClearProfile);await click(translations.cClearProfile);await wait(100);assert.deepEqual((await saved()).approved,[]);assert.deepEqual((await saved()).pending,[]);assert.equal((await saved()).matchingEnabled,false);assert.equal((await saved()).profile.displayName,'');assert.deepEqual(await recorded(),[]);
  results.interactions.push({name:'clear-profile confirmation resets feature data and consent only; Cancel preserves it',passed:true});
  await navigate('/her/companion');await say('I enjoy growing orchids.');await has(translations.cRemember);assert.deepEqual((await saved()).pending,[]);assert.deepEqual((await saved()).approved,[]);
  await navigate('/her/companion');await has(translations.cWelcome);assert.equal(await evaluate('Boolean('+buttonExpression(translations.cRemember)+')'),false);assert.deepEqual((await saved()).approved,[]);
  results.interactions.push({name:'unapproved suggestions are session-only: visible before reload, absent from storage and after reload',passed:true});
  await fetch(base+'/__verification/fail-next-home');await navigate('/her/companion');await has(translations.cWelcome);await say('When is the next student visit?');await has(translations.cVisitUnknown);results.interactions.push({name:'companion remains usable without household load; no invented visit date',passed:true});
  const synthetic={version:1,householdId:'tanaka',profile:expected,approved:[{id:'gardening',revision:1,shareForMatching:false}],pending:['orchids'],matchingEnabled:false};
  if(!process.argv.includes('--interactions-only'))for(const language of ['en','ja'])for(const width of [390,1440]){
    await seed(synthetic);await navigate('/her/companion',width,language,'extraLarge',true);
    await field(dictionary(language).cMessage,language==='en'?'I enjoy growing orchids.':'\u862d\u3092\u80b2\u3066\u308b\u306e\u304c\u597d\u304d\u3067\u3059\u3002');await click(dictionary(language).cSend);await wait(600);
    results.matrices.push({route:'/her/companion',language,width,state:'conversation',...await measure()});await screenshot('stage4-conversation-'+language+'-'+width,false);
  }
  if(!process.argv.includes('--interactions-only'))for(const language of ['en','ja'])for(const width of [390,1440])for(const route of ['/her/profile','/her/privacy']){await seed(synthetic);await navigate(route,width,language,'extraLarge',true);results.matrices.push({route,language,state:'populated',...await measure()});await screenshot('stage4-'+route.split('/').at(-1)+'-populated-'+language+'-'+width);}
  results.failures=results.matrices.filter(r=>r.small.length||r.overflow.length);fs.writeFileSync(path.join(output,process.argv.includes('--interactions-only')?'stage4-interactions.json':'stage4-verification.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({matrices:results.matrices.length,failures:results.failures,interactions:results.interactions,exceptions:results.exceptions},null,2));ws.close();await fetch('http://127.0.0.1:9223/json/close/'+target.id);process.exitCode=results.failures.length||results.exceptions.length?1:0;
}
const source=fs.readFileSync(path.resolve(__dirname,'../src/i18n.tsx'),'utf8');
const ts=require('typescript');
const dict=source.slice(source.indexOf('const en = ')+11,source.indexOf('\nexport type Key'));
const translations=Function('return '+dict.replace(/;\s*$/,''))();
const jaStart=source.indexOf('const ja:');
const jaBody=source.slice(source.indexOf('= {',jaStart)+2,source.indexOf('\n};',jaStart)+2);
const japanese=Function('return '+jaBody)();
main().catch(error=>{fs.writeFileSync(path.join(output,'stage4-error.json'),JSON.stringify({error:String(error),results},null,2));console.error(error);process.exit(1);});
