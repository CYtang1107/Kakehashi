import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Field, Fold, ConfirmationDialog, StatusBanner } from '../../ui';
import { useHomeDemo } from '../homeDemo/store';
import { useHomeCopy, changeLabel } from '../homeDemo/copy';
import { useVoice } from './voice';
export function CommandFeedback() {
  const store = useHomeDemo(), { c, lang } = useHomeCopy();
  return <>
    {store.feedback ? <StatusBanner title={`${c('simulated')} ${store.feedback.changes.map(change => changeLabel(change, lang)).join('; ')}`} message={store.feedback.unchanged ? c('unchanged') : undefined} /> : null}
    {store.command?.kind === 'unsupported' ? <StatusBanner tone="warning" title={c('unsupported')} /> : null}
    {store.command?.kind === 'ambiguous' ? <View style={{ gap: 12 }}>
      <AppText accessibilityLiveRegion="polite">{c('ambiguous')}</AppText>
      {store.command.choices.map(change => <Button key={change.id} label={`${c('choose')} · ${changeLabel(change, lang)}`} kind="secondary" disabled={!store.enabled} onPress={() => store.apply([change])} />)}
      <Button label={c('cancel')} kind="secondary" onPress={store.cancelCommand} />
    </View> : null}
  </>;
}
export function CommandInput() {
  const [text, setText] = useState(''), [consent, setConsent] = useState(false);
  const store = useHomeDemo(), { c, lang } = useHomeCopy();
  const voice = useVoice(lang, setText);
  const feedback = store.feedback ? `${c('simulated')} ${store.feedback.changes.map(change => changeLabel(change, lang)).join('; ')}`
    : store.command?.kind === 'unsupported' ? c('unsupported') : store.command?.kind === 'ambiguous' ? c('ambiguous') : '';
  return <View style={{ gap: 16 }}>
    <AppText variant="section">{c('command')}</AppText>
    <Field label={c('commandLabel')} value={text} onChangeText={setText} maxLength={240} multiline editable={!voice.listening} />
    <Button label={c('run')} disabled={!text.trim() || !store.enabled || voice.listening} onPress={() => { voice.stopSpeech(); store.execute(text); }} />
    <CommandFeedback />
    {voice.canSpeak && feedback ? <Button label={c(voice.speaking ? 'stopSpeech' : 'speak')} kind="secondary" icon="volume-2" onPress={() => voice.speaking ? voice.stopSpeech() : voice.speak(feedback)} /> : null}
    <Fold title={c('voice')} icon="mic">
      {voice.available ? <Button label={c(voice.listening ? 'stop' : 'listen')} kind="secondary" disabled={!store.enabled} onPress={() => voice.listening ? voice.stop() : setConsent(true)} /> : <AppText>{c('voiceUnavailable')}</AppText>}
      {voice.listening ? <AppText accessibilityLiveRegion="polite">{c('listening')}</AppText> : null}
    </Fold>
    {voice.notice ? <AppText accessibilityLiveRegion="polite">{c(voice.notice)}</AppText> : null}
    <Fold title={c('examples')}><AppText>{c('examples')}</AppText></Fold>
    <ConfirmationDialog visible={consent} title={c('voice')} onCancel={() => setConsent(false)}>
      <AppText>{c('consent')}</AppText>
      <Button label={c('allow')} onPress={() => { setConsent(false); voice.start(); }} />
    </ConfirmationDialog>
  </View>;
}
