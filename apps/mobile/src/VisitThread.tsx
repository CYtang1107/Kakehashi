import React, { useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import type { Visit } from '@kakehashi/shared';
import { Avatar } from './ui';
import { useI18n } from './i18n';
import { fonts } from './theme';

// The signature element: the same pair coming back every month, drawn as knots on a white thread over indigo-dyed
// cloth (藍染). Done visits are tied knots, the next one is an open ring, the months ahead are faint stitches.
export const thread = { cloth: '#1F3557', clothDeep: '#182B47', thread: '#F4F1E8', faint: 'rgba(244,241,232,0.35)', next: '#E8A87C' } as const;
const MONTHS = 12;
const H = 62;

export function VisitThread({ visits, names, initials, stats, next, onPress }: {
  visits: Visit[]; names: [string, string]; initials: [string, string]; stats: string; next?: string; onPress?: () => void;
}) {
  const { t, lang } = useI18n();
  const [w, setW] = useState(320);
  const done = visits.filter((v) => v.status === 'done');
  const first = [...visits].sort((a, b) => a.date.localeCompare(b.date))[0]?.date ?? new Date().toISOString();
  const start = new Date(`${first.slice(0, 7)}-01T12:00:00`);
  const monthIndex = (iso: string) => { const d = new Date(`${iso.slice(0, 10)}T12:00:00`); return (d.getFullYear() - start.getFullYear()) * 12 + d.getMonth() - start.getMonth(); };
  const pad = 18, step = (w - pad * 2) / (MONTHS - 1), y = 22;
  const x = (i: number) => pad + i * step;
  // A gently woven cord rather than a ruler line.
  let cord = `M ${pad - 10} ${y}`;
  for (let i = 0; i < MONTHS - 1; i++) cord += ` Q ${x(i) + step / 2} ${y + (i % 2 ? 5 : -5)} ${x(i + 1)} ${y}`;
  cord += ` L ${w - pad + 10} ${y}`;
  const label = (i: number) => {
    const d = new Date(start); d.setMonth(start.getMonth() + i);
    return lang === 'ja' ? `${d.getMonth() + 1}月` : d.toLocaleDateString('en-GB', { month: 'short' });
  };
  const perMonth = (status: Visit['status']) => {
    const m = new Map<number, number>();
    visits.filter((v) => v.status === status).forEach((v) => { const i = monthIndex(v.date); if (i >= 0 && i < MONTHS) m.set(i, (m.get(i) ?? 0) + 1); });
    return m;
  };
  const doneM = perMonth('done'), plannedM = perMonth('planned');

  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} disabled={!onPress}
      style={{ borderRadius: 20, backgroundColor: thread.cloth, padding: 18, gap: 10, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flexDirection: 'row' }}>
          <Avatar initial={initials[0]} tone="plum" />
          <View style={{ marginLeft: -8 }}><Avatar initial={initials[1]} tone="moss" /></View>
        </View>
        <Text style={{ flex: 1, fontFamily: fonts.display, fontSize: 21, lineHeight: 28, color: thread.thread }}>
          {t('threadTitle', { n: done.length, a: names[0], b: names[1] })}
        </Text>
      </View>
      <View onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)} style={{ height: H }}>
        <Svg width={w} height={H} accessibilityLabel={t('threadTitle', { n: done.length, a: names[0], b: names[1] })}>
          <Path d={cord} stroke={thread.thread} strokeWidth={2} fill="none" strokeLinecap="round" />
          {Array.from({ length: MONTHS }, (_, i) => {
            const d = doneM.get(i) ?? 0, p = plannedM.get(i) ?? 0;
            return (
              <React.Fragment key={i}>
                {d === 0 && p === 0 ? <Circle cx={x(i)} cy={y} r={2.5} fill={thread.faint} /> : null}
                {Array.from({ length: d }, (_, k) => <Circle key={`d${k}`} cx={x(i) + k * 9 - (d - 1) * 4.5} cy={y} r={7} fill={thread.thread} />)}
                {Array.from({ length: p }, (_, k) => <Circle key={`p${k}`} cx={x(i) + (d + k) * 9 - (d + p - 1) * 4.5} cy={y} r={7} fill={thread.cloth} stroke={thread.next} strokeWidth={2.5} />)}
                <SvgText x={x(i)} y={y + 32} fontSize={11} fill={d || p ? thread.thread : thread.faint} textAnchor="middle">{label(i)}</SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
      {next ? <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: thread.next }}>{next}</Text> : null}
      <Text style={{ fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: 'rgba(244,241,232,0.8)' }}>{stats}</Text>
    </Pressable>
  );
}
