import React from 'react';
import { Platform, Text, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { fonts, systemFont, type as typography } from '../theme';
import { useI18n } from '../i18n';
import { useAccessibilityPreferences } from './preferences';

export type AppTextProps = TextProps & { variant?: keyof typeof typography };
export function AppText({ variant = 'body', style, ...props }: AppTextProps) {
  const { scale, palette } = useAccessibilityPreferences();
  const { lang } = useI18n();
  const base = typography[variant];
  const merged: TextStyle = StyleSheet.flatten([base, style]);
  const legacyUI = merged.fontFamily === fonts.regular || merged.fontFamily === fonts.medium || merged.fontFamily === fonts.bold;
  const fontWeight = legacyUI ? merged.fontFamily === fonts.bold ? '700' : merged.fontFamily === fonts.medium ? '500' : '400' : merged.fontWeight;
  const color = merged.color === typography.caption.color ? palette.inkSoft
    : merged.color === typography.body.color ? palette.ink : merged.color;
  return <Text accessibilityLanguage={lang === 'ja' ? 'ja-JP' : 'en-GB'}
    accessibilityRole={variant === 'title' || variant === 'section' ? 'header' : undefined}
    {...(Platform.OS === 'web' && (variant === 'title' || variant === 'section') ? { 'aria-level': variant === 'title' ? 1 : 2 } : {})}
    {...props} allowFontScaling
    style={[merged, { fontFamily: legacyUI ? systemFont : merged.fontFamily, fontWeight,
      color, fontSize: (merged.fontSize ?? base.fontSize) * scale,
      lineHeight: (merged.lineHeight ?? base.lineHeight) * scale, flexShrink: 1 }]} />;
}
