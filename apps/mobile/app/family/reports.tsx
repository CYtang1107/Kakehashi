import React from 'react';
import { Text, View } from 'react-native';
import { pick } from '@kakehashi/shared';
import { Card, Columns, Pill, Screen, formatDate } from '../../src/ui';
import { useData } from '../../src/data';
import { useI18n } from '../../src/i18n';
import { colors, type } from '../../src/theme';
import { CallsCard, LetterCard } from '../../src/Touchpoints';

export default function Reports() {
  const { data } = useData();
  const { t, lang } = useI18n();
  return (
    <Screen wide fit header={{ title: t('reportsTitle') }}>
      {data ? (
        <Columns fill scrollLeft
          left={<>
          <LetterCard mode="family" />
          <CallsCard mode="family" />
          </>}
          right={<>
          {data.home.visits.map((v) => {
            const room = data.home.rooms.find((r) => r.id === v.roomId);
            return (
              <Card key={v.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[type.bodyBold, { flex: 1 }]}>{formatDate(v.date, lang)} · {room ? (lang === 'ja' ? room.nameJa : room.name) : ''}</Text>
                  {v.status === 'planned' ? <Pill label={t('planned')} /> : null}
                  {v.checked ? <Pill label={t('checkedBadge')} color={colors.moss} bg={colors.mossTint} /> : null}
                  {v.readBy ? <Pill label={t('readByBadge', { by: v.readBy })} color={colors.ai} bg={colors.aiTint} /> : null}
                </View>
                <Text style={[type.body, { color: v.status === 'planned' ? colors.inkSoft : colors.ink }]}>{pick(lang, v.summary, v.summaryJa)}</Text>
              </Card>
            );
          })}
          {data.items.flatMap((i) => i.thanks.map((th) => ({ ...th, item: i }))).map((th) => (
            <Card key={`${th.item.id}-${th.at}`} tint>
              <Text style={type.eyebrow}>{t('thanksFrom', { name: th.from })}</Text>
              <Text style={type.story}>“{th.message}”</Text>
              <Text style={type.caption}>{th.item.name} · {formatDate(th.at, lang)}</Text>
            </Card>
          ))}
          </>}
        />
      ) : null}
    </Screen>
  );
}
