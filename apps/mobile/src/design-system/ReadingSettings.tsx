import React from 'react';
import { View } from 'react-native';
import { spacing } from '../theme';
import { useI18n } from '../i18n';
import { AppText } from './AppText';
import { Button, AccessibleSwitch } from './Controls';
import { ConfirmationDialog } from './ConfirmationDialog';
import { useAccessibilityPreferences, type TextMode } from './preferences';

export function ReadingSettings({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const { preferences, update, systemReducedMotion } = useAccessibilityPreferences();
  return <ConfirmationDialog visible={visible} title={t('dsReadingSettings')} onCancel={onClose}>
    <View style={{ gap: spacing.md }}>
      <AppText variant="bodyBold">{t('dsTextSize')}</AppText>
      {(['normal', 'large', 'extraLarge'] as TextMode[]).map(mode => <Button key={mode}
        label={t(`dsSize_${mode}`)} kind="secondary" selected={preferences.textMode === mode}
        icon={preferences.textMode === mode ? 'check-circle' : 'circle'} onPress={() => update({ textMode: mode })} />)}
      <AppText variant="caption">{t('dsSizePreview')}</AppText>
      <AccessibleSwitch label={t('dsHighContrast')} description={t('dsHighContrastHint')}
        value={preferences.highContrast} onValueChange={highContrast => update({ highContrast })} />
      <AccessibleSwitch label={t('dsReducedMotion')} description={systemReducedMotion ? t('dsSystemMotion') : t('dsReducedMotionHint')}
        value={preferences.reduceMotion || systemReducedMotion} disabled={systemReducedMotion}
        onValueChange={reduceMotion => update({ reduceMotion })} />
    </View>
  </ConfirmationDialog>;
}
