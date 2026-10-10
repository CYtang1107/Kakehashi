import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { pick } from '@kakehashi/shared';
import { Button, Card, Heading, Screen, formatDate } from '../../src/ui';
import { useData } from '../../src/data';
import { ActivitiesCard, StudentsCard } from '../../src/Community';
import { ServicesCard } from '../../src/Services';
import { LiveOutingBanner } from '../../src/Outing';
import { VisitThread } from '../../src/VisitThread';
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
        const stories = items.filter((i) => i.story || i.audioUrl).length;
        const safer = home.rooms.filter((r) => r.status === 'sorted').length;
        const latest = [...items].filter((i) => i.story).sort((a, b) => (b.journey.at(-1)?.at ?? '').localeCompare(a.journey.at(-1)?.at ?? ''))[0];
        const [a, b] = home.students;
        return (
          <>
            <Heading eyebrow={t('mothersHome', { town: pick(lang, home.town, home.townJa) })} title={t('greeting', { name: pick(lang, home.childName, home.childNameJa) })} />
            <LiveOutingBanner onOpenMap={() => router.push('/family/house?view=map')} />
            <VisitThread visits={home.visits} names={[a.name, b.name]} initials={[a.initial, b.initial]}
              next={next ? t('threadNext', { date: formatDate(next.date, lang), room: room ? (lang === 'ja' ? room.nameJa : room.name) : '' }) : undefined}
              stats={t('threadStats', { stories, rooms: safer, interests: pick(lang, a.interests, a.interestsJa) })} />
            <Text style={type.caption}>{t('togetherNote')}</Text>
            <Button label={t('openHouse')} kind="secondary" icon="box" onPress={() => router.push('/family/house')} />
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
