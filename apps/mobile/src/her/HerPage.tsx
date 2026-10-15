import React, { useCallback, useRef } from 'react';
import { AccessibilityInfo, ActivityIndicator, Platform, View, findNodeHandle } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { AppText, Button, ScreenFrame, StatusBanner, type ScreenHeader } from '../ui';
import { useData } from '../data';
import { useI18n } from '../i18n';

// The persistent shell owns navigation and feedback; pages own a single scroll area.
export function HerPage({ children, title, description, header, back, wide }: {
  children: React.ReactNode; title?: string; description?: string; header?: ScreenHeader;
  back?: boolean; wide?: boolean; fit?: boolean;
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
  return <ScreenFrame wide={wide}>
    <View ref={heading} tabIndex={-1} accessible accessibilityRole="header" accessibilityLabel={title ?? header?.title} style={{ gap: 8 }}>
      <AppText variant="title">{title ?? header?.title}</AppText>
      {description || header?.sub ? <AppText variant="caption">{description ?? header?.sub}</AppText> : null}
    </View>
    {back ? <Button label={t('back')} icon="chevron-left" kind="secondary"
      onPress={() => router.canGoBack() ? router.back() : router.replace('/her')} /> : null}
    {error ? <StatusBanner tone="error" title={t('dsConnectionTitle')} message={t('dsConnectionBody')}
      action={{ label: t('retry'), onPress: refresh }} /> : !data ? <View style={{ gap: 16 }}>
      <ActivityIndicator /><AppText>{t('dsLoading')}</AppText>
    </View> : children}
  </ScreenFrame>;
}
