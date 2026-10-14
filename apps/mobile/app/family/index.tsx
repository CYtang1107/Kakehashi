import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { pick } from '@kakehashi/shared';
import { Button, Card, Columns, Fold, Screen, formatDate } from '../../src/ui';
import { useData } from '../../src/data';
import { ActivitiesCard, StudentsCard } from '../../src/Community';
import { ServicesCard } from '../../src/Services';
import { LiveOutingBanner } from '../../src/Outing';
import { WeatherBanner } from '../../src/Weather';
import { VisitThread } from '../../src/VisitThread';
import { useI18n } from '../../src/i18n';
import { colors, fonts, type } from '../../src/theme';

export default function FamilyHome() {
  const { data } = useData();
  const { t, lang } = useI18n();
  return (
    <Screen wide fit header={data ? { eyebrow: t('mothersHome', { town: pick(lang, data.home.town, data.home.townJa) }), title: t('greeting', { name: pick(lang, data.home.childName, data.home.childNameJa) }) } : undefined}>
      {data ? (() => {
        const { home, items } = data;
        const next = home.visits.find((v) => v.status === 'planned');
        const room = home.rooms.find((r) => r.id === next?.roomId);
        const stories = items.filter((i) => i.story || i.audioUrl).length;
        const safer = home.rooms.filter((r) => r.status === 'sorted').length;
        const latest = [...items].filter((i) => i.story).sort((a, b) => (b.journey.at(-1)?.at ?? '').localeCompare(a.journey.at(-1)?.at ?? ''))[0];
        const [a, b] = home.students;
        return (
          <Columns fill scrollLeft
            left={<>
            <LiveOutingBanner onOpenMap={() => router.push('/family/house?view=map')} />
            <WeatherBanner />
            <VisitThread visits={home.visits} names={[a.name, b.name]} initials={[a.initial, b.initial]}
              next={next ? t('threadNext', { date: formatDate(next.date, lang), room: room ? (lang === 'ja' ? room.nameJa : room.name) : '' }) : undefined}
              stats={t('threadStats', { stories, rooms: safer, interests: pick(lang, a.interests, a.interestsJa) })}
              onPress={() => router.push('/family/house')} />
            {latest ? (
              <Card>
                <Text style={type.eyebrow}>{t('latestStory')}</Text>
                <Text numberOfLines={3} style={[type.story, { borderLeftWidth: 3, borderLeftColor: colors.kakiInk, paddingLeft: 12 }]}>“{pick(lang, latest.story, latest.storyJa)}”</Text>
                <Pressable accessibilityRole="link" onPress={() => router.push(`/item/${latest.id}`)} style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.kakiInk }}>{lang === 'ja' && latest.nameJa ? latest.nameJa : latest.name}</Text>
                </Pressable>
              </Card>
            ) : null}
            </>}
            right={<>
            <Fold title={t('studentsTitleShort')} icon="award" summary={t('foldStudents', { a: a.name, b: b.name })}>
              <StudentsCard />
            </Fold>
            <Fold title={t('fromHomeToCommunity')} icon="map-pin" summary={t('foldActivities', { n: home.activities.filter((x) => x.status === 'accepted').length })}>
              <ActivitiesCard mode="family" />
            </Fold>
            <Fold title={t('servicesTitle')} icon="tool" summary={t('foldHelp', { booked: home.services.filter((s) => s.status === 'booked').length, asked: home.services.filter((s) => s.status === 'requested').length })}>
              <ServicesCard mode="family" />
            </Fold>
            </>}
          />
        );
      })() : null}
    </Screen>
  );
}
