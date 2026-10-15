# EverCircle integration and frontend roadmap

Stage 0 assessment, 15 October 2026. **All paths and behavior below are proposals; nothing is implemented.** This plan keeps EverCircle inside KAKEHASHI's Expo application and preserves the [existing feature checklist](feature-inventory.md#preservation-acceptance-checklist-for-later-implementation). No Vite replacement, separate project, provider key, or real device action is required for the frontend demonstration.

## Architectural decisions

1. Retain the npm workspace, Expo Router and Express host. Add modules to `apps/mobile/src/features/evercircle` and routes inside the existing `app` tree.
2. Improve shared UI through compatible exports in `src/ui.tsx` and `src/theme.ts`. Keep role routes and existing DTOs stable while migrating screens in small batches.
3. Use a **module-scoped reducer/context** for EverCircle domain state, component state for drafts/focus, and the existing DataProvider for legacy server state. No Redux/Zustand/query dependency is justified initially.
4. A read-only selector bridge may expose visits, approved-source candidates, rooms and accepted activities to new modules. It must never pass the complete HomeBundle, precise places, private field notes, recordings or family data to matching or an AI provider automatically.
5. Start with **explicit simulation mode**, deterministic synthetic fixtures and cancellable typed adapters. Do not label a scripted conversation, matching trace or device event as live AI/device data.
6. Keep existing Claude report/estimate adapters independent. Real companion/matching capabilities get a narrow server API later, after identity, scoped consent and storage gates; the client never contains a provider secret.
7. Separate friendly companionship UI from technical collaboration detail. Older adults should understand the proposed action and choice without inspecting agent internals.

The application purpose is an Operate interface: clear tasks, readable text, visible names, senior autonomy. The older rule that AI does not speak to her must be revised deliberately before direct companion activation. Family/student observations cannot silently become her approved profile.

## Navigation proposal

Keep `/her` as the stable older-adult home. Introduce one new labelled EverCircle entry plus clear Today/help/visitor information. Its own destinations use a nested Stack initially, with persistent Home/Back and task-specific action controls; assess 3–5 top-level sections in user testing before adopting senior tabs. Do not create eight new global tabs or add hidden child screens to the family/student Tabs layouts.

| Route | Physical file proposed | Purpose / access |
| --- | --- | --- |
| `/her` (update) | `app/her/index.tsx` | Senior Today: visits/weather, coming helpers, request help and visible EverCircle entry. Existing behavior remains. |
| `/her/evercircle` (new) | `app/her/evercircle/index.tsx` | Friendly hub with Talk, People, Home and Daily assistance; approved-profile/privacy links |
| `/her/evercircle/companion` | `app/her/evercircle/companion.tsx` | AI-labelled conversation, text-first; explicit optional voice later |
| `/her/evercircle/profile` | `app/her/evercircle/profile.tsx` | Review/edit approved interests, boundaries and memory candidates; reject/withdraw |
| `/her/evercircle/matching` | `app/her/evercircle/matching.tsx` | Simple matching status and proposed introduction, explanation and Not now |
| `/her/evercircle/friends` | `app/her/evercircle/friends/index.tsx` | Approved contacts, pending introductions and blocked state |
| `/her/evercircle/friends/:id` | `app/her/evercircle/friends/[id].tsx` | Minimal permitted contact detail; no address or private memories |
| `/her/evercircle/communities` | `app/her/evercircle/communities/index.tsx` | Community discovery and existing accepted activities |
| `/her/evercircle/communities/:id` | `app/her/evercircle/communities/[id].tsx` | Participation review; link to existing activity workflow, do not auto-join |
| `/her/evercircle/home` | `app/her/evercircle/home.tsx` | Smart Home Simulation, accessible device/event list, optional existing room renderer |
| `/her/evercircle/assistance` | `app/her/evercircle/assistance.tsx` | Today/reminders and user-reviewed help/activity suggestions |
| `/her/evercircle/privacy` | `app/her/evercircle/privacy.tsx` | Purpose-specific consent, pause matching, memory visibility/deletion, block/report |
| `/evercircle/agents` | `app/evercircle/agents.tsx` | Optional technical simulation/event timeline; minimal summaries, no raw conversations/profile data |
| `/family/evercircle` | `app/family/evercircle.tsx` | Later optional consented overview, not private chat access |
| `/student/evercircle` | `app/student/evercircle.tsx` | Later supervised candidate review/support, no authority to impersonate the senior |

