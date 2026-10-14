import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { pick, type AlertKind, type CheckResult2, type WeatherStatus } from '@kakehashi/shared';
import { Button, Field } from './ui';
import { useData } from './data';
import { useI18n, type Key } from './i18n';
import { api } from './api';
import { colors, fonts, type } from './theme';

const REFRESH_MS = 10 * 60 * 1000;
const ICON: Record<AlertKind, keyof typeof Feather.glyphMap> = { snow: 'cloud-snow', cold: 'thermometer', rain: 'cloud-rain', wind: 'wind', sea: 'anchor', other: 'alert-triangle' };
const time = (iso: string, lang: 'en' | 'ja') => new Date(iso).toLocaleTimeString(lang === 'ja' ? 'ja-JP' : 'en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' });

// Official warnings for her area (JMA), refreshed every 10 minutes.
export function useWeather() {
  const { data } = useData();
  const [w, setW] = useState<WeatherStatus | null>(null);
  const id = data?.home.id;
  const load = useCallback(async () => { if (id) setW(await api.weather(id).catch(() => null)); }, [id]);
  useEffect(() => { load(); const t = setInterval(load, REFRESH_MS); return () => clearInterval(t); }, [load]);
  return { w, setW, load };
}

function alertLine(w: WeatherStatus, lang: 'en' | 'ja') {
  return w.alerts.filter((a) => a.callHer).map((a) => pick(lang, a.name, a.nameJa)).join(lang === 'ja' ? '・' : ', ');
}

// Student: call her on a warning day and log how she is.
export function WeatherCheckCard() {
  const { data, showToast } = useData();
  const { t, lang } = useI18n();
  const { w, setW } = useWeather();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  if (!data || !w) return null;
  const { home } = data;
  const student = home.students.find((s) => s.role === 'pair')?.name ?? 'Student';
  const her = lang === 'ja' && home.seniorNameJa ? `${home.seniorNameJa.split(' ')[1]}さん` : home.seniorName.split(' ')[0];

  const log = async (result: CheckResult2) => {
    setBusy(result);
    try { setW(await api.weatherCheck(home.id, result, student, note.trim() || undefined)); setNote(''); showToast(t('wxLogged')); }
    finally { setBusy(null); }
  };
  const demo = async (code: string | null) => { setBusy('demo'); try { setW(await api.weatherDemo(home.id, code)); } finally { setBusy(null); } };

  if (!w.callNeeded) {
    return (
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Feather name="sun" size={16} color={colors.inkSoft} />
          <Text style={[type.caption, { flex: 1 }]}>
            {w.source === 'unavailable' ? t('wxUnavailable') : t('wxNone', { area: pick(lang, w.area, w.areaJa), time: w.reportAt ? time(w.reportAt, lang) : '' })}
          </Text>
          <Pressable accessibilityRole="button" onPress={() => demo('06')} disabled={busy === 'demo'} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.ai }}>{t('wxDemoOn')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const kind = w.alerts.find((a) => a.callHer)?.kind ?? 'other';
  return (
    <View style={{ gap: 10, padding: 14, borderRadius: 14, backgroundColor: colors.kakiTint, borderLeftWidth: 5, borderLeftColor: colors.kaki }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Feather name={ICON[kind]} size={22} color={colors.kaki} />
        <View style={{ flex: 1 }}>
          <Text style={[type.bodyBold, { color: colors.kaki }]}>{alertLine(w, lang)} · {pick(lang, w.area, w.areaJa)}</Text>
          <Text style={type.caption}>{w.source === 'demo' ? t('wxDemoLabel') : t('wxSource', { time: w.reportAt ? time(w.reportAt, lang) : '' })}</Text>
        </View>
      </View>
      {w.today ? (
        <Text style={type.body}>{t(`wxDone_${w.today.result}` as Key, { by: w.today.by, time: time(w.today.at, lang), her })}{w.today.note ? ` "${w.today.note}"` : ''}</Text>
      ) : (
        <Text style={[type.section, { fontSize: 16 }]}>{t('wxCallHer', { her })}</Text>
      )}
      {!w.today || w.today.result !== 'fine' ? (
        <>
          <Field label={t('wxNote')} value={note} onChangeText={setNote} />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Button label={t('wxFine')} icon="check" busy={busy === 'fine'} onPress={() => log('fine')} />
            <Button label={t('wxNeedsHelp')} kind="secondary" icon="alert-circle" busy={busy === 'needs-help'} onPress={() => log('needs-help')} />
            <Button label={t('wxNoAnswer')} kind="secondary" icon="phone-missed" busy={busy === 'no-answer'} onPress={() => log('no-answer')} />
          </View>
        </>
      ) : null}
      {w.source === 'demo' ? (
        <Pressable accessibilityRole="button" onPress={() => demo(null)} style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 12.5, color: colors.ai }}>{t('wxDemoOff')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// Family: shown only on a warning day: who called, and what to do if she needs help or did not answer.
export function WeatherBanner() {
  const { data } = useData();
  const { t, lang } = useI18n();
  const { w } = useWeather();
  if (!data || !w || !w.callNeeded) return null;
  const her = lang === 'ja' && data.home.seniorNameJa ? `${data.home.seniorNameJa.split(' ')[1]}さん` : data.home.seniorName.split(' ')[0];
  const r = w.today?.result;
  const urgent = r === 'needs-help' || r === 'no-answer';
  const fg = urgent ? colors.danger : r === 'fine' ? colors.moss : colors.kaki;
  const bg = urgent ? '#F6DEDC' : r === 'fine' ? colors.mossTint : colors.kakiTint;
  return (
    <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, backgroundColor: bg, borderLeftWidth: 4, borderLeftColor: fg }}>
      <Feather name={ICON[w.alerts.find((a) => a.callHer)?.kind ?? 'other']} size={20} color={fg} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: fg }}>{alertLine(w, lang)} · {pick(lang, w.area, w.areaJa)}</Text>
        <Text style={type.body}>
          {w.today ? t(`wxFamily_${w.today.result}` as Key, { by: w.today.by, time: time(w.today.at, lang), her }) : t('wxFamilyPending', { her })}
        </Text>
        <Text style={type.caption}>{w.source === 'demo' ? t('wxDemoLabel') : t('wxSourceShort')}</Text>
      </View>
    </View>
  );
}

// Her screen: one calm line of advice on a warning day.
export function WeatherNote() {
  const { data } = useData();
  const { t, lang } = useI18n();
  const { w } = useWeather();
  if (!data || !w || !w.callNeeded) return null;
  const a = w.alerts.find((x) => x.callHer)!;
  const student = data.home.students.find((s) => s.role === 'pair')?.name ?? '';
  return (
    <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', padding: 18, borderRadius: 18, backgroundColor: colors.kakiTint }}>
      <Feather name={ICON[a.kind]} size={34} color={colors.kaki} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 20, lineHeight: 28, color: colors.ink }}>{pick(lang, a.name, a.nameJa)}</Text>
        <Text style={{ fontFamily: fonts.medium, fontSize: 18, lineHeight: 27, color: colors.ink }}>{t(`wxAdvice_${a.kind}` as Key)} {t('wxWillCall', { name: student })}</Text>
      </View>
    </View>
  );
}
