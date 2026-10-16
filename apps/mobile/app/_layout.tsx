import React, { useEffect } from 'react';
import '../src/design-system/global.css';
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
  const { reducedMotion, preferences, palette } = useAccessibilityPreferences();
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    for (const key of ['paper', 'surface', 'ink', 'primary', 'secondary', 'border', 'separator'] as const) {
      root.style.setProperty(`--kk-${key}`, palette[key]);
    }
    root.dataset.reducedMotion = String(reducedMotion);
    root.dataset.highContrast = String(preferences.highContrast);
    root.style.colorScheme = preferences.darkMode && !preferences.highContrast ? 'dark' : 'light';
    let theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!theme) { theme = document.createElement('meta'); theme.name = 'theme-color'; document.head.appendChild(theme); }
    theme.content = palette.surface;
    const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (viewport) viewport.content = 'width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content';
  }, [palette, reducedMotion, preferences.highContrast, preferences.darkMode]);
  return <><StatusBar style={preferences.darkMode && !preferences.highContrast ? 'light' : 'dark'} /><Stack screenOptions={{ headerShown: false,
    animation: 'none', contentStyle: { backgroundColor: palette.paper } }} /></>;
}
