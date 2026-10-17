# Stage 4 independent finish review

## Disposition

**fix** — one material privacy/consent wording mismatch must be resolved. The implementation and supplied Expo Web evidence support the intended local demonstration, but the storage explanation promises a narrower retention boundary than the code implements. This is a full review of the supplied Stage 4 source and evidence, not native release approval.

## Evidence reviewed

- Read the Stage 4 request and handoff, `apps/mobile/PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, and `.impeccable/surfaces/companion.md`. Read Impeccable `reference/new-work.md` finish rules, `craft-floor.md`, `ios.md`, and `android.md`.
- Read all `src/evercircle/` modules, the companion/profile/privacy route wrappers and older-adult layout, `src/her/Screens.tsx`, `src/her/HerPage.tsx`, relevant EN/JA strings in `src/i18n.tsx`, and shared text, controls, cards, frame, preferences, and confirmation-dialog implementations.
- Opened every one of the 24 supplied PNGs individually: `stage4-{companion,profile,privacy}-{en,ja}-{390,1440}.png` (12), `stage4-conversation-{en,ja}-{390,1440}.png` (4), and `stage4-{profile,privacy}-populated-{en,ja}-{390,1440}.png` (8), all under `apps/mobile/.impeccable/review/`. All show the named route/language/state, loaded content, and the expected 900-pixel viewport. Initial and populated shots begin at the top; conversation shots intentionally begin at the latest reply. No blank, loading, or mislabeled capture was found.
- Inspected `stage4-layouts.json` (48 initial layouts) and `stage4-verification.json` (60 total layouts, eight passing interaction groups, zero exceptions/failures, zero recorded small-target/overflow violations). The matrix includes EN/JA, normal/Extra Large reading modes, and widths 320/390/768/1440; populated/conversation evidence adds 12 layouts. The handoff explains that the final run resumed interaction checks after a hidden inactive-route input selector failed in the harness.
- Received, rather than independently reran, the reported 11-group source verification, mobile/server typechecks, web export (1031 modules; `entry-356d12e7a0178dc446c1462b82f13007`), 30 contrast checks, 15 earlier-role Stage 3 interaction groups, and the later six-scenario Stage 2 interaction pass with empty/legacy smokes and zero exceptions. The handoff notes that Stage 2's obsolete coming-soon assertion was updated for scripted-demo availability. The one reported detector result was `[]`; its HTML/CSS regex scope supplies no native verdict. No browser or detector was launched in this review.

## Contract and floor assessment

The three routes extend the established Operate surface coherently. Ivory/white/sage, deep-green actions, shared typography, labelled controls, readable spacing, familiar older-adult navigation, and EN/JA wrapping remain consistent with the incumbent system. This is an ordinary code-led extension: no approved comp or world board exists, and no comp-fidelity claim is made. Canonical product/design artifacts were not changed by this reviewer.

The companion is explicitly a scripted demonstration. Speaker labels and distinct turn surfaces provide orientation; the composer remains visible and generous. At 390 pixels with Extra Large text and high contrast, the fixed composer and two-row navigation leave a smaller conversation window, but the captures show a functioning vertical scroll area. The welcome and later replies continue below that window rather than clipping inside fixed-height text containers. Optional starters follow the initial welcome and collapse after conversation begins. These facts support the supplied web scope without requiring a composition rebuild.

Interest normalization is deterministic and produces separate gardening/orchid candidates. Remember and Not now are separate, named actions. Approved interests start with matching permission off; the master permission and per-interest permission are independently required. Editing revokes the old grant, deleting removes eligibility, and matching is derived at use time. Failed persistence pauses the preview rather than presenting stale eligibility. These behaviors are supported by source and the recorded interaction groups.

The private profile extends Michiko Tanaka / `tanaka`, supports edits/deletion and optional structured preferences, and does not publish on save. The companion context bridge returns only the allowlisted resident name and next planned visit date, with a household identity guard. Transcripts remain in memory and outside serialized state and the matching summary. No AI service, matching backend, device action, or transcript-sharing implementation was found in this feature. Existing memory/help/day/friend destinations navigate to incumbent workflows; the replies correctly say those actions still need the user's choice there.

Shared controls provide wrapping labels, generous target minima, focus treatment, busy/disabled states, live feedback, confirmation semantics, and app reading-preference scaling while allowing OS font scaling. Source preserves the shared reduced-motion rule and existing cross-role preference system. The supplied contrast and layout checks support the measured web states. Native platform behavior remains unverified as detailed below.

## Material findings with specific fixes

| ID | Severity | Finding and evidence | Required fix and acceptance evidence |
| --- | --- | --- | --- |
| S4-1 | High | **The privacy explanation says unapproved interests are not stored, but they are.** `src/i18n.tsx:9` and `:793` say only approved interests and explicitly saved profile details are stored on the device. Both privacy captures visibly repeat this promise. In fact, `store.tsx:58` dispatches `suggest` immediately after recognition, `store.tsx:42` persists every resulting state, `profile/model.ts:17` includes `pending` in saved state, and `model.ts:51` restores those IDs on reload. Both storage adapters serialize the whole state. A person can therefore submit an interest, leave Remember untouched, and retain that normalized interest across reload. The pending prompt also asks whether to save something already retained as a suggestion. Approved-profile membership and matching consent remain gated; this finding concerns truthful local retention and the meaning of Remember. | Resolve the retention boundary consistently in EN and JA. The simplest consent-preserving fix is to keep pending candidates session-only, omit/clear pending IDs in persisted and hydrated state, and persist an interest only after Remember; Not now and clear-chat must still remove candidates. If pending retention is intentionally kept, explicitly disclose before submission that normalized suggestion labels are retained locally before approval, update both `cPrivacyShort` translations and pending approval wording to distinguish retaining a suggestion from adding an approved profile interest, and name how to dismiss/clear them. Do not weaken the separate matching gates. Add or update a focused storage/reload assertion for the selected boundary, rebuild, and recapture the same supplied viewport/state set so the changed EN/JA text can be scored. |

No other material finding was established within the reviewed source and supplied evidence. This statement is bounded by the verification limits, especially the controls that fall below the captured top viewport.

## Verification limits

These are Expo Web browser captures, not iOS Simulator or Android emulator captures. They cannot certify safe-area/IME behavior, physical touch posture, system Back/edge-swipe gestures, native text metrics, OS font scaling, VoiceOver/TalkBack, or hardware performance. Native dark appearance and native reading-preference persistence remain existing documented limitations; neither is silently approved here. The iOS and Android references require platform captures and scaling/appearance checks before native release claims.

The compact populated-profile edit/delete controls, pending Remember/Not now controls, lower privacy controls, profile option groups, and dialogs are not all visible in these 900-pixel top/latest-reply captures. Their functionality and reachability have source and workflow-assertion support, but their complete rendered/focused appearance was not independently inspected. The review does not convert the matrix's DOM measurements into screen-reader validation.

Interaction evidence uses an in-memory fictional household fixture and does not demonstrate mutation against a real server. Earlier-role preservation is supported by the reported Stage 3 suite and the inspected integration seams, not a new exhaustive visual review of every earlier screen. Automated results are identified as received evidence where they were not rerun. Only this review document was written.

## Final verdict pass — S4-1 only

### Disposition

**ship** — S4-1 is **resolved**. This verdict scores the single material fix from the initial full review above. The initial `fix` disposition and its evidence remain historical; this is not a second full-surface review or native release approval.

### Evidence reviewed

Inspected `profile/model.ts:40`–`:54`, both storage adapters, the focused `verify-evercircle.cjs` serialization/hydration test, the browser storage/reload assertions in `verify-stage4.cjs`, and the refreshed `stage4-verification.json`. Both adapters now use `serializeSaved`, which serializes an empty pending list. Hydration discards legacy pending IDs. The focused test verifies that in-memory candidates still exist for approval, their values are absent from serialized output, legacy candidates do not hydrate, and Remember persists the approved choice with matching permission false.

The final browser evidence records 60 matrices, nine passing interaction groups, zero failures/exceptions, and no recorded small-target or overflow violations. The added group verifies that an unapproved orchid suggestion is visible in the session, absent from saved candidate/profile data before Remember, and absent after reload. Existing approval, Not now, permission, edit/delete, failed-write revocation, and profile persistence groups remain passing.

Opened eight refreshed captures relevant to the finding: all four `stage4-privacy-{en,ja}-{390,1440}.png` and all four `stage4-conversation-{en,ja}-{390,1440}.png`. They remain valid at their named top/latest-reply positions and show the unchanged EN/JA retention/approval explanation. The build handoff reports all 24 original paths recaptured and opened against final source, with no subsequent app edits. Received final source-suite success (12 groups), mobile typecheck success, and rebuilt web export success (1031 modules; `entry-c5c043ee81bfab2c95a68e7899607872.js`); these commands were not independently rerun in this verdict pass.

### Contract and floor assessment

The chosen fix changes the retention boundary to match the existing explanation, preserving the approved design and visible action wording. Pending suggestions remain available during the session, while persisted interest values require Remember. Remember continues to create a private approved interest; matching consent remains independent. No UI/copy change requires a new visual direction.

### Material-fix score

| Finding | Score | Reason |
| --- | --- | --- |
| S4-1: privacy explanation contradicted by persisted unapproved interest IDs | **Resolved** | Both native and web writes strip pending candidate values, hydration ignores legacy candidates, and focused source/browser assertions demonstrate the before-approval and after-reload boundary while preserving explicit approval and private persistence. |

### Verification limits

This pass assessed S4-1 only and opened the eight refreshed captures directly relevant to it. It did not reopen the broader surface for new findings. The initial review's Expo Web, native-device, screen-reader, below-fold, and fixture limitations still apply. Source inspection confirms the native adapter uses the same serializer; native filesystem behavior was not executed on a device. No browser session or second detector was launched. Only this review document was modified.
