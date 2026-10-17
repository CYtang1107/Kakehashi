import { AppText as Text } from '../../src/design-system/AppText';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Share, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { pick, type PublicStory } from '@kakehashi/shared';
import { Button, ConfirmationDialog, Field, StatusBanner, Screen, formatDate, Fold } from '../../src/ui';
import { StoryPlayer } from '../../src/Audio';
import { PixelIcon } from '../../src/PixelIcon';
import { PhotoCarousel } from '../../src/PhotoCarousel';
import { spriteFor } from '../../src/pixelArt';
import { StoryGlobe } from '../../src/StoryGlobe';
import { useI18n, type Key } from '../../src/i18n';
import { api } from '../../src/api';
import { elevation, fonts, radii, spacing, type } from '../../src/theme';
import { useAccessibilityPreferences } from '../../src/design-system/preferences';
import { useResponsiveLayout } from '../../src/design-system/useResponsiveLayout';
import { CareLoadingScreen } from '../../src/design-system/CareLoadingScreen';

// Public story feed (物語の広場): stories older people agreed to share, shown like posts, for anyone to read.
export default function StoriesFeed() {
  const { t } = useI18n();
  return <Screen requiresHome={false} globalNav="home"
    header={{ eyebrow: t('feedEyebrow'), title: t('feedTitle'), sub: t('feedLead') }}>
    <StoriesFeedContent />
  </Screen>;
}

