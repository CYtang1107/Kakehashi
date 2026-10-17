import type { HomeBundle } from '@kakehashi/shared';
import { persona } from '../demo/persona';
// Explicit allowlist. No items, reports, family notes, recordings, student notes or raw HomeBundle leave this function.
export function companionContext(data: HomeBundle | null, day: string) {
  if (data?.home.id !== persona.householdId) return { name: persona.name, nameJa: persona.nameJa, nextVisitDate: undefined };
  return { name: data.home.seniorName, nameJa: data.home.seniorNameJa || data.home.seniorName,
    nextVisitDate: data.home.visits.filter(v => v.status === 'planned' && v.date.slice(0,10) >= day)
      .map(v => v.date).sort()[0] };
}
