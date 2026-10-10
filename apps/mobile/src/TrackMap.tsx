import React from 'react';
import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { Item } from '@kakehashi/shared';
import { API_BASE } from './api';
import { useI18n } from './i18n';

// An item has something to track once it has left her home, or while it is being delivered.
export const isTrackable = (item: Item) => Boolean(item.delivery) || item.journey.some((j) => j.pt && !['home', 'sorted'].includes(j.stage));

// "Where is it now?": the server's tracking page for one item (journey stops, the new owner's area, a live delivery).
export function TrackMap({ item, height = 240 }: { item: Item; height?: number }) {
  const { lang } = useI18n();
  // Reload when the journey changes (a new step, or a delivery starting or ending).
  const version = `${item.journey.length}-${item.delivery?.startedAt ?? ''}`;
  const url = `${API_BASE}/track/${item.id}?lang=${lang}&v=${encodeURIComponent(version)}`;
  return (
    <View style={{ width: '100%', height, borderRadius: 14, overflow: 'hidden', backgroundColor: '#EEF0EA' }}>
      {Platform.OS === 'web'
        ? React.createElement('iframe', { key: url, src: url, title: 'Where is it now', style: { border: 0, width: '100%', height: '100%' } })
        : <WebView key={url} source={{ uri: url }} style={{ flex: 1 }} originWhitelist={['*']} />}
    </View>
  );
}
