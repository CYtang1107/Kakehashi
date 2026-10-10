import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Item } from '@kakehashi/shared';
import { Button, Card, DecisionChip, Glyph, Heading, Screen } from '../../src/ui';
import { FloorPlan } from '../../src/FloorPlan';
import { Home3D, memoryColors } from '../../src/Home3D';
import { StoryPlayer } from '../../src/Audio';
import { RoomGallery } from '../../src/Community';
import { useData } from '../../src/data';
import { useI18n, type Key } from '../../src/i18n';
import { colors, fonts, roomColor, type } from '../../src/theme';

type View3 = '3d' | '2d' | 'memory';
const TOUR_MS = 7000;

export default function House() {
  const { data } = useData();
  const { t, lang } = useI18n();
  const [view, setView] = useState<View3>('3d');
  const [selected, setSelected] = useState<string | undefined>();
  const [touring, setTouring] = useState(false);

  const memories = data ? data.items.filter((i) => i.story || i.audioUrl) : [];
  const memory = view === 'memory';

  // The memory tour steps through every item with a story, one every few seconds.
  useEffect(() => {
    if (!touring || memories.length === 0) return;
    const timer = setInterval(() => {
      setSelected((cur) => {
        const i = memories.findIndex((m) => m.id === cur);
        return memories[(i + 1) % memories.length].id;
      });
    }, TOUR_MS);
    return () => clearInterval(timer);
  }, [touring, memories.length]);

  const pickView = (v: View3) => {
    setView(v);
    setTouring(false);
    setSelected(v === 'memory' ? memories[0]?.id : undefined);
  };

  const onSelect = (id: string) => {
    setSelected(id);
    if (memory) setTouring(false);
    else router.push(`/item/${id}`);
  };

  const step = (dir: 1 | -1) => {
    setTouring(false);
    const i = memories.findIndex((m) => m.id === selected);
    setSelected(memories[(i + dir + memories.length) % memories.length]?.id);
  };

  const current = data?.items.find((i) => i.id === selected);
  const labels: Record<View3, string> = { '3d': t('view3d'), '2d': t('view2d'), memory: t('viewMemory') };

  return (
    <Screen>
      {data ? (
        <>
          <Heading eyebrow={memory ? t('memoryHouse') : t('tabHouse')} title={`${data.home.seniorName.split(' ')[0]} · ${data.home.town}`}
            sub={memory ? t('memoryLead') : t('dragToRotate')} />
          <View style={{ flexDirection: 'row', backgroundColor: colors.sheet, borderRadius: 12, padding: 3, borderWidth: 1, borderColor: colors.line }}>
            {(['3d', '2d', 'memory'] as const).map((v) => (
              <Pressable key={v} accessibilityRole="button" accessibilityState={{ selected: view === v }} onPress={() => pickView(v)}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center', backgroundColor: view === v ? (v === 'memory' ? memoryColors.sky : colors.aiTint) : 'transparent' }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: view === v ? (v === 'memory' ? memoryColors.lantern : colors.ai) : colors.inkSoft }}>{labels[v]}</Text>
              </Pressable>
            ))}
          </View>

          <Card style={{ padding: 8, backgroundColor: memory ? memoryColors.sky : colors.sheet, borderColor: memory ? memoryColors.sky : colors.line }}>
            {view === '2d'
              ? <FloorPlan rooms={data.home.rooms} items={data.items} selected={selected} onSelect={onSelect} />
              : <Home3D rooms={data.home.rooms} items={data.items} selected={selected} onSelect={onSelect} memory={memory} />}
            {memory ? (
              <Text style={[type.caption, { color: '#CDBFAE', paddingHorizontal: 6, paddingTop: 4 }]}>{t('memoryLegend', { n: memories.length })}</Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingHorizontal: 6, paddingTop: 4 }}>
                {([['sorted', t('legendSorted')], ['now', t('legendNow')], ['later', t('legendLater')]] as const).map(([k, label]) => (
                  <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: roomColor[k], borderWidth: 1, borderColor: colors.line }} />
                    <Text style={type.caption}>{label}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {memory ? (
            <>
              {current ? <MemoryCard item={current} rooms={data.home.rooms} /> : null}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}><Button label={t('previous')} kind="secondary" icon="chevron-left" onPress={() => step(-1)} /></View>
                <View style={{ flex: 1.4 }}><Button label={touring ? t('stopTour') : t('playTour')} icon={touring ? 'pause' : 'play'} onPress={() => setTouring((x) => !x)} /></View>
                <View style={{ flex: 1 }}><Button label={t('next')} kind="secondary" icon="chevron-right" onPress={() => step(1)} /></View>
              </View>
              <Text style={type.caption}>{t('memoryPrivacy')}</Text>
            </>
          ) : (
            <>
              <RoomGallery />
              <Text style={type.section}>{t('items')}</Text>
              {data.items.map((it) => {
                const room = data.home.rooms.find((r) => r.id === it.roomId);
                return (
                  <Pressable key={it.id} accessibilityRole="button" onPress={() => onSelect(it.id)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.sheet }}>
                    <Glyph ch={it.glyph} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={type.bodyBold}>{lang === 'ja' && it.nameJa ? it.nameJa : it.name}</Text>
                      <Text style={type.caption}>{room ? (lang === 'ja' ? room.nameJa : room.name) : ''}{it.wish ? ` · ${t('yourWish')}: ${t(`wish_${it.wish.kind.replace(/-/g, '_')}` as Key)}` : ''}</Text>
                    </View>
                    <DecisionChip decision={it.decision} />
                  </Pressable>
                );
              })}
            </>
          )}
        </>
      ) : null}
    </Screen>
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
        : t('onItsWay');
  const thanks = item.thanks.at(-1);
  return (
    <View style={{ borderRadius: 16, padding: 16, gap: 10, backgroundColor: '#2A241E', borderWidth: 1, borderColor: '#4A3F33' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: '#3A3128', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 22, color: memoryColors.lantern }}>{item.glyph}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 20, color: '#F5EBDD' }}>{lang === 'ja' && item.nameJa ? item.nameJa : item.name}</Text>
          <Text style={{ fontFamily: fonts.medium, fontSize: 12.5, color: '#CDBFAE' }}>{room ? (lang === 'ja' ? room.nameJa : room.name) : ''}{item.year ? ` · ${item.year}` : ''}</Text>
        </View>
      </View>
      {item.story ? (
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 17, lineHeight: 28, color: '#F5EBDD', borderLeftWidth: 3, borderLeftColor: memoryColors.lantern, paddingLeft: 12 }}>“{item.story}”</Text>
      ) : null}
      {item.audioUrl ? <StoryPlayer path={item.audioUrl} /> : null}
      <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: memoryColors.lantern }}>{now}</Text>
      {thanks ? (
        <Text style={{ fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: '#CDBFAE' }}>{t('thanksFrom', { name: thanks.from })}: “{thanks.message}”</Text>
      ) : null}
    </View>
  );
}
