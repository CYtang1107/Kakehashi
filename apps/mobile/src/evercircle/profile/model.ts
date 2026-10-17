import { canShareInterest } from '../privacy/permissions';
export const INTERESTS = ['gardening', 'orchids', 'cooking', 'music', 'reading', 'walking', 'chess', 'photography', 'handicrafts'] as const;
export type InterestId = typeof INTERESTS[number];
export const LANGUAGES = ['en', 'ja'] as const;
export const ACTIVITIES = ['tea', 'garden', 'walk', 'music', 'books', 'games', 'crafts'] as const;
export const TIMES = ['morning', 'afternoon', 'evening'] as const;
export const COMMUNICATION = ['text', 'phone', 'inPerson'] as const;
export const LOCATIONS = ['community', 'library', 'garden', 'online'] as const;
export type Profile = {
  displayName: string;
  languages: (typeof LANGUAGES[number])[];
  activities: (typeof ACTIVITIES[number])[];
  times: (typeof TIMES[number])[];
  communication: (typeof COMMUNICATION[number])[];
  locations: (typeof LOCATIONS[number])[];
};
export type ApprovedInterest = { id: InterestId; revision: number; shareForMatching: boolean };
export type SavedState = { version: 1; householdId: string; profile: Profile; profileRevision?: number; approved: ApprovedInterest[]; pending: InterestId[]; matchingEnabled: boolean };
export type SavedAction =
  | { type: 'suggest'; ids: InterestId[] }
  | { type: 'approve' | 'reject' | 'delete'; id: InterestId }
  | { type: 'edit'; id: InterestId; replacement: InterestId }
  | { type: 'profile'; profile: Profile }
  | { type: 'matching'; enabled: boolean }
  | { type: 'share'; id: InterestId; enabled: boolean }
  | { type: 'clearPending' | 'reset' };

export const initialState = (householdId: string): SavedState => ({ version: 1, householdId,
  profile: { displayName: '', languages: [], activities: [], times: [], communication: [], locations: [] },
  approved: [], pending: [], matchingEnabled: false });
const unique = <T,>(values: T[]) => [...new Set(values)];
const allowed = <T extends string>(value: unknown, choices: readonly T[]): T[] => Array.isArray(value)
  ? unique(value.filter((id): id is T => typeof id === 'string' && choices.includes(id as T))) : [];
export function cleanProfile(value: unknown): Profile {
  const p = value && typeof value === 'object' ? value as Partial<Profile> : {};
  return { displayName: typeof p.displayName === 'string' ? p.displayName.trim().slice(0,60) : '',
    languages: allowed(p.languages, LANGUAGES), activities: allowed(p.activities, ACTIVITIES), times: allowed(p.times, TIMES),
    communication: allowed(p.communication, COMMUNICATION), locations: allowed(p.locations, LOCATIONS) };
}
// Strict scope/version gate and allowlist; unknown data never becomes a permission or a transcript.
export function parseSaved(raw: string | null, householdId: string): SavedState {
  if (!raw) return initialState(householdId);
  const value = JSON.parse(raw);
  if (value?.version !== 1 || value.householdId !== householdId) throw new Error('Unsupported or mismatched demo state');
  const approved: ApprovedInterest[] = [];
  for (const entry of Array.isArray(value.approved) ? value.approved : []) {
    if (INTERESTS.includes(entry?.id) && !approved.some(i => i.id === entry.id)) approved.push({ id: entry.id,
      revision: Number.isSafeInteger(entry.revision) && entry.revision > 0 ? entry.revision : 1,
      shareForMatching: entry.shareForMatching === true && value.matchingEnabled === true });
  }
  return { version: 1, householdId, profile: cleanProfile(value.profile), profileRevision: Number.isSafeInteger(value.profileRevision) && value.profileRevision >= 0 ? value.profileRevision : 0, approved,
    pending: [], matchingEnabled: value.matchingEnabled === true };
}
// Candidates are session-only. Older demo files may contain them; hydration ignores them too.
export function serializeSaved(state: SavedState): string { return JSON.stringify({ ...state, pending: [] }); }
export function reduceSaved(state: SavedState, action: SavedAction): SavedState {
  switch (action.type) {
    case 'suggest': return { ...state, pending: unique([...state.pending, ...action.ids.filter(id => INTERESTS.includes(id) && !state.approved.some(i => i.id === id))]) };
    case 'approve': return !state.pending.includes(action.id) ? state : { ...state,
      pending: state.pending.filter(id => id !== action.id), approved: [...state.approved, { id: action.id, revision: 1, shareForMatching: false }] };
    case 'reject': return { ...state, pending: state.pending.filter(id => id !== action.id) };
    case 'delete': return { ...state, pending: state.pending.filter(id => id !== action.id), approved: state.approved.filter(i => i.id !== action.id) };
    case 'edit': {
      if (!INTERESTS.includes(action.replacement) || !state.approved.some(i => i.id === action.id)) return state;
      if (state.approved.some(i => i.id === action.replacement && i.id !== action.id)) return state;
      const revision = Math.max(...state.approved.map(i => i.revision), 0) + 1;
      return { ...state, pending: state.pending.filter(id => id !== action.id && id !== action.replacement),
        approved: [...state.approved.filter(i => i.id !== action.id && i.id !== action.replacement), { id: action.replacement, revision, shareForMatching: false }] };
    }
    case 'profile': return { ...state, profile: cleanProfile(action.profile), profileRevision: (state.profileRevision ?? 0) + 1 };
    case 'matching': return { ...state, matchingEnabled: action.enabled,
      approved: action.enabled ? state.approved : state.approved.map(i => ({ ...i, shareForMatching: false })) };
    case 'share': return { ...state, approved: state.approved.map(i => i.id === action.id ? { ...i, shareForMatching: action.enabled && canShareInterest(state, i.id) } : i) };
    case 'clearPending': return { ...state, pending: [] };
    case 'reset': return { ...initialState(state.householdId), profileRevision: (state.profileRevision ?? 0) + 1 };
  }
}
