import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout, spacing } from '../theme';
import { AppText } from './AppText';
import { useAccessibilityPreferences } from './preferences';
import { useResponsiveLayout } from './useResponsiveLayout';

export function ScreenFrame({ children, title, description, toolbar, wide, footer, scrollRef, safeTop = true, safeBottom = true }: {
  children: React.ReactNode; title?: string; description?: string; toolbar?: React.ReactNode; wide?: boolean; footer?: React.ReactNode; scrollRef?: React.Ref<ScrollView>; safeTop?: boolean; safeBottom?: boolean;
}) {
  const { palette } = useAccessibilityPreferences();
  const { gutter, pageTop, pageBottom, sectionGap } = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  return <KeyboardAvoidingView style={{ flex: 1, minHeight: 0, minWidth: 0, backgroundColor: palette.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    {toolbar}
    <ScrollView ref={scrollRef} style={{ flex: 1, minHeight: 0 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets={Platform.OS !== 'ios'}
      contentContainerStyle={{ paddingTop: (safeTop && !toolbar ? insets.top : 0) + pageTop, paddingBottom: (safeBottom ? insets.bottom : 0) + pageBottom }}>
      <View style={{ width: '100%', minWidth: 0, maxWidth: wide ? layout.wideWidth : layout.compactWidth, alignSelf: 'center',
        paddingLeft: Math.max(gutter, insets.left), paddingRight: Math.max(gutter, insets.right), gap: sectionGap }}>
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
