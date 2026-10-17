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

  const has = async text => { for(let i=0;i<80;i++){if(await evaluate('document.body.innerText.includes('+JSON.stringify(text)+')'))return;await wait(100);}throw Error('Missing text: '+text);};
  const field=async(label,text)=>{await wait(180);await evaluate(`(()=>{const e=Array.from(document.querySelectorAll('input,textarea')).find(e=>e.getClientRects().length&&!e.closest('[aria-hidden="true"]')&&e.getAttribute('aria-label')===${JSON.stringify(label)});if(!e)throw Error('Missing input');e.scrollIntoView({block:'center'});e.focus();})()`);await key('a',2);await command('Input.insertText',{text});await wait(60);};
  const demoKey='kakehashi-home-demo-tanaka-v1';
  const saved=()=>evaluate(`JSON.parse(localStorage.getItem('${demoKey}')||'null')`);
  const record=name=>{results.interactions.push({name,passed:true});console.log('ok '+name);};
  const send=async text=>{await field('Home command',text);await click('Apply simulated command');await wait(100);};
  if(process.argv.includes('--captures-only')) {
    const source=fs.readFileSync(path.resolve(__dirname,'../src/evercircle/homeDemo/copy.ts'),'utf8');
    const english=Function('return '+source.slice(source.indexOf('const en = ')+11,source.indexOf('\nconst ja:')).trim().replace(/;$/,''))();
    const start=source.indexOf('const ja:');const japanese=Function('return '+source.slice(source.indexOf('= {',start)+2,source.indexOf('\n};',start)+2))();
    const scrollText=async text=>{await evaluate(`Array.from(document.querySelectorAll('[role="heading"]')).find(e=>e.textContent===${JSON.stringify(text)}&&!e.closest('[aria-hidden="true"]'))?.scrollIntoView({block:'start'})`);await wait(100);};
    for(const language of ['en','ja'])for(const width of [390,1440]) {
      const c=language==='ja'?japanese:english;
      await navigate('/her/smart-home',width,language,'extraLarge',true);await has(c.controls);
      await evaluate(`(${buttonExpression(c.turnOff+' · '+c.living+' · '+c.light)} || ${buttonExpression(c.turnOn+' · '+c.living+' · '+c.light)}).scrollIntoView({block:'center'})`);await screenshot('stage6-devices-'+language+'-'+width,false);
      await click(c.routines);await click(c.preview+' · '+c.evening);await screenshot('stage6-routine-'+language+'-'+width,false);
      await navigate('/her/my-day',width,language,'extraLarge',true);await has(c.reminders);await scrollText(c.reminders);await screenshot('stage6-reminders-'+language+'-'+width,false);
      await click(c.addReminder);await field(c.titleLabel,language==='ja'?'読書の時間':'Time for a little reading');await screenshot('stage6-form-'+language+'-'+width,false);
    }
    ws.close();await fetch('http://127.0.0.1:9223/json/close/'+target.id);console.log('16 detail captures complete');return;
  }
  await fetch(base+'/__verification/stage3?weather=demo');await navigate('/her/smart-home');await evaluate(`localStorage.removeItem('${demoKey}')`);await navigate('/her/smart-home');await has('Choose a room');
  await click('Turn on · Living Room · Light');assert.equal((await saved()).devices['living-light'],true);await has('Simulated: On');
  await click('Bedroom');await click('Turn on · Bedroom · Fan');assert.equal((await saved()).devices['bedroom-fan'],true);assert.equal((await saved()).devices['living-fan'],false);
  await navigate('/her/smart-home');assert.equal((await saved()).devices['bedroom-fan'],true);record('device controls, room isolation and persisted reload');
  await send('Switch off the bedroom fan.');assert.equal((await saved()).devices['bedroom-fan'],false);
  const before=JSON.stringify((await saved()).devices);await send('Open the curtains.');await has('Which device did you mean?');assert.equal(JSON.stringify((await saved()).devices),before);
  await screenshot('stage6-ambiguity-en-390',false);await click('Choose · Bedroom · Curtains: Open');assert.equal((await saved()).devices['bedroom-curtains'],true);assert.equal((await saved()).devices['living-curtains'],false);
  const snapshot=JSON.stringify((await saved()).devices);await send('Unlock the front door');await has('That command is not supported');assert.equal(JSON.stringify((await saved()).devices),snapshot);record('supported text, ambiguous selection and unsupported commands');
  await click('Routines');const prior=JSON.stringify((await saved()).devices);await click('Preview routine · Morning Routine');await has('Review before applying');assert.equal(JSON.stringify((await saved()).devices),prior);await click('Cancel');assert.equal(JSON.stringify((await saved()).devices),prior);
  await click('Preview routine · Morning Routine');await click('Apply this simulated routine · Morning Routine');await has('Routine applied in the demonstration.');assert.equal((await saved()).devices['living-fan'],true);
  await click('Preview routine · Evening Routine');await screenshot('stage6-routine-en-390',false);await click('Apply this simulated routine · Evening Routine');assert.equal((await saved()).devices['bedroom-light'],true);assert.equal((await saved()).devices['bedroom-curtains'],false);await click('Recent simulated actions');await has('Simulated:');record('routine preview, cancellation, applying morning/evening and activity log');

  await navigate('/her/my-day');await has('Upcoming visits');await has('Reminders & personal activities');
  const home=await(await fetch(base+'/api/home/tanaka')).json();
  for(const visit of home.home.visits.filter(v=>v.status==='planned'))assert.ok((await evaluate('document.body.innerText')).includes(new Date(visit.date.slice(0,10)+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',timeZone:'UTC'})),'Recorded visit date is displayed');
  await click('Add a reminder or activity');await field('What would you like to remember?','Read my favourite book');await field('Time (24-hour HH:MM)','24:00');await click('Add to My Day');await has('Enter a title, a valid date');assert.equal((await saved()).reminders.length,0);
  await field('Time (24-hour HH:MM)','10:00');await click('Add to My Day');await has('Added to your local My Day.');assert.equal((await saved()).reminders.length,1);
  await click('Mark completed · Read my favourite book');await has('Read my favourite book · Marked completed.');assert.equal((await saved()).reminders[0].completed,true);await click('Completed tasks');await has('Read my favourite book');await screenshot('stage6-completed-en-390',false);await click('Mark as to do · Read my favourite book');assert.equal((await saved()).reminders[0].completed,false);
  await click('Plan a quiet activity');await click('Add to My Day');assert.equal((await saved()).reminders[1].kind,'activity');await navigate('/her/my-day');await has('Read my favourite book');record('existing visit display, validation, reminder creation/completion/undo, activity scheduling and persistence');
  await click('People you trust');await has('Your visiting students');await click('Your visiting students');await has('Friends');record('trusted-person shortcut uses existing route');
  await navigate('/her/companion');await field('Your message','Turn off the living room light.');await click('Send message');await has('Simulated: Living Room · Light: Off');assert.equal((await saved()).devices['living-light'],false);
  await field('Your message','What do I have today?');await click('Send message');await has('Read my favourite book');await has('My Day');await screenshot('stage6-companion-response-en-390',false);
  await field('Your message','Open the curtains');await click('Send message');await has('Which device did you mean?');await click('Smart Home');await has('Choose · Living Room · Curtains: Open');record('companion commands and day summary share the same state and interpreter');

  // A deterministic browser speech stub verifies gating and text review without recording any audio.
  const voiceScript=(await command('Page.addScriptToEvaluateOnNewDocument',{source:`window.__voiceStarts=0;window.__spoken=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},getVoices(){return [{localService:true,lang:'en-GB'}]},speak(u){window.__spoken.push(u.text);u.onend?.();}}});window.SpeechRecognition=class{start(){window.__voiceStarts++;this.onresult?.({results:[[{transcript:'Turn on the kitchen light'}]]});this.onend?.();}abort(){}};`})).identifier;
  await navigate('/her/smart-home');await click('Optional voice input');await click('Use my voice');await has('Allow microphone for one command');assert.equal(await evaluate('window.__voiceStarts'),0);await click('Close');assert.equal(await evaluate('window.__voiceStarts'),0);
  await click('Use my voice');await click('Allow microphone for one command');await has('Words received.');assert.equal(await evaluate('window.__voiceStarts'),1);assert.equal((await saved()).devices['kitchen-light'],false);await click('Apply simulated command');assert.equal((await saved()).devices['kitchen-light'],true);await click('Read feedback aloud');assert.ok((await evaluate('window.__spoken')).some(text=>text.includes('Simulated: Kitchen · Light: On')));
  await command('Page.removeScriptToEvaluateOnNewDocument',{identifier:voiceScript});
  const fallback=(await command('Page.addScriptToEvaluateOnNewDocument',{source:'Object.defineProperty(window,"SpeechRecognition",{value:undefined,configurable:true});Object.defineProperty(window,"webkitSpeechRecognition",{value:undefined,configurable:true});'})).identifier;
  await navigate('/her/smart-home');await click('Optional voice input');await has('Voice input is unavailable here. Type a command instead.');await send('Turn off the kitchen light');assert.equal((await saved()).devices['kitchen-light'],false);await command('Page.removeScriptToEvaluateOnNewDocument',{identifier:fallback});record('voice consent, cancel, recognized-text review and unsupported-browser text fallback (no microphone recording)');

  const good=await saved();await evaluate(`localStorage.setItem('${demoKey}','{broken')`);await navigate('/her/smart-home');await has('Your saved demonstration could not be read');await click('Continue temporarily');await has('Temporary session');await click('Turn on · Living Room · Light');assert.equal(await evaluate(`localStorage.getItem('${demoKey}')`),'{broken');
  await evaluate(`localStorage.setItem('${demoKey}',${JSON.stringify(JSON.stringify(good))})`);
  const failure=(await command('Page.addScriptToEvaluateOnNewDocument',{source:`window.__realSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='${demoKey}')throw Error('fixture write failure');return window.__realSet.call(this,k,v)}`})).identifier;
  await navigate('/her/smart-home');await click('Turn on · Living Room · Light');await has('Changes are visible here but could not be saved');assert.equal(await evaluate(`(${buttonExpression('Turn off · Living Room · Light')}).getAttribute('aria-disabled')`),'true');await evaluate('Storage.prototype.setItem=window.__realSet');await click('Retry');await wait(120);assert.equal((await saved()).devices['living-light'],true);await command('Page.removeScriptToEvaluateOnNewDocument',{identifier:failure});record('corrupt storage non-overwriting session, write-failure feedback and retry');

  if(!process.argv.includes('--interactions-only'))for(const language of ['en','ja'])for(const width of [320,390,768,1440])for(const mode of ['normal','extraLarge'])for(const route of ['/her/smart-home','/her/my-day','/her/my-home','/her/companion']){
    await navigate(route,width,language,mode,mode==='extraLarge');await wait(250);results.matrices.push({route,language,mode,...await measure()});
    if([390,1440].includes(width)&&mode==='extraLarge')await screenshot('stage6-'+route.split('/').at(-1)+'-'+language+'-'+width);
  }
  const mutations=(await(await fetch(base+'/__verification/requests')).json()).filter(r=>r.method!=='GET');assert.deepEqual(mutations,[]);record('no household mutations or hardware requests');
  results.failures=results.matrices.filter(r=>r.small.length||r.overflow.length);
  fs.writeFileSync(path.join(output,'stage6-verification.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({matrices:results.matrices.length,failures:results.failures,interactions:results.interactions,exceptions:results.exceptions},null,2));
  ws.close();await fetch('http://127.0.0.1:9223/json/close/'+target.id);process.exitCode=results.failures.length||results.exceptions.length?1:0;
}
main().catch(error=>{fs.writeFileSync(path.join(output,'stage6-error.json'),JSON.stringify({error:String(error),results},null,2));console.error(error);process.exit(1);});

