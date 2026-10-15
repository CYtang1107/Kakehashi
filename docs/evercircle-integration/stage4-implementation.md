# Stage 4: personal companion and approved profile

15 October 2026. Baseline `2903735` (`updated all remaining user role experiences`). This stage implements the user's frontend simulation brief inside the existing React Native / Expo application. It supersedes the speculative Stage 0 folder/route proposals for this stage; those assessment documents remain historical. No real AI, matching service, reminder scheduler or device control is implemented.

## Delivered experience

Home's existing **Talk to Companion** opens `/her/companion`. Text chat has labelled speakers, scalable bubbles, a persistent labelled composer, Send, a short local reply delay with Stop, starter suggestions and explicit unsupported responses. The interface states that it is scripted. Voice input/playback are omitted and their unavailability is explained; existing consented item recording remains in Memories.

The deterministic engine handles English and Japanese greetings, interests, memories, home help, visits, friends, devices, reminders, activities and unsupported requests. Closed action identifiers lead to existing Memories, Request Help, My Day, Friends and Smart Home routes or the new private profile. A chat action only navigates; it cannot book, record, publish, create a reminder or operate a device. The exact greeting starter takes precedence over the word “today,” avoiding an accidental visit response.

Nine normalized interests are supported: gardening, orchids, cooking, music, reading, walking, chess, photography and handicrafts. Orchids also suggest gardening. Negated and common third-person mentions are excluded heuristically. This is a bounded vocabulary, not natural-language understanding; ambiguous mentions can still produce a candidate. Candidates remain pending until **Yes, remember this** or **Not now**. Approval initially saves privately. Rejection removes the candidate and remains visibly acknowledged after the final card disappears.

`/her/profile` provides approved hobbies, pending candidates, display name, languages, preferred activities, available times, communication methods and social-location preferences. Optional multi-select sections disclose choices progressively. Edits choose another normalized supported interest; duplicates are disabled. Saving an edit revokes that interest's matching grant, including when saving the same choice. Deletion requires confirmation; Cancel preserves it. Profile details and preferences are private and never included in the matching summary.

`/her/privacy` separates the master future-matching permission from each approved interest's permission. Both must be enabled. Turning the master off clears individual grants; turning it on again cannot restore them. The matching preview derives eligible IDs at use time and contains no chat, display name, free text or profile preferences. No data is actually sent for matching in Stage 4. Confirmed clear-chat and clear-profile actions affect this feature only. Settings links to both private routes, and Friends links to private profile preparation without pretending matching is available.

## Identity, boundaries and persistence

The explicit demo mapping is **household `tanaka` → existing fictional resident Michiko Tanaka / 田中 美智子** (`demo/persona.ts`). The read-only bridge uses that household's resident name and the next planned future visit date, when available. It rejects an unrelated household. It never exposes belongings, recordings, reports, student notes, family messages, contact details or the whole HomeBundle. No existing seeded interests are imported as approved memory. A profile display name is a feature-local alias, not a mutation of the household resident record.

`EverCircleProvider` wraps only the existing older-adult layout. DataProvider, its API cache and other role layouts remain unchanged. Component state holds drafts and focus; the feature's reducer/context holds profile and conversation state. Pure intent/domain/permission modules have no React, storage or API dependency. No additional state/styling framework was installed.

Web storage uses `localStorage` key `kakehashi-evercircle-tanaka-v1`; native source uses Expo FileSystem's document directory and `evercircle-tanaka-v1.json`. `expo-file-system ~57.0.7` was already installed transitively and was declared directly in the mobile manifest and the corresponding workspace lock entry. No install or dependency resolution command was executed. Native persistence is implemented against installed types but has not been run on a device.

