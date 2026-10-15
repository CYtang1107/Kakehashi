import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppText, Button, ConfirmationDialog, Field, Fold, StatusBanner } from '../../ui';
import { useI18n, type Key } from '../../i18n';
import { useAccessibilityPreferences } from '../../design-system/preferences';
import { canMessage, pairKey, relationship, type ReportReason } from './model';
import { SocialPage, displayPerson, useSocialConfirmation } from './SocialPage';
import { useSocial } from './store';

export function ConversationScreen(){
  const {id}=useLocalSearchParams<{id:string}>(),{t,lang}=useI18n(),social=useSocial(),confirmation=useSocialConfirmation();
  const {palette,scale,reducedMotion}=useAccessibilityPreferences();
  const scroll=useRef<ScrollView>(null),chatTop=useRef(0),latestTop=useRef(0);
  const [text,setText]=useState(''),[report,setReport]=useState(false),[reason,setReason]=useState<ReportReason>('unwanted');
  useEffect(()=>{setText('');setReport(false);},[social.active.id,id]);
  const peer=social.people.find(p=>p.id===id&&p.id!==social.active.id);
  const messages=social.state.messages.filter(m=>m.key===pairKey(social.active.id,id??''));
  useEffect(()=>{if(!messages.length)return;const timer=setTimeout(()=>scroll.current?.scrollTo({y:chatTop.current+latestTop.current,animated:!reducedMotion}),220);return()=>clearTimeout(timer);},[messages.length,social.active.id,id,reducedMotion]);
  if(!peer)return <SocialPage title="sMessages"><StatusBanner title={t('sUnknownPerson')}/></SocialPage>;
  const name=peer.shared.identity?displayPerson(peer,lang):t('sPrivateMember'),status=relationship(social.state,social.active,peer);
  const allowed=canMessage(social.state,social.active,peer,social.healthy);
  const full=messages.length>=100;
  const send=()=>{void social.act({type:'message',actor:social.active.id,target:peer.id,text}).then(ok=>{if(ok)setText('');});};
  return <SocialPage title="sMessages" description="sMessageLead" scrollRef={scroll} footer={<View style={{backgroundColor:palette.surface,borderTopWidth:1,borderColor:palette.border,padding:12}}>
    <View style={{maxWidth:680,width:'100%',alignSelf:'center',gap:8}}>
      <Field label={t('sMessageTo',{name})} value={text} onChangeText={setText} multiline maxLength={800} editable={allowed&&!full} style={{minHeight:80*scale,maxHeight:140*scale}}/>
      <Button label={t('sSend')} icon="send" disabled={!allowed||full||!text.trim()} onPress={send}/>
    </View>
  </View>}>
    <AppText variant="section">{name}</AppText><AppText>{t(`sState_${status}` as Key)}</AppText>
    {status!=='accepted'?<StatusBanner title={t('sMessageClosed')}/>:<>
      <View onLayout={event=>{chatTop.current=event.nativeEvent.layout.y;}} style={{gap:20}}>
      {!messages.length?<AppText>{t('sNoMessages')}</AppText>:messages.map(message=><View key={message.id} onLayout={event=>{if(message.id===messages.at(-1)?.id)latestTop.current=event.nativeEvent.layout.y;}} style={{width:'95%',alignSelf:message.from===social.active.id?'flex-end':'flex-start',backgroundColor:message.from===social.active.id?palette.secondary:palette.surface,borderWidth:1,borderColor:palette.border,borderRadius:16,padding:20,gap:12}}>
        <AppText variant="bodyBold">{message.kind==='scripted'?t('sScripted',{name:message.from===social.active.id?displayPerson(social.active,lang):name}):message.from===social.active.id?t('cYou'):name}</AppText>
        <AppText accessibilityLiveRegion={message.id===messages.at(-1)?.id?'polite':'none'}>{message.kind==='scripted'?t('sMockReply'):message.text}</AppText>
      </View>)}
      </View>
      {full?<StatusBanner title={t('sMessageLimit')}/>:null}
      <Fold title={t('cStarterTitle')}>{(['sStarterHello','sStarterHobby','sStarterDay'] as const).map(key=><Button key={key} label={t(key)} kind="secondary" disabled={!allowed||full} onPress={()=>setText(t(key))}/>)}</Fold>
      <Button label={t('sSimulateReply')} kind="secondary" disabled={!allowed||full} onPress={()=>{void social.act({type:'reply',actor:social.active.id,target:peer.id});}}/>
    </>}
    <Fold title={t('cPrivacy')}><AppText variant="caption">{t('sMessageNotice')}</AppText></Fold>
    <Button label={t('sBlock')} kind="secondary" disabled={status==='blocked'||social.status==='saving'} onPress={()=>confirmation.request('block',peer.id)}/>
    <Button label={t('sReport')} kind="secondary" disabled={social.status==='saving'} onPress={()=>setReport(true)}/>
    {confirmation.dialog}
    <ConfirmationDialog visible={report} title={t('sReportTitle')} message={t('sReportBody')} confirmLabel={t('sConfirmReport')} busy={social.status==='saving'} onCancel={()=>setReport(false)}
      onConfirm={()=>{void social.act({type:'report',actor:social.active.id,target:peer.id,reason}).then(()=>setReport(false));}}>
      {(['unwanted','concern'] as const).map(value=><Button key={value} label={t(`sReason_${value}`)} kind="secondary" selected={reason===value} onPress={()=>setReason(value)}/>)}
    </ConfirmationDialog>
  </SocialPage>;
}
