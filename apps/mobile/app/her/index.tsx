import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { HELP_KINDS, pick, type ServiceFeedback, type ServiceKind } from '@kakehashi/shared';
import { Card, Screen, formatDate } from '../../src/ui';
import { useData } from '../../src/data';
import { useI18n, type Key } from '../../src/i18n';
import { api } from '../../src/api';
import { workerName } from '../../src/Services';
import { colors, fonts } from '../../src/theme';

// Her own screen: large text, few choices. She asks for help in two taps; she always sees who is coming.
const big = { fontFamily: fonts.bold, fontSize: 22, lineHeight: 30, color: colors.ink };
const body = { fontFamily: fonts.medium, fontSize: 18, lineHeight: 27, color: colors.ink };
const ICON: Record<ServiceKind, keyof typeof Feather.glyphMap> = { garden: 'sun', cleaning: 'droplet', repair: 'tool', lifting: 'package', builder: 'home' };
const FACE: Record<ServiceFeedback, keyof typeof Feather.glyphMap> = { good: 'smile', okay: 'meh', 'not-good': 'frown' };

export default function HerScreen() {
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [kind, setKind] = useState<ServiceKind | null>(null);
  const [busy, setBusy] = useState(false);
  if (!data) return <Screen>{null}</Screen>;
  const { home } = data;
  const pair = home.students.filter((s) => s.role === 'pair');
  const next = home.visits.filter((v) => v.status === 'planned').sort((a, b) => a.date.localeCompare(b.date))[0];
  const waiting = home.services.filter((s) => s.status === 'requested');
  const coming = home.services.filter((s) => s.status === 'booked').sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  const toRate = home.services.filter((s) => s.status === 'done' && !s.feedback);

  const ask = async (when: 'soon' | 'next-visit') => {
    if (!kind) return;
    setBusy(true);
    try {
      await api.askHelp(home.id, { kind, when, by: 'her' });
      await refresh();
      setKind(null);
      showToast(t('askedToast', { name: pair[0]?.name ?? '' }));
    } finally { setBusy(false); }
  };
  const rate = async (sid: string, feedback: ServiceFeedback) => {
    await api.helpStatus(home.id, sid, { feedback });
    await refresh();
    showToast(t('thanksFeedback'));
  };

  return (
    <Screen>
      <Text style={{ fontFamily: fonts.display, fontSize: 32, lineHeight: 42, color: colors.ink }}>{t('herHello')}</Text>
      {next ? (
        <Card tint>
          <Text style={body}>{t('herNextVisit', { date: formatDate(next.date, lang), names: pair.map((s) => s.name).join(lang === 'ja' ? '・' : ' & ') })}</Text>
        </Card>
      ) : null}

      {/* Ask for help: pick one, then when */}
      <Text style={big}>{t('askHelpTitle')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {HELP_KINDS.map((k) => (
          <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: kind === k }} onPress={() => setKind(kind === k ? null : k)}
            style={{ flexBasis: '46%', flexGrow: 1, minHeight: 110, borderRadius: 18, borderWidth: 2, borderColor: kind === k ? colors.ai : colors.line,
              backgroundColor: kind === k ? colors.aiTint : colors.sheet, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 }}>
            <Feather name={ICON[k]} size={34} color={colors.ai} />
            <Text style={[big, { fontSize: 20, textAlign: 'center' }]}>{t(`svc_${k}` as Key)}</Text>
          </Pressable>
        ))}
      </View>
      {kind ? (
        <Card>
          <Text style={big}>{t('whenQ')}</Text>
          {(['soon', 'next-visit'] as const).map((w) => (
            <Pressable key={w} accessibilityRole="button" disabled={busy} onPress={() => ask(w)}
              style={{ minHeight: 60, borderRadius: 16, backgroundColor: colors.ai, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>
              <Text style={[big, { color: colors.sheet }]}>{t(`when_${w}`)}</Text>
            </Pressable>
          ))}
        </Card>
      ) : null}

      {/* The door rule, always visible */}
      <View style={{ flexDirection: 'row', gap: 12, padding: 16, borderRadius: 16, backgroundColor: colors.kakiTint }}>
        <Feather name="shield" size={28} color={colors.kaki} />
        <Text style={[body, { flex: 1 }]}>{t('doorRule')}</Text>
      </View>

      <Text style={big}>{t('whoIsComing')}</Text>
      {coming.map((s) => {
        const w = home.workers.find((x) => x.id === s.workerId);
        return (
          <Card key={s.id} style={{ gap: 6 }}>
            <Text style={[big, { color: colors.ai }]}>{s.date ? formatDate(s.date, lang) : ''}</Text>
            <Text style={big}>{workerName(w, lang)}</Text>
            <Text style={body}>{t(`svc_${s.kind}` as Key)}{s.hours ? ` · ${t('hoursN', { n: s.hours })}` : ''}</Text>
            {w ? <Text style={[body, { color: colors.inkSoft }]}>{pick(lang, w.from, w.fromJa)}</Text> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Feather name="check-circle" size={20} color={colors.moss} />
              <Text style={[body, { fontSize: 16, color: colors.moss, flex: 1 }]}>{t('checkedWorker')}</Text>
            </View>
          </Card>
        );
      })}

      {waiting.length ? (
        <>
          <Text style={big}>{t('waitingTitle')}</Text>
          {waiting.map((s) => (
            <Card key={s.id}>
              <Text style={big}>{t(`svc_${s.kind}` as Key)}</Text>
              <Text style={[body, { color: colors.inkSoft }]}>{t('waitingLine')}</Text>
            </Card>
          ))}
        </>
      ) : null}

      {toRate.map((s) => (
        <Card key={s.id}>
          <Text style={big}>{t('howWasIt')}</Text>
          <Text style={body}>{t(`svc_${s.kind}` as Key)} · {workerName(home.workers.find((x) => x.id === s.workerId), lang)}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['good', 'okay', 'not-good'] as const).map((f) => (
              <Pressable key={f} accessibilityRole="button" onPress={() => rate(s.id, f)}
                style={{ flex: 1, minHeight: 80, borderRadius: 16, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.sheet, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Feather name={FACE[f]} size={30} color={f === 'not-good' ? colors.danger : f === 'good' ? colors.moss : colors.inkSoft} />
                <Text style={[body, { fontSize: 16 }]}>{t(`fb_${f}` as Key)}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ))}
    </Screen>
  );
}
