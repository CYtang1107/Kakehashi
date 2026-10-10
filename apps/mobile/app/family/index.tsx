import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { pick } from '@kakehashi/shared';
import { Avatar, Button, Card, Heading, Pill, Screen, formatDate } from '../../src/ui';
import { useData } from '../../src/data';
import { ActivitiesCard, StudentsCard } from '../../src/Community';
import { ServicesCard } from '../../src/Services';
import { LiveOutingBanner } from '../../src/Outing';
import { useI18n } from '../../src/i18n';
import { colors, type } from '../../src/theme';

export default function FamilyHome() {
  const { data } = useData();
  const { t, lang } = useI18n();
  return (
    <Screen>
      {data ? (() => {
        const { home, items } = data;
        const next = home.visits.find((v) => v.status === 'planned');
        const room = home.rooms.find((r) => r.id === next?.roomId);
        const visitsDone = home.visits.filter((v) => v.status === 'done').length;
        const stories = items.filter((i) => i.story || i.audioUrl).length;
        const safer = home.rooms.filter((r) => r.status === 'sorted').length;
        const latest = [...items].filter((i) => i.story).sort((a, b) => (b.journey.at(-1)?.at ?? '').localeCompare(a.journey.at(-1)?.at ?? ''))[0];
        const [a, b] = home.students;
        return (
          <>
            <Heading eyebrow={t('mothersHome', { town: pick(lang, home.town, home.townJa) })} title={t('greeting', { name: pick(lang, home.childName, home.childNameJa) })} />
            <LiveOutingBanner onOpenMap={() => router.push('/family/house?view=map')} />
            {next ? (
              <Card tint>
                <Text style={type.eyebrow}>{t('nextVisit')}</Text>
                <Text style={type.bodyBold}>{formatDate(next.date, lang)} · {room ? (lang === 'ja' ? room.nameJa : room.name) : ''}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Avatar initial={a.initial} tone="plum" />
                  <Avatar initial={b.initial} tone="moss" />
                  <Text style={[type.caption, { flex: 1 }]}>{t('samePair', { a: a.name, b: b.name, interests: pick(lang, a.interests, a.interestsJa) })}</Text>
                </View>
              </Card>
            ) : null}
            <Card>
              <Text style={type.bodyBold}>{t('togetherSoFar')}</Text>
              <Text style={type.body}>{t('togetherStats', { visits: visitsDone, stories, rooms: safer })}</Text>
              <Text style={type.caption}>{t('togetherNote')}</Text>
              <Button label={t('openHouse')} kind="secondary" icon="box" onPress={() => router.push('/family/house')} />
            </Card>
            {latest ? (
              <Card>
                <Text style={type.eyebrow}>{t('latestStory')}</Text>
                <Text style={[type.story, { borderLeftWidth: 3, borderLeftColor: colors.ai, paddingLeft: 12 }]}>“{pick(lang, latest.story, latest.storyJa)}”</Text>
                <Button label={lang === 'ja' && latest.nameJa ? latest.nameJa : latest.name} kind="secondary" icon="chevron-right" onPress={() => router.push(`/item/${latest.id}`)} />
              </Card>
            ) : null}
            <StudentsCard />
            <ActivitiesCard mode="family" />
            <ServicesCard mode="family" />
          </>
        );
      })() : null}
    </Screen>
  );
}
