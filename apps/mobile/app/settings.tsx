import React, { useState } from 'react';
import { AppText, Button, Card, LangToggle, Screen } from '../src/ui';
import { ReadingSettings } from '../src/design-system/ReadingSettings';
import { AppSettings } from '../src/design-system/AppSettings';
import { useI18n } from '../src/i18n';

export default function SettingsPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<'reading' | 'app' | null>(null);
  return <Screen requiresHome={false} globalNav="settings" header={{ title: t('hSettings') }}>
    <Card>
      <AppText variant="section">{t('uxReadingAppearance')}</AppText>
      <AppText variant="caption">{t('dsSizePreview')}</AppText>
      <Button label={t('dsReadingSettings')} icon="type" kind="secondary" onPress={() => setSettings('reading')} />
    </Card>
    <Card><AppText variant="section">{t('uxLanguage')}</AppText><LangToggle /></Card>
    <Card><AppText variant="section">{t('uxGeneral')}</AppText>
      <Button label={t('appSettingsTitle')} icon="settings" kind="secondary" onPress={() => setSettings('app')} />
    </Card>
    <ReadingSettings visible={settings === 'reading'} onClose={() => setSettings(null)} />
    <AppSettings visible={settings === 'app'} onClose={() => setSettings(null)} />
  </Screen>;
}
