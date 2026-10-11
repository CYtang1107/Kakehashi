import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { spriteGrid } from './pixelArt';
import { colors } from './theme';

// An item's pixel sprite as a crisp SVG icon (one rect per run of same-coloured pixels).
export function PixelIcon({ sprite, size = 40, dim }: { sprite: string; size?: number; dim?: boolean }) {
  const { rows: grid, colour } = spriteGrid(sprite);
  const runs = useMemo(() => {
    const out: { x: number; y: number; w: number; fill: string }[] = [];
    grid.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        let end = x + 1;
        while (end < row.length && row[end] === ch) end++;
        const fill = colour(ch);
        if (fill) out.push({ x, y, w: end - x, fill });
        x = end;
      }
    });
    return out;
  }, [grid, colour]);
  return (
    <View style={{ width: size, height: size, borderRadius: 10, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', opacity: dim ? 0.45 : 1 }}>
      <Svg width={size * 0.8} height={size * 0.8} viewBox={`0 0 ${grid[0].length} ${grid.length}`}>
        {runs.map((r, i) => <Rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />)}
      </Svg>
    </View>
  );
}
