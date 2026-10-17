// Disposable fixture host + dedicated Chrome CDP. No package or browser downloads.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(__dirname,'../.impeccable/review'),base='http://127.0.0.1:4399';
fs.mkdirSync(out,{recursive:true});const wait=ms=>new Promise(r=>setTimeout(r,ms));
const results={layouts:[],groups:[],exceptions:[],captures:[]};
async function main(){
  const target=await(await fetch('http://127.0.0.1:9223/json/new?about:blank',{method:'PUT'})).json(),ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r=>ws.addEventListener('open',r,{once:true}));let serial=0;const pending=new Map();
  ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')results.exceptions.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});
  const cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const ev=async expression=>{const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  const has=async text=>{for(let i=0;i<100;i++){if(await ev(`document.body?.innerText.includes(${JSON.stringify(text)})`))return;await wait(100);}throw Error('Missing: '+text);};
  const button=name=>`Array.from((document.querySelector('[role="dialog"],[role="alertdialog"]')||document).querySelectorAll('[role="button"],button')).find(e=>(e.getAttribute('aria-label')===${JSON.stringify(name)}||e.textContent.trim()===${JSON.stringify(name)})&&e.getClientRects().length&&!e.closest('[aria-hidden="true"]'))`;
  const click=async name=>{const p=await ev(`(()=>{const e=${button(name)};if(!e)throw Error('Missing button '+${JSON.stringify(name)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);await cmd('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});await wait(130);};
  let init;await cmd('Page.enable');await cmd('Runtime.enable');
  const navigate=async(route='/developer/agents',width=390,lang='en',mode='normal',motion=true)=>{
    await cmd('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    if(init)await cmd('Page.removeScriptToEvaluateOnNewDocument',{identifier:init});
    init=(await cmd('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('kakehashi-lang',${JSON.stringify(lang)});localStorage.setItem('kakehashi-reading-preferences-v1',${JSON.stringify(JSON.stringify({textMode:mode,highContrast:mode!=='normal',reduceMotion:motion}))});`})).identifier;
    await cmd('Page.navigate',{url:base+route});await has(route==='/developer/agents'?(lang==='en'?'Agent collaboration':'エージェントの連携'):(lang==='en'?'Settings':'設定'));await ev('document.fonts.ready.then(()=>true)');await wait(200);
  };
  const measure=async meta=>{const value=await ev(`(()=>{const controls=Array.from(document.querySelectorAll('[role="button"],[role="switch"],[role="tab"],input,textarea')).filter(e=>e.getClientRects().length&&!e.closest('[aria-hidden="true"]'));return {small:controls.filter(e=>{const b=e.getBoundingClientRect();return b.width<44||b.height<44}).map(e=>e.textContent),overflow:Array.from(document.querySelectorAll('*')).filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.right>innerWidth+2&&getComputedStyle(e).position!=='absolute'&&!e.closest('svg')}).slice(0,6).map(e=>e.textContent.slice(0,70))};})()`);results.layouts.push({...meta,...value});};
  const screenshot=async(name,top=true)=>{if(top)await ev(`document.querySelectorAll('div').forEach(e=>{if(e.scrollHeight>e.clientHeight&&/auto|scroll/.test(getComputedStyle(e).overflowY))e.scrollTop=0});window.scrollTo(0,0)`);await wait(100);const shot=await cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(shot.data,'base64'));results.captures.push(name+'.png');};
  const record=name=>{results.groups.push(name);console.log('ok '+name);};
  await fetch(base+'/__verification/stage3?weather=demo');
  await navigate();const storage=await ev('JSON.stringify(localStorage)');
  await click('Recognize gardening');await has('Waiting for an explicit decision.');
  await click('Approve saving gardening');await click('Approve sharing name & gardening for matching');await click('Find eligible friends');
  await has('Social Coordinator prepared the eligible recommendations.');await click('Prepare an invitation to Haru');await has('Waiting for an explicit decision.');
  await click('Review invitation');await has('Send this fictional invitation?');await screenshot('stage7-confirmation-en-390',false);await click('Cancel');
  await has('Review invitation');await click('Review invitation');await click('Confirm invitation');await click('Simulate recipient acceptance');await click('Accept as Haru');await has('Fictional friendship accepted');
  await click('Inspect sanitized events');const eventText=await ev('document.body.innerText');assert.ok(eventText.includes('"accepted"'));assert.equal(await ev('JSON.stringify(localStorage)'),storage);record('explicit save/share, invitation cancel/confirm and recipient acceptance; no persisted demo writes');
  await click('Replay events');await has('1 /');await click('Next step');await has('2 /');assert.equal(await ev('JSON.stringify(localStorage)'),storage);record('reduced-motion manual replay does not repeat mutations');
  await click('Privacy & Safety');await has('Select a recorded transition to inspect it.');await screenshot('stage7-graph-en-390',false);record('interactive node inspection');
  await click('Run blocked workflow');await has('Permission denied — nothing was sent');await click('Next step'); // already at last: checked below through Replay
  record('blocked workflow displayed');
  await click('Replay events');await click('Next step');await click('Next step');await has('Stopped before the requested action.');await screenshot('stage7-blocked-en-390',false);
  await click('Switch fictional persona');await has('Demo narrator: aiko');await click('Reset demo');await has('Start a workflow');record('persona switch and reset isolate demonstrations');
  await click('Try existing KAKEHASHI workflows');await click('Memories');await has('/her/memories');await click('Local helpers');await has('/her/help');await click('Student visits');await has('/her/my-day');await click('Home safety');await has('/her/my-home');await click('Bedroom light');await has('The simulated device request was processed.');record('integration scenarios and mock device execution');
  // App trace survives normal SPA navigation back to this developer panel.
  await navigate();await click('Open KAKEHASHI');await has('Talk to Companion');await click('Talk to Companion');await has('Your message');
  await ev(`(()=>{const e=document.querySelector('textarea');e.focus();})()`);await cmd('Input.insertText',{text:'I want to meet someone who enjoys gardening.'});await click('Send message');await wait(550);
  await ev('history.back()');await has('Talk to Companion');await ev('history.back()');await has('Agent collaboration');await click('Inspect app events');await has('Permission denied — nothing was sent');await click('Inspect sanitized events');assert.equal((await ev('document.body.innerText')).includes('"text"'),false);record('actual companion denial appears in sanitized app event inspector');
  for(const lang of ['en','ja'])for(const width of [320,390,768,1440])for(const mode of ['normal','extraLarge']){
    await navigate('/developer/agents',width,lang,mode);await click(lang==='en'?'Run blocked workflow':'ブロックされる操作を実行');await measure({lang,width,mode,state:'blocked'});
    if([390,1440].includes(width)&&mode==='extraLarge'){await screenshot(`stage7-panel-${lang}-${width}`);await click(lang==='en'?'Privacy & Safety':'プライバシーと安全');await screenshot(`stage7-denied-${lang}-${width}`,false);}
    await click(lang==='en'?'Matching workflow':'マッチングの流れ');
    for(const label of lang==='en'?['Recognize gardening','Approve saving gardening','Approve sharing name & gardening for matching','Find eligible friends']:['園芸を認識','園芸の保存を承認','マッチング用に名前と園芸の共有を承認','条件を満たす友達を探す'])await click(label);
    await measure({lang,width,mode,state:'matching'});
    if([390,1440].includes(width)&&mode==='extraLarge'){await click(lang==='en'?'Friend Matching':'友達のマッチング');await screenshot(`stage7-matching-${lang}-${width}`,false);}
  }
  record('32 responsive EN/JA layout cases');
  await navigate('/developer/agents',390,'en','normal',false);await click('Run blocked workflow');await click('Replay events');await wait(1300);await has('2 /');await click('Pause');const paused=await ev('document.body.innerText');await wait(1250);assert.equal(await ev('document.body.innerText'),paused);record('timed replay and pause');
  results.failures=results.layouts.filter(x=>x.small.length||x.overflow.length);
  fs.writeFileSync(path.join(out,'stage7-verification.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({layouts:results.layouts.length,failures:results.failures,groups:results.groups.length,exceptions:results.exceptions}));
  ws.close();await fetch('http://127.0.0.1:9223/json/close/'+target.id);process.exitCode=results.failures.length||results.exceptions.length?1:0;
}
main().catch(e=>{fs.writeFileSync(path.join(out,'stage7-error.json'),JSON.stringify({error:String(e),results},null,2));console.error(e);process.exit(1);});
