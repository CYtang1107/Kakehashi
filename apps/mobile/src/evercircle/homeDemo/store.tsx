import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useData } from '../../data';
import { persona } from '../demo/persona';
import { initialDemo, parseDemo, reduceDemo, type DemoAction, type DemoState } from './model';
import { readDemo, writeDemo } from './storage';
import { interpretCommand, type Command, type DeviceChange } from '../smartHome/model';
type Status = 'loading' | 'loadError' | 'ready' | 'saving' | 'error' | 'session';
function useDemoStore(id: string) {
  const [state, setState] = useState(() => initialDemo(id)), current = useRef(state);
  const [status, setStatus] = useState<Status>('loading'), statusRef = useRef<Status>('loading');
  const [command, setCommand] = useState<Command | null>(null);
  const [feedback, setFeedback] = useState<{ changes: readonly DeviceChange[]; unchanged: boolean } | null>(null);
  const alive = useRef(true), version = useRef(0), serial = useRef(0), queue = useRef(Promise.resolve());
  const updateStatus = (value: Status) => { statusRef.current = value; setStatus(value); };
  const hydrate = async () => { updateStatus('loading'); const request = ++version.current;
    try { const next = parseDemo(await readDemo(id), id); if (alive.current && request === version.current) { current.current = next; setState(next); updateStatus('ready'); } }
    catch { if (alive.current && request === version.current) updateStatus('loadError'); }
  };
  useEffect(() => { alive.current = true; void hydrate(); return () => { alive.current = false; version.current++; }; }, []);
  const persist = (next: DemoState) => {
    if (statusRef.current === 'session') return;
    const request = ++version.current; updateStatus('saving');
    queue.current = queue.current.then(async () => {
      try { await writeDemo(next); if (alive.current && request === version.current) updateStatus('ready'); }
      catch { if (alive.current && request === version.current) updateStatus('error'); }
    });
  };
  const change = (action: DemoAction) => {
    if (!['ready', 'saving', 'session'].includes(statusRef.current)) return false;
    const next = reduceDemo(current.current, action);
    if (next === current.current) return false;
    current.current = next; setState(next); persist(next); return true;
  };
  const apply = (changes: readonly DeviceChange[]) => {
    if (!['ready', 'saving', 'session'].includes(statusRef.current)) return false;
    const unchanged = changes.every(c => current.current.devices[c.id] === c.on);
    if (!unchanged && !change({ type: 'devices', changes, at: new Date().toISOString(), id: `${Date.now()}-${++serial.current}` })) return false;
    setCommand(null); setFeedback({ changes, unchanged }); return true;
  };
  const execute = (text: string) => {
    const result = interpretCommand(text); setFeedback(null); setCommand(result);
    const applied = result.kind === 'recognized' ? apply([result.change]) : false;
    return { result, applied };
  };
  return { state, status, command, feedback, change, apply, execute, cancelCommand: () => setCommand(null),
    enabled: ['ready', 'saving', 'session'].includes(status), retryLoad: hydrate, retrySave: () => persist(current.current),
    continueSession: () => { ++version.current; current.current = initialDemo(id); setState(current.current); updateStatus('session'); } };
}
type Store = ReturnType<typeof useDemoStore>;
const Context = createContext<Store | null>(null);
function ScopedProvider({ id, children }: { id: string; children: React.ReactNode }) { const value = useDemoStore(id); return <Context.Provider value={value}>{children}</Context.Provider>; }
export function HomeDemoProvider({ children }: { children: React.ReactNode }) {
  const { data } = useData();
  // Scope by the loaded household; demo data never enters DataProvider or its mutation APIs.
  const id = data?.home.id ?? persona.householdId;
  return <ScopedProvider key={id} id={id}>{children}</ScopedProvider>;
}
export function useHomeDemo() { const value = useContext(Context); if (!value) throw new Error('HomeDemoProvider missing'); return value; }
