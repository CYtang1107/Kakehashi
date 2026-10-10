import React from 'react';
import Svg, { G, Line, Rect, Circle, Polygon, Text as SvgText } from 'react-native-svg';
import type { Item, Room, SafetyFix } from '@kakehashi/shared';
import { fixTone } from './SaferHome';
import { colors, decisionColor, roomColor } from './theme';
import { useI18n } from './i18n';

// 2D floor plan on the shared 320 x 240 grid, with a tappable pin per item.
export function FloorPlan({ rooms, items, selected, onSelect, fixes = [] }: { rooms: Room[]; items: Item[]; selected?: string; onSelect: (id: string) => void; fixes?: SafetyFix[] }) {
  const { lang } = useI18n();
  const tatami = rooms.find((r) => r.id === 'washitsu');
  return (
    <Svg viewBox="0 0 320 240" width="100%" style={{ aspectRatio: 320 / 240 }} accessibilityLabel="Floor plan of the home">
      {rooms.map((r) => (
        <Rect key={r.id} x={r.x} y={r.y} width={r.w} height={r.h} fill={roomColor[r.status]} stroke={colors.inkSoft} strokeWidth={1.5} />
      ))}
      {tatami ? [1, 2].map((i) => (
        <Line key={i} x1={tatami.x + (tatami.w / 3) * i} y1={tatami.y + 18} x2={tatami.x + (tatami.w / 3) * i} y2={tatami.y + tatami.h - 2} stroke={colors.line} strokeWidth={1} />
      )) : null}
      {rooms.map((r) => (
        <SvgText key={`l-${r.id}`} x={r.x + 7} y={r.y + 14} fontSize={10} fill={colors.inkSoft}>{lang === 'ja' ? r.nameJa : r.name}</SvgText>
      ))}
      {/* Safer home plan: a small diamond per fix, coloured by her decision */}
      {fixes.filter((f) => f.status !== 'not-now').map((f) => (
        <G key={f.id}>
          <Polygon points={`${f.x},${f.y - 7} ${f.x + 7},${f.y} ${f.x},${f.y + 7} ${f.x - 7},${f.y}`} fill={fixTone[f.status].bg} stroke={fixTone[f.status].fg} strokeWidth={1.5} />
          <SvgText x={f.x} y={f.y + 3.5} fontSize={9} fontWeight="bold" fill={fixTone[f.status].fg} textAnchor="middle">+</SvgText>
        </G>
      ))}
      {items.map((it) => {
        const c = decisionColor[it.decision].fg;
        return (
          <G key={it.id} onPress={() => onSelect(it.id)}>
            {selected === it.id ? <Circle cx={it.x} cy={it.y} r={15} fill="none" stroke={c} strokeWidth={2} /> : null}
            <Circle cx={it.x} cy={it.y} r={10.5} fill={c} />
            <SvgText x={it.x} y={it.y + 4} fontSize={10.5} fill={colors.sheet} textAnchor="middle">{it.glyph}</SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
