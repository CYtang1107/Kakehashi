import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { AccessibleSwitch, AppText, Button, ConfirmationDialog, StatusBanner } from '../../ui';
import { useI18n } from '../../i18n';
import { FeaturePage } from '../FeaturePage';
import { useEverCircle } from '../store';
import { matchingSummary } from './permissions';
import { interestKey } from '../profile/PendingInterests';
export function PrivacyScreen() {
  const { t } = useI18n(); const store = useEverCircle();
  const [clear, setClear] = useState<'chat' | 'profile' | null>(null), [cleared, setCleared] = useState(false);
  const busy = store.storageStatus === 'saving';
  const eligible = matchingSummary(store.saved, store.storageStatus === 'ready' || store.storageStatus === 'session').interests;
  return <FeaturePage title="cPrivacy" description="cPrivacyLead">
    <AppText>{t('cPrivacyShort')}</AppText><AppText variant="caption">{t('cDemoOnly')}</AppText>
    <AccessibleSwitch label={t('cMatching')} description={t('cMatchingHint')} value={store.saved.matchingEnabled} disabled={busy}
      onValueChange={enabled => { setCleared(false); void store.change({ type: 'matching', enabled }); }} />
    {!store.saved.matchingEnabled ? <AppText>{t('cEnableFirst')}</AppText> : null}
    {store.saved.approved.map(interest => <AccessibleSwitch key={interest.id} label={t('cShareInterest', { interest: t(interestKey(interest.id)) })}
      description={t('cShareHint')} disabled={busy || !store.saved.matchingEnabled} value={interest.shareForMatching}
      onValueChange={enabled => { void store.change({ type: 'share', id: interest.id, enabled }); }} />)}
    <View style={{ gap: 12 }}><AppText variant="section">{t('cEligible')}</AppText>
      {eligible.length ? eligible.map(id => <AppText key={id}>{t(interestKey(id))}</AppText>) : <AppText>{t('cEligibleNone')}</AppText>}
    </View>
    <Button label={t('cProfile')} kind="secondary" onPress={() => router.navigate('/her/profile')} />
    <Button label={t('sPermissions')} kind="secondary" onPress={() => router.push('/her/friends/permissions')} />
    {cleared ? <StatusBanner tone="success" title={t('cCleared')} /> : null}
    <Button label={t('cClearChat')} kind="secondary" disabled={busy} onPress={() => setClear('chat')} />
    <Button label={t('cClearProfile')} kind="danger" disabled={busy} onPress={() => setClear('profile')} />
    <AppText variant="caption">{t('cSessionChat')}</AppText>
    <ConfirmationDialog visible={clear !== null} title={t(clear === 'profile' ? 'cClearProfileTitle' : 'cClearChatTitle')}
      message={t(clear === 'profile' ? 'cClearProfileBody' : 'cClearChatBody')} destructive busy={busy}
      confirmLabel={t(clear === 'profile' ? 'cClearProfile' : 'cClearChat')} onCancel={() => setClear(null)}
      onConfirm={() => { (clear === 'profile' ? store.reset() : store.clearChat()).then(ok => { setClear(null); setCleared(ok); }); }} />
  </FeaturePage>;
}
