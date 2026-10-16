import { orchestrate, type Request, type Result, type Event } from './model';

// External store: only the developer screen subscribes. No transcript or state snapshot is retained.
export type Trace = Pick<Result, 'intent' | 'module' | 'permission' | 'action' | 'userFacingResult'> & { id: number; events: Event[] };
let traces: Trace[] = [], sequence = 0;
const listeners = new Set<() => void>();
export const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getTraces = () => traces;
export const clearTraces = () => { traces = []; listeners.forEach(fn => fn()); };
export function runOrchestrator(request: Request) {
  const result = orchestrate(request);
  recordResult(result);
  return result;
}
export function recordResult(result: Result) {
  const { intent, module, permission, action, userFacingResult, events } = result;
  traces = [...traces, { id: ++sequence, intent, module, permission, action, userFacingResult, events }].slice(-60);
  listeners.forEach(fn => fn());
}