Add `app/her/evercircle/_layout.tsx` and `app/evercircle/_layout.tsx` for stack options and error containment. Family/student optional routes must be explicitly registered with `href: null` in their existing Tabs layouts if added there; link them from appropriate cards. Keep all four current tabs. The technical view remains outside the senior destination hierarchy, reached only through a labelled optional link. `/worker`, `/stories` and `/item/[id]` remain unchanged URLs. No public EverCircle profile feed is proposed.

## Folder and module boundaries

```text
apps/mobile/
  app/                         existing Expo routes + thin new wrappers
  src/
    ui.tsx                     compatible legacy exports
    theme.ts                   existing aliases + semantic tokens
    design-system/
      AppText.tsx              scalable named text roles
      ScreenFrame.tsx          data-independent safe-area/responsive frame
      StateNotice.tsx          readable loading/error/success/retry
      ConfirmationSheet.tsx    accessible concrete review/confirm/cancel
    features/evercircle/
      EverCircleProvider.tsx
      reducer.ts
      selectors.ts
      legacyBridge.ts          explicit read-only candidate selectors
      consent.ts               shared purpose/visibility checks
      services/
        contracts.ts           typed request/result/adapter interfaces
        simulation.ts          deterministic cancellable operations
        server.ts              added only when real endpoints exist
      fixtures/demo.ts         invented people/profile/conversations/devices
      companion/CompanionScreen.tsx
      profile/ProfileScreen.tsx
      matching/MatchingScreen.tsx
      friends/FriendsScreen.tsx
      friends/FriendScreen.tsx
      communities/CommunitiesScreen.tsx
      communities/CommunityScreen.tsx
      home/SmartHomeScreen.tsx
      assistance/AssistanceScreen.tsx
      privacy/PrivacyScreen.tsx
      agents/AgentTimelineScreen.tsx
      components/              only controls that recur in these features
packages/shared/
  index.ts                     legacy contracts kept; additive re-export later
  evercircle.ts                additive DTOs only when module contracts settle
apps/server/src/evercircle/     optional later server implementation
```

Do not create speculative service folders, empty routes or placeholders in Stage 1. Feature files appear when their stage needs them. Thin route files import feature screens; domain logic stays outside routing. Shared types move to `packages/shared/evercircle.ts` when client/server or multiple modules need stable contracts, with additive exports from `index.ts`; do not add required fields to Home/Item/HomeBundle.

## Required capability design

