import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { pick, type CheckResult, type FieldNoteKind } from '@kakehashi/shared';
import { Button, Card, Field, Pill, formatDate } from './ui';
import { useData } from './data';
import { useI18n } from './i18n';
import { api } from './api';
import { colors, fonts, type } from './theme';

const KINDS: FieldNoteKind[] = ['likes', 'avoid', 'tip'];
const kindTone: Record<FieldNoteKind, { fg: string; bg: string }> = {
  likes: { fg: colors.moss, bg: colors.mossTint },
  avoid: { fg: colors.kaki, bg: colors.kakiTint },
  tip: { fg: colors.ai, bg: colors.aiTint },
};

// Field notes: what earlier pairs learned, so a new student (or a trainee taking over) starts where they left off.
export function FieldNotesCard() {
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [kind, setKind] = useState<FieldNoteKind>('likes');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  if (!data) return null;
  const { home } = data;
  const author = home.students.find((s) => s.role === 'pair')?.name ?? 'Student';

  const add = async () => {
    setBusy(true);
    try { await api.addFieldNote(home.id, kind, text.trim(), author); await refresh(); setText(''); showToast(t('saved')); } finally { setBusy(false); }
  };

  return (
    <Card>
      <Text style={type.section}>{t('fieldNotesTitle')}</Text>
      <Text style={type.caption}>{t('fieldNotesLead')}</Text>
      {home.fieldNotes.map((n) => (
        <View key={n.id} style={{ gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pill label={t(`note_${n.kind}`)} color={kindTone[n.kind].fg} bg={kindTone[n.kind].bg} />
            <Text style={type.caption}>{n.by} · {formatDate(n.date, lang)}</Text>
          </View>
          <Text style={type.body}>{pick(lang, n.text, n.textJa)}</Text>
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: 8, paddingTop: 8 }}>
        {KINDS.map((k) => (
          <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: kind === k }} onPress={() => setKind(k)}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: kind === k ? kindTone[k].fg : colors.line, backgroundColor: kind === k ? kindTone[k].bg : colors.sheet }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: kind === k ? kindTone[k].fg : colors.ink }}>{t(`note_${k}`)}</Text>
          </Pressable>
        ))}
      </View>
      <Field label={t('addNote')} value={text} onChangeText={setText} placeholder={t('notePlaceholder')} />
      <Button label={t('addNote')} kind="secondary" icon="plus" busy={busy} disabled={!text.trim()} onPress={add} />
    </Card>
  );
}

// Today's report: it reaches the family only after the fresh-eyes check finds no pushy wording.
export function ReportCard() {
  const { data, refresh, showToast } = useData();
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [checkedText, setCheckedText] = useState('');
  const [busy, setBusy] = useState<'check' | 'send' | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!data) return null;

  const check = async () => {
    setBusy('check'); setError(null);
    try { const r = await api.checkReport(text.trim()); setResult(r); setCheckedText(text.trim()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Check failed.'); }
    finally { setBusy(null); }
  };

  const send = async () => {
    setBusy('send'); setError(null);
    try { await api.sendReport(data.home.id, text.trim()); await refresh(); setText(''); setResult(null); showToast(t('reportSent')); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not send.'); }
    finally { setBusy(null); }
  };

  const upToDate = result !== null && checkedText === text.trim();
  const sourceName = result?.source === 'claude' ? t('sourceClaude') : t('sourceOffline');

  return (
    <Card>
      <Text style={type.section}>{t('reportTitle')}</Text>
      <Text style={type.caption}>{t('reportLead')}</Text>
      <Field label={t('reportTitle')} multiline value={text} onChangeText={setText} placeholder={t('reportPlaceholder')} />
      <Button label={t('checkWording')} kind="secondary" icon="eye" busy={busy === 'check'} disabled={!text.trim()} onPress={check} />
      {upToDate && result ? (
        result.ok ? (
          <Text style={[type.bodyBold, { color: colors.moss }]}>{t('looksKind')} · <Text style={type.caption}>{t('checkedBy', { source: sourceName })}</Text></Text>
        ) : (
          <View style={{ gap: 8 }}>
            <Text style={type.caption}>{t('checkedBy', { source: sourceName })}</Text>
            {result.flags.map((f, i) => (
              <View key={`${f.phrase}-${i}`} style={{ gap: 4, padding: 10, borderRadius: 12, backgroundColor: colors.kakiTint }}>
                <Text style={[type.bodyBold, { color: colors.kaki }]}>“{f.phrase}”</Text>
                <Text style={type.body}>{f.reason}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Text style={[type.caption, { flex: 1 }]}>{t('tryInstead', { suggestion: f.suggestion })}</Text>
                  {/* Only the AI reviewer's rewrites fit the sentence; word-list hints are guidance for the student to reword. */}
                  {result.source === 'claude'
                    ? <Button label={t('useSuggestion')} kind="secondary" onPress={() => setText((cur) => cur.replace(f.phrase, f.suggestion))} />
                    : null}
                </View>
              </View>
            ))}
          </View>
        )
      ) : null}
      <Button label={t('sendReport')} icon="send" busy={busy === 'send'} disabled={!upToDate || !result?.ok} onPress={send} />
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
    </Card>
  );
}
