import { useAccessibilityPreferences } from './design-system/preferences';
import { AppText as Text } from './design-system/AppText';
import React, { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { READINESS, isReady, pick, type ActivityStatus, type CommunityActivity, type Student } from '@kakehashi/shared';
import { StatusBanner, Avatar, Button, Card, Pill, formatDate } from './ui';
import { useData } from './data';
import { useI18n, type Key } from './i18n';
import { api, fileUrl } from './api';
import { colors, type } from './theme';

const actKey = (s: ActivityStatus) => `act_${s}` as Key;
const actTone: Record<ActivityStatus, { fg: string; bg: string }> = {
  suggested: { fg: colors.inkSoft, bg: colors.paper },
  proposed: { fg: colors.ai, bg: colors.aiTint },
  accepted: { fg: colors.moss, bg: colors.mossTint },
  'not-now': { fg: colors.inkSoft, bg: colors.paper },
  attended: { fg: colors.plum, bg: colors.plumTint },
};

// Badges that show the family the students are trained and checked.
export function StudentBadges({ student }: { student: Student }) {
  const { palette: colors } = useAccessibilityPreferences();
  const { t } = useI18n();
  const done = READINESS.filter((r) => student.passed[r]).length;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {isReady(student)
        ? <Pill label={t('readyBadge')} color={colors.moss} bg={colors.mossTint} />
        : <Pill label={t('inTraining', { done, total: READINESS.length })} color={colors.kaki} bg={colors.kakiTint} />}
      {student.passed.dementia ? <Pill label={t('dementiaBadge')} /> : null}
      {student.visits > 0 ? <Pill label={t('visitsCount', { n: student.visits })} color={colors.plum} bg={colors.plumTint} /> : null}
    </View>
  );
}

export function StudentsCard() {
  const { data } = useData();
  const { t, lang } = useI18n();
  if (!data) return null;
  return (
    <Card>
      <Text style={type.section}>{t('yourStudents')}</Text>
      {data.home.students.map((s, i) => (
        <View key={s.id} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'flex-start', paddingTop: i ? 8 : 0 }}>
          <Avatar initial={s.initial} tone={i % 2 ? 'moss' : 'plum'} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={type.bodyBold}>{s.name} · <Text style={type.caption}>{pick(lang, s.university, s.universityJa)}</Text></Text>
            {s.role === 'trainee' ? <Text style={type.caption}>{t('traineeRole')}</Text> : null}
            <StudentBadges student={s} />
          </View>
        </View>
      ))}
    </Card>
  );
}

