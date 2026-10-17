import React, { useState } from 'react';
import { View } from 'react-native';
import { useI18n } from '../src/i18n';
import { spacing } from '../src/theme';
import { AppText, ConfirmationDialog, EmptyState, Field, PrimaryButton, SecondaryButton, TertiaryButton, DestructiveButton, IconButton,
  IconLabelButton, ScreenFrame, StatusBanner, TopBar, ToastFeedback, UpcomingVisitCard, MemoryCard,
  FriendRecommendationCard, HomeAssistanceCard, DeviceControlCard, ReminderCard, SafetyCard, ReadConfirm, Fold, TaskWorkspace } from '../src/ui';

// An independent component reference, with explicit illustrative content and no mutations.
export default function DesignSystemReference() {
  const { t } = useI18n();
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [light, setLight] = useState(false);
  const [read, setRead] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState(true);
  const showExample = () => setToast(t('dsExampleStatusBody'));
  return <ScreenFrame wide title={t('dsShowcaseTitle')} description={t('dsShowcaseLead')} toolbar={<TopBar back />}>
    <StatusBanner title={t('dsExampleStatus')} message={t('dsExampleStatusBody')} />
    <TaskWorkspace defaultTask="controls" tasks={[
      { id: 'controls', label: t('dsExampleControls'), icon: 'sliders', content: <>
    <View style={{ gap: spacing.xl }}>
      <AppText variant="section">{t('dsExampleControls')}</AppText>
      <PrimaryButton label={t('dsExampleSend')} icon="check" onPress={() => {
        if (!note.trim()) { setError(t('dsExampleError')); return; }
        setError(''); setToast(t('dsExampleSuccess'));
      }} />
      <SecondaryButton label={t('dsExampleAction')} onPress={showExample} />
      <TertiaryButton label={t('dsExampleAction')} onPress={showExample} />
      <SecondaryButton label={t('dsExampleAction')} selected={selected} onPress={() => setSelected(value => !value)} />
      <IconLabelButton label={t('dsExampleAction')} icon="image" kind="secondary" onPress={showExample} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        <IconButton label={t('dsExampleAction')} icon="image" onPress={showExample} />
        <IconButton label={t('dsExampleAction')} icon="image" selected onPress={showExample} />
        <IconButton label={t('dsExampleAction')} icon="image" disabled onPress={showExample} />
        <IconButton label={t('dsLoading')} icon="image" busy onPress={showExample} />
      </View>
      <DestructiveButton label={t('dsExampleRemove')} icon="trash-2" onPress={() => setConfirm(true)} />
      <PrimaryButton label={t('dsLoading')} onPress={() => {}} busy />
      <SecondaryButton label={t('dsExampleAction')} onPress={() => {}} disabled />
      <Field label={t('dsExampleInput')} hint={t('dsExampleInputHint')} error={error} value={note} onChangeText={setNote} multiline required />
      <ReadConfirm label={t('readReport')} checked={read} onChange={setRead} />
      <Fold title={t('dsExampleMemory')} summary={t('dsExampleMemoryBody')}><AppText>{t('dsExampleMemoryBody')}</AppText></Fold>
    </View>
      </> },
      { id: 'cards', label: t('dsExampleMemory'), icon: 'layout', content: <>
    <UpcomingVisitCard title={t('dsExampleVisit')} description={t('dsExampleVisitBody')} />
    <MemoryCard title={t('dsExampleMemory')} description={t('dsExampleMemoryBody')} action={{ label: t('dsExampleAction'), onPress: showExample }} />
    <FriendRecommendationCard title={t('dsExampleFriend')} description={t('dsExampleFriendBody')} action={{ label: t('dsExampleAction'), onPress: showExample }} />
    <HomeAssistanceCard title={t('dsExampleHome')} description={t('dsExampleHomeBody')} />
    <DeviceControlCard title={t('dsExampleDevice')} description={t('dsExampleDeviceBody')} controlLabel={t('dsExampleSwitch')} value={light} onValueChange={setLight} />
    <ReminderCard title={t('dsExampleReminder')} description={t('dsExampleReminderBody')} />
    <SafetyCard title={t('dsSafetyTitle')} description={t('doorRule')} />
      </> },
      { id: 'feedback', label: t('dsExampleStatus'), icon: 'info', content: <>
    <EmptyState title={t('dsExampleEmpty')} message={t('dsExampleEmptyBody')} />
      </> },
    ]} />
    <ConfirmationDialog visible={confirm} title={t('dsExampleConfirmTitle')} message={t('dsExampleConfirmBody')}
      destructive confirmLabel={t('dsExampleRemove')} onCancel={() => setConfirm(false)}
      onConfirm={() => { setNote(''); setError(''); setConfirm(false); }} />
    <ToastFeedback message={toast} onDismiss={() => setToast(null)} />
  </ScreenFrame>;
}
