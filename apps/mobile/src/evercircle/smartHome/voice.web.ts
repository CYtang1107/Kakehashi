import { useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; start: () => void; abort: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null };
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
export function useVoice(lang: string, onText: (text: string) => void) {
  const [listening, setListening] = useState(false), [speaking, setSpeaking] = useState(false);
  const [notice, setNotice] = useState<'heard' | 'voiceError' | 'speechError' | ''>('');
  const recognition = useRef<Recognition | null>(null), timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const receive = useRef(onText); receive.current = onText;
  const Constructor = typeof window === 'undefined' ? undefined : (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition;
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const stop = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current); timeout.current = null;
    const active = recognition.current; recognition.current = null;
    if (active) { active.onresult = null; active.onerror = null; active.onend = null; active.abort(); }
    setListening(false);
  }, []);
  const stopSpeech = useCallback(() => { if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel(); setSpeaking(false); }, []);
  useFocusEffect(useCallback(() => () => { stop(); stopSpeech(); }, [stop, stopSpeech]));
  useEffect(() => { stop(); stopSpeech(); }, [lang, stop, stopSpeech]);
  const start = () => {
    if (!Constructor || recognition.current) return;
    stopSpeech(); setNotice('');
    try {
      const active = new Constructor(); recognition.current = active;
      active.lang = lang === 'ja' ? 'ja-JP' : 'en-GB'; active.continuous = false; active.interimResults = false;
      let heard = false;
      active.onresult = event => { const text = event.results[0]?.[0]?.transcript?.trim(); if (text) { heard = true; receive.current(text.slice(0, 240)); setNotice('heard'); } };
      active.onerror = () => { setNotice('voiceError'); stop(); };
      active.onend = () => { if (!heard) setNotice('voiceError'); stop(); };
      setListening(true); active.start();
      timeout.current = setTimeout(() => { setNotice('voiceError'); stop(); }, 20000);
    } catch { setNotice('voiceError'); stop(); }
  };
  const speak = (text: string) => {
    if (!canSpeak) return;
    stopSpeech();
    const voice = window.speechSynthesis.getVoices().find(v => v.localService && v.lang.startsWith(lang));
    if (!voice) { setNotice('speechError'); return; }
    try { const utterance = new SpeechSynthesisUtterance(text); utterance.voice = voice; utterance.lang = voice.lang;
      utterance.onend = () => setSpeaking(false); utterance.onerror = () => { setSpeaking(false); setNotice('speechError'); };
      setSpeaking(true); window.speechSynthesis.speak(utterance);
    } catch { setSpeaking(false); setNotice('speechError'); }
  };
  return { available: Boolean(Constructor), canSpeak, listening, speaking, notice, start, stop, speak, stopSpeech };
}
