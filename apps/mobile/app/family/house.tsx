import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Card, DecisionChip, Glyph, Heading, Screen } from '../../src/ui';
import { FloorPlan } from '../../src/FloorPlan';
import { Home3D } from '../../src/Home3D';
import { useData } from '../../src/data';
import { useI18n } from '../../src/i18n';
import { colors, fonts, roomColor, type } from '../../src/theme';

export default function House() {
  const { data } = useData();
  const { t, lang } = useI18n();
  const [view, setView] = useState<'3d' | '2d'>('3d');
  const [selected, setSelected] = useState<string | undefined>();
  const open = (id: string) => { setSelected(id); router.push(`/item/${id}`); };

  return (
    <Screen>
      {data ? (
        <>
          <Heading eyebrow={t('tabHouse')} title={`${data.home.seniorName.split(' ')[0]} · ${data.home.town}`} sub={t('dragToRotate')} />
          <View style={{ flexDirection: 'row', backgroundColor: colors.sheet, borderRadius: 12, padding: 3, borderWidth: 1, borderColor: colors.line }}>
            {(['3d', '2d'] as const).map((v) => (
              <Pressable key={v} accessibilityRole="button" accessibilityState={{ selected: view === v }} onPress={() => setView(v)}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center', backgroundColor: view === v ? colors.aiTint : 'transparent' }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: view === v ? colors.ai : colors.inkSoft }}>{v === '3d' ? t('view3d') : t('view2d')}</Text>
              </Pressable>
            ))}
          </View>
          <Card style={{ padding: 8 }}>
            {view === '3d'
              ? <Home3D rooms={data.home.rooms} items={data.items} selected={selected} onSelect={open} />
              : <FloorPlan rooms={data.home.rooms} items={data.items} selected={selected} onSelect={open} />}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingHorizontal: 6, paddingTop: 4 }}>
              {([['sorted', t('legendSorted')], ['now', t('legendNow')], ['later', t('legendLater')]] as const).map(([k, label]) => (
                <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: roomColor[k], borderWidth: 1, borderColor: colors.line }} />
                  <Text style={type.caption}>{label}</Text>
                </View>
              ))}
            </View>
          </Card>
          <Text style={type.section}>{t('items')}</Text>
          {data.items.map((it) => {
            const room = data.home.rooms.find((r) => r.id === it.roomId);
            return (
              <Pressable key={it.id} accessibilityRole="button" onPress={() => open(it.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.sheet }}>
                <Glyph ch={it.glyph} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={type.bodyBold}>{lang === 'ja' && it.nameJa ? it.nameJa : it.name}</Text>
                  <Text style={type.caption}>{room ? (lang === 'ja' ? room.nameJa : room.name) : ''}{it.suggestion && it.decision === 'open' ? ` · ${t('yourSuggestion')}: ${t(`decision_${it.suggestion}`)}` : ''}</Text>
                </View>
                <DecisionChip decision={it.decision} />
              </Pressable>
            );
          })}
        </>
      ) : null}
    </Screen>
  );
}
