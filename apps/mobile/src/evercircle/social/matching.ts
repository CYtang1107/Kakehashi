import type { ApprovedInterest, Profile, InterestId } from '../profile/model';

export const SHARE_FIELDS = ['identity', 'age', 'languages', 'times', 'communication', 'activities', 'locations'] as const;
export type ShareField = typeof SHARE_FIELDS[number];
export type SocialPerson = {
  id: string; name: string; nameJa: string; age?: number; profile: Profile; hobbies: ApprovedInterest[];
  matching: boolean; eligible: boolean; shared: Record<ShareField, boolean>; blocked: string[];
};
export type ApprovedSummary = {
  id: string; name: string; nameJa: string; age?: number; hobbies: InterestId[];
  languages: Profile['languages']; times: Profile['times']; communication: Profile['communication'];
  activities: Profile['activities']; locations: Profile['locations'];
};
export const WEIGHTS = { hobbies: .40, languages: .20, times: .15, communication: .10, activities: .10, locations: .05 } as const;
export type Component = keyof typeof WEIGHTS;
export type Exclusion = 'self' | 'blocked' | 'optedOut' | 'unavailable' | 'identityPrivate' | 'hobbiesPrivate';
export function personEligibility(person: SocialPerson): Exclusion | null {
  if (!person.matching) return 'optedOut';
  if (!person.eligible) return 'unavailable';
  if (!person.shared.identity) return 'identityPrivate';
  if (!person.hobbies.some(h => h.shareForMatching)) return 'hobbiesPrivate';
  return null;
}
export function eligibility(a: SocialPerson, b: SocialPerson): Exclusion | null {
  if (a.id === b.id) return 'self';
  if (a.blocked.includes(b.id) || b.blocked.includes(a.id)) return 'blocked';
  return personEligibility(a) ?? personEligibility(b);
}
// Construct an allowlist. Never spread the input person, profile or any household bundle.
export function approvedSummary(person: SocialPerson): ApprovedSummary | null {
  if (personEligibility(person)) return null;
  return { id: person.id, name: person.name, nameJa: person.nameJa,
    ...(person.shared.age && person.age !== undefined ? { age: person.age } : {}),
    hobbies: person.hobbies.filter(h => h.shareForMatching).map(h => h.id),
    languages: person.shared.languages ? [...person.profile.languages] : [],
    times: person.shared.times ? [...person.profile.times] : [],
    communication: person.shared.communication ? [...person.profile.communication] : [],
    activities: person.shared.activities ? [...person.profile.activities] : [],
    locations: person.shared.locations ? [...person.profile.locations] : [] };
}
export const common = <T extends string>(a: readonly T[], b: readonly T[]): T[] => [...new Set(a)].filter(value => b.includes(value));
const jaccard = (a: readonly string[], b: readonly string[]) => !a.length || !b.length ? 0 : common(a,b).length / new Set([...a,...b]).size;
export function scoreSummaries(a: ApprovedSummary, b: ApprovedSummary) {
  const components: Record<Component, number> = { hobbies: jaccard(a.hobbies,b.hobbies), languages: common(a.languages,b.languages).length ? 1 : 0,
    times: jaccard(a.times,b.times), communication: jaccard(a.communication,b.communication),
    activities: jaccard(a.activities,b.activities), locations: jaccard(a.locations,b.locations) };
  const score = Math.round(1000 * (Object.keys(WEIGHTS) as Component[]).reduce((sum,key) => sum + WEIGHTS[key]*components[key],0)) / 10;
  return { score, components, shared: { hobbies: common(a.hobbies,b.hobbies), languages: common(a.languages,b.languages), times: common(a.times,b.times),
    communication: common(a.communication,b.communication), activities: common(a.activities,b.activities), locations: common(a.locations,b.locations) } };
}
export type AgentEvent = { step: number; kind: 'permission' | 'summary' | 'comparison' | 'score' | 'recommendation' | 'decision';
  actor: string; peer: string; allowed?: boolean; fields?: string[]; score?: number; decision?: 'invite' | 'accept' | 'decline' | 'block' };
export type MatchResult = { eligible: false; reason: Exclusion; events: AgentEvent[] } |
  ({ eligible: true; candidate: ApprovedSummary; events: AgentEvent[] } & ReturnType<typeof scoreSummaries>);
export function simulateAgents(a: SocialPerson, b: SocialPerson): MatchResult {
  const events: AgentEvent[] = [{ step: 1, kind: 'permission', actor: a.id, peer: b.id, allowed: !personEligibility(a) && !a.blocked.includes(b.id) },
    { step: 2, kind: 'permission', actor: b.id, peer: a.id, allowed: !personEligibility(b) && !b.blocked.includes(a.id) }];
  const reason = eligibility(a,b); if (reason) return { eligible: false, reason, events };
  const own = approvedSummary(a)!, candidate = approvedSummary(b)!;
  for (const [person,peer] of [[own,candidate],[candidate,own]]) events.push({ step: events.length+1, kind:'summary', actor:person.id, peer:peer.id,
    fields: Object.keys(person).filter(key => !Array.isArray(person[key as keyof ApprovedSummary]) || (person[key as keyof ApprovedSummary] as unknown[]).length > 0) });
  const scored = scoreSummaries(own,candidate);
  events.push({ step:5,kind:'comparison',actor:a.id,peer:b.id,fields:Object.keys(WEIGHTS) },{ step:6,kind:'score',actor:a.id,peer:b.id,score:scored.score },{ step:7,kind:'recommendation',actor:a.id,peer:b.id });
  return { eligible:true,candidate,...scored,events };
}
