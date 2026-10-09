import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, useAudioRecorder } from 'expo-audio';
import { api, fileUrl, uriToBase64 } from './api';
import { colors, fonts, type } from './theme';
import { useI18n } from './i18n';
import { Button } from './ui';
import type { Item } from '@kakehashi/shared';

// Plays a saved story recording.
export function StoryPlayer({ path }: { path?: string }) {
  const { t } = useI18n();
  const url = fileUrl(path);
  const player = useAudioPlayer(url ? { uri: url } : null);
  const status = useAudioPlayerStatus(player);
  if (!url) return <Text style={type.caption}>{t('noRecording')}</Text>;
  const toggle = () => {
    if (status.playing) player.pause();
    else {
      if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.1)) player.seekTo(0);
      player.play();
    }
  };
  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.paper, borderRadius: 14, padding: 10 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('playStory')} onPress={toggle}
        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.ai, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={status.playing ? 'pause' : 'play'} size={18} color={colors.sheet} />
      </Pressable>
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.ink }}>{t('playStory')}</Text>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' }}>
          <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: colors.ai }} />
        </View>
      </View>
    </View>
  );
}

// Records a story on the visit and uploads it. The server refuses uploads without consent.
export function StoryRecorder({ item, consent, onSaved }: { item: Item; consent: boolean; onSaved: (item: Item) => void }) {
  const { t } = useI18n();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [state, setState] = useState<'idle' | 'recording' | 'saving'>('idle');
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setError(null);
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) { setError('Microphone permission was not given.'); return; }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setState('recording');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start recording.');
    }
  };

  const stop = async () => {
    setState('saving');
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      const uri = recorder.uri;
      if (!uri) throw new Error('No recording was captured.');
      const file = await uriToBase64(uri);
      const mime = file.mime.startsWith('audio/') ? file.mime : Platform.OS === 'web' ? 'audio/webm' : 'audio/m4a';
      onSaved(await api.audio(item.id, file.base64, mime));
      setState('idle');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the recording.');
      setState('idle');
    }
  };

  if (!consent) return <Text style={[type.caption, { color: colors.kaki }]}>{t('needConsent')}</Text>;
  return (
    <View style={{ gap: 8 }}>
      {state === 'recording' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.kaki }} />
          <Text style={[type.bodyBold, { flex: 1 }]}>{t('recording')}</Text>
          <Button label={t('stopRecording')} icon="square" onPress={stop} />
        </View>
      ) : (
        <Button label={t('record')} kind="secondary" icon="mic" busy={state === 'saving'} onPress={start} />
      )}
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}
