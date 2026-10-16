import { useAccessibilityPreferences } from '../design-system/preferences';
import { HerPage } from './HerPage';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { HELP_KINDS, pick, type ServiceFeedback, type ServiceKind } from '@kakehashi/shared';
import { AppText as Text, Button, Card, EmptyState, StatusBanner, formatDate } from '../ui';
import { useData } from '../data';
import { useI18n, type Key } from '../i18n';
import { api } from '../api';
import { workerName } from '../Services';
import { colors, fonts } from '../theme';

// Her own screen: large text, few choices. She asks for help in two taps; she always sees who is coming.
const big = { fontFamily: fonts.bold, fontSize: 23, lineHeight: 34, color: colors.ink };
const body = { fontFamily: fonts.medium, fontSize: 19, lineHeight: 30, color: colors.ink };
const ICON: Record<ServiceKind, keyof typeof Feather.glyphMap> = { garden: 'sun', cleaning: 'droplet', repair: 'tool', lifting: 'package', builder: 'home' };
const FACE: Record<ServiceFeedback, keyof typeof Feather.glyphMap> = { good: 'smile', okay: 'meh', 'not-good': 'frown' };

export default function HelpScreen({ visitorsOnly = false }: { visitorsOnly?: boolean }) {
  const { palette: colors } = useAccessibilityPreferences();
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [kind, setKind] = useState<ServiceKind | null>(null);
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!data) return <HerPage>{null}</HerPage>;
  const { home } = data;
  const pair = home.students.filter((s) => s.role === 'pair');
  const waiting = home.services.filter((s) => s.status === 'requested' || s.status === 'open');
  const coming = home.services.filter((s) => s.status === 'booked').sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  const toRate = home.services.filter((s) => s.status === 'done' && !s.feedback);

  const ask = async (when: 'soon' | 'next-visit') => {
    if (!kind) return;
    setBusy(true);
    setError(null);
    try {
      await api.askHelp(home.id, { kind, when, by: 'her' });
      await refresh();
      setKind(null);
      showToast(t('askedToast', { name: pair[0]?.name ?? '' }));
    } catch { setError(t('dsConnectionBody')); } finally { setBusy(false); }
  };
  const rate = async (sid: string, feedback: ServiceFeedback) => {
    setRating(sid); setError(null);
    try {
      await api.helpStatus(home.id, sid, { feedback });
      await refresh(); showToast(t('thanksFeedback'));
    } catch { setError(t('dsConnectionBody')); }
    finally { setRating(null); }
  };

  return (
    <HerPage back title={t(visitorsOnly ? 'hHelpers' : 'hRequestHelp')}>
      {visitorsOnly ? <>
      {/* Who is coming, with the door rule right underneath: the most important thing on her screen */}
      <Text variant="section" style={big}>{t('whoIsComing')}</Text>
      {coming.map((s) => {
        const w = home.workers.find((x) => x.id === s.workerId);
        const d = s.date ? new Date(`${s.date}T12:00:00`) : null;
        return (
          <Card key={s.id} style={{ gap: 16 }}>
            {d ? (
              <View style={{ width: 72, paddingVertical: 8, borderRadius: 14, backgroundColor: colors.aiTint, alignItems: 'center' }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.ai }}>{lang === 'ja' ? `${d.getMonth() + 1}月` : d.toLocaleDateString('en-GB', { month: 'short' })}</Text>
                <Text style={{ fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.ai }}>{d.getDate()}</Text>
              </View>
            ) : null}
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="section" style={big}>{workerName(w, lang)}</Text>
              <Text style={body}>{t(`svc_${s.kind}` as Key)}{s.hours ? `, ${t('hoursN', { n: s.hours })}` : ''}</Text>
              {w ? <Text style={[body, { fontSize: 18, color: colors.inkSoft }]}>{pick(lang, w.from, w.fromJa)}</Text> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="check-circle" size={18} color={colors.moss} />
                <Text style={[body, { fontSize: 18, color: colors.moss, flex: 1 }]}>{t('checkedWorker')}</Text>
              </View>
            </View>
          </Card>
        );
      })}
      {!coming.length ? <EmptyState title={t('dsNoVisitors')} message={t('dsNoVisitorsBody')} icon="users" /> : null}
      <StatusBanner title={t('dsSafetyTitle')} message={t('doorRule')} tone="warning" />

        </> : <>
      {/* Ask for help: pick one, then when */}
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {HELP_KINDS.map((k) => (
          <Pressable key={k} accessibilityRole="button" accessibilityLabel={t(`svc_${k}` as Key)}
            accessibilityState={{ selected: kind === k, disabled: busy }} aria-pressed={kind === k} aria-disabled={busy} disabled={busy} onPress={() => setKind(kind === k ? null : k)}
            style={{ flexBasis: '46%', flexGrow: 1, minHeight: 120, borderRadius: 16, borderWidth: 2, borderColor: kind === k ? colors.ai : colors.line,
              backgroundColor: kind === k ? colors.aiTint : colors.sheet, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 }}>
            <Feather name={ICON[k]} size={34} color={colors.ai} />
            <Text style={[big, { fontSize: 20, textAlign: 'center', maxWidth: '100%' }]}>{t(`svc_${k}` as Key)}</Text>
          </Pressable>
        ))}
      </View>
      {kind ? (
        <Card>
          <Text variant="section" style={big}>{t('whenQ')}</Text>
          {(['soon', 'next-visit'] as const).map(when => <Button key={when} label={t(`when_${when}`)} busy={busy} onPress={() => ask(when)} />)}
          {error ? <StatusBanner title={t('dsConnectionTitle')} message={error} tone="error" /> : null}
        </Card>
      ) : null}

      {waiting.length ? (
        <>
          <Text variant="section" style={big}>{t('waitingTitle')}</Text>
          {waiting.map((s) => (
            <Card key={s.id}>
              <Text variant="section" style={big}>{t(`svc_${s.kind}` as Key)}</Text>
              <Text style={[body, { color: colors.inkSoft }]}>{t('waitingLine')}</Text>
            </Card>
          ))}
        </>
      ) : null}

      {error && !kind ? <StatusBanner title={t('dsConnectionTitle')} message={error} tone="error" /> : null}
      {toRate.map((s) => (
        <Card key={s.id}>
          <Text variant="section" style={big}>{t('howWasIt')}</Text>
          <Text style={body}>{t(`svc_${s.kind}` as Key)} · {workerName(home.workers.find((x) => x.id === s.workerId), lang)}</Text>
          <View style={{ gap: 10 }}>
            {(['good', 'okay', 'not-good'] as const).map((f) => (
              <Pressable key={f} accessibilityRole="button" accessibilityLabel={t(`fb_${f}` as Key)} disabled={rating !== null} accessibilityState={{ disabled: rating !== null, busy: rating === s.id }} aria-disabled={rating !== null} aria-busy={rating === s.id} onPress={() => rate(s.id, f)}
                style={{ flex: 1, minHeight: 80, borderRadius: 16, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.sheet, alignItems: 'center', justifyContent: 'center', gap: 4, padding: 12 }}>
                <Feather name={FACE[f]} size={30} color={f === 'not-good' ? colors.danger : f === 'good' ? colors.moss : colors.inkSoft} accessible={false} />
                <Text style={[body, { fontSize: 18, maxWidth: '100%', textAlign: 'center' }]}>{t(`fb_${f}` as Key)}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ))}
        </>}
    </HerPage>
  );
}
