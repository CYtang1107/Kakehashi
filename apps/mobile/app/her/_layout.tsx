import React from 'react';
import { Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, ToastFeedback } from '../../src/ui';
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

const tabs = [
  ['home', '/her', 'hHome', 'sun'], ['friends', '/her/friends', 'hFriends', 'users'],
  ['house', '/her/my-home', 'hMyHome', 'home'], ['memories', '/her/memories', 'hMemories', 'book-open'],
] as const;
export default function HerLayout() {
  return <RoleGate role="her"><HomeDemoProvider><EverCircleProvider><SocialProvider><HerNavigation /></SocialProvider></EverCircleProvider></HomeDemoProvider></RoleGate>;
}
function HerNavigation() {
  const path = usePathname();
  const { width } = useWindowDimensions();
  const { scale, palette } = useAccessibilityPreferences();
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useI18n();
  const { toast } = useData();
  const desktop = Platform.OS === 'web' && width >= 1100 * scale;
  const compactNav = !desktop && width < 390 * scale;
  const active = /settings/.test(path) ? 'settings' : /memories|\/item\//.test(path) ? 'memories' : /my-home|help|safety|house|smart-home/.test(path) ? 'house' : /friends/.test(path) ? 'friends' : 'home';
  const nav = <View accessibilityRole="tablist" accessibilityLabel={t('hNavigation')} style={{ flexDirection: desktop ? 'column' : 'row', flexWrap: 'wrap', gap: desktop ? 8 : 4, padding: desktop ? 16 : 0 }}>
    {tabs.map(([id, href, label, icon]) => <Pressable key={id} accessibilityRole="tab" accessibilityLabel={t(label as Key)}
      accessibilityState={{ selected: active === id }} aria-selected={active === id} onPress={() => router.navigate(href)}
      style={({ pressed }) => ({ flex: desktop || compactNav ? undefined : 1, flexBasis: compactNav ? '28%' : undefined, flexGrow: compactNav ? 1 : undefined,
        minHeight: desktop ? 64 : 76, padding: desktop ? 14 : 4, gap: desktop ? 12 : 5, borderRadius: radii.control, borderWidth: 1,
        borderColor: active === id ? palette.primary : 'transparent',
        backgroundColor: active === id || pressed ? palette.secondary : 'transparent',
        flexDirection: desktop ? 'row' : 'column', alignItems: 'center', justifyContent: desktop ? 'flex-start' : 'center' })}>
      <Feather name={icon} size={24} color={active === id ? palette.primary : palette.inkSoft} accessible={false} />
      <AppText style={{ maxWidth: '100%', fontSize: desktop ? 18 : 16, lineHeight: desktop ? 27 : 22, textAlign: desktop ? 'left' : 'center', flexShrink: 1 }}>{t(label as Key)}</AppText>
    </Pressable>)}
    <Pressable accessibilityRole="tab" accessibilityLabel={t('hSettings')} accessibilityState={{ selected: active === 'settings' }} aria-selected={active === 'settings'}
      onPress={() => router.navigate('/her/settings')}
      style={({ pressed }) => ({ flex: desktop || compactNav ? undefined : 1, flexBasis: compactNav ? '28%' : undefined, flexGrow: compactNav ? 1 : undefined,
        minHeight: desktop ? 64 : 76, padding: desktop ? 14 : 4, gap: desktop ? 12 : 5, borderRadius: radii.control, borderWidth: 1,
        borderColor: active === 'settings' ? palette.primary : 'transparent', backgroundColor: active === 'settings' || pressed ? palette.secondary : 'transparent',
        flexDirection: desktop ? 'row' : 'column', alignItems: 'center', justifyContent: desktop ? 'flex-start' : 'center' })}>
      <Feather name="settings" size={24} color={active === 'settings' ? palette.primary : palette.inkSoft} accessible={false} />
      <AppText style={{ maxWidth: '100%', fontSize: desktop ? 18 : 16, lineHeight: desktop ? 27 : 22, textAlign: desktop ? 'left' : 'center', flexShrink: 1 }}>{t('hSettings')}</AppText>
    </Pressable>
  </View>;
  return <View testID="older-adult-shell" style={{ flex: 1, backgroundColor: palette.paper, paddingTop: top }}>
    <View testID="app-toolbar" style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12,
      backgroundColor: palette.surface, borderBottomWidth: 1, borderColor: palette.separator }}>
      <Brand />
    </View>
    <View style={{ flex: 1, minHeight: 0, flexDirection: 'row' }}>
      {desktop ? <ScrollView style={{ flexGrow: 0, width: 260 * scale, backgroundColor: palette.surface, borderRightWidth: 1, borderRightColor: palette.separator }}>{nav}</ScrollView> : null}
      <View style={{ flex: 1, minWidth: 0 }}><Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: palette.paper } }} /><ToastFeedback message={toast} /></View>
    </View>
    {!desktop ? <NavigationSurface style={{ marginHorizontal: 8, marginTop: 4, marginBottom: bottom + 8 }}>{nav}</NavigationSurface> : null}
  </View>;
}
