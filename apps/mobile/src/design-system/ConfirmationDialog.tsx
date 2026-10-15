import React, { useEffect, useId, useRef } from 'react';
import { AccessibilityInfo, Modal, Platform, ScrollView, View, findNodeHandle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radii, spacing } from '../theme';
import { useI18n } from '../i18n';
import { AppText } from './AppText';
import { Button } from './Controls';
import { useAccessibilityPreferences } from './preferences';

export type ConfirmationDialogProps = {
  visible: boolean; title: string; message?: string; confirmLabel?: string; cancelLabel?: string;
  onConfirm?: () => void; onCancel: () => void; destructive?: boolean; busy?: boolean; children?: React.ReactNode;
};

export function ConfirmationDialog({ visible, title, message, confirmLabel, cancelLabel, onConfirm,
  onCancel, destructive, busy, children }: ConfirmationDialogProps) {
  const { palette, reducedMotion } = useAccessibilityPreferences();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const panel = useRef<View>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const cancelRef = useRef(onCancel);
  const busyRef = useRef(busy);
  cancelRef.current = onCancel;
  busyRef.current = busy;
  const id = useId();
  const focusFirst = () => {
    if (Platform.OS === 'web') {
      const element = panel.current as unknown as HTMLElement | null;
      element?.querySelector<HTMLElement>('[role="button"],button,input,[tabindex="0"]')?.focus();
    } else {
      const handle = findNodeHandle(panel.current);
      if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
    }
  };
  useEffect(() => {
    if (!visible || Platform.OS !== 'web') return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const timer = setTimeout(focusFirst, 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); if (!busyRef.current) cancelRef.current(); return; }
      if (event.key !== 'Tab') return;
      const element = panel.current as unknown as HTMLElement | null;
      const controls = Array.from(element?.querySelectorAll<HTMLElement>('button:not([disabled]),[role="button"]:not([aria-disabled="true"]),input:not([disabled]),textarea:not([disabled]),[role="switch"]:not([aria-disabled="true"]),[tabindex="0"]') ?? [])
        .filter(item => item.getClientRects().length > 0);
      if (!controls.length) { event.preventDefault(); return; }
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !element?.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !element?.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer); document.removeEventListener('keydown', onKey);
      const trigger = previousFocus.current;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [visible]);

  return <Modal visible={visible} transparent animationType={reducedMotion ? 'none' : 'fade'}
    onShow={focusFirst} onRequestClose={() => { if (!busy) onCancel(); }}>
    <View style={{ flex: 1, backgroundColor: 'rgba(32,41,35,0.48)', justifyContent: 'center', alignItems: 'center',
      paddingHorizontal: spacing.lg, paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }}>
      <View ref={panel} role={onConfirm ? 'alertdialog' : 'dialog'} aria-modal accessibilityViewIsModal
        aria-labelledby={`${id}-title`} aria-describedby={message ? `${id}-message` : undefined}
        style={{ width: '100%', maxWidth: 560, maxHeight: '100%', backgroundColor: palette.surface, borderRadius: radii.dialog }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}>
          <AppText variant="section" nativeID={`${id}-title`}>{title}</AppText>
          {message ? <AppText nativeID={`${id}-message`}>{message}</AppText> : null}
          {children}
          <View style={{ gap: spacing.md }}>
            <Button label={cancelLabel ?? t(onConfirm ? 'dsCancel' : 'close')} kind="secondary" disabled={busy} onPress={onCancel} />
            {onConfirm ? <Button label={confirmLabel ?? t('dsConfirm')} kind={destructive ? 'danger' : 'primary'} busy={busy} onPress={onConfirm} /> : null}
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
