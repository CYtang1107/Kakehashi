import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { CallMood, Home, Letter } from '@kakehashi/shared';
import { Button, Card, Field, Pill, formatDate } from './ui';
import { useData } from './data';
import { useI18n } from './i18n';
import { api, letterUrl } from './api';
import { colors, fonts, type } from './theme';

const MOODS: CallMood[] = ['good', 'okay', 'low'];
const moodTone: Record<CallMood, { fg: string; bg: string }> = {
  good: { fg: colors.moss, bg: colors.mossTint },
  okay: { fg: colors.ai, bg: colors.aiTint },
  low: { fg: colors.kaki, bg: colors.kakiTint },
};

const monthLabel = (month: string, lang: 'en' | 'ja') => {
  const [y, m] = month.split('-').map(Number);
  return lang === 'ja' ? `${y}年${m}月` : new Date(y, m - 1, 15).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

function LetterStatus({ letter }: { letter: Letter }) {
  const { t, lang } = useI18n();
  const label = letter.status === 'mailed' ? t('letter_mailed', { date: formatDate(letter.mailedAt ?? '', lang) }) : t(`letter_${letter.status}`);
  return letter.status === 'mailed' ? <Pill label={label} color={colors.moss} bg={colors.mossTint} /> : <Pill label={label} />;
}

// 思い出だより: the printed monthly letter posted to her. Students prepare it; the family reads the same letter.
export function LetterCard({ mode }: { mode: 'family' | 'student' }) {
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  if (!data) return null;
  const { home } = data;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const current = home.letters.find((l) => l.month === thisMonth);
  const shown = mode === 'student' ? current : home.letters[0];

  const run = async (key: string, fn: () => Promise<unknown>, done?: string) => {
    setBusy(key);
    try { await fn(); await refresh(); if (done) showToast(done); } finally { setBusy(null); }
  };

  return (
    <Card>
      <Text style={type.section}>{t('letterTitle')}</Text>
      <Text style={type.caption}>{t('letterLead')}</Text>
      {mode === 'family' && home.letters.length > 0 ? home.letters.map((l) => (
        <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={type.bodyBold}>{t('letterMonth', { month: monthLabel(l.month, lang) })}</Text>
            <Text style={type.caption}>{t('letterItems', { n: l.itemIds.length })}</Text>
            <LetterStatus letter={l} />
          </View>
          <Button label={t('openLetter')} kind="secondary" icon="mail" onPress={() => WebBrowser.openBrowserAsync(letterUrl(l.id))} />
        </View>
      )) : null}
      {mode === 'student' ? (
        shown ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[type.bodyBold, { flex: 1 }]}>{t('letterMonth', { month: monthLabel(shown.month, lang) })} · {t('letterItems', { n: shown.itemIds.length })}</Text>
              <LetterStatus letter={shown} />
            </View>
            <Field label={t('letterNote')} multiline value={note ?? shown.note} onChangeText={setNote} />
            <Button label={t('saveNote')} kind="secondary" busy={busy === 'note'} disabled={note === null}
              onPress={() => run('note', () => api.prepareLetter(home.id, note ?? ''), t('saved')).then(() => setNote(null))} />
            <Button label={t('openLetter')} kind="secondary" icon="printer" onPress={() => WebBrowser.openBrowserAsync(letterUrl(shown.id))} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}><Button label={t('markPrinted')} kind="secondary" busy={busy === 'printed'} disabled={shown.status !== 'draft'}
                onPress={() => run('printed', () => api.letterStatus(shown.id, 'printed'))} /></View>
              <View style={{ flex: 1 }}><Button label={t('markMailed')} busy={busy === 'mailed'} disabled={shown.status === 'mailed'}
                onPress={() => run('mailed', () => api.letterStatus(shown.id, 'mailed'))} /></View>
            </View>
          </>
        ) : (
          <Button label={t('prepareLetter')} icon="mail" busy={busy === 'prepare'} onPress={() => run('prepare', () => api.prepareLetter(home.id))} />
        )
      ) : null}
    </Card>
  );
}

// A short phone call from her student between visits.
export function CallsCard({ mode }: { mode: 'family' | 'student' }) {
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<CallMood | undefined>();
  const [followUp, setFollowUp] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!data) return null;
  const { home } = data;
  const next = home.calls.find((c) => c.status === 'planned');
  const done = home.calls.filter((c) => c.status === 'done');
  const caller = next?.by ?? home.students[0].name;

  const log = async () => {
    setBusy(true);
    try {
      await api.logCall(home.id, { by: caller, mood, note: note.trim() || undefined, followUp });
      await refresh();
      setNote(''); setMood(undefined); setFollowUp(false);
      showToast(t('callLogged'));
    } finally { setBusy(false); }
  };

  return (
    <Card>
      <Text style={type.section}>{t('callsTitle')}</Text>
      <Text style={type.caption}>{t('callsLead', { name: caller })}</Text>
      {next ? <Text style={type.bodyBold}>{t('nextCall', { date: formatDate(next.date, lang) })}</Text> : null}
      {mode === 'student' ? (
        <>
          <Field label={t('callNote')} multiline value={note} onChangeText={setNote} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MOODS.map((m) => {
              const on = mood === m;
              return (
                <Pressable key={m} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => setMood(m)}
                  style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: on ? moodTone[m].fg : colors.line, backgroundColor: on ? moodTone[m].bg : colors.sheet }}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: on ? moodTone[m].fg : colors.ink }}>{t(`mood_${m}`)}</Text>
                </Pressable>
              );
            })}
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: followUp }} onPress={() => setFollowUp((f) => !f)}
              style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: followUp ? colors.kaki : colors.line, backgroundColor: followUp ? colors.kakiTint : colors.sheet }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: followUp ? colors.kaki : colors.ink }}>{t('followUp')}</Text>
            </Pressable>
          </View>
          <Button label={t('logCall')} icon="phone" busy={busy} disabled={!mood} onPress={log} />
        </>
      ) : null}
      {done.map((c) => (
        <View key={c.id} style={{ gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={type.bodyBold}>{formatDate(c.date, lang)} · {c.by}{c.minutes ? ` · ${t('minutes', { n: c.minutes })}` : ''}</Text>
            {c.mood ? <Pill label={t(`mood_${c.mood}`)} color={moodTone[c.mood].fg} bg={moodTone[c.mood].bg} /> : null}
            {c.followUp ? <Pill label={t('followUp')} color={colors.kaki} bg={colors.kakiTint} /> : null}
          </View>
          {c.note ? <Text style={type.body}>{c.note}</Text> : null}
        </View>
      ))}
      {mode === 'family' ? <Text style={type.caption}>{t('callsPrivacy')}</Text> : null}
    </Card>
  );
}

export type { Home };
