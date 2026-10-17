import React from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { router, type Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { useI18n } from '../i18n';
import { useAccessibilityPreferences } from './preferences';
import { NavigationSurface } from './AppBottomBar';
import { layout, radii } from '../theme';
import { useKeyboardVisible, useResponsiveLayout } from './useResponsiveLayout';

// Retains Expo's tab state and history, while allowing labels to grow naturally.
type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];
export function RoleTabBar({ state, descriptors, navigation, icons }: TabBarProps & {
  icons: Record<string, React.ComponentProps<typeof Feather>['name']>;
}) {
  const { palette, scale } = useAccessibilityPreferences();
  const { t } = useI18n();
  const { bottom, left, right } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 600 * scale;
  const { short, navigation: sizing } = useResponsiveLayout();
  const keyboardVisible = useKeyboardVisible();
  if (keyboardVisible) return null;
  return <View testID="mobile-navigation" style={{ flexShrink: 0, paddingLeft: left, paddingRight: right }}><NavigationSurface style={{ padding: compact ? 4 : 8, marginHorizontal: compact ? 4 : 12, marginTop: compact ? 4 : 8, marginBottom: bottom + (compact ? 4 : 12),
    maxWidth: layout.wideWidth - 48, width: 'auto', alignSelf: 'stretch' }}>
    <View role="tablist" style={{ flexDirection: 'row', gap: compact ? 2 : 4, maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
      {state.routes.map((route, index) => {
        const active = state.index === index;
        const label = descriptors[route.key].options.title ?? route.name;
        return <Pressable key={route.key} accessibilityRole="tab" accessibilityLabel={label}
          accessibilityState={{ selected: active }} aria-selected={active}
          onPress={() => { const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!active && !event.defaultPrevented) navigation.navigate(route.name, route.params); }}
          onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
          style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: short ? 48 : sizing.minimum,
            padding: sizing.padding, gap: sizing.gap, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: radii.control,
            borderWidth: 1, borderColor: active ? palette.primary : 'transparent', backgroundColor: active || pressed ? palette.secondary : 'transparent' })}>
          <Feather name={icons[route.name] ?? 'circle'} size={sizing.icon} color={active ? palette.primary : palette.textSecondary} accessible={false} />
          <AppText variant="navigation" style={{ maxWidth: '100%', textAlign: 'center', fontWeight: active ? '600' : '400', color: active ? palette.primary : palette.inkSoft }}>{label}</AppText>
        </Pressable>;
      })}
      <Pressable accessibilityRole="button" accessibilityLabel={t('hSettings')} onPress={() => router.push('/settings')}
        style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: short ? 48 : sizing.minimum, padding: sizing.padding, gap: sizing.gap,
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: radii.control, borderWidth: 1,
          borderColor: 'transparent', backgroundColor: pressed ? palette.secondary : 'transparent' })}>
        <Feather name="settings" size={sizing.icon} color={palette.textSecondary} accessible={false} />
        <AppText variant="navigation" style={{ maxWidth: '100%', textAlign: 'center' }}>{t('hSettings')}</AppText>
      </Pressable>
    </View>
  </NavigationSurface></View>;
}
