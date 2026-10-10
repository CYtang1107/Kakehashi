import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
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
      style={{ paddingHorizontal: 10, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sheet }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.ink }}>{lang === 'en' ? '日本語' : 'EN'}</Text>
    </Pressable>
  );
}

export function TopBar({ back, roleSwitch }: { back?: boolean; roleSwitch?: boolean }) {
  const { top } = useSafeAreaInsets();
  const { t } = useI18n();
  return (
    <View style={{ paddingTop: top + 8, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.paper }}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel={t('back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
          <Feather name="chevron-left" size={26} color={colors.ink} />
        </Pressable>
      ) : (
        <Text numberOfLines={1} style={{ fontFamily: fonts.display, fontSize: 17, color: colors.ink, flexShrink: 1 }}>KAKEHASHI <Text style={{ color: colors.ai }}>架け橋</Text></Text>
      )}
      <View style={{ flex: 1 }} />
      {roleSwitch ? (
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={{ paddingHorizontal: 10, height: 32, justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.ai }}>{t('switchRole')}</Text>
        </Pressable>
      ) : null}
      <LangToggle />
    </View>
  );
}

export function Screen({ children, back, roleSwitch = true }: { children: React.ReactNode; back?: boolean; roleSwitch?: boolean }) {
  const { data, error, refresh } = useData();
  const { t } = useI18n();
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
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14, maxWidth: 640, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      )}
      <Toast />
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

export function Button({ label, onPress, kind = 'primary', icon, disabled, busy }: {
  label: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'danger'; icon?: keyof typeof Feather.glyphMap; disabled?: boolean; busy?: boolean;
}) {
  const primary = kind === 'primary';
  const fg = primary ? colors.sheet : kind === 'danger' ? colors.danger : colors.ink;
  return (
    <Pressable accessibilityRole="button" disabled={disabled || busy} onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 46, paddingHorizontal: 16, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
        backgroundColor: primary ? colors.ai : colors.sheet, borderWidth: primary ? 0 : 1, borderColor: colors.line,
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
