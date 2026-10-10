import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { Call, CallMood, CheckoutResult, Decision, Estimate, HandoverStage, HomeBundle, Home, Item, Letter, PublicTag, WishKind } from '@kakehashi/shared';

const PORT = 4100;

// Finds the server: an explicit EXPO_PUBLIC_API_URL wins, then the machine that serves the app.
function resolveBase(): string {
  const env = process.env.EXPO_PUBLIC_API_URL;
  if (env) return env.replace(/\/$/, '');
  if (Platform.OS === 'web' && typeof window !== 'undefined') return `${window.location.protocol}//${window.location.hostname}:${PORT}`;
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:${PORT}`;
}

export const API_BASE = resolveBase();
export const fileUrl = (path?: string) => (path ? `${API_BASE}${path}` : undefined);
export const letterUrl = (letterId: string) => `${API_BASE}/letters/${letterId}`;

async function call<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: init?.method ?? 'GET',
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  home: (id: string) => call<HomeBundle>(`/api/home/${id}`),
  consent: (homeId: string, recording: boolean) => call(`/api/home/${homeId}/consent`, { method: 'POST', body: { recording } }),
  wish: (itemId: string, kind: WishKind, note?: string) => call<Item>(`/api/items/${itemId}/wish`, { method: 'POST', body: { kind, note } }),
  proceeds: (homeId: string, choice: Home['proceedsChoice']) => call(`/api/home/${homeId}/proceeds`, { method: 'POST', body: { choice } }),
  update: (itemId: string, body: { decision?: Decision; story?: string }) => call<Item>(`/api/items/${itemId}`, { method: 'PATCH', body }),
  addItem: (body: { homeId: string; roomId: string; name: string; photo?: { base64: string; mime: string }; estimate?: Estimate }) =>
    call<Item>('/api/items', { method: 'POST', body }),
  audio: (itemId: string, base64: string, mime: string) => call<Item>(`/api/items/${itemId}/audio`, { method: 'POST', body: { base64, mime } }),
  tag: (itemId: string) => call<Item>(`/api/items/${itemId}/tag`, { method: 'POST' }),
  handover: (itemId: string, stage: HandoverStage, by: string, note?: string) =>
    call<Item>(`/api/items/${itemId}/handover`, { method: 'POST', body: { stage, by, note } }),
  estimate: (body: { base64?: string; mime?: string; name?: string }) => call<Estimate>('/api/estimate', { method: 'POST', body }),
  prepareLetter: (homeId: string, note?: string) => call<Letter>(`/api/home/${homeId}/letters`, { method: 'POST', body: note !== undefined ? { note } : {} }),
  letterStatus: (letterId: string, status: Letter['status']) => call<Letter>(`/api/letters/${letterId}/status`, { method: 'POST', body: { status } }),
  logCall: (homeId: string, body: { by?: string; minutes?: number; mood?: CallMood; note?: string; followUp?: boolean }) =>
    call<Call[]>(`/api/home/${homeId}/calls`, { method: 'POST', body }),
  publicTag: (code: string) => call<PublicTag>(`/api/tags/${encodeURIComponent(code)}`),
  thanks: (code: string, from: string, message: string) => call<PublicTag>(`/api/tags/${encodeURIComponent(code)}/thanks`, { method: 'POST', body: { from, message } }),
  checkout: (homeId: string, planId: string) => call<CheckoutResult>('/api/checkout', { method: 'POST', body: { homeId, planId } }),
};

// Reads a local file or blob URI (photo, recording) as base64.
export async function uriToBase64(uri: string): Promise<{ base64: string; mime: string }> {
  const blob = await (await fetch(uri)).blob();
  const dataUrl: string = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Could not read the file.'));
    r.readAsDataURL(blob);
  });
  const [head, base64] = dataUrl.split(',');
  const mime = head.match(/data:([^;]+)/)?.[1] ?? blob.type ?? 'application/octet-stream';
  return { base64, mime };
}
