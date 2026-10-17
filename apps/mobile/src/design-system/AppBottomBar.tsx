import React from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { useI18n } from '../i18n';
import { useAccessibilityPreferences } from './preferences';
import { floatingElevation, radii } from '../theme';
import { useKeyboardVisible, useResponsiveLayout } from './useResponsiveLayout';

type NavItem = { id: string; label: string; icon: keyof typeof Feather.glyphMap; active?: boolean; onPress: () => void };

export function NavigationSurface({ children, style }: { children: React.ReactNode; style?: React.ComponentProps<typeof View>['style'] }) {
  const { palette, preferences } = useAccessibilityPreferences();
  return <View testID="navigation-surface" style={[{
    padding: 8, borderRadius: radii.card, backgroundColor: palette.surface,
    borderWidth: preferences.highContrast ? 2 : 1, borderColor: preferences.highContrast ? palette.border : palette.separator,
    ...floatingElevation,
  }, style]}>{children}</View>;
}

export function BottomBarActions() {
  const { t } = useI18n();
  const { palette } = useAccessibilityPreferences();
  return <>
    <View style={{ flexDirection: 'row', gap: 6, borderTopWidth: 1, borderTopColor: palette.separator, marginTop: 4, paddingTop: 6 }}>
      <UtilityAction icon="settings" label={t('hSettings')} onPress={() => router.navigate('/settings')} palette={palette} />
    </View>
  </>;
}

function UtilityAction({ icon, label, onPress, palette }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void; palette: ReturnType<typeof useAccessibilityPreferences>['palette'] }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({ pressed }) => ({ flex: 1, minHeight: 52, borderRadius: 12, gap: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? palette.secondary : 'transparent' })}>
    <Feather name={icon} size={22} color={palette.primary} accessible={false} />
    <AppText variant="caption" style={{ maxWidth: '100%', fontSize: 15, lineHeight: 21, textAlign: 'center' }}>{label}</AppText>
  </Pressable>;
}

export function AppBottomBar({ items }: { items: NavItem[] }) {
  const { bottom, left, right } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { scale, palette } = useAccessibilityPreferences();
  const { navigation } = useResponsiveLayout();
  const keyboardVisible = useKeyboardVisible();
  if (width >= 1000 * scale || keyboardVisible) return null;
  return <View testID="mobile-navigation" style={{ flexShrink: 0, paddingLeft: left, paddingRight: right }}><NavigationSurface style={{ padding: 4, marginHorizontal: 4, marginTop: 4, marginBottom: bottom + 4 }}>
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: navigation.gap }}>
      {items.map((item) => <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected: item.active }} aria-selected={Boolean(item.active)}
        onPress={item.onPress} style={({ pressed }) => ({ flex: 1, minWidth: 0, padding: navigation.padding, minHeight: navigation.minimum, borderRadius: radii.control, gap: navigation.gap, alignItems: 'center', justifyContent: 'center',
          backgroundColor: item.active || pressed ? palette.secondary : 'transparent', borderWidth: 1, borderColor: item.active ? palette.primary : 'transparent' })}>
        <Feather name={item.icon} size={Math.min(23, navigation.icon)} color={item.active ? palette.primary : palette.textSecondary} accessible={false} />
        <AppText variant="navigation" style={{ maxWidth: '100%', fontWeight: item.active ? '600' : '400', textAlign: 'center', color: item.active ? palette.primary : palette.textSecondary }}>{item.label}</AppText>
      </Pressable>)}
    </View>
  </NavigationSurface></View>;
}

export function GlobalBottomBar({ active }: { active: 'home' | 'stories' | 'roles' | 'settings' }) {
  const { t } = useI18n();
  return <AppBottomBar items={[
    { id: 'home', label: t('hHome'), icon: 'home', active: active === 'home' || active === 'stories', onPress: () => router.navigate('/') },
    { id: 'roles', label: t('chooseRole'), icon: 'users', active: active === 'roles', onPress: () => router.navigate('/roles') },
    { id: 'settings', label: t('hSettings'), icon: 'settings', active: active === 'settings', onPress: () => router.navigate('/settings') },
  ]} />;
}
