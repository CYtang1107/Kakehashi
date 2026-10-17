import { useEffect, useState } from 'react';
import { Keyboard, Platform, useWindowDimensions } from 'react-native';
import { useAccessibilityPreferences } from './preferences';
import { responsiveMetrics, responsiveText } from './responsive';

export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const { scale, olderAdult } = useAccessibilityPreferences();
  const compact = width < 600 * scale * fontScale;
  return { width, height, compact, short: height < 500, fontScale,
    ...responsiveMetrics(width, olderAdult),
    bodyText: responsiveText('body', width, olderAdult) };
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
