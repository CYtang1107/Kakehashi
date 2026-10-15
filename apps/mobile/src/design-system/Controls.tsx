import React, { forwardRef, useId, useState } from 'react';
import { ActivityIndicator, Pressable, Switch, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { control, radii, spacing } from '../theme';
import { useI18n } from '../i18n';
import { AppText } from './AppText';
import { useAccessibilityPreferences } from './preferences';

export type ButtonProps = {
  label: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'danger';
  icon?: keyof typeof Feather.glyphMap; disabled?: boolean; busy?: boolean;
  selected?: boolean; accessibilityLabel?: string; accessibilityHint?: string; style?: ViewStyle;
};

export function Button({ label, onPress, kind = 'primary', icon, disabled, busy, selected,
  accessibilityLabel, accessibilityHint, style }: ButtonProps) {
  const { palette } = useAccessibilityPreferences();
  const [focused, setFocused] = useState(false);
  const inactive = Boolean(disabled || busy);
  const primary = kind === 'primary';
  const foreground = primary ? palette.onNight : kind === 'danger' ? palette.danger : palette.ink;
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label}
    accessibilityHint={accessibilityHint} accessibilityState={{ disabled: inactive, busy: Boolean(busy), selected }}
    disabled={inactive} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    style={({ pressed }) => [{ minHeight: primary ? control.primary : control.secondary, minWidth: control.minimum,
      paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radii.control,
      flexDirection: 'row', gap: spacing.md, alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: focused ? palette.focus : primary ? palette.primary : selected ? palette.primary : palette.border,
      backgroundColor: primary ? (pressed ? palette.primaryPressed : palette.primary)
        : pressed || selected ? palette.secondary : kind === 'danger' ? palette.dangerSurface : palette.surface,
      opacity: inactive ? 0.6 : 1 }, style]}>
    {busy ? <ActivityIndicator color={foreground} accessibilityElementsHidden importantForAccessibility="no" />
      : icon ? <Feather name={icon} size={control.icon} color={foreground} accessible={false} /> : null}
    <AppText variant="button" style={{ color: foreground, textAlign: 'center', flexShrink: 1 }}>{label}</AppText>
  </Pressable>;
}
export const PrimaryButton = (props: Omit<ButtonProps, 'kind'>) => <Button {...props} kind="primary" />;
export const SecondaryButton = (props: Omit<ButtonProps, 'kind'>) => <Button {...props} kind="secondary" />;
export const DestructiveButton = (props: Omit<ButtonProps, 'kind'>) => <Button {...props} kind="danger" />;
export const IconLabelButton = (props: ButtonProps & { icon: NonNullable<ButtonProps['icon']> }) => <Button {...props} />;

export function AccessibleSwitch({ label, description, value, onValueChange, disabled }: {
  label: string; description?: string; value: boolean; onValueChange: (value: boolean) => void; disabled?: boolean;
}) {
  const { palette } = useAccessibilityPreferences();
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityHint={description}
    accessibilityState={{ checked: value, disabled: Boolean(disabled) }} disabled={disabled}
    onPress={() => onValueChange(!value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    style={{ minHeight: control.secondary, padding: spacing.md, borderWidth: 2,
      borderColor: focused ? palette.focus : palette.border, borderRadius: radii.control,
      backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
    <View style={{ flex: 1, gap: spacing.xs }}>
      <AppText variant="bodyBold">{label}</AppText>
      {description ? <AppText variant="caption">{description}</AppText> : null}
    </View>
    <View pointerEvents="none" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Switch value={value} disabled={disabled} accessible={false} focusable={false} tabIndex={-1}
        trackColor={{ false: palette.border, true: palette.primary }} thumbColor={palette.surface} />
    </View>
  </Pressable>;
}

export type AccessibleTextInputProps = TextInputProps & { label: string; hint?: string; error?: string; required?: boolean };
export const AccessibleTextInput = forwardRef<TextInput, AccessibleTextInputProps>(function AccessibleTextInput(
  { label, hint, error, required, style, onFocus, onBlur, ...rest }, ref) {
  const { palette, scale } = useAccessibilityPreferences();
  const { t } = useI18n();
  const [focused, setFocused] = useState(false);
  const id = useId();
  return <View style={{ gap: spacing.sm }}>
    <AppText variant="bodyBold" nativeID={`${id}-label`}>{label}{required ? ` · ${t('dsRequired')}` : ''}</AppText>
    <TextInput ref={ref} {...rest} allowFontScaling accessibilityLabel={rest.accessibilityLabel ?? label}
      accessibilityHint={rest.accessibilityHint ?? [hint, error].filter(Boolean).join('. ')}
      aria-required={required} aria-invalid={Boolean(error)}
      placeholderTextColor={palette.inkSoft}
      onFocus={event => { setFocused(true); onFocus?.(event); }} onBlur={event => { setFocused(false); onBlur?.(event); }}
      style={[{ borderWidth: 2, borderColor: error ? palette.danger : focused ? palette.focus : palette.border,
        borderRadius: radii.control, padding: spacing.lg, fontFamily: 'ZenKakuGothicNew_400Regular',
        fontSize: 19 * scale, lineHeight: 30 * scale, color: palette.ink, backgroundColor: palette.surface,
        textAlignVertical: rest.multiline ? 'top' : 'center', minHeight: rest.multiline ? 140 : control.secondary }, style]} />
    {error ? <AppText variant="caption" accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: palette.danger }}>{error}</AppText>
      : hint ? <AppText variant="caption">{hint}</AppText> : null}
  </View>;
});
