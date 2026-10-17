import React, { useEffect, useState } from 'react';
import { AppText, Button, Card, Pill, ConfirmationDialog } from '../../ui';
import { useI18n, type Key } from '../../i18n';
import { COMMUNITIES, type CommunityId } from './fixtures';
import { SocialPage, displayPerson } from './SocialPage';
import { useSocial } from './store';

export function CommunitiesScreen(){
  const {t,lang}=useI18n(),social=useSocial();
  const [pending,setPending]=useState<{actor:string;community:CommunityId}|null>(null);
  useEffect(()=>setPending(null),[social.active.id]);
  return <SocialPage title="sCommunities" description="sCommunityLead">
    {COMMUNITIES.map((id,index)=>{const joined=social.state.memberships.some(m=>m.personId===social.active.id&&m.communityId===id),name=t(`sCommunity_${id}` as Key);
      return <Card key={id}><AppText variant="section">{name}</AppText>
        <AppText>{t('sCommunityActivity',{activity:name,region:t(index%2?'sRegionKanto':'sRegionNiigata')})}</AppText>
        <Pill label={t(joined?'sJoined':'uxNotJoined')} />
        <Button label={t(joined?'sLeave':'sJoin')} accessibilityLabel={`${t(joined?'sLeave':'sJoin')}: ${name}`} kind="secondary" disabled={!social.healthy}
          onPress={()=>{if(joined)void social.act({type:'community',actor:social.active.id,community:id,join:false});else setPending({actor:social.active.id,community:id});}}/>
      </Card>;
    })}
    <ConfirmationDialog visible={Boolean(pending)} title={t('sJoinTitle',{name:pending?t(`sCommunity_${pending.community}` as Key):''})}
      message={t('sJoinBody',{name:displayPerson(social.active,lang)})} confirmLabel={t('sJoin')} busy={social.status==='saving'} onCancel={()=>setPending(null)}
      onConfirm={()=>{if(pending)void social.act({type:'community',...pending,join:true}).then(()=>setPending(null));}}/>
  </SocialPage>;
}
