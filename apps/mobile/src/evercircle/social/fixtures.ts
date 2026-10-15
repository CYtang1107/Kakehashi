import { cleanProfile, type InterestId, type Profile } from '../profile/model';
import type { SocialPerson } from './matching';

type FixtureInput = [string,string,string,number,InterestId[],Partial<Profile>];
const rows: FixtureInput[] = [
  ['aiko','Aiko Mori','森 愛子',74,['gardening','orchids'],{languages:['ja','en'],times:['morning','afternoon'],communication:['text','inPerson'],activities:['garden','tea'],locations:['garden','community']}],
  ['haru','Haru Sato','佐藤 晴',77,['gardening','orchids','photography'],{languages:['ja'],times:['afternoon'],communication:['text'],activities:['garden','walk'],locations:['garden']}],
  ['mei','Mei Chen','メイ・チェン',68,['cooking','handicrafts'],{languages:['en','ja'],times:['evening'],communication:['phone','text'],activities:['tea','crafts'],locations:['community','online']}],
  ['ken','Ken Ito','伊藤 健',81,['chess','reading'],{languages:['ja'],times:['morning'],communication:['inPerson'],activities:['games','books'],locations:['library']}],
  ['lina','Lina Rahman','リナ・ラーマン',70,['music','walking'],{languages:['en'],times:['afternoon','evening'],communication:['text','phone'],activities:['music','walk'],locations:['community','online']}],
  ['omar','Omar Ali','オマル・アリ',66,['cooking','reading','chess'],{languages:['en'],times:['morning','evening'],communication:['text'],activities:['books','games'],locations:['online','library']}],
  ['sora','Sora Nakamura','中村 空',79,['gardening','walking'],{languages:['ja'],times:['morning'],communication:['inPerson'],activities:['walk'],locations:['garden']}],
  ['yuki','Yuki Kobayashi','小林 雪',83,['music','reading'],{languages:['ja'],times:['afternoon'],communication:['phone'],activities:['music','tea'],locations:['community']}],
];
// All values below are authored fictional demo data, not household observations.
export const FICTIONAL_PEOPLE: SocialPerson[] = rows.map(([id,name,nameJa,age,hobbies,profile]) => ({ id,name,nameJa,age,
  profile:cleanProfile({...profile,displayName:name}), hobbies:hobbies.map(id=>({id,revision:1,shareForMatching:true})),
  matching:id !== 'sora', eligible:id !== 'yuki', blocked:[],
  shared:{identity:true,age:true,languages:true,times:true,communication:true,activities:true,locations:true} }));
export const COMMUNITIES = ['gardening','cooking','music','reading','chess','walking'] as const;
export type CommunityId = typeof COMMUNITIES[number];
