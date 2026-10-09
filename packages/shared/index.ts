// Types shared by the server and the mobile app.

export type Decision = 'keep' | 'family' | 'pass' | 'recycle' | 'open';
export const DECISIONS: Exclude<Decision, 'open'>[] = ['keep', 'family', 'pass', 'recycle'];

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
  suggestion: Exclude<Decision, 'open'>;
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
  suggestion?: Exclude<Decision, 'open'>;
  story?: string;
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
  status: 'done' | 'planned';
}

export interface CommunityActivity {
  title: string;
  date: string;
  place: string;
  companion: string;
  status: 'proposed' | 'accepted';
}

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
  resaleCreditJpy: number;
  status: 'paid' | 'pending';
  mode: 'stripe-test' | 'demo';
  at: string;
}

export interface Home {
  id: string;
  seniorName: string;
  town: string;
  childName: string;
  students: { name: string; initial: string; interests: string }[];
  consent: { recording: boolean; at?: string };
  rooms: Room[];
  visits: Visit[];
  activity?: CommunityActivity;
  planId?: string;
  payments: Payment[];
}

export interface Services {
  ai: 'claude' | 'offline';
  payments: 'stripe-test' | 'demo';
}

export interface HomeBundle {
  home: Home;
  items: Item[];
  plans: Plan[];
  resaleCreditJpy: number;
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
