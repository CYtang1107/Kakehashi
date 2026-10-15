import React from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import type { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { useAccessibilityPreferences } from './preferences';

// Retains Expo's tab state and history, while allowing labels to grow naturally.
type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];
export function RoleTabBar({ state, descriptors, navigation, icons }: TabBarProps & {
  icons: Record<string, React.ComponentProps<typeof Feather>['name']>;
}) {
  const { width, fontScale } = useWindowDimensions();
  const { scale, palette } = useAccessibilityPreferences();
  const { bottom } = useSafeAreaInsets();
  const wrap = width < 480 * scale * fontScale;
  return <View style={{ padding: 8, paddingBottom: bottom + 8, backgroundColor: palette.surface,
    borderTopWidth: 1, borderTopColor: palette.border }}>
    <View role="tablist" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
      {state.routes.map((route, index) => {
        const active = state.index === index;
        const label = descriptors[route.key].options.title ?? route.name;
        return <Pressable key={route.key} accessibilityRole="tab" accessibilityLabel={label}
          accessibilityState={{ selected: active }} aria-selected={active}
          onPress={() => { const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!active && !event.defaultPrevented) navigation.navigate(route.name, route.params); }}
          onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
          style={({ pressed }) => ({ flexBasis: wrap ? '45%' : '22%', flexGrow: 1, minWidth: 0, minHeight: 60,
            padding: 10, gap: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12,
            borderWidth: 2, borderColor: active ? palette.primary : 'transparent', backgroundColor: active || pressed ? palette.secondary : palette.surface })}>
          <Feather name={icons[route.name] ?? 'circle'} size={24} color={active ? palette.primary : palette.textSecondary} accessible={false} />
          <AppText variant="caption" style={{ fontSize: 16, lineHeight: 24 }}>{label}</AppText>
        </Pressable>;
      })}
    </View>
  </View>;
}
