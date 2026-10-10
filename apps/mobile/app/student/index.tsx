import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Button, Card, DecisionChip, Glyph, Heading, Screen, formatDate } from '../../src/ui';
import { useData } from '../../src/data';
import { useI18n } from '../../src/i18n';
import { api } from '../../src/api';
import { CallsCard, LetterCard } from '../../src/Touchpoints';
import { ActivitiesCard, RoomCapture } from '../../src/Community';
import { FieldNotesCard, ReportCard } from '../../src/Handover';
import { PixelIcon } from '../../src/PixelIcon';
import { SaferHomeCard } from '../../src/SaferHome';
import { HouseFutureCard } from '../../src/HouseFuture';
import { ServicesCard } from '../../src/Services';
import { OutingCard } from '../../src/Outing';
import { spriteFor } from '../../src/pixelArt';
import { colors, fonts, type } from '../../src/theme';

type Step = 'before' | 'with' | 'after';

export default function Visit() {
  const { data, refresh } = useData();
  const { t, lang } = useI18n();
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<Step>('before');
  if (!data) return <Screen>{null}</Screen>;
  const { home } = data;
  const current = home.rooms.find((r) => r.status === 'now') ?? home.rooms[0];
  const roomItems = data.items.filter((i) => i.roomId === current.id);
  const otherItems = data.items.filter((i) => i.roomId !== current.id && i.decision === 'open');

  const setConsent = async (recording: boolean) => {
    setBusy(true);
    try { await api.consent(home.id, recording); await refresh(); } finally { setBusy(false); }
  };

  return (
    <Screen>
      <Heading eyebrow={t('visitToday', { name: lang === 'ja' && home.seniorNameJa ? home.seniorNameJa.split(' ')[0] : home.seniorName.split(' ')[1] ?? home.seniorName })} title={lang === 'ja' ? current.nameJa : current.name} />
      <VisitSteps step={step} onChange={setStep} />
      {step === 'before' ? (
        <>
      <Card tint>
        <Text style={type.bodyBold}>{t('beforeYouStart')}</Text>
        <Text style={type.body}>{t('beforeYouStartBody')}</Text>
      </Card>
      <FieldNotesCard />
      <Card>
        <Text style={type.section}>{t('consentTitle')}</Text>
        <Text style={type.body}>{home.consent.recording ? t('consentGiven', { date: formatDate(home.consent.at ?? '', lang) }) : t('consentMissing')}</Text>
        <Button label={home.consent.recording ? t('consentWithdraw') : t('consentYes')} kind={home.consent.recording ? 'secondary' : 'primary'}
          icon={home.consent.recording ? 'x-circle' : 'check-circle'} busy={busy} onPress={() => setConsent(!home.consent.recording)} />
      </Card>
          <Button label={t('stepNextWith')} icon="chevron-right" onPress={() => setStep('with')} />
        </>
      ) : step === 'with' ? (
        <>
      <RoomCapture roomId={current.id} />
      <SaferHomeCard mode="student" roomId={current.id} />
      <ServicesCard mode="student" />
      <HouseFutureCard mode="student" />
      <Text style={type.section}>{t('items')}</Text>
      {[...roomItems, ...otherItems].map((it) => (
        <Pressable key={it.id} accessibilityRole="button" onPress={() => router.push(`/item/${it.id}?as=student`)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.sheet }}>
          <PixelIcon sprite={spriteFor(it)} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={type.bodyBold}>{lang === 'ja' && it.nameJa ? it.nameJa : it.name}</Text>
            <DecisionChip decision={it.decision} />
          </View>
          <Feather name={it.tagCode ? 'grid' : 'chevron-right'} size={18} color={it.tagCode ? colors.ai : colors.inkSoft} />
        </Pressable>
      ))}
      <Button label={t('tabAdd')} kind="secondary" icon="camera" onPress={() => router.push('/student/add')} />
      <ActivitiesCard mode="student" />
      <OutingCard />
          <Button label={t('stepNextAfter')} icon="chevron-right" onPress={() => setStep('after')} />
        </>
      ) : (
        <>
      <ReportCard />
      <LetterCard mode="student" />
      <CallsCard mode="student" />
        </>
      )}
    </Screen>
  );
}

// A visit is a sequence: before you go in, with her, and after you leave.
function VisitSteps({ step, onChange }: { step: Step; onChange: (s: Step) => void }) {
  const { t } = useI18n();
  const steps: [Step, string][] = [['before', t('stepBefore')], ['with', t('stepWith')], ['after', t('stepAfter')]];
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {steps.map(([k, label], i) => {
        const on = step === k;
        return (
          <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(k)}
            style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, backgroundColor: on ? colors.ai : colors.sheet, borderWidth: on ? 0 : 1, borderColor: colors.line, gap: 2 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: on ? colors.aiTint : colors.inkSoft }}>{i + 1}</Text>
            <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: on ? colors.sheet : colors.ink }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
