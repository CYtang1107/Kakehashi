// Types shared by the server and the mobile app.

// 'open' means "not now": the normal state for most items. Nothing has to be decided.
export type Decision = 'keep' | 'family' | 'pass' | 'recycle' | 'open';
export const DECISIONS: Exclude<Decision, 'open'>[] = ['keep', 'family', 'pass', 'recycle'];
// Choices shown to the senior, "not now" first.
export const CHOICES: Decision[] = ['open', 'keep', 'family', 'pass', 'recycle'];

// What the family far away can say about an item. A wish, never a vote.
export type WishKind = 'keep-in-family' | 'ask-her' | 'her-choice';
export const WISHES: WishKind[] = ['keep-in-family', 'ask-her', 'her-choice'];
export interface Wish {
  kind: WishKind;
  from: string;
  note?: string;
  at: string;
}

export type RoomStatus = 'sorted' | 'now' | 'later';

// Rooms are laid out on a 320 x 240 floor-plan grid; the 3D view scales the same numbers.
export interface Room {
  id: string;
  name: string;
  nameJa: string;
  status: RoomStatus;
  x: number;
  y: number;
  w: number;
  h: number;
  // Real photos captured on a visit (never AI-imagined rooms).
  photos: string[];
  capturedAt?: string;
}

export type HandoverStage = 'home' | 'sorted' | 'repair' | 'delivered' | 'recycler' | 'collected';

export interface Handover {
  at: string;
  stage: HandoverStage;
  by: string;
  note?: string;
}

export interface Estimate {
  category: string;
  priceLowJpy: number;
  priceHighJpy: number;
  // Only used if she decides to let the item go: the best route for it.
  routeIfLetGo: 'pass' | 'recycle' | 'family';
  reason: string;
  source: 'claude' | 'offline';
}

export interface Thanks {
  from: string;
  message: string;
  at: string;
}

export interface Item {
  id: string;
  homeId: string;
  roomId: string;
  name: string;
  nameJa?: string;
  year?: string;
  glyph: string;
  decision: Decision;
  wish?: Wish;
  // Items she agrees to let go stay home until this date, so she can change her mind.
  holdUntil?: string;
  // Money from a resale goes to her, never off the family's bill.
  proceedsJpy?: number;
  story?: string;
  storyJa?: string;
  audioUrl?: string;
  photoUrl?: string;
  tagCode?: string;
  estimate?: Estimate;
  journey: Handover[];
  thanks: Thanks[];
  x: number;
  y: number;
}

export interface Visit {
  id: string;
  date: string;
  roomId: string;
  summary: string;
  summaryJa?: string;
  status: 'done' | 'planned';
  // Set when the report passed the fresh-eyes check before reaching the family.
  checked?: 'claude' | 'offline';
}

// From home to community (KizunaLink): local activities matched to her interests.
export type ActivityStatus = 'suggested' | 'proposed' | 'accepted' | 'not-now' | 'attended';
export interface CommunityActivity {
  id: string;
  title: string;
  titleJa: string;
  interest: string;
  interestJa?: string;
  place: string;
  placeJa?: string;
  date: string;
  companion?: string;
  status: ActivityStatus;
}

// Every student passes these steps before visiting a senior.
export type ReadinessStep = 'identity' | 'interview' | 'training' | 'dementia' | 'quiz' | 'shadow' | 'signoff';
export const READINESS: ReadinessStep[] = ['identity', 'interview', 'training', 'dementia', 'quiz', 'shadow', 'signoff'];
export interface Student {
  id: string;
  name: string;
  initial: string;
  interests: string;
  interestsJa?: string;
  university: string;
  universityJa?: string;
  visits: number;
  // Steps passed, with the date.
  passed: Partial<Record<ReadinessStep, string>>;
  role: 'pair' | 'trainee';
}
export const isReady = (s: Student) => READINESS.every((r) => Boolean(s.passed[r]));

export interface Plan {
  id: string;
  name: string;
  nameJa: string;
  priceJpy: number;
  visitsPerMonth: number;
  description: string;
}

export interface Payment {
  id: string;
  planId: string;
  amountJpy: number;
  status: 'paid' | 'pending';
  mode: 'stripe-test' | 'demo';
  at: string;
}

export interface Home {
  id: string;
  seniorName: string;
  seniorNameJa?: string;
  town: string;
  townJa?: string;
  childName: string;
  childNameJa?: string;
  seniorInterests: string[];
  // The visiting pair first, then any trainee preparing to take over.
  students: Student[];
  consent: { recording: boolean; at?: string };
  rooms: Room[];
  visits: Visit[];
  activities: CommunityActivity[];
  planId?: string;
  payments: Payment[];
  // What she wants done with money from items sold.
  proceedsChoice: 'keep' | 'grandchild' | 'donate';
  // Her own touchpoints between visits: a printed monthly letter and a phone call.
  letters: Letter[];
  calls: Call[];
  // Notes students leave for whoever visits next (handover when a student graduates).
  fieldNotes: FieldNote[];
  // Small home modifications she agreed to, with costs and the care-insurance estimate.
  safety: SafetyFix[];
}

