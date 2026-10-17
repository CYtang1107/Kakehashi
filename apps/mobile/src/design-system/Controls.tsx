import React, { forwardRef, useId, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Switch, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { control, radii, spacing, systemFont } from '../theme';
import { useI18n } from '../i18n';
import { AppText } from './AppText';
import { useAccessibilityPreferences } from './preferences';

export type ButtonProps = {
  label: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  icon?: keyof typeof Feather.glyphMap; disabled?: boolean; busy?: boolean;
  selected?: boolean; tabIndex?: 0 | -1; accessibilityRole?: 'button' | 'tab'; accessibilityLabel?: string; accessibilityHint?: string; style?: ViewStyle;
};

export function Button({ label, onPress, kind = 'primary', icon, disabled, busy, selected,
  accessibilityLabel, accessibilityHint, accessibilityRole = 'button', tabIndex, style }: ButtonProps) {
  const { palette, preferences } = useAccessibilityPreferences();
  const [focused, setFocused] = useState(false);
  const inactive = Boolean(disabled || busy);
  const primary = kind === 'primary';
  const foreground = disabled && !busy ? palette.disabledText : primary ? palette.onPrimary
    : kind === 'danger' ? palette.danger : selected || kind === 'tertiary' ? palette.ai : palette.ink;
  return <Pressable testID="premium-button" accessibilityRole={accessibilityRole} accessibilityLabel={accessibilityLabel ?? label}
    accessibilityHint={accessibilityHint} accessibilityState={{ disabled: inactive, busy: Boolean(busy), selected }} aria-disabled={inactive} aria-busy={Boolean(busy)} aria-pressed={accessibilityRole === 'button' ? selected : undefined} aria-selected={accessibilityRole === 'tab' ? selected : undefined}
    disabled={inactive} tabIndex={tabIndex} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    style={({ pressed }) => [{ minHeight: primary ? control.primary : control.secondary, minWidth: control.minimum, maxWidth: '100%', flexShrink: 1,
      paddingHorizontal: kind === 'tertiary' ? spacing.lg : spacing.xl, paddingVertical: spacing.md, borderRadius: radii.control,
      flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center',
      borderWidth: 2,
      borderColor: focused ? palette.focus : selected ? palette.primary
        : preferences.highContrast ? kind === 'danger' ? palette.danger : palette.border : 'transparent',
      backgroundColor: disabled && !busy ? palette.disabledSurface : primary ? (pressed ? palette.primaryPressed : palette.primary)
        : kind === 'danger' ? pressed ? palette.dangerPressed : palette.dangerSurface : pressed ? palette.controlPressed
        : selected ? palette.secondary : kind === 'tertiary' ? 'transparent' : palette.controlSurface }, style]}>
    {busy ? <ActivityIndicator color={foreground} accessibilityElementsHidden importantForAccessibility="no" />
      : icon ? <Feather name={icon} size={control.icon} color={foreground} accessible={false} /> : null}
    <AppText variant="button" style={{ color: foreground, textAlign: 'center', flexShrink: 1 }}>{label}</AppText>
    {selected && !icon && !busy ? <Feather name="check" size={20} color={foreground} accessible={false} /> : null}
  </Pressable>;
}
export const PrimaryButton = (props: Omit<ButtonProps, 'kind'>) => <Button {...props} kind="primary" />;
export const SecondaryButton = (props: Omit<ButtonProps, 'kind'>) => <Button {...props} kind="secondary" />;
export const TertiaryButton = (props: Omit<ButtonProps, 'kind'>) => <Button {...props} kind="tertiary" />;
export const DestructiveButton = (props: Omit<ButtonProps, 'kind'>) => <Button {...props} kind="danger" />;
export const IconLabelButton = (props: ButtonProps & { icon: NonNullable<ButtonProps['icon']> }) => <Button {...props} />;

export function IconButton({ icon, label, onPress, disabled, busy, selected }: Pick<ButtonProps, 'label' | 'onPress' | 'disabled' | 'busy' | 'selected'> & { icon: NonNullable<ButtonProps['icon']> }) {
  const { palette, preferences } = useAccessibilityPreferences();
  const [focused, setFocused] = useState(false);
  const inactive = Boolean(disabled || busy);
  const foreground = disabled && !busy ? palette.disabledText : palette.ai;
  return <Pressable testID="icon-button" accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ disabled: inactive, busy: Boolean(busy), selected }} aria-disabled={inactive} aria-busy={Boolean(busy)} aria-pressed={selected}
    disabled={inactive} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    style={({ pressed }) => ({ minWidth: control.minimum, minHeight: control.minimum, borderRadius: radii.control,
      alignItems: 'center', justifyContent: 'center', backgroundColor: disabled && !busy ? palette.disabledSurface : pressed ? palette.controlPressed : selected ? palette.secondary : palette.controlSurface,
      borderWidth: 2, borderColor: focused ? palette.focus : selected ? palette.primary : preferences.highContrast ? palette.border : 'transparent' })}>
    {busy ? <ActivityIndicator color={foreground} accessibilityElementsHidden importantForAccessibility="no" />
      : <Feather name={icon} size={control.icon} color={foreground} accessible={false} />}
  </Pressable>;
}

