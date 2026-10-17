import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppText as Text } from './design-system/AppText';
import { useAccessibilityPreferences } from './design-system/preferences';
import { Feather } from '@expo/vector-icons';
import { pick } from '@kakehashi/shared';
import { Fold } from './ui';
import { useData } from './data';
import { useI18n } from './i18n';
import { fonts, type } from './theme';

// Concept preview of "her circle" (the vision in the proposal): people she chooses are told,
// gently, when a day does not look normal. Nothing is sensed or sent; the switch only changes this card.
export function HerCircleCard({ mode }: { mode: 'her' | 'family' }) {
  const { palette: colors } = useAccessibilityPreferences();
  const { data } = useData();
  const { t, lang } = useI18n();
  const [on, setOn] = useState(true);
  if (!data) return null;
  const { home } = data;
  const her = mode === 'her';
  const first = lang === 'ja' && home.seniorNameJa ? `${home.seniorNameJa.split(' ')[1]}さん` : home.seniorName.split(' ')[0];
  const pair = home.students.filter((s) => s.role === 'pair').map((s) => s.name);
  const people: { icon: React.ComponentProps<typeof Feather>['name']; who: string; role: string }[] = [
    { icon: 'heart', who: pick(lang, home.childName, home.childNameJa), role: t('circleRoleFamily') },
    { icon: 'users', who: pair.join(lang === 'ja' ? '・' : ' & '), role: t('circleRoleStudents') },
    { icon: 'home', who: t('circleNeighbourName'), role: t('circleRoleNeighbour') },
  ];
  const fs = her ? 16 : 14;

  // Who is in the circle, as a row of name chips.
  const chips = (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {people.map((p) => (
        <View key={p.role} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 99, backgroundColor: colors.mossTint }}>
          <Feather name={p.icon} size={fs} color={colors.moss} />
          <Text variant="caption" style={{ fontFamily: fonts.bold, fontSize: fs, lineHeight: fs * 1.4, color: colors.ink }}>{p.who}<Text variant="caption" style={{ fontFamily: fonts.medium, fontSize: fs, lineHeight: fs * 1.4, color: colors.inkSoft }}> · {p.role}</Text></Text>
        </View>
      ))}
    </View>
  );
  const note = <Text style={type.caption}>{t('circleNote')}</Text>;

  // The family sees what she chose, folded to one line like the other sections of their home screen.
  if (!her) {
    return (
      <Fold title={t('circleTitleFamily', { name: first })} icon="shield" summary={t('circleSummary', { n: people.length })}>
        <Text style={type.body}>{t('circleRuleFamily', { name: first })}</Text>
        {chips}
        {note}
      </Fold>
    );
  }

  return (
    <View style={{ gap: 12, padding: 16, borderRadius: 16, backgroundColor: colors.sheet, borderWidth: 1, borderColor: colors.line }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Feather name="shield" size={24} color={on ? colors.moss : colors.inkSoft} />
        <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 22, color: colors.ink }}>{t('circleTitleHer')}</Text>
        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: '#F3E9D2' }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: '#7A5B1E' }}>{t('circlePreview')}</Text>
        </View>
      </View>
      <Text style={{ fontFamily: fonts.medium, fontSize: 18, lineHeight: 27, color: colors.ink }}>{on ? t('circleRuleHer') : t('circleOff')}</Text>
      {on ? chips : null}
      {/* Only she can switch it; the family sees what she chose. */}
      <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} onPress={() => setOn((x) => !x)}
        style={{ minHeight: 52, borderRadius: 14, borderWidth: 2, borderColor: on ? colors.moss : colors.line, backgroundColor: on ? colors.mossTint : colors.sheet,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <Feather name={on ? 'toggle-right' : 'toggle-left'} size={26} color={on ? colors.moss : colors.inkSoft} />
        <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: on ? colors.moss : colors.ink }}>{on ? t('circleSwitchOff') : t('circleSwitchOn')}</Text>
      </Pressable>
      {note}
    </View>
  );
}
