// Pure domain checks. No household server, browser or external services.
const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const M=require('../src/evercircle/social/matching.ts'),S=require('../src/evercircle/social/model.ts'),P=require('../src/evercircle/profile/model.ts'),F=require('../src/evercircle/social/fixtures.ts');
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('ok '+name);};
const clone=x=>structuredClone(x);
const a=clone(F.FICTIONAL_PEOPLE[0]),b=clone(F.FICTIONAL_PEOPLE[1]);
test('weights, normalization, language overlap and exact explainable total',()=>{
 assert.equal(Object.values(M.WEIGHTS).reduce((x,y)=>x+y),1);
 const result=M.simulateAgents(a,b);assert.ok(result.eligible);assert.deepEqual(result.components,{hobbies:2/3,languages:1,times:1/2,communication:1/2,activities:1/3,locations:1/2});assert.equal(result.score,65);
 assert.equal(M.simulateAgents(b,a).score,result.score);const identical={...a,id:'different'};assert.equal(M.simulateAgents(a,identical).score,100);
 for(const left of F.FICTIONAL_PEOPLE)for(const right of F.FICTIONAL_PEOPLE){const r=M.simulateAgents(left,right);if(r.eligible){assert.ok(r.score>=0&&r.score<=100);for(const n of Object.values(r.components))assert.ok(n>=0&&n<=1);}}
});
test('missing/private optional fields earn zero without reweighting',()=>{
 const privateB=clone(a);privateB.id='other';for(const field of M.SHARE_FIELDS)if(!['identity','age'].includes(field))privateB.shared[field]=false;
 const r=M.simulateAgents(a,privateB);assert.equal(r.score,40);assert.deepEqual(r.shared.languages,[]);
});
test('bilateral privacy filters precede scores and summaries',()=>{
 for(const mutate of [p=>p.matching=false,p=>p.eligible=false,p=>p.shared.identity=false,p=>p.hobbies.forEach(h=>h.shareForMatching=false),p=>p.blocked.push(b.id)]){
  const p=clone(a);mutate(p);for(const pair of [[p,b],[b,p]]){const r=M.simulateAgents(...pair);assert.equal(r.eligible,false);assert.equal('score' in r,false);assert.equal('candidate' in r,false);assert.deepEqual(r.events.map(e=>e.kind),['permission','permission']);}
 }assert.equal(M.simulateAgents(a,a).reason,'self');
});
test('allowlisted matching payload excludes private and unapproved information',()=>{
 const p={...clone(a),address:'SECRET_ADDRESS',reports:['SECRET_REPORT'],transcript:'SECRET_CHAT',medical:'SECRET_MEDICAL'};p.profile.displayName='PRIVATE_EDIT';p.profile.extra='SECRET_PROFILE';p.shared.age=false;p.shared.languages=false;p.hobbies[1].shareForMatching=false;
 const payload=M.approvedSummary(p);assert.deepEqual(payload.hobbies,['gardening']);assert.deepEqual(payload.languages,[]);assert.equal('age' in payload,false);assert.equal(JSON.stringify(payload).includes('SECRET'),false);assert.equal(JSON.stringify(payload).includes('PRIVATE_EDIT'),false);
 assert.deepEqual(Object.keys(payload).sort(),['id','name','nameJa','hobbies','languages','times','communication','activities','locations'].sort());
});
test('agent sequence emits metadata only and waits for a separate decision',()=>{
 const result=M.simulateAgents(a,b);assert.deepEqual(result.events.map(e=>e.kind),['permission','permission','summary','summary','comparison','score','recommendation']);assert.equal(JSON.stringify(result.events).includes(a.name),false);
});
let saved=P.initialState('tanaka'),state=S.initialSocial();
const people=()=>S.socialPeople(state,saved),person=id=>people().find(p=>p.id===id);
const act=(action,expected=true,healthy=true)=>{const r=S.reduceSocial(state,action,people(),healthy);assert.equal(r.ok,expected,JSON.stringify(action));state=r.state;};
const switchTo=id=>act({type:'switch',id});
test('Stage 4 approval and independent sharing are required',()=>{
 saved=P.reduceSaved(saved,{type:'suggest',ids:['gardening','orchids']});assert.equal(person('tanaka').hobbies.length,0);
 for(const id of ['gardening','orchids'])saved=P.reduceSaved(saved,{type:'approve',id});assert.equal(M.approvedSummary(person('tanaka')),null);
 saved=P.reduceSaved(saved,{type:'matching',enabled:true});for(const id of ['gardening','orchids'])saved=P.reduceSaved(saved,{type:'share',id,enabled:true});
 act({type:'grant',actor:'tanaka',field:'identity',enabled:true,revision:0});assert.equal(M.simulateAgents(person('tanaka'),person('aiko')).score,40);
});
test('invitations require fresh eligibility; sender cannot accept; receiver explicitly accepts',()=>{
 act({type:'message',actor:'tanaka',target:'aiko',text:'hello'},false);
 act({type:'invite',confirmed:true,actor:'tanaka',target:'aiko'});assert.equal(S.relationship(state,person('tanaka'),person('aiko')),'sent');
 act({type:'accept',confirmed:true,actor:'tanaka',target:'aiko'},false);act({type:'invite',confirmed:true,actor:'tanaka',target:'aiko'},false);
 switchTo('aiko');act({type:'accept',confirmed:true,actor:'tanaka',target:'aiko'},false);act({type:'accept',confirmed:true,actor:'aiko',target:'tanaka'});assert.equal(S.relationship(state,person('tanaka'),person('aiko')),'accepted');
 act({type:'message',actor:'aiko',target:'tanaka',text:'  Hello  '});act({type:'reply',actor:'aiko',target:'tanaka'});assert.equal(state.messages[0].text,'Hello');assert.equal(state.messages[1].kind,'scripted');
});
test('opt-out stops invitations but retains approved memory and accepted messaging',()=>{
 switchTo('tanaka');saved=P.reduceSaved(saved,{type:'matching',enabled:false});assert.equal(saved.approved.length,2);assert.equal(M.simulateAgents(person('tanaka'),person('aiko')).eligible,false);
 act({type:'invite',confirmed:true,actor:'tanaka',target:'haru'},false);act({type:'message',actor:'tanaka',target:'aiko',text:'Existing friendship'});
});
test('blocking is bilateral and closes friendship; unblocking does not reopen history',()=>{
 act({type:'block',actor:'tanaka',target:'aiko'});assert.equal(S.canMessage(state,person('aiko'),person('tanaka')),false);assert.equal(state.messages.length,3);
 switchTo('aiko');act({type:'message',actor:'aiko',target:'tanaka',text:'Blocked'},false);act({type:'invite',confirmed:true,actor:'aiko',target:'tanaka'},false);
 switchTo('tanaka');act({type:'unblock',actor:'tanaka',target:'aiko'});assert.equal(S.relationship(state,person('aiko'),person('tanaka')),'none');assert.equal(S.canMessage(state,person('aiko'),person('tanaka')),false);
});
test('recipient decline never authorizes messages',()=>{
 switchTo('aiko');act({type:'invite',confirmed:true,actor:'aiko',target:'haru'});switchTo('haru');act({type:'decline',actor:'haru',target:'aiko'});assert.equal(S.relationship(state,person('aiko'),person('haru')),'declined');act({type:'message',actor:'haru',target:'aiko',text:'No'},false);
});
test('profile edit/revert/reset invalidates field grants; removed hobbies disappear immediately',()=>{
 saved=P.reduceSaved(saved,{type:'matching',enabled:true});saved=P.reduceSaved(saved,{type:'share',id:'gardening',enabled:true});assert.equal(person('tanaka').shared.identity,true);
 const original=clone(saved.profile);saved=P.reduceSaved(saved,{type:'profile',profile:{...original,displayName:'New private name'}});assert.equal(person('tanaka').shared.identity,false);
 saved=P.reduceSaved(saved,{type:'profile',profile:original});assert.equal(person('tanaka').shared.identity,false);
 switchTo('tanaka');act({type:'grant',actor:'tanaka',field:'identity',enabled:true,revision:saved.profileRevision});saved=P.reduceSaved(saved,{type:'delete',id:'gardening'});assert.equal(M.approvedSummary(person('tanaka')),null);
 saved=P.reduceSaved(saved,{type:'reset'});assert.equal(person('tanaka').shared.identity,false);
});
test('communities are explicit, independent of matching and scoped to current account',()=>{
 act({type:'community',actor:'tanaka',community:'gardening',join:true});switchTo('aiko');assert.equal(state.memberships.filter(m=>m.personId==='aiko').length,0);act({type:'community',actor:'tanaka',community:'music',join:true},false);switchTo('tanaka');act({type:'community',actor:'tanaka',community:'gardening',join:false});assert.equal(state.memberships.length,0);
});
test('write failures pause actions while withdrawal and blocking remain possible',()=>{
 switchTo('aiko');act({type:'invite',confirmed:true,actor:'aiko',target:'mei'},false,false);act({type:'message',actor:'aiko',target:'tanaka',text:'No'},false,false);act({type:'block',actor:'aiko',target:'mei'},true,false);act({type:'matching',actor:'aiko',enabled:false},true,false);
 act({type:'matching',actor:'aiko',enabled:true});assert.ok(person('aiko').hobbies.every(h=>!h.shareForMatching));
});
test('persistence roundtrip retains relationships/blocks/messages, strips traces and rejects invalid scope',()=>{
 const serialized=S.serializeSocial(state),restored=S.parseSocial(serialized);assert.deepEqual(restored,{...state,events:[]});assert.equal(serialized.includes('SECRET'),false);assert.throws(()=>S.parseSocial('{'));assert.throws(()=>S.parseSocial(JSON.stringify({...state,version:2})));assert.throws(()=>S.parseSocial(JSON.stringify({...state,activeId:'unknown'})));
});
console.log(`${checks} social domain groups passed`);
