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
  // Where this step happened. Private to the family and students; never on the public tag page.
  pt?: TrackPoint;
}
// A point on an item's journey. For a new owner it is only their area (drawn as a circle), never an address.
export interface TrackPoint {
  lat: number;
  lng: number;
  label: string;
  labelJa: string;
  area?: boolean;
}
// A delivery in progress: a student or partner carrying the item to its new owner's area.
export interface Delivery {
  by: string;
  from: TrackPoint;
  to: TrackPoint;
  startedAt: string;
  minutes: number;
  simulated?: boolean; // demo: the position loops along the route instead of coming from a phone
}
// 0..1 along the route. A simulated demo delivery loops every two minutes so the movement is visible.
export function deliveryProgress(d: Delivery, nowMs: number) {
  if (d.simulated) return ((nowMs / 1000) % 120) / 120;
  return Math.min(1, Math.max(0, (nowMs - Date.parse(d.startedAt)) / (d.minutes * 60000)));
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
  estimate?: Estimate;
  journey: Handover[];
  thanks: Thanks[];
  // Shared on the public story feed only with her consent; she can withdraw it any time.
  share?: ItemShare;
  comments?: StoryComment[];
  hearts?: number; // hearts from story-feed readers
  delivery?: Delivery;
  // A small album, swiped like a post: the item today, old family photos, and clearly labelled illustrations.
  photos?: ItemPhoto[];
  // A pixel icon made from one of the real photos; replaces the drawn icon in lists, the floor plan and the 3D house.
  icon?: ItemIcon;
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
  // A person confirmed they read it before it went to the family (AI checks; a person approves).
  readBy?: string;
  readAt?: string;
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
  placeId?: string; // where it happens, on the neighbourhood map
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
  goal?: SavingsGoal; // a savings goal the student set; the money stays in their own bank
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
  // The house's future (家のこれから): her wish for the house, in her words, and the facts the family needs.
  future: HouseFuture;
  // Help she can ask for (garden, cleaning, small repairs) from checked local workers.
  workers: Worker[];
  services: ServiceRequest[];
  // Neighbourhood map: her home and the places around it (demo points, never a real address).
  places: Place[];
  // Live location while a student takes her to an activity: with her consent, only during that outing.
  outings: Outing[];
  // Weather check-in: official warnings for her area, and the calls students made on those days.
  weather: HomeWeather;
  // Students' pay: each visit, call, weather check-in call and outing, logged when the work is logged.
  pay: PayEntry[];
}

export type PlaceKind = 'home' | 'community' | 'library' | 'care' | 'clinic' | 'pharmacy' | 'shop';
export const NEARBY_KINDS: Exclude<PlaceKind, 'home'>[] = ['community', 'care', 'clinic', 'pharmacy', 'shop', 'library'];
export interface Place {
  id: string; // osm-… for real places from OpenStreetMap
  kind: PlaceKind;
  name: string;
  nameJa: string;
  lat: number;
  lng: number;
  hours?: string; // OpenStreetMap opening_hours, when known
  mine?: boolean; // one of her places (lettered A, B, C… in this order)
}
// Straight-line distance and an unhurried walking time (50 m a minute) for an older walker.
export function metresBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = 6371000, q = Math.PI / 180;
  const dLat = (b.lat - a.lat) * q, dLng = (b.lng - a.lng) * q;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * q) * Math.cos(b.lat * q) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}
export const walkMinutes = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => Math.max(1, Math.round(metresBetween(a, b) / 50));
export const NEARBY_SOURCE = { name: 'OpenStreetMap', copied: '2026-10-10', url: 'https://www.openstreetmap.org/#map=16/37.9035/139.0545' };

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
  readBy?: string; // who read the whole letter before it was printed
  readAt?: string;
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

export type CheckoutResult =
  | { mode: 'demo'; payment: Payment }
  | { mode: 'stripe-test'; url: string };

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

