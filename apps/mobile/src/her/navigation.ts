import type { Key } from '../i18n';

export const herDestinations = [
  ['today', '/her', 'hToday', 'sun'],
  ['house', '/her/my-home', 'hMyHome', 'home'],
  ['memories', '/her/memories', 'hMemories', 'book-open'],
  ['friends', '/her/friends', 'hFriends', 'users'],
] as const;

const children: Record<string, { parent: Key; label: Key; destination: string | null }> = {
  'my-day': { parent: 'hToday', label: 'hDay', destination: 'today' },
  companion: { parent: 'hToday', label: 'hCompanion', destination: 'today' },
  help: { parent: 'hMyHome', label: 'hRequestHelp', destination: 'house' },
  helpers: { parent: 'hMyHome', label: 'hHelpers', destination: 'house' },
  safety: { parent: 'hMyHome', label: 'hSafety', destination: 'house' },
  'house-information': { parent: 'hMyHome', label: 'hHouseInfo', destination: 'house' },
  'digital-house': { parent: 'hMyHome', label: 'hDigital', destination: 'house' },
  'smart-home': { parent: 'hMyHome', label: 'hSmart', destination: 'house' },
  profile: { parent: 'hSettings', label: 'cProfile', destination: null },
  privacy: { parent: 'hSettings', label: 'cPrivacy', destination: null },
};

// Exact path segments keep unrelated or future screens from silently selecting Today.
export function herLocation(path: string): { destination: string | null; parent?: Key; label?: Key } {
  const segments = path.split('/').filter(Boolean);
  if (segments[0] !== 'her') return { destination: null };
  const page = segments[1];
  if (!page) return { destination: 'today' };
  if (children[page]) return children[page];
  if (page === 'settings') return { destination: null };
  if (page === 'my-home') return { destination: 'house' };
  if (page === 'memories' || page === 'item') return { destination: 'memories', ...(segments[2] ? { parent: 'hMemories' as Key } : {}) };
  if (page === 'friends') return { destination: 'friends', ...(segments[2] ? {
    parent: 'hFriends' as Key,
    label: (segments[2] === 'conversation' ? 'hMessages' : segments[2] === 'permissions' ? 'sPermissions' : segments[2] === 'communities' ? 'sCommunities' : 'sSwitchDemo') as Key,
  } : {}) };
  return { destination: null };
}
