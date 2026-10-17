import { serializeSaved, type SavedState } from '../profile/model';
export const storageKey = (id: string) => `kakehashi-evercircle-${encodeURIComponent(id)}-v1`;
export async function readSaved(id: string): Promise<string | null> { return globalThis.localStorage.getItem(storageKey(id)); }
export async function writeSaved(state: SavedState): Promise<void> { globalThis.localStorage.setItem(storageKey(state.householdId), serializeSaved(state)); }
