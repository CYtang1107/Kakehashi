import React, { useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, findNodeHandle, useWindowDimensions, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import type { Decision } from '@kakehashi/shared';
import { colors, decisionColor, fonts, type, control, layout, spacing } from './theme';
import { useI18n } from './i18n';
import { useData } from './data';
import { AppText } from './design-system/AppText';
import { Button, IconLabelButton, AccessibleTextInput } from './design-system/Controls';
import { Card } from './design-system/Cards';
import { StatusBanner, ToastFeedback } from './design-system/Feedback';
import { ReadingSettings } from './design-system/ReadingSettings';
import { ConfirmationDialog } from './design-system/ConfirmationDialog';
import { useAccessibilityPreferences } from './design-system/preferences';
export { AppText } from './design-system/AppText';
export { Button, PrimaryButton, SecondaryButton, DestructiveButton, IconLabelButton, AccessibleSwitch, AccessibleTextInput } from './design-system/Controls';
export { Card, UpcomingVisitCard, MemoryCard, FriendRecommendationCard, HomeAssistanceCard, DeviceControlCard, ReminderCard, SafetyCard } from './design-system/Cards';
export { StatusBanner, ToastFeedback, EmptyState } from './design-system/Feedback';
export { ConfirmationDialog } from './design-system/ConfirmationDialog';
export { ScreenFrame } from './design-system/ScreenFrame';

export function LangToggle() {
  const { lang, setLang, t } = useI18n();
  return <Button label={lang === 'en' ? '日本語' : 'English'} kind="secondary"
    accessibilityLabel={t('dsChangeLanguage')} onPress={() => setLang(lang === 'en' ? 'ja' : 'en')} />;
}

export function TopBar({ back, roleSwitch }: { back?: boolean; roleSwitch?: boolean }) {
  const { top } = useSafeAreaInsets();
  const { t } = useI18n();
  const { palette } = useAccessibilityPreferences();
  const [reading, setReading] = useState(false);
  const [settings, setSettings] = useState(false);
  const settingsTrigger = useRef<View>(null);
  const closeReading = () => {
    setReading(false);
    // The reading trigger lived inside the now-closed Settings dialog. Return to its stable opener.
    setTimeout(() => {
      if (Platform.OS === 'web') {
        (settingsTrigger.current as unknown as HTMLElement | null)?.querySelector<HTMLElement>('[role="button"],button')?.focus();
      } else {
        const handle = findNodeHandle(settingsTrigger.current);
        if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
      }
    }, 0);
  };
  return <View style={{ paddingTop: top + spacing.sm, paddingHorizontal: layout.margin, paddingBottom: spacing.lg,
    gap: spacing.md, backgroundColor: palette.paper, borderBottomWidth: 1, borderBottomColor: palette.separator }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md }}>
      <AppText variant="bodyBold" style={{ color: palette.primary }}>KAKEHASHI 架け橋</AppText>
      <View style={{ flex: 1 }} />
      <View ref={settingsTrigger} accessible={false}>
        <IconLabelButton label={t('hSettings')} kind="secondary" icon="settings" onPress={() => setSettings(true)} />
      </View>
      {back ? <IconLabelButton label={t('back')} kind="secondary" icon="chevron-left"
        onPress={() => router.canGoBack() ? router.back() : router.replace('/')} /> : null}
    </View>
    <ConfirmationDialog visible={settings} title={t('hSettings')} onCancel={() => setSettings(false)}>
      {roleSwitch ? <IconLabelButton label={t('switchRole')} kind="secondary" icon="users" onPress={() => router.replace('/')} /> : null}
      <LangToggle />
      <IconLabelButton label={t('dsReadingSettings')} kind="secondary" icon="type" onPress={() => { setSettings(false); setReading(true); }} />
    </ConfirmationDialog>
    <ReadingSettings visible={reading} onClose={closeReading} />
  </View>;
}

export type ScreenHeader = { eyebrow?: string; title: string; sub?: string; leading?: React.ReactNode; large?: boolean };

// Laptop layouts start at this width; below it everything is one column.
export const WIDE_MIN = layout.wideMin;
export function useWide() {
  const { width, height, fontScale } = useWindowDimensions();
  const { scale } = useAccessibilityPreferences();
  return width >= WIDE_MIN * scale && height >= 700 * scale && fontScale <= 1.2;
}

