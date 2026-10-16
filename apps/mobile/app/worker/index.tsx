import { useAccessibilityPreferences } from '../../src/design-system/preferences';
import { AppText as Text } from '../../src/design-system/AppText';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COMMISSION, WORKER_CHECKS, isCleared, pick, type JobListing, type Worker } from '@kakehashi/shared';
import { StatusBanner, Button, Card, Columns, Fold, Pill, Screen, formatDate } from '../../src/ui';
import { useData } from '../../src/data';
import { useI18n, type Key } from '../../src/i18n';
import { api } from '../../src/api';
import { workerName } from '../../src/Services';
import { colors, fonts, type, yen } from '../../src/theme';

type Board = { open: JobListing[]; mine: (JobListing & { status: string; feedback?: string })[]; earned: number };

// Helpers (repairers, gardeners, cleaners, gig workers) find jobs she or a student posted, at a price set beforehand.
// Only checked helpers see the board; her name and address are never shown, only the area.
export default function HelperBoard() {
  const { palette: colors } = useAccessibilityPreferences();
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [me, setMe] = useState<string | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const request = useRef(0);
  const load = useCallback(async (id: string) => {
    const version = ++request.current; setError(null); setBoard(null);
    try { const result = await api.jobs(id); if (version === request.current) setBoard(result); }
    catch { if (version === request.current) setError(t('rLoadError')); }
  }, [t]);
  useEffect(() => { if (me) load(me); }, [me, load]);

  if (!data) return <Screen>{null}</Screen>;
  const workers = data.home.workers;
  const worker = workers.find((w) => w.id === me);

  const accept = async (j: JobListing) => {
    if (!me) return;
    setBusy(j.id);
    try { await api.acceptJob(j.homeId, j.id, me); await Promise.all([load(me), refresh()]); showToast(t('jobAccepted')); }
    catch { setError(t('rSaveError')); }
    finally { setBusy(null); }
  };

  return (
    <Screen wide fit bottomNav={[
      { id: 'jobs', label: t('helperTitle'), icon: 'briefcase', active: true, onPress: () => undefined },
      { id: 'settings', label: t('hSettings'), icon: 'settings', onPress: () => router.navigate('/settings') },
    ]}
      header={{ title: t('helperTitle'), sub: t('helperLead', { pct: Math.round(COMMISSION * 100) }) }}>
      <Columns fill scrollLeft
        left={<>
      <Text variant="caption">{t('rHelperDemo')}</Text>

      {/* Demo sign-in: pick which helper you are */}
      <View style={{ gap: 8 }}>
        <Text style={type.eyebrow}>{t('helperWho')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {workers.map((w) => (
            <Pressable key={w.id} accessibilityRole="radio" disabled={busy !== null} accessibilityState={{ checked: me === w.id, disabled: busy !== null }} aria-checked={me === w.id} aria-disabled={busy !== null} onPress={() => setMe(w.id)}
              style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: me === w.id ? colors.ai : colors.line, backgroundColor: me === w.id ? colors.aiTint : colors.sheet }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: me === w.id ? colors.ai : colors.ink }}>{workerName(w, lang)}</Text>
              <Text style={type.caption}>{pick(lang, w.from, w.fromJa)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Fold title={t('helperRulesTitle')} icon="book-open" summary={t('helperRulesSummary', { pct: Math.round(COMMISSION * 100) })} open={!me}>
        <Card tint>
          <Text style={type.section}>{t('helperRulesTitle')}</Text>
          {(['rule1', 'rule2', 'rule3', 'rule4', 'rule5', 'rule6'] as const).map((r, i) => (
            <View key={r} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.ai, width: 16 }}>{i + 1}</Text>
              <Text style={[type.body, { flex: 1 }]}>{t(`helperRule${i + 1}` as Key, { pct: Math.round(COMMISSION * 100) })}</Text>
            </View>
          ))}
        </Card>
      </Fold>

      {worker ? <Checks worker={worker} /> : null}
      {error ? <StatusBanner tone="error" title={error} action={me ? { label: t('retry'), onPress: () => load(me) } : undefined} /> : null}
        </>}
        right={<>
      {worker && board ? (
        <>
          <Text style={type.section}>{t('openJobs', { n: board.open.length })}</Text>
          {board.open.length === 0 ? <Text style={type.caption}>{t('noOpenJobs')}</Text> : null}
          {board.open.map((j) => (
            <Card key={j.id}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 8 }}>
                <Text style={[type.section, { flex: 1 }]}>{t(`svc_${j.kind}` as Key)}</Text>
                <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.ink }}>{yen(j.priceJpy)}</Text>
              </View>
              {j.note ? <Text style={type.body}>{pick(lang, j.note, j.noteJa)}</Text> : null}
              <Text style={type.caption}>{formatDate(j.date, lang)}{j.hours ? `, ${t('hoursN', { n: j.hours })}` : ''} · {pick(lang, j.area, j.areaJa)}</Text>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                <Pill label={t('youReceive', { amount: yen(j.youReceiveJpy) })} color={colors.moss} bg={colors.mossTint} />
                <Pill label={t('appFee', { amount: yen(j.feeJpy), pct: Math.round(COMMISSION * 100) })} color={colors.inkSoft} bg={colors.paper} />
              </View>
              <Button label={t('acceptJob')} icon="check" busy={busy === j.id} disabled={busy !== null || !isCleared(worker)} onPress={() => accept(j)} />
            </Card>
          ))}

          <Text style={type.section}>{t('myJobs')}</Text>
          {board.mine.length === 0 ? <Text style={type.caption}>{t('noMyJobs')}</Text> : null}
          {board.mine.map((j) => (
            <View key={j.id} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <View style={{ flex: 1 }}>
                <Text style={type.bodyBold}>{t(`svc_${j.kind}` as Key)} · {formatDate(j.date, lang)}</Text>
                <Text style={type.caption}>{pick(lang, j.area, j.areaJa)}</Text>
                <Text style={type.caption}>{j.feedback ? t('feedbackLabel', { fb: t(`fb_${j.feedback}` as Key) }) : t('rFeedbackPending')}</Text>
              </View>
              <Pill label={t(`svcstatus_${j.status}` as Key)} color={j.status === 'done' ? colors.moss : colors.ai} bg={j.status === 'done' ? colors.mossTint : colors.aiTint} />
              <Text style={[type.bodyBold, { fontVariant: ['tabular-nums'] }]}>{yen(j.youReceiveJpy)}</Text>
            </View>
          ))}
          <Text style={type.body}>{t('earned', { amount: yen(board.earned) })}</Text>
        </>
      ) : !worker ? (
        <Card tint style={{ alignItems: 'center', paddingVertical: 28 }}>
          <Feather name="briefcase" size={28} color={colors.ai} />
          <Text style={[type.bodyBold, { textAlign: 'center' }]}>{t('helperPickFirst')}</Text>
          <Text style={[type.caption, { textAlign: 'center' }]}>{t('helperPickFirstHint')}</Text>
        </Card>
      ) : !error ? <Text>{t('dsLoading')}</Text> : null}
        </>}
      />
    </Screen>
  );
}

function Checks({ worker }: { worker: Worker }) {
  const { palette: colors } = useAccessibilityPreferences();
  const { t } = useI18n();
  const ok = isCleared(worker);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'flex-start', padding: 12, borderRadius: 12, backgroundColor: ok ? colors.mossTint : colors.kakiTint }}>
      <Feather name={ok ? 'check-circle' : 'alert-circle'} size={20} color={ok ? colors.moss : colors.kaki} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[type.bodyBold, { color: ok ? colors.moss : colors.kaki }]}>{ok ? t('checksDone') : t('checksMissing')}</Text>
        <Text style={type.caption}>{WORKER_CHECKS.map((c) => `${t(`check_${c}` as Key)} ${worker.checks[c] ? '✓' : '—'}`).join('   ')}</Text>
      </View>
    </View>
  );
}
