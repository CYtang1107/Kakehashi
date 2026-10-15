# EverCircle integration progress and executed baseline

Date: 15 October 2026 (Asia/Kuala_Lumpur). **Stages 0–2 complete at their documented implementation/web-verification scope. Stages 3–5 not started.** Repository `D:\kakehashi\Kakehashi`; baseline HEAD `8c9692a40214d3fbdd4f8221fc062274fb178fda`. Earlier-stage records below are historical; the Stage 2 implementation follows them. Native-device accessibility certification remains outstanding.

## Stage 0 completed scope (historical)

- [x] Inspect actual Expo/React Native mobile app, Express source and shared package.
- [x] Inspect manifests, Expo/Babel/TypeScript configuration, dependency tree and hosting configuration.
- [x] Inventory all 13 source screen routes, 3 layouts, and related server HTML/media surfaces.
- [x] Audit shared UI/theme, older-adult flow, family/student/helper features, API/state and localization.
- [x] Evaluate native and web accessibility/adaptivity risks from source; distinguish untested runtime behavior.
- [x] Plan all eight EverCircle modules inside the existing app, with isolated state and simulation-first adapters.
- [x] Define preservation checklist, staged file changes, risks and exact proposed Stage 1 scope.
- [x] Execute feasible compiler, contrast, export and dependency checks; document actual outcomes.
- [x] Produce the five requested documents; no duplicates were found.
- [x] Keep application source, manifests, lockfile, existing data and existing features untouched.

Deliverables:

| File | Contents |
| --- | --- |
| [architecture-audit.md](architecture-audit.md) | Verified runtime/workspaces/configuration, providers/navigation, API/storage/AI/media/privacy/localization and architecture limits |
| [feature-inventory.md](feature-inventory.md) | Every route, layout and companion server page; component reuse and future preservation acceptance checklist |
| [uiux-audit.md](uiux-audit.md) | Fifteen prioritized source findings, measured contrast/export observations, positive patterns and native/web validation matrix |
| [integration-plan.md](integration-plan.md) | Eight-module design, route/folder/state/consent decisions, Stage 1 exact files, later stage plans and risk mitigation |
| `progress.md` | This executed baseline, scope controls and implementation status |

The impeccable context command and its audit/native/iOS/Android references were used. Context reported no PRODUCT.md, DESIGN.md or surface brief; existing source and the 14 October night-band design documents supplied incumbent evidence. No product/design context documents or UI detector output were created as side effects. Native audit guidance calls for source inspection; this delivery is planning-only, so no UI-polish detector or redesign was run.

## Environment and initial working tree

Shell: Windows PowerShell. `node --version` returned `v24.20.0`. `npm.cmd --version` returned `11.19.0`. `node_modules` was already present; no install/download command was run. `npm --version` through the PowerShell npm.ps1 shim failed with `PSSecurityException` because script execution is disabled. Subsequent npm commands used `npm.cmd` without changing execution policy.

Initial `git status --short`:

```text
 M package-lock.json
```

The existing lockfile diff was 44 lines: 25 insertions and 19 deletions. This audit did not modify it or clean/revert user changes. No applicable AGENTS.md was found. There were no existing `docs/evercircle-integration` documents. Native `adb` and `xcrun` were not found by the command probe.

## Available repository commands

| Location | Declared scripts | Baseline decision |
| --- | --- | --- |
| Root | `dev`, `server`, `app`, `reset`, `build:hosted`, `start:hosted` | Execute build only. Development/server startup can create/reseed JSON data; reset is explicitly mutating and was not run. |
| Mobile | `start`, `web`, `tunnel`, `typecheck`, `build:web`, `contrast` | Typecheck, contrast and web build exercised. Start/tunnel not needed for source assessment. |
| Server | `dev`, `start`, `typecheck` | Typecheck exercised; no backend emit/build script exists. |
| Shared | None | Its source is imported by both workspace type checks; no standalone shared test/build claim. |

No root/workspace lint or test script, lint configuration, test harness, or application test/spec files were found. The existing `docs/superpowers/specs` files are design documents, not executable tests. No fabricated `npm test`/lint pass is reported. Expo Doctor/install/upgrade commands were not run, and SDK/native-device compatibility is not certified.

## Exact executed check results

Commands below ran from the repository root unless noted. Long-running commands were polled to completion; results are terminal exit codes, not initial session status.

