import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppText, Screen } from '../../src/ui';
import { useI18n, type Key } from '../../src/i18n';
import { colors } from '../../src/theme';

const roles: { path: '/her' | '/family' | '/student' | '/worker'; title: Key; hint: Key; icon: keyof typeof Feather.glyphMap }[] = [
  { path: '/her', title: 'roleHer', hint: 'roleHerHint', icon: 'sun' },
  { path: '/family', title: 'roleFamily', hint: 'roleFamilyHint', icon: 'home' },
  { path: '/student', title: 'roleStudents', hint: 'roleStudentsHint', icon: 'users' },
  { path: '/worker', title: 'roleHelpers', hint: 'roleHelpersHint', icon: 'tool' },
];

export default function RolesPage() {
  const { t } = useI18n();
  return <Screen requiresHome={false} globalNav="roles" header={{ eyebrow: t('roleEntryEyebrow'), title: t('chooseRole') }}>
    <View style={{ gap: 12 }}>
      {roles.map((role) => <Pressable key={role.path} accessibilityRole="button" onPress={() => router.push(role.path)}
        style={({ pressed }) => ({ minHeight: 88, padding: 16, gap: 14, flexDirection: 'row', alignItems: 'center',
          borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: pressed ? colors.secondary : colors.sheet })}>
        <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary }}>
          <Feather name={role.icon} size={24} color={colors.primary} accessible={false} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <AppText variant="section">{t(role.title)}</AppText>
          <AppText variant="caption">{t(role.hint)}</AppText>
        </View>
        <Feather name="chevron-right" size={22} color={colors.inkSoft} accessible={false} />
      </Pressable>)}
    </View>
  </Screen>;
}
