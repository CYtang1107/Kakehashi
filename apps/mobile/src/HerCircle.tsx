import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { pick } from '@kakehashi/shared';
import { useData } from './data';
import { useI18n } from './i18n';
import { colors, fonts, type } from './theme';

// Concept preview of "her circle" (the vision in the proposal): people she chooses are told,
// gently, when a day does not look normal. Nothing is sensed or sent; the switch only changes this card.
export function HerCircleCard({ mode }: { mode: 'her' | 'family' }) {
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
  const size = her ? { title: 22, body: 18, small: 15 } : { title: 17, body: 15, small: 12.5 };

  return (
    <View style={{ gap: 12, padding: her ? 18 : 16, borderRadius: 16, backgroundColor: colors.sheet, borderWidth: 1, borderColor: colors.line }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Feather name="shield" size={her ? 26 : 20} color={on ? colors.moss : colors.inkSoft} />
        <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: size.title, color: colors.ink }}>{her ? t('circleTitleHer') : t('circleTitleFamily', { name: first })}</Text>
        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: '#F3E9D2' }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: '#7A5B1E' }}>{t('circlePreview')}</Text>
        </View>
      </View>

      <Text style={{ fontFamily: fonts.medium, fontSize: size.body, lineHeight: size.body * 1.5, color: colors.ink }}>
        {on ? t(her ? 'circleRuleHer' : 'circleRuleFamily', { name: first }) : t('circleOff')}
      </Text>

      {on ? (
        <View style={{ gap: 8 }}>
          {people.map((p) => (
            <View key={p.role} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: her ? 40 : 32, height: her ? 40 : 32, borderRadius: 99, backgroundColor: colors.mossTint, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={p.icon} size={her ? 20 : 16} color={colors.moss} />
              </View>
              <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: size.body, color: colors.ink }}>{p.who}
                <Text style={{ fontFamily: fonts.medium, color: colors.inkSoft }}>  {p.role}</Text>
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Only she can switch it; the family sees what she chose. */}
      {her ? (
        <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} onPress={() => setOn((x) => !x)}
          style={{ minHeight: 56, borderRadius: 14, borderWidth: 2, borderColor: on ? colors.moss : colors.line, backgroundColor: on ? colors.mossTint : colors.sheet,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Feather name={on ? 'toggle-right' : 'toggle-left'} size={28} color={on ? colors.moss : colors.inkSoft} />
          <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: on ? colors.moss : colors.ink }}>{on ? t('circleSwitchOff') : t('circleSwitchOn')}</Text>
        </Pressable>
      ) : null}

      <Text style={[type.caption, { fontSize: size.small, lineHeight: size.small * 1.45 }]}>{t('circleNote')}</Text>
    </View>
  );
}
