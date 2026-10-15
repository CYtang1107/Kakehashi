import React from 'react';
import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useI18n } from '../../src/i18n';
import { colors, fonts } from '../../src/theme';
import { AppText } from '../../src/design-system/AppText';
import { useAccessibilityPreferences } from '../../src/design-system/preferences';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StudentTabs() {
  const { t } = useI18n();
  const { scale, palette } = useAccessibilityPreferences();
  const { bottom } = useSafeAreaInsets();
  const icon = (name: keyof typeof Feather.glyphMap) => ({ color, size }: { color: ColorValue; size: number }) => <Feather name={name} color={color as string} size={size - 2} />;
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: palette.primary, tabBarInactiveTintColor: palette.inkSoft, tabBarLabelPosition: 'below-icon',
      tabBarStyle: { backgroundColor: palette.surface, borderTopWidth: 1, borderTopColor: palette.separator, height: (scale > 1 ? 130 : 104) + bottom, paddingBottom: bottom + 8, paddingTop: 8 }, tabBarLabel: ({ children, color }) => <AppText variant="caption" style={{ fontSize: 16, lineHeight: 24, color, textAlign: 'center' }}>{children}</AppText> }}>
      <Tabs.Screen name="index" options={{ title: t('tabVisit'), tabBarIcon: icon('check-square') }} />
      <Tabs.Screen name="add" options={{ title: t('tabAdd'), tabBarIcon: icon('camera') }} />
      <Tabs.Screen name="wallet" options={{ title: t('tabWallet'), tabBarIcon: icon('credit-card') }} />
      <Tabs.Screen name="team" options={{ title: t('tabTeam'), tabBarIcon: icon('award') }} />
    </Tabs>
  );
}
