import { serializeSocial, type SocialState } from './model';
export const socialStorageKey='kakehashi-social-demo-v1';
export async function readSocial():Promise<string|null>{return globalThis.localStorage.getItem(socialStorageKey);}
export async function writeSocial(state:SocialState):Promise<void>{globalThis.localStorage.setItem(socialStorageKey,serializeSocial(state));}
