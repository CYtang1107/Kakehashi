import type { InterestId, SavedState } from '../profile/model';

export function canMatchInterest(state: SavedState, id: InterestId, storageHealthy = true): boolean {
  return storageHealthy && state.matchingEnabled && state.approved.some(i => i.id === id && i.shareForMatching);
}
// Always derive at use time. No cached matching payload survives edit, revocation or deletion.
// Intentionally excludes display name, profile free text, location, household records and chat.
export function matchingSummary(state: SavedState, storageHealthy = true) {
  return { householdId: state.householdId, interests: state.approved.filter(i => canMatchInterest(state, i.id, storageHealthy)).map(i => i.id) };
}
