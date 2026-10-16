import React from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { useI18n, type Key } from '../i18n';
import { useAccessibilityPreferences } from './preferences';

type NavItem = { id: string; label: string; icon: keyof typeof Feather.glyphMap; active?: boolean; onPress: () => void };

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
    <AppText variant="caption" numberOfLines={1} style={{ fontSize: 14, lineHeight: 19, textAlign: 'center' }}>{label}</AppText>
  </Pressable>;
}

export function AppBottomBar({ items }: { items: NavItem[] }) {
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { scale, palette } = useAccessibilityPreferences();
  if (width >= 1000 * scale) return null;
  return <View style={{ marginHorizontal: 12, marginTop: 8, marginBottom: bottom + 12, padding: 8, borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.82)', borderWidth: 1, borderColor: palette.separator,
    shadowColor: '#202923', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 18, elevation: 5,
    ...(typeof document !== 'undefined' ? { backdropFilter: 'blur(18px)' } : {}) }}>
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 6 }}>
      {items.map((item) => <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected: item.active }}
        onPress={item.onPress} style={({ pressed }) => ({ flex: 1, minHeight: 58, borderRadius: 14, gap: 4, alignItems: 'center', justifyContent: 'center',
          backgroundColor: item.active || pressed ? palette.secondary : 'transparent', borderWidth: 2, borderColor: item.active ? palette.primary : 'transparent' })}>
        <Feather name={item.icon} size={23} color={item.active ? palette.primary : palette.textSecondary} accessible={false} />
        <AppText variant="caption" numberOfLines={1} style={{ fontSize: 14, lineHeight: 19, textAlign: 'center', color: item.active ? palette.primary : palette.textSecondary }}>{item.label}</AppText>
      </Pressable>)}
    </View>
  </View>;
}

export function GlobalBottomBar({ active }: { active: 'home' | 'stories' | 'roles' | 'settings' }) {
  const { t } = useI18n();
  return <AppBottomBar items={[
    { id: 'home', label: t('hHome'), icon: 'home', active: active === 'home' || active === 'stories', onPress: () => router.navigate('/') },
    { id: 'roles', label: t('chooseRole'), icon: 'users', active: active === 'roles', onPress: () => router.navigate('/roles') },
    { id: 'settings', label: t('hSettings'), icon: 'settings', active: active === 'settings', onPress: () => router.navigate('/settings') },
  ]} />;
}
