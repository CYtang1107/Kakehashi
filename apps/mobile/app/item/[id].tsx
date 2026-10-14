import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CHOICES, WISHES, pick, type Decision, type Estimate, type HandoverStage, type Item, type WishKind } from '@kakehashi/shared';
import { Button, Card, Columns, DecisionChip, Field, Fold, Glyph, Screen, formatDate } from '../../src/ui';
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

export default function ItemScreen() {
  const { id, as } = useLocalSearchParams<{ id: string; as?: string }>();
  const student = as === 'student';
  const { data, replaceItem, showToast } = useData();
  const { t, lang } = useI18n();
  const item = data?.items.find((i) => i.id === id);
  const [story, setStory] = useState(item?.story ?? '');
  const [handoverBy, setHandoverBy] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setStory(item?.story ?? ''); }, [item?.id]);

  const run = async (key: string, fn: () => Promise<Item>, done?: string) => {
    setBusy(key);
    setError(null);
    try {
      replaceItem(await fn());
      if (done) showToast(done);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(null);
    }
  };

  if (!data) return <Screen back>{null}</Screen>;
  if (!item) return <Screen back><Text style={type.body}>Item not found.</Text></Screen>;
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
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft }}>{t('iconReset')}</Text>
        </Pressable>
      ) : null}

      {/* Her words first, on the paper itself: the story is what this page is about. */}
      {item.story ? (
        <View style={{ gap: 10, paddingVertical: 6 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 72, lineHeight: 64, color: colors.ai, marginBottom: -30 }}>“</Text>
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 21, lineHeight: 34, color: colors.ink }}>{pick(lang, item.story, item.storyJa)}</Text>
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
            <ChoiceGrid value={item.decision} onPick={(d) => run('decision', () => api.update(item.id, { decision: d }), t('saved'))} />
            {held ? <Text style={[type.caption, { color: colors.moss }]}>{t('heldUntil', { date: formatDate(item.holdUntil!, lang) })}</Text> : null}
          </Card>
          <AddPhotoCard item={item} />
          <Card>
            <Text style={type.section}>{t('storyTag')}</Text>
            <Field label={t('storyInHerWords')} multiline value={story} onChangeText={setStory} />
            <Button label={t('saveStory')} kind="secondary" busy={busy === 'story'} onPress={() => run('story', () => api.update(item.id, { story }), t('saved'))} />
            <StoryRecorder item={item} consent={data.home.consent.recording} onSaved={(it) => { replaceItem(it); showToast(t('recordingSaved')); }} />
          </Card>
          {item.decision === 'pass' || item.decision === 'recycle' ? (
            <Card>
              <Text style={type.section}>{t('logHandover')} · {t(`stage_${nextStage}`)}</Text>
              {held ? (
                <Text style={type.body}>{t('heldUntil', { date: formatDate(item.holdUntil!, lang) })}</Text>
              ) : (
                <>
                  <Field label={t('handoverBy')} value={handoverBy} onChangeText={setHandoverBy} placeholder={nextStage === 'recycler' || nextStage === 'collected' ? 'Licensed recycler' : 'Partner repair shop'} />
                  <Button label={t('logHandover')} kind="secondary" icon="check-circle" busy={busy === 'handover'} disabled={!handoverBy.trim()}
                    onPress={() => run('handover', () => api.handover(item.id, nextStage, handoverBy.trim()), t('handoverSaved')).then(() => setHandoverBy(''))} />
                  {item.decision === 'pass' && !item.delivery && !item.journey.some((j) => j.stage === 'delivered') ? (
                    <Button label={t('startDelivery')} kind="secondary" icon="truck" busy={busy === 'delivery'} disabled={!handoverBy.trim()}
                      onPress={() => run('delivery', () => api.startDelivery(item.id, handoverBy.trim()), t('deliveryStarted')).then(() => setHandoverBy(''))} />
                  ) : null}
                </>
              )}
            </Card>
          ) : null}
        </>
      ) : (
        <>
          <View style={{ gap: 4, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
                    style={{ paddingVertical: 9, paddingHorizontal: 13, borderRadius: 99, borderWidth: on ? 2 : 1, borderColor: on ? colors.plum : colors.line, backgroundColor: on ? colors.plumTint : colors.sheet }}>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: on ? colors.plum : colors.ink }}>{t(wishKey(w))}</Text>
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
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
    </Screen>
  );
}

// Value is shown only when someone asks. It is never the reason to let something go.
function Worth({ item }: { item: Item }) {
  const { t } = useI18n();
  const [shown, setShown] = useState<Estimate | null>(null);
  const [busy, setBusy] = useState(false);
  const reveal = async () => {
    if (item.estimate) { setShown(item.estimate); return; }
    setBusy(true);
    try { setShown(await api.estimate({ name: item.name })); } finally { setBusy(false); }
  };
  return (
    <Card flat style={{ paddingTop: 8 }}>
      {shown ? (
        <>
          <Text style={type.eyebrow}>{t('estimate')} · {t('estimateBy', { source: shown.source === 'claude' ? t('sourceClaude') : t('sourceOffline') })}</Text>
          <Text style={type.section}>{shown.priceHighJpy > 0 ? `${yen(shown.priceLowJpy)} – ${yen(shown.priceHighJpy)}` : '¥0'}</Text>
          <Text style={type.caption}>{shown.category} · {shown.reason}</Text>
          <Text style={type.caption}>{t('routeIfLetGo', { route: t(`decision_${shown.routeIfLetGo}`) })}</Text>
        </>
      ) : (
        <>
          <Pressable accessibilityRole="button" onPress={reveal} disabled={busy} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}>
            <Feather name="help-circle" size={16} color={colors.ai} />
            <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.ai }}>{busy ? t('estimating') : t('whatWorth')}</Text>
          </Pressable>
          <Text style={type.caption}>{t('worthHint')}</Text>
        </>
      )}
    </Card>
  );
}

function ChoiceGrid({ value, onPick }: { value?: Decision; onPick: (d: Decision) => void }) {
  const { t } = useI18n();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {CHOICES.map((d) => {
        const on = value === d;
        const c = decisionColor[d];
        const first = d === 'open';
        return (
          <Pressable key={d} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => onPick(d)}
            style={{ flexBasis: first ? '100%' : '47%', flexGrow: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', borderWidth: on ? 2 : 1, borderColor: on ? (first ? colors.ink : c.fg) : colors.line, backgroundColor: on ? c.bg : colors.sheet }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: on ? (first ? colors.ink : c.fg) : colors.ink }}>{t(`decision_${d}`)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
