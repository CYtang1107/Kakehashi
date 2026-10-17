import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { AppText, Button, Fold, ConfirmationDialog, StatusBanner, formatDate } from '../../ui';
import { useData } from '../../data';
import { useI18n } from '../../i18n';
import { useAccessibilityPreferences } from '../../design-system/preferences';
import { householdDay } from '../../her/plans';
import { FeaturePage } from '../FeaturePage';
import { useEverCircle } from '../store';
import { PendingInterests, interestKey } from '../profile/PendingInterests';
import { companionContext } from './bridge';
import { ACTIONS } from './engine';
import { useDailyCompanion } from '../assistance/companion';
import { useSocial } from '../social/store';
import { useHomeDemo } from '../homeDemo/store';
import { runOrchestrator } from '../orchestrator/journal';
import { MessageComposer } from '../../design-system/MessageComposer';
import { useResponsiveLayout } from '../../design-system/useResponsiveLayout';

const starters = ['cStartHello', 'cStartMemory', 'cStartHelp', 'cStartFriends', 'cStartDay'] as const;
export function CompanionScreen() {
  const { t, lang } = useI18n(); const { data } = useData();
  const store = useEverCircle(); const { palette, reducedMotion } = useAccessibilityPreferences();
  const { contentGap, cardPadding } = useResponsiveLayout();
  const dailyReply = useDailyCompanion();
  const social = useSocial(), home = useHomeDemo();
  const [options, setOptions] = useState(false);
  const [text, setText] = useState(''); const scroll = useRef<ScrollView>(null);
  const chatTop = useRef(0), latestTop = useRef(0);
  const context = companionContext(data, householdDay());
  useEffect(() => { setText(''); }, [store.chatEpoch]);
  useEffect(() => { if (store.messages.length <= 1) return;
    const timer = setTimeout(() => scroll.current?.scrollTo({ y: chatTop.current + latestTop.current, animated: !reducedMotion }), 80); return () => clearTimeout(timer);
  }, [store.messages.length, reducedMotion]);
  const current = useRef({ store, social, home, dailyReply, context });
  current.current = { store, social, home, dailyReply, context };
  const send = (value: string) => { if (store.send(value, context.nextVisitDate, () => {
    const now = current.current;
    return runOrchestrator({ type: 'companion', text: value, saved: now.store.saved, household: now.home.state.householdId,
      healthy: now.social.healthy, deviceHealthy: now.home.enabled, person: now.social.people.find(p => p.id === 'tanaka')!, people: now.social.people,
      nextVisitDate: now.context.nextVisitDate, daily: () => now.dailyReply(value) }).reply;
  })) setText(''); };
  const suggestions = starters.map(key => <Button key={key} label={t(key)} kind="secondary" disabled={store.replying} onPress={() => send(t(key))} />);
  return <FeaturePage title="cTitle" description="cLead" scrollRef={scroll}
    footer={<MessageComposer label={t('cMessage')} value={text} onChangeText={setText} placeholder={t('cPlaceholder')}
      editable={!store.replying} sendLabel={t('cSend')} busy={store.replying} disabled={!text.trim()} onSend={() => send(text)} />}>
    <View onLayout={event => { chatTop.current = event.nativeEvent.layout.y; }} style={{ gap: contentGap }}>
      {store.messages.map(message => <View key={message.id} onLayout={event => { if (message.id === store.messages.at(-1)?.id) latestTop.current = event.nativeEvent.layout.y; }} style={{ maxWidth: '100%', width: '95%', alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
        backgroundColor: message.role === 'user' ? palette.secondary : palette.surface, borderWidth: 0, borderColor: palette.separator, borderRadius: 24, padding: Math.min(20, cardPadding), gap: 12 }}>
        <AppText variant="bodyBold">{t(message.role === 'user' ? 'cYou' : 'cSpeaker')}</AppText>
        <AppText accessibilityLiveRegion={message.role === 'companion' && message.id === store.messages.at(-1)?.id ? 'polite' : 'none'}>
          {message.role === 'user' ? message.text : message.reply.text ?? t(message.reply.key, { date: message.reply.date ? formatDate(message.reply.date, lang) : '', interest: message.reply.interest ? t(interestKey(message.reply.interest)) : '' })}
        </AppText>
        {message.role === 'companion' ? message.reply.actions.map(id => <Button key={id} label={t(ACTIONS[id].label)} kind="secondary" onPress={() => router.push(ACTIONS[id].route)} />) : null}
      </View>)}
    </View>
    {store.replying ? <View style={{ gap: 12 }}><AppText accessibilityLiveRegion="polite">{t('cTyping')}</AppText><Button label={t('cStop')} kind="secondary" onPress={store.stop} /></View> : null}
    {store.chatError ? <StatusBanner tone="error" title={t(store.chatError)} /> : null}
    {store.saved.pending.length || store.messages.some(message => message.role === 'companion' && message.reply.candidates.length) ? <PendingInterests /> : null}
    {store.messages.length === 1 ? <View style={{ gap: 12 }}><AppText variant="section">{t('cStarterTitle')}</AppText>{suggestions.slice(0, 3)}<Fold title={t('uxMoreSuggestions')}>{suggestions.slice(3)}</Fold></View> : <Fold title={t('cStarterTitle')} icon="message-circle">{suggestions}</Fold>}
    <Button label={t('uxOptions')} icon="sliders" kind="tertiary" onPress={() => setOptions(true)} />
    <ConfirmationDialog visible={options} title={t('uxOptions')} onCancel={() => setOptions(false)}>
      <Button label={t('cProfile')} kind="secondary" icon="user" onPress={() => { setOptions(false); router.push('/her/profile'); }} />
      <Button label={t('cPrivacy')} kind="secondary" icon="shield" onPress={() => { setOptions(false); router.push('/her/privacy'); }} />
      <AppText variant="bodyBold">{store.saved.profile.displayName || (lang === 'ja' ? context.nameJa : context.name)}</AppText>
      <AppText variant="caption">{t('cPrivacyShort')}</AppText>
      <AppText variant="caption">{t('cVoiceUnavailable')}</AppText>
      <AppText variant="caption">{t('cSessionChat')}</AppText>
    </ConfirmationDialog>
  </FeaturePage>;
}
