import { INTERESTS, type InterestId, type SavedState } from '../profile/model';
import { persona } from '../demo/persona';
import { COMMUNITIES, FICTIONAL_PEOPLE, type CommunityId } from './fixtures';
import { eligibility, SHARE_FIELDS, type AgentEvent, type ShareField, type SocialPerson } from './matching';

export const PERSON_IDS = ['tanaka', ...FICTIONAL_PEOPLE.map(p=>p.id)];
export type SocialSettings = { matching: boolean; eligible: boolean; grants: Record<ShareField,string|null>; blocked: string[]; hiddenHobbies:InterestId[] };
export type Relation = { key: string; from: string; to: string; status: 'pending'|'accepted'|'declined' };
export type SocialMessage = { id:number; key:string; from:string; to:string; kind:'typed'|'scripted'; text:string };
export type ReportReason = 'unwanted'|'concern';
export type SocialState = { version:1; activeId:string; settings:Record<string,SocialSettings>; relations:Relation[];
  messages:SocialMessage[]; memberships:{personId:string;communityId:CommunityId}[]; reports:{by:string;target:string;reason:ReportReason}[];
  events:AgentEvent[]; sequence:number };
export const pairKey = (a:string,b:string) => [a,b].sort().join('~');
export function fieldToken(person:SocialPerson, field:ShareField, revision:number=0):string {
  // Permission binds to an explicit profile revision, without copying private field values.
  return `${person.id}:${field}:${revision}`;
}
export function initialSocial():SocialState {
  const settings:Record<string,SocialSettings> = {};
  for (const id of PERSON_IDS) {
    const fixture=FICTIONAL_PEOPLE.find(p=>p.id===id);
    settings[id]={matching:fixture?.matching??false,eligible:fixture?.eligible??true,blocked:[],hiddenHobbies:[],
      grants:Object.fromEntries(SHARE_FIELDS.map(field=>[field,fixture?.shared[field]?fieldToken(fixture,field):null])) as SocialSettings['grants']};
  }
  return {version:1,activeId:'tanaka',settings,relations:[],messages:[],memberships:[],reports:[],events:[],sequence:0};
}
// Stage 4 is the only authority for Tanaka's approved hobbies, matching opt-in and private preferences.
// This adapter deliberately accepts SavedState, never HomeBundle or companion messages.
export function socialPeople(state:SocialState, saved:SavedState, profileHealthy=true):SocialPerson[] {
  const current:SocialPerson={id:'tanaka',name:saved.profile.displayName||persona.name,nameJa:saved.profile.displayName||persona.nameJa,
    profile:saved.profile,hobbies:saved.approved,matching:saved.matchingEnabled&&profileHealthy,eligible:true,blocked:[],
    shared:{identity:false,age:false,languages:false,times:false,communication:false,activities:false,locations:false}};
  return [current,...FICTIONAL_PEOPLE].map(raw=>{
    const setting=state.settings[raw.id],revision=raw.id==='tanaka'?(saved.profileRevision??0):0;
    return {...raw,matching:raw.id==='tanaka'?raw.matching:setting.matching,eligible:setting.eligible,blocked:setting.blocked,
      hobbies:raw.id==='tanaka'?raw.hobbies:raw.hobbies.map(h=>({...h,shareForMatching:h.shareForMatching&&!setting.hiddenHobbies.includes(h.id)})),
      shared:Object.fromEntries(SHARE_FIELDS.map(field=>[field,setting.grants[field]===fieldToken(raw,field,revision)])) as SocialPerson['shared']};
  });
}
export function relationship(state:SocialState,a:SocialPerson,b:SocialPerson):'none'|'sent'|'received'|'accepted'|'declined'|'blocked' {
  if(a.blocked.includes(b.id)||b.blocked.includes(a.id))return 'blocked';
  const relation=state.relations.find(r=>r.key===pairKey(a.id,b.id));
  return !relation?'none':relation.status==='pending'?(relation.from===a.id?'sent':'received'):relation.status;
}
export const canMessage=(state:SocialState,a:SocialPerson,b:SocialPerson,healthy=true)=>healthy&&relationship(state,a,b)==='accepted';
export type SocialAction =
  | {type:'switch';id:string}
  | {type:'grant';actor:string;field:ShareField;enabled:boolean;revision:number}
  | {type:'hobby';actor:string;id:InterestId;enabled:boolean}
  | {type:'matching';actor:string;enabled:boolean}
  | {type:'eligible';actor:string;enabled:boolean}
  | {type:'invite'|'accept'|'decline'|'block'|'unblock'|'reply';actor:string;target:string}
  | {type:'message';actor:string;target:string;text:string}
  | {type:'report';actor:string;target:string;reason:ReportReason}
  | {type:'community';actor:string;community:CommunityId;join:boolean};
