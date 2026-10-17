import { respond, type Reply } from '../companion/engine';
import { reduceSaved, type SavedAction, type SavedState } from '../profile/model';
import { reduceSocial, type SocialAction, type SocialState } from '../social/model';
import { simulateAgents, type MatchResult, type SocialPerson } from '../social/matching';
import { reduceDemo, type DemoAction, type DemoState } from '../homeDemo/model';
import { isDeviceRequest } from '../smartHome/model';
import { canAccessMemory, canParticipateInMatching, canPerformDeviceAction, matchingDenial, sanitizeAgentPayload } from '../privacy/permissions';
import type { Key } from '../../i18n';

export const MODULES = ['orchestrator', 'companion', 'profile', 'privacy', 'matching', 'social', 'external', 'home', 'daily', 'kakehashi'] as const;
export type Module = typeof MODULES[number];
export type Step = 'recognized' | 'permission' | 'blocked' | 'approvalRequested' | 'profileUpdated' | 'savedPrivately' | 'sharingApproved' | 'sharingRevoked' | 'compared' | 'recommended' | 'socialUpdated' | 'invited' | 'accepted' | 'deviceUpdated' | 'dayUpdated' | 'proposed' | 'unsupported';
export type Event = { step: number; from: Module; to: Module; kind: Step; payload: ReturnType<typeof sanitizeAgentPayload> };
export type Permission = 'allowed' | 'denied' | 'confirmationRequired';
export type Result = { intent: string; module: Module; permission: Permission; action: 'performed' | 'proposed' | 'blocked' | 'none'; events: Event[];
  userFacingResult: Step; reply?: Reply; saved?: SavedState; social?: SocialState; home?: DemoState; matches?: MatchResult[] };
export type Request =
  | { type: 'companion'; text: string; saved: SavedState; household: string; healthy: boolean; deviceHealthy?: boolean; person: SocialPerson; people?: SocialPerson[]; nextVisitDate?: string; daily?: () => (Reply & { performed?: boolean }) | undefined }
  | { type: 'profile'; state: SavedState; action: SavedAction; healthy: boolean }
  | { type: 'matching'; person: SocialPerson; people: SocialPerson[]; healthy: boolean }
  | { type: 'social'; state: SocialState; action: SocialAction; people: SocialPerson[]; healthy: boolean }
  | { type: 'home'; state: DemoState; action: DemoAction; household: string; healthy: boolean };

