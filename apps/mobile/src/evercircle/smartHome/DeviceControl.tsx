import React from 'react';
import { AppText, Button, Card } from '../../ui';
import { useHomeDemo } from '../homeDemo/store';
import { useHomeCopy, deviceName, stateLabel } from '../homeDemo/copy';
import type { Device } from './model';
export function DeviceControl({ device }: { device: Device }) {
  const store = useHomeDemo(), { c, lang } = useHomeCopy();
  const on = store.state.devices[device.id];
  const label = c(device.kind === 'curtains' ? on ? 'closeAction' : 'openAction' : on ? 'turnOff' : 'turnOn');
  return <Card>
    <AppText variant="bodyBold">{deviceName(device, lang)}</AppText>
    <AppText accessibilityLiveRegion="polite">{c('simulated')} {stateLabel(device, on, lang)}</AppText>
    <Button label={label} accessibilityLabel={`${label} · ${deviceName(device, lang)}`} kind={on ? 'secondary' : 'primary'} disabled={!store.enabled} onPress={() => store.apply([{ id: device.id, on: !on }])} />
  </Card>;
}
