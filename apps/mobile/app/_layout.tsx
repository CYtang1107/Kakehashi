import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, ZenKakuGothicNew_400Regular, ZenKakuGothicNew_500Medium, ZenKakuGothicNew_700Bold } from '@expo-google-fonts/zen-kaku-gothic-new';
import { ShipporiMincho_600SemiBold, ShipporiMincho_700Bold } from '@expo-google-fonts/shippori-mincho';
import { I18nProvider } from '../src/i18n';
import { DataProvider } from '../src/data';
import { colors } from '../src/theme';

// Thin scrollbars in the app's colours, instead of the browser's heavy grey ones (web only).
if (typeof document !== 'undefined' && !document.getElementById('kk-scrollbars')) {
  const st = document.createElement('style');
  st.id = 'kk-scrollbars';
  st.textContent = '* { scrollbar-width: thin; scrollbar-color: #C3C8BE transparent; } *::-webkit-scrollbar { width: 6px; height: 6px; } *::-webkit-scrollbar-thumb { background: #C3C8BE; border-radius: 3px; } *::-webkit-scrollbar-track { background: transparent; }';
  document.head.appendChild(st);
}

export default function RootLayout() {
  const [loaded] = useFonts({ ZenKakuGothicNew_400Regular, ZenKakuGothicNew_500Medium, ZenKakuGothicNew_700Bold, ShipporiMincho_600SemiBold, ShipporiMincho_700Bold });
  if (!loaded) return null;
  return (
    <I18nProvider>
      <DataProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }} />
      </DataProvider>
    </I18nProvider>
  );
}
