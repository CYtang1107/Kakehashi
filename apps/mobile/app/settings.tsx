import React, { useState } from 'react';
import { AppText, Button, Card, LangToggle, Screen } from '../src/ui';
import { ReadingSettings } from '../src/design-system/ReadingSettings';
import { AppSettings } from '../src/design-system/AppSettings';
import { router } from 'expo-router';
import { useAuth, type Role } from '../src/auth';
import { useI18n, type Key } from '../src/i18n';

export default function SettingsPage() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const accountRole = user && user.role !== 'her' ? user.role : null;
  const roleLabels: Record<Role, Key> = { her: 'roleHer', family: 'roleFamily', student: 'roleStudents', worker: 'roleHelpers' };
  const [settings, setSettings] = useState<'reading' | 'app' | null>(null);
  return <Screen requiresHome={false} roleSwitch={!accountRole} globalNav={accountRole ? undefined : 'settings'} header={{ title: t('hSettings'), sub: accountRole ? t(roleLabels[accountRole]) : undefined }}>
    {accountRole ? <Button label={t('authBackWorkspace')} icon="chevron-left" kind="tertiary" onPress={() => router.canGoBack() ? router.back() : router.replace(`/${accountRole}`)} /> : null}
    <Card>
      <AppText variant="section">{t('uxReadingAppearance')}</AppText>
      <AppText variant="caption">{t('dsSizePreview')}</AppText>
      <Button label={t('dsReadingSettings')} icon="type" kind="secondary" onPress={() => setSettings('reading')} />
    </Card>
    <Card><AppText variant="section">{t('uxLanguage')}</AppText><LangToggle /></Card>
    <Card><AppText variant="section">{t('uxGeneral')}</AppText>
      <Button label={t('appSettingsTitle')} icon="settings" kind="secondary" onPress={() => setSettings('app')} />
    </Card>
    {accountRole ? <Card>
      <AppText variant="section">{t('authAccount')}</AppText>
      <AppText variant="caption">{user?.email}</AppText>
      <Button label={t('authLogout')} icon="log-out" kind="danger" onPress={() => { signOut(); router.replace('/roles'); }} />
    </Card> : null}
    <ReadingSettings visible={settings === 'reading'} onClose={() => setSettings(null)} />
    <AppSettings visible={settings === 'app'} onClose={() => setSettings(null)} />
  </Screen>;
}
