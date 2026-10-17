import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccessibleTextInput, Button } from './Controls';
import { useAccessibilityPreferences } from './preferences';
import { useResponsiveLayout } from './useResponsiveLayout';
import { spacing } from '../theme';

export function MessageComposer({ label, placeholder, value, onChangeText, sendLabel, onSend, disabled, busy, editable = true }: {
  label: string; placeholder?: string; value: string; onChangeText: (value: string) => void;
  sendLabel: string; onSend: () => void; disabled?: boolean; busy?: boolean; editable?: boolean;
}) {
  const { palette, scale } = useAccessibilityPreferences();
  const { compact, short, gutter } = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  return <View testID="message-composer" style={{ flexShrink: 0, backgroundColor: palette.surface, borderTopWidth: 1,
    borderColor: palette.separator, paddingVertical: compact || short ? spacing.sm : spacing.md, paddingLeft: Math.max(gutter, insets.left), paddingRight: Math.max(gutter, insets.right) }}>
    <View style={{ maxWidth: 680, width: '100%', alignSelf: 'center', gap: spacing.sm, flexDirection: compact || short ? 'row' : 'column', alignItems: 'stretch' }}>
      <View style={{ flex: compact || short ? 1 : undefined, minWidth: 0 }}>
        <AccessibleTextInput label={label} placeholder={placeholder} value={value} onChangeText={onChangeText}
          multiline maxLength={800} editable={editable}
          style={{ minHeight: compact || short ? 56 : 80 * scale, maxHeight: (short ? 80 : compact ? 112 : 140) * scale, padding: compact || short ? spacing.sm : spacing.lg }} />
      </View>
      <Button label={sendLabel} icon="send" onPress={onSend} disabled={disabled} busy={busy}
        style={compact || short ? { alignSelf: 'flex-end', paddingHorizontal: spacing.sm, maxWidth: '40%' } : undefined} />
    </View>
  </View>;
}
