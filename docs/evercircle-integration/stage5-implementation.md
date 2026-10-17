# Stage 5 — local friendship demonstration

Implementation date: 16 October 2026. Baseline: `dafc086` (completed Stage 4). This extends the existing Expo application; no server, API contract, shared package, dependencies or paid AI changes.

## Identity and boundaries

The current resident remains Michiko Tanaka, household `tanaka`. Eight authored older-adult profiles supplement that identity: Aiko Mori, Haru Sato, Mei Chen, Ken Ito, Lina Rahman, Omar Ali, Sora Nakamura and Yuki Kobayashi. Aiko and Haru share gardening/orchids. Sora starts opted out and Yuki starts unavailable for recommendations, exercising eligibility exclusions. Each new profile has a fictional age, approved hobbies, languages, time bands, communication styles, activities, social-location preferences, field grants and block list. Tanaka's age is not invented.

Demo switching applies only inside Friends. Household views, reports, memories, family workflows and the companion remain Tanaka's. The switcher uses fixed fictional identity labels, never another account's privately edited name. Switching is explicitly not authentication: anyone on the same device can select another demo identity. This is not encrypted storage or a production private messenger.

## Routes and shared UI

| Route | Purpose |
| --- | --- |
| `/her/friends` | Consent status, connections, explained recommendations, existing students and household activities in Tanaka's view |
| `/her/friends/permissions` | Independent master/hobby/field grants, recommendation eligibility, unblock controls |
| `/her/friends/demo` | Select a fictional recipient to accept or decline |
| `/her/friends/communities` | Six fictional hobby groups with explicit join confirmation and leave |
| `/her/friends/conversation/[id]` | Accepted-only local history, text, explicit scripted reply, block and local report |

All routes use the existing four-destination shell, labelled back navigation, `HerPage`, `AppText`, `Button`, `Card`, `Fold`, `Field`, `AccessibleSwitch`, `StatusBanner` and `ConfirmationDialog`. Existing English/Japanese dictionaries contain all new shared text. Global reading preferences apply. No new typography, fonts, animation system or styling framework. Recommendation explanations precede the secondary numerical score; details are expandable. Existing `api.activity` accept/Not now calls remain in `LegacyFriendsContent` without changing their behavior.

## Matching model

`src/evercircle/social/matching.ts` contains pure eligibility, allowlist projection, scoring and agent simulation functions. `model.ts` owns friendship transitions and the Stage 4 adapter. It receives only the companion's approved `SavedState`, never `HomeBundle`, chat messages, private item recordings, reports, financial or medical data. No matching transport exists.

Eligibility is checked before scoring: distinct people, neither blocks the other, both opted in, both recommendation-eligible, both approved display-name sharing and at least one approved/shared hobby. An excluded result contains a reason and permission-check events; it has neither score nor candidate summary. Name sharing is required so an invitation has an identifiable recipient. Age is optional, presentation-only, separately granted and never scored.

| Component | Weight | Normalization |
| --- | ---: | --- |
| Approved shared hobbies | 40% | Jaccard intersection / union of normalized categories |
| Languages | 20% | 1 when at least one approved language overlaps, otherwise 0 |
| Availability | 15% | Jaccard overlap of morning/afternoon/evening bands |
| Communication | 10% | Jaccard overlap of text/phone/in-person choices |
| Activities | 10% | Jaccard overlap of activity categories |
| Social-location preferences | 5% | Jaccard overlap of community/library/garden/online choices |

Compatibility is `100 * sum(weight * normalized component)`, rounded to one decimal. Missing/private optional attributes contribute zero; weights are not redistributed. Time bands are approximate, not calendar appointments. Location means preferred type of social place, not exact distance/address. Communities show authored approximate Niigata/Kanto areas. No compatibility is invented for missing data. Stable ID ordering breaks score ties.

Stage 4 orchid recognition produces gardening and orchids as separate pending categories. Neither enters this engine before explicit Remember and separate hobby-sharing permission. Profile edits increment a nonnegative `profileRevision`; additional field permissions bind to the revision, not the field values. Saving or resetting a private profile invalidates those grants, including edit-and-revert. Legacy Stage 4 storage loads with revision zero. Hobby edits/deletion continue to revoke or remove hobby eligibility immediately through the existing reducer. Turning matching off clears hobby grants but preserves approved memory and accepted friendships.

## Agents and transitions

The two simulated agents emit permission checks, approved-summary field names, comparison, score and recommendation events. The friendship reducer separately emits explicit invite/accept/decline/block decisions. Events contain IDs, allowed field names and score metadata, never transcripts or household information. Matching traces are generated from current permitted data rather than cached; transient decision events are bounded to 100 and omitted from persistence. A later visualization can consume these structured types without exposing private conversations.

Invitation confirmation records the sender's agreement. Only the selected recipient can accept or decline; acceptance rechecks current bilateral eligibility. Pending, received, accepted, declined and blocked states are described in words. Stale actions from a different selected account are rejected by the reducer. A declined connection may receive a fresh, explicitly confirmed invitation if both remain eligible.

