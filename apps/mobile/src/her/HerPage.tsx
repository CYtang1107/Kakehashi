import React, { useCallback, useRef } from 'react';
import { AccessibilityInfo, ActivityIndicator, Platform, ScrollView, View, findNodeHandle } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { AppText, Button, ScreenFrame, StatusBanner, type ScreenHeader } from '../ui';
import { useData } from '../data';
import { useI18n } from '../i18n';

// The persistent shell owns navigation and feedback; pages own a single scroll area.
export function HerPage({ children, title, description, header, back, wide, requiresHome = true, footer, scrollRef }: {
  children: React.ReactNode; title?: string; description?: string; header?: ScreenHeader;
  back?: boolean; wide?: boolean; fit?: boolean; requiresHome?: boolean; footer?: React.ReactNode; scrollRef?: React.Ref<ScrollView>;
}) {
  const { data, error, refresh } = useData();
  const { t } = useI18n();
  const heading = useRef<View>(null);
  useFocusEffect(useCallback(() => {
    const timer = setTimeout(() => {
      if (Platform.OS === 'web') (heading.current as unknown as HTMLElement)?.focus();
      else { const handle = findNodeHandle(heading.current); if (handle) AccessibilityInfo.setAccessibilityFocus(handle); }
    }, 150);
    return () => clearTimeout(timer);
  }, []));
  return <ScreenFrame wide={wide} footer={footer} scrollRef={scrollRef}>
    {back ? <Button label={t('back')} icon="chevron-left" kind="tertiary" style={{ alignSelf: 'flex-start', paddingHorizontal: 12 }}
      onPress={() => router.canGoBack() ? router.back() : router.replace('/her')} /> : null}
    <View ref={heading} tabIndex={-1} accessibilityLabel={title ?? header?.title} style={{ gap: 8 }}>
      <AppText variant="title">{title ?? header?.title}</AppText>
      {description || header?.sub ? <AppText variant="caption">{description ?? header?.sub}</AppText> : null}
    </View>
    {requiresHome && error ? <StatusBanner tone="error" title={t('dsConnectionTitle')} message={t('dsConnectionBody')}
      action={{ label: t('retry'), onPress: refresh }} /> : requiresHome && !data ? <View style={{ gap: 16 }}>
      <ActivityIndicator /><AppText>{t('dsLoading')}</AppText>
    </View> : children}
  </ScreenFrame>;
}
