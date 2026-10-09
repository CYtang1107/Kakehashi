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
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.ai, tabBarInactiveTintColor: colors.inkSoft,
      tabBarStyle: { backgroundColor: colors.sheet, borderTopColor: colors.line }, tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 } }}>
      <Tabs.Screen name="index" options={{ title: t('tabVisit'), tabBarIcon: icon('check-square') }} />
      <Tabs.Screen name="add" options={{ title: t('tabAdd'), tabBarIcon: icon('camera') }} />
    </Tabs>
  );
}