| Module | Behavior/state | Existing reuse | Simulation and real-service boundary |
| --- | --- | --- | --- |
| AI Companion | Conversation states idle/sending/responding/error/stopped; clear AI identity; explicit turn cancel; optional read aloud later | App language/text/buttons; approved story links, not automatic recording ingestion | Scripted bilingual text for demo; real turn via server with budget, timeout, safety filtering, consent and cancellation. Voice permission is separate; expo-audio playback/recording does not provide STT/TTS by itself. |
| Approved Profile & Memory | Candidate → approved/rejected → withdrawn; field/memory provenance, purpose and visibility; editable interests/communication preferences | `seniorInterests`, item story/photo source links after selected preview | Synthetic approved profile first. Legacy stories become private candidate copies only after explicit review; source edits invalidate approval of changed text. Never present inferred feelings/history as facts. |
| Agent-to-Agent Social Matching | Opt-in request → summarized compatible candidates → senior review → both-person acceptance → introduction; Not now, cancel, pause, block/report | Shared interest/activity terminology and visible consent patterns | Two invented agents exchange allowlisted summaries in simulation. Real remote agents receive no raw profile/history; authenticated consent checks on every exchange; no agent can send an introduction unapproved. |
| Friends & Communities | Pending/accepted/declined/blocked relationships; minimal contact DTO; community review | Existing CommunityActivity listings/status and outing entry points | Demonstration friends are invented; actual activities remain legacy records. Friends are not public story commenters or checked helpers by default. Real accounts/invitations require identity and both-party approval. |
| Smart Home Simulation | Separate room/device/event state, scenario/reset and simulated switch actions; accessible list first | Shared room coordinates, optional Home3D/FloorPlan | No MQTT/HomeKit/real device calls. Turning on a simulated light does not mark `SafetyFix` done; scenario reset does not call `/api/reset`. Real device control is outside this initial roadmap. |
| Daily Assistance | Reminder draft/scheduled/done/dismissed; visits, accepted activities, help/weather summaries; a reviewable action intent | WeatherNote, visits/calls and existing helper request flow | In-app demo reminders only, no background notification claims. Real scheduling/notifications need an explicit later adapter/permission decision. No automatic bookings, location sessions, payments or medication decisions. |
| Privacy & Safety | Separate companion, memory storage, matching, optional voice and family-sharing purposes; revocation, pause, deletion, block/report | Existing explicit consent vocabulary; not existing recording boolean | Default off for new purposes. Local demo actions labelled as such; real deletion/revocation requires server confirmation and downstream invalidation. Family overview is opt-in, never private chat by default. |
| Agent Collaboration Visualization | Ordered sanitized events, operation/status/actor/purpose/timestamp; list plus optional diagram | Existing timeline/story/custody presentation patterns | Synthetic trace clearly labelled; real trace must be emitted from actual service operations, not invented. No raw chain-of-thought, private memory text or secrets. Show operation explanations, not hidden model reasoning. |

## State ownership, consent and integration

Mount `EverCircleProvider` once inside the root I18n/Data providers when Stage 2 starts, with an inert initializer (no network, legacy mutation or heavy fixtures until entered). This supports shared state across senior and optional technical views without a second global data model. Use separate state/actions contexts or narrow child providers to keep chat updates from rerendering unrelated legacy screens. Screens use ScreenFrame rather than the HomeBundle-gated Screen. Add a feature-local error boundary so new visualizations cannot crash the role picker or help screen.

| State | Owner / persistence |
| --- | --- |
| HomeBundle, item mutations, visits/fixes/services | Existing DataProvider and API remain authoritative; new modules read through explicit selectors |
| Navigation, input drafts, modal focus, selected view | Screen-local; protect meaningful drafts during route/fold unmount; no automatic backend writes |
| Demo profile/approved memories, relationships, simulated devices/reminders | EverCircle reducer in memory, schema version and demo household ID; discarded on reset/reload unless explicit synthetic-only demo persistence is added |
| Request status, operation ID, cancel and last result | Feature service layer; ignore stale request IDs after cancel, household/language/consent change |
| Real conversation/profile/consent/relationships | Later authenticated server store with scoped DTOs, versioned migrations and deletion receipts; not legacy localStorage or the reseeding JSON store |
| Language | Existing I18nProvider; add native preference persistence only as a separate justified implementation decision |
| Technical trace | Bounded sanitized event buffer; no raw messages or source payloads; real event retention separately agreed |

No new personal information should be written to browser localStorage for convenience. For a frontend demo, fixtures are explicitly synthetic, while selected legacy-source candidates stay in session memory. Real durable memories require an appropriate server/native secure-storage policy; do not install storage dependencies until that policy demands them.

Consent model: purpose, granted/declined/revoked state, subject, timestamp, approved scope/content revision and provenance. Default all new purposes off. Private approval for companion use is distinct from approval for matching and distinct from sharing a specific introduction. Recording consent is not AI consent. Matching selects an allowlist of approved interests/communication preferences and coarse area only if approved; exclude phone/address, finances, safety/health observations, private voices/photos, field notes and family wishes. Server must recheck consent/content revision before sending or storing a real operation. Revocation cancels pending work, invalidates outstanding offers and cached summaries, and schedules/records downstream deletion; UI must not claim remote deletion until confirmed.

