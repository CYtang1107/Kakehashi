import React from 'react';
import { Text, StyleSheet, type TextProps } from 'react-native';
import { type as typography } from '../theme';
import { useI18n } from '../i18n';
import { useAccessibilityPreferences } from './preferences';

export type AppTextProps = TextProps & { variant?: keyof typeof typography };
export function AppText({ variant = 'body', style, ...props }: AppTextProps) {
  const { scale, palette } = useAccessibilityPreferences();
  const { lang } = useI18n();
  const base = typography[variant];
  const merged = StyleSheet.flatten([base, style]);
  const color = merged.color === typography.caption.color ? palette.inkSoft
    : merged.color === typography.body.color ? palette.ink : merged.color;
  return <Text accessibilityLanguage={lang === 'ja' ? 'ja-JP' : 'en-GB'}
    accessibilityRole={variant === 'title' || variant === 'section' ? 'header' : undefined}
    {...props} allowFontScaling
    style={[merged, { color, fontSize: (merged.fontSize ?? base.fontSize) * scale,
      lineHeight: (merged.lineHeight ?? base.lineHeight) * scale, flexShrink: 1 }]} />;
}
