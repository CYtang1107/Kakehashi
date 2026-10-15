import { File, Paths } from 'expo-file-system';
import { serializeSaved, type SavedState } from '../profile/model';
const file = (id: string) => new File(Paths.document, `evercircle-${encodeURIComponent(id)}-v1.json`);
export async function readSaved(id: string): Promise<string | null> {
  const target = file(id); return target.exists ? await target.text() : null;
}
export async function writeSaved(state: SavedState): Promise<void> { file(state.householdId).write(serializeSaved(state)); }
