import { AppText as Text } from '../../src/design-system/AppText';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Card, Columns, DecisionChip, Fold, Glyph, Screen, StatusBanner, formatDate } from '../../src/ui';
import { useData } from '../../src/data';
import { useI18n, type Key } from '../../src/i18n';
import { api } from '../../src/api';
import { CallsCard, LetterCard } from '../../src/Touchpoints';
import { ActivitiesCard, RoomCapture } from '../../src/Community';
import { FieldNotesCard, ReportCard } from '../../src/Handover';
import { PixelIcon } from '../../src/PixelIcon';
import { SaferHomeCard } from '../../src/SaferHome';
import { HouseFutureCard } from '../../src/HouseFuture';
import { ServicesCard } from '../../src/Services';
import { OutingCard } from '../../src/Outing';
import { WeatherCheckCard } from '../../src/Weather';
import { spriteFor } from '../../src/pixelArt';
import { colors, fonts, type } from '../../src/theme';

type Step = 'before' | 'with' | 'after';

export default function Visit() {
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
    <Screen wide fit header={{
      eyebrow: t('visitToday', { name: lang === 'ja' && home.seniorNameJa ? home.seniorNameJa.split(' ')[0] : home.seniorName.split(' ')[1] ?? home.seniorName }),
      title: lang === 'ja' ? current.nameJa : current.name,
    }}>
      <VisitSteps step={step} onChange={setStep} />
      {error ? <StatusBanner tone="error" title={t('rSaveError')} /> : null}
      {step === 'before' ? (
        <>
      <Columns fill scrollLeft
        left={<>
      <WeatherCheckCard />
      <Card tint>
        <Text style={type.bodyBold}>{t('beforeYouStart')}</Text>
        <Text style={type.body}>{t('beforeYouStartBody')}</Text>
      </Card>
      <Card>
        <Text style={type.section}>{t('consentTitle')}</Text>
        <Text style={type.body}>{home.consent.recording ? t('consentGiven', { date: formatDate(home.consent.at ?? '', lang) }) : t('consentMissing')}</Text>
        <Button label={home.consent.recording ? t('consentWithdraw') : t('consentYes')} kind={home.consent.recording ? 'secondary' : 'primary'}
          icon={home.consent.recording ? 'x-circle' : 'check-circle'} busy={busy} onPress={() => setConsent(!home.consent.recording)} />
      </Card>
        </>}
        right={<FieldNotesCard />}
      />
          <Button label={t('stepNextWith')} icon="chevron-right" onPress={() => setStep('with')} />
        </>
      ) : step === 'with' ? (
        <>
      <Columns fill scrollLeft
        left={<>
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
        </>}
        right={<>
      <Text style={[type.section, { marginTop: 6 }]}>{t('moreWithHer')}</Text>
      <Fold title={t('roomPhotosTitle')} icon="image" summary={t('foldPhotos', { n: current.photos.length })}>
        <RoomCapture roomId={current.id} />
      </Fold>
      <Fold title={t('saferTitle')} icon="shield" summary={t('foldSafer', { agreed: home.safety.filter((f) => f.status === 'agreed').length, suggested: home.safety.filter((f) => f.status === 'suggested').length })}>
        <SaferHomeCard mode="student" roomId={current.id} />
      </Fold>
      <Fold title={t('servicesTitle')} icon="tool" summary={t('foldHelp', { booked: home.services.filter((s) => s.status === 'booked').length, asked: home.services.filter((s) => s.status === 'requested').length })}>
        <ServicesCard mode="student" />
      </Fold>
      <Fold title={t('futureTitle')} icon="home" summary={t('foldFuture', { wish: t(`hwish_${home.future.wish}` as Key) })}>
        <HouseFutureCard mode="student" />
      </Fold>
      <Fold title={t('fromHomeToCommunity')} icon="map-pin" summary={t('foldActivities', { n: home.activities.filter((a) => a.status === 'accepted').length })}>
        <ActivitiesCard mode="student" />
        <OutingCard />
      </Fold>
        </>}
      />
          <Button label={t('stepNextAfter')} icon="chevron-right" onPress={() => setStep('after')} />
        </>
      ) : (
      <Columns fill scrollLeft
        left={<ReportCard />}
        right={<>
      <LetterCard mode="student" />
      <CallsCard mode="student" />
        </>}
      />
      )}
    </Screen>
  );
}

// A visit is a sequence: before you go in, with her, and after you leave.
function VisitSteps({ step, onChange }: { step: Step; onChange: (s: Step) => void }) {
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
            style={{ minHeight: 60, maxWidth: '100%', justifyContent: 'center', flexDirection: 'row', alignItems: 'center', flexBasis: 160, flexGrow: 1, padding: 12, borderRadius: 12, backgroundColor: on ? colors.night : colors.sheet, borderWidth: 2, borderColor: colors.line, gap: 12 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: on ? colors.kakiNight : colors.inkSoft }}>{i + 1}</Text>
            <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: on ? colors.onNight : colors.ink }}>{label}</Text>
          </Pressable>
        );
      })}
      </View>
    </View>
  );
}
