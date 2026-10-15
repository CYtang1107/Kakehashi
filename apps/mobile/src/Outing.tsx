import { AppText as Text } from './design-system/AppText';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { outingIsLive, pick, type Outing } from '@kakehashi/shared';
import { StatusBanner, Button, Card } from './ui';
import { useData } from './data';
import { useI18n } from './i18n';
import { api } from './api';
import { colors, fonts, type } from './theme';

const SEND_EVERY_MS = 15000;

// Student: share the walk to an activity with the family, only after she agrees for this outing.
// Uses this phone's location while the screen is open; ending the outing deletes the route.
export function OutingCard() {
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(0);
  const watch = useRef<Location.LocationSubscription | null>(null);
  const lastSent = useRef(0);

  const live = data?.home.outings.find((o) => outingIsLive(o, Date.now()));
  const stopWatch = () => { watch.current?.remove(); watch.current = null; };
  useEffect(() => stopWatch, []);

  if (!data) return null;
  const { home } = data;
  const student = home.students.find((s) => s.role === 'pair')?.name ?? 'Student';
  const going = home.activities.filter((a) => a.status === 'accepted' && a.placeId);

  const startWatch = async (o: Outing) => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) { setError(t('locationDenied')); return; }
    stopWatch();
    watch.current = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, timeInterval: SEND_EVERY_MS, distanceInterval: 15 }, (pos) => {
      if (Date.now() - lastSent.current < SEND_EVERY_MS / 2) return;
      lastSent.current = Date.now();
      api.outingFix(home.id, o.id, pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy ?? undefined)
        .then(() => { setSent((n) => n + 1); setError(null); })
        .catch((e) => setError(e instanceof Error ? e.message : String(e)));
    });
  };

  const start = async (activityId: string) => {
    setBusy(true); setError(null);
    try {
      const o = await api.startOuting(home.id, activityId, student);
      await refresh();
      showToast(t('outingStarted'));
      await startWatch(o);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };
  const end = async (o: Outing) => {
    setBusy(true);
    try { stopWatch(); await api.endOuting(home.id, o.id); await refresh(); setAgreed(false); setSent(0); showToast(t('outingEnded')); }
    finally { setBusy(false); }
  };

  return (
    <Card>
      <Text style={type.section}>{t('outingTitle')}</Text>
      <Text style={type.caption}>{t('outingLead')}</Text>
      {live ? (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.kaki }} />
            <Text style={[type.bodyBold, { flex: 1 }]}>{t('outingLiveNow', { place: home.places.find((p) => p.id === live.placeId)?.nameJa ?? '' })}</Text>
          </View>
          <Text style={type.caption}>
            {live.simulated ? t('outingSimulated') : watch.current ? t('outingSending', { n: sent }) : t('outingPaused')}
          </Text>
          {!live.simulated && !watch.current ? <Button label={t('outingResume')} kind="secondary" icon="navigation" onPress={() => startWatch(live).catch(() => setError(t('rLoadError')))} /> : null}
          <Button label={t('outingEnd')} icon="square" busy={busy} onPress={() => end(live)} />
        </>
      ) : going.length ? (
        <>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => setAgreed(!agreed)} style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center',  flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'flex-start' }}>
            <Feather name={agreed ? 'check-square' : 'square'} size={20} color={agreed ? colors.moss : colors.inkSoft} />
            <Text style={[type.body, { flex: 1 }]}>{t('outingConsent')}</Text>
          </Pressable>
          {going.map((a) => (
            <Button key={a.id} label={t('outingStart', { what: pick(lang, a.title, a.titleJa) })} kind="secondary" icon="navigation" busy={busy} disabled={!agreed} onPress={() => start(a.id)} />
          ))}
        </>
      ) : (
        <Text style={type.caption}>{t('outingNone')}</Text>
      )}
      {error ? <StatusBanner tone="error" title={error} /> : null}
    </Card>
  );
}

// Family: a banner while an outing is live, pointing to the neighbourhood map.
export function LiveOutingBanner({ onOpenMap }: { onOpenMap?: () => void }) {
  const { data } = useData();
  const { t, lang } = useI18n();
  if (!data) return null;
  const live = data.home.outings.find((o) => outingIsLive(o, Date.now()));
  if (!live) return null;
  const act = data.home.activities.find((a) => a.id === live.activityId);
  const place = data.home.places.find((p) => p.id === live.placeId);
  return (
    <Pressable accessibilityRole="button" onPress={onOpenMap} disabled={!onOpenMap}
      style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.kakiTint, }}>
      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.kaki }} />
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.kaki }} >{t('outingFamily', { by: live.by, what: act ? pick(lang, act.title, act.titleJa) : '', place: place?.nameJa ?? '' })}</Text>
        <Text style={{ fontFamily: fonts.medium, fontSize: 17, color: colors.inkSoft }}>{t('outingFamilyNote')}{live.simulated ? ` ${t('outingSimulatedShort')}` : ''}</Text>
      </View>
      {onOpenMap ? <Feather name="chevron-right" size={18} color={colors.kaki} /> : null}
    </Pressable>
  );
}
