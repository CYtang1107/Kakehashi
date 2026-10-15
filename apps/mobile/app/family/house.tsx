import { HerPage } from '../../src/her/HerPage';
import { AppText as Text } from '../../src/design-system/AppText';
import { useAccessibilityPreferences } from '../../src/design-system/preferences';
import { Destination } from '../../src/her/Screens';
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { DECISIONS, pick, type Decision, type FixStatus, type Item } from '@kakehashi/shared';
import { Button, Card, Columns, DecisionChip, Glyph, Screen, useWide } from '../../src/ui';
import { FloorPlan } from '../../src/FloorPlan';
import { NearbyList, NeighbourhoodMap } from '../../src/NeighbourhoodMap';
import { Home3D, eveningState, hasStory, memoryColors, type ColorBy, type Evening } from '../../src/Home3D';
import { StoryPlayer } from '../../src/Audio';
import { RoomGallery } from '../../src/Community';
import { SaferHomeCard, fixTone } from '../../src/SaferHome';
import { HouseFutureCard } from '../../src/HouseFuture';
import { TrackMap, isTrackable } from '../../src/TrackMap';
import { LiveOutingBanner } from '../../src/Outing';
import { PhotoCarousel } from '../../src/PhotoCarousel';
import { PixelIcon } from '../../src/PixelIcon';
import { spriteFor } from '../../src/pixelArt';
import { useData } from '../../src/data';
import { useI18n, type Key } from '../../src/i18n';
import { colors, decisionColor, fonts, roomColor, type } from '../../src/theme';

type View3 = '3d' | '2d' | 'memory' | 'map';
const TOUR_MS = 7000;

