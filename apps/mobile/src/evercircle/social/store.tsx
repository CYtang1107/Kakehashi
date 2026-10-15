import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useEverCircle } from '../store';
import { initialSocial, parseSocial, reduceSocial, socialPeople, type SocialAction, type SocialState } from './model';
import { readSocial, writeSocial } from './storage';

type Status='loading'|'loadError'|'ready'|'saving'|'error'|'session';
function useSocialStore(){
  const companion=useEverCircle(), companionRef=useRef(companion);companionRef.current=companion;
  const [state,setState]=useState(initialSocial),current=useRef(state);
  const [status,setStatus]=useState<Status>('loading'),statusRef=useRef<Status>('loading');
  const [feedback,setFeedback]=useState<'sSaved'|'sActionUnavailable'|null>(null);
  const alive=useRef(true),version=useRef(0),queue=useRef<Promise<boolean>>(Promise.resolve(true)),loadVersion=useRef(0);
  const updateStatus=(next:Status)=>{statusRef.current=next;setStatus(next);};
  const hydrate=async()=>{const attempt=++loadVersion.current;updateStatus('loading');try{const next=parseSocial(await readSocial());if(alive.current&&attempt===loadVersion.current){current.current=next;setState(next);updateStatus('ready');}}catch{if(alive.current&&attempt===loadVersion.current)updateStatus('loadError');}};
  useEffect(()=>{alive.current=true;void hydrate();return()=>{alive.current=false;};},[]);
  const persist=(next:SocialState)=>{
    if(statusRef.current==='session')return Promise.resolve(true);
    const stamp=++version.current;updateStatus('saving');
    const task=queue.current.then(async()=>{try{await writeSocial(next);if(alive.current&&stamp===version.current)updateStatus('ready');return true;}catch{if(alive.current&&stamp===version.current)updateStatus('error');return false;}});
    queue.current=task;return task;
  };
  const profileHealthy=['ready','session'].includes(companion.storageStatus);
  const healthy=['ready','session'].includes(status)&&profileHealthy;
  const people=socialPeople(state,companion.saved,profileHealthy);
  const act=async(action:SocialAction)=>{
    setFeedback(null);
    if(['loading','loadError','saving'].includes(statusRef.current))return false;
    const c=companionRef.current, currentProfileHealthy=['ready','session'].includes(c.storageStatus);
    const result=reduceSocial(current.current,action,socialPeople(current.current,c.saved,currentProfileHealthy),['ready','session'].includes(statusRef.current)&&currentProfileHealthy);
    if(!result.ok){setFeedback('sActionUnavailable');return false;}
    current.current=result.state;setState(result.state);const session=statusRef.current==='session';const ok=await persist(result.state);if(alive.current&&ok&&!session)setFeedback('sSaved');return ok;
  };
  return {state,people,active:people.find(p=>p.id===state.activeId)!,status,healthy,feedback,act,clearFeedback:()=>setFeedback(null),
    retryLoad:hydrate,retrySave:()=>persist(current.current),
    continueSession:()=>{current.current=initialSocial();setState(current.current);updateStatus('session');}};
}
type Store=ReturnType<typeof useSocialStore>;
const Context=createContext<Store|null>(null);
export function SocialProvider({children}:{children:React.ReactNode}){const value=useSocialStore();return <Context.Provider value={value}>{children}</Context.Provider>;}
export function useSocial(){const value=useContext(Context);if(!value)throw Error('SocialProvider is required');return value;}
