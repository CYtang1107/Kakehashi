import { AppText as Text } from './design-system/AppText';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { FIX_CATALOG, FIX_KINDS, fixCost, pick, safetyEstimate, type FixKind, type FixStatus, type SafetyFix } from '@kakehashi/shared';
import { Button, Card, Field, Pill } from './ui';
import { useData } from './data';
import { useI18n, type Key } from './i18n';
import { api } from './api';
import { colors, fonts, type, yen } from './theme';

export const fixTone: Record<FixStatus, { fg: string; bg: string }> = {
  suggested: { fg: colors.kaki, bg: colors.kakiTint },
  agreed: { fg: colors.ai, bg: colors.aiTint },
  'not-now': { fg: colors.inkSoft, bg: colors.paper },
  done: { fg: colors.moss, bg: colors.mossTint },
};

const statusKey = (s: FixStatus) => `fixstatus_${s}` as Key;

function amountLabel(f: Pick<SafetyFix, 'kind' | 'amount'>, lang: 'en' | 'ja') {
  const u = FIX_CATALOG[f.kind].unit;
  if (u === 'm') return `${f.amount} m`;
  if (u === 'm2') return lang === 'ja' ? `${f.amount}㎡` : `${f.amount} m²`;
  return lang === 'ja' ? `${f.amount}か所` : `× ${f.amount}`;
}

// Safer home plan (安心リフォーム): students note small fixes with her; she decides; the family sees the cost
// and an estimate of the care-insurance home-modification subsidy.
export function SaferHomeCard({ mode, roomId }: { mode: 'family' | 'student' | 'her'; roomId?: string }) {
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [kind, setKind] = useState<FixKind>('handrail');
  const [amount, setAmount] = useState('1');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!data) return null;
  const { home } = data;
  const est = safetyEstimate(home.safety);
  const roomName = (id: string) => {
    const r = home.rooms.find((x) => x.id === id);
    return r ? (lang === 'ja' ? r.nameJa : r.name) : '';
  };

  const run = async (key: string, fn: () => Promise<unknown>, done?: string) => {
    setBusy(key); setError(null);
    try { await fn(); await refresh(); if (done) showToast(done); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save.'); }
    finally { setBusy(null); }
  };

  const add = () => run('add', () => api.addFix(home.id, { roomId: roomId ?? home.rooms[0].id, kind, amount: Number(amount), note: note.trim() || undefined }), t('saved'))
    .then(() => { setNote(''); setAmount('1'); });

  return (
    <Card>
      <Text style={type.section}>{t('saferTitle')}</Text>
      <Text style={type.caption}>{t(mode === 'student' ? 'saferLeadStudent' : mode === 'her' ? 'hSafetyBody' : 'saferLeadFamily')}</Text>

      {home.safety.map((f) => (
        <View key={f.id} style={{ gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={[type.bodyBold, { flex: 1 }]}>{t(`fix_${f.kind}`)} · {roomName(f.roomId)} · {amountLabel(f, lang)}</Text>
            <Text style={[type.bodyBold, { fontVariant: ['tabular-nums'] }]}>{yen(fixCost(f))}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <Pill label={t(statusKey(f.status))} color={fixTone[f.status].fg} bg={fixTone[f.status].bg} />
            <Pill label={FIX_CATALOG[f.kind].eligible ? t('eligibleTag') : t('notEligibleTag')} color={colors.inkSoft} bg={colors.paper} />
          </View>
          {f.note ? <Text style={type.caption}>{pick(lang, f.note, f.noteJa)}</Text> : null}
          {mode === 'student' ? (
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {f.status === 'suggested' || f.status === 'not-now'
                ? <Button label={t('agree')} kind="secondary" busy={busy === f.id} onPress={() => run(f.id, () => api.fixStatus(home.id, f.id, 'agreed'))} /> : null}
              {f.status === 'suggested'
                ? <Button label={t('fixstatus_not-now')} kind="secondary" onPress={() => run(f.id, () => api.fixStatus(home.id, f.id, 'not-now'))} /> : null}
              {f.status === 'agreed'
                ? <Button label={t('markDone')} kind="secondary" busy={busy === f.id} onPress={() => run(f.id, () => api.fixStatus(home.id, f.id, 'done'))} /> : null}
              {f.status === 'agreed' && !home.services.some((s) => s.fixId === f.id && s.status !== 'cancelled')
                ? <Button label={t('bookBuilder')} kind="secondary" icon="tool" busy={busy === `b-${f.id}`}
                    onPress={() => run(`b-${f.id}`, () => api.askHelp(home.id, { kind: 'builder', when: 'soon', by: 'student', fixId: f.id }), t('builderAsked'))} /> : null}
            </View>
          ) : null}
        </View>
      ))}

      <View style={{ gap: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line }}>
        <Row label={t('estTotal')} value={yen(est.total)} />
        <Row label={t('estCovered')} value={`− ${yen(est.covered)}`} color={colors.moss} />
        <Row label={t('estFamily')} value={yen(est.familyPays)} strong />
        {est.suggested > 0 ? <Row label={t('estSuggested')} value={yen(est.suggested)} quiet /> : null}
        <Text style={type.caption}>{t('subsidyNote')}</Text>
        <Text style={type.caption}>{t('examplePrices')}</Text>
      </View>

      {mode === 'student' ? (
        <View style={{ gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {FIX_KINDS.map((k) => (
              <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: kind === k }} onPress={() => setKind(k)}
                style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: kind === k ? colors.ai : colors.line, backgroundColor: kind === k ? colors.aiTint : colors.sheet }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: kind === k ? colors.ai : colors.ink }}>{t(`fix_${k}`)}</Text>
              </Pressable>
            ))}
          </View>
          <Field label={t('amountLabel')} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <Field label={t('fixNote')} value={note} onChangeText={setNote} />
          <Text style={type.caption}>{yen(fixCost({ kind, amount: Number(amount) || 0 }))} · {roomName(roomId ?? home.rooms[0].id)}</Text>
          <Button label={t('addFix')} icon="plus" busy={busy === 'add'} disabled={!(Number(amount) > 0)} onPress={add} />
        </View>
      ) : null}
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
    </Card>
  );
}

function Row({ label, value, strong, quiet, color }: { label: string; value: string; strong?: boolean; quiet?: boolean; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={[strong ? type.bodyBold : type.body, { flex: 1, color: quiet ? colors.inkSoft : colors.ink }]}>{label}</Text>
      <Text style={[strong ? type.section : type.body, { color: color ?? (quiet ? colors.inkSoft : colors.ink), fontVariant: ['tabular-nums'] }]}>{value}</Text>
    </View>
  );
}
