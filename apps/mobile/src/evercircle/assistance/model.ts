import type { Home } from '@kakehashi/shared';
export type Reminder = { id: string; title: string; date: string; time: string; completed: boolean; kind: 'reminder' | 'activity' };
export const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
export const validTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export function makeReminder(title: string, date: string, time: string, kind: Reminder['kind'], id: string): Reminder | null {
  if (!title.trim() || title.trim().length > 120 || !validDate(date) || !validTime(time)) return null;
  return { id, title: title.trim(), date, time, kind, completed: false };
}
// Projection only: existing visit IDs/dates stay in HomeBundle. Nothing is copied into demo storage.
export function upcomingVisits(home: Home | undefined, day: string) {
  return home?.visits.filter(v => v.status === 'planned' && v.date.slice(0, 10) >= day).sort((a, b) => a.date.localeCompare(b.date)) ?? [];
}
export function dailySummary(reminders: Reminder[], day: string) {
  return reminders.filter(r => r.date === day && !r.completed).sort((a, b) => a.time.localeCompare(b.time));
}
