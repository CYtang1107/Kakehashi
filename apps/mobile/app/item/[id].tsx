import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { DECISIONS, tagPayload, type Decision, type HandoverStage, type Item } from '@kakehashi/shared';
import { Button, Card, DecisionChip, Field, Glyph, Heading, Screen } from '../../src/ui';
import { StoryPlayer, StoryRecorder } from '../../src/Audio';
import { Journey } from '../../src/Journey';
import { useData } from '../../src/data';
import { useI18n } from '../../src/i18n';
import { api, fileUrl } from '../../src/api';
import { colors, decisionColor, fonts, type, yen } from '../../src/theme';

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
  const nextStage: HandoverStage = item.decision === 'recycle' ? (item.journey.some((j) => j.stage === 'collected') ? 'recycler' : 'collected') : item.journey.some((j) => j.stage === 'repair') ? 'delivered' : 'repair';

  return (
    <Screen back>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Glyph ch={item.glyph} size={52} />
        <View style={{ flex: 1 }}>
          <Heading eyebrow={`${room ? (lang === 'ja' ? room.nameJa : room.name) : ''}${item.year ? ` · ${item.year}` : ''}`} title={name} />
        </View>
      </View>
      {item.photoUrl ? <Image source={{ uri: fileUrl(item.photoUrl) }} style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 14, backgroundColor: colors.line }} resizeMode="cover" accessibilityLabel={item.name} /> : null}

      <Card>
        <StoryPlayer path={item.audioUrl} />
        {item.story ? <Text style={[type.story, { borderLeftWidth: 3, borderLeftColor: colors.ai, paddingLeft: 12 }]}>“{item.story}”</Text> : null}
      </Card>

      {student ? (
        <>
          <Card>
            <Text style={type.section}>{t('decisionBySenior')}</Text>
            {item.suggestion ? <Text style={type.caption}>{data.home.childName}: {t(`decision_${item.suggestion}`)}</Text> : null}
            <DecisionGrid value={item.decision} onPick={(d) => run('decision', () => api.update(item.id, { decision: d }), t('saved'))} />
          </Card>
          <Card>
            <Text style={type.section}>{t('storyTag')}</Text>
            <Field label={t('storyInHerWords')} multiline value={story} onChangeText={setStory} />
            <Button label={t('saveStory')} kind="secondary" busy={busy === 'story'} onPress={() => run('story', () => api.update(item.id, { story }), t('saved'))} />
            <StoryRecorder item={item} consent={data.home.consent.recording} onSaved={(it) => { replaceItem(it); showToast(t('recordingSaved')); }} />
            {item.tagCode ? (
              <View style={{ alignItems: 'center', gap: 8, paddingTop: 8 }}>
                <View style={{ backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12 }}>
                  <QRCode value={tagPayload(item.tagCode)} size={150} color={colors.ink} backgroundColor="#FFFFFF" />
                </View>
                <Text style={{ fontFamily: fonts.bold, fontSize: 15, letterSpacing: 1, color: colors.ink }}>{item.tagCode}</Text>
                <Text style={[type.caption, { textAlign: 'center' }]}>{t('tagHint')}</Text>
              </View>
            ) : (
              <Button label={t('createTag')} icon="grid" busy={busy === 'tag'} onPress={() => run('tag', () => api.tag(item.id))} />
            )}
          </Card>
          {item.decision === 'pass' || item.decision === 'recycle' ? (
            <Card>
              <Text style={type.section}>{t('logHandover')} · {t(`stage_${nextStage}`)}</Text>
              <Field label={t('handoverBy')} value={handoverBy} onChangeText={setHandoverBy} placeholder={nextStage === 'recycler' || nextStage === 'collected' ? 'Licensed recycler' : 'Partner repair shop'} />
              <Button label={t('logHandover')} kind="secondary" icon="check-circle" busy={busy === 'handover'} disabled={!handoverBy.trim()}
                onPress={() => run('handover', () => api.handover(item.id, nextStage, handoverBy.trim()), t('handoverSaved')).then(() => setHandoverBy(''))} />
            </Card>
          ) : null}
        </>
      ) : (
        <Card>
          {item.decision !== 'open' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[type.bodyBold, { flex: 1 }]}>{t('motherDecided')}</Text>
              <DecisionChip decision={item.decision} />
            </View>
          ) : (
            <>
              <Text style={type.section}>{t('yourSuggestion')}</Text>
              <Text style={type.caption}>{t('suggestionHint')}</Text>
              <DecisionGrid value={item.suggestion} onPick={(d) => run('suggest', () => api.suggest(item.id, d), t('suggestionSent'))} />
            </>
          )}
        </Card>
      )}

      {item.estimate ? (
        <Card>
          <Text style={type.eyebrow}>{t('estimate')} · {t('estimateBy', { source: item.estimate.source === 'claude' ? t('sourceClaude') : t('sourceOffline') })}</Text>
          <Text style={type.section}>{item.estimate.priceHighJpy > 0 ? `${yen(item.estimate.priceLowJpy)} – ${yen(item.estimate.priceHighJpy)}` : '¥0'}</Text>
          <Text style={type.caption}>{item.estimate.category} · {item.estimate.reason}</Text>
        </Card>
      ) : null}

      <Card>
        <Text style={type.section}>{t('journey')}</Text>
        <Journey steps={item.journey} />
      </Card>
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
    </Screen>
  );
}

function DecisionGrid({ value, onPick }: { value?: Decision; onPick: (d: Exclude<Decision, 'open'>) => void }) {
  const { t } = useI18n();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {DECISIONS.map((d) => {
        const on = value === d;
        const c = decisionColor[d];
        return (
          <Pressable key={d} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => onPick(d)}
            style={{ flexBasis: '47%', flexGrow: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', borderWidth: on ? 2 : 1, borderColor: on ? c.fg : colors.line, backgroundColor: on ? c.bg : colors.sheet }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: on ? c.fg : colors.ink }}>{t(`decision_${d}`)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
