import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Card, StatusBanner } from '../../ui';
import { useI18n, type Key } from '../../i18n';
import { useEverCircle } from '../store';
export const interestKey = (id: string) => `cInterest_${id}` as Key;
export function PendingInterests() {
  const { t } = useI18n(); const { saved, change, storageStatus } = useEverCircle();
  const [feedback, setFeedback] = useState<Key | null>(null);
  return <View style={{ gap: 16 }}>
    <AppText variant="section">{t('cPending')}</AppText>
    {feedback ? <StatusBanner title={t(feedback)} tone="success" /> : null}
    {!saved.pending.length ? <AppText>{t('cNoPending')}</AppText> : saved.pending.map(id => <Card key={id}>
      <AppText variant="bodyBold">{t(interestKey(id))}</AppText><AppText>{t('cPendingBody', { interest: t(interestKey(id)) })}</AppText>
      <Button label={t('cRemember')} accessibilityLabel={t('cRemember') + ': ' + t(interestKey(id))} disabled={storageStatus === 'saving'} onPress={() => { setFeedback(null); change({ type: 'approve', id }).then(ok => { if (ok) setFeedback('cRemembered'); }); }} />
      <Button label={t('cNotNow')} accessibilityLabel={t('cNotNow') + ': ' + t(interestKey(id))} kind="secondary" disabled={storageStatus === 'saving'} onPress={() => { setFeedback(null); change({ type: 'reject', id }).then(ok => { if (ok) setFeedback('cRejected'); }); }} />
    </Card>)}
  </View>;
}
