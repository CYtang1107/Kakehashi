import React, { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions, type TextInputProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import type { Decision } from '@kakehashi/shared';
import { colors, decisionColor, fonts, type } from './theme';
import { useI18n } from './i18n';
import { useData } from './data';
import { API_BASE } from './api';

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={lang === 'en' ? '日本語に切り替え' : 'Switch to English'}
      onPress={() => setLang(lang === 'en' ? 'ja' : 'en')}
      style={{ paddingHorizontal: 10, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#33415C', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.nightRaised }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.onNight }}>{lang === 'en' ? '日本語' : 'EN'}</Text>
    </Pressable>
  );
}

// The top of every screen: night indigo, joined to the page heading band below it when a screen has one.
export function TopBar({ back, roleSwitch }: { back?: boolean; roleSwitch?: boolean }) {
  const { top } = useSafeAreaInsets();
  const { t } = useI18n();
  return (
    <View style={{ paddingTop: top + 8, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.night }}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel={t('back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
          <Feather name="chevron-left" size={26} color={colors.onNight} />
        </Pressable>
      ) : (
        <Text numberOfLines={1} style={{ fontFamily: fonts.display, fontSize: 17, color: colors.onNight, flexShrink: 1 }}>KAKEHASHI <Text style={{ color: colors.kakiNight }}>架け橋</Text></Text>
      )}
      <View style={{ flex: 1 }} />
      {roleSwitch ? (
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={{ paddingHorizontal: 10, height: 32, justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.onNight }}>{t('switchRole')}</Text>
        </Pressable>
      ) : null}
      <LangToggle />
    </View>
  );
}

export type ScreenHeader = { eyebrow?: string; title: string; sub?: string; leading?: React.ReactNode; large?: boolean };

// Laptop layouts start at this width; below it everything is one column.
export const WIDE_MIN = 900;
export function useWide() {
  return useWindowDimensions().width >= WIDE_MIN;
}

// fit: on a laptop, the page fills the window and never scrolls; long panels scroll inside (Columns fill).
export function Screen({ children, back, roleSwitch = true, header, wide, fit }: {
  children: React.ReactNode; back?: boolean; roleSwitch?: boolean; header?: ScreenHeader; wide?: boolean; fit?: boolean;
}) {
  const { data, error, refresh } = useData();
  const { t } = useI18n();
  const isWide = useWide();
  const maxWidth = wide && isWide ? 1120 : 640;
  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <TopBar back={back} roleSwitch={roleSwitch} />
      {error ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Card style={{ backgroundColor: colors.kakiTint, borderColor: 'transparent' }}>
            <Text style={type.bodyBold}>{t('serverDown', { url: API_BASE })}</Text>
            <Text style={type.caption}>{error}</Text>
            <Button label={t('retry')} onPress={refresh} />
          </Card>
        </View>
      ) : !data ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.ai} /></View>
      ) : fit && isWide ? (
        <View style={{ flex: 1 }}>
          {header ? <NightBand header={header} maxWidth={maxWidth} /> : null}
          <View style={{ flex: 1, padding: 16, gap: 14, maxWidth, width: '100%', alignSelf: 'center' }}>
            {children}
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {header ? <NightBand header={header} maxWidth={maxWidth} /> : null}
          <View style={{ padding: 16, gap: 14, maxWidth, width: '100%', alignSelf: 'center' }}>
            {children}
          </View>
        </ScrollView>
      )}
      <Toast />
    </View>
  );
}

