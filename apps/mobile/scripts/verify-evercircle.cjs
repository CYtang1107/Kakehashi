// Pure domain/permission checks, no server, database, React runtime, providers or dependency downloads.
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict'), ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {respond,recognizeInterests,ACTIONS}=require('../src/evercircle/companion/engine.ts');
const {initialState,reduceSaved,parseSaved,serializeSaved,INTERESTS}=require('../src/evercircle/profile/model.ts');
const {matchingSummary,canMatchInterest}=require('../src/evercircle/privacy/permissions.ts');
const {companionContext}=require('../src/evercircle/companion/bridge.ts');
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('ok '+name);};
test('all supported EN/JA intents and truthful unsupported fallbacks',()=>{
  const examples={greeting:['Hello','こんにちは'],interests:['I enjoy gardening','園芸が好きです'],memory:['Record my old sewing machine story','ミシンの思い出を録音したい'],help:['Help me with my home','家の修理を手伝って'],visits:["What is planned for today?",'次の学生の訪問はいつ'],friends:['I want to make new friends','友達を作りたい'],devices:['Turn on the lights','照明をつけて'],reminders:['Set a reminder','リマインダーを設定'],activities:['Suggest activities','活動のおすすめ'],unsupported:['Buy an airplane ticket','航空券を買って']};
  for(const [intent,inputs] of Object.entries(examples)) for(const text of inputs) assert.equal(respond(text,{approved:[]}).intent,intent,text);
  assert.equal(respond('Student visit?',{approved:[]}).key,'cVisitUnknown');assert.equal(respond('Student visit?',{approved:[],nextVisitDate:'2026-10-24'}).date,'2026-10-24');
  assert.ok(respond('Hello',{approved:['chess']}).interest==='chess');
  assert.equal(respond('How are you today?',{approved:[]}).intent,'greeting');assert.equal(respond('今日は元気ですか？',{approved:[]}).intent,'greeting');
  for(const action of Object.values(ACTIONS))assert.ok(action.route.startsWith('/her/'));
});
test('interest vocabulary normalizes orchids and nine supported interests',()=>{
  assert.deepEqual(recognizeInterests('Growing orchids'),['gardening','orchids']);
  assert.deepEqual(recognizeInterests('胡蝶蘭を育てるのが好きです'),['gardening','orchids']);
  for(const text of ['gardening orchids cooking music reading walking chess photography handicrafts','園芸 蘭 料理 音楽 読書 散歩 チェス 写真撮影 手芸'])assert.equal(recognizeInterests(text).length,INTERESTS.length);
});
test('negative/other-person mentions and unrelated words do not become candidates',()=>{
  for(const text of ["I don't like gardening",'園芸は好きじゃない','My daughter likes orchids','Do you like chess?','航空券','old sewing machine'])assert.deepEqual(recognizeInterests(text),[],text);
  assert.deepEqual(recognizeInterests('I hate gardening but I love music'),['music']);
});
let state=initialState('tanaka');const change=action=>state=reduceSaved(state,action);
test('detected interests remain pending; no inferred approval or sharing',()=>{
  change({type:'suggest',ids:['gardening','orchids','gardening']});assert.deepEqual(state.pending,['gardening','orchids']);assert.equal(state.approved.length,0);assert.deepEqual(matchingSummary(state).interests,[]);
  change({type:'approve',id:'chess'});assert.equal(state.approved.length,0);
});
test('Not now rejects; explicit approval saves privately',()=>{
  change({type:'reject',id:'orchids'});change({type:'approve',id:'gardening'});assert.deepEqual(state.pending,[]);assert.equal(state.approved[0].shareForMatching,false);assert.equal(state.matchingEnabled,false);
});
test('global and per-interest permissions are independently required',()=>{
  change({type:'share',id:'gardening',enabled:true});assert.equal(canMatchInterest(state,'gardening'),false);
  change({type:'matching',enabled:true});assert.deepEqual(matchingSummary(state).interests,[]);
  change({type:'share',id:'gardening',enabled:true});assert.deepEqual(matchingSummary(state).interests,['gardening']);assert.deepEqual(matchingSummary(state,false).interests,[]);
  assert.deepEqual(Object.keys(matchingSummary(state)),['householdId','interests']);
});
test('edits revoke sharing and deletion immediately removes matching eligibility',()=>{
  change({type:'edit',id:'gardening',replacement:'orchids'});assert.deepEqual(matchingSummary(state).interests,[]);assert.equal(state.approved[0].id,'orchids');assert.equal(state.approved[0].revision,2);
  change({type:'share',id:'orchids',enabled:true});assert.deepEqual(matchingSummary(state).interests,['orchids']);change({type:'delete',id:'orchids'});assert.deepEqual(matchingSummary(state).interests,[]);
});
test('revocation clears all grants and re-enabling does not resurrect them',()=>{
  change({type:'suggest',ids:['chess']});change({type:'approve',id:'chess'});change({type:'share',id:'chess',enabled:true});change({type:'matching',enabled:false});change({type:'matching',enabled:true});assert.equal(state.approved[0].shareForMatching,false);
});
test('profile parsing allowlists fields, scopes the household and excludes raw chat',()=>{
  change({type:'profile',profile:{displayName:'  Demo resident  ',languages:['ja','xx'],times:['morning'],activities:['walk'],communication:['text'],locations:['library'],chat:'private text'}});
  const loaded=parseSaved(JSON.stringify({...state,chat:'private text',items:[{story:'private'}]}),'tanaka');assert.equal(loaded.profile.displayName,'Demo resident');assert.deepEqual(loaded.profile.languages,['ja']);assert.equal(JSON.stringify(loaded).includes('private'),false);
  assert.throws(()=>parseSaved('{','tanaka'));assert.throws(()=>parseSaved(JSON.stringify({...state,householdId:'someone-else'}),'tanaka'));assert.throws(()=>parseSaved(JSON.stringify({...state,version:2}),'tanaka'));
});
test('unapproved candidates never persist or hydrate; Remember persists the approved choice privately',()=>{
  const pending=reduceSaved(initialState('tanaka'),{type:'suggest',ids:['gardening','orchids']});
  assert.deepEqual(pending.pending,['gardening','orchids']);const raw=serializeSaved(pending);
  assert.deepEqual(JSON.parse(raw).pending,[]);assert.equal(raw.includes('orchids'),false);assert.deepEqual(parseSaved(raw,'tanaka').pending,[]);
  assert.deepEqual(parseSaved(JSON.stringify(pending),'tanaka').pending,[]);
  const approved=parseSaved(serializeSaved(reduceSaved(pending,{type:'approve',id:'gardening'})),'tanaka');
  assert.deepEqual(approved.approved,[{id:'gardening',revision:1,shareForMatching:false}]);assert.deepEqual(approved.pending,[]);
});
test('clear conversation candidates keeps approved memories; reset clears feature data only',()=>{
  change({type:'suggest',ids:['gardening']});change({type:'clearPending'});assert.equal(state.approved[0].id,'chess');assert.deepEqual(state.pending,[]);const revision=state.profileRevision??0;change({type:'reset'});assert.deepEqual(state,{...initialState('tanaka'),profileRevision:revision+1});
});
test('household bridge returns name/date only, ignores private records and unrelated homes',()=>{
  const home={id:'tanaka',seniorName:'Michiko Tanaka',seniorNameJa:'田中 美智子',visits:[{status:'planned',date:'2026-10-24',summary:'secret report'},{status:'planned',date:'2020-01-01'}],seniorInterests:['secret'],familyNotes:['secret']};
  const result=companionContext({home,items:[{story:'secret'}]},'2026-10-15');assert.deepEqual(Object.keys(result),['name','nameJa','nextVisitDate']);assert.equal(JSON.stringify(result).includes('secret'),false);assert.equal(result.nextVisitDate,'2026-10-24');assert.equal(companionContext({home:{...home,id:'other'}},'2026-10-15').nextVisitDate,undefined);
});
console.log(JSON.stringify({checks,passed:true}));
