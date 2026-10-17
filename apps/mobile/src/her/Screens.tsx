import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { CONDITION_PARTS, outingIsLive, pick } from '@kakehashi/shared';
import { AppText, Button, Card, EmptyState, Fold, StatusBanner, AccessibleSwitch, LangToggle, formatDate } from '../ui';
import { HerPage } from './HerPage';
import { useData } from '../data';
import { useI18n, type Key } from '../i18n';
import { useWeather } from '../Weather';
import { api } from '../api';
import { AppSettings } from '../design-system/AppSettings';
import { itemPhotos } from '../PhotoCarousel';
import { DecisionChip } from '../ui';
import { householdDay, planDate, plans } from './plans';
import { StudentBadges } from '../Community';
import { DailyAssistance } from '../evercircle/assistance/DailyAssistance';
import { useAccessibilityPreferences } from '../design-system/preferences';
import { radii, spacing } from '../theme';

export function Destination({ label, href, icon }: { label: Key; href: string; icon?: React.ComponentProps<typeof Button>['icon'] }) {
  const { t } = useI18n();
  const { palette, preferences } = useAccessibilityPreferences();
  const tint = icon === 'users' ? palette.mossTint : icon === 'home' ? palette.kakiTint
    : icon === 'calendar' || icon === 'sun' ? palette.accent : palette.plumTint;
  return <Pressable accessibilityRole="button" accessibilityLabel={t(label)} onPress={() => router.push(href as never)}
    style={({ pressed }) => ({ minHeight: 80, padding: spacing.lg, gap: spacing.lg, flexDirection: 'row', alignItems: 'center',
      borderRadius: radii.control, borderWidth: preferences.highContrast ? 2 : 1,
      borderColor: preferences.highContrast ? palette.border : palette.separator, backgroundColor: pressed ? palette.secondary : palette.surface })}>
    <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={icon ?? 'arrow-right'} size={24} color={icon === 'users' ? palette.moss : icon === 'home' ? palette.kaki : palette.ai} accessible={false} />
    </View>
    <AppText variant="bodyBold" style={{ flex: 1 }}>{t(label)}</AppText>
    <Feather name="chevron-right" size={22} color={palette.inkSoft} accessible={false} />
  </Pressable>;
}
export function WeatherAdvice({ always = false }: { always?: boolean }) {
  const { data } = useData();
  const { w, load } = useWeather();
  const { t, lang } = useI18n();
  if (!always && !w?.callNeeded) return null;
  if (!w || w.source === 'unavailable') return <StatusBanner title={t('hWeather')} message={t('hWeatherUnavailable')} action={{ label: t('retry'), onPress: load }} />;
  const alerts = w.alerts.filter(a => a.callHer);
  return <View style={{ gap: 12 }}>{alerts.length ? alerts.map(a => <StatusBanner key={a.code} tone="warning"
    title={pick(lang, a.name, a.nameJa)} message={`${t(`wxAdvice_${a.kind}` as Key)} ${data?.home.students.find(s => s.role === 'pair') ? t('wxWillCall', { name: data.home.students.find(s => s.role === 'pair')!.name }) : ''}`} />) : <AppText>{t('hWeatherClear')}</AppText>}
    <AppText variant="caption">{t(w.source === 'demo' ? 'wxDemoLabel' : 'wxSourceShort')}</AppText>
  </View>;
}
export function HomeScreen() {
  const { data } = useData(); const { t, lang } = useI18n();
  const { palette } = useAccessibilityPreferences();
  const date = new Date().toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-GB', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Asia/Tokyo' });
  const day = householdDay();
  const all = data ? plans(data.home, lang, t) : [];
  const next = all.find(p => (p.kind === 'visit' || p.kind === 'helper') && p.date.slice(0, 10) >= day);
  const todays = all.filter(p => p.date.slice(0, 10) === day);
  const helpers = data?.home.services.some(s => s.status === 'booked');
  return <HerPage title={data ? t('hHello', { name: pick(lang, data.home.seniorName, data.home.seniorNameJa) }) : t('hToday')} description={date}>
    <AppText>{t('hHomeLead')}</AppText>
    <Card tint style={{ backgroundColor: palette.plumTint, gap: spacing.lg }}>
      <AppText variant="section">{t('hCompanionWelcome')}</AppText>
      <AppText variant="caption">{t('cLead')}</AppText>
      <Button label={t('hCompanion')} icon="message-circle" onPress={() => router.push('/her/companion')} />
    </Card>
    <Card><AppText variant="section">{t('hGlance')}</AppText>
      <View style={{ gap: spacing.sm }}><AppText variant="bodyBold">{t('hNextVisit')}</AppText>
        {next ? <><AppText>{next.title} · {planDate(next.date, lang)}</AppText><AppText variant="caption">{next.detail}</AppText></> : <AppText>{t('hNoVisit')}</AppText>}
      </View>
      <View style={{ gap: spacing.sm, paddingTop: spacing.lg, borderTopWidth: 1, borderColor: palette.separator }}>
        <AppText variant="bodyBold">{t('hTodayPlans')}</AppText>
        {todays.length ? todays.map(p => <AppText key={p.id}>{p.title} · {p.detail}</AppText>) : <AppText>{t('hNoToday')}</AppText>}
      </View>
      <WeatherAdvice />
      <Button label={t('hSeeDay')} icon="calendar" kind="secondary" onPress={() => router.push('/her/my-day')} />
    </Card>
    <View style={{ gap: spacing.lg }}><AppText variant="section">{t('hAssistance')}</AppText>
      <AppText variant="caption">{t('hHelpScope')}</AppText>
      <Destination label="hRequestHelp" href="/her/help" icon="tool" />
      {helpers ? <Destination label="hHelpers" href="/her/helpers" icon="users" /> : null}
    </View>
  </HerPage>;
}
export function MyDayScreen() {
  const { data } = useData(); const { t, lang } = useI18n();
  const { palette } = useAccessibilityPreferences();
  const all = data ? plans(data.home, lang, t) : [];
  const day = householdDay();
  const current = all.filter(p => p.date.slice(0, 10) >= day), past = all.filter(p => p.date.slice(0, 10) < day);
  const entries = (list: typeof all) => list.map(p => <View key={p.id} style={{ gap: 6, paddingVertical: 16, borderBottomWidth: 1, borderColor: palette.separator }}>
    <AppText variant="caption">{planDate(p.date, lang)}</AppText><AppText variant="section">{p.title}</AppText><AppText>{p.detail}</AppText>
  </View>);
  const live = data?.home.outings.find(o => outingIsLive(o, Date.now()));
  const activity = data?.home.activities.find(a => a.id === live?.activityId);
  return <HerPage back title={t('hDay')} description={new Date(`${day}T12:00:00+09:00`).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-GB', { timeZone: 'Asia/Tokyo', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>
    <View style={{ gap: spacing.lg }}><AppText variant="section">{t('hNext')}</AppText>
      {current.length ? <Card>{entries(current.slice(0, 1))}</Card> : <AppText>{t('hNothingPlanned')}</AppText>}
      <View style={{ gap: spacing.sm }}><AppText variant="bodyBold">{t('hOuting')}</AppText>
        <AppText>{live ? `${activity ? pick(lang, activity.title, activity.titleJa) : ''} · ${live.by}` : t('hNoOuting')}</AppText>
        {live ? <><AppText variant="caption">{t('outingFamilyNote')}{live.simulated ? ` ${t('outingSimulatedShort')}` : ''}</AppText><Destination label="viewMap" href="/her/digital-house?view=map" /></> : null}
      </View>
      <WeatherAdvice always />
    </View>
    <View style={{ gap: spacing.lg }}><AppText variant="section">{t('hMyPlans')}</AppText>
      {current.length ? entries(current) : <EmptyState title={t('hNothingPlanned')} message={t('hNothingBody')} />}
      {past.length ? <Fold title={t('hPlanHistory')} icon="clock" summary={t('hPastNote')}>{entries(past)}</Fold> : null}
    </View>
    <DailyAssistance />
  </HerPage>;
}
export function LegacyFriendsContent() {
  const { data, refresh, showToast, error: loadError } = useData(); const { t, lang } = useI18n();
  const [busy, setBusy] = useState<string | null>(null), [error, setError] = useState(false);
  const choose = async (id: string, status: 'accepted' | 'not-now') => {
    setBusy(id); setError(false);
    try { await api.activity(data!.home.id, id, status); await refresh(); showToast(t('saved')); } catch { setError(true); } finally { setBusy(null); }
  };
  return <View style={{gap:20}}>
    {loadError ? <StatusBanner tone="error" title={t('dsConnectionTitle')} action={{label:t('retry'),onPress:refresh}}/> : null}
    <View style={{ gap: 16 }}><AppText variant="section">{t('hStudents')}</AppText>{data?.home.students.map(s => <View key={s.id} style={{ gap: 8 }}>
      <AppText variant="bodyBold">{s.name}</AppText><AppText>{pick(lang, s.university, s.universityJa)}</AppText><AppText>{pick(lang, s.interests, s.interestsJa)}</AppText><StudentBadges student={s} />
    </View>)}</View>
    <AppText variant="section">{t('hCommunity')}</AppText>
    {error ? <StatusBanner tone="error" title={t('hSaveError')} /> : null}
    {data?.home.activities.length ? data.home.activities.map(a => <Card key={a.id}>
      <AppText variant="section">{pick(lang, a.title, a.titleJa)}</AppText><AppText>{a.date} · {pick(lang, a.place, a.placeJa)}</AppText>
      {a.companion ? <AppText>{t(a.status === 'attended' ? 'wentWith' : 'goesWith', { who: a.companion })}</AppText> : null}
      <AppText variant="caption">{t(`act_${a.status}` as Key)}</AppText>
      {a.status === 'proposed' ? <><Button label={t('hJoin')} disabled={busy !== null} busy={busy === a.id} onPress={() => choose(a.id, 'accepted')} /><Button label={t('act_not-now')} kind="secondary" disabled={busy !== null} onPress={() => choose(a.id, 'not-now')} /></> : null}
    </Card>) : <EmptyState title={t('hNothingPlanned')} message={t('hNothingBody')} />}
  </View>;
}
export function MyHomeScreen() {
  const { t } = useI18n();
  return <HerPage title={t('hMyHome')} description={t('hMyHomeLead')}>
    <Card><AppText variant="section">{t('hHelpVisitors')}</AppText>
      <Button label={t('hRequestHelp')} icon="tool" onPress={() => router.push('/her/help')} />
      <Destination label="hHelpers" href="/her/helpers" icon="users" />
      <Destination label="hSafety" href="/her/safety" icon="shield" />
      <StatusBanner title={t('dsSafetyTitle')} message={t('doorRule')} tone="warning" />
    </Card>
    <Card><AppText variant="section">{t('hAboutHome')}</AppText>
      <Destination label="hHouseInfo" href="/her/house-information" icon="info" />
      <Destination label="hDigital" href="/her/digital-house" icon="home" />
    </Card>
    <Card><AppText variant="section">{t('hHomeTechnology')}</AppText>
      <AppText variant="caption">{t('hSmartBody')}</AppText>
      <Destination label="hSmart" href="/her/smart-home" icon="power" />
    </Card>
  </HerPage>;
}
const collections = [['hBelongings', 'all'], ['hPhotos', 'photos'], ['hAudio', 'audio'], ['hStories', 'stories'], ['hDecisions', 'decisions'], ['hWishes', 'wishes'], ['hSharing', 'sharing']] as const;
export function MemoriesScreen() {
  const { t } = useI18n();
  return <HerPage title={t('hMemories')} description={t('hMemoryLead')}>
    {collections.map(([label, filter]) => <Destination key={filter} label={label} href={`/her/memories/collection?filter=${filter}`} icon={filter === 'audio' ? 'mic' : filter === 'photos' ? 'image' : 'book-open'} />)}
  </HerPage>;
}
export function CollectionScreen() {
  const { filter = 'all' } = useLocalSearchParams<{ filter?: string }>();
  const { data } = useData(); const { t, lang } = useI18n();
  const items = data?.items.filter(i => filter === 'photos' ? itemPhotos(i).length : filter === 'audio' ? i.audioUrl : filter === 'stories' ? i.story || i.storyJa : filter === 'wishes' ? i.wish : true) ?? [];
  return <HerPage back title={t(collections.find(c => c[1] === filter)?.[0] ?? 'hBelongings')}
    description={t(filter === 'wishes' ? 'hWishesNote' : filter === 'sharing' ? 'hSharingBody' : 'hMemoryLead')}>
    {filter === 'wishes' && data ? <><AppText variant="section">{t('herWishHouse')}</AppText><AppText>{t(`hwish_${data.home.future.wish}` as Key)}</AppText>
      {data.home.future.words ? <AppText>{pick(lang, data.home.future.words, data.home.future.wordsJa)}</AppText> : null}
      {data.home.future.familyNotes.map((n, index) => <AppText key={index}>{n.by}: {pick(lang, n.note, n.noteJa)}</AppText>)}</> : null}
    {items.length ? items.map(i => <View key={i.id} style={{ gap: 12, paddingVertical: 12 }}>
      <AppText variant="section">{pick(lang, i.name, i.nameJa)}</AppText><DecisionChip decision={i.decision} />
      {i.wish ? <AppText>{t('wishFrom', { name: i.wish.from })}: {t(`wish_${i.wish.kind.replace(/-/g, '_')}` as Key)}{i.wish.note ? ` · ${i.wish.note}` : ''}</AppText> : null}
      {filter === 'sharing' ? <AppText>{i.share ? t('sharedOn', { date: formatDate(i.share.at, lang) }) : t('notShared')}</AppText> : null}
      <Button label={t('hOpenItem', { name: pick(lang, i.name, i.nameJa) })} kind="secondary" onPress={() => router.push(`/her/item/${i.id}`)} />
    </View>) : <EmptyState title={t('hNoMemories')} message={t('hNoMemoriesBody')} action={{ label: t('hBelongings'), onPress: () => router.replace('/her/memories/collection?filter=all') }} />}
  </HerPage>;
}
export function HouseInformationScreen() {
  const { data } = useData(); const { t, lang } = useI18n(); const home = data?.home;
  return <HerPage back title={t('hHouseInfo')}>
    <AppText>{home ? pick(lang, home.town, home.townJa) : ''}</AppText>
    <AppText variant="section">{t('conditionTitle')}</AppText>
    {home ? CONDITION_PARTS.map(part => { const c = home.future.condition[part]; return <View key={part} style={{ gap: 8 }}>
      <AppText variant="bodyBold">{t(`part_${part}` as Key)}</AppText><AppText>{c ? t(`level_${c.level}` as Key) : t('notChecked')}</AppText>{c?.note ? <AppText>{pick(lang, c.note, c.noteJa)}</AppText> : null}
    </View>; }) : null}
    <Destination label="hWishes" href="/her/memories/collection?filter=wishes" />
    <Destination label="hDigital" href="/her/digital-house" />
  </HerPage>;
}
export function SettingsScreen() {
  const { data, refresh, showToast } = useData(); const { t } = useI18n();
  const [settings, setSettings] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(false);
  const consent = async (value: boolean) => { setBusy(true); setError(false);
    try { await api.consent(data!.home.id, value); await refresh(); showToast(t('saved')); } catch { setError(true); } finally { setBusy(false); }
  };
  return <HerPage back title={t('hSettings')}>
    <AppText variant="section">{t('hPreferences')}</AppText><Button label={t('appSettingsTitle')} icon="settings" kind="secondary" onPress={() => setSettings(true)} /><LangToggle />
    <AppSettings visible={settings} onClose={() => setSettings(false)} />
    <AppText variant="section">{t('hPrivacy')}</AppText>
    <Destination label="cProfile" href="/her/profile" icon="user" />
    <Destination label="cPrivacy" href="/her/privacy" icon="shield" />
    <AccessibleSwitch label={t('hRecording')} description={t('hRecordingBody')} value={Boolean(data?.home.consent.recording)} disabled={busy} onValueChange={consent} />
    {error ? <StatusBanner tone="error" title={t('hSaveError')} /> : null}
    <Destination label="hSharing" href="/her/memories/collection?filter=sharing" icon="eye" />
    <AppText variant="caption">{t('hPrivacyNote')}</AppText>
    <Button label={t('switchRole')} kind="secondary" onPress={() => router.replace('/')} />
  </HerPage>;
}
