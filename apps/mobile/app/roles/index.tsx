import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppText, Screen, useWide } from '../../src/ui';
import { useI18n, type Key } from '../../src/i18n';
import { elevation, radii, spacing } from '../../src/theme';
import { useAccessibilityPreferences } from '../../src/design-system/preferences';

const roles: { path: '/her' | '/family' | '/student' | '/worker'; title: Key; hint: Key; icon: keyof typeof Feather.glyphMap }[] = [
  { path: '/her', title: 'roleHer', hint: 'roleHerHint', icon: 'sun' },
  { path: '/family', title: 'roleFamily', hint: 'roleFamilyHint', icon: 'home' },
  { path: '/student', title: 'roleStudents', hint: 'roleStudentsHint', icon: 'users' },
  { path: '/worker', title: 'roleHelpers', hint: 'roleHelpersHint', icon: 'tool' },
];

export default function RolesPage() {
  const { t } = useI18n();
  const { palette, preferences } = useAccessibilityPreferences();
  const wide = useWide();
  return <Screen requiresHome={false} wide globalNav="roles" header={{ eyebrow: t('roleEntryEyebrow'), title: t('chooseRole') }}>
    <AppText variant="caption">{t('uxRoleLead')}</AppText>
    <View style={{ gap: spacing.lg, flexDirection: wide ? 'row' : 'column', flexWrap: 'wrap' }}>
      {roles.map((role) => <Pressable key={role.path} accessibilityRole="button" accessibilityLabel={t(role.title)} accessibilityHint={t(role.hint)} onPress={() => router.push(role.path)}
        style={({ pressed }) => ({ minHeight: 152, padding: spacing.xl, gap: spacing.lg, flexDirection: 'row', alignItems: 'center',
          ...(wide ? { flexBasis: '47%', flexGrow: 1 } : {}), ...elevation,
          borderRadius: radii.card, borderWidth: preferences.highContrast ? 2 : 1, borderColor: preferences.highContrast ? palette.border : 'transparent',
          backgroundColor: pressed ? palette.secondary : palette.surface })}>
        <View style={{ width: 60, height: 60, borderRadius: radii.control, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.secondary }}>
          <Feather name={role.icon} size={26} color={palette.primary} accessible={false} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <AppText variant="section">{t(role.title)}</AppText>
          <AppText variant="caption">{t(role.hint)}</AppText>
        </View>
        <Feather name="chevron-right" size={22} color={palette.inkSoft} accessible={false} />
      </Pressable>)}
    </View>
  </Screen>;
}