| Command | Final result | Evidence / limit |
| --- | --- | --- |
| `npm.cmd run typecheck -w apps/mobile` | **Exit 0, passed** | Runs `tsc --noEmit`; no TypeScript diagnostics |
| `npm.cmd run typecheck -w apps/server` | **Exit 0, passed** | Runs `tsc --noEmit`; no TypeScript diagnostics |
| `npm.cmd run contrast -w apps/mobile` (sandbox attempt) | **Exit 1, failed before check** | tsx initialization: `SystemError [ERR_SYSTEM_ERROR]: uv_os_get_passwd returned ENOMEM (not enough memory)`; no color results |
| `npm.cmd run contrast -w apps/mobile` (permissioned retry outside sandbox) | **Exit 0, passed** | All 17 configured pairs >=4.5:1; see output below. Same existing script, no source change. |
| `npm.cmd run build:hosted` | **Exit 0, passed** | Runs mobile `expo export -p web --output-dir dist --clear`; bundles 991 modules; `Exported: dist` |
| `npm.cmd ls --depth=0` | **Exit 0, completed** | Dependency inventory; reports two extraneous packages, `@emnapi/runtime@1.11.3`, `@img/sharp-wasm32@0.35.5`; no cleanup/install performed |
| Supplemental Node inline asset/contrast calculation | **Exit 1, invocation failed** | PowerShell/native-command quote handling removed JS string quotes. It produced no measurements and was replaced by PowerShell calculations. |
| Supplemental PowerShell artifact-size and luminance calculation | **Exit 0, completed** | Read-only file sizes and four extra contrast pairs below |

Compiler output:

```text
> @kakehashi/mobile@0.0.1 typecheck
> tsc --noEmit

> typecheck
> tsc --noEmit
```

Both completed without diagnostics. This does not execute handlers or validate provider/model names, route parameters, permissions or runtime response schemas.

Successful contrast output (rounded exactly as the script reports):

```text
ok   15.05:1  band title (#F3EEE4 on #121A2A)
ok   8.24:1  band caption (#A9B3C6 on #121A2A)
ok   6.99:1  band eyebrow / active tab (#F08A4B on #121A2A)
ok   12.44:1  chip in band (#F3EEE4 on #1E2A40)
ok   5.78:1  persimmon on raised (#F08A4B on #1E2A40)
ok   15.05:1  primary button (#F3EEE4 on #121A2A)
ok   5.14:1  eyebrow on paper (#A04A22 on #ECEEEA)
ok   5.78:1  eyebrow on sheet (#A04A22 on #FAFBF8)
ok   4.92:1  eyebrow on tinted card (#A04A22 on #E3E9F3)
ok   13.50:1  body on paper (#1C2330 on #ECEEEA)
ok   5.35:1  caption on paper (#59616F on #ECEEEA)
ok   6.01:1  caption on sheet (#59616F on #FAFBF8)
ok   4.98:1  decision keep (#4F6B3A on #E6ECDF)
ok   5.56:1  decision family (#7A4A6E on #EFE3EC)
ok   7.06:1  decision pass (#2B4C7E on #E3E9F3)
ok   4.81:1  decision recycle (#A04A22 on #F4E3D9)
ok   5.35:1  decision open (#59616F on #ECEEEA)
```

Supplemental source-pair calculations:

```text
9A6A12 on FAFBF8: 4.55:1
9A6A12 on F5EBD6: 3.99:1
D5D9D1 on FAFBF8: 1.38:1
FFFFFF on B5562B: 4.85:1
```

The open-service Pill actually uses the 3.99 pair at 12-point bold text, outside the existing script's coverage. The border pair needs contextual non-text contrast review; card separators alone are not necessarily failures. The white/persimmon opaque calculation does not validate translucent photo badges on arbitrary images.

Web export output included:

```text
Expo Autolinking module resolution enabled
Starting Metro Bundler
warning: Bundler cache is empty, rebuilding (this may take a minute)
Web Bundled 42587ms node_modules\expo-router\entry.js (991 modules)
› Assets (47)
› web bundles (1)
_expo/static/js/web/entry-66f271fb941cbddfc5d6746a6e676de3.js (3MB)
› Files (2)
index.html (1.2KB)
metadata.json (49B)
Exported: dist
```

