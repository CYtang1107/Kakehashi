import { initialState, type SavedState } from '../profile/model';
import { initialSocial, socialPeople, type SocialState } from '../social/model';
import { initialDemo, type DemoState } from '../homeDemo/model';
import { orchestrate, type Event, type Request, type Result } from './model';
import { interpretCommand } from '../smartHome/model';

export type Demo = { saved: SavedState; social: SocialState; home: DemoState; events: Event[]; result?: Result; phase: number; persona: 'tanaka' | 'aiko' };
export function newDemo(persona: Demo['persona'] = 'tanaka'): Demo {
  const saved = initialState('tanaka');
  saved.profile.displayName = persona === 'aiko' ? 'Aiko Mori (fictional)' : 'Tanaka (fictional)';
  return { saved, social: initialSocial(), home: initialDemo('tanaka'), events: [], phase: 0, persona };
}
function apply(demo: Demo, request: Request): Demo {
  const result = orchestrate(request);
  return { ...demo, saved: result.saved ?? demo.saved, social: result.social ?? demo.social, home: result.home ?? demo.home, result,
    events: [...demo.events, ...result.events].map((event, index) => ({ ...event, step: index + 1 })).slice(-100) };
}
export function matchingStep(demo: Demo): Demo {
  const profile = (action: Extract<Request, { type: 'profile' }>['action']) => { demo = apply(demo, { type: 'profile', state: demo.saved, action, healthy: true }); };
  const social = (action: Extract<Request, { type: 'social' }>['action']) => { demo = apply(demo, { type: 'social', state: demo.social, action, people: socialPeople(demo.social, demo.saved), healthy: true }); };
  switch (demo.phase) {
    case 0:
      demo = demoScenario(demo, 'I enjoy gardening');
      profile({ type: 'suggest', ids: ['gardening'] }); break;
    case 1: profile({ type: 'approve', id: 'gardening' }); break;
    case 2:
      profile({ type: 'matching', enabled: true }); profile({ type: 'share', id: 'gardening', enabled: true });
      social({ type: 'grant', actor: 'tanaka', field: 'identity', enabled: true, revision: demo.saved.profileRevision ?? 0 }); break;
    case 3: {
      const people = socialPeople(demo.social, demo.saved);
      demo = apply(demo, { type: 'matching', person: people[0], people, healthy: true }); break;
    }
    case 4: social({ type: 'invite', actor: 'tanaka', target: 'haru' }); break;
    case 5: social({ type: 'invite', actor: 'tanaka', target: 'haru', confirmed: true }); break;
    case 6:
      social({ type: 'switch', id: 'haru' });
      social({ type: 'accept', actor: 'haru', target: 'tanaka', confirmed: true }); break;
    default: return demo;
  }
  return { ...demo, phase: demo.phase + 1 };
}
export function demoScenario(demo: Demo, text: string): Demo {
  const people = socialPeople(demo.social, demo.saved);
  demo = apply(demo, { type: 'companion', text, saved: demo.saved, household: 'tanaka', person: people[0], people, healthy: true, deviceHealthy:true });
  const command = interpretCommand(text);
  if (command.kind === 'recognized') demo = apply(demo, { type: 'home', state: demo.home, household: 'tanaka', healthy: true,
    action: { type: 'devices', changes: [command.change], at: '2026-10-16T00:00:00.000Z', id: 'stage7-demo' } });
  return demo;
}
export function blockedDemo(persona: Demo['persona']): Demo {
  return demoScenario(newDemo(persona), 'I want to meet someone who enjoys gardening.');
}