// ---------- The house's future (家のこれから) ----------
// Japan has about 9 million empty homes (空き家). Most become empty because nobody asked the owner early
// what she wanted, and the family cannot decide later. KAKEHASHI records her wish while she lives there.
// It is not a listing: KAKEHASHI never sells houses and takes no fee from estate agents.
export type HouseWish = 'undecided' | 'family-lives' | 'young-family' | 'rent' | 'sell' | 'community';
export const HOUSE_WISHES: HouseWish[] = ['undecided', 'family-lives', 'young-family', 'rent', 'sell', 'community'];
export type ConditionPart = 'roof' | 'water' | 'wood' | 'walls' | 'garden';
export const CONDITION_PARTS: ConditionPart[] = ['roof', 'water', 'wood', 'walls', 'garden'];
export type ConditionLevel = 'ok' | 'watch' | 'repair';
export type HouseStep = 'papers' | 'registration' | 'talk' | 'note';
export const HOUSE_STEPS: HouseStep[] = ['papers', 'talk', 'note', 'registration'];
export interface HouseFuture {
  // For after she no longer lives there. While she does, the answer is always "she stays".
  wish: HouseWish;
  words?: string; // her words, as the students wrote them down
  wordsJa?: string;
  recordedBy?: string;
  recordedAt?: string;
  // Family members share wishes too; these are notes, not votes.
  familyNotes: { by: string; note: string; noteJa?: string; at: string }[];
  // Students note the condition on visits (QS members know what to look for).
  condition: Partial<Record<ConditionPart, { level: ConditionLevel; note?: string; noteJa?: string; at: string }>>;
  // Yearly costs if the house stands empty; example numbers until the family checks the tax notice.
  emptyCost: { landTaxJpy: number; buildingTaxJpy: number; upkeepJpy: number; insuranceJpy: number };
  steps: Partial<Record<HouseStep, string>>; // date each step was done
}
// If an empty house is left unmanaged, the city can designate it (管理不全空家・特定空家) and the
// residential-land tax reduction ends: the land part of the property tax can rise up to about 6 times.
export const DESIGNATED_LAND_MULTIPLIER = 6;
export function emptyHouseCost(c: HouseFuture['emptyCost']) {
  const yearly = c.landTaxJpy + c.buildingTaxJpy + c.upkeepJpy + c.insuranceJpy;
  const ifDesignated = c.landTaxJpy * (DESIGNATED_LAND_MULTIPLIER - 1);
  return { yearly, tenYears: yearly * 10, ifDesignated };
}

// ---------- Help at home (お手伝いの依頼) ----------
// She can ask for help in her own screen, on the phone, or through the students. Only workers who passed the
// same checks as students can be booked, and nobody comes without a booking she can see on her screen
// (older people living alone are a main target of fake inspection and repair scams in Japan).
export type ServiceKind = 'garden' | 'cleaning' | 'repair' | 'lifting' | 'builder';
export const HELP_KINDS: ServiceKind[] = ['garden', 'cleaning', 'repair', 'lifting'];
// Example prices for the pilot; workers keep WORKER_SHARE, the rest pays for checks, coordination and insurance.
export const SERVICE_CATALOG: Record<ServiceKind, { unit: 'hour' | 'quote'; priceJpy: number }> = {
  garden: { unit: 'hour', priceJpy: 2000 },
  cleaning: { unit: 'hour', priceJpy: 3000 },
  repair: { unit: 'hour', priceJpy: 3500 },
  lifting: { unit: 'hour', priceJpy: 3000 },
  builder: { unit: 'quote', priceJpy: 0 }, // priced from the safer-home fix
};
export const WORKER_SHARE = 0.85;
export const COMMISSION = 1 - WORKER_SHARE; // KAKEHASHI's fee: checks, insurance, coordination
export const workerTake = (priceJpy: number) => Math.round(priceJpy * WORKER_SHARE);
export type WorkerCheck = 'identity' | 'interview' | 'training';
export const WORKER_CHECKS: WorkerCheck[] = ['identity', 'interview', 'training'];
export interface Worker {
  id: string;
  name: string;
  nameJa?: string;
  from: string; // e.g. the local Silver Human Resources Centre (シルバー人材センター)
  fromJa?: string;
  skills: ServiceKind[];
  checks: Partial<Record<WorkerCheck, string>>; // date each check was passed
  jobs: number;
}
export const isCleared = (w: Worker) => WORKER_CHECKS.every((c) => Boolean(w.checks[c]));
// requested -> (booked directly | open on the job board -> booked when a checked helper accepts) -> done
export type ServiceStatus = 'requested' | 'open' | 'booked' | 'done' | 'cancelled';
export type ServiceFeedback = 'good' | 'okay' | 'not-good';
export interface ServiceRequest {
  id: string;
  kind: ServiceKind;
  when: 'soon' | 'next-visit';
  by: 'her' | 'student';
  note?: string;
  noteJa?: string;
  fixId?: string; // a safer-home fix this booking carries out
  status: ServiceStatus;
  createdAt: string;
  workerId?: string;
  date?: string;
  hours?: number;
  priceJpy?: number;
  feedback?: ServiceFeedback;
  postedAt?: string; // when it went on the job board
}