export function AccessibleSwitch({ label, description, value, onValueChange, disabled }: {
  label: string; description?: string; value: boolean; onValueChange: (value: boolean) => void; disabled?: boolean;
}) {
  const { palette, preferences, olderAdult } = useAccessibilityPreferences();
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityHint={description}
    accessibilityState={{ checked: value, disabled: Boolean(disabled) }} aria-checked={value} aria-disabled={Boolean(disabled)} disabled={disabled}
    onPress={() => onValueChange(!value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    style={({ pressed }) => ({ minHeight: control.secondary, padding: spacing.lg, borderWidth: preferences.highContrast ? 2 : 1,
      borderColor: focused ? palette.focus : preferences.highContrast ? palette.border : palette.separator, borderRadius: radii.control,
      opacity: disabled ? 0.5 : 1, backgroundColor: pressed ? palette.secondary : palette.surface, flexDirection: 'row', alignItems: 'center', gap: spacing.lg })}>
    <View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}>
      <AppText variant="bodyBold">{label}</AppText>
      {description ? <AppText variant="caption">{description}</AppText> : null}
    </View>
    <View pointerEvents="none" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Switch value={value} disabled={disabled} accessible={false} focusable={false} tabIndex={-1}
        {...(Platform.OS === 'web' && olderAdult ? { activeThumbColor: palette.surface } : {})}
        trackColor={{ false: palette.border, true: palette.primary }} thumbColor={palette.surface} />
    </View>
  </Pressable>;
}

export type AccessibleTextInputProps = TextInputProps & { label: string; hint?: string; error?: string; required?: boolean };
export const AccessibleTextInput = forwardRef<TextInput, AccessibleTextInputProps>(function AccessibleTextInput(
  { label, hint, error, required, style, onFocus, onBlur, ...rest }, ref) {
  const { palette, scale, preferences } = useAccessibilityPreferences();
  const { t } = useI18n();
  const [focused, setFocused] = useState(false);
  const id = useId();
  return <View style={{ minWidth: 0, maxWidth: '100%', gap: spacing.sm }}>
    <AppText variant="bodyBold" nativeID={`${id}-label`}>{label}{required ? ` · ${t('dsRequired')}` : ''}</AppText>
    <TextInput ref={ref} {...rest} allowFontScaling accessibilityLabel={rest.accessibilityLabel ?? label}
      accessibilityHint={rest.accessibilityHint ?? [hint, error].filter(Boolean).join('. ')}
      aria-labelledby={`${id}-label`} aria-describedby={hint || error ? `${id}-hint` : undefined}
      aria-required={required} aria-invalid={Boolean(error)}
      placeholderTextColor={palette.inkSoft}
      onFocus={event => { setFocused(true); onFocus?.(event); }} onBlur={event => { setFocused(false); onBlur?.(event); }}
      style={[{ borderWidth: preferences.highContrast ? 2 : 1, borderColor: error ? palette.danger : focused ? palette.focus : palette.border,
        borderRadius: radii.control, padding: spacing.lg, fontFamily: systemFont,
        fontSize: 19 * scale, lineHeight: 30 * scale, color: palette.ink, backgroundColor: palette.surface,
        opacity: rest.editable === false ? 0.6 : 1,
        minWidth: 0, width: '100%', textAlignVertical: rest.multiline ? 'top' : 'center', minHeight: rest.multiline ? 140 : control.secondary }, style]} />
    {error ? <AppText nativeID={`${id}-hint`} variant="caption" accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: palette.danger }}>{error}</AppText>
      : hint ? <AppText nativeID={`${id}-hint`} variant="caption">{hint}</AppText> : null}
  </View>;
});
