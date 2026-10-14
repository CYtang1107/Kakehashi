import React from 'react';
import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useI18n } from '../../src/i18n';
import { colors, fonts } from '../../src/theme';

export default function FamilyTabs() {
  const { t } = useI18n();
  const icon = (name: keyof typeof Feather.glyphMap) => ({ color, size }: { color: ColorValue; size: number }) => <Feather name={name} color={color as string} size={size - 2} />;
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.kakiNight, tabBarInactiveTintColor: colors.onNightSoft,
      tabBarStyle: { backgroundColor: colors.night, borderTopWidth: 0 }, tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 } }}>
      <Tabs.Screen name="index" options={{ title: t('tabHome'), tabBarIcon: icon('home') }} />
      <Tabs.Screen name="house" options={{ title: t('tabHouse'), tabBarIcon: icon('box') }} />
      <Tabs.Screen name="plan" options={{ title: t('tabPlan'), tabBarIcon: icon('credit-card') }} />
      <Tabs.Screen name="reports" options={{ title: t('tabReports'), tabBarIcon: icon('file-text') }} />
    </Tabs>
  );
}
