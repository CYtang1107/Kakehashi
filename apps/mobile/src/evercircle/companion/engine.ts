import type { Key } from '../../i18n';
import type { InterestId } from '../profile/model';

const vocabulary: Record<InterestId, RegExp> = {
  gardening: /\bgarden(?:ing|s)?\b|\bplants?\b|\bgrow(?:ing)? orchids?\b|園芸|庭仕事|ガーデニング|植物|蘭|ランを|らんを|orchids?/i,
  orchids: /\borchids?\b|洋蘭|胡蝶蘭|蘭|ランを|らんを/i,
  cooking: /\bcook(?:ing)?\b|\bbak(?:e|ing)\b|料理|お菓子作り|パン作り/i,
  music: /\bmusic\b|\bsing(?:ing)?\b|\bpiano\b|音楽|歌う|合唱|ピアノ/i,
  reading: /\bread(?:ing)?\b|\bbooks?\b|\bnovels?\b|読書|本を読む|小説/i,
  walking: /\bwalk(?:ing|s)?\b|\bstroll(?:ing)?\b|散歩|ウォーキング/i,
  chess: /\bchess\b|チェス/i,
  photography: /\bphotograph(?:y|s)?\b|\btaking photos\b|写真撮影|写真を撮|カメラ/i,
  handicrafts: /\bhandicrafts?\b|\bknit(?:ting)?\b|\bsew(?:ing)?\b(?! machine)|\bcrafts?\b|手芸|編み物|裁縫/i,
};
const normalized = (text: string) => text.normalize('NFKC').toLowerCase();
export function recognizeInterests(text: string): InterestId[] {
  const found = new Set<InterestId>();
  for (const clause of normalized(text).split(/[.!?。！？;；\n]|\bbut\b|でも|しかし|けれど/)) {
    if (/\b(don'?t|do not|dislike|hate|no longer|never|not interested)\b|好きではない|好きじゃない|嫌い|興味がない|苦手/.test(clause)) continue;
    if (/\b(my (daughter|son|friend|mother|father)|she|he|they|do you|can you)\b|あなた|娘は|息子は|友人は/.test(clause)) continue;
    for (const id of Object.keys(vocabulary) as InterestId[]) if (vocabulary[id].test(clause)) found.add(id);
  }
  return [...found];
}
export const ACTIONS = {
  memories: { label: 'cOpenMemories', route: '/her/memories' }, help: { label: 'hRequestHelp', route: '/her/help' },
  day: { label: 'hDay', route: '/her/my-day' }, friends: { label: 'hFriends', route: '/her/friends' },
  profile: { label: 'cProfile', route: '/her/profile' }, smart: { label: 'hSmart', route: '/her/smart-home' },
} as const satisfies Record<string, { label: Key; route: string }>;
export type ActionId = keyof typeof ACTIONS;
export type Intent = 'greeting' | 'interests' | 'memory' | 'help' | 'visits' | 'friends' | 'devices' | 'reminders' | 'activities' | 'unsupported';
export type Reply = { intent: Intent; key: Key; actions: ActionId[]; candidates: InterestId[]; date?: string; interest?: InterestId; text?: string };
export function respond(text: string, context: { approved: InterestId[]; nextVisitDate?: string }): Reply {
  const input = normalized(text), candidates = recognizeInterests(input);
  const reply = (intent: Intent, key: Key, actions: ActionId[]): Reply => ({ intent, key, actions, candidates });
  if (/^\s*(hello|hi|hey|how are you(?: today)?|good morning|good evening|こんにちは|おはよう(?:ございます)?|こんばんは|今日は元気ですか)[\s?.!。！]*$/.test(input)) {
    return { ...reply('greeting',context.approved.length?'cPersonalGreeting':'cGreeting',[]), interest: context.approved[0] };
  }
  if (/\b(device|lights?|thermostat|temperature)\b|電気|照明|エアコン|デバイス/.test(input)) return reply('devices','cDeviceReply',['smart','help']);
  if (/\b(remind|reminder|alarm)\b|リマインダー|思い出させ|通知/.test(input)) return reply('reminders','cReminderReply',['day']);
  if (/\b(friend|friends|meet people|lonely)\b|友達|友人|さびしい|寂しい/.test(input)) return reply('friends','cFriendReply',['profile','friends']);
  if (/\b(visit|visits|student|students|today|planned|schedule)\b|訪問|学生|今日|予定/.test(input)) {
    return { ...reply('visits',context.nextVisitDate?'cVisitReply':'cVisitUnknown',['day']), date: context.nextVisitDate };
  }
  if (/\b(help|home|repair|clean|cleaning)\b|手伝|掃除|修理|家の/.test(input)) return reply('help','cHelpReply',['help']);
  if (/\b(memory|memories|story|record|sewing machine|photo album)\b|思い出|物語|録音|ミシン|アルバム/.test(input)) return reply('memory','cMemoryReply',['memories']);
  if (/\b(activities|activity|suggest|something to do)\b|活動|おすすめ|何をし/.test(input)) return reply('activities','cActivityReply',['friends','day']);
  if (candidates.length) return reply('interests','cInterestReply',['profile']);
  if (/\b(hello|hi|hey|how are you|good morning|good evening)\b|こんにちは|おはよう|こんばんは|元気/.test(input)) {
    return { ...reply('greeting',context.approved.length?'cPersonalGreeting':'cGreeting',[]), interest: context.approved[0] };
  }
  return reply('unsupported','cUnsupported',[]);
}
