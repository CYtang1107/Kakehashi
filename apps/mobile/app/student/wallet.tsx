import { useAccessibilityPreferences } from '../../src/design-system/preferences';
import { AppText as Text } from '../../src/design-system/AppText';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { PayKind, Wallet } from '@kakehashi/shared';
import { StatusBanner, Button, Card, Field, Fold, Pill, Screen, TaskWorkspace, formatDate } from '../../src/ui';
import { useData } from '../../src/data';
import { useI18n, type Key } from '../../src/i18n';
import { api } from '../../src/api';
import { fonts, type, yen } from '../../src/theme';

const NISA_URL = 'https://www.fsa.go.jp/policy/nisa2/';
const ICON: Record<PayKind, keyof typeof Feather.glyphMap> = { visit: 'home', call: 'phone', 'weather-call': 'cloud-snow', outing: 'map-pin' };

// Student wallet: what each visit, call and outing earned, paid to the student's own bank account.
// The savings goal only tracks a plan; KAKEHASHI never holds or invests the money.
export default function WalletScreen() {
  const { palette: colors } = useAccessibilityPreferences();
  const { data, showToast } = useData();
  const { t, lang } = useI18n();
  const pair = data?.home.students.filter((s) => s.role === 'pair') ?? [];
  const [sid, setSid] = useState<string | null>(null);
  const [w, setW] = useState<Wallet | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [target, setTarget] = useState('');
  const [pct, setPct] = useState('20');
  const me = sid ?? pair[0]?.id ?? null;
  const homeId = data?.home.id;

  const request = useRef(0);
  const load = useCallback(async () => {
    if (!homeId || !me) return;
    const version = ++request.current; setW(null); setError(null); setEditing(false);
    try { const wallet = await api.wallet(homeId, me); if (version === request.current) setW(wallet); }
    catch { if (version === request.current) setError(t('rLoadError')); }
  }, [homeId, me, t]);
  useEffect(() => { load(); }, [load]);
  if (!data || !w || !homeId || !me) return <Screen header={{ title: t('walletTitle') }}>
    {error ? <StatusBanner tone="error" title={error} action={{ label: t('retry'), onPress: load }} /> : <Text>{t('dsLoading')}</Text>}
  </Screen>;

  const run = async (key: string, fn: () => Promise<Wallet>, done?: string) => {
    setBusy(key); setError(null);
    try { setW(await fn()); if (done) showToast(done); return true; }
    catch { setError(t('rSaveError')); return false; }
    finally { setBusy(null); }
  };
  const goal = w.goal;
  const progress = goal ? Math.min(1, w.setAsideJpy / goal.targetJpy) : 0;
  const startEdit = () => { setGoalName(goal?.name ?? ''); setTarget(goal ? String(goal.targetJpy) : ''); setPct(String(goal?.setAsidePct ?? 20)); setEditing(true); };

  return (
    <Screen header={{ title: t('walletTitle'), sub: t('walletLead') }}>

      <StatusBanner title={t('rDemo')} message={t('rWalletDemo')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {pair.map((s) => (
          <Pressable key={s.id} accessibilityRole="radio" accessibilityState={{ checked: me === s.id, disabled: busy !== null }} aria-checked={me === s.id} aria-disabled={busy !== null} disabled={busy !== null} onPress={() => setSid(s.id)}
            style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center',  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: me === s.id ? colors.ai : colors.line, backgroundColor: me === s.id ? colors.aiTint : colors.sheet }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: me === s.id ? colors.ai : colors.ink }}>{s.name}</Text>
          </Pressable>
        ))}
      </View>

      {/* The three numbers that matter, then payday */}
      <Card>
        <Text style={type.eyebrow}>{t('walletThisMonth')}</Text>
        <Text variant="value" style={{ fontVariant: ['tabular-nums'] }}>{yen(w.monthJpy)}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          <View style={{ flex: 1 }}><Text style={type.caption}>{t('walletPending')}</Text><Text style={type.bodyBold}>{yen(w.pendingJpy)}</Text></View>
          <View style={{ flex: 1 }}><Text style={type.caption}>{t('walletPaid')}</Text><Text style={type.bodyBold}>{yen(w.paidJpy)}</Text></View>
        </View>
        <Button label={t('walletPayout')} icon="credit-card" kind="secondary" busy={busy === 'payout'} disabled={w.pendingJpy === 0}
          onPress={() => run('payout', () => api.payout(homeId, me), t('walletPaidToast'))} />
        <Text style={type.caption}>{t('walletRates', { hour: yen(w.rates.hourJpy), visit: yen(w.rates.hourJpy * w.rates.visitHours), call: yen(w.rates.callJpy) })}</Text>
      </Card>

      <TaskWorkspace tabs defaultTask="history" tasks={[
        { id: 'history', label: t('walletHistory'), content: <>
      {w.entries.map((p) => (
        <View key={p.id} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line }}>
          <Feather name={ICON[p.kind]} size={18} color={colors.ai} />
          <View style={{ flex: 1 }}>
            <Text style={type.bodyBold}>{t(`pay_${p.kind}` as Key)}{p.hours ? `, ${t('hoursN', { n: p.hours })}` : ''}</Text>
            <Text style={type.caption}>{formatDate(p.date, lang)}</Text>
          </View>
          <Pill label={t(p.status === 'paid' ? 'payPaid' : 'payPending')} color={p.status === 'paid' ? colors.moss : colors.kaki} bg={p.status === 'paid' ? colors.mossTint : colors.kakiTint} />
          <Text style={[type.bodyBold, { fontVariant: ['tabular-nums'], minWidth: 64, textAlign: 'right' }]}>{yen(p.amountJpy)}</Text>
        </View>
      ))}
        </> },
        { id: 'savings', label: t('goalTitle'), content: <>
      {/* Savings goal: a tracker, the money stays in their own bank */}
      <Card>
        <Text style={type.section}>{t('goalTitle')}</Text>
        {goal && !editing ? (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 8 }}>
              <Text style={[type.bodyBold, { flex: 1 }]}>{goal.name}</Text>
              <Text style={type.caption}>{yen(w.setAsideJpy)} / {yen(goal.targetJpy)}</Text>
            </View>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.paper, overflow: 'hidden' }}>
              <View style={{ width: `${Math.round(progress * 100)}%`, height: '100%', backgroundColor: colors.moss }} />
            </View>
            <Text style={type.caption}>{t('goalLine', { pct: goal.setAsidePct })}</Text>
            <Button label={t('goalEdit')} kind="secondary" icon="edit-2" onPress={startEdit} />
          </>
        ) : editing || !goal ? (
          editing ? (
            <View style={{ gap: 8 }}>
              <Field label={t('goalName')} value={goalName} onChangeText={setGoalName} placeholder={t('goalNameExample')} />
              <Field label={t('goalTarget')} value={target} onChangeText={setTarget} keyboardType="number-pad" />
              <Field label={t('goalPct')} value={pct} onChangeText={setPct} keyboardType="number-pad" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <View style={{ flex: 1 }}><Button label={t('goalSave')} icon="check" busy={busy === 'goal'} disabled={!goalName.trim() || !(Number(target) > 0)}
                  onPress={() => run('goal', () => api.setGoal(homeId, me, { name: goalName, targetJpy: Number(target), setAsidePct: Number(pct) }), t('saved')).then((ok) => { if (ok) setEditing(false); })} /></View>
                {goal ? <View style={{ flex: 1 }}><Button label={t('goalRemove')} kind="secondary" disabled={busy !== null} onPress={() => run('goal', () => api.setGoal(homeId, me, { clear: true }), t('saved')).then(ok => { if (ok) setEditing(false); })} /></View> : null}
              </View>
            </View>
          ) : (
            <>
              <Text style={type.caption}>{t('goalNone')}</Text>
              <Button label={t('goalSet')} kind="secondary" icon="target" onPress={startEdit} />
            </>
          )
        ) : null}
        <Text style={type.caption}>{t('goalNote')}</Text>
      </Card>

        </> },
        { id: 'learn', label: t('nisaTitle'), content: <>
      {/* Long-term saving: neutral information and the government's guide, never advice */}
        <Card tint>
          <Text style={type.section}>{t('nisaTitle')}</Text>
          <Text style={type.body}>{t('nisaBody')}</Text>
          <Button label={t('nisaLink')} kind="secondary" icon="external-link" onPress={() => Linking.openURL(NISA_URL)} />
          <Text style={type.caption}>{t('nisaDisclaimer')}</Text>
        </Card>

        </> },
      ]} />
      {error ? <StatusBanner tone="error" title={error} /> : null}

    </Screen>
  );
}
