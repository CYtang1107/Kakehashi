import React from 'react';
import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useI18n } from '../../src/i18n';
import { colors, fonts } from '../../src/theme';

export default function StudentTabs() {
  const { t } = useI18n();
  const icon = (name: keyof typeof Feather.glyphMap) => ({ color, size }: { color: ColorValue; size: number }) => <Feather name={name} color={color as string} size={size - 2} />;
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.kakiNight, tabBarInactiveTintColor: colors.onNightSoft,
      tabBarStyle: { backgroundColor: colors.night, borderTopWidth: 0 }, tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 } }}>
      <Tabs.Screen name="index" options={{ title: t('tabVisit'), tabBarIcon: icon('check-square') }} />
      <Tabs.Screen name="add" options={{ title: t('tabAdd'), tabBarIcon: icon('camera') }} />
      <Tabs.Screen name="wallet" options={{ title: t('tabWallet'), tabBarIcon: icon('credit-card') }} />
      <Tabs.Screen name="team" options={{ title: t('tabTeam'), tabBarIcon: icon('award') }} />
    </Tabs>
  );
}
