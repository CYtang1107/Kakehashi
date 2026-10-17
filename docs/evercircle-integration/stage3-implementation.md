# Stage 3 — existing role experiences

15 October 2026. Extends the existing React Native / Expo application and Stage 1–2 design system. Domain state, APIs and role/query URLs stay in their existing modules. No new dependency, backend feature, AI module or separate app was added.

## Screen and preservation map

| Surface | Presentation and preserved operations |
| --- | --- |
| Family `/family` | Readable visit continuity/history, next recorded visit, student readiness, latest story, activities, services, live outing and sourced/demo weather. Student information starts expanded; demonstration-record context is explicit. |
| Family `/family/house` | Existing 3D, floor plan, memory tour, map, color/evening controls, room items, safety, future planning and photographs. Larger wrapping memory controls and text; same item links and `?view=map`. |
| Family `/family/plan` | Readable selectable plans, selected price, actual recorded payment entries with demo/test mode, checkout and proceeds preference. Demo checkout never represents a real transfer. Stripe test remains an external test-provider flow. |
| Family `/family/reports` | Letters, calls, dated reports with review/read statuses, personal thanks and localized item names. Empty report history has a readable state. |
| Student `/student` | Existing Before / With Her / After sequence, numbered progress and selected-step state. Before keeps weather checks, recording consent and field notes. With Her keeps item access/collection, room photos, safety, helper coordination, wishes/condition and consented activities/outings. After retains report wording check, personal-read checkpoint, send, letters and calls. |
| Student `/student/add` | Photo capture/library, name/room selection, optional estimate with source, creation and navigation to the saved item. Memory-first explanation; no estimate or disposal decision is required to save. |
| Student `/student/team` | All original readiness steps and status dates, trainee information, coordinator-demo explanation and pending state. Existing server sign-off prerequisites/withdrawal remain authoritative. |
| Student `/student/wallet` | Student selection, earnings/history/rates, pending/paid statuses, demonstration payout, goal save/removal, existing savings-information link. Loading failures now have retry; failed goal removal preserves its editor. |
| Helper `/worker` | Explicit demo identity picker, all clearance checks/rules, skill-filtered board, job amounts/85–15 split, acceptance, own booked/completed jobs, recorded feedback and earned total. Loading, denied checks, empty, failure/retry and pending acceptance remain understandable. Completion is still recorded through the existing student service workflow; no helper completion API was invented. |
| Public `/stories` | Existing story globe and equivalent labelled story list, larger controls, example labels, photos/audio, public journey, labelled heart/comment/share actions and readable inputs. Focus-managed story dialog supports Escape and reduced motion. Pending comments stay pending until student moderation. Public loading no longer depends on the household endpoint. |
| Item `/item/:id`, `?as=student` | Family wishes remain suggestions; student choices retain Not now first, other choices use explicit confirmation. Original photo/icon, recording, story, hold, journey/tracking, handover/delivery, optional worth, sharing withdrawal/opt-in and moderation remain. Older-adult `/her/item/:id` retains its shell and behavior. |

## Shared components and layout

`AppText`, `Button`, `Field`, `Card`, `StatusBanner`, `Pill`, `ReadConfirm`, `Fold`, `Columns`, `ConfirmationDialog`, reading preferences and existing media/house components supply the migration. No styling framework was introduced. Custom selectors now allow at least 56 logical units and wrapping labels; display-only pills are not touch targets. Text uses the Stage 1 roles or readable role-compatible overrides with native scaling enabled.

`src/design-system/RoleTabBar.tsx` supplies both original four-destination Expo tab layouts. It emits the existing tab events and preserves tab history. Labels can wrap; narrow/large-text layouts use two rows and wide screens use one. Selected tabs have an explicit border, fill and semantic selected state. The common toolbar groups role, language and reading preferences under a labelled Settings entry to avoid several fixed toolbar rows consuming narrow screens. Back remains visible. The older-adult shell keeps its own existing Settings behavior.

Desktop two-column/scroll-panel eligibility still follows `useWide()`, including text size and viewport height. Larger reading settings fall back to ordinary scrolling. Embedded maps, 3D rendering and memory-tour controls retain their existing layout contracts and text-list alternatives. Story-globe sway/pulses/zoom interpolation now respect reduced motion; explicit drag/zoom still works.

`src/useStoryDraft.ts` shares the Stage 2 localized-editor protection between both item presentations: clean drafts match displayed prose; dirty drafts survive language/data changes; unchanged saves are disabled; a language hint identifies a retained draft. The existing server's story PATCH still invalidates its old translation. Failed handover saves retain the recipient entry.

## Errors, consent and data provenance

Field notes, reports, letters, calls, activities, weather operations and safety additions now surface recoverable failures. Draft text is retained on failure; note/read checkpoints clear after successful relevant operations. Wallet/helper loads avoid displaying an earlier selection's response as the current identity. Report wording and personal-read gates still precede the unchanged send request. Recording consent, photo selection and public audio/photo opt-in remain separate controls. Family display does not gain student moderation or mutation permissions.

New shared labels and recovery copy use typed English/Japanese keys. Recorded content still uses existing translations/fallbacks; older English-only backend descriptions and technical/provider error strings are not a claim of fully translated stored data. Demonstration identity, prototype payment/wallet behavior, invented public stories, simulated outings/weather and example safety estimates are labelled where relevant.

## Verification and limits

Executed commands and exact outcomes belong in the Stage 3 section of [progress.md](progress.md). The browser harness uses actual compiled Expo Web screens and real input events against disposable localhost fixture data. It verifies outgoing API contracts and frontend updates, not live Express handler persistence or remote providers. No real household database is loaded by the fixture host.

Native iOS/Android gestures, OS text scaling, screen readers, physical camera/microphone capture/upload, GPS, remote maps/directions, Stripe provider checkout and real sharing sheets remain unverified. Stage 2's intermittent expo-audio web play/pause race remains a known dependency limitation. Spatial SVG/WebGL hotspots and embedded server pages have not received full screen-reader/keyboard certification. The prototype's role switch is not authentication.

Stop after Stage 3. No companion conversation, matching or smart-home implementation is included.
