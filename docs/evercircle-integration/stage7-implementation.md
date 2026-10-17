# Stage 7 — orchestration and collaboration

Implemented 16 October 2026. Scope: deterministic local EverCircle assistance inside the existing KAKEHASHI application. No remote agent service, hardware, new account system, automatic booking, public sharing or family social-summary sharing.

## Architecture

`apps/mobile/src/evercircle/orchestrator/model.ts` defines a discriminated request union and one synchronous orchestrator. Results identify the recognized intent, selected module, permission outcome, performed/proposed/blocked action, structured events and a user-facing result. Companion results also include the existing bilingual reply/action model. Profile/social/home requests return their proposed next state; their existing providers own persistence and continue displaying storage failures. A performed mutation means applied locally, not remotely delivered or durably saved.

The seven logical modules reuse the Stage 4–6 business logic:

| Module | Existing service and integration |
| --- | --- |
| Personal Companion | `companion/engine.ts`; CompanionScreen routes supported messages through the orchestrator using current provider values, including after the reply delay. |
| Profile & Memory | `profile/model.ts`; provider changes go through orchestration. Detected interests remain pending; approved interests remain private until separately shared. Memory intent offers the existing Memories screen. |
| Friend Matching | `social/matching.ts`; orchestrated discovery and eligible companion requests invoke the same deterministic bilateral comparison. |
| Social Coordinator | `social/model.ts`; orchestrated actions create local recommendations/relationships/messages only after current checks. |
| Smart Home | `smartHome/model.ts` and `homeDemo/model.ts`; all persisted control/routine changes pass through orchestration. Commands remain exact, deterministic and mock-only. `my bedroom light` is accepted alongside `the bedroom light`. |
| Daily Assistance | Existing daily-summary adapter and local reminder reducer; read-only owner summaries return to chat, while local plan changes pass through orchestration. |
| Privacy & Safety | `privacy/permissions.ts`; real validation shared by orchestrator, matching, social reducer, profile sharing and device reducer. |

The External Fictional User Agent is a labelled local recipient role. Existing KAKEHASHI Services is a destination node, not a new autonomous agent.

## Privacy and confirmation

Central functions include `canShareInterest`, `canParticipateInMatching`, `canSendInvitation`, `canSendMessage`, `canAccessMemory`, `canPerformDeviceAction` and `sanitizeAgentPayload`. Existing matching exports delegate to these rules. Direct invitation and acceptance reducer calls require `confirmed: true`; the existing social confirmation dialog supplies it only on confirmation. The reducer still checks active actor, bilateral blocks, current consent, relationship direction and storage health. Withdrawal and blocking remain available under the earlier documented failure rules.

Memory navigation is owner/household scoped. No memory, household bundle, conversation, student note or family report enters matching. Matching summaries retain Stage 5's approved-field allowlist. Accepted messaging retains Stage 5's deliberate behavior: opting out of new matching does not cancel an accepted friendship; blocking does close messaging.

Device requests reject a cross-household request or any unknown/malformed entry before applying any part of a batch. Existing recorded home-safety information remains distinct from local simulated states. There is no door lock or sensitive hardware interface.

The event journal accepts only fixed module/step codes and allowlisted boolean/count metadata. It retains at most 60 transient workflows and excludes raw input, names, memories, messages, reminder titles and state snapshots. Only the developer screen subscribes, so a journal update does not rerender the app. A reload clears the journal. It is local prototype instrumentation, not an audit record or authentication boundary.

## Product integration

Companion offers Memories for item stories, the existing help-request workflow for belongings or helpers, My Day for student visits and today's plans, Friends after consent, and My Home for recorded safety information. It executes supported mock device commands through the existing home adapter. Unsupported requests do not mutate anything. Navigation remains an explicit button choice. The existing family report screens and their access behavior remain intact. No optional social-summary sharing was introduced.

## Developer presentation

Route: `/developer/agents`. It has no older-adult navigation entry. Development builds enable it; exported presentation builds require `EXPO_PUBLIC_EVERCIRCLE_DEVELOPER=1`. This build flag is not authentication and must not be treated as such. The screen is lazy-loaded; Expo emits a separate developer bundle. It reuses installed React Native SVG and shared controls, with no new package dependency.

