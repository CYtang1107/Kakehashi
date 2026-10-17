import React, { useState } from 'react';
import { AppText, TaskWorkspace, SectionTabs } from '../../ui';
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
      <SectionTabs label={c('controls')} value={room} options={ROOMS.map(id => [id, c(id)] as const)} onChange={setRoom} />
      <RoomCard room={room} />
      <TaskWorkspace tasks={[
        { id: 'commands', label: c('command'), icon: 'message-circle', retain: false, content: <CommandInput /> },
        { id: 'routines', label: c('routines'), icon: 'sun', content: <><RoutineCard routine="morning" /><RoutineCard routine="evening" /></> },
        { id: 'history', label: c('log'), icon: 'clock', content: <DeviceActivityLog expanded /> },
      ]} />
      <AppText variant="caption">{c('roomsNote')}</AppText>
    </> : null}
  </HerPage>;
}
