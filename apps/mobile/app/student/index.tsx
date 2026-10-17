import { useAccessibilityPreferences } from '../../src/design-system/preferences';
import { AppText as Text } from '../../src/design-system/AppText';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Card, DecisionChip, Fold, Screen, TaskWorkspace, TaskPanel, StatusBanner, formatDate } from '../../src/ui';
import { useData } from '../../src/data';
import { useI18n } from '../../src/i18n';
import { api } from '../../src/api';
import { CallsCard, LetterCard } from '../../src/Touchpoints';
import { ActivitiesCard, RoomCapture, StudentsCard } from '../../src/Community';
import { FieldNotesCard, ReportCard } from '../../src/Handover';
import { PixelIcon } from '../../src/PixelIcon';
import { SaferHomeCard } from '../../src/SaferHome';
import { HouseFutureCard } from '../../src/HouseFuture';
import { ServicesCard } from '../../src/Services';
import { OutingCard } from '../../src/Outing';
import { WeatherCheckCard } from '../../src/Weather';
import { spriteFor } from '../../src/pixelArt';
import { fonts, type } from '../../src/theme';

type Step = 'before' | 'with' | 'after';

export default function Visit() {
  const { palette: colors } = useAccessibilityPreferences();
  const { data, refresh } = useData();
  const { t, lang } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [step, setStep] = useState<Step>('before');
  if (!data) return <Screen>{null}</Screen>;
  const { home } = data;
  const current = home.rooms.find((r) => r.status === 'now') ?? home.rooms[0];
  const roomItems = data.items.filter((i) => i.roomId === current.id);
  const otherItems = data.items.filter((i) => i.roomId !== current.id && i.decision === 'open');

  const setConsent = async (recording: boolean) => {
    setBusy(true);
    setError(false);
    try { await api.consent(home.id, recording); await refresh(); }
    catch { setError(true); } finally { setBusy(false); }
  };

  return (
    <Screen wide header={{
      eyebrow: t('visitToday', { name: lang === 'ja' && home.seniorNameJa ? home.seniorNameJa.split(' ')[0] : home.seniorName.split(' ')[1] ?? home.seniorName }),
      title: lang === 'ja' ? current.nameJa : current.name,
    }}>
      <VisitSteps step={step} onChange={setStep} />
      {error ? <StatusBanner tone="error" title={t('rSaveError')} /> : null}
      <TaskPanel active={step === 'before'}>
        <TaskWorkspace tasks={[
          { id: 'weather', label: t('hWeather'), icon: 'cloud', content: <WeatherCheckCard /> },
          { id: 'consent', label: t('consentTitle'), icon: 'shield', description: home.consent.recording ? t('consentGiven', { date: formatDate(home.consent.at ?? '', lang) }) : t('consentMissing'), content: <>
      <Card>
        <Text style={type.section}>{t('consentTitle')}</Text>
        <Text style={type.body}>{home.consent.recording ? t('consentGiven', { date: formatDate(home.consent.at ?? '', lang) }) : t('consentMissing')}</Text>
        <Button label={home.consent.recording ? t('consentWithdraw') : t('consentYes')} kind={home.consent.recording ? 'secondary' : 'primary'}
          icon={home.consent.recording ? 'x-circle' : 'check-circle'} busy={busy} onPress={() => setConsent(!home.consent.recording)} />
      </Card>
          </> },
          { id: 'preparation', label: t('uxPreparation'), icon: 'clipboard', content: <>
      <Card tint>
        <Text style={type.bodyBold}>{t('beforeYouStart')}</Text>
        <Text style={type.body}>{t('beforeYouStartBody')}</Text>
      </Card>
            <FieldNotesCard />
          </> },
        ]} />
        <Button label={t('stepNextWith')} icon="chevron-right" onPress={() => setStep('with')} />
      </TaskPanel>
      <TaskPanel active={step === 'with'}>
        <TaskWorkspace tasks={[
          { id: 'belongings', label: t('uxBelongingsMemories'), icon: 'book-open', content: <>
      <Text style={type.section}>{t('items')}</Text>
      {[...roomItems, ...otherItems].map((it) => (
        <Pressable key={it.id} accessibilityRole="button" onPress={() => router.push(`/item/${it.id}?as=student`)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.sheet }}>
          <PixelIcon sprite={spriteFor(it)} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={type.bodyBold}>{lang === 'ja' && it.nameJa ? it.nameJa : it.name}</Text>
            <DecisionChip decision={it.decision} />
          </View>
          <Feather name="chevron-right" size={18} color={colors.inkSoft} />
        </Pressable>
      ))}
      <Button label={t('tabAdd')} kind="secondary" icon="camera" onPress={() => router.push('/student/add')} />
            <Fold title={t('roomPhotosTitle')} icon="image" summary={t('foldPhotos', { n: current.photos.length })}><RoomCapture roomId={current.id} /></Fold>
          </> },
          { id: 'safety', label: t('uxSafetyFuture'), icon: 'shield', content: <>
            <SaferHomeCard mode="student" roomId={current.id} />
            <Fold title={t('futureTitle')} icon="home"><HouseFutureCard mode="student" /></Fold>
          </> },
          { id: 'assistance', label: t('uxAssistanceWorkers'), icon: 'tool', content: <ServicesCard mode="student" /> },
          { id: 'activities', retain: false, label: t('uxActivitiesOutings'), icon: 'map-pin', content: <>
            <ActivitiesCard mode="student" /><TaskPanel active={step === 'with'} retain={false}><OutingCard /></TaskPanel>
          </> },
          { id: 'notes', label: t('uxNotesPeople'), icon: 'clipboard', content: <>
            <FieldNotesCard /><Fold title={t('studentsTitleShort')} icon="users"><StudentsCard /></Fold>
          </> },
        ]} />
        <Button label={t('stepNextAfter')} icon="chevron-right" onPress={() => setStep('after')} />
      </TaskPanel>
      <TaskPanel active={step === 'after'}>
        <TaskWorkspace tasks={[
          { id: 'report', label: t('uxVisitReport'), icon: 'file-text', content: <ReportCard /> },
          { id: 'letters', label: t('uxLetters'), icon: 'mail', content: <LetterCard mode="student" /> },
          { id: 'calls', label: t('uxCalls'), icon: 'phone', content: <CallsCard mode="student" /> },
        ]} />
      </TaskPanel>
    </Screen>
  );
}

