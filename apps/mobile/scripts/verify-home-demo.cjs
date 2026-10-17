// Pure checks: deterministic grammar, device allowlist, persistence boundary and reminder lifecycle.
const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {interpretCommand,applyChanges,DEVICES,ROUTINES}=require('../src/evercircle/smartHome/model.ts');
const {initialDemo,reduceDemo,parseDemo}=require('../src/evercircle/homeDemo/model.ts');
const {makeReminder,dailySummary,upcomingVisits}=require('../src/evercircle/assistance/model.ts');
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('ok '+name);};
test('supported commands target known mock devices in EN/JA',()=>{
 for(const [text,id,on] of [['Turn on the living room light.','living-light',true],['Switch off the bedroom fan.','bedroom-fan',false],['Turn off the television.','living-tv',false],['寝室のカーテンを開けて','bedroom-curtains',true],['キッチンの電気を消して','kitchen-light',false]])assert.deepEqual(interpretCommand(text),{kind:'recognized',change:{id,on}});
});
test('ambiguous commands require explicit room choice',()=>{
 for(const text of ['Open the curtains.','カーテンを開けて']) {const c=interpretCommand(text);assert.equal(c.kind,'ambiguous');assert.deepEqual(c.choices.map(d=>d.id),['living-curtains','bedroom-curtains']);}
 assert.equal(interpretCommand('Turn on the light').choices.length,3);
});
test('unsupported, negated, compound, unsafe and nonexistent-room commands never execute',()=>{
 for(const text of ['', 'unlock the door','Turn on the kitchen fan','Turn on the garage light','Turn on living room light and turn off television',"Don't turn on the light",'Turn on the light tomorrow','Open the light','Turn on the curtains','閉めて','テレビを消してから照明をつけて','set temperature to 80'])assert.equal(interpretCommand(text).kind,'unsupported',text);
});
test('every device accepts explicit on and off; room changes are isolated',()=>{
 let s=initialDemo('tanaka');for(const d of DEVICES){const before={...s.devices};s=reduceDemo(s,{type:'devices',changes:[{id:d.id,on:true}],at:'2026-10-16T08:00:00Z',id:d.id});assert.equal(s.devices[d.id],true);for(const other of DEVICES.filter(o=>o.id!==d.id))assert.equal(s.devices[other.id],before[other.id]);}
 s=reduceDemo(s,{type:'devices',changes:DEVICES.map(d=>({id:d.id,on:false})),at:'2026-10-16T09:00:00Z',id:'all'});assert.ok(Object.values(s.devices).every(v=>v===false));
});
test('unknown devices are rejected by the mutation boundary',()=>{const s=initialDemo('tanaka');assert.deepEqual(applyChanges(s.devices,[{id:'door-lock',on:true}]),s.devices);assert.equal(reduceDemo(s,{type:'devices',changes:[{id:'door-lock',on:true}],at:'2026-10-16T08:00:00Z',id:'unsafe'}),s);});
test('routine preview is pure, applying both routines produces expected exact states',()=>{
 const s=initialDemo('tanaka');const preview=ROUTINES.morning.map(c=>s.devices[c.id]!==c.on);assert.equal(preview.filter(Boolean).length,3);assert.ok(Object.values(s.devices).every(v=>!v));
 const morning=reduceDemo(s,{type:'devices',changes:ROUTINES.morning,at:'2026-10-16T08:00:00Z',id:'morning'});assert.equal(morning.devices['living-fan'],true);
 const evening=reduceDemo(morning,{type:'devices',changes:ROUTINES.evening,at:'2026-10-16T18:00:00Z',id:'evening'});assert.equal(evening.devices['bedroom-light'],true);assert.equal(evening.devices['bedroom-curtains'],false);assert.equal(evening.devices['living-tv'],false);
 assert.equal(reduceDemo(evening,{type:'devices',changes:ROUTINES.evening,at:'2026-10-16T18:01:00Z',id:'again'}),evening);
});
test('reminder validation rejects missing, impossible or malformed dates/times',()=>{
 for(const [title,date,time] of [['','2026-10-16','09:30'],['x','2026-02-30','09:30'],['x','2026-10-16','24:00'],['x','2026-10-16','9:30'],['x','bad','09:30']])assert.equal(makeReminder(title,date,time,'reminder','r'),null);
});
test('local creation, scheduling, completion and undo survive hydration',()=>{
 let s=initialDemo('tanaka');for(const [id,kind]of [['r','reminder'],['a','activity']])s=reduceDemo(s,{type:'add',reminder:makeReminder(' A little reading ','2026-10-16','15:00',kind,id)});
 s=reduceDemo(s,{type:'complete',id:'r',completed:true});s=parseDemo(JSON.stringify(s),'tanaka');assert.equal(s.reminders[0].completed,true);assert.equal(s.reminders[1].kind,'activity');assert.equal(dailySummary(s.reminders,'2026-10-16').length,1);
 s=reduceDemo(s,{type:'complete',id:'r',completed:false});assert.equal(dailySummary(s.reminders,'2026-10-16').length,2);assert.equal(s.reminders[0].title,'A little reading');
});
test('scope and schema fail closed, hydration strips unknown data',()=>{
 let s=initialDemo('tanaka');s.devices['living-light']=true;const raw=JSON.stringify({...s,visits:['secret'],transcript:'secret'});const restored=parseDemo(raw,'tanaka');assert.equal(restored.devices['living-light'],true);assert.equal(JSON.stringify(restored).includes('secret'),false);
 for(const raw of ['{',JSON.stringify({...s,householdId:'other'}),JSON.stringify({...s,version:2}),JSON.stringify({...s,devices:{}}),JSON.stringify({...s,reminders:[{id:'r'}]})])assert.throws(()=>parseDemo(raw,'tanaka'));
 assert.deepEqual(parseDemo(null,'tanaka'),initialDemo('tanaka'));
});
test('visit projection reads original appointments and never creates duplicates',()=>{
 const home={visits:[{id:'old',status:'planned',date:'2026-01-01'},{id:'next',status:'planned',date:'2026-10-18'},{id:'today',status:'planned',date:'2026-10-16'},{id:'done',status:'done',date:'2026-10-20'}]};const raw=JSON.stringify(home);const list=upcomingVisits(home,'2026-10-16');assert.deepEqual(list.map(v=>v.id),['today','next']);assert.equal(list[0],home.visits[2]);assert.equal(JSON.stringify(home),raw);assert.deepEqual(upcomingVisits(undefined,'2026-10-16'),[]);
});
test('log retention and reminder capacity are bounded',()=>{
 let s=initialDemo('tanaka');for(let i=0;i<30;i++)s=reduceDemo(s,{type:'devices',changes:[{id:'living-light',on:i%2===0}],at:'2026-10-16T08:00:00Z',id:String(i)});assert.equal(s.activity.length,20);
 for(let i=0;i<101;i++)s=reduceDemo(s,{type:'add',reminder:makeReminder('Task','2026-10-16','09:30','reminder',String(i))});assert.equal(s.reminders.length,100);
 assert.equal(Object.hasOwn(s,'visits'),false);assert.equal(Object.hasOwn(s,'safety'),false);
});
console.log(`${checks} groups passed`);
