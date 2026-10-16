import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, LangToggle, Screen } from '../src/ui';
import { ReadingSettings } from '../src/design-system/ReadingSettings';
import { useI18n } from '../src/i18n';

export default function SettingsPage() {
  const { t } = useI18n();
  const [reading, setReading] = useState(false);
  return <Screen requiresHome={false} globalNav="settings" header={{ title: t('hSettings') }}>
    <View style={{ gap: 18 }}>
      <AppText variant="section">{t('hPreferences')}</AppText>
      <Button label={t('dsReadingSettings')} icon="type" kind="secondary" onPress={() => setReading(true)} />
      <LangToggle />
      <ReadingSettings visible={reading} onClose={() => setReading(false)} />
    </View>
  </Screen>;
}