export function reduceSocial(state:SocialState,action:SocialAction,people:SocialPerson[],healthy=true):{state:SocialState;ok:boolean} {
  const reject=()=>({state,ok:false}), done=(next:SocialState)=>({state:next,ok:true});
  if(action.type==='switch')return PERSON_IDS.includes(action.id)?done({...state,activeId:action.id}):reject();
  if(action.actor!==state.activeId)return reject();
  const actor=people.find(p=>p.id===action.actor);if(!actor)return reject();
  const setting=state.settings[actor.id];
  const withSetting=(value:SocialSettings)=>done({...state,settings:{...state.settings,[actor.id]:value}});
  // Withdrawal/blocking is still effective in this session if a previous disk write failed.
  if(!healthy&&!['block','decline','report'].includes(action.type)&&!((action.type==='matching'||action.type==='eligible'||action.type==='grant'||action.type==='hobby')&&!action.enabled))return reject();
  if(action.type==='grant')return withSetting({...setting,grants:{...setting.grants,[action.field]:action.enabled?fieldToken(actor,action.field,action.revision):null}});
  if(action.type==='matching')return actor.id==='tanaka'?reject():withSetting({...setting,matching:action.enabled,hiddenHobbies:action.enabled?setting.hiddenHobbies:actor.hobbies.map(h=>h.id)});
  if(action.type==='hobby')return actor.id==='tanaka'||!actor.hobbies.some(h=>h.id===action.id)||action.enabled&&!actor.matching?reject():withSetting({...setting,hiddenHobbies:action.enabled?setting.hiddenHobbies.filter(id=>id!==action.id):[...new Set([...setting.hiddenHobbies,action.id])]});
  if(action.type==='eligible')return withSetting({...setting,eligible:action.enabled});
  if(action.type==='community') {
    if(!COMMUNITIES.includes(action.community))return reject();
    const memberships=state.memberships.filter(m=>!(m.personId===actor.id&&m.communityId===action.community));
    return done({...state,memberships:action.join?[...memberships,{personId:actor.id,communityId:action.community}]:memberships});
  }
  const target=people.find(p=>p.id===action.target);if(!target||target.id===actor.id)return reject();
  const key=pairKey(actor.id,target.id), existing=state.relations.find(r=>r.key===key);
  const decision=(kind:'invite'|'accept'|'decline'|'block')=>[...state.events,{step:state.sequence+1,kind:'decision' as const,actor:actor.id,peer:target.id,decision:kind}].slice(-100);
  if(action.type==='block')return done({...state,settings:{...state.settings,[actor.id]:{...setting,blocked:[...new Set([...setting.blocked,target.id])]}},
    relations:state.relations.filter(r=>r.key!==key),events:decision('block'),sequence:state.sequence+1});
  if(action.type==='unblock')return withSetting({...setting,blocked:setting.blocked.filter(id=>id!==target.id)});
  if(action.type==='report')return state.reports.length>=100?reject():done({...state,reports:[...state.reports,{by:actor.id,target:target.id,reason:action.reason}]});
  const status=relationship(state,actor,target);
  if(action.type==='invite') {
    if(eligibility(actor,target)||status==='sent'||status==='received'||status==='accepted')return reject();
    return done({...state,relations:[...state.relations.filter(r=>r.key!==key),{key,from:actor.id,to:target.id,status:'pending'}],events:decision('invite'),sequence:state.sequence+1});
  }
  if(action.type==='accept'||action.type==='decline') {
    if(!existing||status!=='received'||(action.type==='accept'&&eligibility(actor,target)))return reject();
    return done({...state,relations:state.relations.map(r=>r.key===key?{...r,status:action.type==='accept'?'accepted':'declined'}:r),events:decision(action.type),sequence:state.sequence+1});
  }
  if(!canMessage(state,actor,target,healthy)||state.messages.filter(m=>m.key===key).length>=100)return reject();
  const text=action.type==='message'?action.text.trim():'';
  if(action.type==='message'&&(!text||text.length>800))return reject();
  return done({...state,sequence:state.sequence+1,messages:[...state.messages,{id:state.sequence+1,key,from:action.type==='reply'?target.id:actor.id,
    to:action.type==='reply'?actor.id:target.id,kind:action.type==='reply'?'scripted':'typed',text}]});
}