Versioned, household-scoped storage allowlists the profile, approved normalized IDs/revisions and permissions. Pending candidates remain in memory only: both storage adapters serialize an empty pending list, and hydration ignores pending IDs from older demo files. It does not persist transcripts or raw candidate phrases. Chat survives navigation within `/her`, then clears on reload or leaving that layout. The conversation is bounded to 800 characters per input and 81 messages. Profile state survives supported reloads. Writes are serialized; revision guards prevent stale completion status. Removal/revocation changes in-memory eligibility immediately, and a failed save disables eligibility until Retry succeeds. Corrupt/mismatched storage shows a recoverable error; an explicit empty session fallback does not overwrite the unreadable saved bytes. It remains a fictional demo without encrypted storage, authenticated identities or cross-device synchronization.

## Design and accessibility

The existing warm ivory/sage/deep-green system, Zen Kaku Gothic New, shared typography, controls, cards, switches, fields, feedback and dialogs are reused. No palette, font or image assets were added. Older-adult bottom/side navigation remains intact. The initial review moved the welcome bubble ahead of secondary information and shortened introductory copy. The latest reply scrolls into view, respecting reduced motion. Profile/privacy entries remain labelled and the longer companion explanation is an optional disclosure.

App text sizes and system font scaling remain enabled. The new pages use shared content widths and flexible heights, labelled fields, contextual approval/edit/delete accessibility names, speaker names, polite reply/status announcements and existing focus-managed confirmation dialogs. New UI copy has English/Japanese keys. Preferences continue applying across all roles. Expo Web evidence is not a native accessibility certification.

## Exact file scope

New feature source under `apps/mobile/src/evercircle/`:

```text
FeaturePage.tsx
store.tsx
companion/CompanionScreen.tsx
companion/bridge.ts
companion/engine.ts
profile/ProfileScreen.tsx
profile/PendingInterests.tsx
profile/model.ts
privacy/PrivacyScreen.tsx
privacy/permissions.ts
demo/persona.ts
demo/storage.ts
demo/storage.web.ts
```

New route wrappers: `apps/mobile/app/her/profile.tsx`, `apps/mobile/app/her/privacy.tsx`. Updated routes: `app/her/companion.tsx`, `app/her/_layout.tsx`.

Updated shared source: `src/her/Screens.tsx` (entries/caption), `src/her/HerPage.tsx` (optional data-independent rendering, footer/scroll ref), `src/design-system/ScreenFrame.tsx` (optional scroll ref), `src/ui.tsx` (optional disabled ReadConfirm prop), `src/i18n.tsx` (localized companion/profile/privacy vocabulary). Defaults preserve existing callers.

Other files: mobile `package.json`, root `package-lock.json` (one dependency declaration each), new `scripts/verify-evercircle.cjs`, `scripts/verify-stage4.cjs`, updated Stage 2 smoke assertion in `scripts/verify-stage2.cjs`, `.impeccable/surfaces/companion.md`, this report, `stage4-review.md`, `stage4-design-check.md` and `progress.md`.

No server/shared contracts, API functions, DataProvider, root provider tree, Expo configuration, household records or earlier role business logic were edited. No commits or deployment were made.

## Executed verification

