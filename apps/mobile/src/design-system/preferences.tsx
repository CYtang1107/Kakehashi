import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { colors, highContrastColors, textScale } from '../theme';

export type TextMode = keyof typeof textScale;
export type ReadingPreferences = { textMode: TextMode; highContrast: boolean; reduceMotion: boolean };
const defaults: ReadingPreferences = { textMode: 'normal', highContrast: false, reduceMotion: false };
const storageKey = 'kakehashi-reading-preferences-v1';
function loadPreferences(): ReadingPreferences {
  if (Platform.OS !== 'web') return defaults;
  try {
    const saved = JSON.parse(globalThis.localStorage?.getItem(storageKey) ?? '{}');
    return { textMode: ['normal', 'large', 'extraLarge'].includes(saved.textMode) ? saved.textMode : 'normal',
      highContrast: saved.highContrast === true, reduceMotion: saved.reduceMotion === true };
  } catch { return defaults; }
}
const Preferences = createContext({ preferences: defaults, systemReducedMotion: false,
  update: (_change: Partial<ReadingPreferences>) => {} });

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState(loadPreferences);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setSystemReducedMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  const update = (change: Partial<ReadingPreferences>) => setPreferences(previous => {
    const next = { ...previous, ...change };
    if (Platform.OS === 'web') {
      try { globalThis.localStorage?.setItem(storageKey, JSON.stringify(next)); } catch { /* session-only fallback */ }
    }
    return next;
  });
  return <Preferences.Provider value={{ preferences, systemReducedMotion, update }}>{children}</Preferences.Provider>;
}

export function useAccessibilityPreferences() {
  const value = useContext(Preferences);
  return { ...value, scale: textScale[value.preferences.textMode],
    reducedMotion: value.systemReducedMotion || value.preferences.reduceMotion,
    palette: value.preferences.highContrast ? highContrastColors : colors };
}