export default function House({ olderAdult = false }: { olderAdult?: boolean }) {
  const Frame = olderAdult ? HerPage : Screen;
  const { reducedMotion } = useAccessibilityPreferences();
  const { data } = useData();
  const { t, lang } = useI18n();
  const params = useLocalSearchParams<{ view?: string }>();
  const [view, setView] = useState<View3>(params.view === 'map' ? 'map' : '3d');
  useEffect(() => { if (params.view === 'map') setView('map'); }, [params.view]);
  const [selected, setSelected] = useState<string | undefined>();
  const [touring, setTouring] = useState(false);
  const [colorBy, setColorBy] = useState<ColorBy>('none');
  const [evening, setEvening] = useState<Evening>('off');
  const [focus, setFocus] = useState<{ id: string; n: number } | undefined>();
  const [section, setSection] = useState<'items' | 'safer' | 'future' | 'photos'>('items');

  const memories = data ? data.items.filter((i) => i.story || i.audioUrl) : [];
  const memory = view === 'memory';

  // The memory tour steps through every item with a story, one every few seconds.
  useEffect(() => {
    if (reducedMotion || !touring || memories.length === 0) return;
    const timer = setInterval(() => {
      setSelected((cur) => {
        const i = memories.findIndex((m) => m.id === cur);
        return memories[(i + 1) % memories.length].id;
      });
    }, TOUR_MS);
    return () => clearInterval(timer);
  }, [touring, memories.length, reducedMotion]);

  const pickView = (v: View3) => {
    setView(v);
    setTouring(false);
    setSelected(v === 'memory' ? memories[0]?.id : undefined);
  };

  const onSelect = (id: string) => {
    setSelected(id);
    if (memory) setTouring(false);
    else router.push(`${olderAdult ? "/her" : ""}/item/${id}`);
  };

  const step = (dir: 1 | -1) => {
    setTouring(false);
    const i = memories.findIndex((m) => m.id === selected);
    setSelected(memories[(i + dir + memories.length) % memories.length]?.id);
  };

  const current = data?.items.find((i) => i.id === selected);
  const labels: Record<View3, string> = { '3d': t('view3d'), '2d': t('view2d'), memory: t('viewMemory'), map: t('viewMap') };

  // On a laptop the whole page fits the window: the stage fills the height, the side panel scrolls on its own.
  const isWide = useWide();
  const fit = isWide && !olderAdult;
  const colourCard = (
    <Card style={{ gap: 10 }}>
      <Segment label={t('colourBy')} value={colorBy} options={(['none', 'decision', 'stories', 'fixes'] as const).map((v) => [v, t(`colour_${v}`)])}
        onChange={(v) => { setColorBy(v); setEvening('off'); }} />
      <Segment label={t('evening')} value={evening} options={(['off', 'today', 'plan'] as const).map((v) => [v, t(`evening_${v}`)])}
        onChange={(v) => { setEvening(v); setColorBy('none'); }} />
      <ViewLegend colorBy={colorBy} evening={evening} />
    </Card>
  );
  const tourButtons = (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      <View style={{ flex: 1 }}><Button label={t('previous')} kind="secondary" icon="chevron-left" onPress={() => step(-1)} /></View>
      <View style={{ flex: 1.4 }}><Button label={touring ? t('stopTour') : t('playTour')} icon={touring ? 'pause' : 'play'} disabled={reducedMotion} onPress={() => setTouring((x) => !x)} /></View>
      <View style={{ flex: 1 }}><Button label={t('next')} kind="secondary" icon="chevron-right" onPress={() => step(1)} /></View>
    </View>
  );
  const header = data ? {
    eyebrow: memory ? t('memoryHouse') : t('tabHouse'),
    title: lang === 'ja' && data.home.seniorNameJa ? `${data.home.seniorNameJa.split(' ')[1]}さん · ${pick(lang, data.home.town, data.home.townJa)}` : `${data.home.seniorName.split(' ')[0]} · ${data.home.town}`,
    sub: memory ? t('memoryLead') : view === 'map' ? t('mapLead') : t('dragToRotate'),
  } : undefined;

  return (
    <Frame back={olderAdult} wide fit={!olderAdult} header={header}>
      {data ? (
        <Columns fill={!olderAdult}
          left={<>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: colors.sheet, borderRadius: 12, padding: 3, borderWidth: 1, borderColor: colors.line }}>
            {(['3d', '2d', 'memory', 'map'] as const).map((v) => (
              <Pressable key={v} accessibilityRole="button" accessibilityState={{ selected: view === v }} onPress={() => pickView(v)}
                style={{ flexGrow: 1, flexBasis: '42%', minHeight: 56, padding: 12, borderRadius: 9, alignItems: 'center', backgroundColor: view === v ? (v === 'memory' ? memoryColors.sky : colors.aiTint) : 'transparent' }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: view === v ? (v === 'memory' ? memoryColors.lantern : colors.ai) : colors.inkSoft }}>{labels[v]}</Text>
              </Pressable>
            ))}
          </View>

          {view === 'map' ? <LiveOutingBanner /> : null}
          <Card style={{ padding: 8, backgroundColor: memory ? memoryColors.sky : colors.sheet, borderColor: memory ? memoryColors.sky : colors.line, ...(fit ? { flex: 1, minHeight: 0 } : null) }}>
            {view === 'map'
              ? <NeighbourhoodMap homeId={data.home.id} focus={focus} fill={fit} />
              : view === '2d'
              ? <FloorPlan rooms={data.home.rooms} items={data.items} selected={selected} onSelect={onSelect} fixes={data.home.safety} fill={fit} />
              : <Home3D rooms={data.home.rooms} items={data.items} selected={selected} onSelect={onSelect} memory={memory} fixes={data.home.safety} colorBy={colorBy} evening={evening} fill={fit} />}
            {memory ? (
              <Text style={[type.caption, { color: '#CDBFAE', paddingHorizontal: 6, paddingTop: 4 }]}>{t('memoryLegend', { n: memories.length })}</Text>
            ) : view === '2d' ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingHorizontal: 6, paddingTop: 4 }}>
                {([['sorted', t('legendSorted')], ['now', t('legendNow')], ['later', t('legendLater')]] as const).map(([k, label]) => (
                  <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: roomColor[k], borderWidth: 1, borderColor: colors.line }} />
                    <Text style={type.caption}>{label}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
          {/* On a laptop these sit with the stage so they never need scrolling to; on a phone, where they always were. */}
          {view === '3d' && !fit ? colourCard : null}
          {memory && fit ? tourButtons : null}
          </>}
          right={<>
          {view === '3d' && fit ? colourCard : null}
          {view === 'map' ? (
            <NearbyList onFocus={(id) => setFocus((f) => ({ id, n: (f?.n ?? 0) + 1 }))} />
          ) : memory ? (
            <>
              {current ? <MemoryCard item={current} rooms={data.home.rooms} /> : null}
              {!fit ? tourButtons : null}
              <Text style={type.caption}>{t('memoryPrivacy')}</Text>
            </>
          ) : (
            <>
              <Segment label="" value={section} onChange={setSection}
                options={[['items', t('items')], ['safer', t('saferShort')], ['future', t('futureShort')], ['photos', t('photosShort')]]} />
              {section === 'safer' ? <SaferHomeCard mode={olderAdult ? 'her' : 'family'} /> : null}
              {section === 'future' ? olderAdult ? <Destination label="hHouseInfo" href="/her/house-information" /> : <HouseFutureCard mode="family" /> : null}
              {section === 'photos' ? <RoomGallery /> : null}
              {section === 'items' ? data.items.map((it) => {
                const room = data.home.rooms.find((r) => r.id === it.roomId);
                return (
                  <Pressable key={it.id} accessibilityRole="button" onPress={() => onSelect(it.id)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.sheet }}>
                    <PixelIcon sprite={spriteFor(it)} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={type.bodyBold}>{lang === 'ja' && it.nameJa ? it.nameJa : it.name}</Text>
                      <Text style={type.caption}>{room ? (lang === 'ja' ? room.nameJa : room.name) : ''}{it.wish ? ` · ${t('yourWish')}: ${t(`wish_${it.wish.kind.replace(/-/g, '_')}` as Key)}` : ''}</Text>
                    </View>
                    <DecisionChip decision={it.decision} />
                  </Pressable>
                );
              }) : null}
            </>
          )}
          </>}
        />
      ) : null}
    </Frame>
  );
}

