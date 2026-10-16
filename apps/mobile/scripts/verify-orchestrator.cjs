const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {orchestrate}=require('../src/evercircle/orchestrator/model.ts');
const {newDemo,matchingStep,blockedDemo,demoScenario}=require('../src/evercircle/orchestrator/demo.ts');
const {reduceSocial,socialPeople}=require('../src/evercircle/social/model.ts');
const {reduceSaved}=require('../src/evercircle/profile/model.ts');
const {reduceDemo}=require('../src/evercircle/homeDemo/model.ts');
const {canAccessMemory,canSendInvitation,canSendMessage,canPerformDeviceAction,sanitizeAgentPayload}=require('../src/evercircle/privacy/permissions.ts');
const {runOrchestrator,getTraces,clearTraces}=require('../src/evercircle/orchestrator/journal.ts');
let count=0;const test=(name,fn)=>{fn();console.log('ok '+name);count++;};
const context=(demo,text)=>({type:'companion',text,saved:demo.saved,household:'tanaka',healthy:true,deviceHealthy:true,person:socialPeople(demo.social,demo.saved)[0],people:socialPeople(demo.social,demo.saved)});
test('required EN/JA routing and existing destinations',()=>{
  for(const [text,module,action] of [['I want to record my childhood memories.','profile','memories'],['I need help organizing my belongings.','kakehashi','help'],['What activities do I have today?','daily','day'],['When is the next student visit?','daily','day'],['Turn on my bedroom light.','home','smart'],['Show home safety','kakehashi','safety'],['思い出を録音したい','profile','memories'],['今日の予定','daily','day']]){
    const r=orchestrate(context(newDemo(),text));assert.equal(r.module,module,text);assert.ok(r.reply.actions.includes(action),text);
  }
});
test('blocked matching has no comparison, recommendation or mutation',()=>{
  const before=newDemo(),after=blockedDemo('tanaka');assert.equal(after.result.permission,'denied');assert.equal(after.result.action,'blocked');
  assert.deepEqual(after.saved,before.saved);assert.deepEqual(after.social,before.social);assert.deepEqual(after.home,before.home);
  assert.deepEqual(after.events.map(e=>e.kind),['recognized','permission','blocked']);assert.equal(after.events.at(-1).to,'matching');
});
test('saving and sharing require distinct explicit steps',()=>{
  let d=matchingStep(newDemo());assert.deepEqual(d.saved.pending,['gardening']);assert.equal(d.saved.approved.length,0);
  d=matchingStep(d);assert.equal(d.saved.approved[0].shareForMatching,false);assert.equal(orchestrate(context(d,'I want friends')).permission,'denied');
  d=matchingStep(d);assert.equal(d.saved.approved[0].shareForMatching,true);const r=orchestrate(context(d,'I want friends'));assert.equal(r.permission,'allowed');assert.ok(r.events.some(e=>e.kind==='compared'));assert.ok(r.matches.some(m=>m.eligible));
});
test('unconfirmed invitations are rejected by orchestrator AND direct reducer',()=>{
  let d=newDemo();for(let i=0;i<4;i++)d=matchingStep(d);const people=socialPeople(d.social,d.saved),action={type:'invite',actor:'tanaka',target:'haru'};
  assert.equal(canSendInvitation(d.social,people[0],people.find(p=>p.id==='haru')),false);
  assert.equal(reduceSocial(d.social,action,people).state,d.social);
  const r=orchestrate({type:'social',state:d.social,action,people,healthy:true});assert.equal(r.permission,'confirmationRequired');assert.equal(r.social,d.social);
});
test('confirmation creates only a pending invitation; recipient-only acceptance',()=>{
  let d=newDemo();for(let i=0;i<6;i++)d=matchingStep(d);assert.equal(d.social.relations[0].status,'pending');
  const people=socialPeople(d.social,d.saved);assert.equal(reduceSocial(d.social,{type:'accept',actor:'tanaka',target:'haru',confirmed:true},people).ok,false);
  const recipient={...d.social,activeId:'haru'};assert.equal(reduceSocial(recipient,{type:'accept',actor:'haru',target:'tanaka'},people).ok,false);
  d=matchingStep(d);assert.equal(d.social.relations[0].status,'accepted');assert.ok(d.events.some(e=>e.kind==='accepted'&&e.to==='external'));
});
test('revoked consent, storage failure and bilateral blocks stop invitations',()=>{
  let d=newDemo();for(let i=0;i<3;i++)d=matchingStep(d);const people=socialPeople(d.social,d.saved),action={type:'invite',actor:'tanaka',target:'haru',confirmed:true};
  assert.equal(reduceSocial(d.social,action,people,false).state,d.social);
  people.find(p=>p.id==='haru').blocked=['tanaka'];assert.equal(reduceSocial(d.social,action,people).state,d.social);
  const saved=reduceSaved(d.saved,{type:'matching',enabled:false});assert.equal(orchestrate(context({...d,saved},'Find friends')).permission,'denied');
});
test('messages require accepted relationship and fail after blocking',()=>{
  let d=newDemo();for(let i=0;i<7;i++)d=matchingStep(d);const people=socialPeople(d.social,d.saved),a=people[0],b=people.find(p=>p.id==='haru');
  assert.equal(canSendMessage(newDemo().social,a,b),false);assert.equal(canSendMessage(d.social,a,b),true);b.blocked=['tanaka'];assert.equal(canSendMessage(d.social,a,b),false);
});
test('memory access cannot become matchmaking, student or family access',()=>{
  assert.equal(canAccessMemory('tanaka','tanaka','owner'),true);for(const purpose of ['matching','student','family'])assert.equal(canAccessMemory('tanaka','tanaka',purpose),false);
  assert.equal(orchestrate({...context(newDemo(),'Record memories'),household:'other'}).permission,'denied');
});
test('device scope and atomic invalid requests terminate before mutation',()=>{
  const d=newDemo(),action={type:'devices',changes:[{id:'bedroom-light',on:true},{id:'unknown',on:true}],at:'2026-10-16',id:'test'};
  assert.equal(reduceDemo(d.home,action),d.home);assert.equal(canPerformDeviceAction('tanaka','other',[action.changes[0]],d.home.devices),false);
  const r=orchestrate({type:'home',state:d.home,action:{...action,changes:[action.changes[0]]},household:'other',healthy:true});assert.equal(r.home,d.home);assert.equal(r.permission,'denied');
  const success=demoScenario(d,'Turn on the bedroom light.');assert.equal(success.home.devices['bedroom-light'],true);assert.equal(success.result.action,'performed');
});
test('companion cannot invoke device callback after denial; actual outcomes are reported',()=>{
  let calls=0;const request={...context(newDemo(),'Turn on the bedroom light.'),daily:()=>{calls++;return {intent:'devices',key:'cDeviceReply',actions:['smart'],candidates:[],performed:true};}};
  assert.equal(orchestrate({...request,deviceHealthy:false}).permission,'denied');assert.equal(calls,0);
  assert.equal(orchestrate(request).action,'performed');assert.equal(calls,1);
  // The exact device interpreter recognizes fan/curtain commands beyond the older chat parser.
  for(const text of ['Open the curtains.','Turn on my bedroom fan.']) {
    const result=orchestrate({...request,text});assert.equal(result.module,'home');assert.equal(result.action,'performed');
  }
  assert.equal(calls,3);
});
test('seven logical modules are coordinated without unrelated scenario participants',()=>{
  let d=newDemo();for(let i=0;i<7;i++)d=matchingStep(d);const modules=new Set(d.events.flatMap(e=>[e.from,e.to]));
  for(const m of ['companion','profile','privacy','matching','social'])assert.ok(modules.has(m));assert.equal(modules.has('home'),false);
  for(const [text,module] of [['Turn on the bedroom light.','home'],['Today schedule','daily']])assert.ok(demoScenario(newDemo(),text).events.some(e=>e.to===module));
});
test('events and journal never retain raw chat, memories, names or profile snapshots',()=>{
  assert.deepEqual(sanitizeAgentPayload({allowed:true,count:2,text:'secret',transcript:'secret',profile:{secret:true},memories:['secret'],count2:Infinity}),{allowed:true,count:2});
  clearTraces();runOrchestrator(context(newDemo(),'Record my private childhood SECRET-MARKER memories'));
  const output=JSON.stringify(getTraces());assert.equal(output.includes('SECRET-MARKER'),false);assert.equal(output.includes('saved'),false);
  for(let i=0;i<70;i++)runOrchestrator(context(newDemo(),'Hello'));assert.equal(getTraces().length,60);clearTraces();assert.deepEqual(getTraces(),[]);
});
test('reset and replay are deterministic and isolated from household data',()=>{
  const execute=()=>{let d=newDemo();for(let i=0;i<7;i++)d=matchingStep(d);return d;};assert.deepEqual(execute(),execute());
  const d=execute(),snapshot=JSON.stringify(d);d.events.forEach(e=>JSON.stringify(e));assert.equal(JSON.stringify(d),snapshot);assert.equal(newDemo('aiko').social.relations.length,0);
});
console.log(`${count} orchestrator groups passed`);