// fit: on a laptop, the page fills the window and never scrolls; long panels scroll inside (Columns fill).
export function Screen({ children, back, roleSwitch = true, header, wide, fit, requiresHome = true }: {
  children: React.ReactNode; back?: boolean; roleSwitch?: boolean; header?: ScreenHeader; wide?: boolean; fit?: boolean; requiresHome?: boolean;
}) {
  const { data, error, refresh } = useData();
  const { t } = useI18n();
  const { palette } = useAccessibilityPreferences();
  const { bottom } = useSafeAreaInsets();
  const isWide = useWide();
  const maxWidth = wide && isWide ? layout.wideWidth : layout.compactWidth;
  const body = requiresHome && error ? <StatusBanner title={t('dsConnectionTitle')} message={t('dsConnectionBody')}
    tone="error" action={{ label: t('retry'), onPress: refresh }} />
    : requiresHome && !data ? <View style={{ padding: spacing.section, gap: spacing.lg, alignItems: 'center' }}>
      <ActivityIndicator color={palette.primary} accessibilityLabel={t('dsLoading')} /><AppText>{t('dsLoading')}</AppText>
    </View> : children;
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: palette.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <TopBar back={back} roleSwitch={roleSwitch} />
    {fit && isWide && (!requiresHome || (data && !error)) ? <View style={{ flex: 1, minHeight: 0 }}>
      {header ? <NightBand header={header} maxWidth={maxWidth} /> : null}
      <View style={{ flex: 1, minHeight: 0, padding: layout.margin, paddingBottom: bottom + layout.margin,
        gap: layout.gap, maxWidth, width: '100%', alignSelf: 'center' }}>{body}</View>
    </View> : <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets
      contentContainerStyle={{ paddingBottom: bottom + spacing.section }}>
      {header ? <NightBand header={header} maxWidth={maxWidth} /> : null}
      <View style={{ padding: layout.margin, gap: layout.gap, maxWidth, width: '100%', alignSelf: 'center' }}>{body}</View>
    </ScrollView>}
    <Toast />
  </KeyboardAvoidingView>;
}

// The page heading on night indigo, directly under the top bar so the two read as one band.
export function NightBand({ header, maxWidth }: { header: ScreenHeader; maxWidth: number }) {
  const { eyebrow, title, sub, leading } = header;
  return <View style={{ paddingHorizontal: layout.margin, paddingTop: spacing.xl, paddingBottom: spacing.sm }}>
    <View style={{ maxWidth, width: '100%', alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.lg }}>
      {leading}
      <View style={{ flex: 1, minWidth: 180, gap: spacing.sm }}>
        <AppText variant="title">{title}</AppText>
        {eyebrow ? <AppText variant="caption">{eyebrow}</AppText> : null}
        {sub ? <AppText variant="caption">{sub}</AppText> : null}
      </View>
    </View>
  </View>;
}

// Two columns on a laptop (left about 58%), one stacked column on a phone.
// stickyLeft keeps the left column in view while the right one scrolls (web only).
// fill: both columns take the full height left on the page; the right one scrolls inside itself (and the left one too with scrollLeft).
export function Columns({ left, right, stickyLeft, fill, scrollLeft }: { left: React.ReactNode; right: React.ReactNode; stickyLeft?: boolean; fill?: boolean; scrollLeft?: boolean }) {
  const wide = useWide();
  if (!wide) return <>{left}{right}</>;
  if (fill) {
    return (
      <View style={{ flex: 1, minHeight: 0, flexDirection: 'row', gap: 20 }}>
        {scrollLeft
          ? <ScrollPanel flex={1.38}>{left}</ScrollPanel>
          : <View style={{ flex: 1.38, minWidth: 0, minHeight: 0, gap: 14 }}>{left}</View>}
        <ScrollPanel flex={1}>{right}</ScrollPanel>
      </View>
    );
  }
  const sticky = stickyLeft && Platform.OS === 'web' ? ({ position: 'sticky', top: 16 } as unknown as ViewStyle) : null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 20 }}>
      <View style={[{ flex: 1.38, minWidth: 0, gap: 14 }, sticky]}>{left}</View>
      <View style={{ flex: 1, minWidth: 0, gap: 14 }}>{right}</View>
    </View>
  );
}