export function StoriesFeedContent() {
  const { palette: colors } = useAccessibilityPreferences();
  const { t, lang } = useI18n();
  const fit = false;
  const { reducedMotion } = useAccessibilityPreferences();
  const [stories, setStories] = useState<PublicStory[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { setError(null); try { setStories(await api.stories()); } catch { setError(t('rLoadError')); } }, [t]);
  useEffect(() => { load(); }, [load]);
  // A shared link (…/stories#sewing) opens at that story.
  useEffect(() => {
    if (!stories || Platform.OS !== 'web' || typeof window === 'undefined' || !window.location.hash) return;
    document.getElementById(`story-${window.location.hash.slice(1)}`)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }, [stories, reducedMotion]);

  return (
    <>
      {error ? <StatusBanner tone="error" title={error} action={{ label: t('retry'), onPress: load }} /> : null}
      {!stories && !error ? <CareLoadingScreen /> : null}
      {stories?.length ? <Fold title={t('uxExploreGlobe')} icon="globe" summary={t('globeHint')}>
        <View style={{ gap: 8, ...(fit ? { flex: 1, minHeight: 0 } : null) }}>
          <StoryGlobe fill={fit} height={300} stories={stories} selected={selected} onSelect={setSelected} labels={{ zoomIn: t('globeZoomIn'), zoomOut: t('globeZoomOut'), japan: t('globeJapan') }} />
          <Text style={[type.caption, { textAlign: 'center' }]}>{t('globeHint')}</Text>
          <Fold title={t('uxStoryDirectory')} icon="list">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {stories.map((st) => (
              <Pressable key={st.id} accessibilityRole="button" onPress={() => setSelected(st.id)}
                style={{ minHeight: 56, maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: st.id === selected ? colors.ai : colors.line, backgroundColor: st.id === selected ? colors.aiTint : colors.sheet }}>
                <PixelIcon sprite={spriteFor({ id: st.id, name: st.name, nameJa: st.nameJa, icon: st.icon })} size={22} />
                <Text style={{ fontFamily: fonts.medium, fontSize: 17, color: colors.ink }}>{pick(lang, st.name, st.nameJa)}</Text>
                {st.example ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#D9B26A' }} /> : null}
              </Pressable>
            ))}
          </View>
          </Fold>
          <Text style={type.caption}>{t('globeLegend')}</Text>
        </View>
      </Fold> : null}
        <>
          {stories?.map((s) => <StoryPost key={s.id} story={s} />)}
          {stories && stories.length === 0 ? <Text style={type.body}>{t('feedEmpty')}</Text> : null}
          <Text style={type.caption}>{t('feedRules')}</Text>
        </>

      {/* A story opened from the globe, with where it went */}
      <ConfirmationDialog visible={!!selected} title={t('feedTitle')} onCancel={() => { setSelected(null); load(); }}>
        {stories?.filter(st => st.id === selected).map(st => <StoryPost key={st.id} story={st} withJourney />)}
      </ConfirmationDialog>
    </>
  );
}

// Hearts this browser has sent, so a reader can take one back. Only a convenience: it may be empty.
const HEARTS_KEY = 'kakehashi-hearts';
function heartedIds(): string[] {
  try { return JSON.parse(globalThis.localStorage?.getItem(HEARTS_KEY) ?? '[]'); } catch { return []; }
}
function rememberHeart(id: string, on: boolean) {
  try { globalThis.localStorage?.setItem(HEARTS_KEY, JSON.stringify([...heartedIds().filter((x) => x !== id), ...(on ? [id] : [])])); } catch { /* not kept */ }
}

function StoryPost({ story, withJourney }: { story: PublicStory; withJourney?: boolean }) {
  const { palette: colors } = useAccessibilityPreferences();
  const { compact, cardPadding } = useResponsiveLayout();
  const { t, lang } = useI18n();
  const [hearts, setHearts] = useState(story.hearts);
  const [heartBusy, setHeartBusy] = useState(false);
  const [hearted, setHearted] = useState(() => heartedIds().includes(story.id));
  const [writing, setWriting] = useState(false);
  const [allComments, setAllComments] = useState(false);
  const [from, setFrom] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const messageRef = useRef<TextInput>(null);
  const text = pick(lang, story.story, story.storyJa);
  const teller = lang === 'ja' ? story.tellerJa : story.teller;
  const comments = allComments ? story.comments : story.comments.slice(0, 2);

  const heart = async () => {
    if (heartBusy) return; setHeartBusy(true);
    const undo = hearted;
    setHearted(!undo); setHearts((n) => Math.max(0, n + (undo ? -1 : 1))); rememberHeart(story.id, !undo);
    try { setHearts((await api.storyHeart(story.id, undo)).hearts); }
    catch { setHearted(undo); setHearts((n) => Math.max(0, n + (undo ? 1 : -1))); rememberHeart(story.id, undo); setNote({ ok: false, text: t('rStoryError') }); }
    finally { setHeartBusy(false); }
  };
  const share = async () => {
    const title = pick(lang, story.name, story.nameJa);
    if (Platform.OS !== 'web') { await Share.share({ message: `${title}: “${text}” (KAKEHASHI)` }).catch(() => undefined); return; }
    const url = `${window.location.origin}/stories#${story.id}`;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); setNote({ ok: true, text: t('feedLinkCopied') }); }
    } catch { /* closed the share sheet */ }
  };
  const openWriting = () => { setWriting(true); setTimeout(() => messageRef.current?.focus(), 50); };
  const send = async () => {
    setBusy(true); setNote(null);
    try { await api.storyComment(story.id, from.trim(), message); setMessage(''); setWriting(false); setNote({ ok: true, text: t('feedSent') }); }
    catch { setNote({ ok: false, text: t('rStoryError') }); }
    finally { setBusy(false); }
  };

  return (
    <View nativeID={`story-${story.id}`} style={{ backgroundColor: colors.sheet, borderRadius: radii.card, borderWidth: 1,
      borderColor: colors.separator, paddingVertical: cardPadding, gap: spacing.lg, minWidth: 0, ...elevation }}>
      {/* Header: the item's icon as the avatar, who told it, when */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, paddingHorizontal: cardPadding }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }}>
          <PixelIcon sprite={spriteFor({ id: story.id, name: story.name, nameJa: story.nameJa, icon: story.icon })} size={30} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.ink }}>{pick(lang, story.name, story.nameJa)}{story.year ? ` · ${story.year}` : ''}</Text>
          <Text style={type.caption}>{teller} · {formatDate(story.sharedAt, lang)}</Text>
        </View>
        {story.example ? (
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: '#F3E9D2' }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: '#7A5B1E' }}>{t('feedExample')}</Text>
          </View>
        ) : null}
      </View>

      {/* Media: her photos (with her OK), or the story itself as the post */}
      <View style={{ paddingHorizontal: cardPadding }}>
        {story.photos.length ? (
          <PhotoCarousel item={{ name: story.name, photos: story.photos, icon: story.icon }} />
        ) : (
          <View style={{ backgroundColor: colors.aiTint, borderRadius: radii.control, paddingHorizontal: compact ? 16 : 22, paddingVertical: compact ? 20 : 28, minHeight: compact ? 140 : 200, justifyContent: 'center', gap: 12 }}>
            <Text style={[type.story, { fontSize: 20, lineHeight: 32 }]}>“{text}”</Text>
            <Text style={[type.caption, { color: colors.ai }]}>{teller}</Text>
          </View>
        )}
      </View>

      {/* Actions: heart, message, share */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingHorizontal: cardPadding }}>
        <Action icon="heart" label={t('feedHeart')} count={hearts} on={hearted} disabled={heartBusy} onPress={heart} />
        <Action icon="message-circle" label={t('feedComment')} count={story.comments.length} onPress={openWriting} />
        <Action icon="send" label={t('feedShare')} onPress={share} />
      </View>

      <View style={{ paddingHorizontal: cardPadding, gap: spacing.sm }}>
        {story.photos.length ? (
          <Text style={type.body}><Text style={type.bodyBold}>{teller} </Text>{text}</Text>
        ) : null}
        {story.audioUrl ? <StoryPlayer path={story.audioUrl} /> : null}
        {withJourney && story.journey.length ? <Journey story={story} /> : null}
        {comments.map((c, i) => (
          <Text key={i} style={type.body}><Text style={type.bodyBold}>{c.from || t('feedAnon')} </Text>{c.message}</Text>
        ))}
        {story.comments.length > 2 && !allComments ? (
          <Pressable accessibilityRole="button" onPress={() => setAllComments(true)} style={{ minHeight: 56, justifyContent: 'center' }}>
            <Text style={type.caption}>{t('feedViewAll', { n: story.comments.length })}</Text>
          </Pressable>
        ) : null}

        {story.example ? (
          <Text style={type.caption}>{t('feedExampleNote')}</Text>
        ) : writing ? (
          <View style={{ gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
            <Field label={t('feedNameOptional')} value={from} onChangeText={setFrom} placeholder={t('feedNameOptional')} maxLength={40} accessibilityLabel={t('feedNameOptional')} />
            <Field label={t('feedMessage')} ref={messageRef} value={message} onChangeText={setMessage} multiline maxLength={400} editable={!busy} />
            <Button label={t('send')} busy={busy} disabled={message.trim().length < 2} onPress={send} />
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={openWriting} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text style={[type.caption, { fontSize: 17 }]}>{t('feedAddMessage')}</Text>
          </Pressable>
        )}
        {note ? <StatusBanner tone={note.ok ? 'success' : 'error'} title={note.text} /> : null}
      </View>
    </View>
  );
}