// What a helper sees on the job board: never her name or address, only the area.
export interface JobListing {
  homeId: string;
  id: string;
  kind: ServiceKind;
  note?: string;
  noteJa?: string;
  date: string;
  hours?: number;
  priceJpy: number;
  youReceiveJpy: number;
  feeJpy: number;
  area: string;
  areaJa: string;
  postedAt: string;
}

// ---------- Public story feed (物語の広場) ----------
// Stories stay private unless she agrees to share one. She picks how she is named and whether her voice is heard.
// Visitors can read and send kind words; messages wait until a student approves them, and messages with links,
// phone numbers or emails are refused, so nobody can use the feed to contact her.
export interface ItemShare {
  at: string; // when she agreed
  name: 'first' | 'anonymous';
  audio: boolean;
  photos?: boolean; // her OK to show photos of the item (old family photos are never shown)
}
export interface StoryComment {
  id: string;
  from: string;
  message: string;
  at: string;
  status: 'pending' | 'shown' | 'hidden';
}
export interface PublicStory {
  id: string;
  name: string;
  nameJa?: string;
  year?: string;
  glyph: string;
  story?: string;
  storyJa?: string;
  audioUrl?: string;
  teller: string;
  tellerJa: string;
  sharedAt: string;
  photos: ItemPhoto[]; // only photos of the item itself, with her OK
  icon?: ItemIcon;
  hearts: number;
  comments: { from: string; message: string; at: string }[]; // from '' = anonymous
  // For the story globe: the town only, rounded to about 10 km, never the home.
  lat: number;
  lng: number;
  // Where it went: stages and dates only, no names or places.
  journey: { stage: HandoverStage; at: string }[];
  example?: boolean; // an invented example story for the demo, labelled as such
}

// ---------- Outing sharing (お出かけの見守り) ----------
// The family can follow an outing on the neighbourhood map while a student takes her to an activity. It uses the
// STUDENT's phone, starts only after she agrees for that outing, stops when the outing ends (or after 4 hours), and
// the route is deleted when it ends. KAKEHASHI does not track her the rest of the time.
export interface GeoFix {
  lat: number;
  lng: number;
  at: string;
  accuracy?: number; // metres
}
export interface Outing {
  id: string;
  activityId: string;
  placeId: string;
  by: string; // the student whose phone shares the location
  consentAt: string; // when she agreed, for this outing
  startedAt: string;
  status: 'live' | 'ended';
  last?: GeoFix;
  trail: GeoFix[];
  endedAt?: string;
  minutes?: number; // kept after the route is deleted
  simulated?: boolean; // demo: the walk loops along the route instead of coming from a phone
}
export const OUTING_MAX_HOURS = 4;
export const outingIsLive = (o: Outing, nowMs: number) =>
  o.status === 'live' && (o.simulated || nowMs - Date.parse(o.startedAt) < OUTING_MAX_HOURS * 3600000);

