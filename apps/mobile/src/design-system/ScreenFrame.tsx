import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout, spacing } from '../theme';
import { AppText } from './AppText';
import { useAccessibilityPreferences } from './preferences';

export function ScreenFrame({ children, title, description, toolbar, wide, footer }: {
  children: React.ReactNode; title?: string; description?: string; toolbar?: React.ReactNode; wide?: boolean; footer?: React.ReactNode;
}) {
  const { palette } = useAccessibilityPreferences();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: palette.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    {toolbar}
    <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets
      contentContainerStyle={{ paddingTop: toolbar ? spacing.lg : insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.section }}>
      <View style={{ width: '100%', maxWidth: wide ? layout.wideWidth : layout.compactWidth, alignSelf: 'center',
        paddingHorizontal: width < 360 ? spacing.lg : layout.margin, gap: spacing.xl }}>
        {title || description ? <View style={{ gap: spacing.sm }}>
          {title ? <AppText variant="title">{title}</AppText> : null}
          {description ? <AppText variant="caption">{description}</AppText> : null}
        </View> : null}
        {children}
      </View>
    </ScrollView>
    {footer}
  </KeyboardAvoidingView>;
}