export type FieldNoteKind = 'likes' | 'avoid' | 'tip';
export interface FieldNote {
  id: string;
  date: string;
  by: string;
  kind: FieldNoteKind;
  text: string;
  textJa?: string;
}

// Fresh-eyes check: a reviewer that did not write the report flags pushy wording.
export interface PressureFlag {
  phrase: string;
  reason: string;
  suggestion: string;
}
export interface CheckResult {
  ok: boolean;
  flags: PressureFlag[];
  source: 'claude' | 'offline';
}

// 思い出だより: a printed monthly letter posted to her (and shown to the family).
export interface Letter {
  id: string;
  month: string; // YYYY-MM
  itemIds: string[]; // stories and thank-yous included
  note: string; // a few words from the students
  noteJa?: string;
  status: 'draft' | 'printed' | 'mailed';
  mailedAt?: string;
}

// A short phone call from her student between visits.
export type CallMood = 'good' | 'okay' | 'low';
export interface Call {
  id: string;
  date: string;
  by: string;
  status: 'planned' | 'done';
  minutes?: number;
  mood?: CallMood;
  note?: string;
  noteJa?: string;
  followUp?: boolean;
}

export interface Services {
  ai: 'claude' | 'offline';
  payments: 'stripe-test' | 'demo';
}

export interface HomeBundle {
  home: Home;
  items: Item[];
  plans: Plan[];
  // Total resale money that has gone to the senior.
  seniorProceedsJpy: number;
  services: Services;
}

// What a new owner sees after scanning a story tag: no surname, no address.
export interface PublicTag {
  code: string;
  name: string;
  nameJa?: string;
  year?: string;
  glyph: string;
  story?: string;
  storyJa?: string;
  audioUrl?: string;
  photoUrl?: string;
  from: string;
  journey: Handover[];
  thanksCount: number;
}

export type CheckoutResult =
  | { mode: 'demo'; payment: Payment }
  | { mode: 'stripe-test'; url: string };

// QR payload printed on a story tag.
export const TAG_PREFIX = 'kakehashi:tag:';
export const tagPayload = (code: string) => `${TAG_PREFIX}${code}`;
export const parseTag = (data: string): string | null => {
  const t = data.trim();
  if (t.startsWith(TAG_PREFIX)) return t.slice(TAG_PREFIX.length);
  const m = t.match(/\/tag\/([A-Z0-9-]+)/i);
  return m ? m[1] : null;
};

// Picks the Japanese text when Japanese is selected and a translation exists.
export const pick = (lang: 'en' | 'ja', en?: string, ja?: string) => (lang === 'ja' && ja ? ja : en ?? ja ?? '');

// ---------- Safer home plan (安心リフォーム) ----------
// Small home modifications that she agrees to. Prices are example estimates for the pilot;
// QS members replace them with real local quotes.
export type FixKind = 'handrail' | 'step' | 'nonslip' | 'door' | 'light';
export const FIX_KINDS: FixKind[] = ['handrail', 'step', 'nonslip', 'door', 'light'];
export const FIX_CATALOG: Record<FixKind, { unit: 'm' | 'each' | 'm2'; priceJpy: number; eligible: boolean }> = {
  handrail: { unit: 'm', priceJpy: 15000, eligible: true }, // 手すりの取付け
  step: { unit: 'each', priceJpy: 30000, eligible: true }, // 段差の解消
  nonslip: { unit: 'm2', priceJpy: 12000, eligible: true }, // 滑り防止の床材への変更
  door: { unit: 'each', priceJpy: 80000, eligible: true }, // 引き戸等への扉の取替え
  light: { unit: 'each', priceJpy: 8000, eligible: false }, // 足元灯 (not a care-insurance item)
};
export type FixStatus = 'suggested' | 'agreed' | 'not-now' | 'done';
export interface SafetyFix {
  id: string;
  roomId: string;
  kind: FixKind;
  amount: number; // metres, count or square metres, per the catalog unit
  note?: string;
  noteJa?: string;
  status: FixStatus;
  x: number; // floor-plan position
  y: number;
}
// Care-insurance home modification (介護保険の住宅改修): usually up to ¥200,000 of eligible work per person,
// with insurance paying most of it (often 90%). Actual coverage depends on care level and income.
export const SUBSIDY = { limitJpy: 200000, coverRate: 0.9 };
export const fixCost = (f: Pick<SafetyFix, 'kind' | 'amount'>) => Math.round(FIX_CATALOG[f.kind].priceJpy * f.amount);
export function safetyEstimate(fixes: SafetyFix[]) {
  const counted = fixes.filter((f) => f.status === 'agreed' || f.status === 'done');
  const total = counted.reduce((t, f) => t + fixCost(f), 0);
  const eligible = counted.filter((f) => FIX_CATALOG[f.kind].eligible).reduce((t, f) => t + fixCost(f), 0);
  const covered = Math.round(Math.min(eligible, SUBSIDY.limitJpy) * SUBSIDY.coverRate);
  const suggested = fixes.filter((f) => f.status === 'suggested').reduce((t, f) => t + fixCost(f), 0);
  return { total, eligible, covered, familyPays: total - covered, suggested };
}
