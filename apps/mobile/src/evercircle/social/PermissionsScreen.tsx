import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { AccessibleSwitch, AppText, Button, Fold } from '../../ui';
import { useI18n, type Key } from '../../i18n';
import { useEverCircle } from '../store';
import { interestKey } from '../profile/PendingInterests';
import { SHARE_FIELDS } from './matching';
import { SocialPage, displayPerson } from './SocialPage';
import { useSocial } from './store';
import { componentLabels } from './DiscoveryScreen';

export function PermissionsScreen(){
  const {t,lang}=useI18n(),social=useSocial(),companion=useEverCircle(),own=social.active;
  const busy=social.status==='saving'||companion.storageStatus==='saving';
  const matching=(enabled:boolean)=>own.id==='tanaka'?companion.change({type:'matching',enabled}):social.act({type:'matching',actor:own.id,enabled});
  return <SocialPage title="sPermissions" description="sPermissionLead">
    <AccessibleSwitch label={t('sMaster')} description={t('sMasterHint')} value={own.matching} disabled={busy} onValueChange={enabled=>{void matching(enabled);}}/>
    <AccessibleSwitch label={t('sEligible')} description={t('sEligibleHint')} value={own.eligible} disabled={busy} onValueChange={enabled=>{void social.act({type:'eligible',actor:own.id,enabled});}}/>
    <AppText variant="section">{t('sHobbyPermission')}</AppText>
    {!own.hobbies.length?<AppText>{t('cNoInterests')}</AppText>:own.hobbies.map(hobby=><AccessibleSwitch key={hobby.id} label={t('cShareInterest',{interest:t(interestKey(hobby.id))})}
      value={hobby.shareForMatching} disabled={busy||!own.matching} onValueChange={enabled=>{void(own.id==='tanaka'?companion.change({type:'share',id:hobby.id,enabled}):social.act({type:'hobby',actor:own.id,id:hobby.id,enabled}));}}/>)}
    <AppText variant="section">{t('sFieldPermissions')}</AppText>
    {own.id==='tanaka'?<AppText variant="caption">{t('sRevisionHint')}</AppText>:null}
    {SHARE_FIELDS.filter(field=>field!=='age'||own.age!==undefined).map(field=>{
      const values=field==='identity'?displayPerson(own,lang):field==='age'?String(own.age):own.profile[field].map(id=>t(`cOption_${id}` as Key)).join(' / ');
      return <AccessibleSwitch key={field} label={field==='identity'?t('sIdentity'):field==='age'?t('sAgeShare'):t('sFieldShare',{field:t(componentLabels[field])})}
        description={values?t('sFieldValues',{values}):t('sNotProvided')} value={own.shared[field]} disabled={busy||!values}
        onValueChange={enabled=>{void social.act({type:'grant',actor:own.id,field,enabled,revision:own.id==='tanaka'?(companion.saved.profileRevision??0):0});}}/>;
    })}
    {own.id==='tanaka'?<><Button label={t('cProfile')} kind="secondary" onPress={()=>router.push('/her/profile')}/><Button label={t('cPrivacy')} kind="secondary" onPress={()=>router.push('/her/privacy')}/></>:null}
    <Fold title={t('sBlockedPeople')}>{own.blocked.length?own.blocked.map(id=><View key={id} style={{gap:12}}><AppText>{t('sPrivateMember')} ({id})</AppText>
      <Button label={t('sUnblock')} accessibilityLabel={`${t('sUnblock')}: ${id}`} kind="secondary" disabled={busy} onPress={()=>{void social.act({type:'unblock',actor:own.id,target:id});}}/></View>):<AppText>{t('sNobodyBlocked')}</AppText>}</Fold>
    <Button label={t('sBackFriends')} onPress={()=>router.navigate('/her/friends')}/>
  </SocialPage>;
}
