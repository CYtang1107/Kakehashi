import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Share, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { pick, type PublicStory } from '@kakehashi/shared';
import { Columns, Screen, formatDate, useWide } from '../../src/ui';
import { StoryPlayer } from '../../src/Audio';
import { PixelIcon } from '../../src/PixelIcon';
import { PhotoCarousel } from '../../src/PhotoCarousel';
import { spriteFor } from '../../src/pixelArt';
import { StoryGlobe } from '../../src/StoryGlobe';
import { useI18n, type Key } from '../../src/i18n';
import { api } from '../../src/api';
import { colors, fonts, type } from '../../src/theme';

// Public story feed (物語の広場): stories older people agreed to share, shown like posts, for anyone to read.
export default function StoriesFeed() {
  const { t, lang } = useI18n();
  // On a laptop the page fits the window: the globe fills the left, the posts scroll on the right.
  const fit = useWide();
  const [stories, setStories] = useState<PublicStory[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => api.stories().then(setStories).catch((e) => setError(String(e.message ?? e))), []);
  useEffect(() => { load(); }, [load]);
  // A shared link (…/stories#sewing) opens at that story.
  useEffect(() => {
    if (!stories || Platform.OS !== 'web' || typeof window === 'undefined' || !window.location.hash) return;
    document.getElementById(`story-${window.location.hash.slice(1)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [stories]);

  return (
    <Screen wide fit header={{ eyebrow: t('feedEyebrow'), title: t('feedTitle'), sub: t('feedLead') }}>
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
      <Columns fill
        left={stories?.length ? (
        <View style={{ gap: 8, ...(fit ? { flex: 1, minHeight: 0 } : null) }}>
          <StoryGlobe fill={fit} stories={stories} selected={selected} onSelect={setSelected} labels={{ zoomIn: t('globeZoomIn'), zoomOut: t('globeZoomOut'), japan: t('globeJapan') }} />
          <Text style={[type.caption, { textAlign: 'center' }]}>{t('globeHint')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {stories.map((st) => (
              <Pressable key={st.id} accessibilityRole="button" onPress={() => setSelected(st.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4, paddingRight: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1, borderColor: st.id === selected ? colors.ai : colors.line, backgroundColor: st.id === selected ? colors.aiTint : colors.sheet }}>
                <PixelIcon sprite={spriteFor({ id: st.id, name: st.name, nameJa: st.nameJa, icon: st.icon })} size={22} />
                <Text style={{ fontFamily: fonts.medium, fontSize: 12.5, color: colors.ink }}>{pick(lang, st.name, st.nameJa)}</Text>
                {st.example ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#D9B26A' }} /> : null}
              </Pressable>
            ))}
          </View>
          <Text style={type.caption}>{t('globeLegend')}</Text>
        </View>
      ) : null}
        right={<>
          {stories?.map((s) => <StoryPost key={s.id} story={s} />)}
          {stories && stories.length === 0 ? <Text style={type.body}>{t('feedEmpty')}</Text> : null}
          <Text style={type.caption}>{t('feedRules')}</Text>
        </>}
      />

      {/* A story opened from the globe, with where it went */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => { setSelected(null); load(); }}>
        <Pressable onPress={() => { setSelected(null); load(); }} style={{ flex: 1, backgroundColor: 'rgba(18,26,42,0.55)', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 560, maxHeight: '90%', backgroundColor: colors.paper, borderTopLeftRadius: 22, borderTopRightRadius: 22 }}>
            <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 30, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Pressable accessibilityRole="button" accessibilityLabel={t('close')} onPress={() => { setSelected(null); load(); }}
                  style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.sheet, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="x" size={18} color={colors.ink} />
                </Pressable>
              </View>
              {stories?.filter((st) => st.id === selected).map((st) => <StoryPost key={st.id} story={st} withJourney />)}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
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
  const { t, lang } = useI18n();
  const [hearts, setHearts] = useState(story.hearts);
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
    const undo = hearted;
    setHearted(!undo); setHearts((n) => Math.max(0, n + (undo ? -1 : 1))); rememberHeart(story.id, !undo);
    try { setHearts((await api.storyHeart(story.id, undo)).hearts); }
    catch { setHearted(undo); setHearts((n) => Math.max(0, n + (undo ? 1 : -1))); rememberHeart(story.id, undo); }
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
    catch (e) { setNote({ ok: false, text: e instanceof Error ? e.message : 'Could not send.' }); }
    finally { setBusy(false); }
  };

  return (
    <View nativeID={`story-${story.id}`} style={{ backgroundColor: colors.sheet, borderRadius: 16, borderWidth: 1, borderColor: colors.line, paddingVertical: 12, gap: 10 }}>
      {/* Header: the item's icon as the avatar, who told it, when */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }}>
          <PixelIcon sprite={spriteFor({ id: story.id, name: story.name, nameJa: story.nameJa, icon: story.icon })} size={30} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 14.5, color: colors.ink }}>{pick(lang, story.name, story.nameJa)}{story.year ? ` · ${story.year}` : ''}</Text>
          <Text style={type.caption}>{teller} · {formatDate(story.sharedAt, lang)}</Text>
        </View>
        {story.example ? (
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: '#F3E9D2' }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: '#7A5B1E' }}>{t('feedExample')}</Text>
          </View>
        ) : null}
      </View>

      {/* Media: her photos (with her OK), or the story itself as the post */}
      <View style={{ paddingHorizontal: 14 }}>
        {story.photos.length ? (
          <PhotoCarousel item={{ name: story.name, photos: story.photos, icon: story.icon }} />
        ) : (
          <View style={{ backgroundColor: colors.aiTint, borderRadius: 14, paddingHorizontal: 22, paddingVertical: 28, minHeight: 200, justifyContent: 'center', gap: 12 }}>
            <Text style={[type.story, { fontSize: 20, lineHeight: 32 }]}>“{text}”</Text>
            <Text style={[type.caption, { color: colors.ai }]}>{teller}</Text>
          </View>
        )}
      </View>

      {/* Actions: heart, message, share */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 14 }}>
        <Action icon="heart" label={t('feedHeart')} count={hearts} on={hearted} onPress={heart} />
        <Action icon="message-circle" label={t('feedComment')} count={story.comments.length} onPress={openWriting} />
        <Action icon="send" label={t('feedShare')} onPress={share} />
      </View>

      <View style={{ paddingHorizontal: 14, gap: 6 }}>
        {story.photos.length ? (
          <Text style={type.body}><Text style={type.bodyBold}>{teller} </Text>{text}</Text>
        ) : null}
        {story.audioUrl ? <StoryPlayer path={story.audioUrl} /> : null}
        {withJourney && story.journey.length ? <Journey story={story} /> : null}
        {comments.map((c, i) => (
          <Text key={i} style={type.body}><Text style={type.bodyBold}>{c.from || t('feedAnon')} </Text>{c.message}</Text>
        ))}
        {story.comments.length > 2 && !allComments ? (
          <Pressable accessibilityRole="button" onPress={() => setAllComments(true)}>
            <Text style={type.caption}>{t('feedViewAll', { n: story.comments.length })}</Text>
          </Pressable>
        ) : null}

        {story.example ? (
          <Text style={type.caption}>{t('feedExampleNote')}</Text>
        ) : writing ? (
          <View style={{ gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
            <Input value={from} onChangeText={setFrom} placeholder={t('feedNameOptional')} maxLength={40} accessibilityLabel={t('feedNameOptional')} />
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
              <Input ref={messageRef} value={message} onChangeText={setMessage} placeholder={t('feedMessage')} multiline maxLength={400}
                accessibilityLabel={t('feedMessage')} style={{ flex: 1, minHeight: 44, textAlignVertical: 'top' }} />
              <Pressable accessibilityRole="button" accessibilityLabel={t('send')} disabled={busy || message.trim().length < 2} onPress={send}
                style={{ height: 44, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: message.trim().length >= 2 ? colors.ai : colors.line }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: '#fff' }}>{busy ? '…' : t('send')}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={openWriting} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text style={[type.caption, { fontSize: 13.5 }]}>{t('feedAddMessage')}</Text>
          </Pressable>
        )}
        {note ? <Text style={[type.caption, { color: note.ok ? colors.moss : colors.danger }]}>{note.text}</Text> : null}
      </View>
    </View>
  );
}

// A text box that shows focus with the app's blue border instead of the browser's black outline.
const Input = React.forwardRef<TextInput, TextInputProps>(function Input({ style, ...props }, ref) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput ref={ref} placeholderTextColor={colors.inkSoft} {...props}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }} onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
      style={[{ borderWidth: focused ? 2 : 1, borderColor: focused ? colors.ai : colors.line, borderRadius: 12, paddingHorizontal: focused ? 11 : 12, paddingVertical: focused ? 9 : 10,
        fontFamily: fonts.regular, fontSize: 15, color: colors.ink, backgroundColor: colors.paper }, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null, style]} />
  );
});

function Action({ icon, label, count, on, onPress }: { icon: React.ComponentProps<typeof Feather>['name']; label: string; count?: number; on?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={on === undefined ? undefined : { selected: on }} onPress={onPress} hitSlop={8}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, minWidth: 44 }}>
      <Feather name={icon} size={23} color={on ? colors.kaki : colors.ink} style={on ? { opacity: 1 } : undefined} />
      {count !== undefined ? <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.ink }}>{count}</Text> : null}
    </Pressable>
  );
}

// Where it went: the stages and dates only, never names or places.
function Journey({ story }: { story: PublicStory }) {
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
