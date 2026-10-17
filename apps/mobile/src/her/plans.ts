import type { Home } from '@kakehashi/shared';
import type { Key, Lang } from '../i18n';
import { pick } from '@kakehashi/shared';
import { formatDate } from '../ui';
import { workerName } from '../Services';

// A projection of HomeBundle, never another appointment store. Dates use the household's zone.
export const householdDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const planDate = (date: string, lang: Lang) => `${formatDate(date.slice(0, 10), lang)}${date.length > 10 ? ` · ${date.slice(11, 16)}` : ''}`;
export function plans(home: Home, lang: Lang, t: (key: Key, args?: Record<string, string | number>) => string) {
  return [
    ...home.visits.filter(v => v.status === 'planned').map(v => ({ id: `visit-${v.id}`, date: v.date, title: t('hVisit'), detail: home.students.filter(s => s.role === 'pair').map(s => s.name).join(' · '), kind: 'visit' })),
    ...home.activities.filter(a => a.status === 'accepted').map(a => ({ id: `activity-${a.id}`, date: a.date, title: pick(lang, a.title, a.titleJa), detail: [pick(lang, a.place, a.placeJa), a.companion].filter(Boolean).join(' · '), kind: 'activity' })),
    ...home.calls.filter(c => c.status === 'planned').map(c => ({ id: `call-${c.id}`, date: c.date, title: t('hCall', { name: c.by }), detail: pick(lang, c.note ?? '', c.noteJa), kind: 'call' })),
    ...home.services.filter(s => s.status === 'booked' && s.date).map(s => ({ id: `helper-${s.id}`, date: s.date!, title: t(`svc_${s.kind}` as Key), detail: workerName(home.workers.find(w => w.id === s.workerId), lang), kind: 'helper' })),
  ].sort((a, b) => a.date.localeCompare(b.date));
}