| Command | Result and scope |
| --- | --- |
| `npm.cmd run typecheck -w apps/mobile` | Exit 0 after correcting the optional shared checkbox disabled prop |
| `npm.cmd run typecheck -w apps/server` | Exit 0 |
| `node apps/mobile/scripts/verify-evercircle.cjs` | Exit 0; 12 domain/permission groups: EN/JA intents, all interests, normalization/exclusions, pending approval/rejection, independent consent, edits/deletion/revocation, parser scope and privacy bridge |
| `npm.cmd ls expo-file-system -w apps/mobile` | Exit 0; existing 57.0.7 deduped |
| `npm.cmd run contrast -w apps/mobile` | Sandbox launch failed before checks with tsx `uv_os_get_passwd` ENOMEM; approved retry exit 0, all 30 existing token pairs pass |
| `npm.cmd run build:hosted` with command-scoped `EXPO_PUBLIC_API_URL=same-origin` | Final correction exit 0; 1,031 modules, approximately 3.2 MB JS, `entry-c5c043ee81bfab2c95a68e7899607872.js`. Previous environment restored. Empty-cache/color-environment warnings were nonfatal. |
| `node apps/mobile/scripts/verify-stage4.cjs`, final-source layout portion | 48 layouts completed with no measured failures; combined command later stopped on an inactive-route input selector in the harness, so this command is not claimed to have passed overall |
| `node apps/mobile/scripts/verify-stage4.cjs --resume-interactions` | Pre-review exit 0; resumes those 48 layouts and adds 12 conversation/populated cases, total 60; 8 interaction groups, no measured overflow/undersized controls or uncaught exceptions |
| `node apps/mobile/scripts/verify-stage4.cjs`, final reviewer correction | Exit 0; full 60-layout matrix and 9 interaction groups, zero measured overflow/undersized exposed controls and zero uncaught exceptions; includes unapproved suggestion storage/reload exclusion |
| `node apps/mobile/scripts/verify-stage3.cjs --interactions-only` | Exit 0; all 15 existing role workflow groups, zero uncaught exceptions |
| `node apps/mobile/scripts/verify-stage2.cjs --interactions-only` | Exit 0; all 6 older-adult groups, 4 empty-state routes and 6 legacy route smokes, zero uncaught exceptions; companion smoke now expects the available scripted demo |
| Impeccable `detect --json` on companion/profile/privacy, feature directory and layout seams | Exit 0, empty findings; one scan, limited web source analysis |
| `git diff --check` | Exit 0 at the implementation checkpoint; final result recorded in progress |

The 48-layout matrix is three routes × English/Japanese × 320/390/768/1440 × Normal or Extra Large/high contrast. Twelve additional cases cover EN/JA × 390/1440: a latest-reply conversation, populated profile and populated privacy. Measurements exclude hidden controls and SVG geometry. Twenty-four inspected PNGs at height 900 show the viewport, not the entire scroll content. Evidence is ignored under `apps/mobile/.impeccable/review/`: `stage4-layouts.json`, `stage4-verification.json`, and `stage4-*.png`. Conversation captures intentionally show the latest reply; other captures reset scroll to top. Compact populated fields can therefore be below the captured viewport.

The nine final browser groups cover orchid pending-only recognition/private approval/Not now/no transcript storage; separate matching gates/edit/delete/Cancel; all five profile preference groups/save/reload; existing-feature navigation and honest unsupported states; revocation during failed storage write/retry; corrupt/mismatched scope/session fallback; confirmed feature-only reset; unapproved suggestion exclusion from storage/reload; and local chat with failed household loading/no invented visit date. Input events and storage/request assertions run against disposable in-memory fixtures, without importing the real database or contacting providers. Existing server handlers, provider integrations and actual production data are not certified by fixture tests.

The first browser run found disappearing final-candidate feedback, fixed by keeping its presentation mounted for the interest conversation. A later failure targeted a hidden older Expo stack screen's input; the harness now restricts input selection to visible, accessibility-exposed fields and asserts the typed value. The saved-profile behavior passed after that harness correction.

The independent review then identified a privacy mismatch: the initial implementation persisted normalized pending IDs before approval. The final correction makes pending candidates session-only in both adapters and ignores legacy persisted candidates during hydration, keeping the existing English/Japanese storage promise accurate. A twelfth pure test and ninth browser scenario verify this boundary. The final build and full browser matrix above were rerun after the correction, and all 24 screenshots were refreshed and opened. The review's final verdict is recorded separately at its bounded scope.

## Remaining boundaries

Physical native persistence, keyboard/IME/safe-area behavior, VoiceOver/TalkBack and OS font scaling remain untested. No speech recognition/synthesis, real LLM, friendship matching, sharing transport, home device control or reminder scheduling is present. Local matching permissions are preparation for later stages, not authorization for an unimplemented external service. Future production use needs authenticated scope, secure storage, consent versioning and provider/data-retention design.

The independent review and its exact disposition are recorded in [stage4-review.md](stage4-review.md); the system-extension comparison is in [stage4-design-check.md](stage4-design-check.md). Final completion and any review corrections are recorded in [progress.md](progress.md).
