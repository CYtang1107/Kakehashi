import { DEVICES, applyChanges, type DeviceChange } from '../smartHome/model';
import { makeReminder, type Reminder } from '../assistance/model';
import { canPerformDeviceAction } from '../privacy/permissions';
export type Activity = { id: string; at: string; changes: DeviceChange[] };
export type DemoState = { version: 1; householdId: string; devices: Record<string, boolean>; reminders: Reminder[]; activity: Activity[] };
export function initialDemo(householdId: string): DemoState {
  return { version: 1, householdId, devices: Object.fromEntries(DEVICES.map(d => [d.id, false])), reminders: [], activity: [] };
}
export type DemoAction = { type: 'devices'; changes: readonly DeviceChange[]; at: string; id: string }
  | { type: 'add'; reminder: Reminder } | { type: 'complete'; id: string; completed: boolean };
export function reduceDemo(state: DemoState, action: DemoAction): DemoState {
  if (action.type === 'devices') {
    if (!canPerformDeviceAction(state.householdId,state.householdId,action.changes,state.devices)) return state;
    const changes = action.changes.filter(c => DEVICES.some(d => d.id === c.id) && typeof c.on === 'boolean' && state.devices[c.id] !== c.on);
    if (!changes.length) return state;
    return { ...state, devices: applyChanges(state.devices, changes), activity: [{ id: action.id, at: action.at, changes }, ...state.activity].slice(0, 20) };
  }
  if (action.type === 'add') {
    const r = action.reminder;
    const checked = makeReminder(r.title, r.date, r.time, r.kind, r.id);
    return !checked || state.reminders.length >= 100 || state.reminders.some(item => item.id === r.id) ? state : { ...state, reminders: [...state.reminders, checked] };
  }
  return { ...state, reminders: state.reminders.map(r => r.id === action.id ? { ...r, completed: action.completed } : r) };
}
export function parseDemo(raw: string | null, householdId: string): DemoState {
  if (raw === null) return initialDemo(householdId);
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || value.householdId !== householdId || !value.devices || !Array.isArray(value.reminders) || value.reminders.length > 100 || !Array.isArray(value.activity)) throw new Error('Invalid demo');
  const state = initialDemo(householdId);
  for (const d of DEVICES) {
    if (typeof value.devices[d.id] !== 'boolean') throw new Error('Invalid device');
    state.devices[d.id] = value.devices[d.id];
  }
  const ids = new Set<string>();
  state.reminders = value.reminders.map((r: Reminder) => {
    if (!r || typeof r.id !== 'string' || r.id.length > 100 || ids.has(r.id) || typeof r.title !== 'string' || typeof r.completed !== 'boolean' || !['reminder', 'activity'].includes(r.kind)) throw new Error('Invalid reminder');
    const parsed = makeReminder(r.title, r.date, r.time, r.kind, r.id);
    if (!parsed) throw new Error('Invalid reminder'); ids.add(r.id);
    return { ...parsed, completed: r.completed };
  });
  // Logs are bounded and allowlisted; commands and speech transcripts are never stored.
  state.activity = value.activity.slice(0, 20).map((a: Activity) => {
    if (!a || typeof a.id !== 'string' || typeof a.at !== 'string' || Number.isNaN(Date.parse(a.at)) || !Array.isArray(a.changes) || a.changes.length > DEVICES.length) throw new Error('Invalid log');
    return { id: a.id.slice(0, 100), at: a.at, changes: a.changes.map(c => {
      if (!c || !DEVICES.some(d => d.id === c.id) || typeof c.on !== 'boolean') throw new Error('Invalid log device');
      return { id: c.id, on: c.on };
    }) };
  });
  return state;
}
