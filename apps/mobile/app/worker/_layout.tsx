import React from 'react';
import { Stack } from 'expo-router';
import { RoleGate } from '../../src/auth';

export default function WorkerLayout() {
  return <RoleGate role="worker"><Stack screenOptions={{ headerShown: false }} /></RoleGate>;
}