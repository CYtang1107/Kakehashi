import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { AppText, Button, ConfirmationDialog, Fold, StatusBanner, TaskWorkspace } from '../../ui';
import { ScreenFrame } from '../../design-system/ScreenFrame';
import { useAccessibilityPreferences } from '../../design-system/preferences';
import { ReadingSettings } from '../../design-system/ReadingSettings';
import { useI18n } from '../../i18n';
import { ACTIONS } from '../companion/engine';
import { AgentGraph } from './AgentGraph';
import { newDemo, matchingStep, blockedDemo, demoScenario } from './demo';
import { clearTraces, getTraces, subscribe } from './journal';
import { moduleName, stepDescription } from './copy';
import type { Module } from './model';

export default function DeveloperScreen() {
  const { lang } = useI18n(), ja = lang === 'ja';
  const { reducedMotion } = useAccessibilityPreferences();
  const c = (en: string, jp: string) => ja ? jp : en;
  const traces = useSyncExternalStore(subscribe, getTraces, getTraces);
  const [demo, setDemo] = useState(newDemo), [live, setLive] = useState(false), [traceId, setTraceId] = useState<number | null>(null);
  const [cursor, setCursor] = useState(0), [playing, setPlaying] = useState(false), [selected, setSelected] = useState<Module | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [reading, setReading] = useState(false);
  const trace = traces.find(t => t.id === traceId) ?? traces.at(-1);
  const events = live ? trace?.events ?? [] : demo.events;
  const result = live ? trace : demo.result;
  const current = events[Math.min(cursor, events.length - 1)];
  useEffect(() => { setPlaying(false); setCursor(Math.max(0, events.length - 1)); }, [events]);
  useEffect(() => {
    if (!playing || reducedMotion || cursor >= events.length - 1) { if (playing) setPlaying(false); return; }
    const timer = setTimeout(() => setCursor(n => n + 1), 1100); return () => clearTimeout(timer);
  }, [playing, cursor, events.length, reducedMotion]);
  const replay = () => { setCursor(0); setPlaying(!reducedMotion && events.length > 1); };
  const advance = () => { setLive(false); setDemo(matchingStep); };
  const nextLabels = [c('Recognize gardening', '園芸を認識'), c('Approve saving gardening', '園芸の保存を承認'),
    c('Approve sharing name & gardening for matching', 'マッチング用に名前と園芸の共有を承認'), c('Find eligible friends', '条件を満たす友達を探す'),
    c('Prepare an invitation to Haru', '晴さんへの招待を準備'), c('Review invitation', '招待を確認'), c('Simulate recipient acceptance', '架空の相手として承諾')];
  const scenarios = [
    ['Memories', '思い出', 'I want to record my childhood memories.'], ['Local helpers', '地域のお手伝い', 'I need help organizing my belongings.'],
    ['Student visits', '学生の訪問', 'When is my next student visit?'], ['My Day', '今日の予定', 'What activities do I have today?'],
    ['Home safety', '住まいの安全', 'Show home safety'], ['Bedroom light', '寝室の照明', 'Turn on the bedroom light.'],
  ];
  const eventDetails = (
        <View style={{ flex: 1, minWidth: 0, gap: 16 }}>
          <AppText variant="section">{c('Current transition', '現在の遷移')}</AppText>
          {current ? <View accessibilityLiveRegion="polite" style={{ gap: 12 }}><AppText variant="bodyBold">{`${cursor + 1} / ${events.length} · ${moduleName(current.from, ja)} → ${moduleName(current.to, ja)}`}</AppText><AppText>{stepDescription(current.kind, ja)}</AppText></View> : null}
          {selected ? <><AppText variant="section">{moduleName(selected, ja)}</AppText>
            <AppText>{c('Select a recorded transition to inspect it.', '記録された遷移を選ぶと詳細を確認できます。')}</AppText>
            {events.map((e, index) => e.from === selected || e.to === selected ? <Button key={index} kind="secondary" selected={cursor === index} label={`${index + 1} · ${stepDescription(e.kind, ja)}`} onPress={() => { setPlaying(false); setCursor(index); }} /> : null)}</> : null}
          <Fold title={c('Inspect sanitized events', 'サニタイズ済みイベントを確認')}><ScrollView horizontal keyboardShouldPersistTaps="handled"
            accessibilityLabel={c('Sanitized events', 'サニタイズ済みイベント')} style={{ flexGrow: 0 }}>
            <AppText selectable variant="caption" style={{ minWidth: 600, fontFamily: 'monospace', flexShrink: 0 }}>{JSON.stringify(events, null, 2)}</AppText>
          </ScrollView></Fold>
        </View>
  );
  return <ScreenFrame wide title={c('Agent collaboration', 'エージェントの連携')} description={c('Prototype developer tooling · fictional, local simulations. Persona switching is not account access.', '開発者向け試作ツール · 架空のローカル実演です。人物の切り替えはアカウント認証ではありません。')}>
    <AppText variant="caption">{c(`Demo narrator: ${demo.persona}. Changes stay in this panel.`, `実演の人物：${demo.persona}。変更はこのパネル内だけに適用されます。`)}</AppText>
    <TaskWorkspace defaultTask="workflow" tasks={[
      { id: 'workflow', label: c('Agent Workflow', 'エージェントの流れ'), icon: 'git-branch', content: <>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      <Button label={c('Matching workflow', 'マッチングの流れ')} selected={!live} kind="secondary" onPress={() => { setDemo(newDemo(demo.persona)); setLive(false); }} />
      <Button label={c('Run blocked workflow', 'ブロックされる操作を実行')} kind="secondary" onPress={() => { setDemo(blockedDemo(demo.persona)); setLive(false); }} />
      <Button label={c('Inspect app events', 'アプリのイベントを見る')} kind="secondary" selected={live} onPress={() => setLive(true)} />
    </View>
    {!live ? <View style={{ gap: 12 }}>
      <AppText variant="section">{c('One decision at a time', '一つずつ選択')}</AppText>
      <AppText>{c('Saving, sharing and inviting are separate approvals. Replay only reads recorded events; it never repeats an action.', '保存・共有・招待はそれぞれ承認が必要です。再生は記録の閲覧のみで、操作を繰り返しません。')}</AppText>
      {demo.phase < 7 ? <Button label={nextLabels[demo.phase]} onPress={() => demo.phase === 5 || demo.phase === 6 ? setConfirm(true) : advance()} /> : <StatusBanner tone="success" title={c('Fictional friendship accepted', '架空の友達が招待を承諾しました')} />}
    </View> : <View style={{ gap: 12 }}>
      <AppText>{c('Recent in-memory app workflows. Open this panel in the same app session after using Companion, Friends, Profile or Smart Home.', '同じアプリ内で会話・友達・プロフィール・スマートホームを利用すると、直近の実行記録を確認できます。')}</AppText>
      {!traces.length ? <AppText>{c('No app events yet.', 'まだイベントはありません。')}</AppText> : <Fold title={c('Choose a recorded workflow', '実行記録を選ぶ')}>
        {[...traces].reverse().map(t => <Button key={t.id} kind="secondary" selected={trace?.id === t.id} label={`${t.id} · ${moduleName(t.module, ja)} · ${t.permission}`} onPress={() => setTraceId(t.id)} />)}
      </Fold>}
    </View>}
    {result ? <View style={{gap:12}}><StatusBanner tone={result.permission === 'denied' ? 'error' : result.permission === 'confirmationRequired' ? 'warning' : 'info'}
      title={result.permission === 'denied' ? c('Permission denied — nothing was sent', '許可がないため送信していません') : c('Workflow result', '実行結果')} />
      <AppText>{stepDescription(result.userFacingResult, ja)}</AppText>
      {result.permission === 'denied' ? <AppText>{live ? c('The current permissions or data availability did not allow this operation. Review the originating screen before trying again.', '現在の許可またはデータの状態では操作できません。元の画面を確認してから再度お試しください。') : c('This matching demonstration has no sharing consent. Approve saving and sharing separately, then try matching again.', 'この実演では共有の同意がありません。保存と共有を個別に承認してから、再度お試しください。')}</AppText> : null}
      <AppText variant="caption">{`${result.intent} · ${moduleName(result.module, ja)} · ${result.action}`}</AppText>
    </View> : null}
      </> },
      { id: 'scenarios', label: c('Scenario Selection', 'シナリオを選ぶ'), icon: 'layers', content: <>
    <View style={{gap:16}}> 
      <AppText>{c('Memories remain private. Student visits and helpers open existing screens. Family care reports keep their existing access rules; no chat or social summary is shared. Smart-home states are simulated and separate from recorded safety information.', '思い出は非公開のままです。訪問とお手伝いは既存画面に案内します。家族のケア報告へのアクセスは従来どおりで、会話や交流の要約を共有しません。スマートホームは模擬状態で、記録された安全情報とは別です。')}</AppText>
      {scenarios.map(([en, jp, text]) => <Button key={en} label={c(en, jp)} kind="secondary" onPress={() => { setLive(false); setDemo(demoScenario(newDemo(demo.persona), text)); }} />)}
      {!live && demo.result?.reply?.actions.map(id => <Button key={id} label={`${c('Open destination', '移動先を開く')}: ${ACTIONS[id].route}`} kind="secondary" onPress={() => router.push(ACTIONS[id].route)} />)}
    </View>
      </> },
      { id: 'events', label: c('Events', 'イベント'), icon: 'list', content: <>
        <Button label={c('Inspect app events', 'アプリのイベントを見る')} kind="secondary" selected={live} onPress={() => setLive(true)} />
        <Button label={c('Inspect demo events', 'デモのイベントを見る')} kind="secondary" selected={!live} onPress={() => setLive(false)} />
        <Fold title={c('Choose a recorded workflow', '実行記録を選ぶ')}>
          {!traces.length ? <AppText>{c('No app events yet.', 'まだイベントはありません。')}</AppText> : [...traces].reverse().map(t => <Button key={t.id} kind="secondary" selected={live && trace?.id === t.id} label={`${t.id} · ${moduleName(t.module, ja)} · ${t.permission}`} onPress={() => { setLive(true); setTraceId(t.id); }} />)}
        </Fold>
        {eventDetails}
      </> },
      { id: 'graph', label: c('Graph', 'グラフ'), icon: 'share-2', content: <>
        {events.length ? <AgentGraph events={events} current={current} selected={selected} onSelect={setSelected} ja={ja} /> : <AppText>{c('Start a workflow to see only the participating modules.', '操作を開始すると、関係するモジュールだけが表示されます。')}</AppText>}
        {eventDetails}
      </> },
      { id: 'replay', label: c('Replay', '再生'), icon: 'play-circle', content: <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <Button label={c('Replay events', 'イベントを再生')} kind="secondary" disabled={!events.length} onPress={replay} />
        <Button label={playing ? c('Pause', '一時停止') : c('Play', '再生')} kind="secondary" disabled={reducedMotion || cursor >= events.length - 1} onPress={() => setPlaying(p => !p)} />
        <Button label={c('Previous step', '前の手順')} kind="secondary" disabled={cursor === 0} onPress={() => { setPlaying(false); setCursor(n => n - 1); }} />
        <Button label={c('Next step', '次の手順')} kind="secondary" disabled={cursor >= events.length - 1} onPress={() => { setPlaying(false); setCursor(n => n + 1); }} />
      </View>
      {reducedMotion ? <AppText variant="caption">{c('Reduced motion: use Previous and Next to replay at your own pace.', '動きを減らしています。前・次のボタンで確認できます。')}</AppText> : null}
        {current ? <View accessibilityLiveRegion="polite" style={{ gap: 12 }}><AppText variant="bodyBold">{`${cursor + 1} / ${events.length} · ${moduleName(current.from, ja)} → ${moduleName(current.to, ja)}`}</AppText><AppText>{stepDescription(current.kind, ja)}</AppText></View> : null}
      </> },
    ]} />
    <Fold title={c('Options', 'オプション')} icon="sliders">
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      <Button label={c('Open KAKEHASHI', 'KAKEHASHIを開く')} kind="secondary" onPress={() => router.push('/her')} />
      <Button label={c('Reset demo', 'デモをリセット')} kind="secondary" onPress={() => { setDemo(newDemo(demo.persona)); setLive(false); setSelected(null); clearTraces(); }} />
      <Button label={c('Switch fictional persona', '架空の人物を切り替え')} kind="secondary" onPress={() => { setDemo(newDemo(demo.persona === 'tanaka' ? 'aiko' : 'tanaka')); setLive(false); }} />
    </View>
    </Fold>
    <Button label={c('Reading settings', '読みやすさの設定')} kind="secondary" onPress={()=>setReading(true)} />
    <ReadingSettings visible={reading} onClose={()=>setReading(false)} />
    <ConfirmationDialog visible={confirm} title={demo.phase === 6 ? c('Act as the fictional recipient?', '架空の相手として操作しますか？') : c('Send this fictional invitation?', '架空の招待を送信しますか？')}
      message={c('This changes only the isolated local demonstration. No person is contacted.', 'この独立したローカル実演だけが変更されます。実際の相手には連絡しません。')}
      confirmLabel={demo.phase === 6 ? c('Accept as Haru', '晴として承諾') : c('Confirm invitation', '招待を承認')} onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); advance(); }} />
  </ScreenFrame>;
}