// The page heading on night indigo, directly under the top bar so the two read as one band.
export function NightBand({ header, maxWidth }: { header: ScreenHeader; maxWidth: number }) {
  const { eyebrow, title, sub, leading, large } = header;
  return (
    <View style={{ backgroundColor: colors.night, paddingHorizontal: 16, paddingTop: 4, paddingBottom: large ? 24 : 18 }}>
      <View style={{ maxWidth, width: '100%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {leading}
        <View style={{ flex: 1, gap: 4 }}>
          {eyebrow ? <Text style={[type.eyebrow, { color: colors.kakiNight }]}>{eyebrow}</Text> : null}
          <Text style={[type.title, { color: colors.onNight }, large ? { fontSize: 34, lineHeight: 44 } : null]}>{title}</Text>
          {sub ? <Text style={[large ? { fontFamily: fonts.medium, fontSize: 18, lineHeight: 27 } : type.caption, { color: colors.onNightSoft }]}>{sub}</Text> : null}
        </View>
      </View>
    </View>
  );
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
          ? <ScrollView style={{ flex: 1.38, minWidth: 0 }} contentContainerStyle={{ gap: 14, paddingBottom: 8 }}>{left}</ScrollView>
          : <View style={{ flex: 1.38, minWidth: 0, minHeight: 0, gap: 14 }}>{left}</View>}
        <ScrollView style={{ flex: 1, minWidth: 0 }} contentContainerStyle={{ gap: 14, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">{right}</ScrollView>
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

export function Heading({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <View style={{ gap: 4 }}>
      {eyebrow ? <Text style={type.eyebrow}>{eyebrow}</Text> : null}
      <Text style={type.title}>{title}</Text>
      {sub ? <Text style={type.caption}>{sub}</Text> : null}
    </View>
  );
}

// Three weights: a sheet (default), a tinted note (tint), and a flat group that sits on the paper (flat).
export function Card({ children, style, tint, flat }: { children: React.ReactNode; style?: ViewStyle; tint?: boolean; flat?: boolean }) {
  return (
    <View style={[flat
      ? { paddingVertical: 4, gap: 8 }
      : { backgroundColor: tint ? colors.aiTint : colors.sheet, borderRadius: 14, borderWidth: tint ? 0 : 1, borderColor: colors.line, padding: 16, gap: 8 }, style]}>
      {children}
    </View>
  );
}

// A section folded to one line (title + status) until tapped, to keep long screens short.
export function Fold({ title, summary, icon, children, open: initiallyOpen = false }: {
  title: string; summary?: string; icon?: keyof typeof Feather.glyphMap; children: React.ReactNode; open?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const { t } = useI18n();
  if (open) {
    return (
      <View style={{ gap: 6 }}>
        {children}
        <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.ai }}>{t('showLess')}</Text>
          <Feather name="chevron-up" size={15} color={colors.ai} />
        </Pressable>
      </View>
    );
  }
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: false }} onPress={() => setOpen(true)}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14, borderRadius: 14,
        backgroundColor: colors.sheet, borderWidth: 1, borderColor: colors.line, opacity: pressed ? 0.85 : 1 })}>
      {icon ? <Feather name={icon} size={19} color={colors.ai} /> : null}
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={type.bodyBold} numberOfLines={1}>{title}</Text>
        {summary ? <Text style={type.caption} numberOfLines={1}>{summary}</Text> : null}
      </View>
      <Feather name="chevron-down" size={18} color={colors.inkSoft} />
    </Pressable>
  );
}

// "I read this": a person confirms they read what the app drafted or checked, before it goes out.
export function ReadConfirm({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => onChange(!checked)}
      style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: checked ? colors.mossTint : colors.paper }}>
      <Feather name={checked ? 'check-square' : 'square'} size={20} color={checked ? colors.moss : colors.inkSoft} />
      <Text style={[type.body, { flex: 1 }]}>{label}</Text>
    </Pressable>
  );
}

export function Button({ label, onPress, kind = 'primary', icon, disabled, busy }: {
  label: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'danger'; icon?: keyof typeof Feather.glyphMap; disabled?: boolean; busy?: boolean;
}) {
  const primary = kind === 'primary';
  const fg = primary ? colors.onNight : kind === 'danger' ? colors.danger : colors.ink;
  return (
    <Pressable accessibilityRole="button" disabled={disabled || busy} onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 46, paddingHorizontal: 16, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
        backgroundColor: primary ? colors.night : colors.sheet, borderWidth: primary ? 0 : 1, borderColor: colors.line,
        opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
      })}>
      {busy ? <ActivityIndicator color={fg} /> : icon ? <Feather name={icon} size={18} color={fg} /> : null}
      <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: fg }}>{label}</Text>
    </Pressable>
  );
}

export function DecisionChip({ decision }: { decision: Decision }) {
  const { t } = useI18n();
  const c = decisionColor[decision];
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99, alignSelf: 'flex-start', borderWidth: decision === 'open' ? 1 : 0, borderColor: colors.line, borderStyle: 'dashed' }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: c.fg }}>{t(`decision_${decision}`)}</Text>
    </View>
  );
}

export function Pill({ label, color = colors.ai, bg = colors.aiTint }: { label: string; color?: string; bg?: string }) {
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99, alignSelf: 'flex-start' }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 12, color }}>{label}</Text>
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

export function Field(props: TextInputProps & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={{ gap: 6 }}>
      <Text style={type.bodyBold}>{label}</Text>
      <TextInput placeholderTextColor={colors.inkSoft} {...rest}
        style={[{ borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, fontFamily: fonts.regular, fontSize: 15, color: colors.ink, backgroundColor: colors.sheet, textAlignVertical: rest.multiline ? 'top' : 'center', minHeight: rest.multiline ? 100 : 46 }, style]} />
    </View>
  );
}

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
  const { bottom } = useSafeAreaInsets();
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: bottom + 24, alignItems: 'center' }}>
      <View accessibilityLiveRegion="polite" style={{ backgroundColor: colors.ink, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99, maxWidth: '90%' }}>
        <Text style={{ fontFamily: fonts.medium, color: colors.sheet, fontSize: 14 }}>{toast}</Text>
      </View>
    </View>
  );
}

export const formatDate = (iso: string, lang: 'en' | 'ja') => {
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
  return lang === 'ja'
    ? `${d.getMonth() + 1}月${d.getDate()}日`
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
};
