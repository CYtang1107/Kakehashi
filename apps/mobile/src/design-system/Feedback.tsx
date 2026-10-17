import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { control, floatingElevation, motion, radii, spacing } from '../theme';
import { useI18n } from '../i18n';
import { AppText } from './AppText';
import { Button, IconButton, type ButtonProps } from './Controls';
import { useAccessibilityPreferences } from './preferences';

type NoticeProps = { title: string; message?: string; tone?: 'info' | 'success' | 'warning' | 'error'; action?: ButtonProps };
export function StatusBanner({ title, message, tone = 'info', action }: NoticeProps) {
  const { palette, preferences } = useAccessibilityPreferences();
  const icon = { info: 'info', success: 'check-circle', warning: 'shield', error: 'alert-circle' } as const;
  const fg = tone === 'error' ? palette.danger : tone === 'warning' ? palette.warningText : palette.primary;
  const bg = tone === 'error' ? palette.dangerSurface : tone === 'warning' ? palette.warningSurface : palette.secondary;
  return <View accessibilityLiveRegion="polite" style={{ backgroundColor: bg, padding: spacing.xl, borderRadius: radii.card, gap: spacing.lg,
    borderWidth: preferences.highContrast ? 2 : 0, borderColor: fg }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
      <Feather name={icon[tone]} size={control.icon} color={fg} accessible={false} />
      <View style={{ flex: 1, gap: spacing.sm }}>
        <AppText variant="bodyBold" style={{ color: fg }}>{title}</AppText>
        {message ? <AppText>{message}</AppText> : null}
      </View>
    </View>
    {action ? <Button kind="secondary" {...action} /> : null}
  </View>;
}

export function EmptyState({ title, message, action, icon = 'calendar' }: NoticeProps & { icon?: ButtonProps['icon'] }) {
  const { palette } = useAccessibilityPreferences();
  return <View style={{ padding: spacing.xl, gap: spacing.lg, backgroundColor: palette.secondary, borderRadius: radii.card }}>
    {icon ? <Feather name={icon} size={28} color={palette.primary} accessible={false} /> : null}
    <AppText variant="bodyBold">{title}</AppText>
    {message ? <AppText>{message}</AppText> : null}
    {action ? <Button {...action} /> : null}
  </View>;
}

// Keep feedback readable even when the legacy provider clears its message sooner.
export function ToastFeedback({ message, onDismiss }: { message: string | null; onDismiss?: () => void }) {
  const [visible, setVisible] = useState<string | null>(null);
  const { palette } = useAccessibilityPreferences();
  const { bottom } = useSafeAreaInsets();
  const { t } = useI18n();
  useEffect(() => {
    if (!message) return;
    setVisible(message);
    if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(message);
  }, [message]);
  // A provider clearing its input should not cancel the retained toast's expiry.
  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => setVisible(null), motion.toastMs);
    return () => clearTimeout(timeout);
  }, [visible]);
  if (!visible) return null;
  return <View pointerEvents="box-none" style={{ position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: bottom + spacing.lg, alignItems: 'center' }}>
    <View testID="toast-surface" accessibilityLiveRegion="polite" style={{ width: '100%', maxWidth: 680, padding: spacing.lg,
      ...floatingElevation, borderWidth: 1, borderColor: palette.border,
      borderRadius: radii.card, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <AppText style={{ color: palette.ink, flex: 1 }}>{visible}</AppText>
      <IconButton icon="x" label={t('close')} onPress={() => { setVisible(null); onDismiss?.(); }} />
    </View>
  </View>;
}
