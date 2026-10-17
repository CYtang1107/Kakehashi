import React from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { HerPage } from '../her/HerPage';
import { AppText, Button, StatusBanner } from '../ui';
import { useI18n, type Key } from '../i18n';
import { useEverCircle } from './store';

export function FeaturePage({ title, description, children, footer, scrollRef }: {
  title: Key; description?: Key; children: React.ReactNode; footer?: React.ReactNode; scrollRef?: React.Ref<ScrollView>;
}) {
  const { t } = useI18n(); const store = useEverCircle();
  const loading = store.storageStatus === 'loading', failed = store.storageStatus === 'loadError';
  return <HerPage back requiresHome={false} title={t(title)} description={description ? t(description) : undefined}
    footer={!loading && !failed ? footer : undefined} scrollRef={scrollRef}>
    {loading ? <AppText>{t('dsLoading')}</AppText> : failed ? <View style={{ gap: 16 }}>
      <StatusBanner tone="error" title={t('cLoadError')} action={{ label: t('retry'), onPress: store.retryLoad }} />
      <Button label={t('cContinueSession')} kind="secondary" onPress={store.continueSession} />
    </View> : <>
      {store.storageStatus === 'error' ? <StatusBanner tone="error" title={t('cStorageError')} action={{ label: t('cRetrySave'), onPress: store.retrySave }} /> : null}
      {store.storageStatus === 'session' ? <StatusBanner tone="warning" title={t('cSession')} /> : null}
      {store.storageStatus === 'saving' ? <AppText accessibilityLiveRegion="polite">{t('cSaving')}</AppText> : null}
      {children}
    </>}
  </HerPage>;
}
function Failure() { const { t } = useI18n(); return <HerPage requiresHome={false} title={t('cTitle')}>
  <StatusBanner tone="error" title={t('cError')} /><Button label={t('hReturn')} onPress={() => router.replace('/her')} />
</HerPage>; }
export class FeatureBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <Failure /> : this.props.children; }
}