function Action({ icon, label, count, on, onPress, disabled }: { icon: React.ComponentProps<typeof Feather>['name']; label: string; count?: number; on?: boolean; onPress: () => void; disabled?: boolean }) {
  return <Button label={count === undefined ? label : label + ' (' + count + ')'} kind="tertiary" icon={icon} selected={on} disabled={disabled} onPress={onPress}
    style={{ paddingHorizontal: 12 }} />;
}

// Where it went: the stages and dates only, never names or places.
function Journey({ story }: { story: PublicStory }) {
  const { palette: colors } = useAccessibilityPreferences();
  const { t, lang } = useI18n();
  return (
    <View style={{ gap: 0, paddingVertical: 6 }}>
      <Text style={[type.bodyBold, { marginBottom: 8 }]}>{t('journeyTitle')}</Text>
      {story.journey.map((j, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ alignItems: 'center', width: 22 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="check" size={13} color="#fff" />
            </View>
            {i < story.journey.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 16, backgroundColor: colors.moss }} /> : null}
          </View>
          <View style={{ flex: 1, paddingBottom: 12 }}>
            <Text style={type.bodyBold}>{j.stage === 'home' && story.year ? t('journeyHomeSince', { year: story.year }) : t(`stage_${j.stage}` as Key)}</Text>
            <Text style={type.caption}>{formatDate(j.at, lang)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
