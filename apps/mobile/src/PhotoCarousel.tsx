import { useAccessibilityPreferences } from './design-system/preferences';
import { AppText as Text } from './design-system/AppText';
import React, { useEffect, useState, useRef } from 'react';
import { Image, Pressable, ScrollView, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { pick, type Item, type ItemPhoto, type PhotoKind } from '@kakehashi/shared';
import { Button, Card, Field } from './ui';
import { useData } from './data';
import { useI18n, type Key } from './i18n';
import { api, fileUrl } from './api';
import { colors, fonts, type } from './theme';

// Every picture of an item: the album, plus the single photo older items were logged with.
export function itemPhotos(item: Pick<Item, 'photos' | 'photoUrl'>): ItemPhoto[] {
  const album = item.photos ?? [];
  return item.photoUrl && !album.some((p) => p.url === item.photoUrl)
    ? [{ id: 'main', url: item.photoUrl, kind: 'photo', by: '', at: '' }, ...album]
    : album;
}

// Swipe through an item's pictures, like a post. Illustrations always carry a label saying they are not real photos.
export function PhotoCarousel({ item, dark, onMakePixel }: { item: Pick<Item, 'name' | 'photos' | 'photoUrl' | 'icon'>; dark?: boolean; onMakePixel?: (photoId: string) => void }) {
  const { palette: colors } = useAccessibilityPreferences();
  const { t, lang } = useI18n();
  const photos = itemPhotos(item);
  const scroll = useRef<ScrollView>(null);
  const [w, setW] = useState(0);
  const [i, setI] = useState(0);
  const page = useRef(0);
  useEffect(() => {
    page.current = Math.min(page.current, Math.max(0, photos.length - 1));
    setI(page.current);
    if (w) scroll.current?.scrollTo({ x: page.current * w, animated: false });
  }, [w, photos.length]);
  if (photos.length === 0) return null;
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!w) return;
    page.current = Math.max(0, Math.min(photos.length - 1, Math.round(e.nativeEvent.contentOffset.x / w)));
    setI(page.current);
  };
  const cur = photos.at(Math.min(i, photos.length - 1))!;
  const caption = pick(lang, cur.caption, cur.captionJa);
  const ink = dark ? '#F5EBDD' : colors.ink, soft = dark ? '#CDBFAE' : colors.inkSoft;
  return (
    <View style={{ gap: 8 }}>
      <View onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)} style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: colors.line }}>
        {w ? (
          <ScrollView ref={scroll} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
            {photos.map((p) => (
              <View key={p.id} style={{ width: w, aspectRatio: 4 / 3 }}>
                <Image source={{ uri: fileUrl(p.url) }} style={{ width: '100%', height: '100%' }} resizeMode="cover" accessibilityLabel={pick(lang, p.caption, p.captionJa) || item.name} />
                {p.kind !== 'photo' ? (
                  <View style={{ position: 'absolute', left: 10, top: 10, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, backgroundColor: p.kind === 'illustration' ? 'rgba(181,86,43,0.92)' : 'rgba(28,35,48,0.75)' }}>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: '#fff' }}>{t(p.kind === 'illustration' ? 'photoIllustrationBadge' : 'photoOldBadge')}</Text>
                  </View>
                ) : null}
                {photos.length > 1 ? (
                  <View style={{ position: 'absolute', right: 10, top: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: 'rgba(28,35,48,0.65)' }}>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: '#fff' }}>{photos.indexOf(p) + 1}/{photos.length}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
        ) : <View style={{ aspectRatio: 4 / 3 }} />}
      </View>
      {photos.length > 1 ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          {photos.map((p, k) => <View key={p.id} style={{ width: k === i ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: k === i ? colors.ai : (dark ? '#5C544C' : colors.line) }} />)}
        </View>
      ) : null}
      {photos.length > 1 ? <View style={{ gap: 8 }}><Button label={t('previous')} kind="secondary" disabled={i === 0} onPress={() => scroll.current?.scrollTo({ x: (i - 1) * w, animated: false })} /><Button label={t('next')} kind="secondary" disabled={i >= photos.length - 1} onPress={() => scroll.current?.scrollTo({ x: (i + 1) * w, animated: false })} /></View> : null}
      {caption ? <Text style={{ fontFamily: fonts.medium, fontSize: 18, lineHeight: 28, color: ink }}>{caption}</Text> : null}
      {cur.kind === 'illustration' ? <Text style={{ fontFamily: fonts.medium, fontSize: 17, lineHeight: 27, color: soft }}>{t('photoIllustrationNote')}</Text> : null}
      {onMakePixel && cur.kind === 'photo' && item.icon?.fromId !== cur.id ? (
        <Pressable accessibilityRole="button" onPress={() => onMakePixel(cur.id)} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 56, paddingVertical: 12 }}>
          <Feather name="grid" size={15} color={colors.ai} />
          <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.ai }}>{t('photoMakePixel')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// Students: add a picture to the item's album, saying what kind of picture it is.
export function AddPhotoCard({ item, author }: { item: Item; author?: string }) {
  const { palette: colors } = useAccessibilityPreferences();
  const { data, replaceItem, showToast } = useData();
  const { t } = useI18n();
  const [kind, setKind] = useState<PhotoKind>('photo');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const by = author ?? data?.home.students.find((s) => s.role === 'pair')?.name ?? 'Student';

  const add = async (camera: boolean) => {
    setError(null);
    if (camera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { setError(t('cameraOff')); return; }
    }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6, base64: true, allowsEditing: false };
    const r = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    const a = r.canceled ? null : r.assets[0];
    if (!a?.base64) return;
    setBusy(true);
    try {
      replaceItem(await api.addPhoto(item.id, { base64: a.base64, mime: a.mimeType ?? 'image/jpeg', kind, caption: caption.trim() || undefined, by }));
      setCaption(''); showToast(t('photoAdded'));
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };

  return (
    <Card>
      <Text style={type.section}>{t('photoAddTitle')}</Text>
      <Text style={type.caption}>{t('photoAddLead')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(['photo', 'old-photo', 'illustration'] as const).map((k) => (
          <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: kind === k }} aria-checked={kind === k} onPress={() => setKind(k)}
            style={{ maxWidth: '100%', paddingHorizontal: 12, paddingVertical: 12, minHeight: 56, borderRadius: 12, borderWidth: 1, borderColor: kind === k ? colors.ai : colors.line, backgroundColor: kind === k ? colors.aiTint : colors.sheet }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: kind === k ? colors.ai : colors.ink }}>{t(`photoKind_${k}` as Key)}</Text>
          </Pressable>
        ))}
      </View>
      {kind === 'illustration' ? <Text style={[type.caption, { color: colors.kaki }]}>{t('photoIllustrationNote')}</Text> : null}
      <Field label={t('photoCaption')} value={caption} onChangeText={setCaption} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <View style={{ flexBasis: 180, flexGrow: 1, flexShrink: 1, minWidth: 0 }}><Button label={t('takePhoto')} icon="camera" busy={busy} onPress={() => add(true)} /></View>
        <View style={{ flexBasis: 180, flexGrow: 1, flexShrink: 1, minWidth: 0 }}><Button label={t('choosePhoto')} kind="secondary" icon="image" busy={busy} onPress={() => add(false)} /></View>
      </View>
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
    </Card>
  );
}

export const PhotoIcon = () => <Feather name="image" size={16} color={colors.ai} />;
