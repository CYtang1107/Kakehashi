import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useAccessibilityPreferences } from './preferences';

export function Brand({ compact = false }: { compact?: boolean }) {
  const { palette } = useAccessibilityPreferences();
  return <View accessible accessibilityLabel="KAKEHASHI 架け橋" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1, minWidth: 0 }}>
    <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name="layers" size={20} color={palette.onPrimary} accessible={false} />
    </View>
    {!compact ? <View style={{ gap: 0, flexShrink: 1, minWidth: 0 }}>
      <AppText style={{ fontSize: 15, lineHeight: 21, fontWeight: '700', letterSpacing: 1.8 }}>KAKEHASHI</AppText>
      <AppText variant="caption" style={{ fontSize: 12, lineHeight: 17, letterSpacing: 2, color: palette.inkSoft }}>架け橋</AppText>
    </View> : null}
  </View>;
}
