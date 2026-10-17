import React from 'react';
import { View } from 'react-native';
import { DEVICES, type Room } from './model';
import { DeviceControl } from './DeviceControl';
export function RoomCard({ room }: { room: Room }) {
  return <View style={{ gap: 16 }}>
    {DEVICES.filter(d => d.room === room).map(device => <DeviceControl key={device.id} device={device} />)}
  </View>;
}
