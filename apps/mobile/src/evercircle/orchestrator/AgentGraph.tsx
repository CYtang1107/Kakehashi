import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View, useWindowDimensions } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { AppText } from '../../ui';
import { useAccessibilityPreferences } from '../../design-system/preferences';
import { MODULES, type Event, type Module } from './model';
import { moduleName } from './copy';

// This component is imported only by the developer route. The graph has at most ten nodes.
export function AgentGraph({ events, current, selected, onSelect, ja }: {
  events: Event[]; current?: Event; selected: Module | null; onSelect: (module: Module) => void; ja: boolean;
}) {
  const { palette, reducedMotion, scale } = useAccessibilityPreferences();
  const { width } = useWindowDimensions();
  const narrow = width < 600 * scale;
  const opacity = useRef(new Animated.Value(1)).current;
  const [boxes,setBoxes]=useState<Partial<Record<Module,{x:number;y:number;width:number;height:number}>>>({});
  useEffect(() => {
    opacity.setValue(1);
    if (reducedMotion || !current) return;
    const animation = Animated.sequence([Animated.timing(opacity, { toValue: .55, duration: 160, useNativeDriver: true }), Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: true })]);
    animation.start(); return () => animation.stop();
  }, [current, reducedMotion, opacity]);
  const involved = new Set(events.flatMap(e => [e.from, e.to]));
  const nodes = MODULES.filter(m => m !== 'orchestrator' && involved.has(m));
  const node = (id: Module) => {
    const active = current?.from === id || current?.to === id;
    const blocked = current?.kind === 'blocked' && current.to === id;
    return <Animated.View key={id} onLayout={event=>{const box=event.nativeEvent.layout;setBoxes(previous=>JSON.stringify(previous[id])===JSON.stringify(box)?previous:{...previous,[id]:box});}}
      style={{ flexBasis: narrow || id==='orchestrator'?'100%':'44%', flexGrow:1, opacity: active ? opacity : 1 }}>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: selected === id }} aria-pressed={selected === id} accessibilityLabel={moduleName(id, ja)} onPress={() => onSelect(id)}
        style={({ pressed }) => ({ minHeight: 66, justifyContent: 'center', padding: 12, borderRadius: 12, borderWidth: selected === id || active ? 3 : 1,
          borderColor: blocked ? palette.danger : active ? palette.primary : palette.border,
          backgroundColor: blocked ? palette.dangerSurface : active || pressed ? palette.secondary : palette.surface })}>
        <AppText variant="bodyBold">{moduleName(id, ja)}</AppText>
        {blocked ? <AppText>{ja ? 'ブロック' : 'Blocked'}</AppText> : null}
      </Pressable>
    </Animated.View>;
  };
  const edges=events.filter((e,i)=>events.findIndex(other=>other.from===e.from&&other.to===e.to)===i)
    .sort((a,b)=>Number(a.from===current?.from&&a.to===current.to)-Number(b.from===current?.from&&b.to===current.to));
  return <View style={{ gap: 40, paddingLeft:narrow?24:0, flexDirection:'row',flexWrap:'wrap', position:'relative' }}>
    <Svg width="100%" height="100%" style={{position:'absolute'}} accessible={false} pointerEvents="none">
      {edges.map(e=>{const a=boxes[e.from],b=boxes[e.to];if(!a||!b||e.from===e.to)return null;
        const active=current?.from===e.from&&current.to===e.to,blocked=active&&current.kind==='blocked';
        if(narrow)return <Path key={`${e.from}-${e.to}`} d={`M ${a.x} ${a.y+a.height/2} H 4 V ${b.y+b.height/2} H ${b.x}`}
          fill="none" stroke={blocked?palette.danger:active?palette.primary:palette.border} strokeWidth={active?3:1} strokeDasharray={blocked?'5 4':undefined}/>;
        return <Line key={`${e.from}-${e.to}`} x1={a.x+a.width/2} y1={a.y+a.height/2} x2={b.x+b.width/2} y2={b.y+b.height/2}
          stroke={blocked?palette.danger:active?palette.primary:palette.border} strokeWidth={active?3:1} strokeDasharray={blocked?'5 4':undefined}/>;})}
    </Svg>
    {node('orchestrator')}
    {nodes.map(node)}
  </View>;
}
