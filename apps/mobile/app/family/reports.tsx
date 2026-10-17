import { useAccessibilityPreferences } from '../../src/design-system/preferences';
import { AppText as Text } from '../../src/design-system/AppText';
import React from 'react';
import { View } from 'react-native';
import { pick } from '@kakehashi/shared';
import { Card, Pill, Screen, formatDate, TaskWorkspace } from '../../src/ui';
import { useData } from '../../src/data';
import { useI18n } from '../../src/i18n';
import { type } from '../../src/theme';
import { CallsCard, LetterCard } from '../../src/Touchpoints';

export default function Reports() {
  const { palette: colors } = useAccessibilityPreferences();
  const { data } = useData();
  const { t, lang } = useI18n();
  const visits = data ? [...data.home.visits].sort((a, b) => b.date.localeCompare(a.date)) : [];
  const visitCards = (list: typeof visits) => {
    const visits = list;
    return <>
          {visits.map((v) => {
            const room = data!.home.rooms.find((r) => r.id === v.roomId);
            return (
              <Card key={v.id}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                  <Text style={[type.bodyBold, { flex: 1 }]}>{formatDate(v.date, lang)} · {room ? (lang === 'ja' ? room.nameJa : room.name) : ''}</Text>
                  {v.status === 'planned' ? <Pill label={t('planned')} /> : null}
                  {v.checked ? <Pill label={t('checkedBadge')} color={colors.moss} bg={colors.mossTint} /> : null}
                  {v.readBy ? <Pill label={t('readByBadge', { by: v.readBy })} color={colors.ai} bg={colors.aiTint} /> : null}
                </View>
                <Text style={[type.body, { color: v.status === 'planned' ? colors.inkSoft : colors.ink }]}>{pick(lang, v.summary, v.summaryJa)}</Text>
              </Card>
            );
          })}
    </>;
  };
  return (
    <Screen header={{ title: t('reportsTitle') }}>
      {data ? (
        <TaskWorkspace defaultTask="visits" tasks={[
          { id: 'visits', label: t('uxReports'), icon: 'file-text', content: <>
            {!visits.length ? <Text>{t('rNoReports')}</Text> : visitCards(visits.slice(0, 3))}
          </> },
          { id: 'letters', label: t('uxLetters'), icon: 'mail', content: <LetterCard mode="family" /> },
          { id: 'calls', label: t('uxCalls'), icon: 'phone', content: <CallsCard mode="family" /> },
          { id: 'appreciation', label: t('uxAppreciation'), icon: 'heart', content: <>
          {data.items.flatMap((i) => i.thanks.map((th) => ({ ...th, item: i }))).sort((a, b) => b.at.localeCompare(a.at)).map((th) => (
            <Card key={`${th.item.id}-${th.at}`} tint>
              <Text style={type.eyebrow}>{t('thanksFrom', { name: th.from })}</Text>
              <Text style={type.story}>“{th.message}”</Text>
              <Text style={type.caption}>{pick(lang, th.item.name, th.item.nameJa)} · {formatDate(th.at, lang)}</Text>
            </Card>
          ))}
          </> },
          { id: 'history', label: t('uxHistory'), icon: 'clock', content: <>
            {visits.length > 3 ? visitCards(visits.slice(3)) : <Text>{t('uxNoOlderRecords')}</Text>}
          </> },
        ]} />
      ) : null}
    </Screen>
  );
}