// A column that scrolls on its own. While more content sits below, the bottom fades into the paper,
// so cut-off text reads as "there is more" rather than a broken page.
const FADE_STEPS = [0.15, 0.35, 0.55, 0.75, 0.9];
function ScrollPanel({ children, flex }: { children: React.ReactNode; flex: number }) {
  const [box, setBox] = useState(0);
  const [content, setContent] = useState(0);
  const [offset, setOffset] = useState(0);
  const more = content - box - offset > 4;
  return (
    <View style={{ flex, minWidth: 0, minHeight: 0 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 14, paddingBottom: 24, paddingRight: 8 }} keyboardShouldPersistTaps="handled"
        scrollEventThrottle={32} onLayout={(e) => setBox(e.nativeEvent.layout.height)} onContentSizeChange={(_, h) => setContent(h)}
        onScroll={(e) => setOffset(e.nativeEvent.contentOffset.y)}>
        {children}
      </ScrollView>
      {more ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 14, bottom: 0, height: 40 }}>
          {FADE_STEPS.map((o) => <View key={o} style={{ flex: 1, backgroundColor: colors.paper, opacity: o }} />)}
        </View>
      ) : null}
    </View>
  );
}

export function Heading({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return <View style={{ gap: spacing.sm }}>
    <AppText variant="title">{title}</AppText>
    {eyebrow ? <AppText variant="caption">{eyebrow}</AppText> : null}
    {sub ? <AppText variant="caption">{sub}</AppText> : null}
  </View>;
}

// A section folded to one line (title + status) until tapped, to keep long screens short.
export function Fold({ title, summary, icon, children, open: initiallyOpen = false }: {
  title: string; summary?: string; icon?: keyof typeof Feather.glyphMap; children: React.ReactNode; open?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [focused, setFocused] = useState(false);
  const { palette } = useAccessibilityPreferences();
  return <View style={{ gap: spacing.lg }}>
    <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ expanded: open }}
      onPress={() => setOpen(value => !value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={({ pressed }) => ({ minHeight: control.secondary, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        padding: spacing.lg, borderRadius: 12, backgroundColor: pressed ? palette.secondary : palette.surface,
        borderWidth: 2, borderColor: focused ? palette.focus : palette.border })}>
      {icon ? <Feather name={icon} size={24} color={palette.primary} accessible={false} /> : null}
      <View style={{ flex: 1, gap: spacing.xs }}>
        <AppText variant="bodyBold">{title}</AppText>
        {summary ? <AppText variant="caption">{summary}</AppText> : null}
      </View>
      <Feather name={open ? 'chevron-up' : 'chevron-down'} size={24} color={palette.primary} accessible={false} />
    </Pressable>
    {open ? children : null}
  </View>;
}

// "I read this": a person confirms they read what the app drafted or checked, before it goes out.
export function ReadConfirm({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  const { palette } = useAccessibilityPreferences();
  return <Pressable accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{ checked }} onPress={() => onChange(!checked)}
    style={{ minHeight: control.secondary, flexDirection: 'row', gap: spacing.md, alignItems: 'center', padding: spacing.lg,
      borderWidth: 2, borderColor: palette.border, borderRadius: 12, backgroundColor: checked ? palette.secondary : palette.surface }}>
    <Feather name={checked ? 'check-square' : 'square'} size={24} color={palette.primary} accessible={false} />
    <AppText style={{ flex: 1 }}>{label}</AppText>
  </Pressable>;
}

export function DecisionChip({ decision }: { decision: Decision }) {
  const { t } = useI18n();
  const c = decisionColor[decision];
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99, alignSelf: 'flex-start', borderWidth: decision === 'open' ? 1 : 0, borderColor: colors.line, borderStyle: 'dashed' }}>
      <AppText variant="caption" style={{ color: c.fg, fontFamily: fonts.bold }}>{t(`decision_${decision}`)}</AppText>
    </View>
  );
}

export function Pill({ label, color = colors.ai, bg = colors.aiTint }: { label: string; color?: string; bg?: string }) {
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99, alignSelf: 'flex-start' }}>
      <AppText variant="caption" style={{ color, fontFamily: fonts.bold }}>{label}</AppText>
    </View>
  );
}

export function Glyph({ ch, size = 40 }: { ch: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 10, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.display, fontSize: size * 0.48, color: colors.ink }}>{ch}</Text>
    </View>
  );
}

export const Field = AccessibleTextInput;

export function Avatar({ initial, tone }: { initial: string; tone: 'plum' | 'moss' }) {
  const fg = tone === 'plum' ? colors.plum : colors.moss;
  const bg = tone === 'plum' ? colors.plumTint : colors.mossTint;
  return (
    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.bold, color: fg }}>{initial}</Text>
    </View>
  );
}

function Toast() {
  const { toast } = useData();
  return <ToastFeedback message={toast} />;
}

export const formatDate = (iso: string, lang: 'en' | 'ja') => {
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
  return lang === 'ja'
    ? `${d.getMonth() + 1}月${d.getDate()}日`
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
};
