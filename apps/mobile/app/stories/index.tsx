import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { pick, type PublicStory } from '@kakehashi/shared';
import { Button, Card, Field, Heading, Screen, formatDate } from '../../src/ui';
import { StoryPlayer } from '../../src/Audio';
import { PixelIcon } from '../../src/PixelIcon';
import { spriteFor } from '../../src/pixelArt';
import { useI18n } from '../../src/i18n';
import { api } from '../../src/api';
import { colors, type } from '../../src/theme';

// Public story feed (物語の広場): stories older people agreed to share, for anyone to read.
export default function StoriesFeed() {
  const { t, lang } = useI18n();
  const [stories, setStories] = useState<PublicStory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => api.stories().then(setStories).catch((e) => setError(String(e.message ?? e))), []);
  useEffect(() => { load(); }, [load]);

  return (
    <Screen>
      <Heading eyebrow={t('feedEyebrow')} title={t('feedTitle')} sub={t('feedLead')} />
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
      {stories?.map((s) => <StoryCard key={s.id} story={s} />)}
      {stories && stories.length === 0 ? <Text style={type.body}>{t('feedEmpty')}</Text> : null}
      <Text style={type.caption}>{t('feedRules')}</Text>
    </Screen>
  );
}

function StoryCard({ story }: { story: PublicStory }) {
    const { t, lang } = useI18n();
    const [from, setFrom] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
    const send = async () => {
      setBusy(true); setNote(null);
      try { await api.storyComment(story.id, from, message); setMessage(''); setNote({ ok: true, text: t('feedSent') }); }
      catch (e) { setNote({ ok: false, text: e instanceof Error ? e.message : 'Could not send.' }); }
      finally { setBusy(false); }
    };
    return (
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <PixelIcon sprite={spriteFor({ id: story.id, name: story.name, nameJa: story.nameJa })} size={46} />
          <View style={{ flex: 1 }}>
            <Text style={type.section}>{pick(lang, story.name, story.nameJa)}{story.year ? ` · ${story.year}` : ''}</Text>
            <Text style={type.caption}>{lang === 'ja' ? story.tellerJa : story.teller} · {formatDate(story.sharedAt, lang)}</Text>
          </View>
        </View>
        <Text style={[type.story, { borderLeftWidth: 3, borderLeftColor: colors.ai, paddingLeft: 12 }]}>“{pick(lang, story.story, story.storyJa)}”</Text>
        {story.audioUrl ? <StoryPlayer path={story.audioUrl} /> : null}
        {story.comments.map((c, i) => (
          <Text key={i} style={type.body}><Text style={type.bodyBold}>{c.from}: </Text>{c.message}</Text>
        ))}
        <View style={{ gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
          <Field label={t('yourName')} value={from} onChangeText={setFrom} />
          <Field label={t('feedMessage')} value={message} onChangeText={setMessage} multiline style={{ minHeight: 70 }} />
          <Button label={t('send')} kind="secondary" icon="send" busy={busy} disabled={!from.trim() || !message.trim()} onPress={send} />
          {note ? <Text style={[type.caption, { color: note.ok ? colors.moss : colors.danger }]}>{note.text}</Text> : null}
        </View>
      </Card>
    );
  }