// One remembered item: its story in her words, her recording, and where it lives now.
function MemoryCard({ item, rooms }: { item: Item; rooms: { id: string; name: string; nameJa: string }[] }) {
  const { t, lang } = useI18n();
  const room = rooms.find((r) => r.id === item.roomId);
  const last = item.journey.at(-1);
  const now = !last || last.stage === 'home' || item.decision === 'keep'
    ? t('stillHome')
    : last.stage === 'recycler' || last.stage === 'collected'
      ? t('nowRecycled')
      : last.stage === 'delivered'
        ? t('nowWith', { who: item.thanks.at(-1)?.from ?? last.by })
        : item.delivery ? t('onItsWayWith', { who: item.delivery.by }) : t('onItsWay');
  const thanks = item.thanks.at(-1);
  return (
    <View style={{ borderRadius: 16, padding: 16, gap: 10, backgroundColor: '#2A241E', borderWidth: 1, borderColor: '#4A3F33' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <PixelIcon sprite={spriteFor(item)} size={46} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 20, color: '#F5EBDD' }}>{lang === 'ja' && item.nameJa ? item.nameJa : item.name}</Text>
          <Text style={{ fontFamily: fonts.medium, fontSize: 17, color: '#CDBFAE' }}>{room ? (lang === 'ja' ? room.nameJa : room.name) : ''}{item.year ? ` · ${item.year}` : ''}</Text>
        </View>
      </View>
      <PhotoCarousel item={item} dark />
      {item.story || item.storyJa ? (
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 17, lineHeight: 28, color: '#F5EBDD', paddingLeft: 12 }}>“{pick(lang, item.story, item.storyJa)}”</Text>
      ) : null}
      {item.audioUrl ? <StoryPlayer path={item.audioUrl} /> : null}
      <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: memoryColors.lantern }}>{now}</Text>
      {isTrackable(item) ? (
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 17, letterSpacing: 1, color: '#CDBFAE' }}>{t('whereNow')}</Text>
          <TrackMap item={item} height={220} />
        </View>
      ) : null}
      {thanks ? (
        <Text style={{ fontFamily: fonts.regular, fontSize: 17, lineHeight: 21, color: '#CDBFAE' }}>{t('thanksFrom', { name: thanks.from })}: “{thanks.message}”</Text>
      ) : null}
    </View>
  );
}

