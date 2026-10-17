import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button } from '../../ui';
import { useHomeDemo } from '../homeDemo/store';
import { useHomeCopy, changeLabel } from '../homeDemo/copy';
import { ROUTINES } from './model';
export function RoutineCard({ routine }: { routine: keyof typeof ROUTINES }) {
  const [preview, setPreview] = useState(false), [applied, setApplied] = useState(false);
  const store = useHomeDemo(), { c, lang } = useHomeCopy();
  return <View style={{ gap: 12, paddingVertical: 16 }}>
    <AppText variant="bodyBold">{c(routine)}</AppText>
    <Button label={`${c('preview')} · ${c(routine)}`} kind="secondary" onPress={() => { setApplied(false); setPreview(value => !value); }} />
    {applied ? <AppText accessibilityLiveRegion="polite">{c('applied')}</AppText> : null}
    {preview ? <View style={{ gap: 12 }}>
      <AppText variant="bodyBold">{c('previewTitle')}</AppText>
      {ROUTINES[routine].map(change => <AppText key={change.id}>{changeLabel(change, lang)} · {c(store.state.devices[change.id] === change.on ? 'noChange' : 'willChange')}</AppText>)}
      <Button label={`${c('apply')} · ${c(routine)}`} disabled={!store.enabled} onPress={() => { if (store.apply(ROUTINES[routine])) { setPreview(false); setApplied(true); } }} />
      <Button label={c('cancel')} kind="secondary" onPress={() => setPreview(false)} />
    </View> : null}
  </View>;
}
