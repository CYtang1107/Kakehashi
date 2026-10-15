import { AppText as Text } from './design-system/AppText';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Item } from '@kakehashi/shared';
import { Button, Card, Pill, formatDate } from './ui';
import { useData } from './data';
import { useI18n } from './i18n';
import { api } from './api';
import { itemPhotos } from './PhotoCarousel';
import { colors, fonts, type } from './theme';

// Sharing one story on the public feed: only with her consent, named as she chooses, and she can withdraw.
// Students approve messages from visitors before they show (and read them to her on visits).
export function ShareCard({ item, mode }: { item: Item; mode: 'student' | 'family' | 'her' }) {
  const { replaceItem, showToast } = useData();
  const { t, lang } = useI18n();
  const [name, setName] = useState<'first' | 'anonymous'>(item.share?.name ?? 'anonymous');
  const [audio, setAudio] = useState(item.share?.audio ?? false);
  const [photos, setPhotos] = useState(item.share?.photos ?? true);
  // Only photos of the item itself can go public, with her OK; old family photos and illustrations stay with the family.
  const hasPhotos = itemPhotos(item).some((p) => p.kind === 'photo');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasStory = Boolean(item.story || item.storyJa);
  const pending = (item.comments ?? []).filter((c) => c.status === 'pending');
  const shown = (item.comments ?? []).filter((c) => c.status === 'shown');

  const run = async (key: string, fn: () => Promise<Item>, done?: string) => {
    setBusy(key); setError(null);
    try { replaceItem(await fn()); if (done) showToast(done); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save.'); }
    finally { setBusy(null); }
  };

  if (mode === 'family') {
    return (
      <Card>
        <Text style={type.section}>{t('shareTitle')}</Text>
        <Text style={type.body}>{item.share ? t('sharedOn', { date: formatDate(item.share.at, lang) }) : t('notShared')}</Text>
        {shown.map((c) => <Text key={c.id} style={type.caption}>{c.from || t('feedAnon')}: “{c.message}”</Text>)}
      </Card>
    );
  }

  return (
    <Card>
      <Text style={type.section}>{t('shareTitle')}</Text>
      <Text style={type.caption}>{t(mode === 'her' ? 'hSharingBody' : 'shareLead')}</Text>
      {item.share ? (
        <>
          <Pill label={t('sharedOn', { date: formatDate(item.share.at, lang) })} color={colors.moss} bg={colors.mossTint} />
          <Text style={type.caption}>{item.share.name === 'first' ? t('shareNameFirst') : t('shareNameAnon')}{item.share.audio ? ` · ${t('shareVoice')}` : ''}{item.share.photos ? ` · ${t('sharePhotos')}` : ''}</Text>
          <Button label={t('shareWithdraw')} kind="secondary" icon="eye-off" busy={busy === 'share'} onPress={() => run('share', () => api.shareStory(item.id, { share: false }), t('saved'))} />
        </>
      ) : hasStory ? (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['anonymous', 'first'] as const).map((n) => (
              <Chip key={n} label={n === 'first' ? t('shareNameFirst') : t('shareNameAnon')} on={name === n} onPress={() => setName(n)} />
            ))}
            {item.audioUrl ? <Chip label={t('shareVoice')} on={audio} onPress={() => setAudio(!audio)} /> : null}
            {hasPhotos ? <Chip label={t('sharePhotos')} on={photos} onPress={() => setPhotos(!photos)} /> : null}
          </View>
          <Button label={t(mode === 'her' ? 'hPublish' : 'shareAgree')} icon="check" busy={busy === 'share'} onPress={() => run('share', () => api.shareStory(item.id, { share: true, name, audio, photos: hasPhotos && photos }), t('saved'))} />
        </>
      ) : (
        <Text style={type.caption}>{t('shareNeedsStory')}</Text>
      )}

      {pending.length && mode === 'student' ? (
        <View style={{ gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
          <Text style={type.eyebrow}>{t('messagesWaiting', { n: pending.length })}</Text>
          {pending.map((c) => (
            <View key={c.id} style={{ gap: 6 }}>
              <Text style={type.body}><Text style={type.bodyBold}>{c.from || t('feedAnon')}: </Text>{c.message}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button label={t('showMessage')} kind="secondary" icon="check" busy={busy === c.id} onPress={() => run(c.id, () => api.moderate(item.id, c.id, 'shown'))} />
                <Button label={t('hideMessage')} kind="secondary" icon="x" onPress={() => run(c.id, () => api.moderate(item.id, c.id, 'hidden'))} />
              </View>
            </View>
          ))}
        </View>
      ) : null}
      {shown.length ? <Text style={type.caption}>{t('messagesShown', { n: shown.length })}</Text> : null}
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
    </Card>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 12, minHeight: 56, borderRadius: 12, borderWidth: 1, borderColor: on ? colors.ai : colors.line, backgroundColor: on ? colors.aiTint : colors.sheet }}>
      {on ? <Feather name="check" size={14} color={colors.ai} /> : null}
      <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: on ? colors.ai : colors.ink }}>{label}</Text>
    </Pressable>
  );
}
