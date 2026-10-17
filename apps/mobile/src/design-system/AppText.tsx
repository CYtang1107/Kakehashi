import React from 'react';
import { Platform, Text, StyleSheet, type TextProps, type TextStyle } from 'react-native';
import { fonts, herType, systemFont, type as typography } from '../theme';
import { useI18n } from '../i18n';
import { useAccessibilityPreferences } from './preferences';

export type AppTextProps = TextProps & { variant?: keyof typeof typography };
export function AppText({ variant = 'body', style, ...props }: AppTextProps) {
  const { scale, palette, olderAdult } = useAccessibilityPreferences();
  const { lang } = useI18n();
  const base = olderAdult && (variant === 'title' || variant === 'section') ? herType[variant] : typography[variant];
  const merged: TextStyle = { ...StyleSheet.flatten([base, style]) };
  // Legacy callers pass a type token as style instead of using variant.
  const legacyHeading = olderAdult && merged.fontSize === typography.title.fontSize && merged.lineHeight === typography.title.lineHeight ? herType.title
    : olderAdult && merged.fontSize === typography.section.fontSize && merged.lineHeight === typography.section.lineHeight ? herType.section : undefined;
  if (legacyHeading) {
    merged.fontSize = legacyHeading.fontSize; merged.lineHeight = legacyHeading.lineHeight; merged.letterSpacing = legacyHeading.letterSpacing;
  }
  const legacyUI = merged.fontFamily === fonts.regular || merged.fontFamily === fonts.medium || merged.fontFamily === fonts.bold;
  const fontWeight = legacyUI ? merged.fontFamily === fonts.bold ? '700' : merged.fontFamily === fonts.medium ? '500' : '400' : merged.fontWeight;
  const color = merged.color === typography.caption.color ? palette.inkSoft
    : merged.color === typography.body.color ? palette.ink
    : merged.color === typography.eyebrow.color ? palette.kakiInk : merged.color;
  return <Text testID="app-text" accessibilityLanguage={lang === 'ja' ? 'ja-JP' : 'en-GB'}
    accessibilityRole={variant === 'title' || variant === 'section' ? 'header' : undefined}
    {...(Platform.OS === 'web' && (variant === 'title' || variant === 'section') ? { 'aria-level': variant === 'title' ? 1 : 2 } : {})}
    {...props} allowFontScaling
    style={[merged, { fontFamily: legacyUI ? systemFont : merged.fontFamily, fontWeight,
      color, fontSize: (merged.fontSize ?? base.fontSize) * scale,
      lineHeight: (merged.lineHeight ?? base.lineHeight) * scale, flexShrink: 1 }]} />;
}
