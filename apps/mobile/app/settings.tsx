import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, LangToggle, Screen } from '../src/ui';
import { AppSettings } from '../src/design-system/AppSettings';
import { useI18n } from '../src/i18n';

export default function SettingsPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState(false);
  return <Screen requiresHome={false} globalNav="settings" header={{ title: t('hSettings') }}>
    <View style={{ gap: 18 }}>
      <AppText variant="section">{t('hPreferences')}</AppText>
      <Button label={t('appSettingsTitle')} icon="settings" kind="secondary" onPress={() => setSettings(true)} />
      <LangToggle />
      <AppSettings visible={settings} onClose={() => setSettings(false)} />
    </View>
  </Screen>;
}
