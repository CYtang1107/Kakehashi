import { JMA_CODES, type Home, type WeatherAlert, type WeatherStatus } from '@kakehashi/shared';

// Live weather warnings from the Japan Meteorological Agency (気象庁). Since the 2026 warning revision the feed lives at
// /bosai/warning/data/r8/{office}.json: a list of reports (not in date order), each with per-area warning kinds.
const FEED = (office: string) => `https://www.jma.go.jp/bosai/warning/data/r8/${office}.json`;
const CACHE_MS = 10 * 60 * 1000;
type Entry = { at: number; report?: JmaReport; error?: string };
const cache = new Map<string, Entry>();

interface JmaKind { code?: string; status: string }
interface JmaReport {
  reportDatetime: string;
  warning?: { class10Items?: { areaCode: string; kinds: JmaKind[] }[]; class20Items?: { areaCode: string; kinds: JmaKind[] }[] };
}

async function latestReport(office: string): Promise<Entry> {
  const hit = cache.get(office);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit;
  try {
    const res = await fetch(FEED(office), { headers: { 'User-Agent': 'KAKEHASHI pilot (student project)' }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`JMA answered ${res.status}`);
    const reports = (await res.json()) as JmaReport[];
    const report = [...reports].sort((a, b) => b.reportDatetime.localeCompare(a.reportDatetime))[0];
    const entry: Entry = { at: Date.now(), report };
    cache.set(office, entry);
    return entry;
  } catch (e) {
    const entry: Entry = { at: Date.now(), error: e instanceof Error ? e.message : String(e) };
    cache.set(office, entry);
    return entry;
  }
}

// Kinds still in force: anything with a code that has not been lifted (解除).
const ACTIVE = (k: JmaKind) => Boolean(k.code) && k.status !== '解除';

export function toAlert(code: string): WeatherAlert {
  const known = JMA_CODES[code];
  const n = Number(code);
  const level = known?.level ?? (n >= 30 ? 'emergency' : n < 10 ? 'warning' : 'advisory');
  return {
    code, level,
    name: known?.name ?? `Weather notice (code ${code})`,
    nameJa: known?.nameJa ?? `気象情報（コード${code}）`,
    kind: known?.kind ?? 'other',
    // A call is needed for any warning, and for the advisories that matter most to an older person living alone.
    callHer: level !== 'advisory' || code === '12' || code === '23',
  };
}

// Today's date in Japan, used to match a check-in to the day of the warning.
export const jstDate = (d = new Date()) => new Date(d.getTime() + 9 * 3600000).toISOString().slice(0, 10);

export async function weatherFor(home: Home): Promise<WeatherStatus> {
  const w = home.weather;
  const base = { area: w.areaName, areaJa: w.areaNameJa, checkedAt: new Date().toISOString() };
  const today = w.checks.find((c) => c.date === jstDate());
  if (w.demo) {
    const alerts = [toAlert(w.demo)];
    return { ...base, source: 'demo', alerts, callNeeded: alerts.some((a) => a.callHer), today };
  }
  const r = await latestReport(w.office);
  if (!r.report) return { ...base, source: 'unavailable', alerts: [], callNeeded: false, today, error: r.error };
  const items = [...(r.report.warning?.class20Items ?? [])];
  const mine = items.find((i) => i.areaCode === w.area);
  const codes = [...new Set((mine?.kinds ?? []).filter(ACTIVE).map((k) => k.code!))];
  const alerts = codes.map(toAlert).sort((a, b) => Number(b.callHer) - Number(a.callHer));
  return { ...base, source: 'jma', reportAt: r.report.reportDatetime, alerts, callNeeded: alerts.some((a) => a.callHer), today };
}