// ---------- Weather check-in (天気の見守り) ----------
// When the Japan Meteorological Agency issues a warning for her area (or a heavy-snow or low-temperature advisory),
// a student calls her that day and logs how she is; the family sees it.
export type AlertLevel = 'advisory' | 'warning' | 'emergency';
export type AlertKind = 'snow' | 'cold' | 'rain' | 'wind' | 'sea' | 'other';
export interface WeatherAlert {
  code: string;
  level: AlertLevel;
  name: string;
  nameJa: string;
  kind: AlertKind;
  callHer: boolean;
}
export type CheckResult2 = 'fine' | 'needs-help' | 'no-answer';
export interface WeatherCheck {
  id: string;
  date: string; // Japan date of the call
  at: string;
  by: string;
  result: CheckResult2;
  note?: string;
  alerts: string[]; // names of the alerts in force when she was called
}
export interface HomeWeather {
  office: string; // JMA office code, e.g. 150000 Niigata
  area: string; // JMA city code, e.g. 1510000 Niigata City
  areaName: string;
  areaNameJa: string;
  checks: WeatherCheck[];
  demo?: string | null; // a JMA code simulated for demos; shown as a demo
}
export interface WeatherStatus {
  area: string;
  areaJa: string;
  checkedAt: string;
  reportAt?: string;
  source: 'jma' | 'demo' | 'unavailable';
  alerts: WeatherAlert[];
  callNeeded: boolean;
  today?: WeatherCheck;
  error?: string;
}
// JMA warning codes (unchanged by the 2026 revision for these kinds; checked against the live feed).
export const JMA_CODES: Record<string, { level: AlertLevel; kind: AlertKind; name: string; nameJa: string }> = {
  '02': { level: 'warning', kind: 'snow', name: 'Snowstorm warning', nameJa: '暴風雪警報' },
  '03': { level: 'warning', kind: 'rain', name: 'Heavy rain warning', nameJa: '大雨警報' },
  '04': { level: 'warning', kind: 'rain', name: 'Flood warning', nameJa: '洪水警報' },
  '05': { level: 'warning', kind: 'wind', name: 'Storm warning', nameJa: '暴風警報' },
  '06': { level: 'warning', kind: 'snow', name: 'Heavy snow warning', nameJa: '大雪警報' },
  '07': { level: 'warning', kind: 'sea', name: 'High wave warning', nameJa: '波浪警報' },
  '08': { level: 'warning', kind: 'sea', name: 'Storm surge warning', nameJa: '高潮警報' },
  '10': { level: 'advisory', kind: 'rain', name: 'Heavy rain advisory', nameJa: '大雨注意報' },
  '12': { level: 'advisory', kind: 'snow', name: 'Heavy snow advisory', nameJa: '大雪注意報' },
  '13': { level: 'advisory', kind: 'snow', name: 'Snowstorm advisory', nameJa: '風雪注意報' },
  '14': { level: 'advisory', kind: 'rain', name: 'Thunderstorm advisory', nameJa: '雷注意報' },
  '15': { level: 'advisory', kind: 'wind', name: 'Strong wind advisory', nameJa: '強風注意報' },
  '16': { level: 'advisory', kind: 'sea', name: 'High wave advisory', nameJa: '波浪注意報' },
  '17': { level: 'advisory', kind: 'snow', name: 'Snowmelt advisory', nameJa: '融雪注意報' },
  '18': { level: 'advisory', kind: 'rain', name: 'Flood advisory', nameJa: '洪水注意報' },
  '19': { level: 'advisory', kind: 'sea', name: 'Storm surge advisory', nameJa: '高潮注意報' },
  '20': { level: 'advisory', kind: 'other', name: 'Dense fog advisory', nameJa: '濃霧注意報' },
  '21': { level: 'advisory', kind: 'other', name: 'Dry air advisory', nameJa: '乾燥注意報' },
  '22': { level: 'advisory', kind: 'snow', name: 'Avalanche advisory', nameJa: 'なだれ注意報' },
  '23': { level: 'advisory', kind: 'cold', name: 'Low temperature advisory', nameJa: '低温注意報' },
  '24': { level: 'advisory', kind: 'cold', name: 'Frost advisory', nameJa: '霜注意報' },
  '25': { level: 'advisory', kind: 'snow', name: 'Icing advisory', nameJa: '着氷注意報' },
  '26': { level: 'advisory', kind: 'snow', name: 'Snow accretion advisory', nameJa: '着雪注意報' },
  '32': { level: 'emergency', kind: 'snow', name: 'Snowstorm emergency warning', nameJa: '暴風雪特別警報' },
  '33': { level: 'emergency', kind: 'rain', name: 'Heavy rain emergency warning', nameJa: '大雨特別警報' },
  '35': { level: 'emergency', kind: 'wind', name: 'Storm emergency warning', nameJa: '暴風特別警報' },
  '36': { level: 'emergency', kind: 'snow', name: 'Heavy snow emergency warning', nameJa: '大雪特別警報' },
  '37': { level: 'emergency', kind: 'sea', name: 'High wave emergency warning', nameJa: '波浪特別警報' },
  '38': { level: 'emergency', kind: 'sea', name: 'Storm surge emergency warning', nameJa: '高潮特別警報' },
};

