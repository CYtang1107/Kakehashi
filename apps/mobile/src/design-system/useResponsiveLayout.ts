import { useEffect, useState } from 'react';
import { Keyboard, Platform, useWindowDimensions } from 'react-native';
import { useAccessibilityPreferences } from './preferences';
import { layout, spacing } from '../theme';

export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const { scale } = useAccessibilityPreferences();
  const compact = width < 600 * scale * fontScale;
  return { width, height, compact, short: height < 500,
    gutter: compact ? spacing.lg : layout.margin,
    cardPadding: compact ? spacing.lg : spacing.xl };
}

export function useKeyboardVisible() {
  const [visible, setVisible] = useState(() => Keyboard.isVisible());
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const show = Keyboard.addListener('keyboardDidShow', () => setVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return visible;
}
