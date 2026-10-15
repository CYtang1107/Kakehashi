import { AppText as Text } from '../../src/design-system/AppText';
import { Worth } from '../../src/ItemWorth';
import React, { useEffect, useState } from 'react';
import { ItemDetail } from '../../src/her/ItemDetail';
import { useStoryDraft } from '../../src/useStoryDraft';
import { Image, Pressable, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CHOICES, WISHES, pick, type Decision, type Estimate, type HandoverStage, type Item, type WishKind } from '@kakehashi/shared';
import { StatusBanner, Button, Card, Columns, ConfirmationDialog, DecisionChip, Field, Fold, Glyph, Screen, formatDate } from '../../src/ui';
import { StoryPlayer, StoryRecorder } from '../../src/Audio';
import { PixelIcon } from '../../src/PixelIcon';
import { spriteFor } from '../../src/pixelArt';
import { Journey } from '../../src/Journey';
import { ShareCard } from '../../src/StoryShare';
import { AddPhotoCard, PhotoCarousel } from '../../src/PhotoCarousel';
import { TrackMap, isTrackable } from '../../src/TrackMap';
import { useData } from '../../src/data';
import { useI18n, type Key } from '../../src/i18n';
import { api, fileUrl } from '../../src/api';
import { colors, decisionColor, fonts, type, yen } from '../../src/theme';

const wishKey = (k: WishKind) => `wish_${k.replace(/-/g, '_')}` as Key;
const today = () => new Date().toISOString().slice(0, 10);

