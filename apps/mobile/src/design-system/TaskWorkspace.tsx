import React, { useEffect, useId, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform, Pressable, ScrollView, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useI18n } from '../i18n';
import { control, radii, spacing } from '../theme';
import { AppText } from './AppText';
import { Button } from './Controls';
import { useAccessibilityPreferences } from './preferences';
import { useResponsiveLayout } from './useResponsiveLayout';

export function SectionTabs<T extends string>({ value, options, onChange, label }: {
  value: T; options: readonly (readonly [T, string])[]; onChange: (value: T) => void; label: string;
}) {
  const { palette } = useAccessibilityPreferences();
  const { compact } = useResponsiveLayout();
  const horizontal = compact && options.length > 3;
  const group = useRef<View>(null);
  const scroll = useRef<ScrollView>(null);
  const positions = useRef<Record<string, number>>({});
  useEffect(() => {
    if (horizontal) scroll.current?.scrollTo({ x: positions.current[value] ?? 0, animated: false });
  }, [value, horizontal]);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const element = group.current as unknown as HTMLElement | null;
    const move = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const tabs = Array.from(element?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);
      const index = tabs.indexOf(document.activeElement as HTMLElement);
      if (index < 0 || !tabs.length) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      onChange(options[next][0]);
      tabs[next].focus();
    };
    element?.addEventListener('keydown', move);
    return () => element?.removeEventListener('keydown', move);
  }, [options, onChange, horizontal]);
  const focusedTab = options.some(([id]) => id === value) ? value : options[0]?.[0];
  const tabs = <View ref={group} accessibilityRole="tablist" accessibilityLabel={label} style={{ flexDirection: 'row', flexWrap: horizontal ? 'nowrap' : 'wrap', gap: spacing.sm }}>
    {options.map(([id, title]) => <View key={id} style={{ flexGrow: horizontal ? 0 : 1, minWidth: 0, maxWidth: horizontal ? undefined : '100%' }} onLayout={event => {
      positions.current[id] = event.nativeEvent.layout.x;
      if (horizontal && id === value) scroll.current?.scrollTo({ x: positions.current[id], animated: false });
    }}><Button accessibilityRole="tab" tabIndex={focusedTab === id ? 0 : -1} label={title} kind="secondary" selected={value === id}
      style={{ flexGrow: horizontal ? 0 : 1, flexShrink: horizontal ? 0 : 1, backgroundColor: value === id ? palette.secondary : palette.surface }}
      onPress={() => onChange(id)} /></View>)}
  </View>;
  return horizontal ? <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator style={{ flexGrow: 0, flexShrink: 0 }}
    keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.sm }}>{tabs}</ScrollView> : tabs;
}

// Visited forms stay mounted so moving between tasks does not discard an unfinished draft.
export function TaskPanel({ active, children, retain = true }: { active: boolean; children: React.ReactNode; retain?: boolean }) {
  const [visited, setVisited] = useState(active);
  useEffect(() => { if (active) setVisited(true); }, [active]);
  if (!active && (!visited || !retain)) return null;
  return <View accessibilityElementsHidden={!active} importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
    style={{ display: active ? 'flex' : 'none', gap: spacing.xl }}>{children}</View>;
}

export type WorkspaceTask = { id: string; label: string; description?: string; icon?: keyof typeof Feather.glyphMap; content: React.ReactNode; retain?: boolean };

export function TaskWorkspace({ tasks, defaultTask, label, tabs = false }: {
  tasks: WorkspaceTask[]; defaultTask?: string; label?: string; tabs?: boolean;
}) {
  const { t } = useI18n();
  const { palette, preferences } = useAccessibilityPreferences();
  const { compact } = useResponsiveLayout();
  const [selected, setSelected] = useState<string | null>(defaultTask ?? null);
  const [focused, setFocused] = useState<string | null>(null);
  const heading = useRef<View>(null);
  const id = useId();
  const current = tasks.find(task => task.id === selected);
  const choose = (task: string | null) => {
    setSelected(task);
    if (!tabs) requestAnimationFrame(() => {
      if (Platform.OS === 'web') (heading.current as unknown as HTMLElement | null)?.focus({ preventScroll: true });
      else { const handle = findNodeHandle(heading.current); if (handle) AccessibilityInfo.setAccessibilityFocus(handle); }
    });
  };
  return <View style={{ gap: spacing.xl }}>
    {tabs ? <SectionTabs label={label ?? t('uxChooseTask')} value={selected ?? ''} options={tasks.map(task => [task.id, task.label] as const)} onChange={choose} />
      : current ? <Button label={t('uxAllTasks')} icon="arrow-left" kind="tertiary" style={{ alignSelf: 'flex-start' }} onPress={() => choose(null)} /> : null}
    <View ref={heading} tabIndex={-1} style={{ gap: spacing.sm }}>
      <AppText variant="section">{current?.label ?? label ?? t('uxChooseTask')}</AppText>
      {current?.description ? <AppText variant="caption">{current.description}</AppText> : null}
    </View>
    {!current && !tabs ? <View style={{ gap: spacing.md }}>{tasks.map(task => <Pressable key={task.id}
      accessibilityRole="button" accessibilityLabel={task.label} accessibilityHint={task.description}
      onFocus={() => setFocused(task.id)} onBlur={() => setFocused(null)} onPress={() => choose(task.id)}
      style={({ pressed }) => ({ minHeight: control.secondary, padding: compact ? spacing.lg : spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
        borderRadius: radii.card, backgroundColor: pressed ? palette.secondary : palette.surface,
        borderWidth: preferences.highContrast || focused === task.id ? 2 : 1,
        borderColor: focused === task.id ? palette.focus : preferences.highContrast ? palette.border : palette.separator })}>
      {task.icon ? <Feather name={task.icon} size={24} color={palette.primary} accessible={false} /> : null}
      <View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}><AppText variant="bodyBold">{task.label}</AppText>
        {task.description ? <AppText variant="caption">{task.description}</AppText> : null}</View>
      <Feather name="chevron-right" size={22} color={palette.inkSoft} accessible={false} />
    </Pressable>)}</View> : null}
    {tasks.map(task => <TaskPanel key={task.id} active={task.id === selected} retain={task.retain}><View nativeID={`${id}-${task.id}`} style={{ gap: spacing.xl }}>{task.content}</View></TaskPanel>)}
  </View>;
}
