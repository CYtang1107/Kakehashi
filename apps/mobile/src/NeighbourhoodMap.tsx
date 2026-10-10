import React from 'react';
import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { API_BASE } from './api';
import { useI18n } from './i18n';

// Neighbourhood map: the server's map page (MapLibre, 3D buildings) in an iframe on web and a WebView on phones.
export function NeighbourhoodMap({ homeId }: { homeId: string }) {
  const { lang } = useI18n();
  const url = `${API_BASE}/map/${homeId}?lang=${lang}`;
  return (
    <View style={{ width: '100%', aspectRatio: 0.95, borderRadius: 14, overflow: 'hidden', backgroundColor: '#E9E6DD' }}>
      {Platform.OS === 'web'
        ? React.createElement('iframe', { src: url, title: 'Neighbourhood map', style: { border: 0, width: '100%', height: '100%' } })
        : <WebView source={{ uri: url }} style={{ flex: 1 }} originWhitelist={['*']} />}
    </View>
  );
}