The panel runs isolated in-memory demonstration state through the same orchestrator and reducers. Reset and persona switching affect this sandbox only, not household/profile/social/device storage. Narrator choices are explicitly fictional labels, not secure account switching. The friendship demo uses separate buttons for recognizing gardening, privately saving it, approving sharing of name and gardening, comparing eligible profiles, preparing an invitation, confirming it, and simulating recipient acceptance through another explicit dialog. No real person receives anything.

The blocked scenario starts without sharing consent and stops before matching. Its graph includes the blocked destination so the red dashed transition can explain where execution stopped; the destination was not invoked. Only workflow participants are shown. Selecting a node exposes its recorded transitions. Replay, previous/next, timed play and pause read events without re-running business logic. Reduced motion disables pulses and autoplay. Narrow/enlarged layouts use full-width graph nodes; desktop uses graph and detail columns.

The app-event mode inspects recent real application orchestration in the same SPA session. It distinguishes those workflows from the isolated demonstration. The app's own storage-error notices remain authoritative about persistence. No chat transcript is exposed by either mode.

To open the panel, run the existing Expo development server and visit `/developer/agents`. For an exported presentation build on PowerShell:

```powershell
$env:EXPO_PUBLIC_EVERCIRCLE_DEVELOPER = '1'
npm.cmd run build:web -w apps/mobile
```

Use the application's normal API URL configuration. The `same-origin` URL used in verification belongs to the disposable fixture host. Leave the developer flag unset for ordinary production exports.

## Verification

- `node apps/mobile/scripts/verify-orchestrator.cjs`: 13 groups covering routing, permission/confirmation gates, direct reducer bypass attempts, module invocation, exact event sequence for denial, data boundaries, scope checks, recipient direction, and deterministic reset/replay.
- Existing companion/profile, social and home domain suites: 12, 14 and 11 groups. Social fixtures now explicitly mark confirmed invitations/acceptances; separate Stage 7 tests verify absence of confirmation is rejected.
- Mobile and server TypeScript checks and shared contrast checks are recorded in the completion log below.
- `verify-stage7.cjs`: disposable fixture server and dedicated Chrome; 32 layout cases (EN/JA, 320/390/768/1440, Normal/Extra Large with high contrast in enlarged cases), plus nine functional groups. Checks confirmation cancellation, acceptance, local-demo storage isolation, blocked behavior, replay, node inspection, integration scenarios, actual companion events and timed pause.
- Stage 4's old friend-response assertion is updated to the newly required permission denial after profile consent is absent. Existing navigation assertions remain.

Initial browser run: 32 cases, nine groups, zero measured overflow/undersized controls and zero uncaught exceptions. Its screenshots revealed awkward English wrapping in narrow enlarged graph nodes. One correction batch uses full-width nodes in that case, differentiates saved/shared event descriptions and gives specific companion denial reasons. Final verification and independent review are recorded in `progress.md` and `stage7-review.md`.

The corrected Stage 7 browser run also passed all 32 cases and nine groups. Existing Stage 4 and 5 interactions passed nine and seven groups. Stage 6 exposed an unsupported-fallback routing regression for curtain commands; restricting the fallback to the companion module and adding fan/curtain cases corrected it. The subsequent typecheck, domain suite and export pass, followed by all nine Stage 6 and 15 Stage 3 browser groups. Stage 2's unchanged rerun completed six groups and ten route checks without exceptions; its first-run audio play/pause AbortError and the expired execution handle on the successful rerun are explicitly recorded in `progress.md`. Native/provider certification is outside these checks.

Independent review disposition: **ship**, local Expo Web prototype scope. The design-system comparison is complete in `stage7-design-check.md`; canonical product/design files are preserved. Stage 7 is finished; no later-stage work is included.

## Limits

Verification targets local Expo Web with disposable fixtures, not real providers, native devices, VoiceOver/TalkBack, native persistence, physical microphones or hardware. Local storage and persona switching are not secure identity or encrypted storage. No dependency installation, backend/API schema change, public message, deployment or later-stage work is part of this stage. Existing Stage 6 provider and simultaneous-tab limitations remain.
