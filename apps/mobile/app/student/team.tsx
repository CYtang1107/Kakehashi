import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { READINESS, pick, type ReadinessStep, type Student } from '@kakehashi/shared';
import { Avatar, Card, Columns, Fold, Screen, formatDate } from '../../src/ui';
import { StudentBadges } from '../../src/Community';
import { useData } from '../../src/data';
import { useI18n } from '../../src/i18n';
import { api } from '../../src/api';
import { colors, type } from '../../src/theme';

// Coordinator view: every student passes each step before visiting a senior.
export default function Team() {
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [error, setError] = useState<string | null>(null);
  if (!data) return <Screen>{null}</Screen>;

  const toggle = async (s: Student, step: ReadinessStep) => {
    setError(null);
    try {
      await api.studentStep(data.home.id, s.id, step, !s.passed[step]);
      await refresh();
      showToast(t('saved'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    }
  };

  // One card per student; on a laptop they sit in two columns.
  const studentCard = (s: (typeof data.home.students)[number], i: number) => (
        <Card key={s.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Avatar initial={s.initial} tone={i % 2 ? 'moss' : 'plum'} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={type.bodyBold}>{s.name} · <Text style={type.caption}>{pick(lang, s.university, s.universityJa)}</Text></Text>
              {s.role === 'trainee' ? <Text style={type.caption}>{t('traineeRole')}</Text> : null}
            </View>
          </View>
          <StudentBadges student={s} />
          <Fold title={t('teamStepsDone', { done: READINESS.filter((x) => s.passed[x]).length, total: READINESS.length })} icon="check-square" open={READINESS.some((x) => !s.passed[x])}>
          {READINESS.map((step) => {
            const done = s.passed[step];
            return (
              <Pressable key={step} accessibilityRole="checkbox" accessibilityState={{ checked: Boolean(done) }} onPress={() => toggle(s, step)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                <Feather name={done ? 'check-square' : 'square'} size={20} color={done ? colors.moss : colors.inkSoft} />
                <Text style={[type.body, { flex: 1, color: done ? colors.ink : colors.inkSoft }]}>{t(`step_${step}`)}</Text>
                {done ? <Text style={type.caption}>{formatDate(done, lang)}</Text> : null}
              </Pressable>
            );
          })}
          </Fold>
        </Card>
  );

  return (
    <Screen wide fit header={{ title: t('teamTitle'), sub: t('teamLead') }}>
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
      <Columns fill scrollLeft
        left={data.home.students.map((s, i) => (i % 2 ? null : studentCard(s, i)))}
        right={data.home.students.map((s, i) => (i % 2 ? studentCard(s, i) : null))}
      />
    </Screen>
  );
}
