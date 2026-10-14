import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COMMISSION, WORKER_CHECKS, isCleared, pick, type JobListing, type Worker } from '@kakehashi/shared';
import { Button, Card, Columns, Fold, Pill, Screen, formatDate } from '../../src/ui';
import { useData } from '../../src/data';
import { useI18n, type Key } from '../../src/i18n';
import { api } from '../../src/api';
import { workerName } from '../../src/Services';
import { colors, fonts, type, yen } from '../../src/theme';

type Board = { open: JobListing[]; mine: (JobListing & { status: string; feedback?: string })[]; earned: number };

// Helpers (repairers, gardeners, cleaners, gig workers) find jobs she or a student posted, at a price set beforehand.
// Only checked helpers see the board; her name and address are never shown, only the area.
export default function HelperBoard() {
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [me, setMe] = useState<string | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    setError(null);
    try { setBoard(await api.jobs(id)); } catch (e) { setBoard(null); setError(e instanceof Error ? e.message : String(e)); }
  }, []);
  useEffect(() => { if (me) load(me); }, [me, load]);

  if (!data) return <Screen>{null}</Screen>;
  const workers = data.home.workers;
  const worker = workers.find((w) => w.id === me);

  const accept = async (j: JobListing) => {
    if (!me) return;
    setBusy(j.id);
    try { await api.acceptJob(j.homeId, j.id, me); await Promise.all([load(me), refresh()]); showToast(t('jobAccepted')); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(null); }
  };

  return (
    <Screen wide fit header={{ title: t('helperTitle'), sub: t('helperLead', { pct: Math.round(COMMISSION * 100) }) }}>
      <Columns fill scrollLeft
        left={<>

      {/* Demo sign-in: pick which helper you are */}
      <View style={{ gap: 8 }}>
        <Text style={type.eyebrow}>{t('helperWho')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {workers.map((w) => (
            <Pressable key={w.id} accessibilityRole="radio" accessibilityState={{ checked: me === w.id }} onPress={() => setMe(w.id)}
              style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: me === w.id ? colors.ai : colors.line, backgroundColor: me === w.id ? colors.aiTint : colors.sheet }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 13.5, color: me === w.id ? colors.ai : colors.ink }}>{workerName(w, lang)}</Text>
              <Text style={type.caption}>{pick(lang, w.from, w.fromJa)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Fold title={t('helperRulesTitle')} icon="book-open" summary={t('helperRulesSummary', { pct: Math.round(COMMISSION * 100) })} open={!me}>
        <Card tint>
          <Text style={type.section}>{t('helperRulesTitle')}</Text>
          {(['rule1', 'rule2', 'rule3', 'rule4', 'rule5', 'rule6'] as const).map((r, i) => (
            <View key={r} style={{ flexDirection: 'row', gap: 10 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.ai, width: 16 }}>{i + 1}</Text>
              <Text style={[type.body, { flex: 1 }]}>{t(`helperRule${i + 1}` as Key, { pct: Math.round(COMMISSION * 100) })}</Text>
            </View>
          ))}
        </Card>
      </Fold>

      {worker ? <Checks worker={worker} /> : null}
      {error ? <Text style={[type.body, { color: colors.danger }]}>{error}</Text> : null}
        </>}
        right={<>
      {worker && board ? (
        <>
          <Text style={type.section}>{t('openJobs', { n: board.open.length })}</Text>
          {board.open.length === 0 ? <Text style={type.caption}>{t('noOpenJobs')}</Text> : null}
          {board.open.map((j) => (
            <Card key={j.id}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text style={[type.section, { flex: 1 }]}>{t(`svc_${j.kind}` as Key)}</Text>
                <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.ink }}>{yen(j.priceJpy)}</Text>
              </View>
              {j.note ? <Text style={type.body}>{pick(lang, j.note, j.noteJa)}</Text> : null}
              <Text style={type.caption}>{formatDate(j.date, lang)}{j.hours ? `, ${t('hoursN', { n: j.hours })}` : ''} · {pick(lang, j.area, j.areaJa)}</Text>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                <Pill label={t('youReceive', { amount: yen(j.youReceiveJpy) })} color={colors.moss} bg={colors.mossTint} />
                <Pill label={t('appFee', { amount: yen(j.feeJpy), pct: Math.round(COMMISSION * 100) })} color={colors.inkSoft} bg={colors.paper} />
              </View>
              <Button label={t('acceptJob')} icon="check" busy={busy === j.id} onPress={() => accept(j)} />
            </Card>
          ))}

          <Text style={type.section}>{t('myJobs')}</Text>
          {board.mine.length === 0 ? <Text style={type.caption}>{t('noMyJobs')}</Text> : null}
          {board.mine.map((j) => (
            <View key={j.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <View style={{ flex: 1 }}>
                <Text style={type.bodyBold}>{t(`svc_${j.kind}` as Key)} · {formatDate(j.date, lang)}</Text>
                <Text style={type.caption}>{pick(lang, j.area, j.areaJa)}</Text>
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
      ) : null}
        </>}
      />
    </Screen>
  );
}

function Checks({ worker }: { worker: Worker }) {
  const { t } = useI18n();
  const ok = isCleared(worker);
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 12, borderRadius: 12, backgroundColor: ok ? colors.mossTint : colors.kakiTint }}>
      <Feather name={ok ? 'check-circle' : 'alert-circle'} size={20} color={ok ? colors.moss : colors.kaki} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[type.bodyBold, { color: ok ? colors.moss : colors.kaki }]}>{ok ? t('checksDone') : t('checksMissing')}</Text>
        <Text style={type.caption}>{WORKER_CHECKS.map((c) => `${t(`check_${c}` as Key)} ${worker.checks[c] ? '✓' : '—'}`).join('   ')}</Text>
      </View>
    </View>
  );
}