export default function ItemScreen({ olderAdult = false }: { olderAdult?: boolean }) {
  return olderAdult ? <ItemDetail /> : <LegacyItemScreen />;
}
function LegacyItemScreen() {
  const { id, as } = useLocalSearchParams<{ id: string; as?: string }>();
  const student = as === 'student';
  const { data, replaceItem, showToast } = useData();
  const { t, lang } = useI18n();
  const item = data?.items.find((i) => i.id === id);
  const { draft, setValue, markSaved, dirty } = useStoryDraft(item, lang);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [handoverBy, setHandoverBy] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<Item>, done?: string) => {
    setBusy(key);
    setError(null);
    try {
      replaceItem(await fn());
      if (done) showToast(done);
      setDecision(null); return true;
    } catch (e) {
      setError(t('rSaveError'));
      return false;
    } finally {
      setBusy(null);
    }
  };

  if (!data) return <Screen back>{null}</Screen>;
  if (!item) return <Screen back><Text>{t('rNoItem')}</Text></Screen>;
  const room = data.home.rooms.find((r) => r.id === item.roomId);
  const name = lang === 'ja' && item.nameJa ? item.nameJa : item.name;
  const held = Boolean(item.holdUntil && today() < item.holdUntil);
  const nextStage: HandoverStage = item.decision === 'recycle' ? (item.journey.some((j) => j.stage === 'collected') ? 'recycler' : 'collected') : item.journey.some((j) => j.stage === 'repair') ? 'delivered' : 'repair';

  const header = {
    eyebrow: `${room ? (lang === 'ja' ? room.nameJa : room.name) : ''}${item.year ? `, ${item.year}` : ''}`,
    title: name,
    leading: (
      <View style={{ width: 76, height: 76, borderRadius: 16, backgroundColor: colors.sheet, alignItems: 'center', justifyContent: 'center' }}>
        <PixelIcon sprite={spriteFor(item)} size={58} />
      </View>
    ),
  };

  return (
    <Screen back wide fit header={header}>
      <Columns fill scrollLeft
        left={<>
      <PhotoCarousel item={item} onMakePixel={student ? (photoId) => run('icon', () => api.setIcon(item.id, { photoId }), t('photoPixelMade')) : undefined} />
      {student && item.icon ? (
        <Pressable accessibilityRole="button" onPress={() => run('icon', () => api.setIcon(item.id, { reset: true }), t('saved'))} style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 17, color: colors.inkSoft }}>{t('iconReset')}</Text>
        </Pressable>
      ) : null}

      {/* Her words first, on the paper itself: the story is what this page is about. */}
      {item.story || item.storyJa ? (
        <View style={{ gap: 10, paddingVertical: 6 }}>
          <Text variant="story">{pick(lang, item.story, item.storyJa)}</Text>
          <Text style={type.caption}>{t('inHerOwnWords', { name: data.home.seniorNameJa && lang === 'ja' ? data.home.seniorNameJa.split(' ')[1] : data.home.seniorName.split(' ')[0] })}</Text>
        </View>
      ) : null}
      {item.audioUrl ? <StoryPlayer path={item.audioUrl} /> : null}
        </>}
        right={<>
      {student ? (
        <>
          {item.wish ? (
            <Card tint>
              <Text style={type.eyebrow}>{t('wishFrom', { name: item.wish.from })}</Text>
              <Text style={type.bodyBold}>{t(wishKey(item.wish.kind))}</Text>
              {item.wish.note ? <Text style={type.body}>{item.wish.note}</Text> : null}
            </Card>
          ) : null}
          <Card>
            <Text style={type.section}>{t('decisionBySenior')}</Text>
            <Text>{t('hMemoryLead')}</Text>
            <ChoiceGrid value={item.decision} disabled={busy !== null} onPick={d => d === 'open' ? run('decision', () => api.update(item.id, { decision: d }), t('saved')) : setDecision(d)} />
            {held ? <Text style={[type.caption, { color: colors.moss }]}>{t('heldUntil', { date: formatDate(item.holdUntil!, lang) })}</Text> : null}
          </Card>
          <AddPhotoCard item={item} />
          <Card>
            <Text style={type.section}>{t('storyTag')}</Text>
            <Field label={t('storyInHerWords')} multiline editable={busy === null} value={draft.value} onChangeText={setValue} />
            {draft.language !== lang ? <Text variant="caption">{t('hDraftLanguage', { language: draft.language === 'ja' ? '日本語' : 'English' })}</Text> : null}
            <Button label={t('saveStory')} kind="secondary" busy={busy === 'story'} disabled={!dirty || busy !== null} onPress={() => run('story', () => api.update(item.id, { story: draft.value }), t('saved')).then(ok => { if (ok) markSaved(); })} />
            <StoryRecorder item={item} consent={data.home.consent.recording} onSaved={(it) => { replaceItem(it); showToast(t('recordingSaved')); }} />
          </Card>
          {item.decision === 'pass' || item.decision === 'recycle' ? (
            <Card>
              <Text style={type.section}>{t('logHandover')} · {t(`stage_${nextStage}`)}</Text>
              {held ? (
                <Text style={type.body}>{t('heldUntil', { date: formatDate(item.holdUntil!, lang) })}</Text>
              ) : (
                <>
                  <Field label={t('handoverBy')} value={handoverBy} onChangeText={setHandoverBy} placeholder={t('rHandoverExample')} />
                  <Button label={t('logHandover')} kind="secondary" icon="check-circle" busy={busy === 'handover'} disabled={!handoverBy.trim()}
                    onPress={() => run('handover', () => api.handover(item.id, nextStage, handoverBy.trim()), t('handoverSaved')).then(ok => { if (ok) setHandoverBy(''); })} />
                  {item.decision === 'pass' && !item.delivery && !item.journey.some((j) => j.stage === 'delivered') ? (
                    <Button label={t('startDelivery')} kind="secondary" icon="truck" busy={busy === 'delivery'} disabled={!handoverBy.trim()}
                      onPress={() => run('delivery', () => api.startDelivery(item.id, handoverBy.trim()), t('deliveryStarted')).then(ok => { if (ok) setHandoverBy(''); })} />
                  ) : null}
                </>
              )}
            </Card>
          ) : null}
        </>
      ) : (
        <>
          <View style={{ gap: 4, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
              <Text style={[type.body, { flex: 1 }]}>{t('motherDecided')}</Text>
              <DecisionChip decision={item.decision} />
            </View>
            {held ? <Text style={[type.caption, { color: colors.moss }]}>{t('heldUntil', { date: formatDate(item.holdUntil!, lang) })}</Text> : null}
          </View>
          <Card flat>
            <Text style={type.section}>{t('yourWish')}</Text>
            <Text style={type.caption}>{t('wishHint')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {WISHES.map((w) => {
                const on = item.wish?.kind === w;
                return (
                  <Pressable key={w} accessibilityRole="radio" accessibilityState={{ checked: on }}
                    onPress={() => run('wish', () => api.wish(item.id, w), t('wishSent'))}
                    style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center',  paddingVertical: 9, paddingHorizontal: 13, borderRadius: 99, borderWidth: on ? 2 : 1, borderColor: on ? colors.plum : colors.line, backgroundColor: on ? colors.plumTint : colors.sheet }}>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: on ? colors.plum : colors.ink }}>{t(wishKey(w))}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </>
      )}

      <Card>
        <Text style={type.section}>{isTrackable(item) ? t('whereNow') : t('journey')}</Text>
        {isTrackable(item) ? <TrackMap item={item} height={180} /> : null}
        {isTrackable(item)
          ? <Fold title={t('everyStep', { n: item.journey.length })} icon="list"><Journey steps={item.journey} /></Fold>
          : <Journey steps={item.journey} />}
      </Card>
      {student ? <ShareCard item={item} mode="student" /> : (
        <Fold title={t('shareTitle')} icon="globe" summary={item.share ? t('sharedOn', { date: formatDate(item.share.at, lang) }) : t('notSharedShort')}>
          <ShareCard item={item} mode="family" />
        </Fold>
      )}
      <Worth item={item} />
        </>}
      />
      {error ? <StatusBanner tone="error" title={error} /> : null}
      <ConfirmationDialog visible={decision !== null} title={t('hReviewDecision')} busy={busy !== null}
        message={decision ? t('hDecisionBody', { name, decision: t(`decision_${decision}`) }) : ''}
        confirmLabel={decision ? t(`decision_${decision}`) : t('dsConfirm')} onCancel={() => { setDecision(null); setError(null); }}
        onConfirm={() => { if (decision) run('decision', () => api.update(item.id, { decision }), t('saved')); }}>
        {error ? <StatusBanner tone="error" title={error} /> : null}
      </ConfirmationDialog>
    </Screen>
  );
}

function ChoiceGrid({ value, onPick, disabled }: { value?: Decision; onPick: (d: Decision) => void; disabled?: boolean }) {
  const { t } = useI18n();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {CHOICES.map((d) => {
        const on = value === d;
        const c = decisionColor[d];
        const first = d === 'open';
        return (
          <Pressable key={d} accessibilityRole="radio" accessibilityState={{ checked: on, disabled }} disabled={disabled} onPress={() => onPick(d)}
            style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center', flexBasis: first ? '100%' : 180, flexGrow: 1, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: on ? (first ? colors.ink : c.fg) : colors.line, backgroundColor: on ? c.bg : colors.sheet }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: on ? (first ? colors.ink : c.fg) : colors.ink }}>{t(`decision_${d}`)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
