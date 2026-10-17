import React from 'react';
import { Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, ToastFeedback } from '../../src/ui';
import { useI18n, type Key } from '../../src/i18n';
import { useData } from '../../src/data';
import { useAccessibilityPreferences } from '../../src/design-system/preferences';
import { EverCircleProvider } from '../../src/evercircle/store';
import { SocialProvider } from '../../src/evercircle/social/store';
import { HomeDemoProvider } from '../../src/evercircle/homeDemo/store';
import { RoleGate } from '../../src/auth';
import { Brand } from '../../src/design-system/Brand';
import { NavigationSurface } from '../../src/design-system/AppBottomBar';
import { radii } from '../../src/theme';
import { herDestinations, herLocation } from '../../src/her/navigation';
import { useKeyboardVisible, useResponsiveLayout } from '../../src/design-system/useResponsiveLayout';
export default function HerLayout() {
  return <RoleGate role="her"><HomeDemoProvider><EverCircleProvider><SocialProvider><HerNavigation /></SocialProvider></EverCircleProvider></HomeDemoProvider></RoleGate>;
}
function HerNavigation() {
  const path = usePathname();
  const { width } = useWindowDimensions();
  const { scale, palette } = useAccessibilityPreferences();
  const { top, bottom, left, right } = useSafeAreaInsets();
  const { short, gutter } = useResponsiveLayout();
  const keyboardVisible = useKeyboardVisible();
  const { t } = useI18n();
  const { toast } = useData();
  const desktop = Platform.OS === 'web' && width >= 1100 * scale;
  const location = herLocation(path);
  const active = location.destination;
  const settingsContext = path === '/her/settings' || location.parent === 'hSettings';
  const nav = <View accessibilityRole="tablist" accessibilityLabel={t('hNavigation')} style={{ flexDirection: desktop ? 'column' : 'row', gap: desktop ? 8 : 2, padding: desktop ? 16 : 0 }}>
    {herDestinations.map(([id, href, label, icon]) => <Pressable key={id} accessibilityRole="tab" accessibilityLabel={t(label as Key)}
      accessibilityState={{ selected: active === id }} aria-selected={active === id} onPress={() => router.navigate(href)}
      style={({ pressed }) => ({ flex: desktop ? undefined : 1, minWidth: 0,
        minHeight: 64, padding: desktop ? 14 : 4, gap: desktop ? 12 : 4, borderRadius: radii.control, borderWidth: 1,
        borderColor: active === id ? palette.primary : 'transparent',
        backgroundColor: active === id || pressed ? palette.plumTint : 'transparent',
        flexDirection: desktop ? 'row' : 'column', alignItems: 'center', justifyContent: desktop ? 'flex-start' : 'center' })}>
      <Feather name={icon} size={24} color={active === id ? palette.ai : palette.inkSoft} accessible={false} />
      <AppText style={{ maxWidth: '100%', fontSize: desktop ? 18 : 15, lineHeight: desktop ? 27 : 21, fontWeight: active === id ? '600' : '400', color: active === id ? palette.ai : palette.inkSoft, textAlign: desktop ? 'left' : 'center', flexShrink: 1 }}>{t(label as Key)}</AppText>
    </Pressable>)}
  </View>;
  return <View testID="older-adult-shell" style={{ flex: 1, minHeight: 0, backgroundColor: palette.paper, paddingTop: top }}>
    <View testID="app-toolbar" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between', paddingLeft: Math.max(gutter, left), paddingRight: Math.max(gutter, right), paddingVertical: short ? 4 : 12,
      backgroundColor: palette.surface, borderBottomWidth: 1, borderColor: palette.separator }}>
      <Brand compact={!desktop && width < 390 * scale} />
      <Button label={t('hSettings')} icon="settings" kind="tertiary" selected={settingsContext}
        style={{ paddingHorizontal: 12 }} onPress={() => router.navigate('/her/settings')} />
    </View>
    <View style={{ flex: 1, minHeight: 0, flexDirection: 'row' }}>
      {desktop ? <ScrollView style={{ flexGrow: 0, width: 260 * scale, backgroundColor: palette.surface, borderRightWidth: 1, borderRightColor: palette.separator }}>{nav}</ScrollView> : null}
      <View style={{ flex: 1, minWidth: 0 }}><Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: palette.paper } }} /><ToastFeedback message={toast} /></View>
    </View>
    {!desktop && !keyboardVisible ? <View testID="mobile-navigation" style={{ flexShrink: 0, paddingLeft: Math.max(4, left), paddingRight: Math.max(4, right), paddingBottom: bottom + 4 }}><NavigationSurface style={{ padding: 4, marginTop: 4 }}>{nav}</NavigationSurface></View> : null}
  </View>;
}
