import { useAccessibilityPreferences } from './design-system/preferences';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Item, Estimate } from '@kakehashi/shared';
import { AppText as Text, Card, StatusBanner } from './ui';
import { useI18n } from './i18n';
import { api } from './api';
import { colors, fonts, type, yen } from './theme';
// Value is shown only when someone asks. It is never the reason to let something go.
export function Worth({ item }: { item: Item }) {
  const { palette: colors } = useAccessibilityPreferences();
  const { t } = useI18n();
  const [shown, setShown] = useState<Estimate | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const reveal = async () => {
    if (item.estimate) { setShown(item.estimate); return; }
    setBusy(true); setError(false);
    try { setShown(await api.estimate({ name: item.name })); } catch { setError(true); } finally { setBusy(false); }
  };
  return (
    <Card flat style={{ paddingTop: 8 }}>
      {error ? <StatusBanner tone="error" title={t('dsConnectionTitle')} message={t('dsConnectionBody')} /> : null}
      {shown ? (
        <>
          <Text style={type.eyebrow}>{t('estimate')} · {t('estimateBy', { source: shown.source === 'claude' ? t('sourceClaude') : t('sourceOffline') })}</Text>
          <Text style={type.section}>{shown.priceHighJpy > 0 ? `${yen(shown.priceLowJpy)} – ${yen(shown.priceHighJpy)}` : '¥0'}</Text>
          <Text style={type.caption}>{shown.category} · {shown.reason}</Text>
          <Text style={type.caption}>{t('routeIfLetGo', { route: t(`decision_${shown.routeIfLetGo}`) })}</Text>
        </>
      ) : (
        <>
          <Pressable accessibilityRole="button" onPress={reveal} disabled={busy} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 56 }}>
            <Feather name="help-circle" size={16} color={colors.ai} />
            <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.ai }}>{busy ? t('estimating') : t('whatWorth')}</Text>
          </Pressable>
          <Text style={type.caption}>{t('worthHint')}</Text>
        </>
      )}
    </Card>
  );
}

