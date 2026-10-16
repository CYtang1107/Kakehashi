import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { ZenKakuGothicNew_400Regular } from '@expo-google-fonts/zen-kaku-gothic-new/400Regular';
import { ZenKakuGothicNew_500Medium } from '@expo-google-fonts/zen-kaku-gothic-new/500Medium';
import { ZenKakuGothicNew_700Bold } from '@expo-google-fonts/zen-kaku-gothic-new/700Bold';
import { ShipporiMincho_600SemiBold } from '@expo-google-fonts/shippori-mincho/600SemiBold';
import { ShipporiMincho_700Bold } from '@expo-google-fonts/shippori-mincho/700Bold';
import { ActivityIndicator, Text, View } from 'react-native';
import { I18nProvider } from '../src/i18n';
import { DataProvider } from '../src/data';
import { colors } from '../src/theme';
import { AccessibilityProvider, useAccessibilityPreferences } from '../src/design-system/preferences';
import { AuthProvider } from '../src/auth';

// Thin scrollbars in the app's colours, instead of the browser's heavy grey ones (web only).
if (typeof document !== 'undefined' && !document.getElementById('kk-scrollbars')) {
  const st = document.createElement('style');
  st.id = 'kk-scrollbars';
  st.textContent = `* { scrollbar-color: ${colors.border} ${colors.paper}; } *::-webkit-scrollbar { width: 12px; height: 12px; } *::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 6px; } *::-webkit-scrollbar-track { background: ${colors.paper}; }
    :focus-visible { outline: 3px solid ${colors.focus} !important; outline-offset: 3px; }
    ::selection { background: ${colors.secondary}; color: ${colors.ink}; } input, textarea { caret-color: ${colors.primary}; }
    @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }`;
  document.head.appendChild(st);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ ZenKakuGothicNew_400Regular, ZenKakuGothicNew_500Medium, ZenKakuGothicNew_700Bold, ShipporiMincho_600SemiBold, ShipporiMincho_700Bold });
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
    <Text style={{ fontSize: 24, color: colors.ink }}>KAKEHASHI 架け橋</Text><ActivityIndicator color={colors.primary} />
  </View>;
  return (
    <I18nProvider>
      <AccessibilityProvider>
      <AuthProvider>
      <DataProvider>
        <AppStack />
      </DataProvider>
      </AuthProvider>
      </AccessibilityProvider>
    </I18nProvider>
  );
}

function AppStack() {
  const { reducedMotion } = useAccessibilityPreferences();
  return <><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false,
    animation: reducedMotion ? 'none' : 'default', contentStyle: { backgroundColor: colors.paper } }} /></>;
}