Only an accepted, unblocked pair can send or generate a mock reply. There is no automatic reply or real remote-delivery claim. Messages are limited to 800 characters and 100 per pair. Explicit scripted replies are labelled and translated at display time. Blocking deletes the friendship relation, removes recommendations/invitations, hides history and disables an already-open composer in both directions. Historical messages remain local but inaccessible until a new accepted friendship; unblocking alone never restores the connection. Matching opt-out stops discovery/new invitations but does not cancel accepted friendships or their messages.

Reports are bounded local reason records, with an explicit explanation that nothing reaches a moderator/emergency service. Joining a community is independent of matching and scoped to the selected demo person; it books no real activity. Existing KAKEHASHI household activities remain a separate section and API workflow.

## Storage and errors

`SocialProvider` is nested inside the existing older-adult `EverCircleProvider`; it does not replace `DataProvider`. Web uses `kakehashi-social-demo-v1`; native source uses the installed Expo FileSystem document directory file `evercircle-social-demo-v1.json`. The separate Stage 4 key/file remains authoritative for Tanaka's approved profile. Social persistence stores relationships, messages, membership, permission revision tokens and blocks, not copied private optional profile values.

Writes are serialized. Failed writes show Retry and pause new matching, invitations and messages. Withdrawal/blocking still apply immediately in memory; users are told to retry before reloading. Corrupt/unsupported state fails closed, with Retry or a temporary session that does not overwrite corrupt saved bytes. Temporary sessions explicitly do not promise persistence. This supports navigation/reload on the same client; simultaneous-tab synchronization, secure authentication, encryption and remote delivery are outside this prototype.

## Files

New feature directory: `apps/mobile/src/evercircle/social/` with `matching.ts`, `fixtures.ts`, `model.ts`, `store.tsx`, platform storage adapters, `SocialPage.tsx`, `DiscoveryScreen.tsx`, `PermissionsScreen.tsx`, `DemoScreen.tsx`, `CommunitiesScreen.tsx`, `ConversationScreen.tsx`.

New route wrappers are the four Friends subroutes above. Updated existing files: `app/her/_layout.tsx`, `app/her/friends.tsx`, `src/her/Screens.tsx`, `src/evercircle/profile/model.ts`, `src/evercircle/privacy/PrivacyScreen.tsx`, `src/i18n.tsx`, and the reset assertion in `scripts/verify-evercircle.cjs`. New checks: `scripts/verify-social.cjs`, `scripts/verify-stage5.cjs`. Surface contract: `apps/mobile/.impeccable/surfaces/friendship.md`.

## Verification

| Executed check | Result |
| --- | --- |
| `npm.cmd run typecheck -w apps/mobile` | Exit 0 after final messaging correction |
| `npm.cmd run typecheck -w apps/server` | Exit 0 |
| `node apps/mobile/scripts/verify-social.cjs` | Exit 0, 14 domain groups |
| `node apps/mobile/scripts/verify-evercircle.cjs` | Exit 0, 12 companion domain groups |
| `npm.cmd run contrast -w apps/mobile` | Exit 0, 30 combinations, on approved outside-sandbox retry |
| `npm.cmd run build:hosted` with command-scoped `EXPO_PUBLIC_API_URL=same-origin` | Exit 0; 1,046 modules, approximately 3.2 MB JS |
| `node apps/mobile/scripts/verify-stage5.cjs` | Initial complete run exit 0. Final corrected run produced completed JSON: 80 layouts, seven scenarios, no failures/exceptions; process handle expired on chat resumption before its final exit was collected |
| `node apps/mobile/scripts/verify-stage4.cjs --interactions-only` | Exit 0, nine companion browser scenarios |
| `node apps/mobile/scripts/verify-stage3.cjs --interactions-only` | Exit 0, 15 existing-role groups |
| `node apps/mobile/scripts/verify-stage2.cjs --interactions-only` | Exit 0, six older-adult groups |
| Impeccable detector on changed social targets | Exit 0, no findings, one scan |

Stage 5 browser coverage includes the full approval-to-message journey, invite Cancel, recipient decline, bilateral block with an already-open read-only composer, matching opt-out preserving accepted conversations, explicit community membership, profile-edit grant invalidation, reload consistency, failed-write recovery and non-overwriting corrupt-storage fallback. All social scenarios record zero household mutation requests. Five routes × two languages × four widths (320/390/768/1440) × two reading modes produce 80 layout cases; Extra Large cases also use high contrast. All 27 final captures were opened, including recommendation and latest-message details. These are measurements of exposed control sizes/viewport overflow, not a full accessibility certification.

The verification host is `scripts/preview-design-system.cjs`, an in-memory fixture with no `db.ts` imports. Chrome uses a dedicated temporary profile and local debugging port. See `progress.md` for initial environment/harness failures and correction history. The independent [finish review](stage5-review.md) returns **ship** for the local Expo Web scope, and the [design comparison](stage5-design-check.md) confirms compatibility with the incumbent system. The fixture host and dedicated browser were stopped and the temporary browser profile removed. No native runtime, hardware keyboard/IME, VoiceOver or TalkBack certification is claimed. Browser fixture checks do not certify real server handlers or external providers. **Stage 5 complete; stop here.**
