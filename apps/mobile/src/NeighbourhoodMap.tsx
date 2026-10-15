import { AppText as Text, Button } from './ui';
import React, { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { NEARBY_KINDS, NEARBY_SOURCE, metresBetween, pick, walkMinutes, type Place, type PlaceKind } from '@kakehashi/shared';
import { API_BASE } from './api';
import { Card, formatDate } from './ui';
import { useData } from './data';
import { useI18n, type Key } from './i18n';
import { colors, fonts, type } from './theme';

// Same colours as the map page's pins and dots.
export const placeColor: Record<PlaceKind, string> = {
  home: '#2B4C7E', community: '#B5562B', care: '#9A6A12', clinic: '#4F6B3A', pharmacy: '#3E7C8A', shop: '#7A4A6E', library: '#5B6273',
};
const directions = (p: Place) => Linking.openURL(`https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${p.lat},${p.lng}`);

// The server's map page (MapLibre) in an iframe on web and a WebView on phones. `focus` flies to a place.
export function NeighbourhoodMap({ homeId, focus, fill }: { homeId: string; focus?: { id: string; n: number }; fill?: boolean }) {
  const { lang, t } = useI18n();
  const url = `${API_BASE}/map/${homeId}?lang=${lang}`;
  const frame = useRef<HTMLIFrameElement | null>(null);
  const web = useRef<WebView>(null);
  useEffect(() => {
    if (!focus) return;
    if (Platform.OS === 'web') frame.current?.contentWindow?.postMessage(JSON.stringify({ focus: focus.id }), '*');
    else web.current?.injectJavaScript(`window.__focus && window.__focus(${JSON.stringify(focus.id)}); true;`);
  }, [focus?.n]);
  return (
    <View style={{ width: '100%', ...(fill ? { flex: 1 } : { height: 340 }), borderRadius: 14, overflow: 'hidden', backgroundColor: '#EEF0EA' }}>
      {Platform.OS === 'web'
        ? React.createElement('iframe', { ref: frame, src: url, title: t('viewMap'), style: { border: 0, width: '100%', height: '100%' } })
        : <WebView ref={web} source={{ uri: url }} style={{ flex: 1 }} originWhitelist={['*']} />}
    </View>
  );
}

// EVE-style list under the map: her places (A, B, C…) with what she does there, then the nearest of each kind.
export function NearbyList({ onFocus }: { onFocus: (id: string) => void }) {
  const { data } = useData();
  const { t, lang } = useI18n();
  const [kind, setKind] = useState<Exclude<PlaceKind, 'home'>>('clinic');
  if (!data) return null;
  const { home } = data;
  const me = home.places.find((p) => p.kind === 'home');
  if (!me) return null;
  const mine = home.places.filter((p) => p.mine);
  const others = home.places.filter((p) => p.kind !== 'home' && !p.mine);
  const nearest = others.filter((p) => p.kind === kind).sort((a, b) => metresBetween(me, a) - metresBetween(me, b)).slice(0, 5);

  const row = (p: Place, badge: string) => {
    const acts = home.activities.filter((a) => a.placeId === p.id && a.status !== 'not-now');
    return (
      <Card key={p.id} style={{ gap: 12 }}>
        <Pressable accessibilityRole="button" onPress={() => onFocus(p.id)} style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: placeColor[p.kind], alignItems: 'center', justifyContent: 'center' }}>
            {badge ? <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.sheet }}>{badge}</Text>
              : <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.sheet }} />}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={type.bodyBold}>{pick(lang, p.name, p.nameJa)}</Text>
            <Text style={type.caption}>{t(`kind_${p.kind}` as Key)} · {t('walkMin', { n: walkMinutes(me, p) })}{p.hours ? ` · ${p.hours}` : ''}</Text>
            {acts.map((a) => (
              <Text key={a.id} style={[type.caption, { color: colors.ink }]}>
                {pick(lang, a.title, a.titleJa)} · {formatDate(a.date.slice(0, 10), lang)}{a.companion ? ` · ${a.companion}` : ''}
              </Text>
            ))}
          </View>
        </Pressable>
        <Button label={t('directions')} icon="navigation" kind="secondary" onPress={() => directions(p)} />
      </Card>
    );
  };

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text style={type.section}>{t('herPlacesTitle')}</Text>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(NEARBY_SOURCE.url)} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48, gap: 4 }}>
          <Text style={[type.caption, { color: colors.ai }]}>OpenStreetMap</Text>
          <Feather name="external-link" size={13} color={colors.ai} />
        </Pressable>
      </View>
      {mine.map((p, i) => row(p, String.fromCharCode(65 + i)))}

      <Text style={[type.section, { marginTop: 6 }]}>{t('moreNearby')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {NEARBY_KINDS.map((k) => {
          const n = others.filter((p) => p.kind === k).length;
          if (!n) return null;
          const on = kind === k;
          return (
            <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => setKind(k)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 12, minHeight: 56, borderRadius: 12, borderWidth: 1, borderColor: on ? placeColor[k] : colors.line, backgroundColor: on ? colors.sheet : colors.paper }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: placeColor[k] }} />
              <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.ink }}>{t(`kind_${k}` as Key)} · {n}</Text>
            </Pressable>
          );
        })}
      </View>
      {nearest.map((p) => row(p, ''))}
      <Text style={[type.caption, { textAlign: 'center' }]}>{t('nearbySource', { date: formatDate(NEARBY_SOURCE.copied, lang) })}</Text>
    </View>
  );
}