// From home to community: activities matched to her interests. Students propose; she decides.
export function ActivitiesCard({ mode }: { mode: 'family' | 'student' }) {
  const { palette: colors } = useAccessibilityPreferences();
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!data) return null;
  const { home } = data;
  const list = mode === 'family' ? home.activities.filter((a) => a.status !== 'suggested' && a.status !== 'not-now') : home.activities;

  const set = async (a: CommunityActivity, status: ActivityStatus) => {
    setBusy(a.id); setError(null);
    try { await api.activity(home.id, a.id, status); await refresh(); showToast(t(actKey(status))); } catch { setError(t('rSaveError')); } finally { setBusy(null); }
  };

  return (
    <Card>
      <Text style={type.section}>{t('fromHomeToCommunity')}</Text>
      {mode === 'student' ? <Text style={type.caption}>{t('activitiesLead')}</Text> : null}
      {error ? <StatusBanner tone="error" title={error} /> : null}
      {list.map((a) => (
        <View key={a.id} style={{ gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <Text style={[type.bodyBold, { flex: 1 }]}>{pick(lang, a.title, a.titleJa)}</Text>
            <Pill label={t(actKey(a.status))} color={actTone[a.status].fg} bg={actTone[a.status].bg} />
          </View>
          <Text style={type.caption}>{a.date} · {pick(lang, a.place, a.placeJa)}{a.companion ? ` · ${t(a.status === 'attended' ? 'wentWith' : 'goesWith', { who: a.companion })}` : ''}</Text>
          {mode === 'student' ? (
            <>
              <Text style={type.caption}>{t('matchesInterest', { interest: pick(lang, a.interest, a.interestJa) })}</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {a.status === 'suggested' || a.status === 'not-now'
                  ? <Button label={t('propose')} kind="secondary" busy={busy === a.id} onPress={() => set(a, 'proposed')} /> : null}
                {a.status === 'proposed' ? (
                  <>
                    <Button label={t('sheSaidYes')} busy={busy === a.id} onPress={() => set(a, 'accepted')} />
                    <Button label={t('act_not-now')} kind="secondary" onPress={() => set(a, 'not-now')} />
                  </>
                ) : null}
                {a.status === 'accepted' ? <Button label={t('markAttended')} kind="secondary" busy={busy === a.id} onPress={() => set(a, 'attended')} /> : null}
              </View>
            </>
          ) : null}
        </View>
      ))}
    </Card>
  );
}

function Thumbs({ photos }: { photos: string[] }) {
  const { palette: colors } = useAccessibilityPreferences();
  const { t } = useI18n();
  if (photos.length === 0) return <Text style={type.caption}>{t('noPhotos')}</Text>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {photos.map((p) => (
        <Image key={p} source={{ uri: fileUrl(p) }} style={{ width: 96, height: 72, borderRadius: 8, backgroundColor: colors.line }} accessibilityLabel={t('rRoomPhoto')} />
      ))}
    </ScrollView>
  );
}

// Students capture the room they are working in today.
export function RoomCapture({ roomId }: { roomId: string }) {
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const room = data?.home.rooms.find((r) => r.id === roomId);
  if (!data || !room) return null;

  const add = async (camera: boolean) => {
    setError(null);
    try {
      if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) { setError(t('rCameraDenied')); return; }
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.5, base64: true };
      const r = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      const a = r.assets?.[0];
      if (r.canceled || !a?.base64) return;
      setBusy(true);
      await api.roomPhoto(data.home.id, room.id, a.base64, a.mimeType ?? 'image/jpeg');
      await refresh();
      showToast(t('saved'));
    } catch (e) {
      setError(t('rSaveError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <Text style={type.section}>{t('roomCaptureTitle')} · {lang === 'ja' ? room.nameJa : room.name}</Text>
      <Text style={type.caption}>{t('roomCaptureLead')}</Text>
      <Thumbs photos={room.photos} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <View style={{ flexBasis: 180, flexGrow: 1, flexShrink: 1, minWidth: 0 }}><Button label={t('takePhoto')} icon="camera" busy={busy} onPress={() => add(true)} /></View>
        <View style={{ flexBasis: 180, flexGrow: 1, flexShrink: 1, minWidth: 0 }}><Button label={t('choosePhoto')} icon="image" kind="secondary" onPress={() => add(false)} /></View>
      </View>
      {error ? <StatusBanner tone="error" title={error} /> : null}
    </Card>
  );
}

// The family sees each room's real photos under the digital 実家.
export function RoomGallery() {
  const { palette: colors } = useAccessibilityPreferences();
  const { data } = useData();
  const { t, lang } = useI18n();
  if (!data) return null;
  return (
    <Card>
      <Text style={type.section}>{t('roomsTitle')}</Text>
      {data.home.rooms.map((r) => (
        <View key={r.id} style={{ gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
          <Text style={type.bodyBold}>{lang === 'ja' ? r.nameJa : r.name}
            <Text style={type.caption}>{r.capturedAt ? `  ·  ${t('capturedOn', { date: formatDate(r.capturedAt, lang) })} · ${t('photosCount', { n: r.photos.length })}` : ''}</Text>
          </Text>
          <Thumbs photos={r.photos} />
        </View>
      ))}
    </Card>
  );
}
