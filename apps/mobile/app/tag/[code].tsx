import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { pick, type PublicTag } from '@kakehashi/shared';
import { Button, Card, Field, Glyph, Heading, Screen } from '../../src/ui';
import { StoryPlayer } from '../../src/Audio';
import { Journey } from '../../src/Journey';
import { useData } from '../../src/data';
import { useI18n } from '../../src/i18n';
import { api, fileUrl } from '../../src/api';
import { colors, type } from '../../src/theme';

export default function TagScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { t, lang } = useI18n();
  const { showToast, refresh } = useData();
  const [tag, setTag] = useState<PublicTag | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.publicTag(String(code)).then(setTag).catch((e) => setError(e instanceof Error ? e.message : 'Not found.'));
  }, [code]);

  const send = async () => {
    setSending(true);
    try {
      setTag(await api.thanks(String(code), from.trim(), message.trim()));
      setMessage('');
      showToast(t('thanksSent'));
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen back>
      {error && !tag ? <Card><Text style={type.bodyBold}>{error}</Text></Card> : !tag ? <ActivityIndicator color={colors.ai} /> : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Glyph ch={tag.glyph} size={52} />
            <View style={{ flex: 1 }}>
              <Heading eyebrow={`${tag.code}${tag.year ? ` · ${tag.year}` : ''}`} title={t('tagTitle', { name: lang === 'ja' && tag.nameJa ? tag.nameJa : tag.name.toLowerCase() })} sub={t('from', { from: tag.from })} />
            </View>
          </View>
          {tag.photoUrl ? <Image source={{ uri: fileUrl(tag.photoUrl) }} style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 14 }} accessibilityLabel={tag.name} /> : null}
          <Card>
            <StoryPlayer path={tag.audioUrl} />
            {tag.story ? <Text style={[type.story, { borderLeftWidth: 3, borderLeftColor: colors.ai, paddingLeft: 12 }]}>“{pick(lang, tag.story, tag.storyJa)}”</Text> : null}
          </Card>
          <Card>
            <Text style={type.section}>{t('journey')}</Text>
            <Journey steps={tag.journey} />
          </Card>
          <Card>
            <Text style={type.section}>{t('sendThanks')}</Text>
            <Field label={t('yourName')} value={from} onChangeText={setFrom} placeholder="Mai" />
            <Field label={t('sendThanks')} multiline value={message} onChangeText={setMessage} placeholder={t('thanksPlaceholder')} />
            <Button label={t('send')} icon="send" busy={sending} disabled={!message.trim()} onPress={send} />
            {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
          </Card>
        </>
      )}
    </Screen>
  );
}
