import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { AppText, Button, Card, EmptyState, Fold, StatusBanner } from '../../ui';
import { useI18n, type Key } from '../../i18n';
import { interestKey } from '../profile/PendingInterests';
import { eligibility, personEligibility, simulateAgents, WEIGHTS, type Component } from './matching';
import { relationship } from './model';
import { SocialPage, displayPerson, useSocialConfirmation } from './SocialPage';
import { useSocial } from './store';
import { orchestrate } from '../orchestrator/model';
import { recordResult } from '../orchestrator/journal';

export const componentLabels:Record<Component,Key>={hobbies:'cHobbies',languages:'cLanguages',times:'cTimes',communication:'cCommunication',activities:'cActivities',locations:'cLocations'};
export function DiscoveryScreen({children}:{children?:React.ReactNode}){
  const {t,lang}=useI18n(),social=useSocial(),confirmation=useSocialConfirmation();const [all,setAll]=useState(false);
  const own=social.active,reason=personEligibility(own),busy=social.status==='saving';
  const others=social.people.filter(p=>p.id!==own.id);
  const connections=others.filter(p=>!['none','blocked'].includes(relationship(social.state,own,p)));
  const matching=useMemo(()=>orchestrate({type:'matching',person:own,people:social.people,healthy:social.healthy}),[social.people,social.healthy,own]);
  useEffect(()=>{recordResult(matching);},[matching]);
  const recommendations=social.healthy?others.map((p,index)=>({person:p,result:matching.matches?.[index]}))
    .filter((entry): entry is {person:typeof own;result:ReturnType<typeof simulateAgents>}=>Boolean(entry.result))
    .filter(entry=>entry.result.eligible&&['none','declined'].includes(relationship(social.state,own,entry.person)))
    .sort((a,b)=>(b.result.eligible?b.result.score:0)-(a.result.eligible?a.result.score:0)||a.person.id.localeCompare(b.person.id)):[];
  const list=(values:string[],hobbies=false)=>values.map(id=>t(hobbies?interestKey(id):`cOption_${id}` as Key)).join(' / ');
  return <SocialPage title="hFriends" description="sLead" back={false}>
    <AppText variant="caption">{t('sLocalDemo')}</AppText>
    <AppText>{t(own.matching?'sPermissionOn':'sPermissionOff')}</AppText>
    {reason?<AppText>{t(`sEligibility_${reason}` as Key)}</AppText>:null}
    <Button label={t('sPermissions')} icon="shield" kind={reason?'primary':'secondary'} onPress={()=>router.push('/her/friends/permissions')}/>
    {connections.length?<View style={{gap:16}}><AppText variant="section">{t('sConnections')}</AppText>{connections.map(person=>{
      const status=relationship(social.state,own,person),name=person.shared.identity?displayPerson(person,lang):t('sPrivateMember');
      return <Card key={person.id}><AppText variant="section">{name}</AppText><AppText>{t(`sState_${status}` as Key)}</AppText>
        {status==='received'?<><Button label={t('sAccept')} accessibilityLabel={`${t('sAccept')}: ${name}`} disabled={busy||!social.healthy||Boolean(eligibility(own,person))} onPress={()=>confirmation.request('accept',person.id)}/>
          <Button label={t('sDecline')} kind="secondary" disabled={busy} onPress={()=>confirmation.request('decline',person.id)}/></>:null}
        {status==='accepted'?<Button label={t('sOpenMessages')} accessibilityLabel={`${t('sOpenMessages')}: ${name}`} onPress={()=>router.push(`/her/friends/conversation/${person.id}`)}/>:null}
        <Button label={t('sBlock')} kind="secondary" disabled={busy} onPress={()=>confirmation.request('block',person.id)}/>
      </Card>;
    })}</View>:null}
    <View style={{gap:16}}><AppText variant="section">{t('sRecommendations')}</AppText>
      {!recommendations.length?<EmptyState title={t('sNoMatches')}/>:recommendations.slice(0,all?undefined:3).map(({person,result})=>{
        if(!result.eligible)return null;const candidate=result.candidate;
        return <Card key={candidate.id}><AppText variant="section">{lang==='ja'?candidate.nameJa:candidate.name}</AppText>
          {candidate.age!==undefined?<AppText variant="caption">{t('sAge',{age:candidate.age})}</AppText>:null}
          <AppText variant="bodyBold">{result.shared.hobbies.length?t('sSharedHobbies',{values:list(result.shared.hobbies,true)}):t('sNewInterests')}</AppText>
          {result.shared.languages.length?<AppText>{t('sSharedLanguage',{values:list(result.shared.languages)})}</AppText>:null}
          {result.shared.times.length?<AppText>{t('sSharedTimes',{values:list(result.shared.times)})}</AppText>:null}
          <AppText variant="caption">{t('sScore',{score:result.score})}</AppText>
          <Button label={t('sInvite')} accessibilityLabel={`${t('sInvite')}: ${displayPerson(person,lang)}`} disabled={busy} onPress={()=>confirmation.request('invite',person.id)}/>
          <Fold title={t('sExplain')}>{(Object.keys(WEIGHTS) as Component[]).map(key=><AppText key={key} variant="caption">{t('sScorePart',{field:t(componentLabels[key]),points:Math.round(result.components[key]*WEIGHTS[key]*1000)/10,weight:WEIGHTS[key]*100})}</AppText>)}<AppText variant="caption">{t('sMissing')}</AppText></Fold>
        </Card>;
      })}
      {!all&&recommendations.length>3?<Button label={t('sMorePeople')} kind="secondary" onPress={()=>setAll(true)}/>:null}
    </View>
    <Button label={t('sSwitchDemo')} icon="users" kind="secondary" onPress={()=>router.push('/her/friends/demo')}/>
    <Button label={t('sCommunities')} icon="coffee" kind="secondary" onPress={()=>router.push('/her/friends/communities')}/>
    {own.id==='tanaka'?<Button label={t('cProfile')} kind="secondary" onPress={()=>router.push('/her/profile')}/>:null}
    {!connections.length?<AppText variant="caption">{t('sNoConnections')}</AppText>:null}
    {own.id==='tanaka'?children:<StatusBanner title={t('sDemoWarning')}/>}
    {confirmation.dialog}
  </SocialPage>;
}
