import { useAccessibilityPreferences } from '../../src/design-system/preferences';
import { AppText as Text } from '../../src/design-system/AppText';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { READINESS, pick, type ReadinessStep, type Student } from '@kakehashi/shared';
import { StatusBanner, Avatar, Card, Screen, SectionTabs, formatDate } from '../../src/ui';
import { StudentBadges } from '../../src/Community';
import { useData } from '../../src/data';
import { useI18n } from '../../src/i18n';
import { api } from '../../src/api';
import { type } from '../../src/theme';

// Coordinator view: every student passes each step before visiting a senior.
export default function Team() {
  const { palette: colors } = useAccessibilityPreferences();
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  if (!data) return <Screen>{null}</Screen>;

  const toggle = async (s: Student, step: ReadinessStep) => {
    if (busy) return; setBusy(true); setError(null);
    try {
      await api.studentStep(data.home.id, s.id, step, !s.passed[step]);
      await refresh();
      showToast(t('saved'));
    } catch (e) {
      setError(t('rSaveError'));
    } finally { setBusy(false); }
  };

  // One card per student; on a laptop they sit in two columns.
  const studentCard = (s: (typeof data.home.students)[number], i: number) => (
        <Card key={s.id}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            <Avatar initial={s.initial} tone={i % 2 ? 'moss' : 'plum'} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={type.bodyBold}>{s.name} · <Text style={type.caption}>{pick(lang, s.university, s.universityJa)}</Text></Text>
              {s.role === 'trainee' ? <Text style={type.caption}>{t('traineeRole')}</Text> : null}
            </View>
          </View>
          <Text variant="section">{t('uxReadiness', { done: READINESS.filter(step => s.passed[step]).length, total: READINESS.length })}</Text>
          <StudentBadges student={s} />
          {READINESS.map((step) => {
            const done = s.passed[step];
            return (
              <Pressable key={step} accessibilityRole="checkbox" disabled={busy} accessibilityState={{ checked: Boolean(done), disabled: busy }} aria-checked={Boolean(done)} aria-disabled={busy} onPress={() => toggle(s, step)}
                style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center',  flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                <Feather name={done ? 'check-square' : 'square'} size={20} color={done ? colors.moss : colors.inkSoft} />
                <Text style={[type.body, { flex: 1, color: done ? colors.ink : colors.inkSoft }]}>{t(`step_${step}`)}</Text>
                {done ? <Text style={type.caption}>{formatDate(done, lang)}</Text> : null}
              </Pressable>
            );
          })}
        </Card>
  );

  return (
    <Screen header={{ title: t('teamTitle'), sub: t('teamLead') }}>
      <StatusBanner title={t('rDemo')} message={t('rCoordinator')} />
      {error ? <StatusBanner tone="error" title={error} /> : null}
      <SectionTabs label={t('teamTitle')} value={studentId ?? data.home.students[0]?.id ?? ''}
        options={data.home.students.map(s => [s.id, s.name] as const)} onChange={setStudentId} />
      {data.home.students.map((s, i) => s.id === (studentId ?? data.home.students[0]?.id) ? studentCard(s, i) : null)}
    </Screen>
  );
}
