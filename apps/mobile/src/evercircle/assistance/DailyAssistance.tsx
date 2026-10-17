import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { pick } from '@kakehashi/shared';
import { AppText, Button, Card, ConfirmationDialog, Field, Fold, StatusBanner } from '../../ui';
import { useData } from '../../data';
import { useI18n } from '../../i18n';
import { householdDay, planDate } from '../../her/plans';
import { useHomeDemo } from '../homeDemo/store';
import { useHomeCopy } from '../homeDemo/copy';
import { DemoStatus } from '../homeDemo/DemoStatus';
import { makeReminder, upcomingVisits, type Reminder } from './model';
export function VisitReminder() {
  const { data } = useData(), { lang, c } = useHomeCopy();
  const next = upcomingVisits(data?.home, householdDay())[0];
  return <View style={{ gap: 8 }}><AppText variant="section">{c('upcoming')}</AppText>
    {next ? <Card><AppText variant="bodyBold">{c('visitReminder')}</AppText><AppText>{planDate(next.date, lang)}</AppText>
      <AppText>{data?.home.students.filter(s => s.role === 'pair').map(s => s.name).join(' · ')}</AppText>
    </Card> : <AppText>{c('noVisit')}</AppText>}
  </View>;
}
function ReminderEntry({ item, onUpdate }: { item: Reminder; onUpdate: (message: string) => void }) {
  const store = useHomeDemo(), { c, lang } = useHomeCopy();
  const day = householdDay();
  const now = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
  const overdue = item.date < day || (item.date === day && item.time < now);
  return <Card>
    <AppText variant="caption">{planDate(item.date, lang)} · {item.time} · {c(item.kind)}</AppText>
    <AppText variant="section">{item.title}</AppText>
    <AppText>{c(item.completed ? 'done' : overdue ? 'overdue' : item.date > day ? 'scheduled' : 'pending')}</AppText>
    <Button label={c(item.completed ? 'undo' : 'complete')} accessibilityLabel={`${c(item.completed ? 'undo' : 'complete')} · ${item.title}`} kind="secondary" disabled={!store.enabled}
      onPress={() => { if (store.change({ type: 'complete', id: item.id, completed: !item.completed })) onUpdate(`${item.title} · ${c(item.completed ? 'undoFeedback' : 'doneFeedback')}`); }} />
  </Card>;
}
export function DailyAssistance() {
  const store = useHomeDemo(), { c, lang } = useHomeCopy(), { data } = useData(), { t } = useI18n();
  const [title, setTitle] = useState(''), [date, setDate] = useState(householdDay), [time, setTime] = useState('09:30');
  const [kind, setKind] = useState<Reminder['kind']>('reminder'), [formOpen, setFormOpen] = useState(false);
  const [feedback, setFeedback] = useState(''), [invalid, setInvalid] = useState(false), [familyOpen, setFamilyOpen] = useState(false);
  const sorted = [...store.state.reminders].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const pending = sorted.filter(r => !r.completed), completed = sorted.filter(r => r.completed);
  const add = () => {
    const reminder = makeReminder(title, date, time, kind, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
    if (!reminder) { setInvalid(true); setFeedback(c('invalid')); return; }
    if (store.state.reminders.length >= 100) { setInvalid(true); setFeedback(c('limit')); return; }
    if (store.change({ type: 'add', reminder })) { setInvalid(false); setFeedback(c('added')); setTitle(''); setFormOpen(false); }
  };
  return <View style={{ gap: 24 }}>
    <View style={{ gap: 16 }}><AppText variant="section">{t('hMyReminders')}</AppText><AppText variant="caption">{c('localNote')}</AppText>
      <DemoStatus />
      {feedback && !formOpen ? <StatusBanner title={feedback} tone={invalid ? 'error' : 'info'} /> : null}
      {!['loading', 'loadError'].includes(store.status) ? <>
        {pending.length ? pending.map(item => <ReminderEntry key={item.id} item={item} onUpdate={message => { setInvalid(false); setFeedback(message); }} />) : <AppText>{c('noReminders')}</AppText>}
        <Button label={c('addReminder')} icon="plus" disabled={!store.enabled} onPress={() => { setFeedback(''); setInvalid(false); setFormOpen(true); }} />
      </> : null}
      <Fold title={c('suggestions')} icon="sun"><AppText>{c('suggestion')}</AppText>
        <Button label={c('schedule')} kind="secondary" disabled={!store.enabled} onPress={() => { setKind('activity'); setTitle(c('quiet')); setDate(householdDay()); setTime('15:00'); setFormOpen(true); setFeedback(''); }} />
      </Fold>
      <ConfirmationDialog visible={formOpen} title={c('addReminder')} message={c('localNote')} cancelLabel={c('cancel')}
        onCancel={() => { setFormOpen(false); setFeedback(''); }}>
        <DemoStatus />
        {feedback ? <StatusBanner title={feedback} tone={invalid ? 'error' : 'info'} /> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><Button label={c('reminder')} selected={kind === 'reminder'} kind="secondary" onPress={() => setKind('reminder')} /><Button label={c('activity')} selected={kind === 'activity'} kind="secondary" onPress={() => setKind('activity')} /></View>
        <Field label={c('titleLabel')} value={title} onChangeText={setTitle} maxLength={120} />
        <Field label={c('date')} value={date} onChangeText={setDate} maxLength={10} />
        <Field label={c('time')} value={time} onChangeText={setTime} maxLength={5} />
        <Button label={c('add')} disabled={!store.enabled} onPress={add} />
      </ConfirmationDialog>
    </View>
    <Fold title={t('hReminderHistory')} icon="check-circle">{completed.length ? completed.map(item => <ReminderEntry key={item.id} item={item} onUpdate={message => { setInvalid(false); setFeedback(message); }} />) : <AppText>{c('noCompleted')}</AppText>}</Fold>
    <Fold title={c('contacts')} icon="users"><AppText>{c('contactNote')}</AppText>
      {data?.home.childName ? <><Button label={`${c('family')} · ${pick(lang, data.home.childName, data.home.childNameJa)}`} kind="secondary" onPress={() => setFamilyOpen(value => !value)} />
        {familyOpen ? <AppText>{pick(lang, data.home.childName, data.home.childNameJa)} · {c('noContact')}</AppText> : null}</> : null}
      <Button label={c('students')} kind="secondary" onPress={() => router.push('/her/friends')} />
      <Button label={t('hHelpers')} kind="secondary" onPress={() => router.push('/her/helpers')} />
    </Fold>
  </View>;
}