export function parseSocial(raw:string|null):SocialState {
  if(!raw)return initialSocial();const value=JSON.parse(raw),fresh=initialSocial();
  if(value?.version!==1||!PERSON_IDS.includes(value.activeId)||!value.settings)throw Error('Unsupported social demo');
  fresh.activeId=value.activeId;
  for(const id of PERSON_IDS){const s=value.settings[id];if(!s||!s.grants||!Array.isArray(s.blocked))throw Error('Invalid social settings');
    fresh.settings[id]={matching:s.matching===true,eligible:s.eligible===true,blocked:[...new Set<string>(s.blocked.filter((v:unknown)=>typeof v==='string'&&PERSON_IDS.includes(v)&&v!==id))],hiddenHobbies:Array.isArray(s.hiddenHobbies)?s.hiddenHobbies.filter((v:InterestId)=>INTERESTS.includes(v)):[],
      grants:Object.fromEntries(SHARE_FIELDS.map(field=>[field,typeof s.grants[field]==='string'&&s.grants[field].length<1000?s.grants[field]:null])) as SocialSettings['grants']};}
  const validPair=(r:{from:string;to:string;key:string})=>PERSON_IDS.includes(r?.from)&&PERSON_IDS.includes(r?.to)&&r.from!==r.to&&r.key===pairKey(r.from,r.to);
  if(!Array.isArray(value.relations)||!Array.isArray(value.messages)||!Array.isArray(value.memberships)||!Array.isArray(value.reports))throw Error('Invalid social records');
  for(const r of value.relations){if(!validPair(r)||!['pending','accepted','declined'].includes(r.status)||fresh.relations.some(x=>x.key===r.key))throw Error('Invalid relationship');fresh.relations.push({key:r.key,from:r.from,to:r.to,status:r.status});}
  for(const m of value.messages){if(!validPair(m)||!Number.isSafeInteger(m.id)||m.id<1||!['typed','scripted'].includes(m.kind)||typeof m.text!=='string'||m.text.length>800||fresh.messages.filter(x=>x.key===m.key).length>=100)throw Error('Invalid message');fresh.messages.push({key:m.key,from:m.from,to:m.to,id:m.id,kind:m.kind,text:m.kind==='typed'?m.text:''});}
  for(const m of value.memberships)if(PERSON_IDS.includes(m?.personId)&&COMMUNITIES.includes(m?.communityId)&&!fresh.memberships.some(x=>x.personId===m.personId&&x.communityId===m.communityId))fresh.memberships.push({personId:m.personId,communityId:m.communityId});
  for(const r of value.reports.slice(0,100))if(PERSON_IDS.includes(r?.by)&&PERSON_IDS.includes(r?.target)&&['unwanted','concern'].includes(r?.reason))fresh.reports.push({by:r.by,target:r.target,reason:r.reason});
  fresh.sequence=Math.max(0,...fresh.messages.map(m=>m.id),Number.isSafeInteger(value.sequence)&&value.sequence>=0?value.sequence:0);
  // Traces are transient, regenerated from current approved data; old score metadata never survives revocation.
  return fresh;
}
export const serializeSocial=(state:SocialState)=>JSON.stringify({...state,events:[]});