// ---------- Student wallet (学生の報酬) ----------
// Pay is logged automatically when work is logged, and paid to the student's own bank account.
// KAKEHASHI does not hold or invest students' money; the savings goal is a tracker only.
export const STUDENT_PAY = { hourJpy: 1300, visitHours: 3, callJpy: 500 }; // example rates for the pilot [assumption]
export type PayKind = 'visit' | 'call' | 'weather-call' | 'outing';
export interface PayEntry {
  id: string;
  studentId: string;
  date: string;
  kind: PayKind;
  hours?: number;
  amountJpy: number;
  status: 'pending' | 'paid';
  paidAt?: string;
}
export interface SavingsGoal {
  name: string;
  targetJpy: number;
  setAsidePct: number; // share of each payment the student plans to put aside, 0-50
}
export interface Wallet {
  student: { id: string; name: string };
  entries: PayEntry[];
  monthJpy: number;
  pendingJpy: number;
  paidJpy: number;
  goal?: SavingsGoal;
  setAsideJpy: number;
  rates: typeof STUDENT_PAY;
}

// ---------- Item photos (思い出の写真) ----------
// 'illustration' marks a picture that is not a real photo (e.g. AI-made): always labelled in the app, never passed
// off as a real memory. Photos are private to the family and students; the public story feed shows none.
export type PhotoKind = 'photo' | 'old-photo' | 'illustration';
export interface ItemPhoto {
  id: string;
  url: string;
  kind: PhotoKind;
  caption?: string;
  captionJa?: string;
  by: string;
  at: string;
}

// ---------- Pixel art palette (shared by the app's sprites and the photo-to-pixel converter) ----------
export const PIXEL_PALETTE: Record<string, string> = {
  K: '#2A2230', // outline
  A: '#F2E8D5', // cream
  B: '#D8C6A4', // beige
  C: '#A88F6C', // tan shadow
  I: '#2B4C7E', // indigo
  G: '#E0B356', // gold
  M: '#D3D8DF', // metal light
  N: '#858D9B', // metal dark
  W: '#8E5B3A', // wood
  X: '#5E3A24', // dark wood
  R: '#C8463A', // red
  Q: '#8B2D28', // dark red
  P: '#7A4A6E', // plum
  p: '#C98BB0', // pink
  S: '#1E2A3A', // black body
  L: '#4F6B8A', // glass
  H: '#FFFFFF', // highlight
};

// 32x32 pixel icon from a photo: each row is a string of palette keys ('0'-'f').
export interface ItemIcon {
  w: number;
  h: number;
  palette: string[];
  rows: string[];
  fromId: string; // the photo it was made from ('main' = the photo the item was logged with)
}
