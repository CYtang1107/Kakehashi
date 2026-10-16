import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { AppText, Button, ConfirmationDialog, StatusBanner } from '../../ui';
import { HerPage } from '../../her/HerPage';
import { useI18n, type Key, type Lang } from '../../i18n';
import { useEverCircle } from '../store';
import { useSocial } from './store';
import type { SocialPerson } from './matching';

export const displayPerson=(person:SocialPerson,lang:Lang)=>lang==='ja'?person.nameJa:person.name;
export function SocialPage({title,description,children,footer,back=true,scrollRef}:{title:Key;description?:Key;children:React.ReactNode;footer?:React.ReactNode;back?:boolean;scrollRef?:React.Ref<ScrollView>}){
  const {t,lang}=useI18n(),social=useSocial(),companion=useEverCircle();
  const loaded=!['loading','loadError'].includes(social.status);
  return <HerPage title={t(title)} description={description?t(description):undefined} back={back} requiresHome={false} footer={loaded?footer:undefined} scrollRef={scrollRef}>
    <AppText variant="caption">{t('sDemoIdentity',{name:displayPerson(social.active,lang)})}</AppText>
    {social.status==='loading'?<AppText>{t('dsLoading')}</AppText>:social.status==='loadError'?<View style={{gap:12}}>
      <StatusBanner tone="error" title={t('sLoadError')} action={{label:t('retry'),onPress:social.retryLoad}}/>
      <Button label={t('cContinueSession')} kind="secondary" onPress={social.continueSession}/>
    </View>:<>
      {social.status==='error'?<StatusBanner tone="error" title={t('sStorageError')} action={{label:t('cRetrySave'),onPress:social.retrySave}}/>:null}
      {social.status==='session'?<StatusBanner title={t('sSession')} tone="warning"/>:null}
      {!['ready','session','saving'].includes(companion.storageStatus)?<StatusBanner title={t('sProfileUnavailable')} action={{label:t('cPrivacy'),onPress:()=>router.push('/her/privacy')}}/>:null}
      {social.feedback?<StatusBanner tone={social.feedback==='sSaved'?'success':'error'} title={t(social.feedback)}/>:null}
      {children}
    </>}
  </HerPage>;
}
type Decision='invite'|'accept'|'decline'|'block';
export function useSocialConfirmation(){
  const {t,lang}=useI18n(),social=useSocial();
  const [pending,setPending]=useState<{type:Decision;actor:string;target:string}|null>(null);
  useEffect(()=>setPending(null),[social.active.id]);
  const target=social.people.find(p=>p.id===pending?.target);
  const name=target?.shared.identity?displayPerson(target,lang):t('sPrivateMember');
  const type=pending?.type??'invite';
  const titles:Record<Decision,Key>={invite:'sInviteTitle',accept:'sAcceptTitle',decline:'sDeclineTitle',block:'sBlockTitle'};
  const bodies:Record<Decision,Key>={invite:'sInviteBody',accept:'sAcceptBody',decline:'sDeclineBody',block:'sBlockBody'};
  const labels:Record<Decision,Key>={invite:'sConfirmInvite',accept:'sAccept',decline:'sDecline',block:'sBlock'};
  return {request:(type:Decision,target:string)=>setPending({type,target,actor:social.active.id}),dialog:<ConfirmationDialog visible={Boolean(pending)}
    title={t(titles[type],{name})} message={t(bodies[type],{name:displayPerson(social.active,lang)})} destructive={type==='block'} busy={social.status==='saving'}
    confirmLabel={t(labels[type])} onCancel={()=>setPending(null)} onConfirm={()=>{if(pending)void social.act({...pending,confirmed:true}).then(()=>setPending(null));}}/>};
}