// Pure routing and deterministic domain calls. No network, background reasoning or transcript log.
export function orchestrate(request: Request): Result {
  const events: Event[] = [];
  const emit = (from: Module, to: Module, kind: Step, payload: unknown = {}) => events.push({ step: events.length + 1, from, to, kind, payload: sanitizeAgentPayload(payload) });
  const finish = (module: Module, permission: Permission, action: Result['action'], kind: Step, extra: Partial<Result> = {}): Result =>
    ({ intent: request.type, module, permission, action, userFacingResult: kind, events, ...extra });
  const gate = (module: Module, allowed: boolean) => {
    emit('orchestrator', 'privacy', 'permission', { allowed });
    if (!allowed) emit('privacy', module, 'blocked', { allowed: false });
    return allowed;
  };
  if (request.type === 'companion') {
    const base = respond(request.text, { approved: request.saved.approved.map(i => i.id), nextVisitDate: request.nextVisitDate });
    const module: Module = isDeviceRequest(request.text) || base.intent === 'devices' ? 'home' :
      base.intent === 'friends' ? 'matching' : ['visits', 'activities', 'reminders'].includes(base.intent) ? 'daily' :
      ['memory', 'interests'].includes(base.intent) ? 'profile' : base.intent === 'help' || base.intent === 'safety' ? 'kakehashi' : 'companion';
    emit('companion', 'orchestrator', 'recognized');
    const allowed = module === 'matching' ? canParticipateInMatching(request.person, request.healthy) :
      base.intent === 'memory' ? canAccessMemory(request.saved.householdId, request.household, 'owner') : module === 'home' ? request.deviceHealthy === true && request.saved.householdId === request.household : true;
    if (!gate(module, allowed)) return finish(module, 'denied', 'blocked', 'blocked', { intent: base.intent,
      reply: { ...base, key: module === 'matching' && request.healthy && matchingDenial(request.person) ? `sEligibility_${matchingDenial(request.person)}` as Key : 'sActionUnavailable', actions: module === 'matching' ? ['privacy','profile'] : [], candidates: [] } });
    if (base.intent === 'unsupported' && module === 'companion') {
      emit('orchestrator','companion','unsupported');
      return finish('companion','allowed','none','unsupported',{intent:base.intent,reply:base});
    }
    // The daily adapter is an owner-only view. Its output is returned to chat, never to events.
    const extension = module === 'daily' || module === 'home' ? request.daily?.() : undefined;
    const reply = extension ?? base;
    const matches = module === 'matching' ? (request.people ?? []).filter(p=>p.id!==request.person.id).map(p=>simulateAgents(request.person,p)) : undefined;
    if (matches) {
      emit('privacy','matching','compared',{count:matches.filter(m=>m.eligible).length});
      emit('matching','social','recommended',{count:matches.filter(m=>m.eligible).length});
    }
    emit('orchestrator', module, extension?.performed ? 'deviceUpdated' : base.intent === 'interests' ? 'approvalRequested' : 'proposed');
    if (reply.actions.length && module !== 'home') emit(module, 'kakehashi', 'proposed');
    return finish(module, 'allowed', extension?.performed ? 'performed' : 'proposed', extension?.performed ? 'deviceUpdated' : 'proposed', { intent: reply.intent, reply, matches });
  }
  if (request.type === 'profile') {
    const withdrawal = ['reset', 'clearPending', 'reject', 'delete'].includes(request.action.type) || ('enabled' in request.action && !request.action.enabled);
    if (!gate('profile', request.healthy || withdrawal)) return finish('profile', 'denied', 'blocked', 'blocked', { saved: request.state });
    const saved = reduceSaved(request.state, request.action);
    const action = request.action;
    const kind = request.action.type === 'suggest' ? 'approvalRequested' : request.action.type === 'approve' && saved !== request.state ? 'savedPrivately' :
      action.type === 'share' ? action.enabled && saved.approved.some(i=>i.id===action.id&&i.shareForMatching) ? 'sharingApproved' : 'sharingRevoked' : 'profileUpdated';
    emit('orchestrator', 'profile', kind);
    return finish('profile', 'allowed', saved === request.state ? 'none' : 'performed', kind, { saved });
  }
  if (request.type === 'matching') {
    if (!gate('matching', canParticipateInMatching(request.person, request.healthy))) return finish('matching', 'denied', 'blocked', 'blocked', { matches: [] });
    const matches = request.people.filter(p => p.id !== request.person.id).map(p => simulateAgents(request.person, p));
    emit('privacy', 'matching', 'compared', { count: matches.filter(m => m.eligible).length });
    emit('matching', 'social', 'recommended', { count: matches.filter(m => m.eligible).length });
    return finish('matching', 'allowed', 'performed', 'recommended', { matches });
  }
  if (request.type === 'social') {
    const confirmation = (request.action.type === 'invite' || request.action.type === 'accept') && request.action.confirmed !== true;
    if (confirmation) {
      emit('orchestrator', 'social', 'approvalRequested');
      return finish('social', 'confirmationRequired', 'proposed', 'approvalRequested', { social: request.state });
    }
    // The reducer rechecks active actor, both participants, relationship and storage health.
    const result = reduceSocial(request.state, request.action, request.people, request.healthy);
    if (!gate('social', result.ok)) return finish('social', 'denied', 'blocked', 'blocked', { social: request.state });
    const kind = request.action.type === 'invite' ? 'invited' : request.action.type === 'accept' ? 'accepted' : 'socialUpdated';
    emit('orchestrator', 'social', kind, { confirmed: 'confirmed' in request.action && request.action.confirmed === true });
    if (kind === 'invited' || kind === 'accepted') emit('social', 'external', kind);
    return finish('social', 'allowed', 'performed', kind, { social: result.state });
  }
  const module = request.action.type === 'devices' ? 'home' : 'daily';
  const allowed = request.healthy && request.household === request.state.householdId && (request.action.type !== 'devices' ||
    canPerformDeviceAction(request.state.householdId, request.household, request.action.changes, request.state.devices, request.healthy));
  if (!gate(module, allowed)) return finish(module, 'denied', 'blocked', 'blocked', { home: request.state });
  const home = reduceDemo(request.state, request.action);
  const kind = module === 'home' ? 'deviceUpdated' : 'dayUpdated';
  emit('orchestrator', module, kind);
  return finish(module, 'allowed', home === request.state ? 'none' : 'performed', kind, { home });
}
