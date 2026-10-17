import React from 'react';
import { router } from 'expo-router';
import { AppText, Button, Card, Pill, StatusBanner } from '../../ui';
import { useI18n } from '../../i18n';
import { persona } from '../demo/persona';
import { FICTIONAL_PEOPLE } from './fixtures';
import { SocialPage } from './SocialPage';
import { useSocial } from './store';

export function DemoScreen(){
  const {t,lang}=useI18n(),social=useSocial();
  // Fixed demo identities, not the resident's privately edited profile name.
  const accounts=[{id:'tanaka',name:persona.name,nameJa:persona.nameJa},...FICTIONAL_PEOPLE];
  return <SocialPage title="sDemoTitle" description="sDemoLead">
    <StatusBanner title={t('sDemoWarning')} />
    {accounts.map(account=>{const name=lang==='ja'?account.nameJa:account.name;return <Card key={account.id}>
      <AppText variant="section">{name}</AppText>
      {account.id===social.active.id?<Pill label={t('sCurrentDemo')}/>:null}
      <Button label={t(account.id===social.active.id?'sCurrentDemo':'sUseDemo',{name})} kind="secondary" disabled={account.id===social.active.id||social.status==='saving'}
        onPress={()=>{void social.act({type:'switch',id:account.id}).then(ok=>{if(ok)router.navigate('/her/friends');});}}/>
    </Card>;})}
  </SocialPage>;
}
