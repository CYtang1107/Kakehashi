import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Columns, NightBand, TopBar, useWide } from '../src/ui';
import { useI18n, type Key } from '../src/i18n';
import { colors, fonts, type } from '../src/theme';

const ROLES: { group: 'home' | 'beyond'; path: '/family' | '/student' | '/her' | '/stories' | '/worker'; title: Key; hint: Key; icon: keyof typeof Feather.glyphMap }[] = [
  { group: 'home', path: '/her', title: 'roleHer', hint: 'roleHerHint', icon: 'sun' },
  { group: 'home', path: '/family', title: 'roleFamily', hint: 'roleFamilyHint', icon: 'home' },
  { group: 'home', path: '/student', title: 'roleStudents', hint: 'roleStudentsHint', icon: 'users' },
  { group: 'beyond', path: '/worker', title: 'roleHelpers', hint: 'roleHelpersHint', icon: 'tool' },
  { group: 'beyond', path: '/stories', title: 'roleReaders', hint: 'roleReadersHint', icon: 'book-open' },
];

export default function RolePicker() {
  const { t } = useI18n();
  const wide = useWide();
  const maxWidth = wide ? 1120 : 640;

  const group = (g: 'home' | 'beyond') => (
    <View key={g} style={{ gap: 10 }}>
      <Text style={type.eyebrow}>{t(g === 'home' ? 'roleGroupHome' : 'roleGroupBeyond')}</Text>
      {ROLES.filter((r) => r.group === g).map((r) => (
        <Pressable key={r.path} accessibilityRole="button" onPress={() => router.push(r.path)}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1,
            borderColor: pressed ? colors.kakiInk : colors.line, backgroundColor: pressed ? colors.kakiTint : colors.sheet })}>
          {/* Night tiles with persimmon icons, matching the band above. */}
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.night, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={r.icon} size={21} color={colors.kakiNight} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.ink }}>{t(r.title)}</Text>
            <Text numberOfLines={2} style={[type.caption, { fontSize: 13.5, lineHeight: 19 }]}>{t(r.hint)}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.inkSoft} />
        </Pressable>
      ))}
    </View>
  );

  const body = (
    <>
      {/* On a laptop the two groups sit side by side, so the whole page fits the window. */}
      <Columns left={group('home')} right={group('beyond')} />
      <Text style={[type.caption, { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line }]}>{t('exampleData')}</Text>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <TopBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <NightBand header={{ title: '実家じまい, started early and done together', sub: t('chooseRole') }} maxWidth={maxWidth} />
        <View style={{ padding: 16, gap: 16, maxWidth, width: '100%', alignSelf: 'center' }}>
          {body}
        </View>
      </ScrollView>
    </View>
  );
}
