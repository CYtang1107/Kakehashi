import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { initialState, parseSaved, type SavedAction, type SavedState } from './profile/model';
import { respond, type Reply } from './companion/engine';
import { readSaved, writeSaved } from './demo/storage';
import { persona } from './demo/persona';
import { runOrchestrator } from './orchestrator/journal';

type StorageStatus = 'loading' | 'loadError' | 'ready' | 'saving' | 'error' | 'session';
export type Message = { id: number; role: 'user'; text: string } | { id: number; role: 'companion'; reply: Reply };
const welcome = (): Message[] => [{ id: 0, role: 'companion', reply: { intent: 'greeting', key: 'cWelcome', actions: [], candidates: [] } }];
function useFeatureStore() {
  const [saved, setSaved] = useState(() => initialState(persona.householdId));
  const current = useRef(saved);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>('loading');
  const status = useRef<StorageStatus>('loading');
  const setStatus = (value: StorageStatus) => { status.current = value; setStorageStatus(value); };
  const [messages, setMessages] = useState<Message[]>(welcome);
  const [chatEpoch, setChatEpoch] = useState(0), [resetEpoch, setResetEpoch] = useState(0);
  const [replying, setReplying] = useState(false), [chatError, setChatError] = useState<'cChatLimit' | 'cChatError' | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequence = useRef(0), revision = useRef(0), queue = useRef<Promise<boolean>>(Promise.resolve(true));
  const alive = useRef(true);
  const loadVersion = useRef(0);
  const hydrate = async () => {
    const version = ++loadVersion.current;
    setStatus('loading');
    try { const next = parseSaved(await readSaved(persona.householdId), persona.householdId);
      if (alive.current && version === loadVersion.current) { current.current = next; setSaved(next); setStatus('ready'); }
    } catch { if (alive.current && version === loadVersion.current) setStatus('loadError'); }
  };
  useEffect(() => { alive.current = true; hydrate(); return () => { alive.current = false; if (timer.current) clearTimeout(timer.current); }; }, []);
  const persist = (next: SavedState): Promise<boolean> => {
    if (status.current === 'session') return Promise.resolve(true);
    const version = ++revision.current; setStatus('saving');
    const task = queue.current.then(async () => {
      try { await writeSaved(next); if (alive.current && version === revision.current) setStatus('ready'); return true; }
      catch { if (alive.current && version === revision.current) setStatus('error'); return false; }
    });
    queue.current = task; return task;
  };
  const change = (action: SavedAction): Promise<boolean> => {
    if (status.current === 'loading' || status.current === 'loadError') return Promise.resolve(false);
    const result = runOrchestrator({ type: 'profile', state: current.current, action, healthy: ['ready', 'saving', 'session'].includes(status.current) });
    if (result.permission !== 'allowed') return Promise.resolve(false);
    const next = result.saved!; current.current = next; setSaved(next); return persist(next);
  };
  const stop = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; setReplying(false); };
  const clearChat = () => { stop(); setChatEpoch(value => value + 1); setMessages(welcome()); setChatError(null); return change({ type: 'clearPending' }); };
  const reset = () => { stop(); setChatEpoch(value => value + 1); setResetEpoch(value => value + 1); setMessages(welcome()); setChatError(null); return change({ type: 'reset' }); };
  const send = (text: string, nextVisitDate?: string, extension?: () => Reply | undefined) => {
    if (timer.current || status.current === 'loading' || status.current === 'loadError') return false;
    const input = text.trim(); if (!input || input.length > 800) return false;
    if (messages.length >= 81) { setChatError('cChatLimit'); return false; }
    const userId = ++sequence.current; setMessages(previous => [...previous, { id: userId, role: 'user', text: input }]);
    setReplying(true); setChatError(null);
    timer.current = setTimeout(() => {
      timer.current = null;
      try {
        const reply = extension?.() ?? respond(input, { approved: current.current.approved.map(i => i.id), nextVisitDate });
        setMessages(previous => [...previous, { id: ++sequence.current, role: 'companion', reply }]);
        if (reply.candidates.length) void change({ type: 'suggest', ids: reply.candidates });
      } catch { setChatError('cChatError'); }
      setReplying(false);
    }, 350);
    return true;
  };
  return { saved, messages, replying, chatError, chatEpoch, resetEpoch, storageStatus, change, send, stop, clearChat, reset,
    retryLoad: hydrate, retrySave: () => persist(current.current),
    continueSession: () => { current.current = initialState(persona.householdId); setSaved(current.current); setStatus('session'); } };
}
type FeatureStore = ReturnType<typeof useFeatureStore>;
const Context = createContext<FeatureStore | null>(null);
export function EverCircleProvider({ children }: { children: React.ReactNode }) { const value = useFeatureStore(); return <Context.Provider value={value}>{children}</Context.Provider>; }
export function useEverCircle() { const value = useContext(Context); if (!value) throw new Error('EverCircle requires its household provider'); return value; }
