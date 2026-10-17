import React, { Suspense, lazy } from 'react';
import { AppText } from '../../src/ui';
// Explicit opt-in for exported presentation builds; no primary-navigation entry.
const enabled = __DEV__ || process.env.EXPO_PUBLIC_EVERCIRCLE_DEVELOPER === '1';
const DeveloperScreen = lazy(() => import('../../src/evercircle/orchestrator/DeveloperScreen'));
export default function AgentsRoute() {
  if (!enabled) return <AppText>Prototype tooling is disabled in this build.</AppText>;
  return <Suspense fallback={<AppText>Loading prototype tooling…</AppText>}><DeveloperScreen /></Suspense>;
}