// A visit is a sequence: before you go in, with her, and after you leave.
function VisitSteps({ step, onChange }: { step: Step; onChange: (s: Step) => void }) {
  const { palette: colors } = useAccessibilityPreferences();
  const { t } = useI18n();
  const steps: [Step, string][] = [['before', t('stepBefore')], ['with', t('stepWith')], ['after', t('stepAfter')]];
  return (
    <View style={{ gap: 12 }}>
      <Text variant="caption" accessibilityLiveRegion="polite">{t('rVisitProgress', { step: steps.findIndex(([key]) => key === step) + 1 })}</Text>
      <View role="tablist" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {steps.map(([k, label], i) => {
        const on = step === k;
        return (
          <Pressable key={k} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: on }} aria-selected={on} onPress={() => onChange(k)}
            style={{ minHeight: 60, maxWidth: '100%', justifyContent: 'center', flexDirection: 'row', alignItems: 'center', flexBasis: 160, flexGrow: 1, padding: 12, borderRadius: 12, backgroundColor: on ? colors.secondary : colors.sheet, borderWidth: 2, borderColor: on ? colors.primary : 'transparent', gap: 12 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: on ? colors.primary : colors.inkSoft }}>{i + 1}</Text>
            <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: on ? colors.primary : colors.ink }}>{label}</Text>
          </Pressable>
        );
      })}
      </View>
    </View>
  );
}
