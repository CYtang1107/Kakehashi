import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Fold } from '../../ui';
import { HerPage } from '../../her/HerPage';
import { useHomeCopy } from '../homeDemo/copy';
import { useHomeDemo } from '../homeDemo/store';
import { DemoStatus } from '../homeDemo/DemoStatus';
import { ROOMS, type Room } from './model';
import { RoomCard } from './RoomCard';
import { CommandInput } from './CommandInput';
import { RoutineCard } from './RoutineCard';
import { DeviceActivityLog } from './DeviceActivityLog';
export function SmartHomeDashboard() {
  const [room, setRoom] = useState<Room>('living'), { c } = useHomeCopy(), store = useHomeDemo();
  return <HerPage back title={c('title')} description={c('demo')} requiresHome={false}>
    <AppText variant="caption">{c('lead')}</AppText>
    <DemoStatus />
    {!['loading', 'loadError'].includes(store.status) ? <>
      <AppText variant="section">{c('controls')}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{ROOMS.map(id => <Button key={id} label={c(id)} selected={room === id} kind="secondary" onPress={() => setRoom(id)} />)}</View>
      <RoomCard room={room} />
      <CommandInput />
      <Fold title={c('routines')} icon="sun"><RoutineCard routine="morning" /><RoutineCard routine="evening" /></Fold>
      <DeviceActivityLog />
      <AppText variant="caption">{c('roomsNote')}</AppText>
    </> : null}
  </HerPage>;
}
