import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Share, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { pick, type PublicStory } from '@kakehashi/shared';
import { Heading, Screen, formatDate } from '../../src/ui';
import { StoryPlayer } from '../../src/Audio';
import { PixelIcon } from '../../src/PixelIcon';
import { PhotoCarousel } from '../../src/PhotoCarousel';
import { spriteFor } from '../../src/pixelArt';
import { useI18n } from '../../src/i18n';
import { api } from '../../src/api';
import { colors, fonts, type } from '../../src/theme';

// Public story feed (物語の広場): stories older people agreed to share, shown like posts, for anyone to read.
export default function StoriesFeed() {
  const { t } = useI18n();
  const [stories, setStories] = useState<PublicStory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => api.stories().then(setStories).catch((e) => setError(String(e.message ?? e))), []);
  useEffect(() => { load(); }, [load]);
  // A shared link (…/stories#sewing) opens at that story.
  useEffect(() => {
    if (!stories || Platform.OS !== 'web' || typeof window === 'undefined' || !window.location.hash) return;
    document.getElementById(`story-${window.location.hash.slice(1)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [stories]);

  return (
    <Screen>
      <Heading eyebrow={t('feedEyebrow')} title={t('feedTitle')} sub={t('feedLead')} />
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
      {stories?.map((s) => <StoryPost key={s.id} story={s} />)}
      {stories && stories.length === 0 ? <Text style={type.body}>{t('feedEmpty')}</Text> : null}
      <Text style={type.caption}>{t('feedRules')}</Text>
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

function StoryPost({ story }: { story: PublicStory }) {
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
        {comments.map((c, i) => (
          <Text key={i} style={type.body}><Text style={type.bodyBold}>{c.from || t('feedAnon')} </Text>{c.message}</Text>
        ))}
        {story.comments.length > 2 && !allComments ? (
          <Pressable accessibilityRole="button" onPress={() => setAllComments(true)}>
            <Text style={type.caption}>{t('feedViewAll', { n: story.comments.length })}</Text>
          </Pressable>
        ) : null}

        {writing ? (
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
          <Pressable accessibilityRole="button" onPress={openWriting} style={{ paddingVertical: 4 }}>
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
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Feather name={icon} size={23} color={on ? colors.kaki : colors.ink} style={on ? { opacity: 1 } : undefined} />
      {count !== undefined ? <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.ink }}>{count}</Text> : null}
    </Pressable>
  );
}