Matching and reminders produce action intents. A user-reviewed intent can navigate into the current help/activity flow. It cannot call checkout, bookHelp, shareStory, startOuting, sendReport or payout on an agent's own authority. A simulated operation must never hit one of those endpoints. Preserve human read/approval for reports/letters.

## Frontend design-system strategy

Preserve KAKEHASHI naming, product truth, decision meanings and visit/memory identity. Stage 1 captures the product/design brief; the full redesign then makes senior readability the governing criterion. Use semantic colors (surface/text/secondary/action/status/focus), named typography, 4/8-based spacing, consistent radii and control size. Keep current `colors`, `fonts`, `type`, `decisionColor`, `roomColor` and `yen` exports as compatibility aliases.

Primary older-adult controls target 56–64 height with 18–20 labels; cross-platform minimum 48 effective target and clear spacing. Supporting text targets 16–18, headings 24–32, no safety/consent meaning relegated to tiny badges. Preserve font scaling and wrap rather than reducing text to fit. Use display typography sparingly, readable bilingual body fonts with fallback, and investigate direct imports to reduce exported unused weights. WCAG principles and sizing distinctions are linked in [uiux-audit.md](uiux-audit.md#standards-used).

Expose visible icon labels, heading roles, input names/description/error, checkbox/radio states, busy states, stable fold triggers, non-color status cues and localized confirmation. Content should explain the action/outcome in plain English/Japanese. Keep developer diagnostics out of senior-facing error copy; provide a readable retry path, with optional diagnostics for support. Web needs deliberate keyboard focus/landmarks/modals; native needs safe areas, IME, VoiceOver/TalkBack and motion preferences. Do not impose a generic HTML/CSS component library on native screens.

Reuse Columns for larger role/task screens after short-height/large-font tests. Older-adult Today should remain a readable single task sequence on compact widths; expanded layouts must preserve reading priority. Heavy 3D/globe is optional and never required for task completion. Light/high-contrast presentation comes first; dark mode requires its own tokens/validation instead of recoloring the existing night band.

## Stage-by-stage modification plan

### Stage 0 — audit and planning (this delivery)

Only the five documents in this directory. Compiler/contrast/export checks, source inventory and measured export sizes. Stop here; no source changes or AI functionality.

### Stage 1 — design foundation and older-adult pilot

Goal: accessible common primitives and improved `/her`, with all existing actions preserved. **No new EverCircle route, provider, shared DTO or server endpoint in this stage.** Exact proposed file set:

| Action | Exact repository-relative path | Purpose |
| --- | --- | --- |
| Add | `apps/mobile/PRODUCT.md` | Capture confirmed product truth/personas/senior consent rules from brief and audit |
| Add | `apps/mobile/DESIGN.md` | Record proposed elderly-friendly design direction, native/web acceptance criteria and tokens |
| Add | `apps/mobile/src/design-system/AppText.tsx` | Named scalable bilingual typography roles |
| Add | `apps/mobile/src/design-system/ScreenFrame.tsx` | Data-independent safe-area/keyboard/responsive frame with accessible headings |
| Add | `apps/mobile/src/design-system/StateNotice.tsx` | Persistent loading/error/success/retry and status announcement |
| Add | `apps/mobile/src/design-system/ConfirmationSheet.tsx` | Concrete review, named confirm/cancel and tested modal focus/insets |
| Update | `apps/mobile/src/theme.ts` | Semantic size/spacing/focus/status tokens, compatible aliases, open-status contrast token |
| Update | `apps/mobile/src/ui.tsx` | Compatible shared control sizing, names/states/wrapping, stable Fold and input associations; compose frame where safe |
| Update | `apps/mobile/src/i18n.tsx` | Bilingual accessibility, action/error/empty/review copy; no AI copy activation |
| Update | `apps/mobile/app/_layout.tsx` | Font loading fallback/direct-import investigation and deliberate web focus/scrollbar behavior |
| Update | `apps/mobile/app/her/index.tsx` | Elderly-friendly existing Today/help layout, empty/error/pending handling and readable visitor safety information |
| Update | `apps/mobile/app/family/_layout.tsx` | Readable scalable tab labels without changing four destinations |
| Update | `apps/mobile/app/student/_layout.tsx` | Same compatibility treatment for student tabs |
| Update | `apps/mobile/src/Services.tsx` | Switch open-status colors to tested semantic token only; preserve service operations/layout until Stage 3 |
| Update | `apps/mobile/scripts/check-contrast.ts` | Cover status/focus/input-boundary pairs in addition to current 17 pairs |
| Update | `docs/evercircle-integration/progress.md` | Record Stage 1 implementation and real check results |
| Update | `docs/evercircle-integration/uiux-audit.md` | Mark findings verified/resolved; retain original baseline |

No manifest, lockfile, Expo configuration, `data.tsx`, `api.ts`, shared types or server file is proposed for Stage 1. The new ConfirmationSheet supplies a reusable contract; do not add unnecessary confirmations to the help flow. If direct font imports are unsupported by installed packages, retain current imports and report the measured limitation rather than add dependencies. New components must earn their role by use in the pilot/shared UI.

Stage 1 gate: both workspace type checks, expanded contrast and web export; all existing routes smoke-tested because shared UI changed; older-adult request/rating happy/error paths; English/Japanese; native large text, insets, permission-independent navigation and VoiceOver/TalkBack; browser keyboard/focus/zoom and narrow/wide/short-height layouts. Device/browser checks are explicit outstanding work if tooling is unavailable. Do not infer regression safety from a compiler alone.

### Stage 2 — isolated EverCircle frontend simulation

Add the new senior/technical route wrappers/layouts, module provider/reducer/selectors/consent/bridge, service contracts/simulation and synthetic fixtures/screens shown above. Update root layout for the inert provider, `/her` for a single entry, and i18n for new keys. Stabilize module DTOs before optionally adding `packages/shared/evercircle.ts`/an additive index export. No server change.

Gate: all eight capabilities demonstrate only labelled synthetic outcomes; approval/rejection/revocation/cancellation and both-party introduction states work; no real device/network/provider calls; no mutation of legacy records from simulations; turning off the feature leaves existing routes usable. Add focused reducer/service tests for privacy boundaries, stale async responses and approval transitions using an agreed test harness; test dependencies are a deliberate later decision, not part of Stage 0/1.

### Stage 3 — complete frontend migration by role/task

Migrate family `index/house/reports/plan`, then student `index/add/team/wallet`, helper `worker/index`, item `[id]`, and public `stories/index`. Update corresponding `Community`, `Services`, `SaferHome`, `HouseFuture`, `Handover`, `Touchpoints`, `StoryShare`, `PhotoCarousel`, `Audio`, `Outing`, `Weather`, `VisitThread`, `NeighbourhoodMap`, `TrackMap`, `FloorPlan`, `Home3D`, `StoryGlobe`, and UI/i18n as each screen batch requires. Preserve `PixelIcon`/art and journey semantics.

Server-only HTML presentation updates in `mapPage.ts`, `trackPage.ts`, and the letter/payment templates in `index.ts` are justified for map keyboard semantics, labels and contrast/translation. These are UI-hosting adjustments; keep business/API behavior stable. Specific letter-state hardening is a separate behavior change with dedicated tests, not hidden in a cosmetic edit. Every batch must pass its relevant preservation checks; do not ship a redesign that removes optional existing tasks.

### Stage 4 — optional real companion and durable private memory

Prerequisites: authenticated senior/family/student roles, household-scoped data and media access, separate consent receipts, schema-version migrations that do not reseed real data, durable retention/deletion policy and operation audit. Resolve legacy JSON reseeding/access/letter-transition gaps before storing real sensitive data.

Add `apps/server/src/evercircle/index.ts`, `contracts.ts`, `store.ts`, `consent.ts`, `companion.ts`, `events.ts`; wire one router in `apps/server/src/index.ts`. Add versioned DTOs in shared and `services/server.ts` client adapter; identity/authorization/storage files depend on an explicit production design decision, so their exact implementation is not fabricated in Stage 0. Reuse the installed Anthropic SDK only if its actual supported API meets the chosen companion design; no provider migration is assumed. Do not repurpose the value-estimator or pressure-check endpoints for chat.

Gate: server-enforced role/purpose checks, no client secrets, cancellation/timeouts, scoped retrieval of only approved memory, denied/revoked/expired access, tenant isolation, provider failure, durable deletion and media revocation, actual safety evaluation, and corresponding integration tests. Browser/native observation follows. No real activation is included in the initial frontend scope.

### Stage 5 — optional real social matching and agent events

Add narrowly scoped `apps/server/src/evercircle/matching.ts`, `relationships.ts`, `safety.ts`; extend shared DTOs and the server/client adapter. Require authenticated peer participation, both-party approval, blocking/moderation and revocation invalidation. Agent event data originates in real operations and stays sanitized. No arbitrary remote tool execution or automatic bookings. Real device control remains a separate future project decision.

Gate: two-household integration tests for allowlisted data exchange, no introductions before both approvals, revocation during matching, blocked users excluded, replay/duplicate protection and rejection/error recovery; human usability/safety evaluation. Avoid selecting an agent orchestration dependency before a concrete protocol needs one.

## Risk assessment and mitigation

| Risk / impact | Likelihood from source | Mitigation / rollback |
| --- | --- | --- |
| Global typography/control change breaks wrapped Japanese labels or wide fit panels | High | Compatible exports, content-driven height, all-route language/font-scale smoke matrix; revert Stage 1 presentation without DTO changes |
| Changed step/fold mount lifecycle drops a report or stops a location watcher | High | Preserve lifecycle until deliberate draft/status handling; test start/fold/navigation/resume; never add background-sharing assumptions |
| UI parameter/role picker mistaken for authenticated identity | Certain prototype gap | Label demo; prohibit real profile/matching release until server actor/tenant authorization exists |
| Personal data accidentally flows from HomeBundle to an agent/public profile | High if whole bundle reused | Allowlist bridge, separate approval purpose/revision, minimal DTOs and boundary tests; simulation uses invented people |
| Restart reseeds legitimate user changes | High for production reuse | Do not extend db predicates; explicit versioned migration/store before durable EverCircle records; preserve legacy JSON backup for any later migration |
| Media remains accessible after sharing withdrawal | Certain current URL behavior | No real-media matching import; authenticated/revocable serving before claiming private storage/deletion |
| Adding routes creates unintended family/student tabs | High with file-based tab discovery | Register optional screens explicitly with href null; retain four original tabs and test route/back links |
| Chat updates/global home refresh races erase approved profile/drafts | Medium | Separate state domains, immutable source revisions, narrow contexts, request IDs and cancel on scope change |
| Simulation looks like live AI or home monitoring | High without explicit labels | Persistent simulation/source labels, separate simulated device/fix states, real trace only from actual operations |
| Provider outage/prompt content triggers an unwanted tool action | Material in real stage | Narrow typed server operations, untrusted source content, consent recheck, explicit user intent; no unrestricted tools |
| Asset/3D load harms slow phone/web startup | Export assets already large | Measure route startup/frames; reduce fonts, lazy optional views, suspend animation; accessible lists remain functional |
| Native/media/GL behavior differs from exported web | Unverified | Native device evidence before release; installed Fiber manifest has a native entry, so root import alone is not proof of web-only behavior |
| Demo money or estimates interpreted as actual transactions/quotes | Existing prototype constraint | Preserve example/demo/test labels; no payment authority for companion |

Roll out one stage/batch at a time; a disabled EverCircle entry/adapter should leave all old routes and data intact. New DTO fields remain additive. Do not call `/api/reset` for rollback or use startup reseeding as migration. The baseline compiler/export checks are necessary but insufficient for behavioral, accessibility, consent or multi-user safety gates.

## Outstanding decisions for later stages

Stage 0 does not require user answers to complete. Before real activation, settle whether voice, background reminders, real friends/accounts and a specific AI provider are in the next release; what native devices and text scales must be supported; and retention/delegated-access rules. These affect later adapters and backend gates, not the safe Stage 1 file list. The existing family support model does not by itself grant access to private companion conversations or authority to approve a profile for the senior.
