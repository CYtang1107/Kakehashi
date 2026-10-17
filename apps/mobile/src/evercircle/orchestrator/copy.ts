import type { Module, Step } from './model';
const modules: Record<Module, [string, string]> = {
  orchestrator: ['Central Orchestrator', '中央オーケストレーター'], companion: ['Personal Companion', '会話のパートナー'],
  profile: ['Profile & Memory', 'プロフィールと思い出'], privacy: ['Privacy & Safety', 'プライバシーと安全'],
  matching: ['Friend Matching', '友達のマッチング'], social: ['Social Coordinator', '交流コーディネーター'],
  external: ['External Fictional User Agent', '架空の相手のエージェント'], home: ['Smart Home', 'スマートホーム'],
  daily: ['Daily Assistance', '毎日のサポート'], kakehashi: ['Existing KAKEHASHI Services', '既存のKAKEHASHI機能'],
};
const steps: Record<Step, [string, string]> = {
  recognized: ['Companion recognized a supported intent.', '会話から対応できる目的を認識しました。'],
  permission: ['Privacy checked current permissions.', '現在の許可を確認しました。'],
  blocked: ['Stopped before the requested action. Review consent and access settings to continue.', '操作前に停止しました。続けるには同意とアクセス設定を確認してください。'],
  approvalRequested: ['Waiting for an explicit decision.', '明示的な承認を待っています。'],
  profileUpdated: ['The local profile decision was applied.', 'ローカルのプロフィールに選択を反映しました。'],
  savedPrivately: ['The user approved saving the interest privately.', '利用者が趣味の非公開保存を承認しました。'],
  sharingApproved: ['The user approved sharing the saved interest for matching.', '利用者が保存済みの趣味を友達探しに共有することを承認しました。'],
  sharingRevoked: ['The interest is not shared for matching.', 'この趣味は友達探しに共有されません。'],
  compared: ['Matching compared eligible, consented profiles only.', '同意があり条件を満たすプロフィールのみ比較しました。'],
  recommended: ['Social Coordinator prepared the eligible recommendations.', '交流コーディネーターが候補を用意しました。'],
  socialUpdated: ['The local social decision was applied.', 'ローカルの交流設定に選択を反映しました。'],
  invited: ['A confirmed invitation was created locally.', '承認された招待をローカルに作成しました。'],
  accepted: ['The fictional recipient accepted the invitation.', '架空の相手が招待を承諾しました。'],
  deviceUpdated: ['The simulated device request was processed.', '模擬デバイスの操作を処理しました。'],
  dayUpdated: ['The local daily plan was updated.', 'ローカルの予定を更新しました。'],
  proposed: ['Prepared a response or an existing KAKEHASHI destination.', '返答または既存のKAKEHASHI画面への案内を用意しました。'],
  unsupported: ['This request is not supported.', 'このリクエストには対応していません。'],
};
export const moduleName = (id: Module, ja: boolean) => modules[id][ja ? 1 : 0];
export const stepDescription = (id: Step, ja: boolean) => steps[id][ja ? 1 : 0];
