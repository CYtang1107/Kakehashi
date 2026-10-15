import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { AppText, Button, Card, ConfirmationDialog, Field, Fold, ReadConfirm, StatusBanner } from '../../ui';
import { useData } from '../../data';
import { useI18n, type Key } from '../../i18n';
import { householdDay } from '../../her/plans';
import { FeaturePage } from '../FeaturePage';
import { useEverCircle } from '../store';
import { companionContext } from '../companion/bridge';
import { matchingSummary } from '../privacy/permissions';
import { ACTIVITIES, COMMUNICATION, INTERESTS, LANGUAGES, LOCATIONS, TIMES, type InterestId, type Profile } from './model';
import { PendingInterests, interestKey } from './PendingInterests';

function Options<T extends string>({ title, values, selected, disabled, onChange }: {
  title: Key; values: readonly T[]; selected: T[]; disabled: boolean; onChange: (values: T[]) => void;
}) {
  const { t } = useI18n();
  return <Fold title={t(title)} summary={selected.length ? selected.map(id => t(`cOption_${id}` as Key)).join(' · ') : t('cOptionsHint')}>
    {values.map(value => <ReadConfirm key={value} label={t(`cOption_${value}` as Key)} checked={selected.includes(value)} disabled={disabled}
      onChange={() => onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value])} />)}
  </Fold>;
}
export function ProfileScreen() {
  const { t, lang } = useI18n(), { data } = useData(); const store = useEverCircle();
  const context = companionContext(data, householdDay());
  const namedProfile = (): Profile => ({ ...store.saved.profile, displayName: store.saved.profile.displayName || (lang === 'ja' ? context.nameJa : context.name) });
  const [draft, setDraft] = useState(namedProfile), [dirty, setDirty] = useState(false);
  const [feedback, setFeedback] = useState<Key | null>(null);
  const [edit, setEdit] = useState<InterestId | null>(null), [replacement, setReplacement] = useState<InterestId>('gardening'), [deleting, setDeleting] = useState<InterestId | null>(null);
  const busy = store.storageStatus === 'saving';
  const eligible = matchingSummary(store.saved, store.storageStatus === 'ready' || store.storageStatus === 'session').interests;
  useEffect(() => { if (!dirty) setDraft(namedProfile()); }, [store.saved.profile, lang, context.name, context.nameJa, dirty]);
  useEffect(() => { setDraft(namedProfile()); setDirty(false); setFeedback(null); setEdit(null); setDeleting(null); }, [store.resetEpoch]);
  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => { setDraft(previous => ({ ...previous, [key]: value })); setDirty(true); setFeedback(null); };
  return <FeaturePage title="cProfile" description="cProfileLead">
    <Button label={t('cPrivacy')} kind="secondary" icon="shield" onPress={() => router.push('/her/privacy')} />
    <AppText variant="caption">{t('cDemoOnly')}</AppText>
    {feedback ? <StatusBanner title={t(feedback)} tone="success" /> : null}
    <View style={{ gap: 16 }}><AppText variant="section">{t('cHobbies')}</AppText>
      {!store.saved.approved.length ? <AppText>{t('cNoInterests')}</AppText> : store.saved.approved.map(interest => <Card key={interest.id}>
        <AppText variant="bodyBold">{t(interestKey(interest.id))}</AppText>
        <AppText variant="caption">{t(eligible.includes(interest.id) ? 'cShared' : 'cPrivate')}</AppText>
        <Button label={t('cEdit')} accessibilityLabel={t('cEdit') + ': ' + t(interestKey(interest.id))} kind="secondary" disabled={busy} onPress={() => { setEdit(interest.id); setReplacement(interest.id); }} />
        <Button label={t('cDelete')} accessibilityLabel={t('cDelete') + ': ' + t(interestKey(interest.id))} kind="danger" disabled={busy} onPress={() => setDeleting(interest.id)} />
      </Card>)}
    </View>
    <PendingInterests />
    <Field label={t('cDisplayName')} value={draft.displayName} maxLength={60} editable={!busy} onChangeText={value => update('displayName', value)} />
    <AppText variant="caption">{t('cOptionsHint')}</AppText>
    <Options title="cLanguages" values={LANGUAGES} selected={draft.languages} disabled={busy} onChange={value => update('languages', value)} />
    <Options title="cActivities" values={ACTIVITIES} selected={draft.activities} disabled={busy} onChange={value => update('activities', value)} />
    <Options title="cTimes" values={TIMES} selected={draft.times} disabled={busy} onChange={value => update('times', value)} />
    <Options title="cCommunication" values={COMMUNICATION} selected={draft.communication} disabled={busy} onChange={value => update('communication', value)} />
    <Options title="cLocations" values={LOCATIONS} selected={draft.locations} disabled={busy} onChange={value => update('locations', value)} />
    <Button label={t('cSaveProfile')} icon="check" busy={busy} disabled={!dirty} onPress={() => { setFeedback(null); store.change({ type: 'profile', profile: draft }).then(ok => { if (ok) { setDirty(false); setFeedback('cProfileSaved'); } }); }} />
    <Button label={t('hCompanion')} kind="secondary" onPress={() => router.navigate('/her/companion')} />
    <ConfirmationDialog visible={edit !== null} title={t('cEditTitle')} message={t('cEditBody')} busy={busy} confirmLabel={t('cSaveChanges')}
      onCancel={() => setEdit(null)} onConfirm={() => { if (edit) store.change({ type: 'edit', id: edit, replacement }).then(ok => { setEdit(null); if (ok) setFeedback('cEdited'); }); }}>
      {INTERESTS.map(id => <Button key={id} label={t(interestKey(id))} kind="secondary" selected={replacement === id} disabled={busy || store.saved.approved.some(i => i.id === id && id !== edit)} onPress={() => setReplacement(id)} />)}
    </ConfirmationDialog>
    <ConfirmationDialog visible={deleting !== null} title={t('cDeleteTitle', { interest: deleting ? t(interestKey(deleting)) : '' })}
      message={t('cDeleteBody')} destructive busy={busy} confirmLabel={t('cDelete')} onCancel={() => setDeleting(null)}
      onConfirm={() => { if (deleting) store.change({ type: 'delete', id: deleting }).then(ok => { setDeleting(null); if (ok) setFeedback('cDeleted'); }); }} />
  </FeaturePage>;
}
