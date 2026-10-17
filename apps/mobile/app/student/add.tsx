import { useAccessibilityPreferences } from '../../src/design-system/preferences';
import { AppText as Text } from '../../src/design-system/AppText';
import React, { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import type { Estimate } from '@kakehashi/shared';
import { StatusBanner, Button, Card, Field, Fold, Screen } from '../../src/ui';
import { useData } from '../../src/data';
import { useI18n } from '../../src/i18n';
import { api } from '../../src/api';
import { fonts, type, yen } from '../../src/theme';

type Photo = { uri: string; base64: string; mime: string };

export default function AddItem() {
  const { palette: colors } = useAccessibilityPreferences();
  const { data, replaceItem, showToast } = useData();
  const { t, lang } = useI18n();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState<string | undefined>();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [busy, setBusy] = useState<'estimate' | 'save' | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!data) return <Screen>{null}</Screen>;
  const room = roomId ?? data.home.rooms.find((r) => r.status === 'now')?.id ?? data.home.rooms[0].id;

  const pick = async (camera: boolean) => {
    setError(null);
    try {
      if (camera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) { setError(t('rCameraDenied')); return; }
      }
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.5, base64: true, allowsEditing: false };
      const r = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      const a = r.assets?.[0];
      if (r.canceled || !a?.base64) return;
      setPhoto({ uri: a.uri, base64: a.base64, mime: a.mimeType ?? 'image/jpeg' });
      setEstimate(null);
    } catch (e) {
      setError(t('rSaveError'));
    }
  };

  const getEstimate = async () => {
    setBusy('estimate');
    setError(null);
    try { setEstimate(await api.estimate({ base64: photo?.base64, mime: photo?.mime, name: name.trim() || undefined })); }
    catch (e) { setError(t('rSaveError')); }
    finally { setBusy(null); }
  };

  const save = async () => {
    setBusy('save');
    setError(null);
    try {
      const item = await api.addItem({ homeId: data.home.id, roomId: room, name: name.trim(), photo: photo ? { base64: photo.base64, mime: photo.mime } : undefined, estimate: estimate ?? undefined });
      replaceItem(item);
      showToast(t('added'));
      setPhoto(null); setName(''); setEstimate(null);
      router.push(`/item/${item.id}?as=student`);
    } catch (e) {
      setError(t('rSaveError'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen header={{ title: t('addTitle') }}>

      <Card>
        <Text variant="bodyBold">{t('rMemoryFirst')}</Text>
        {photo ? <Image source={{ uri: photo.uri }} style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 12 }} resizeMode="cover" accessibilityLabel={t('rItemPhoto')} /> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <View style={{ flexBasis: 180, flexGrow: 1, flexShrink: 1, minWidth: 0 }}><Button label={t('takePhoto')} icon="camera" kind="secondary" onPress={() => pick(true)} /></View>
          <View style={{ flexBasis: 180, flexGrow: 1, flexShrink: 1, minWidth: 0 }}><Button label={t('choosePhoto')} icon="image" kind="secondary" onPress={() => pick(false)} /></View>
        </View>
        <Field label={t('itemName')} value={name} onChangeText={setName} placeholder={t('rItemExample')} />
        <Text style={type.bodyBold}>{t('room')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {data.home.rooms.map((r) => (
            <Pressable key={r.id} accessibilityRole="radio" accessibilityState={{ checked: r.id === room }} aria-checked={r.id === room} onPress={() => setRoomId(r.id)}
              style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center',  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: r.id === room ? colors.ai : colors.line, backgroundColor: r.id === room ? colors.aiTint : colors.sheet }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 17, color: r.id === room ? colors.ai : colors.ink }}>{lang === 'ja' ? r.nameJa : r.name}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Fold title={t('whatWorth')} icon="tag" summary={t('worthHint')}>
      <Card>
        <Text style={type.section}>{t('whatWorth')}</Text>
        <Text style={type.caption}>{t('worthHint')}</Text>
        <Text style={type.caption}>{data.services.ai === 'claude' ? t('estimateBy', { source: t('sourceClaude') }) : t('estimateBy', { source: t('sourceOffline') })}</Text>
        {estimate ? (
          <View style={{ gap: 4 }}>
            <Text style={type.section}>{estimate.priceHighJpy > 0 ? `${yen(estimate.priceLowJpy)} – ${yen(estimate.priceHighJpy)}` : '¥0'}</Text>
            <Text style={type.bodyBold}>{estimate.category}</Text>
            <Text style={type.caption}>{t('routeIfLetGo', { route: t(`decision_${estimate.routeIfLetGo}`) })}</Text>
            <Text style={type.caption}>{estimate.reason}</Text>
          </View>
        ) : null}
        <Button label={busy === 'estimate' ? t('estimating') : t('getEstimate')} kind="secondary" icon="zap" busy={busy === 'estimate'} disabled={busy !== null || (!photo && !name.trim())} onPress={getEstimate} />
      </Card>
      </Fold>
      <Button label={t('addItem')} icon="plus" busy={busy === 'save'} disabled={busy !== null || !name.trim()} onPress={save} />
      {error ? <StatusBanner tone="error" title={error} /> : null}

    </Screen>
  );
}
