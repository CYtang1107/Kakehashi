import { useData } from '../../data';
import { useI18n } from '../../i18n';
import { householdDay, plans, planDate } from '../../her/plans';
import { useHomeDemo } from '../homeDemo/store';
import { homeCopy, changeLabel } from '../homeDemo/copy';
import { isDeviceRequest } from '../smartHome/model';
import { dailySummary } from './model';
import type { Reply } from '../companion/engine';
// The chat delegates here; device interpretation and mutations live in the shared home modules.
export function useDailyCompanion() {
  const store = useHomeDemo(), { data, error } = useData(), { lang, t } = useI18n();
  return (input: string): (Reply & { performed?: boolean }) | undefined => {
    const reply = (intent: Reply['intent'], text: string, actions: Reply['actions']): Reply => ({ intent, key: 'cDeviceReply', text, actions, candidates: [] });
    const c = (key: Parameters<typeof homeCopy>[1]) => homeCopy(lang, key);
    if (isDeviceRequest(input)) {
      if (!store.enabled) return reply('devices', c(store.status === 'error' ? 'saveError' : store.status === 'loading' ? 'loading' : 'loadError'), ['smart']);
      const { result, applied } = store.execute(input);
      return { ...reply('devices', result.kind === 'recognized' && applied ? `${c('simulated')} ${changeLabel(result.change, lang)}` : result.kind === 'ambiguous' ? c('ambiguous') : `${t('cDeviceReply')} ${c('unsupported')}`, ['smart']), performed: applied };
    }
    if (/\b(today|schedule|planned|visits?|students?)\b|今日|予定|訪問|学生/i.test(input) && !/how are you|元気/i.test(input)) {
      const day = householdDay(), local = dailySummary(store.state.reminders, day);
      const recorded = data ? plans(data.home, lang, t) : [];
      const today = recorded.filter(p => p.date.slice(0, 10) === day);
      const next = recorded.find(p => p.kind === 'visit' && p.date.slice(0, 10) > day);
      const lines = today.map(p => `${planDate(p.date, lang)} · ${p.title}${p.detail ? ` · ${p.detail}` : ''}`);
      if (store.enabled) lines.push(...local.map(r => `${r.time} · ${r.title}`));
      const summary = [`${c('summary')} · ${planDate(day, lang)}`, ...lines];
      if (!data || error) summary.push(t('cVisitUnknown'));
      if (!store.enabled) summary.push(c(store.status === 'error' ? 'saveError' : store.status === 'loading' ? 'loading' : 'loadError'));
      if (data && store.enabled && !lines.length) summary.push(c('noToday'));
      if (next) summary.push(`${c('upcoming')}: ${planDate(next.date, lang)} · ${next.detail}`);
      return reply('visits', summary.join('\n'), ['day']);
    }
    if (/\b(remind|reminder|alarm)\b|リマインダー|思い出させ|通知/i.test(input)) return reply('reminders', t('cReminderReply'), ['day']);
    return undefined;
  };
}
