import React from 'react';
import { AppText, Button, StatusBanner } from '../../ui';
import { useHomeDemo } from './store';
import { useHomeCopy } from './copy';
export function DemoStatus() {
  const store = useHomeDemo(), { c } = useHomeCopy();
  if (store.status === 'loading') return <AppText accessibilityLiveRegion="polite">{c('loading')}</AppText>;
  if (store.status === 'loadError') return <><StatusBanner tone="error" title={c('loadError')} action={{ label: c('retry'), onPress: store.retryLoad }} /><Button kind="secondary" label={c('temporary')} onPress={store.continueSession} /></>;
  if (store.status === 'error') return <StatusBanner tone="error" title={c('saveError')} action={{ label: c('retry'), onPress: store.retrySave }} />;
  if (store.status === 'session') return <StatusBanner tone="warning" title={c('session')} />;
  if (store.status === 'saving') return <AppText accessibilityLiveRegion="polite">{c('saving')}</AppText>;
  return null;
}