Repeated Node warnings said `The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.` The empty-cache and color-environment warnings did not fail the export. Build time above is Metro's reported bundle time, not total build/startup time. No same-origin environment was deliberately set for this baseline build; it verifies export compilation, not hosted API resolution.

Read-only artifact inventory:

| Measurement | Exact value |
| --- | --- |
| Files under mobile dist | 50 |
| Total artifact bytes | 61,682,309 |
| Font files (`.ttf`) | 29 |
| Font bytes | 58,612,316 |
| JavaScript bundle bytes | 3,048,507 |

Build artifacts in ignored `apps/mobile/dist` and bundler caches were generated by the existing build command. They are not application code changes or delivery files. No cleanup deleted pre-existing outputs. Artifact size is not measured download size, runtime memory or latency.

## Unexecuted / unavailable checks

- **Lint/unit/integration tests:** no configured harness/scripts found. Not run; not claimed passed.
- **Native iOS/Android build and device QA:** no available adb/xcrun session; no native compile/install, screen reader, dynamic-text, safe-area, camera/microphone/GPS test. Web export is not a substitute.
- **Rendered browser/visual QA:** no running application/browser interaction; no screenshots captured. Keyboard traps, actual overflow/zoom and synthesized/physical-touch behavior remain unverified.
- **API runtime/end-to-end:** server not started and no HTTP mutation/reset invoked; importing db can create/reseed persistent demo state. Handlers were inspected, not executed.
- **Live external services:** no Claude request, Stripe checkout, live JMA validation, CDN/tile interaction, account matching or actual device action was performed. Their configured integrations are source findings only.
- **Hosted/native dependency compatibility:** Render deployment, `npm ci`, SDK Doctor and native builds not performed. Existing modified lockfile/extraneous packages limit clean-install reproducibility conclusions.

## Key conclusions and next-stage boundary

Final documentation verification ran a read-only Node script through standard input: **exit 0**, all five expected files present, **0 broken document file links**, no UTF-8 replacement characters, and **13 screen files / 3 layout files** independently counted from the app tree. Final `git status --short` showed only the original modified `package-lock.json` and the new `docs/evercircle-integration/` directory. `git diff --name-only` listed only `package-lock.json`; its diff summary remained **25 insertions / 19 deletions**. `git ls-files --others --exclude-standard` listed exactly the five requested Markdown files. Application source/configuration did not acquire tracked changes.

The existing application provides substantial reusable functionality and a compiler/export baseline. The frontend's main shortcomings are small shared typography/targets, field/focus semantics, large-text/wide-panel behavior, and inconsistent mutation feedback. Consent-based design is present, but unauthenticated API/media access and reseeding storage make real private EverCircle data inappropriate without targeted later safeguards.

