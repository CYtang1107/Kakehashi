import { AppText as Text } from './design-system/AppText';
import React from 'react';
import { View } from 'react-native';
import type { Handover } from '@kakehashi/shared';
import { colors, type } from './theme';
import { useI18n } from './i18n';
import { formatDate } from './ui';

// Chain of custody: each handover the item went through.
export function Journey({ steps }: { steps: Handover[] }) {
  const { t, lang } = useI18n();
  return (
    <View>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const tone = s.stage === 'recycler' || s.stage === 'collected' ? colors.kaki : last ? colors.moss : colors.ai;
        return (
          <View key={`${s.at}-${i}`} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center', width: 14 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: tone, marginTop: 5 }} />
              {!last ? <View style={{ flex: 1, width: 2, backgroundColor: colors.line }} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: last ? 0 : 14 }}>
              <Text style={type.bodyBold}>{t(`stage_${s.stage}`)} · {s.by}</Text>
              <Text style={type.caption}>{formatDate(s.at, lang)}{s.note ? ` · ${s.note}` : ''}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
