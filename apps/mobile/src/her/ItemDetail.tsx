import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CHOICES, pick, type Decision, type Item } from '@kakehashi/shared';
import { AppText, Button, Card, ConfirmationDialog, DecisionChip, Field, StatusBanner } from '../ui';
import { HerPage } from './HerPage';
import { useData } from '../data';
import { useI18n, type Key } from '../i18n';
import { api } from '../api';
import { AddPhotoCard, PhotoCarousel } from '../PhotoCarousel';
import { StoryPlayer, StoryRecorder } from '../Audio';
import { ShareCard } from '../StoryShare';
import { Journey } from '../Journey';
import { Worth } from '../ItemWorth';
import { TrackMap, isTrackable } from '../TrackMap';
import { formatDate } from '../ui';
import { householdDay } from './plans';
import { Destination } from './Screens';

export function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, replaceItem, showToast } = useData(); const { t, lang } = useI18n();
  const item = data?.items.find(i => i.id === id);
  const [decision, setDecision] = useState<Decision | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(false);
  const [draft, setDraft] = useState({ itemId: item?.id, language: lang, value: item ? pick(lang, item.story, item.storyJa) : '', original: item ? pick(lang, item.story, item.storyJa) : '' });
  // A clean editor follows the displayed translation. A dirty editor keeps its language and text.
  useEffect(() => {
    setDraft(previous => {
      if (previous.itemId === item?.id && previous.value !== previous.original) return previous;
      const value = item ? pick(lang, item.story, item.storyJa) : '';
      return { itemId: item?.id, language: lang, value, original: value };
    });
  }, [item?.id, item?.story, item?.storyJa, lang]);
  const save = async (fn: () => Promise<Item>) => { setBusy(true); setError(false);
    try { replaceItem(await fn()); setDecision(null); showToast(t('saved')); return true; } catch { setError(true); return false; } finally { setBusy(false); }
  };
  const name = item ? pick(lang, item.name, item.nameJa) : t('hBelongings');
  return <HerPage back title={name}>
    {!item ? <Destination label="hBackMemories" href="/her/memories" /> : <>
      <PhotoCarousel item={item} />
      {item.story || item.storyJa ? <AppText variant="story">{pick(lang, item.story, item.storyJa)}</AppText> : null}
      {item.audioUrl ? <StoryPlayer path={item.audioUrl} /> : null}
      <View style={{ gap: 16 }}><AppText variant="section">{t('hChoice')}</AppText><AppText>{t('hMemoryLead')}</AppText><DecisionChip decision={item.decision} />
        {item.wish ? <AppText>{t('wishFrom', { name: item.wish.from })}: {t(`wish_${item.wish.kind.replace(/-/g, '_')}` as Key)}{item.wish.note ? ` · ${item.wish.note}` : ''}</AppText> : null}
        {CHOICES.map(d => <Button key={d} label={t(`decision_${d}`)} kind="secondary" selected={item.decision === d} disabled={busy}
          onPress={() => d === 'open' ? save(() => api.update(item.id, { decision: d })) : setDecision(d)} />)}
      </View>
      {error ? <StatusBanner tone="error" title={t('hSaveError')} /> : null}
      <ConfirmationDialog visible={decision !== null} title={t('hReviewDecision')} busy={busy}
        message={decision ? t('hDecisionBody', { name, decision: t(`decision_${decision}`) }) : ''}
        confirmLabel={decision ? t(`decision_${decision}`) : t('dsConfirm')} onCancel={() => { setDecision(null); setError(false); }}
        onConfirm={() => decision && save(() => api.update(item.id, { decision }))}>
        {error ? <StatusBanner tone="error" title={t('hSaveError')} /> : null}
      </ConfirmationDialog>
      {item.holdUntil && householdDay() < item.holdUntil ? <AppText>{t('heldUntil', { date: formatDate(item.holdUntil, lang) })}</AppText> : null}
      <AddPhotoCard item={item} author={data?.home.seniorName} />
      <Card><AppText variant="section">{t('hStories')}</AppText><Field label={t('hYourStory')} multiline editable={!busy} value={draft.value} onChangeText={value => setDraft(previous => ({ ...previous, value }))} />
        {draft.language !== lang ? <AppText variant="caption">{t('hDraftLanguage', { language: draft.language === 'ja' ? '日本語' : 'English' })}</AppText> : null}
        <Button label={t('saveStory')} kind="secondary" busy={busy} disabled={draft.value === draft.original}
          onPress={() => save(() => api.update(item.id, { story: draft.value })).then(ok => { if (ok) setDraft(previous => ({ ...previous, original: previous.value })); })} />
        <StoryRecorder item={item} consent={Boolean(data?.home.consent.recording)} onSaved={it => { replaceItem(it); showToast(t('recordingSaved')); }} />
      </Card>
      <ShareCard item={item} mode="her" />
      {isTrackable(item) ? <TrackMap item={item} height={220} /> : null}
      <View style={{ gap: 16 }}><AppText variant="section">{t('journey')}</AppText><Journey steps={item.journey} /></View>
      {item.thanks.map((note, index) => <AppText key={index}>{t('thanksFrom', { name: note.from })}: {note.message}</AppText>)}
      <Worth item={item} />
      <Destination label="hBackMemories" href="/her/memories" />
    </>}
  </HerPage>;
}
