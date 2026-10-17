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
  const buttonExpression = name => `Array.from((document.querySelector('[role="alertdialog"],[role="dialog"]') || document).querySelectorAll('[role="button"],[role="tab"],[role="switch"],[role="radio"],[role="checkbox"],button')).find(element => (element.getAttribute('aria-label') || element.textContent.trim()) === ${JSON.stringify(name)} && element.getClientRects().length && !element.closest('[aria-hidden="true"]'))`;
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
  const screenshot = async name => {
    await evaluate('Array.from(document.querySelectorAll("div")).filter(element => element.scrollHeight>element.clientHeight+20 && /auto|scroll/.test(getComputedStyle(element).overflowY)).forEach(element=>element.scrollTop=0); window.scrollTo(0,0);');
    const capture = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(capture.data, 'base64'));
  };

  const dictionary = language => language === 'ja' ? japanese : translations;
  const has = async text => { for(let i=0;i<70;i++){ if(await evaluate('document.body.innerText.includes('+JSON.stringify(text)+')'))return;await wait(100); } throw Error('Missing text: '+text); };
  const recorded = async () => (await (await fetch(base+'/__verification/requests')).json()).filter(r=>r.method!=='GET');
  const field = async (label,text) => {
    await evaluate('(()=>{const e=Array.from(document.querySelectorAll("input,textarea")).find(e=>e.getAttribute("aria-label")==='+JSON.stringify(label)+');if(!e)throw Error("Missing input: "+'+JSON.stringify(label)+');e.scrollIntoView({block:"center"});e.focus();})()');
    await key('a',2); await command('Input.insertText',{text});await wait(40);
  };
  const clickSelector = async selector => { const point=await evaluate('(()=>{const e=document.querySelector('+JSON.stringify(selector)+');if(!e)throw Error("Missing selector");e.scrollIntoView({block:"center"});const b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2};})()');await command('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await command('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});await wait(150); };
  if(process.argv.includes('--review-fixes')) {
    await fetch(base+'/__verification/stage3?weather=demo');
    for(const language of ['en','ja']) for(const width of [390,1440]) for(const route of ['/family','/student','/worker','/stories','/item/sewing?as=student']) {
      await navigate(route,width,language,width===1440&&language==='en'?'normal':'extraLarge',true);
      results.matrices.push({route,language,...await measure()});
      await screenshot('stage3-'+route.replace(/[^a-z]/g,'-')+'-'+language+'-'+width);
      if(route==='/family'&&width===390) {
        const summary=await evaluate('(()=>{const e=document.querySelector("[data-testid=family-visit-summary]");const b=e.getBoundingClientRect();return {text:e.innerText,bottom:b.bottom,top:b.top};})()');
        assert.ok(summary.text.includes('Yui')&&summary.text.includes('Arif')&&summary.text.includes('24'));
        assert.ok(summary.top>0&&summary.bottom<740,JSON.stringify(summary));
        results.interactions.push({name:language+' compact visit summary before alerts',passed:true,...summary});
      }
    }
    for(const language of ['en','ja']) for(const stage of ['stepWith','stepAfter']) {
      await navigate('/student',390,language,'extraLarge',true);await click(dictionary(language)[stage]);
      results.matrices.push({route:'/student#'+stage,language,...await measure()});await screenshot('stage3-student-'+stage+'-'+language+'-390');
    }
    for(const language of ['en','ja']) {
      await navigate('/family',390,language,'extraLarge',true);const d=dictionary(language);
      await click(d.hSettings);await click(d.dsReadingSettings);await key('Escape');
      assert.equal(await evaluate('document.activeElement?.getAttribute("aria-label")'),d.hSettings);
      results.interactions.push({name:language+' reading close returns directly to Settings',passed:true});
    }
    results.failures=results.matrices.filter(r=>r.overflow.length||r.small.length);
    fs.writeFileSync(path.join(output,'stage3-review-fixes.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({matrices:results.matrices.length,failures:results.failures,interactions:results.interactions,exceptions:results.exceptions},null,2));ws.close();await fetch('http://127.0.0.1:9223/json/close/'+target.id);process.exitCode=results.failures.length||results.exceptions.length?1:0;return;
  }
  if(process.argv.includes('--drafts-only')) {
    for(const route of ['/item/sewing?as=student','/her/item/sewing']) {
      await fetch(base+'/__verification/stage3');
      const original=(await (await fetch(base+'/api/home/tanaka')).json()).items.find(i=>i.id==='sewing').storyJa;
      await navigate(route,390,'ja','extraLarge',true);
      const writes=async()=>(await recorded()).filter(r=>r.method==='PATCH');
      assert.equal(await evaluate('document.querySelector("textarea").value'),original);
      const count=(await writes()).length;await click(japanese.saveStory);assert.equal((await writes()).length,count);
      await field(route.startsWith('/her')?japanese.hYourStory:japanese.storyInHerWords,original+' / verified');
      await click(japanese.hSettings);
      await click(japanese.dsChangeLanguage);
      if(route.startsWith('/her'))await click('Back');else await key('Escape');
      assert.equal(await evaluate('document.querySelector("textarea").value'),original+' / verified');
      await click(translations.saveStory);await wait(150);assert.deepEqual((await writes()).at(-1).body,{story:original+' / verified'});
      await navigate(route,1440,'ja','extraLarge',true);assert.equal(await evaluate('document.querySelector("textarea").value'),original+' / verified');
      results.interactions.push({name:route+' localized draft/no unchanged PATCH/language switch/save/reload',passed:true});
    }
    await navigate('/family');await click(translations.hSettings);await click(translations.dsReadingSettings);await key('Escape');
    results.interactions.push({name:'reading dialog focus after Settings transition',active:await evaluate('({label:document.activeElement?.getAttribute("aria-label"),tag:document.activeElement?.tagName,html:document.activeElement?.outerHTML?.slice(0,300),text:document.activeElement?.innerText?.slice(0,100)})')});
    await key('Tab');results.interactions.push({name:'next Tab after reading close',active:await evaluate('({label:document.activeElement?.getAttribute("aria-label"),tag:document.activeElement?.tagName,text:document.activeElement?.innerText?.slice(0,100)})')});
    fs.writeFileSync(path.join(output,'stage3-drafts.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));ws.close();await fetch('http://127.0.0.1:9223/json/close/'+target.id);process.exitCode=results.exceptions.length?1:0;return;
  }
  await fetch(base+'/__verification/stage3?weather=demo');
  const routes=['/family','/family/house?view=map','/family/plan','/family/reports','/student','/student/add','/student/wallet','/student/team','/worker','/stories','/item/sewing','/item/sewing?as=student'];
  if(!process.argv.includes('--interactions-only')) {
    for(const language of ['en','ja']) for(const width of [320,390,768,1440]) for(const route of routes){
      await navigate(route,width,language,'extraLarge',true); await wait(100);
      results.matrices.push({route,language,mode:'extraLarge',...await measure()});
      if([390,1440].includes(width) && ['/family','/student','/worker','/stories','/item/sewing?as=student'].includes(route))await screenshot('stage3-'+route.replace(/[^a-z]/g,'-')+'-'+language+'-'+width);
    }
    for(const route of routes){await navigate(route,1440,'en','normal');results.matrices.push({route,language:'en',mode:'normal',...await measure()});if(['/family','/student','/worker','/stories','/item/sewing?as=student'].includes(route))await screenshot('stage3-'+route.replace(/[^a-z]/g,'-')+'-en-1440');}
    for(const language of ['en','ja']) for(const width of [390,1440]) for(const stage of ['stepWith','stepAfter']){await navigate('/student',width,language,'extraLarge',true);await click(dictionary(language)[stage]);results.matrices.push({route:'/student#'+stage,language,mode:'extraLarge',...await measure()});if(width===390)await screenshot('stage3-student-'+stage+'-'+language+'-'+width);}
    fs.writeFileSync(path.join(output,'stage3-layouts.json'),JSON.stringify(results,null,2));
  }
  // Existing student report gates and failure recovery, followed by family access to the saved report.
  await navigate('/student'); await click(translations.stepAfter);
  await field(translations.reportTitle,'We found junk.');await click(translations.checkWording);await has('Use respectful wording.');
  assert.equal(await evaluate(buttonExpression(translations.sendReport)+'.getAttribute("aria-disabled")'),'true');
  const report='We listened to her stories. She chose to keep her belongings.';
  await field(translations.reportTitle,report);await click(translations.checkWording);await has(translations.looksKind);
  assert.equal(await evaluate(buttonExpression(translations.sendReport)+'.getAttribute("aria-disabled")'),'true');
  await click(translations.readReport);await fetch(base+'/__verification/fail-next-mutation');await click(translations.sendReport);await has(translations.rSaveError);
  assert.equal(await evaluate('document.querySelector("textarea").value'),report);
  await click(translations.sendReport);await wait(200);assert.equal((await recorded()).at(-1).body.readConfirmed,true);assert.equal((await recorded()).at(-1).body.text,report);
  await navigate('/family/reports');await has(report);results.interactions.push({name:'report pressure check, personal-read gate, failed send retains draft, retry, family report access',passed:true});
  await navigate('/student');await field(translations.addNote,'Prefers a quiet visit.');await click(translations.addNote);await wait(200);assert.equal((await recorded()).at(-1).body.text,'Prefers a quiet visit.');
  await click(translations.consentWithdraw);await wait(200);assert.deepEqual((await recorded()).at(-1).body,{recording:false});await click(translations.consentYes);await wait(200);
  results.interactions.push({name:'field note save and explicit recording-consent withdrawal/restore',passed:true});
  // Student legacy item and family wishes preserve contracts and deferred choice.
  await navigate('/item/sewing?as=student');const count=(await recorded()).length;await click(translations.decision_keep);await click(translations.dsCancel);assert.equal((await recorded()).length,count);
  await click(translations.decision_open);await wait(150);assert.deepEqual((await recorded()).at(-1).body,{decision:'open'});
  await click(translations.decision_pass);await click(translations.decision_pass);await wait(150);assert.deepEqual((await recorded()).at(-1).body,{decision:'pass'});
  await field(translations.storyInHerWords,'A story saved during the visit.');await click(translations.saveStory);await wait(150);assert.deepEqual((await recorded()).at(-1).body,{story:'A story saved during the visit.'});
  await field(translations.handoverBy,'Partner repair shop');await fetch(base+'/__verification/fail-next-mutation');await click(translations.logHandover);await has(translations.rSaveError);assert.equal(await evaluate('Array.from(document.querySelectorAll("input")).find(e=>e.getAttribute("aria-label")==='+JSON.stringify(translations.handoverBy)+').value'),'Partner repair shop');
  await click(translations.logHandover);await wait(150);assert.equal((await recorded()).at(-1).body.by,'Partner repair shop');
  await click(translations.shareWithdraw);await wait(150);assert.deepEqual((await recorded()).at(-1).body,{share:false});
  await click(translations.shareAgree);await wait(150);assert.equal((await recorded()).at(-1).body.audio,false);
  await navigate('/item/sewing');await click(translations.wish_keep_in_family);await wait(150);assert.equal((await recorded()).at(-1).body.kind,'keep-in-family');
  results.interactions.push({name:'item decision cancel/Not now/confirm, story save, handover failure/retry, sharing withdrawal/explicit opt-in, family wish',passed:true});
  await navigate('/student/add');await field(translations.itemName,'Verification keepsake');await click(translations.getEstimate);await has('Verification-only example estimate');await click(translations.addItem);await has('Verification keepsake');assert.equal((await recorded()).findLast(r=>r.path==='/api/items').body.name,'Verification keepsake');results.interactions.push({name:'optional estimate and create item into current room',passed:true});
  // Letter review remains separate from the report's review.
  await navigate('/student');await click(translations.stepAfter);await click(translations.prepareLetter);await wait(150);await field(translations.letterNote,'A warm note for the monthly letter.');await click(translations.saveNote);await wait(150);await click(translations.readLetter);await click(translations.markPrinted);await wait(150);assert.equal((await recorded()).at(-1).body.readConfirmed,true);await click(translations.markMailed);await wait(150);assert.equal((await recorded()).at(-1).body.status,'mailed');
  await field(translations.callNote,'Enjoyed talking about the garden.');await click(translations.mood_good);await click(translations.logCall);await wait(150);assert.equal((await recorded()).at(-1).body.mood,'good');results.interactions.push({name:'letter prepare/save/read/print/mail and call log',passed:true});
  await fetch(base+'/__verification/fail-next-read?kind=wallet');await navigate('/student/wallet');await has(translations.rLoadError);await click(translations.retry);await has(translations.walletPayout);
  await click(translations.walletPayout);await wait(150);assert.ok((await recorded()).at(-1).path.endsWith('/payout'));
  await click(translations.goalEdit);await field(translations.goalName,'Travel');await field(translations.goalTarget,'50000');await field(translations.goalPct,'20');await click(translations.goalSave);await wait(150);assert.deepEqual((await recorded()).at(-1).body,{name:'Travel',targetJpy:50000,setAsidePct:20});
  await click(translations.goalEdit);await click(translations.goalRemove);await wait(150);assert.deepEqual((await recorded()).at(-1).body,{clear:true});results.interactions.push({name:'wallet load retry, demo payout, goal save/remove',passed:true});
  await navigate('/student/team');await clickSelector('[role=checkbox]');await wait(150);assert.equal((await recorded()).at(-1).body.passed,false);const state=await (await fetch(base+'/api/home/tanaka')).json();assert.equal(state.home.students[0].passed.signoff,undefined);results.interactions.push({name:'readiness toggle sends existing contract and withdraws signoff in fixture',passed:true});
  await navigate('/family/plan');await click(translations.payNow);await wait(150);assert.deepEqual((await recorded()).at(-1).body,{homeId:'tanaka',planId:'monthly'});await has(translations.paid);await click(translations.proceeds_donate);await wait(150);assert.deepEqual((await recorded()).at(-1).body,{choice:'donate'});results.interactions.push({name:'demo checkout, payment history and proceeds preference',passed:true});
  await navigate('/student');await click(translations.stepWith);await click(translations.servicesTitle);await click(translations.postJob);await field(translations.priceLabel,'6000');await field(translations.dateLabel,'2026-10-20');await clickSelector('[role=checkbox]');const postPoint=await evaluate('(()=>{const e=Array.from(document.querySelectorAll("[role=button]")).filter(e=>e.getAttribute("aria-label")==='+JSON.stringify(translations.postJob)+').at(-1);e.scrollIntoView({block:"center"});const b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2};})()');await command('Input.dispatchMouseEvent',{type:'mousePressed',...postPoint,button:'left',clickCount:1});await command('Input.dispatchMouseEvent',{type:'mouseReleased',...postPoint,button:'left',clickCount:1});await wait(150);assert.equal((await recorded()).at(-1).body.agreed,true);
  await click(translations.markDone);await wait(150);assert.equal((await recorded()).at(-1).body.status,'done');results.interactions.push({name:'student job posting requires price consent; booked job completion',passed:true});
  await navigate('/worker');await clickSelector('[role=radio]');await has(translations.acceptJob);await fetch(base+'/__verification/fail-next-mutation');await click(translations.acceptJob);await has(translations.rSaveError);await click(translations.acceptJob);await wait(150);assert.equal((await recorded()).at(-1).body.workerId,'w-sato');await has(translations.jobAccepted);results.interactions.push({name:'checked helper job load, failed acceptance and retry, booked status',passed:true});
  await navigate('/stories');await has('A story saved during the visit.');await clickSelector('#story-sewing [aria-label^="'+translations.feedHeart+'"]');await wait(150);assert.deepEqual((await recorded()).at(-1).body,{undo:false});await clickSelector('#story-sewing [aria-label^="'+translations.feedHeart+'"]');await wait(150);assert.deepEqual((await recorded()).at(-1).body,{undo:true});
  await clickSelector('#story-sewing [aria-label^="'+translations.feedComment+'"]');await field(translations.feedMessage,'Thank you for sharing.');await click(translations.send);await has(translations.feedSent);assert.equal((await recorded()).at(-1).body.message,'Thank you for sharing.');
  await click('Sewing machine');assert.equal(await evaluate('Boolean(document.querySelector("[role=dialog]"))'),true);await key('Escape');assert.equal(await evaluate('Boolean(document.querySelector("[role=dialog]"))'),false);
  const comments=(await (await fetch(base+'/api/home/tanaka')).json()).items.find(i=>i.id==='sewing').comments;assert.equal(comments.find(c=>c.id==='verify-comment').status,'pending');
  results.interactions.push({name:'public heart/undo, pending comment send, labelled globe story dialog and Escape',passed:true});
  await fetch(base+'/__verification/fail-next-home');await navigate('/stories');await has('A story saved during the visit.');await fetch(base+'/__verification/fail-next-read?kind=stories');await navigate('/stories');await has(translations.rLoadError);await click(translations.retry);await has('A story saved during the visit.');results.interactions.push({name:'public stories independent of failed household load and own read retry',passed:true});
  await navigate('/item/sewing?as=student');await click(translations.showMessage);await wait(150);assert.equal((await recorded()).at(-1).body.status,'shown');results.interactions.push({name:'student comment moderation remains explicit',passed:true});
  await navigate('/family/house');for(const view of ['view2d','viewMemory','viewMap','view3d']){await click(translations[view]);await wait(100);}await click(translations.photosShort);await has(translations.roomsTitle);results.interactions.push({name:'four house views and recorded-room-photo section remain reachable',passed:true});
  await click(translations.futureShort);await field(translations.familyNotePlaceholder,'Please keep her wishes at the centre.');await click(translations.addFamilyNote);await wait(150);assert.equal((await recorded()).at(-1).body.note,'Please keep her wishes at the centre.');
  await navigate('/family');await click(translations.hSettings);await click(translations.dsReadingSettings);assert.equal(await evaluate('Boolean(document.querySelector("[role=dialog]"))'),true);await key('Escape');assert.equal(await evaluate('Boolean(document.querySelector("[role=dialog]"))'),false);results.interactions.push({name:'family house note and compact Settings to cross-role reading dialog',passed:true});
  results.failures=results.matrices.filter(r=>r.overflow.length||r.small.length);fs.writeFileSync(path.join(output,process.argv.includes('--interactions-only')?'stage3-interactions.json':'stage3-verification.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({matrices:results.matrices.length,failures:results.failures,interactions:results.interactions,exceptions:results.exceptions},null,2));ws.close();await fetch('http://127.0.0.1:9223/json/close/'+target.id);process.exitCode=results.failures.length||results.exceptions.length?1:0;
}
const source=fs.readFileSync(path.resolve(__dirname,'../src/i18n.tsx'),'utf8');
const ts=require('typescript');
const dict=source.slice(source.indexOf('const en = ')+11,source.indexOf('\nexport type Key'));
const translations=Function('return '+dict.replace(/;\s*$/,''))();
const jaStart=source.indexOf('const ja:');
const jaBody=source.slice(source.indexOf('= {',jaStart)+2,source.indexOf('\n};',jaStart)+2);
const japanese=Function('return '+jaBody)();
main().catch(error=>{fs.writeFileSync(path.join(output,'stage3-error.json'),JSON.stringify({error:String(error),results},null,2));console.error(error);process.exit(1);});
