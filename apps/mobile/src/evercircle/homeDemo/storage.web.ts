import type { DemoState } from './model';
export const demoKey = (id: string) => `kakehashi-home-demo-${encodeURIComponent(id)}-v1`;
export async function readDemo(id: string) { return globalThis.localStorage.getItem(demoKey(id)); }
export async function writeDemo(state: DemoState) { globalThis.localStorage.setItem(demoKey(state.householdId), JSON.stringify(state)); }
