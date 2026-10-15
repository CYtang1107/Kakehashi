import { AppText as Text } from './design-system/AppText';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CONDITION_PARTS, HOUSE_STEPS, HOUSE_WISHES, emptyHouseCost, pick, type ConditionLevel, type HouseWish } from '@kakehashi/shared';
import { StatusBanner, Button, Card, Field, Pill, formatDate } from './ui';
import { useData } from './data';
import { useI18n, type Key } from './i18n';
import { api } from './api';
import { colors, fonts, type, yen } from './theme';

const levelTone: Record<ConditionLevel, { fg: string; bg: string }> = {
  ok: { fg: colors.moss, bg: colors.mossTint },
  watch: { fg: colors.kaki, bg: colors.kakiTint },
  repair: { fg: colors.danger, bg: '#F6DEDC' },
};
const LEVELS: ConditionLevel[] = ['ok', 'watch', 'repair'];

// The house's future (家のこれから), for Japan's empty-home problem (空き家).
// Students write down her wish in her words; the family adds notes (not votes), sees what an empty house
// would cost, and does the paperwork early. Nothing here lists or sells the house.
export function HouseFutureCard({ mode }: { mode: 'family' | 'student' }) {
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [wish, setWish] = useState<HouseWish | null>(null);
  const [words, setWords] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!data) return null;
  const { home } = data;
  const f = home.future;
  const cost = emptyHouseCost(f.emptyCost);
  const student = home.students.find((s) => s.role === 'pair')?.name ?? 'Student';
  const chosen = wish ?? f.wish;

  const run = async (key: string, fn: () => Promise<unknown>, done?: string) => {
    setBusy(key); setError(null);
    try { await fn(); await refresh(); if (done) showToast(done); return true; }
    catch (e) { setError(t('rSaveError')); return false; }
    finally { setBusy(null); }
  };

  return (
    <Card>
      <Text style={type.section}>{t('futureTitle')}</Text>
      <Text style={type.caption}>{mode === 'student' ? t('futureLeadStudent') : t('futureLeadFamily')}</Text>

      {/* Her wish */}
      <View style={{ gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
        <Text style={type.eyebrow}>{t('herWishHouse')}</Text>
        {mode === 'student' ? (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {HOUSE_WISHES.map((w) => <Chip key={w} label={t(`hwish_${w}` as Key)} on={chosen === w} onPress={() => setWish(w)} />)}
            </View>
            <Field label={t('herWordsField')} value={words} onChangeText={setWords} multiline style={{ minHeight: 70 }} />
            <Button label={t('saveWish')} icon="check" busy={busy === 'wish'} disabled={wish === null && !words.trim()}
              onPress={() => run('wish', () => api.houseWish(home.id, chosen, words, student), t('saved')).then((ok) => { if (ok) { setWish(null); setWords(''); } })} />
          </>
        ) : (
          <Text style={[type.bodyBold, { fontSize: 17 }]}>{t(`hwish_${f.wish}` as Key)}</Text>
        )}
        {f.words ? (
          <View style={{ gap: 4 }}>
            <Text style={[type.story, { paddingLeft: 12 }]}>“{pick(lang, f.words, f.wordsJa)}”</Text>
            {f.recordedBy && f.recordedAt ? <Text style={type.caption}>{t('inHerWords', { by: f.recordedBy, date: formatDate(f.recordedAt, lang) })}</Text> : null}
          </View>
        ) : null}
        <Text style={type.caption}>{t(`hwishHelp_${chosen}` as Key)}</Text>
      </View>

      {/* Family notes: wishes, not votes */}
      {mode === 'family' ? (
        <View style={{ gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
          <Text style={type.eyebrow}>{t('familyNotesTitle')}</Text>
          {f.familyNotes.map((n, i) => (
            <Text key={i} style={type.body}><Text style={type.bodyBold}>{n.by}: </Text>{pick(lang, n.note, n.noteJa)}</Text>
          ))}
          <Field label={t('familyNotePlaceholder')} value={note} onChangeText={setNote} />
          <Button label={t('addFamilyNote')} kind="secondary" icon="plus" busy={busy === 'note'} disabled={!note.trim()}
            onPress={() => run('note', () => api.houseNote(home.id, note, home.childName), t('saved')).then((ok) => { if (ok) setNote(''); })} />
        </View>
      ) : null}

      {/* Condition, noted by students on visits */}
      <View style={{ gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
        <Text style={type.eyebrow}>{t('conditionTitle')}</Text>
        {CONDITION_PARTS.map((part) => {
          const c = f.condition[part];
          return (
            <View key={part} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8,  }}>
                <Text style={[type.body, { flex: 1, minWidth: 120 }]}>{t(`part_${part}` as Key)}</Text>
                {mode === 'student'
                  ? LEVELS.map((l) => <Chip key={l} small label={t(`level_${l}` as Key)} on={c?.level === l} tone={levelTone[l]}
                      onPress={() => run(`${part}-${l}`, () => api.houseCondition(home.id, part, l))} />)
                  : c ? <Pill label={t(`level_${c.level}` as Key)} color={levelTone[c.level].fg} bg={levelTone[c.level].bg} />
                    : <Pill label={t('notChecked')} color={colors.inkSoft} bg={colors.paper} />}
              </View>
              {c?.note ? <Text style={type.caption}>{pick(lang, c.note, c.noteJa)}</Text> : null}
            </View>
          );
        })}
        <Text style={type.caption}>{t('conditionWhy')}</Text>
      </View>

      {/* What an empty house costs, and the steps the family can take now */}
      {mode === 'family' ? (
        <>
          <View style={{ gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
            <Text style={type.eyebrow}>{t('emptyTitle')}</Text>
            <Row label={t('emptyYearly')} value={yen(cost.yearly)} />
            <Row label={t('emptyTen')} value={yen(cost.tenYears)} strong />
            <Row label={t('emptyDesignated')} value={`+ ${yen(cost.ifDesignated)}`} color={colors.danger} />
            <Text style={type.caption}>{t('emptyNote')}</Text>
          </View>
          <View style={{ gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
            <Text style={type.eyebrow}>{t('stepsTitle')}</Text>
            {HOUSE_STEPS.map((s) => {
              const done = f.steps[s];
              return (
                <Pressable key={s} accessibilityRole="checkbox" accessibilityState={{ checked: Boolean(done) }} disabled={busy === s}
                  onPress={() => run(s, () => api.houseStep(home.id, s, !done))} style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center',  flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'flex-start' }}>
                  <Feather name={done ? 'check-square' : 'square'} size={20} color={done ? colors.moss : colors.inkSoft} />
                  <View style={{ flex: 1 }}>
                    <Text style={[type.body, done ? { color: colors.inkSoft } : null]}>{t(`step_${s}` as Key)}</Text>
                    {done ? <Text style={type.caption}>{formatDate(done, lang)}</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
      {error ? <StatusBanner tone="error" title={error} /> : null}
    </Card>
  );
}

function Chip({ label, on, onPress, small, tone }: { label: string; on: boolean; onPress: () => void; small?: boolean; tone?: { fg: string; bg: string } }) {
  const fg = tone?.fg ?? colors.ai, bg = tone?.bg ?? colors.aiTint;
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={onPress}
      style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center',  paddingHorizontal: small ? 10 : 12, paddingVertical: small ? 5 : 8, borderRadius: 99, borderWidth: 1, borderColor: on ? fg : colors.line, backgroundColor: on ? bg : colors.sheet }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: small ? 12 : 13, color: on ? fg : colors.ink }}>{label}</Text>
    </Pressable>
  );
}

function Row({ label, value, strong, color }: { label: string; value: string; strong?: boolean; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      <Text style={[strong ? type.bodyBold : type.body, { flex: 1 }]}>{label}</Text>
      <Text style={[strong ? type.section : type.body, { color: color ?? colors.ink, fontVariant: ['tabular-nums'] }]}>{value}</Text>
    </View>
  );
}
