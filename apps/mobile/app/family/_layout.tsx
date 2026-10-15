import React from 'react';
import { Tabs } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { RoleTabBar } from '../../src/design-system/RoleTabBar';
export default function RoleTabs() {
  const { t } = useI18n();
  return <Tabs backBehavior="history" screenOptions={{ headerShown: false }} tabBar={props => <RoleTabBar {...props} icons={{"index":"home","house":"box","plan":"credit-card","reports":"file-text"}} />}>
    <Tabs.Screen name="index" options={{ title: t('tabHome') }} />
    <Tabs.Screen name="house" options={{ title: t('tabHouse') }} />
    <Tabs.Screen name="plan" options={{ title: t('tabPlan') }} />
    <Tabs.Screen name="reports" options={{ title: t('tabReports') }} />
  </Tabs>;
}
