// Native fallback deliberately has no browser globals or extra native voice dependency.
export function useVoice(_lang: string, _onText: (text: string) => void) {
  return { available: false, canSpeak: false, listening: false, speaking: false, notice: '' as 'heard' | 'voiceError' | 'speechError' | '',
    start: () => {}, stop: () => {}, speak: (_text: string) => {}, stopSpeech: () => {} };
}
