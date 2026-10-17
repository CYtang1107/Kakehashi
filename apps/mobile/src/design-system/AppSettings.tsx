import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { AccessibleSwitch, Button } from './Controls';
import { useAccessibilityPreferences, type ReadingPreferences, type TextMode } from './preferences';
import { useI18n } from '../i18n';
import { spacing } from '../theme';
import { ConfirmationDialog } from './ConfirmationDialog';

type Section = 'appearance' | 'notifications' | 'accessibility' | 'privacy' | 'about';

export function AppSettings({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const { preferences, update, palette } = useAccessibilityPreferences();
  const [draft, setDraft] = useState<ReadingPreferences>(preferences);
  const [initialPreferences, setInitialPreferences] = useState<ReadingPreferences>(preferences);
  const [open, setOpen] = useState<Section | null>('accessibility');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (visible) { setInitialPreferences(preferences); setDraft(preferences); setSaved(false); }
  }, [visible]);

  const change = (next: Partial<ReadingPreferences>) => {
    const updated = { ...draft, ...next };
    setDraft(updated);
    update(next);
    setSaved(false);
  };
  const save = () => setSaved(true);
  const cancel = () => { update(initialPreferences); setDraft(initialPreferences); setSaved(false); onClose(); };
  const section = (id: Section, title: string, children: React.ReactNode) => <View style={{ gap: spacing.md }}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open === id }} aria-expanded={open === id} onPress={() => setOpen(open === id ? null : id)}
      style={{ minHeight: 52, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <AppText variant="bodyBold" style={{ flex: 1 }}>{title}</AppText>
      <Feather name={open === id ? 'chevron-up' : 'chevron-down'} size={22} color={palette.inkSoft} accessible={false} />
    </Pressable>
    {open === id ? <View style={{ gap: spacing.md }}>{children}</View> : null}
  </View>;

  return <ConfirmationDialog visible={visible} title={t('appSettingsTitle')} onCancel={cancel} cancelLabel={t('dsCancel')} dismissOnBackdrop>
    {section('appearance', t('settingsAppearance'), <>
      <AppText variant="caption">{t('settingsAppearanceHint')}</AppText>
      <View style={{ gap: spacing.md }}>
        <Button label={t('settingsLight')} kind="secondary" selected={!draft.darkMode} icon={!draft.darkMode ? 'check-circle' : 'circle'} onPress={() => change({ darkMode: false })} />
        <Button label={t('settingsDark')} kind="secondary" selected={draft.darkMode} icon={draft.darkMode ? 'check-circle' : 'circle'} onPress={() => change({ darkMode: true })} />
      </View>
    </>)}
    {section('notifications', t('settingsNotifications'), <AccessibleSwitch label={t('settingsNotificationsToggle')} description={t('settingsNotificationsHint')} value={draft.notifications} onValueChange={notifications => change({ notifications })} />)}
    {section('accessibility', t('settingsAccessibility'), <>
      <AppText variant="bodyBold">{t('dsTextSize')}</AppText>
      {(['normal', 'large', 'extraLarge'] as TextMode[]).map(mode => <Button key={mode} label={t(`dsSize_${mode}`)} kind="secondary" selected={draft.textMode === mode} icon={draft.textMode === mode ? 'check-circle' : 'circle'} onPress={() => change({ textMode: mode })} />)}
      <AppText variant="caption">{t('dsSizePreview')}</AppText>
      <AccessibleSwitch label={t('dsHighContrast')} description={t('dsHighContrastHint')} value={draft.highContrast} onValueChange={highContrast => change({ highContrast })} />
    </>)}
    {section('privacy', t('settingsPrivacy'), <>
      <AccessibleSwitch label={t('settingsShareUsage')} description={t('settingsShareUsageHint')} value={draft.shareUsage} onValueChange={shareUsage => change({ shareUsage })} />
      <AccessibleSwitch label={t('settingsSaveHistory')} description={t('settingsSaveHistoryHint')} value={draft.saveHistory} onValueChange={saveHistory => change({ saveHistory })} />
    </>)}
    {section('about', t('settingsAbout'), <View style={{ gap: spacing.sm }}><AppText variant="bodyBold">KAKEHASHI 架け橋</AppText><AppText variant="caption">{t('settingsVersion', { version: '0.0.1' })}</AppText></View>)}
    {saved ? <AppText accessibilityLiveRegion="polite" style={{ color: palette.primary }}>{t('settingsSaved')}</AppText> : null}
    <Button label={t('settingsSave')} icon="check" onPress={save} />
  </ConfirmationDialog>;
}
