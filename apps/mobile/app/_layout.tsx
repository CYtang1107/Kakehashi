import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, ZenKakuGothicNew_400Regular, ZenKakuGothicNew_500Medium, ZenKakuGothicNew_700Bold } from '@expo-google-fonts/zen-kaku-gothic-new';
import { ShipporiMincho_600SemiBold, ShipporiMincho_700Bold } from '@expo-google-fonts/shippori-mincho';
import { I18nProvider } from '../src/i18n';
import { DataProvider } from '../src/data';
import { colors } from '../src/theme';

export default function RootLayout() {
  const [loaded] = useFonts({ ZenKakuGothicNew_400Regular, ZenKakuGothicNew_500Medium, ZenKakuGothicNew_700Bold, ShipporiMincho_600SemiBold, ShipporiMincho_700Bold });
  if (!loaded) return null;
  return (
    <I18nProvider>
      <DataProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }} />
      </DataProvider>
    </I18nProvider>
  );
}
