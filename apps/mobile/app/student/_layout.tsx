import React from 'react';
import { Tabs } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { RoleTabBar } from '../../src/design-system/RoleTabBar';
export default function RoleTabs() {
  const { t } = useI18n();
  return <Tabs backBehavior="history" screenOptions={{ headerShown: false }} tabBar={props => <RoleTabBar {...props} icons={{"index":"check-square","add":"camera","wallet":"credit-card","team":"award"}} />}>
    <Tabs.Screen name="index" options={{ title: t('tabVisit') }} />
    <Tabs.Screen name="add" options={{ title: t('tabAdd') }} />
    <Tabs.Screen name="wallet" options={{ title: t('tabWallet') }} />
    <Tabs.Screen name="team" options={{ title: t('tabTeam') }} />
  </Tabs>;
}
