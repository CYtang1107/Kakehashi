import type { InterestId, SavedState } from '../profile/model';
import type { Exclusion, SocialPerson } from '../social/matching';
import type { SocialState } from '../social/model';
import type { DeviceChange } from '../smartHome/model';

export function canShareInterest(state: SavedState, id: InterestId, healthy = true): boolean {
  return healthy && state.matchingEnabled && state.approved.some(i => i.id === id);
}
export function matchingDenial(person: SocialPerson): Exclusion | null {
  if (!person.matching) return 'optedOut';
  if (!person.eligible) return 'unavailable';
  if (!person.shared.identity) return 'identityPrivate';
  if (!person.hobbies.some(h => h.shareForMatching)) return 'hobbiesPrivate';
  return null;
}
export const canParticipateInMatching = (person: SocialPerson, healthy = true) => healthy && !matchingDenial(person);
export function pairDenial(a: SocialPerson, b: SocialPerson): Exclusion | null {
  if (a.id === b.id) return 'self';
  if (a.blocked.includes(b.id) || b.blocked.includes(a.id)) return 'blocked';
  return matchingDenial(a) ?? matchingDenial(b);
}
export function canSendInvitation(state: SocialState, a: SocialPerson, b: SocialPerson, confirmed = false, healthy = true) {
  return confirmed && healthy && !pairDenial(a, b) && !state.relations.some(r =>
    ((r.from === a.id && r.to === b.id) || (r.from === b.id && r.to === a.id)) && r.status !== 'declined');
}
export function canSendMessage(state: SocialState, a: SocialPerson, b: SocialPerson, healthy = true) {
  return healthy && !a.blocked.includes(b.id) && !b.blocked.includes(a.id) && state.relations.some(r =>
    r.status === 'accepted' && ((r.from === a.id && r.to === b.id) || (r.from === b.id && r.to === a.id)));
}
export function canAccessMemory(owner: string, household: string, purpose: 'owner' | 'matching' | 'student' | 'family') {
  return Boolean(owner) && owner === household && purpose === 'owner';
}
export function canPerformDeviceAction(owner: string, household: string, changes: readonly DeviceChange[], devices: Record<string, boolean>, healthy = true) {
  return healthy && Boolean(owner) && owner === household && changes.length > 0 && changes.every(c =>
    Object.prototype.hasOwnProperty.call(devices, c.id) && typeof c.on === 'boolean');
}
// Event metadata accepts no arbitrary strings, identifiers, profile values or nested objects.
export function sanitizeAgentPayload(input: unknown): { allowed?: boolean; confirmed?: boolean; count?: number } {
  if (!input || typeof input !== 'object') return {};
  const value = input as Record<string, unknown>;
  return { ...(typeof value.allowed === 'boolean' ? { allowed: value.allowed } : {}),
    ...(typeof value.confirmed === 'boolean' ? { confirmed: value.confirmed } : {}),
    ...(typeof value.count === 'number' && Number.isSafeInteger(value.count) && value.count >= 0 && value.count <= 100 ? { count: value.count } : {}) };
}

export function canMatchInterest(state: SavedState, id: InterestId, storageHealthy = true): boolean {
  return canShareInterest(state, id, storageHealthy) && state.approved.some(i => i.id === id && i.shareForMatching);
}
// Always derive at use time. No cached matching payload survives edit, revocation or deletion.
// Intentionally excludes display name, profile free text, location, household records and chat.
export function matchingSummary(state: SavedState, storageHealthy = true) {
  return { householdId: state.householdId, interests: state.approved.filter(i => canMatchInterest(state, i.id, storageHealthy)).map(i => i.id) };
}