function Segment<V extends string>({ label, value, options, onChange }: { label: string; value: V; options: (readonly [V, string])[]; onChange: (v: V) => void }) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={type.eyebrow}>{label}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {options.map(([v, l]) => (
          <Pressable key={v} accessibilityRole="radio" accessibilityState={{ checked: value === v }} onPress={() => onChange(v)}
            style={{ paddingHorizontal: 16, paddingVertical: 12, minHeight: 56, borderRadius: 12, borderWidth: 1, borderColor: value === v ? colors.ai : colors.line, backgroundColor: value === v ? colors.aiTint : colors.sheet }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: value === v ? colors.ai : colors.ink }}>{l}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// Legend for the chosen 3D view, with counts (like a unit-type legend on a building model).
function ViewLegend({ colorBy, evening }: { colorBy: ColorBy; evening: Evening }) {
  const { data } = useData();
  const { t, lang } = useI18n();
  if (!data) return null;
  const roomName = (id: string) => { const r = data.home.rooms.find((x) => x.id === id); return r ? (lang === 'ja' ? r.nameJa : r.name) : id; };
  const sep = lang === 'ja' ? '、' : ', ';
  const swatch = (key: string, color: string, label: string, n: number) => (
    <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color }} />
      <Text style={type.caption}>{label} · {n}</Text>
    </View>
  );
  if (evening !== 'off') {
    const ev = eveningState(data.home.safety, evening);
    return (
      <View style={{ gap: 4 }}>
        <Text style={type.caption}>{t('eveningLead')}</Text>
        {ev.litRooms.length ? <Text style={[type.bodyBold, { color: '#9A6A12' }]}>{t('eveningLit', { rooms: ev.litRooms.map(roomName).join(sep) })}</Text> : null}
        {ev.darkRooms.length
          ? <Text style={[type.bodyBold, { color: colors.danger }]}>{t('eveningDark', { rooms: ev.darkRooms.map(roomName).join(sep) })}</Text>
          : <Text style={[type.bodyBold, { color: colors.moss }]}>{t('eveningAllLit')}</Text>}
      </View>
    );
  }
  if (colorBy === 'decision') {
    const all: Decision[] = ['open', ...DECISIONS];
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {all.map((d) => [d, data.items.filter((i) => i.decision === d).length] as const).filter(([, n]) => n > 0)
          .map(([d, n]) => swatch(d, decisionColor[d].fg, t(`decision_${d}`), n))}
      </View>
    );
  }
  if (colorBy === 'stories') {
    const n = data.items.filter(hasStory).length;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#E2A63B' }} />
        <Text style={type.caption}>{t('legendStoriesCount', { n, m: data.items.length - n })}</Text>
      </View>
    );
  }
  if (colorBy === 'fixes') {
    const all: FixStatus[] = ['suggested', 'agreed', 'done'];
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {all.map((st) => [st, data.home.safety.filter((f) => f.status === st).length] as const).filter(([, n]) => n > 0)
          .map(([st, n]) => swatch(st, fixTone[st].fg, t(`fixstatus_${st}` as Key), n))}
      </View>
    );
  }
  return null;
}