Recommended integration: thin Expo route wrappers; a separate EverCircle reducer/context and typed simulation/server adapters; explicit allowlisted candidate selectors; approval by purpose/content revision; no automated legacy mutations. Stage 1 is limited to design-system foundations and the older-adult pilot with shared UI compatibility. Its **exact proposed paths and purpose** are in [the Stage 1 table](integration-plan.md#stage-1--design-foundation-and-older-adult-pilot).

At the end of Stage 0, Stages 1–5 had not started. That delivery changed documentation only. The new Stage 1 request authorizes the implementation recorded below; AI and backend integration remain unimplemented.

## Stage 1 — implemented shared design system

The user's Stage 1 brief replaces the old night-band UI foundations with warm ivory, sage, deep green, charcoal, white and peach. They confirmed that reading preferences apply **across all roles**. Existing API functions, domain state, shared contracts, server code, role routes, four family/student tab destinations and consent/business transitions remain intact. Only the older-adult pilot received a focused screen presentation update; other screens inherit shared tokens/controls with one narrow helper-picker wrapping fix.

### Design and styling decisions

- Semantic color, typography, spacing, layout, control, radius, motion and elevation tokens live in `src/theme.ts`. Legacy `colors`, `fonts`, `type`, `decisionColor`, `roomColor` and `yen` exports stay compatible. Keep/family/pass/recycle/open retain their meanings; pass-on indigo is independent of the new green action color.
- Heading 30/42, section 23/34, body 19/30, supporting 17/27, button 19/28 and tab label 16/24 logical size/line-height. AppText combines app text modes (1 / 1.15 / 1.3) with enabled native system scaling and wraps content. No native font-scaling disable/cap was introduced.
- Primary buttons have minimum height 60; secondary/destructive 56; effective minimum shared target 48. Icons accompany readable names. Buttons expose busy/disabled/selected states; fields have localized accessible labels, error/hint/required behavior and focus borders.
- White cards use 24 padding, radius 16 and a gentle offset shadow; sage notes are flat. High contrast strengthens text and control outlines. Informational cards are not wholesale Pressables; their explicit action is a labelled button or switch.
- New independent ScreenFrame handles safe-area scrolling/keyboard foundations. Legacy Screen still owns its original home-loading contract, now with clear localized connection/retry and loading states. Wide fit/columns require width >=1000×app scale, height >=700×app scale, and OS fontScale <=1.2; otherwise use a readable stacked scrolling layout. This deliberately favors scrolling at extra-large sizes or short windows.
- Reading settings are reached from the shared toolbar without adding a new settings navigation contract. Normal/Large/Extra Large, high contrast and reduced motion use one root provider. Only non-sensitive preferences persist in web localStorage; native preferences are session-only. OS reduced-motion settings take precedence. Root-stack and shared-dialog transitions honor them.
- Keep React Native style objects and existing Expo dependencies. NativeWind would require a new styling/build migration without improving compatibility in this established codebase; no framework, dependency or lockfile change was needed.
- Use direct imports for the five existing font weights; retain the fonts and full Japanese glyph coverage. No imagery, gradients or decorative assets were added.

### Component API coverage

`src/ui.tsx` remains the compatibility entry point. It re-exports:

| Family | Implemented exports |
| --- | --- |
| Actions | Existing `Button`, plus `PrimaryButton`, `SecondaryButton`, `DestructiveButton`, `IconLabelButton` |
| Forms | `AccessibleTextInput`; existing `Field` aliases it; `AccessibleSwitch`; existing `ReadConfirm` |
| Feedback | `StatusBanner`, `ToastFeedback`, `EmptyState` |
| Review/focus | `ConfirmationDialog`, with a named cancel/confirm, Escape/Tab/return-focus behavior on web and native Modal/inset foundations |
| Typography/layout | `AppText`, `ScreenFrame`; existing `Screen`, `TopBar`, `NightBand`, `Heading`, `Columns`, `Fold`, `Card` |
| Content patterns | `UpcomingVisitCard`, `MemoryCard`, `FriendRecommendationCard`, `HomeAssistanceCard`, `DeviceControlCard`, `ReminderCard`, `SafetyCard` |

Fold now keeps a stable, named trigger with expanded state and untruncated summaries. ToastFeedback retains a readable message after the legacy provider clears its shorter toast and supports dismissal; native toast announcements are attempted. Explicit user-facing errors replace developer server setup copy in Screen. Existing card/action arguments and legacy route queries are retained.

`/design-system` is an additive component reference route, not a new application or EverCircle feature. All seven card patterns and required control/feedback states are exercised there. Its bilingual notice clearly labels people, device controls and suggestions as examples; interactions change local reference state only. No actual friend, device, reminder, booking or AI service was added.

### Exact changed files

Updated existing application files:

```text
apps/mobile/src/theme.ts
apps/mobile/src/ui.tsx
apps/mobile/src/i18n.tsx
apps/mobile/src/Services.tsx
apps/mobile/app/_layout.tsx
apps/mobile/app/family/_layout.tsx
apps/mobile/app/student/_layout.tsx
apps/mobile/app/her/index.tsx
apps/mobile/app/worker/index.tsx
apps/mobile/scripts/check-contrast.ts
```

`README.md` also updates its Design section to describe the implemented system and reading-preference limits.

Added application and verification files:

```text
apps/mobile/PRODUCT.md
apps/mobile/DESIGN.md
apps/mobile/.impeccable/design.json
apps/mobile/.impeccable/.gitignore
apps/mobile/.impeccable/surfaces/design-system.md
apps/mobile/src/design-system/AppText.tsx
apps/mobile/src/design-system/preferences.tsx
apps/mobile/src/design-system/Controls.tsx
apps/mobile/src/design-system/Cards.tsx
apps/mobile/src/design-system/Feedback.tsx
apps/mobile/src/design-system/ReadingSettings.tsx
apps/mobile/src/design-system/ConfirmationDialog.tsx
apps/mobile/src/design-system/ScreenFrame.tsx
apps/mobile/app/design-system.tsx
apps/mobile/scripts/preview-design-system.cjs
apps/mobile/scripts/verify-design-system.cjs
```

Documentation: this progress record, the Stage 1 remediation section in `uiux-audit.md`, and `stage1-review.md`. The initial Stage 0 five files were untracked before Stage 1; they were preserved, not discarded. The source structure differs from the preliminary 17-file proposal because the user's Stage 1 request specifies additional controls, cards, settings and representative verification. Feedback unifies StatusBanner/Toast/EmptyState rather than duplicating a separate StateNotice; ConfirmationDialog supplies the requested dialog instead of the provisional ConfirmationSheet filename. Preferences are presentation state, not EverCircle/domain state.

### Executed Stage 1 checks

| Check / exact command | Result and scope |
| --- | --- |
| `npm.cmd run typecheck -w apps/mobile` | Exit 0 on the updated source; no diagnostics |
| `npm.cmd run typecheck -w apps/server` | Exit 0; server/shared behavior untouched |
| `npm.cmd run contrast -w apps/mobile` | Sandbox attempt exited 1 during tsx OS-user initialization; permissioned retry exited 0 with **30 passing pairs** |
| `npm.cmd run build:hosted` with `EXPO_PUBLIC_API_URL=same-origin` scoped to the command | Exit 0 after the final source changes; 994 modules; exported dist. Prior environment restored. Color-environment/empty-cache warnings are nonfatal. |
| `node apps/mobile/scripts/verify-design-system.cjs` | Exit 0 for **28 reference/pilot matrices**, 3 interaction scenarios and 12 legacy route smokes; no uncaught browser exceptions. Initial attempts uncovered/diagnosed a decorative nested switch, missing help name and a test selector matching the backdrop/underlying trigger; corrections are below. |
| `node apps/mobile/scripts/verify-design-system.cjs --worker-only` | Exit 0 after the compatibility fix; **16 targeted layouts, zero overflow** |
| Impeccable `detect --json` on changed UI targets | Exit 0, `[]`; one mechanical web-oriented scan only. Native review is source-based; detector output is not accessibility certification. |
| `git diff --check` | Exit 0 |

Browser evidence used locally installed headless Chrome 155 through DevTools Protocol, with real mouse/key/text events and actual Expo Web output. No Playwright/browser/dependency installation occurred. Windows could not initialize the browser profile in a sandbox-owned workspace folder; an approved hidden browser used a temporary profile instead. An isolated Node host at `127.0.0.1:4399` serves the compiled app and **disposable in-memory** API fixtures based on illustrative seed data. It never imports db.ts, modifies saved household data, contacts AI/payment/device providers, or invokes reset. Provider media was omitted from fixtures; map responses are labelled placeholders. These are frontend/API-call-contract checks, not actual Express handler or live integration tests.

Reference matrix: widths **320, 390, 768, 1440** × English/Japanese × Normal/Large/Extra Large = 24 scenarios. XL also enabled high contrast and reduced-motion preference. Pilot: English/Japanese × 390/1440 × XL = 4. **No horizontal overflow and no exposed reference/pilot control below 44×44** in these 28 scenarios.

Interaction evidence:

- Reading dialog keeps Tab/Shift+Tab within the panel, closes with Escape, and restores the Reading settings trigger.
- Accessible input has a readable label; an empty save announces an error; text entry/save succeeds; destructive review Cancel retains the note and Confirm clears it.
- Existing older-adult help flow remains category → timing. A fixture 503 produces visible recoverable feedback; retry sends the existing POST `/api/home/tanaka/services` with `{ kind: 'garden', when: 'soon', by: 'her' }`. No extra confirmation or business/API change.

Legacy smoke scope: **English / Normal / 390 px**, `/`, `/family`, `/family/house`, `/family/plan`, `/family/reports`, `/student`, `/student/add`, `/student/team`, `/student/wallet`, `/worker`, `/stories`, `/item/sewing`. Together with the pilot matrices, all 13 old screen routes were rendered. These checks establish route/render compatibility, not every workflow/permission/state.

One introduced wrapping defect was observed in `/worker`: the larger shared caption made a helper-provider description overflow its picker. A single `maxWidth: '100%'` constraint was added. Rechecking both languages, 320/390/768/1440 widths and Normal/XL yielded **16 clean post-fix layouts**. The reference's decorative Switch initially exposed a second 40×20 semantic control on web; its visual child is now hidden from accessibility and keyboard traversal, while the full labelled row is the >=56 target. The help tiles now have explicit localized accessible names, excluding icon glyphs from their names.

Captured evidence is in ignored `apps/mobile/.impeccable/review/`: reference and her EN/JA at 390/1440 in the captured modes, plus worker EN/JA XL captures, `verification.json` and `worker-verification.json`. Captures show the actual app viewport and internal scrolling; they are not native screenshots or a visual certification of every off-screen state. The independent finish reviewer assessed source and the named valid web captures; its scoped disposition and limits are recorded in `stage1-review.md`.

Final exported fonts: **24 files / 28,260,704 bytes**, down from Stage 0's **29 / 58,612,316 bytes** (about 52% fewer font bytes). Other icon sets remain because older screens still use barrel imports. The JS bundle remains about 3.1 MB uncompressed; no download/startup performance improvement is claimed from artifact sizes alone.

### Remaining limitations and stop boundary

- No iOS/Android device, VoiceOver/TalkBack, actual OS text scaling, native IME, camera/microphone/location, live backend/provider, or deployment verification was performed. Native-safe layout/semantics are implemented foundations; their behavior still needs device evidence.
- Reading modes and high-contrast colors apply to migrated shared controls/headings and the pilot. Existing inline raw Text/color styles are not universally preference-aware. Native preferences do not persist beyond the session.
- Shared stack/dialog motion honors preferences; existing 3D/globe auto-motion and story-specific modal/scroll behavior remain later screen-migration work. Stage 1 does not claim an app-wide motion audit is resolved.
- Existing inline house view controls (35 high) and story chips (32 high) remain below the new shared target standard. Story modal, SVG/map semantics, old screen-specific mutation errors and long-list virtualization remain Stage 0 findings for subsequent redesign.
- Clean-install/native SDK compatibility and provider availability are untested. No lint/unit-test harness was installed; the added browser checks are focused independent UI checks.

No remaining introduced regression was found within the executed checks after the worker fix. This is a scoped result, not universal regression or accessibility certification. **Stop after Stage 1.** No AI feature, real matching, device simulation service, backend change, domain-state migration, real payment or separate application was introduced.

Final handoff: the independent reviewer returned **ship for the scoped Stage 1 frontend prototype**. The documenter completed `apps/mobile/DESIGN.md` and schema-version-2 `.impeccable/design.json`, with canonical headings, actual source tokens, component APIs and matching previews/narrative. YAML/JSON and all normative frontmatter token references validate; document links resolve. The saved lockfile SHA-256 still matches the pre-existing Stage 0 value `F42FD20AA9D08324E340CC59DC84E3B8EF238E23D389A4A90869156559DF4315`. Final source-scope inspection shows no changes to manifests, Expo configuration, API functions, DataProvider, shared contracts or server source. The temporary fixture host and dedicated headless browser were stopped; regular user browser sessions were not touched. Stage 1 is complete at this documented implementation/web-verification scope.

## Stage 2 — older-adult experience

15 October 2026. Implementation and executed verification are recorded here; the historical Stage 1 exclusions above do not describe the newer older-adult screens. See [stage2-implementation.md](stage2-implementation.md) for the route-by-route preservation map, [stage2-review.md](stage2-review.md) for independent review, and [stage2-design-check.md](stage2-design-check.md) for the design-system extension check.

### Delivered scope

- Home remains `/her`, with the household's greeting/date, future companion entry, next student visit, today's plans, My Day and clear home/memory/social shortcuts. Weather warnings retain their source/demo distinction.
- Four labelled primary destinations persist throughout the older-adult stack: Home, Friends, My Home and Memories. Compact screens use bottom navigation, wrapping when text needs room; wide web uses a side rail. Settings stays visible; subpages provide Back with a Home fallback.
- My Home groups requests, booked helpers, safety improvements, condition information and the existing digital house. All four original request categories, both timings, waiting requests, door guidance and three service-feedback values remain.
- Memories provides belongings, photos, audio, stories, decisions, family wishes and sharing. Item pages retain every existing decision value; Not now remains first and directly available. Other decisions use an explicit review dialog. Photos, recordings, stories, journey/tracking, thanks, optional worth and public-sharing controls reuse existing components/contracts.
- My Day derives visits, accepted activities, planned calls and dated booked helpers from the same home bundle. It labels older unfinished records instead of silently changing dates, includes outing/weather information, and distinguishes future reminders from existing plans.
- Friends exposes existing student/activity information and consent-based activity choices. Companion, matching and smart-home entries accurately explain future availability and provide usable navigation. No AI or device service was implemented.
- English/Japanese and shared reading preferences remain available across roles. The older-adult shell, content and reused controls use scalable text, larger targets and active-palette styling. Shared house motion honors reduced motion.

### Stage 2 file scope

New routes (under `apps/mobile/app/her/`):

```text
_layout.tsx
friends.tsx
my-home.tsx
my-day.tsx
help.tsx
helpers.tsx
house-information.tsx
safety.tsx
digital-house.tsx
settings.tsx
companion.tsx
smart-home.tsx
memories/index.tsx
memories/collection.tsx
item/[id].tsx
```

New implementation files: `apps/mobile/src/her/HerPage.tsx`, `Screens.tsx`, `HelpScreen.tsx`, `ItemDetail.tsx`, `plans.ts`; `apps/mobile/src/ItemWorth.tsx`. New verification/surface files: `apps/mobile/scripts/verify-stage2.cjs` and `apps/mobile/.impeccable/surfaces/older-adult.md`.

Updated application files: `apps/mobile/app/her/index.tsx`, `app/item/[id].tsx`, `app/family/house.tsx`; `apps/mobile/src/Audio.tsx`, `Home3D.tsx`, `Journey.tsx`, `NeighbourhoodMap.tsx`, `PhotoCarousel.tsx`, `SaferHome.tsx`, `StoryShare.tsx`, `i18n.tsx`. The verification fixture host `scripts/preview-design-system.cjs` was extended; the Stage 1 harness `scripts/verify-design-system.cjs` was adjusted for the moved help route and new Home readiness label. The complete Stage 1 harness was not rerun during Stage 2.

Documentation added: `stage2-implementation.md`, `stage2-review.md`, `stage2-design-check.md`; this progress file was updated. Existing Stage 0/1 work and the user's pre-existing lockfile change were retained. No Stage 2 edits to API functions, DataProvider, server/shared source, package manifests or Expo configuration; no dependencies were installed. DESIGN.md and its sidecar retain the incumbent Stage 1 tokens and component APIs.

### Executed Stage 2 checks

| Command / check | Exact outcome and scope |
| --- | --- |
| `npm.cmd run typecheck -w apps/mobile` | Exit 0, including the final localized-editor fix; no diagnostics |
| `npm.cmd run typecheck -w apps/server` | Exit 0 |
| `npm.cmd run contrast -w apps/mobile` | Sandbox attempt failed before checking pairs (`uv_os_get_passwd` / ENOMEM); approved retry exited 0, all **30 pairs passed** |
| `npm.cmd run build:hosted`, command-scoped `EXPO_PUBLIC_API_URL=same-origin` | Final exit 0; **1,015 modules**, approximately 3.1 MB JS, bundle `entry-29f1cade7d50ebaec0b690205ca5625f.js`; prior environment restored. Empty-cache/color-environment warnings were nonfatal. |
| `node apps/mobile/scripts/verify-stage2.cjs` layout portion | Captured **152 layouts**, zero measured horizontal-overflow or undersized exposed-control findings in the older-adult matrix. The combined run did not pass end-to-end: a later media race and a harness selector issue were investigated below. Do not treat this command as an overall exit-0 result. |
| `node apps/mobile/scripts/verify-stage2.cjs --interactions-only` | Exit 0; **6 scenario groups**, 4 empty-state routes and 6 legacy route smokes; zero uncaught exceptions in this run |
| `node apps/mobile/scripts/verify-stage2.cjs --editor-only` | Final exit 0; localized-editor workflow and **16 refreshed layouts/captures**, zero measured layout failures and zero uncaught exceptions |
| Impeccable `detect --json app/her src/her src/NeighbourhoodMap.tsx src/PhotoCarousel.tsx src/StoryShare.tsx` | Exit 0; two advisory existing PhotoCarousel dark-media colors, retained intentionally. One mechanical scan, not an accessibility certification. |
| `git diff --check` | Exit 0 after final source changes |

The 152-layout matrix comprises 15 older-adult routes × English/Japanese × widths 320/390/768/1440 in Extra Large/high contrast (120), plus four primary destinations × English/Japanese × 390/1440 × Normal/Large (32). Measurements inspect exposed DOM controls; SVG geometry and iframe contents are excluded. They do not certify every map hotspot or native control. The 16 final captures cover Home, Request Help, Memories and an item in both languages at 390/1440, Extra Large/high contrast. The reviewer and implementation agent inspected the actual rendered captures; two additional editor captures show retained Japanese draft text and saved/reloaded Japanese content.

The six interaction groups verified:

1. All four selected primary tabs, the honest companion placeholder, and return navigation.
2. Help failure/retry, exact existing request bodies for all four categories × both timings, and all three feedback values.
3. Decision cancel without mutation, confirmed Keep, immediate Not now, recoverable failed family decision, story save, public-sharing withdrawal and explicit opt-in.
4. Recording-consent request, reading-settings dismissal, activity acceptance and Not now.
5. Synthetic photo previous/next, saved-audio play/pause, media-filtered collections, all four digital-house views and its photos section.
6. Home-load failure/retry, unavailable weather, and clearly labelled demo warning.

Empty-state routes: `/her`, `/her/my-day`, `/her/helpers`, `/her/memories/collection`. Legacy render smokes: `/family`, `/family/house`, `/student`, `/item/sewing`, `/item/sewing?as=student`, `/stories` at English/Normal/390. They rendered without horizontal overflow. Existing 37-high student labels, 40-high family-wish controls and 32-high public-story chips remain outside this older-adult migration; the smoke result does not mean those routes meet the new touch-target standard.

Browser checks used installed Chrome 155 through DevTools Protocol, real mouse/key/text events and the actual compiled Expo Web app. An isolated localhost host served disposable in-memory fixtures; it never imported the database, reset real household data, or contacted AI/payment/device providers. Synthetic SVG photographs and a short silent WAV exercised media controls. These verify frontend behavior and outgoing API contracts, not actual Express mutations or remote integrations. Evidence is in ignored `apps/mobile/.impeccable/review/stage2-layouts.json`, `stage2-interactions.json`, `stage2-editor.json`, and the named PNG captures.

### Findings resolved and remaining limits

The first inspection found undersized map controls and missing web selected-tab semantics. The correction batch enlarged the labelled map controls and made selected-tab state explicit. Harness selectors were corrected to include radio controls and send a genuine Ctrl+A key chord; these were verification-script issues. The independent reviewer identified a Japanese editor defect: the displayed translation and initial draft differed, and an unnecessary story PATCH could invalidate `storyJa`. The editor now initializes from displayed localized prose, disables unchanged saves, retains dirty drafts across language changes with a readable hint, and disables typing during save. The fixture reproduces the actual server's translation invalidation. The final targeted test verifies no PATCH for unchanged text, exact edited Japanese payload, and retention after save/reload.

- One earlier rapid saved-audio play/pause check exposed an intermittent uncaught `AbortError`. The installed expo-audio web player ignores the promise returned by `HTMLMediaElement.play()`; a later identical interaction run passed without exceptions. This remains a documented existing media-library race, not a claim of universally error-free playback. No dependency code was patched.
- iOS/Android devices, VoiceOver/TalkBack, actual OS font scaling, native keyboard/IME, camera/microphone capture/upload, GPS, live backend/provider calls and remote directions were not tested. Native implementation remains unverified on devices.
- Existing legacy screens, public stories, SVG/3D spatial semantics and embedded maps still need their own accessibility work. Native reading preferences remain session-only. No full other-role workflow regression suite was executed.
- The application remains a demonstration without authenticated household authorization. Coming-soon modules do not supply AI conversation, matching, reminder delivery or device monitoring.

Final handoff: the independent finish reviewer resumed after a temporary usage limit and returned **ship** after confirming its sole localized-editor finding was resolved. The design documenter confirmed an ordinary extension of the incumbent system, preserving DESIGN.md and its sidecar. The pre-existing lockfile SHA-256 remains `F42FD20AA9D08324E340CC59DC84E3B8EF238E23D389A4A90869156559DF4315`. Final source-scope inspection confirms no changes to server/shared source, API functions, DataProvider or manifests. The disposable fixture host and dedicated test browser were stopped; regular user browser sessions were not touched.

**Stage 2 is complete at the implemented older-adult experience and this documented verification scope. Stop after Stage 2.** Stage 3 has not started.
