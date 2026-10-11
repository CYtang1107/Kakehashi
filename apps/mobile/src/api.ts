import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { PhotoKind, Wallet, CheckResult2, WeatherStatus, JobListing, Outing, PublicStory, ServiceFeedback, ServiceKind, ServiceRequest, ConditionLevel, ConditionPart, HouseFuture, HouseStep, HouseWish, FixKind, FixStatus, SafetyFix, CheckResult, FieldNote, FieldNoteKind, Visit, ActivityStatus, CommunityActivity, ReadinessStep, Room, Student, Call, CallMood, CheckoutResult, Decision, Estimate, HandoverStage, HomeBundle, Home, Item, Letter, PublicTag, WishKind } from '@kakehashi/shared';

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
  addFix: (homeId: string, body: { roomId: string; kind: FixKind; amount: number; note?: string }) =>
    call<SafetyFix[]>(`/api/home/${homeId}/safety`, { method: 'POST', body }),
  fixStatus: (homeId: string, fixId: string, status: FixStatus) =>
    call<SafetyFix[]>(`/api/home/${homeId}/safety/${fixId}`, { method: 'POST', body: { status } }),
  houseWish: (homeId: string, wish: HouseWish, words: string, by: string) =>
    call<HouseFuture>(`/api/home/${homeId}/future/wish`, { method: 'POST', body: { wish, words, by } }),
  houseNote: (homeId: string, note: string, by: string) => call<HouseFuture>(`/api/home/${homeId}/future/note`, { method: 'POST', body: { note, by } }),
  houseCondition: (homeId: string, part: ConditionPart, level: ConditionLevel) =>
    call<HouseFuture>(`/api/home/${homeId}/future/condition`, { method: 'POST', body: { part, level } }),
  houseStep: (homeId: string, step: HouseStep, done: boolean) => call<HouseFuture>(`/api/home/${homeId}/future/step`, { method: 'POST', body: { step, done } }),
  stories: () => call<PublicStory[]>('/api/stories'),
  storyComment: (itemId: string, from: string, message: string) => call(`/api/stories/${itemId}/comments`, { method: 'POST', body: { from, message } }),
  shareStory: (itemId: string, body: { share: boolean; name?: 'first' | 'anonymous'; audio?: boolean }) => call<Item>(`/api/items/${itemId}/share`, { method: 'POST', body }),
  moderate: (itemId: string, commentId: string, status: 'shown' | 'hidden') => call<Item>(`/api/items/${itemId}/comments/${commentId}`, { method: 'POST', body: { status } }),
  startDelivery: (itemId: string, by: string, minutes?: number) => call<Item>(`/api/items/${itemId}/delivery`, { method: 'POST', body: { by, minutes } }),
  startOuting: (homeId: string, activityId: string, by: string) => call<Outing>(`/api/home/${homeId}/outings`, { method: 'POST', body: { activityId, by, consent: true } }),
  outingFix: (homeId: string, outingId: string, lat: number, lng: number, accuracy?: number) =>
    call(`/api/home/${homeId}/outings/${outingId}/fix`, { method: 'POST', body: { lat, lng, accuracy } }),
  endOuting: (homeId: string, outingId: string) => call<Outing>(`/api/home/${homeId}/outings/${outingId}/end`, { method: 'POST' }),
  postJob: (homeId: string, sid: string, body: { priceJpy: number; date: string; hours?: number; agreed: boolean }) =>
    call<ServiceRequest[]>(`/api/home/${homeId}/services/${sid}/post`, { method: 'POST', body }),
  jobs: (workerId: string) => call<{ open: JobListing[]; mine: (JobListing & { status: string; feedback?: string })[]; earned: number }>(`/api/jobs?workerId=${encodeURIComponent(workerId)}`),
  acceptJob: (homeId: string, sid: string, workerId: string) => call<JobListing>(`/api/jobs/${homeId}/${sid}/accept`, { method: 'POST', body: { workerId } }),
  weather: (homeId: string) => call<WeatherStatus>(`/api/home/${homeId}/weather`),
  weatherCheck: (homeId: string, result: CheckResult2, by: string, note?: string) =>
    call<WeatherStatus>(`/api/home/${homeId}/weather/check`, { method: 'POST', body: { result, by, note } }),
  weatherDemo: (homeId: string, code: string | null) => call<WeatherStatus>(`/api/home/${homeId}/weather/demo`, { method: 'POST', body: { code } }),
  wallet: (homeId: string, sid: string) => call<Wallet>(`/api/home/${homeId}/students/${sid}/wallet`),
  setGoal: (homeId: string, sid: string, body: { name?: string; targetJpy?: number; setAsidePct?: number; clear?: boolean }) =>
    call<Wallet>(`/api/home/${homeId}/students/${sid}/goal`, { method: 'POST', body }),
  payout: (homeId: string, sid: string) => call<Wallet>(`/api/home/${homeId}/students/${sid}/payout`, { method: 'POST' }),
  addPhoto: (itemId: string, body: { base64: string; mime: string; kind: PhotoKind; caption?: string; by: string }) => call<Item>(`/api/items/${itemId}/photos`, { method: 'POST', body }),
  askHelp: (homeId: string, body: { kind: ServiceKind; when: 'soon' | 'next-visit'; by: 'her' | 'student'; note?: string; fixId?: string }) =>
    call<ServiceRequest[]>(`/api/home/${homeId}/services`, { method: 'POST', body }),
  bookHelp: (homeId: string, sid: string, body: { workerId: string; date: string; hours?: number }) =>
    call<ServiceRequest[]>(`/api/home/${homeId}/services/${sid}/book`, { method: 'POST', body }),
  helpStatus: (homeId: string, sid: string, body: { status?: 'done' | 'cancelled'; feedback?: ServiceFeedback }) =>
    call<ServiceRequest[]>(`/api/home/${homeId}/services/${sid}/status`, { method: 'POST', body }),
  addFieldNote: (homeId: string, kind: FieldNoteKind, text: string, by: string) =>
    call<FieldNote[]>(`/api/home/${homeId}/fieldnotes`, { method: 'POST', body: { kind, text, by } }),
  checkReport: (text: string) => call<CheckResult>('/api/report/check', { method: 'POST', body: { text } }),
  sendReport: (homeId: string, text: string, by: string, readConfirmed: boolean) => call<Visit>(`/api/home/${homeId}/report`, { method: 'POST', body: { text, by, readConfirmed } }),
  studentStep: (homeId: string, studentId: string, step: ReadinessStep, passed: boolean) =>
    call<Student>(`/api/home/${homeId}/students/${studentId}/step`, { method: 'POST', body: { step, passed } }),
  roomPhoto: (homeId: string, roomId: string, base64: string, mime: string) =>
    call<Room>(`/api/home/${homeId}/rooms/${roomId}/photos`, { method: 'POST', body: { base64, mime } }),
  activity: (homeId: string, activityId: string, status: ActivityStatus) =>
    call<CommunityActivity>(`/api/home/${homeId}/activities/${activityId}`, { method: 'POST', body: { status } }),
  prepareLetter: (homeId: string, note?: string) => call<Letter>(`/api/home/${homeId}/letters`, { method: 'POST', body: note !== undefined ? { note } : {} }),
  letterStatus: (letterId: string, status: Letter['status'], opts?: { by: string; readConfirmed: boolean }) => call<Letter>(`/api/letters/${letterId}/status`, { method: 'POST', body: { status, ...opts } }),
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
