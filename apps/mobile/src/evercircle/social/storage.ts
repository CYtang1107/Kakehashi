import { File, Paths } from 'expo-file-system';
import { serializeSocial, type SocialState } from './model';
const file=()=>new File(Paths.document,'evercircle-social-demo-v1.json');
export async function readSocial():Promise<string|null>{const target=file();return target.exists?await target.text():null;}
export async function writeSocial(state:SocialState):Promise<void>{file().write(serializeSocial(state));}
