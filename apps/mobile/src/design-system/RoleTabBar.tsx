import React from 'react';
import { Pressable, View } from 'react-native';
import type { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { useI18n } from '../i18n';
import { useAccessibilityPreferences } from './preferences';

// Retains Expo's tab state and history, while allowing labels to grow naturally.
type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];
export function RoleTabBar({ state, descriptors, navigation, icons }: TabBarProps & {
  icons: Record<string, React.ComponentProps<typeof Feather>['name']>;
}) {
  const { palette } = useAccessibilityPreferences();
  const { t } = useI18n();
  const { bottom } = useSafeAreaInsets();
  return <View style={{ marginHorizontal: 12, marginTop: 8, marginBottom: bottom + 12, padding: 8,
    borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.88)', borderWidth: 1, borderColor: palette.border,
    shadowColor: '#202923', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 18, elevation: 5,
    ...(typeof document !== 'undefined' ? { backdropFilter: 'blur(18px)' } : {}) }}>
    <View role="tablist" style={{ flexDirection: 'row', gap: 4, maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
      {state.routes.map((route, index) => {
        const active = state.index === index;
        const label = descriptors[route.key].options.title ?? route.name;
        return <Pressable key={route.key} accessibilityRole="tab" accessibilityLabel={label}
          accessibilityState={{ selected: active }} aria-selected={active}
          onPress={() => { const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!active && !event.defaultPrevented) navigation.navigate(route.name, route.params); }}
          onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
          style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 56,
            padding: 4, gap: 3, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 12,
            borderWidth: 2, borderColor: active ? palette.primary : 'transparent', backgroundColor: active || pressed ? palette.secondary : palette.surface })}>
          <Feather name={icons[route.name] ?? 'circle'} size={24} color={active ? palette.primary : palette.textSecondary} accessible={false} />
          <AppText variant="caption" numberOfLines={1} style={{ fontSize: 12, lineHeight: 16, textAlign: 'center' }}>{label}</AppText>
        </Pressable>;
      })}
      <Pressable accessibilityRole="tab" accessibilityLabel={t('hSettings')} onPress={() => navigation.navigate('/settings')}
        style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 56, padding: 4, gap: 3,
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 2,
          borderColor: 'transparent', backgroundColor: pressed ? palette.secondary : palette.surface })}>
        <Feather name="settings" size={24} color={palette.textSecondary} accessible={false} />
        <AppText variant="caption" numberOfLines={1} style={{ fontSize: 12, lineHeight: 16, textAlign: 'center' }}>{t('hSettings')}</AppText>
      </Pressable>
    </View>
  </View>;
}
