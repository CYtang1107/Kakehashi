import React from 'react';
import { View } from 'react-native';
import { AppText, Fold } from '../../ui';
import { useHomeDemo } from '../homeDemo/store';
import { useHomeCopy, changeLabel } from '../homeDemo/copy';
export function DeviceActivityLog() {
  const { state } = useHomeDemo(), { c, lang } = useHomeCopy();
  return <Fold title={c('log')} icon="clock">{state.activity.length ? state.activity.map(entry => <View key={entry.id} style={{ gap: 8, paddingVertical: 12 }}>
    <AppText variant="caption">{new Date(entry.at).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-GB', { timeZone: 'Asia/Tokyo' })}</AppText>
    {entry.changes.map(change => <AppText key={change.id}>{c('simulated')} {changeLabel(change, lang)}</AppText>)}
  </View>) : <AppText>{c('noLog')}</AppText>}</Fold>;
}
