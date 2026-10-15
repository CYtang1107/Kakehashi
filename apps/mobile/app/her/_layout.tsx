import React from 'react';
import { Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, ToastFeedback } from '../../src/ui';
import { useI18n, type Key } from '../../src/i18n';
import { useData } from '../../src/data';
import { useAccessibilityPreferences } from '../../src/design-system/preferences';

const tabs = [
  ['home', '/her', 'hHome', 'sun'], ['friends', '/her/friends', 'hFriends', 'users'],
  ['house', '/her/my-home', 'hMyHome', 'home'], ['memories', '/her/memories', 'hMemories', 'book-open'],
] as const;
export default function HerLayout() {
  const path = usePathname();
  const { width, fontScale } = useWindowDimensions();
  const { scale, palette, reducedMotion } = useAccessibilityPreferences();
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useI18n();
  const { toast } = useData();
  const desktop = Platform.OS === 'web' && width >= 1100 * scale;
  const wrap = !desktop && width < 480 * scale * fontScale;
  const active = /memories|\/item\//.test(path) ? 'memories' : /my-home|help|safety|house|smart-home/.test(path) ? 'house' : /friends/.test(path) ? 'friends' : 'home';
  const nav = <View accessibilityRole="tablist" accessibilityLabel={t('hNavigation')} style={{ flexDirection: desktop ? 'column' : 'row', flexWrap: 'wrap', gap: 4, padding: 8 }}>
    {tabs.map(([id, href, label, icon]) => <Pressable key={id} accessibilityRole="tab" accessibilityLabel={t(label as Key)}
      accessibilityState={{ selected: active === id }} aria-selected={active === id} onPress={() => router.navigate(href)}
      style={({ pressed }) => ({ flexBasis: desktop ? undefined : wrap ? '48%' : '23%', flexGrow: desktop ? 0 : 1,
        minHeight: 60, padding: 10, gap: 4, borderRadius: 12, borderWidth: 2,
        borderColor: active === id ? palette.primary : 'transparent',
        backgroundColor: active === id || pressed ? palette.secondary : palette.surface,
        flexDirection: desktop || wrap ? 'row' : 'column', alignItems: 'center', justifyContent: desktop ? 'flex-start' : 'center' })}>
      <Feather name={icon} size={24} color={active === id ? palette.primary : palette.inkSoft} accessible={false} />
      <AppText style={{ fontSize: 16, lineHeight: 24, textAlign: desktop ? 'left' : 'center', flexShrink: 1 }}>{t(label as Key)}</AppText>
    </Pressable>)}
  </View>;
  return <View style={{ flex: 1, backgroundColor: palette.paper, paddingTop: top }}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderColor: palette.separator }}>
      <AppText variant="bodyBold" style={{ flex: 1, color: palette.primary }}>KAKEHASHI</AppText>
      <Button label={t('hSettings')} icon="settings" kind="secondary" onPress={() => router.navigate('/her/settings')} />
    </View>
    <View style={{ flex: 1, minHeight: 0, flexDirection: 'row' }}>
      {desktop ? <ScrollView style={{ flexGrow: 0, width: 260 * scale, backgroundColor: palette.surface }}>{nav}</ScrollView> : null}
      <View style={{ flex: 1, minWidth: 0 }}><Stack screenOptions={{ headerShown: false, animation: reducedMotion ? 'none' : 'default', contentStyle: { backgroundColor: palette.paper } }} /><ToastFeedback message={toast} /></View>
    </View>
    {!desktop ? <View style={{ paddingBottom: bottom, backgroundColor: palette.surface, borderTopWidth: 1, borderColor: palette.separator }}>{nav}</View> : null}
  </View>;
}
