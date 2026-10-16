export const ROOMS = ['living', 'bedroom', 'kitchen'] as const;
export type Room = typeof ROOMS[number];
export type DeviceKind = 'light' | 'fan' | 'curtains' | 'television';
export type Device = { id: string; room: Room; kind: DeviceKind };
export const DEVICES: readonly Device[] = [
  { id: 'living-light', room: 'living', kind: 'light' }, { id: 'living-fan', room: 'living', kind: 'fan' },
  { id: 'living-curtains', room: 'living', kind: 'curtains' }, { id: 'living-tv', room: 'living', kind: 'television' },
  { id: 'bedroom-light', room: 'bedroom', kind: 'light' }, { id: 'bedroom-fan', room: 'bedroom', kind: 'fan' },
  { id: 'bedroom-curtains', room: 'bedroom', kind: 'curtains' }, { id: 'kitchen-light', room: 'kitchen', kind: 'light' },
];
export type DeviceChange = { id: string; on: boolean };
export type Command = { kind: 'recognized'; change: DeviceChange } | { kind: 'ambiguous'; choices: DeviceChange[] }
  | { kind: 'unsupported' };
// Whole-input grammar: no substring execution, compound actions, inferred rooms or unrestricted language.
export function interpretCommand(input: string): Command {
  const text = input.normalize('NFKC').toLowerCase().trim().replace(/[.!。！]+$/, '').trim();
  const en = /^(?:please )?(turn on|switch on|turn off|switch off|open|close) (?:the )?(?:(living room|bedroom|kitchen) )?(light|lights|fan|fans|curtain|curtains|television|tv)(?: please)?$/.exec(text);
  const ja = /^(?:(リビング|寝室|台所|キッチン)の)?(照明|電気|扇風機|カーテン|テレビ)を(つけて|消して|開けて|閉めて)$/.exec(text);
  if (!en && !ja) return { kind: 'unsupported' };
  const roomNames: Record<string, Room> = { 'living room': 'living', bedroom: 'bedroom', kitchen: 'kitchen', リビング: 'living', 寝室: 'bedroom', 台所: 'kitchen', キッチン: 'kitchen' };
  const kinds: Record<string, DeviceKind> = { light: 'light', lights: 'light', fan: 'fan', fans: 'fan', curtain: 'curtains', curtains: 'curtains', television: 'television', tv: 'television', 照明: 'light', 電気: 'light', 扇風機: 'fan', カーテン: 'curtains', テレビ: 'television' };
  const action = en ? en[1] : ja![3], room = en ? en[2] : ja![1], device = kinds[en ? en[3] : ja![2]];
  const curtainAction = /^(open|close|開けて|閉めて)$/.test(action);
  if (curtainAction !== (device === 'curtains')) return { kind: 'unsupported' };
  const on = /^(turn on|switch on|open|つけて|開けて)$/.test(action);
  const choices = DEVICES.filter(d => d.kind === device && (!room || d.room === roomNames[room])).map(d => ({ id: d.id, on }));
  return choices.length === 1 ? { kind: 'recognized', change: choices[0] } : choices.length ? { kind: 'ambiguous', choices } : { kind: 'unsupported' };
}
export function isDeviceRequest(text: string) {
  return /\b(light|lights|fan|fans|curtains?|television|tv|device|thermostat)\b|照明|電気|扇風機|カーテン|テレビ|エアコン|デバイス/i.test(text);
}
export const ROUTINES: Record<'morning' | 'evening', readonly DeviceChange[]> = {
  morning: [{ id: 'living-light', on: true }, { id: 'living-curtains', on: true }, { id: 'living-fan', on: true }],
  evening: [{ id: 'bedroom-light', on: true }, { id: 'bedroom-curtains', on: false }, { id: 'living-tv', on: false }],
};
export function applyChanges(states: Record<string, boolean>, changes: readonly DeviceChange[]) {
  const next = { ...states };
  for (const change of changes) if (DEVICES.some(d => d.id === change.id) && typeof change.on === 'boolean') next[change.id] = change.on;
  return next;
}
