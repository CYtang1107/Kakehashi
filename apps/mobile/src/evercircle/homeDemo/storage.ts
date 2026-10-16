import { File, Paths } from 'expo-file-system';
import type { DemoState } from './model';
const file = (id: string) => new File(Paths.document, `home-demo-${encodeURIComponent(id)}-v1.json`);
export async function readDemo(id: string): Promise<string | null> { const target = file(id); return target.exists ? await target.text() : null; }
export async function writeDemo(state: DemoState) { file(state.householdId).write(JSON.stringify(state)); }
