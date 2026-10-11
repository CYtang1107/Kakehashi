import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { TopBar } from '../src/ui';
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
  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <TopBar />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <View style={{ gap: 6, paddingVertical: 12 }}>
          <Text style={[type.title, { fontSize: 30, lineHeight: 40 }]}>実家じまい, started early and done together</Text>
          <Text style={[type.body, { color: colors.inkSoft }]}>{t('appTagline')}</Text>
        </View>
        <Text style={type.section}>{t('chooseRole')}</Text>
        {(['home', 'beyond'] as const).map((g) => (
          <View key={g} style={{ gap: 10 }}>
            <Text style={type.eyebrow}>{t(g === 'home' ? 'roleGroupHome' : 'roleGroupBeyond')}</Text>
        {ROLES.filter((r) => r.group === g).map((r) => (
          <Pressable key={r.path} accessibilityRole="button" onPress={() => router.push(r.path)}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.sheet, opacity: pressed ? 0.85 : 1 })}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.aiTint, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name={r.icon} size={22} color={colors.ai} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.ink }}>{t(r.title)}</Text>
              <Text style={type.caption}>{t(r.hint)}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.inkSoft} />
          </Pressable>
        ))}
          </View>
        ))}
        <Text style={type.caption}>{t('exampleData')}</Text>
      </ScrollView>
    </View>
  );
}
