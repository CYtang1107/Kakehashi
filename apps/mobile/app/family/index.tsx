import { useAccessibilityPreferences } from '../../src/design-system/preferences';
import { AppText as Text } from '../../src/design-system/AppText';
import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { pick } from '@kakehashi/shared';
import { Button, Card, Columns, Fold, Screen, formatDate, TaskWorkspace } from '../../src/ui';
import { useData } from '../../src/data';
import { ActivitiesCard, StudentsCard } from '../../src/Community';
import { ServicesCard } from '../../src/Services';
import { LiveOutingBanner } from '../../src/Outing';
import { WeatherBanner } from '../../src/Weather';
import { VisitThread } from '../../src/VisitThread';
import { useI18n } from '../../src/i18n';
import { fonts, type } from '../../src/theme';

export default function FamilyHome() {
  const { palette: colors } = useAccessibilityPreferences();
  const { data } = useData();
  const { t, lang } = useI18n();
  return (
    <Screen wide header={data ? { eyebrow: t('mothersHome', { town: pick(lang, data.home.town, data.home.townJa) }), title: t('greeting', { name: pick(lang, data.home.childName, data.home.childNameJa) }) } : undefined}>
      {data ? (() => {
        const { home, items } = data;
        const next = [...home.visits].filter(v => v.status === 'planned').sort((a,b) => a.date.localeCompare(b.date))[0];
        const room = home.rooms.find((r) => r.id === next?.roomId);
        const stories = items.filter((i) => i.story || i.audioUrl).length;
        const safer = home.rooms.filter((r) => r.status === 'sorted').length;
        const latest = [...items].filter((i) => i.story).sort((a, b) => (b.journey.at(-1)?.at ?? '').localeCompare(a.journey.at(-1)?.at ?? ''))[0];
        const pair = home.students.filter(s => s.role === 'pair'); const a = pair[0] ?? home.students[0]; const b = pair[1] ?? a;
        return (
          <Columns
            left={<>
            <Card>
              <Text variant="eyebrow">{t('hNext')}</Text>
              <Text variant="section">{next ? formatDate(next.date, lang) : t('hNothingPlanned')}</Text>
              {next ? <Text>{t('threadNext', { date: formatDate(next.date, lang), room: room ? pick(lang, room.name, room.nameJa) : '' })}</Text> : null}
              <Text variant="caption">{t('threadTitle', { n: home.visits.filter(v => v.status === 'done').length, a: a?.name ?? '', b: b?.name ?? '' })}</Text>
              <Button label={t('tabHouse')} kind="secondary" icon="home" onPress={() => router.push('/family/house')} />
            </Card>
            <LiveOutingBanner onOpenMap={() => router.push('/family/house?view=map')} />
            <WeatherBanner />
            <Fold title={t('uxHistory')} icon="clock">
            <VisitThread visits={home.visits} names={[a?.name ?? '', b?.name ?? '']} initials={[a?.initial ?? '', b?.initial ?? '']}
              next={next ? t('threadNext', { date: formatDate(next.date, lang), room: room ? (lang === 'ja' ? room.nameJa : room.name) : '' }) : undefined}
              stats={t('threadStats', { stories, rooms: safer, interests: a ? pick(lang, a.interests, a.interestsJa) : '' })}
              onPress={() => router.push('/family/house')} />
            </Fold>
            {latest ? (
              <Card>
                <Text style={type.eyebrow}>{t('uxNewMemories')}</Text>
                <Text style={[type.story, { paddingLeft: 12 }]}>“{pick(lang, latest.story, latest.storyJa)}”</Text>
                <Pressable accessibilityRole="link" onPress={() => router.push(`/item/${latest.id}`)} style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.kakiInk }}>{lang === 'ja' && latest.nameJa ? latest.nameJa : latest.name}</Text>
                </Pressable>
              </Card>
            ) : null}
            </>}
            right={<>
            <Card>
              <Text variant="section">{t('hSafety')}</Text>
              <Text>{t('uxSafetySummary', { n: home.safety.length, done: home.safety.filter(f => f.status === 'done').length })}</Text>
              <Button label={t('tabHouse')} icon="shield" kind="tertiary" onPress={() => router.push('/family/house')} />
            </Card>
            <TaskWorkspace tasks={[
              { id: 'help', label: t('uxHelpStatus'), icon: 'tool', description: t('foldHelp', { booked: home.services.filter(s => s.status === 'booked').length, asked: home.services.filter(s => s.status === 'requested').length }), content: <ServicesCard mode="family" /> },
              { id: 'activities', label: t('uxRecentActivities'), icon: 'map-pin', description: t('foldActivities', { n: home.activities.filter(x => x.status === 'accepted').length }), content: <ActivitiesCard mode="family" /> },
              { id: 'students', label: t('studentsTitleShort'), icon: 'users', description: t('foldStudents', { a: a?.name ?? '', b: b?.name ?? '' }), content: <StudentsCard /> },
            ]} />
            </>}
          />
        );
      })() : null}
    </Screen>
  );
}
