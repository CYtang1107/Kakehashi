import React from 'react';
import { View } from 'react-native';
import type { Visit } from '@kakehashi/shared';
import { AppText, Avatar, Button, Card, Pill, formatDate } from './ui';
import { useI18n } from './i18n';

// A readable history of the same pair returning. Dates and statuses stay available without a diagram.
export function VisitThread({ visits, names, initials, stats, next, onPress }: {
  visits: Visit[]; names: [string, string]; initials: [string, string]; stats: string; next?: string; onPress?: () => void;
}) {
  const { t, lang } = useI18n();
  return <Card tint>
    <AppText variant="section">{t('threadTitle', { n: visits.filter(v => v.status === 'done').length, a: names[0], b: names[1] })}</AppText>
    <View style={{ flexDirection: 'row', gap: 8 }}><Avatar initial={initials[0]} tone="plum" /><Avatar initial={initials[1]} tone="moss" /></View>
    {next ? <AppText variant="bodyBold">{next}</AppText> : null}
    <AppText variant="caption">{stats}</AppText>
    <AppText variant="bodyBold">{t('rRecorded')}</AppText>
    {[...visits].sort((a,b)=>b.date.localeCompare(a.date)).map(visit => <View key={visit.id} style={{ gap: 8, paddingVertical: 12 }}>
      <AppText variant="bodyBold">{formatDate(visit.date, lang)}</AppText>
      <Pill label={t(visit.status === 'planned' ? 'planned' : 'rVisitDone')} />
    </View>)}
    {onPress ? <Button label={t('tabHouse')} kind="secondary" icon="home" onPress={onPress} /> : null}
  </Card>;
}
