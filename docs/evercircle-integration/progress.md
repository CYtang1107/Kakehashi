# EverCircle integration progress and executed baseline

Date: 16 October 2026 (Asia/Kuala_Lumpur). **Stages 0-5 complete at their documented implementation/web-verification scope. Stage 6 and later work not started.** Repository `D:\kakehashi\Kakehashi`; initial baseline HEAD `8c9692a40214d3fbdd4f8221fc062274fb178fda`; Stage 3 starts from `96647b8`; Stage 5 starts from `dafc086`. Earlier-stage records below are historical. Native-device accessibility certification remains outstanding.

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

## Stage 3 — existing role experiences

15 October 2026. Earlier stop statements above are historical. Stage 3 continues from committed `96647b8` and preserves the completed older-adult shell. See [stage3-implementation.md](stage3-implementation.md) for route/workflow details, [stage3-review.md](stage3-review.md) for independent review and [stage3-design-check.md](stage3-design-check.md) for the source comparison with the incumbent design system.

### Delivered changes

Family retains Home, Digital House, Plan and Reports. Visit continuity is now a readable dated history rather than tiny SVG month labels; next recorded visit, students/readiness, memories, services, activities, letters, calls, safety and recorded payment modes remain available. Student retains Today's Visit, Add Item, Wallet and Team, with explicit numbered Before / With Her / After steps and larger task controls. Helper keeps its checked, skill-filtered board and existing acceptance/booking/earnings behavior; recorded service feedback is now visible in own jobs. Public story readers keep the globe and text list, media, public journeys and moderated comments, with visible heart/comment/share labels and focus-managed dialogs. Item pages preserve family wishes, every decision and hold state, media/icon actions, handover/delivery, optional value, sharing and moderation. Not now remains first and directly available; other student choices receive explicit review.

Shared controls and typography extend the Stage 1 system. Family/student Expo tab state and destinations remain, with wrapping one/two-row labels and semantic selected state. Secondary role/language/reading controls are grouped under Settings to reduce toolbar height; Back remains visible. Shared `useStoryDraft` applies the Stage 2 localized-editor safeguards to both item presentations. Recoverable feedback now covers notes, reports, letters, calls, activities, weather operations, safety additions and selection-dependent wallet/helper loads. Failed saves retain the relevant entry. Public stories load independently of the household endpoint. Globe automatic motion respects reduced-motion preferences.

### Exact Stage 3 file scope

Updated routes:

```text
apps/mobile/app/family/_layout.tsx
apps/mobile/app/family/index.tsx
apps/mobile/app/family/house.tsx
apps/mobile/app/family/plan.tsx
apps/mobile/app/family/reports.tsx
apps/mobile/app/student/_layout.tsx
apps/mobile/app/student/index.tsx
apps/mobile/app/student/add.tsx
apps/mobile/app/student/team.tsx
apps/mobile/app/student/wallet.tsx
apps/mobile/app/worker/index.tsx
apps/mobile/app/stories/index.tsx
apps/mobile/app/item/[id].tsx
```

Updated shared/source files:

```text
apps/mobile/src/Community.tsx
apps/mobile/src/Handover.tsx
apps/mobile/src/HouseFuture.tsx
apps/mobile/src/Outing.tsx
apps/mobile/src/SaferHome.tsx
apps/mobile/src/Services.tsx
apps/mobile/src/StoryGlobe.tsx
apps/mobile/src/StoryShare.tsx
apps/mobile/src/Touchpoints.tsx
apps/mobile/src/VisitThread.tsx
apps/mobile/src/Weather.tsx
apps/mobile/src/design-system/ConfirmationDialog.tsx
apps/mobile/src/design-system/Controls.tsx
apps/mobile/src/her/ItemDetail.tsx
apps/mobile/src/i18n.tsx
apps/mobile/src/ui.tsx
```

New files: `apps/mobile/src/design-system/RoleTabBar.tsx`, `apps/mobile/src/useStoryDraft.ts`, `apps/mobile/scripts/verify-stage3.cjs`, `apps/mobile/.impeccable/surfaces/roles.md`; documentation `stage3-implementation.md`, `stage3-review.md`, `stage3-design-check.md`. Updated verification host `apps/mobile/scripts/preview-design-system.cjs`, previous-stage readiness selector in `scripts/verify-stage2.cjs`, and this progress record. Existing API functions, DataProvider, shared contracts, server source, package manifests, lockfile and Expo configuration were not edited. No dependency/browser installation, reset, real household mutation, commit or deployment occurred.

### Executed checks

| Command / check | Outcome and precise scope |
| --- | --- |
| `npm.cmd run typecheck -w apps/mobile` | Final source exit 0; no diagnostics. An initial implementation pass caught duplicate style properties and an unavailable transitive type import; these were corrected, using Expo's exported component prop type. |
| `npm.cmd run typecheck -w apps/server` | Exit 0 |
| `npm.cmd run contrast -w apps/mobile` | Sandbox attempt failed before checks with tsx `uv_os_get_passwd` ENOMEM; approved retry exit 0, all **30 pairs passed** |
| `npm.cmd run build:hosted`, command-scoped `EXPO_PUBLIC_API_URL=same-origin` | Final source exit 0; **1,017 modules**, approximately 3.1 MB JS, `entry-d692f5b2a83f8b8766c90916abcfd535.js`. Prior environment restored. Color-environment/empty-cache warnings were nonfatal. |
| `node apps/mobile/scripts/verify-stage3.cjs`, layout portion | Second inspection records **116 layouts**, zero measured horizontal overflow, zero undersized exposed controls and zero uncaught exceptions. Combined command later stopped on a harness checkbox-name selector, so this is not reported as a complete exit-0 run. |
| `node apps/mobile/scripts/verify-stage3.cjs --interactions-only` | Exit 0, **15 scenario groups**, zero uncaught exceptions |
| `node apps/mobile/scripts/verify-stage3.cjs --drafts-only` | Exit 0; both student and older-adult Japanese item workflows pass localized initial value, no unchanged PATCH, dirty language switch and save/reload checks. An additional focus probe exposed a Settings return issue, listed below; exit 0 did not certify that nonasserting probe. |
| `node apps/mobile/scripts/verify-stage3.cjs --review-fixes` | Final source exit 0; **24 refreshed layouts/captures**, zero measured layout failures and zero uncaught exceptions. EN/JA compact visit summary is fully within the first viewport; direct activeElement equals localized Settings after Reading settings → Escape in both languages. |
| `node apps/mobile/scripts/verify-stage2.cjs --interactions-only` | Exit 0, all **6 prior older-adult scenario groups**, 4 empty-state routes and 6 legacy route smokes; zero uncaught exceptions in this run, including synthetic photo/audio controls |
| Impeccable web `detect --json` on changed route/role targets | Exit 0; **6 advisory** existing colors in family memory views and public examples/globe, deliberately retained. One scan; no native accessibility verdict. |
| `git diff --check` | Exit 0 after source corrections |

Matrix composition: 12 routes × English/Japanese × 320/390/768/1440 in Extra Large/high contrast (96); the 12 routes at English/Normal/1440 (12); With Her/After states × English/Japanese × 390/1440 in Extra Large (8). Twelve routes: family Home/House `?view=map`/Plan/Reports, student Visit/Add/Wallet/Team, Helper, Stories, family Item and student Item. OS font scaling was not simulated. DOM measurement excludes SVG geometry and embedded iframe contents; hidden controls are excluded. Passing layout measurements do not certify spatial hotspots, accessibility-tree behavior or every off-screen state.

The 15 passing scenario groups verify:

1. Report wording flag, acceptable rewording, personal-read gate, failed send retaining text, retry and family access to the saved report.
2. Field-note save and explicit recording-consent withdrawal/restoration.
3. Student decision cancel without mutation, immediate Not now, confirmed Pass, story save, failed handover retaining recipient/retry, sharing withdrawal/explicit opt-in without automatic audio, and family wish.
4. Optional estimate and creation of a new item in the current room.
5. Letter preparation, note save, personal-read checkpoint, print/mail statuses and call logging.
6. Wallet load failure/retry, demonstration payout, goal save/removal.
7. Readiness withdrawal payload and fixture sign-off withdrawal.
8. Demonstration checkout, recorded payment presentation and proceeds preference.
9. Student job posting with price consent and booked-service completion.
10. Checked-helper board load, failed acceptance/retry and booked status.
11. Public heart/undo, pending comment submission and labelled globe-story dialog/Escape.
12. Public stories remaining available after household-load failure and their own read failure/retry.
13. Explicit student comment moderation.
14. All four digital-house views and recorded-room-photograph section.
15. Family house note and common Settings → reading-dialog access/dismissal.

These are actual frontend input events and outgoing request assertions against **disposable in-memory fixtures** derived from existing seed data. The fixture host does not import db.ts, change saved files or contact providers. Its modeled report checks, readiness/commission/payment transitions and comment moderation do not execute or certify the real Express handlers. Contact-pattern rejection, external sharing sheets/clipboard, real Stripe test checkout, physical media capture/upload and GPS were not exercised. Prior synthetic media tests cover playback/gallery controls, not a physical-device recording workflow.

Evidence is ignored under `apps/mobile/.impeccable/review/`: `stage3-layouts.json`, `stage3-interactions.json`, `stage3-drafts.json`, `stage3-review-fixes.json`, Stage 2 interaction evidence, and the 24 named Stage 3 PNG captures. Five surfaces (family, student, helper, stories, student item) × English/Japanese × 390/1440, plus With Her/After × English/Japanese at 390. Final English desktop captures use Normal/two columns with high contrast; other captures use Extra Large/high contrast. At 1440/Extra Large, viewport-height eligibility intentionally selects ordinary scrolling. Captures reset the document/internal scroll to top and show the viewport; they are not native or full-scroll-content screenshots. The implementation agent and independent reviewer opened every required capture.

### Findings and remaining limits

The first inspection exposed story-action overflow and toolbar/visit-step controls consuming excessive compact space. One correction batch made actions wrap and shortened/grouped navigation controls. Harness failures involved a malformed quoted CSS expression, an incorrect wish-key name and a checkbox's icon glyph in textContent; the selectors were corrected without changing API behavior. Compilation caught and resolved mechanical migration issues before browser verification.

The independent review returned **fix** for exactly two issues: compact family alerts displaced visit continuity/next visit, and closing Reading settings after the Settings transition left focus on BODY. The final correction adds a compact recorded-visit summary before alert details and a stable Settings focus return. Alerts, enlarged text and data sources remain. Focus-only evidence explicitly distinguishes BODY from an unlabeled control; the next Tab had reached Settings, but immediate restoration was missing.

Native devices/screen readers/OS font scaling/IME, safe-area gestures and hardware performance remain untested. Native reading preferences remain session-only. Some retained custom selectors/semantic surfaces still use static palette values; spatial SVG/WebGL/maps and server-hosted HTML require separate accessibility verification. Existing stored English-only descriptions and provider strings can still fall back to English. Stage 2's intermittent expo-audio web play/pause `AbortError` remains a known library limitation despite a passing Stage 3 media regression run. Demo role selection is not authentication. No AI/matching/device features or Stage 4 work were added.

Final handoff: the independent reviewer scored **both listed corrections resolved** and returned **ship** for that bounded verdict pass. Its initial 24-capture/source review and subsequent verdict are preserved in `stage3-review.md`; this is not a blanket native/live-integration approval. The documenter rechecked the final family/toolbar edits and preserved the canonical design files. Final `git diff --check` passed. Lockfile SHA-256 remains `F42FD20AA9D08324E340CC59DC84E3B8EF238E23D389A4A90869156559DF4315`, and no server/shared/API/data/config/manifest changes were found. The disposable fixture host and dedicated temporary Chrome were stopped; regular browser sessions were untouched.

**Stage 3 is complete at this implementation and verification scope. Stop after Stage 3.** Stage 4 has not started.

## Stage 4: companion, approved profile and privacy

15 October 2026. Stage 4 baseline `2903735`; the working tree was clean at its start. The user's Stage 4 frontend simulation request takes precedence over the earlier speculative roadmap. Existing `/her/companion` is now a functional scripted companion, with new private `/her/profile` and `/her/privacy` routes inside the existing older-adult shell. Stage 4 is complete at the documented implementation/web-verification scope. No later-stage implementation was added.

### Delivered and preserved

- [x] Deterministic English/Japanese intent engine, accessible text conversation, optional starters, visible local reply delay/Stop, truthful unsupported states and existing-feature navigation.
- [x] Nine normalized interests, including separate gardening/orchid candidates; explicit Remember / Not now; no automatic approved memory or matching consent.
- [x] Editable/deletable approved interests and structured private profile preferences; clear save/delete feedback and Cancel preservation.
- [x] Independent master/per-interest matching consent; edits/deletion/revocation immediately remove eligibility; no actual matching or sharing transport.
- [x] Extend existing fictional Michiko Tanaka / household `tanaka`; no unrelated resident/profile merge or private household-record inference.
- [x] Isolated older-adult feature context cooperates with DataProvider. Household bridge exposes name and next planned future visit date only.
- [x] Approved profile and permission persistence through web localStorage/native Expo FileSystem source; transcripts and unapproved suggestions remain session-only.
- [x] Failed writes show Retry and pause matching eligibility; corrupt or unrelated storage fails closed with a non-overwriting session fallback.
- [x] Reuse Stage 1 shared UI and reading preferences; preserve all existing route/API contracts and role workflows.

Full architecture, file inventory, persona mapping, persistence policy and verification scope: [stage4-implementation.md](stage4-implementation.md). Independent review: [stage4-review.md](stage4-review.md). Design-system comparison: [stage4-design-check.md](stage4-design-check.md).

### File scope

New `apps/mobile/src/evercircle/`: `FeaturePage.tsx`, `store.tsx`, `companion/{CompanionScreen.tsx,engine.ts,bridge.ts}`, `profile/{ProfileScreen.tsx,PendingInterests.tsx,model.ts}`, `privacy/{PrivacyScreen.tsx,permissions.ts}`, `demo/{persona.ts,storage.ts,storage.web.ts}`. New route wrappers `app/her/profile.tsx` and `privacy.tsx`; updated existing `companion.tsx` and older-adult `_layout.tsx`.

Updated `src/her/Screens.tsx`, `src/her/HerPage.tsx`, `src/design-system/ScreenFrame.tsx`, `src/ui.tsx`, `src/i18n.tsx`; additions are navigation entries, localized feature vocabulary and optional compatible shared props. New verification scripts `scripts/verify-evercircle.cjs`, `scripts/verify-stage4.cjs`; Stage 2 companion smoke now expects the available scripted demo. Added `.impeccable/surfaces/companion.md` and the three Stage 4 documents above; updated this progress record.

Mobile `package.json` and root lockfile each add one direct `expo-file-system ~57.0.7` declaration for an already installed module; no package download/install was executed. Final lockfile SHA-256: `2AD63B82603CBD481DAB17047B2641527A33F9867C96DBBD9636EF40F6B805D5`. Server/shared/API/DataProvider/root layout/Expo configuration and canonical PRODUCT/DESIGN/sidecar files remain unchanged. No real household mutation, AI request, commit or deployment occurred.

### Verification and correction record

Mobile typecheck and server typecheck exit 0. Pure feature verification initially passed 11 groups; the reviewer correction adds a focused serialization/hydration test, and the final command passes **12 groups**. The 30 shared contrast checks pass on an approved retry after the sandbox's tsx launch failed before checking. The final `build:hosted` export exits 0: 1,031 modules, approximately 3.2 MB JS, `entry-c5c043ee81bfab2c95a68e7899607872.js`, using command-scoped same-origin API configuration and restoring the previous environment. `npm.cmd ls expo-file-system -w apps/mobile` exits 0 with existing version 57.0.7 deduped. One Impeccable detector scan exits 0 with no findings on the changed feature/layout targets; this is limited web source analysis.

Initial browser inspection exposed disappearing feedback when the final pending suggestion was dismissed, and excessive introductory content before the welcome. One correction batch retained feedback, moved the welcome ahead of secondary information and made chat auto-scroll target the latest reply. The original full script then completed 48 layouts but stopped on a hidden inactive Expo stack input selector; the harness was fixed to select visible accessibility-exposed inputs and assert typed values. The resumed run exited 0 with **60 layouts, eight scenario groups, zero measured overflow/undersized exposed controls and zero uncaught exceptions**. This was pre-review evidence, not the final corrected storage verdict.

The independent reviewer opened all 24 EN/JA compact/wide captures and returned **fix** for one material issue, S4-1: pending normalized interest IDs were persisted before Remember despite privacy text promising approval before storage. The correction keeps pending candidates in memory only: both adapters call a shared serializer that writes an empty pending list, and hydration ignores legacy pending IDs. Approved interests still persist privately after Remember, independent of future matching consent. A browser reload scenario now asserts that visible unapproved suggestions are absent from storage and disappear on reload. This correction adds no new UI or matching behavior.

Existing-role regression commands were executed against the Stage 4 integration: `verify-stage3.cjs --interactions-only` exit 0, all **15 groups**; `verify-stage2.cjs --interactions-only` exit 0, all **six groups**, four empty-state routes and six legacy route smokes, zero exceptions. These cover reports, notes/consent, decisions/Not now, story sharing, letters/calls, demonstration wallet/payments, readiness, service jobs/helper acceptance, public interactions/moderation, digital-house access, older-adult help/feedback, weather, activities and memory controls. Fixture evidence does not certify real server handlers or external providers.

The final corrected `node apps/mobile/scripts/verify-stage4.cjs` completes with **exit 0: all 60 layout cases and nine scenario groups**, no measured overflow/undersized exposed controls and no uncaught exceptions. All 24 same-path screenshots were refreshed and opened. The independent reviewer scored **S4-1 resolved** and returned **ship** for that bounded fix-list verdict. It inspected the storage boundary, focused tests, final JSON and eight relevant refreshed privacy/conversation captures; its original full 24-capture review remains historical in the same document. This is not a renewed full-surface or native release approval.

The required documenter inspected final source, recorded the existing-world extension and actual local differences in `stage4-design-check.md`, and preserved canonical design/product artifacts. Final `git diff --check` passes. The disposable fixture host was stopped and the dedicated temporary Chrome closed through its own debugging endpoint; ordinary browser sessions were untouched. The lockfile change remains precisely the direct dependency declaration described above. **Stop after Stage 4.**

### Limits and deferred work

Native storage/IME/safe areas/gestures, VoiceOver/TalkBack, physical recording and OS font scaling remain untested. Native reading preferences remain session-only as previously documented. The local fictional profile is neither encrypted storage nor authenticated identity. Conversation recognition is deliberately limited and can propose ambiguous candidates, which remain unapproved. Optional voice features, real AI, friend matching, device controls and reminder scheduling are not implemented. Existing provider/media limitations from earlier stages remain.

Impeccable context also reported an unset build-path preference for future Persuade/Experience surfaces. This Operate extension is code-led; no configuration drift was repaired. Canonical design/product scope text remains historical, with the documenter's comparison recording the extension instead of silently rewriting it.


## Stage 5 ? friendship demonstration (16 October 2026)

### Delivered scope

- Eight authored fictional older-adult profiles plus the existing Tanaka identity; demo switching is explicitly local and limited to Friends.
- Deterministic 40/20/15/10/10/5 matching, pure bilateral eligibility checks, approved-field allowlists and explainable human-first recommendations. Missing optional fields earn zero without reweighting.
- Independent master, hobby and field-sharing controls; private profile revision changes invalidate extra field grants. No household records, recordings or unapproved companion candidates enter matching.
- Structured agent permission/summary/comparison/score/recommendation events and explicit user-decision events, without transcript exchange.
- Confirmed invitations, recipient-only acceptance/decline, accepted-only local messaging, labelled scripted replies, bilateral block/unblock and local reports.
- Six fictional opt-in hobby communities with approximate regions. Existing students and household activity accept/Not now calls remain accessible for Tanaka.
- Isolated persisted SocialProvider cooperates with the Stage 4 provider. Storage errors pause new actions; withdrawal/blocking is immediate in memory, with Retry. Corrupt storage offers a non-overwriting temporary session.
- All new text localized in English/Japanese and all new screens reuse the Stage 1 shared design system and global reading preferences.

Architecture, exact files, routes, permissions, algorithm and prototype limits: [stage5-implementation.md](stage5-implementation.md).

### Executed checks to date

Mobile and server typechecks exit 0. Pure domain commands pass: verify-social.cjs **14 groups**, verify-evercircle.cjs **12 groups**. The unchanged contrast suite passes **30 combinations**, exit 0, on an approved outside-sandbox retry after tsx failed before running checks with uv_os_get_passwd ENOMEM.

The initial export succeeded but used the default localhost API configuration; no browser verdict used that export. It was rebuilt using command-scoped EXPO_PUBLIC_API_URL=same-origin for the disposable fixture host. Both exports exit 0. Initial browser execution was blocked by the sandboxed Chrome process exiting without exposing port 9223; an approved hidden dedicated Chrome launch resolved the verification environment.

The first functional browser run completed approval/invitation/acceptance/messages but stopped because the harness expected a disabled HTML textarea. React Native Web correctly represents editable=false as readOnly. The assertion was corrected to inspect readOnly. The subsequent complete Stage 5 run passed **80 layouts and seven scenario groups**, zero measured overflow/undersized exposed controls, zero uncaught exceptions and zero household mutation requests. Layouts cover five routes, English/Japanese, widths 320/390/768/1440 and normal/Extra Large text with high contrast in enlarged cases.

Existing-role fixture regressions pass: Stage 3 --interactions-only **15 groups**, Stage 2 --interactions-only **six groups**, all exit 0, no exceptions. These cover student reports/notes/consent/readiness/wallet, family dashboard/reports/letters/calls/payments, helper jobs, public story interactions, item decisions and sharing, older-adult help/feedback/activities/media/digital-house routes. Fixture evidence does not certify real server handlers or external providers.

One batched visual inspection opened all 21 initial captures. It identified a message usability gap: a new bubble could remain off screen. One correction batch adds reduced-motion-aware latest-message scrolling and places the longer messaging privacy explanation in an expandable section. Mobile typecheck and corrected same-origin export pass (1,046 modules, approximately 3.2 MB JS; entry-9116a46201cc9b017c41ab5985108253.js). Final browser confirmation and independent review are pending below.

The Impeccable detector ran once on changed social routes/components and the companion privacy entry: exit 0, no findings. This is limited web source analysis, not a native accessibility verdict. No dependency installation, server implementation, AI service, commit or deployment occurred.


Final corrected Stage 5 browser output is complete: **80 layout cases, seven scenarios, no failures or uncaught exceptions** in stage5-verification.json. The session process handle expired when the chat resumed before the final exit code was collected; the earlier complete run's exit 0 and this completed final JSON are distinguished here. All 27 final captures were opened; latest-message shots confirm the bubble appears above the composer. Stage 4 --interactions-only also exits 0 with **nine groups** on the final build. Its first resumption attempt could not reach the stopped fixture host and ran no scenarios; after restarting the disposable host, the full command passed.


The required independent finish reviewer opened all 27 captures and inspected the privacy/state boundaries, returning **ship** with no material findings within the **local Expo Web demonstration** scope. See [stage5-review.md](stage5-review.md), including all five contract sections. No native release approval is implied. The separate design-system comparison is completing; no post-review application edits were made. The dedicated Chrome was closed through its own debugging endpoint and the disposable fixture host stopped; ordinary browser sessions and household records were untouched.


### Completion and remaining limits

The required documenter completed [stage5-design-check.md](stage5-design-check.md), finding compatibility with the incumbent system. It preserved PRODUCT.md, DESIGN.md and the design sidecar, recording their historical Stage 1 scope without an unsolicited rewrite. Stage 5 is complete at the documented local Expo Web scope. No post-review application corrections were needed. Final diff whitespace checks pass. Server/shared code, API/DataProvider, package manifests and lockfile remain unchanged. The dedicated temporary Chrome profile was removed after its resolved path was verified inside the workspace.

Native persistence/IME/safe areas/OS text scaling and VoiceOver/TalkBack remain untested. Demo switching is not authentication; local storage is not encrypted, reports are not delivered to a moderator, no remote messaging occurs, and simultaneous-tab synchronization is unsupported. Accepted chats are bounded to 100 messages of up to 800 characters per pair. These are stated prototype limits, not claims of production security or native certification. Existing external-provider/media limits remain as recorded in earlier stages. **Stop after Stage 5.**

## Stage 6 — smart-home and daily-assistance demonstration (16 October 2026)

Baseline `aafc0bb`, clean working tree at start. This Stage 6 request takes precedence over the earlier speculative roadmap. The user confirmed extending the existing calm, large-text My Home and My Day screens.

- Eight mock devices across Living Room, Bedroom and Kitchen, with explicit labelled actions, simulated states and bounded activity history.
- One deterministic EN/JA command interpreter shared by Smart Home and companion; room/device clarification for ambiguity, clear rejections for unsupported instructions, and no compound or unrestricted natural-language execution.
- Morning and Evening routines with exact previews, already-set indicators, Cancel and a separate simulated Apply action.
- Household-scoped local demonstration storage, schema validation, serialized writes, visible failures/Retry and a non-overwriting temporary session after corrupt reads.
- Local dated reminders and personal activity scheduling, completion/undo, status labels, hobby suggestions, upcoming student visit reminder and existing trusted-person routes.
- Existing visits, accepted activities, calls, helpers, weather advice, outings, maps and past plans retained. Visit projections never create duplicate stored appointments.
- Companion executes supported simulated commands through the shared service, summarizes today's existing plans and local reminders, and links to My Day. Ambiguous commands link to the unresolved device choices in Smart Home.
- Optional detected browser speech input with per-command consent, text review before applying, Stop and cleanup. Optional local-voice spoken feedback is explicit. Native uses text fallback with no new dependency.
- Home3D, FloorPlan, digital-house visuals, recorded safety statuses, memories, home management and helper workflows retain their existing implementation. No hardware, notification or messaging transport was added.

Architecture, privacy/storage boundaries, supported language patterns and verification detail: [stage6-implementation.md](stage6-implementation.md).

Initial checks pass: mobile/server typechecks; 11 new home/assistance domain groups; 12 existing companion/profile groups; 14 social groups; 30 shared contrast combinations on an approved retry after the sandbox prevented tsx from launching. The first complete browser run passed 64 layouts and nine scenario groups, no measured overflow/undersized exposed controls and no uncaught exceptions. Initial selector and later speech-stub setup errors were test-harness failures and are distinguished from application results in the implementation record.

One visual correction batch shortens the simulation introduction, retains reminder-completion feedback when cards move and places suggested-activity forms after their trigger. Final confirmation and independent skill handoffs are recorded below.

The corrected same-origin export exits 0: 1,062 modules, approximately 3.3 MB JS, `entry-906908efc9dedc10872048a39b7c2626.js`. Mobile typecheck passes again. Final Stage 6 browser verification exits 0 with **64 layouts and nine scenario groups**, zero measured overflow/undersized exposed controls, zero uncaught exceptions and zero household mutation requests. Layouts cover four routes, EN/JA, widths 320/390/768/1440 and Normal/Extra Large text with high contrast in enlarged cases. Stubbed speech input/output confirms consent, Cancel, review-before-apply and text fallback without recording audio. All **35 final captures** were opened, including device, routine, reminder and form details.

Existing workflow browser regressions all exit 0 with no uncaught exceptions: Stage 3 **15 groups**, Stage 2 **six groups** plus its empty/legacy route checks, Stage 4 **nine groups**, Stage 5 **seven groups** (`--interactions-only`). These preserve helpers, safety, item decisions/Not now, stories/media/consent, weather, four house views, reports, letters/calls, demo payments, profile/privacy, friendship invitations/acceptance/messages/block/report and communities. These are disposable fixture checks, not real-provider certification.

The independent Impeccable finish reviewer opened all 35 captures and sampled the primary screen/domain/store/voice-web/companion sources and integration diff, returning **ship** with no material fixes within that **local Expo Web demonstration** scope. Its five contract sections, source sampling boundaries and native exclusions are recorded in [stage6-review.md](stage6-review.md). No application edits followed that verdict.

The separate documenter completed [stage6-design-check.md](stage6-design-check.md), comparing final source and eight representative captures against the incumbent system. It found compatibility and preserved PRODUCT.md, DESIGN.md and the design sidecar, reporting their historical Stage 1 inventory drift without an unsolicited rewrite. The compact first device card's continuation through scrolling at Extra Large text is explicitly documented.

Final whitespace checks pass. Server/shared/API/DataProvider, Home3D/FloorPlan, package manifests, lockfile and canonical design files remain unchanged. Lockfile SHA-256 remains `2AD63B82603CBD481DAB17047B2641527A33F9867C96DBBD9636EF40F6B805D5`. No dependency installation, real hardware action, external message, commit or deployment occurred. The dedicated temporary Chrome was closed through its own debugging endpoint, its profile removed after verifying the resolved workspace path, and the disposable fixture host stopped. Ordinary browser sessions and household data were untouched.

Native persistence/IME/safe areas/OS text scaling/gestures, VoiceOver/TalkBack and physical microphone/provider behavior remain untested. Native voice uses the text fallback. Web speech recognition depends on the browser/provider; spoken output requires an available local voice. Local storage is neither authentication nor encrypted storage, and simultaneous-tab synchronization is unsupported. My Day retains its existing household-data availability gate; the independent Smart Home route remains available without the household API. Personal tasks are dated local records, not background alarms or notification subscriptions. Existing external-provider/media limits remain as documented in earlier stages.

**Stage 6 is complete at the documented implementation and local Expo Web verification scope. Stop after Stage 6.** No later-stage work was added.

## Stage 7 — orchestration, collaboration and KAKEHASHI integration (16 October 2026)

Implemented one typed deterministic orchestrator around the existing seven logical modules, centralized permission validation, confirmation enforcement for invitations/acceptance, sanitized transient events and companion routing into existing KAKEHASHI features. The new developer route `/developer/agents` is outside primary navigation and lazy-loaded. It contains isolated fictional workflows, separate save/share/invite decisions, recipient acceptance, a blocked scenario, node/transition inspection, mutation-free replay, reduced motion, reset and persona controls. Production exports require explicit `EXPO_PUBLIC_EVERCIRCLE_DEVELOPER=1`; the flag and persona switch are not authentication.

The existing product remains primary. Memories, visits, help requests, family care reports, recorded safety and mock home states keep their existing boundaries. No optional family social-summary sharing, helper booking, public sharing, remote messages, hardware, new dependency or backend changes were introduced.

Implementation and limits: [stage7-implementation.md](stage7-implementation.md). Surface contract: `apps/mobile/.impeccable/surfaces/agent-collaboration.md`.

Verification so far: mobile and server typechecks pass; 13 orchestration, 12 companion/profile, 14 social and 11 home domain groups pass. All 30 shared contrast checks pass on an approved outside-sandbox retry after tsx failed before test execution with `uv_os_get_passwd ENOMEM`. The social test fixtures now mark explicit confirmation; Stage 7 tests independently reject missing confirmation at orchestrator and reducer boundaries. Stage 4's old unconditional friendship reply expectation now checks the actual missing-permission reply, and its unsupported-device example uses a thermostat because `my lights` now legitimately requests clarification.

The first two presentation exports pass. The visually corrected export has 1,071 modules, approximately 3.3 MB main bundle `entry-631c6ed20dba45ca23f80b97ea14c52a.js`, separate approximately 22 KB `DeveloperScreen-5af89006c8cf5529b9aa7fdfe2c42eea.js`. No dependency installation; lockfile SHA-256 remains `2AD63B82603CBD481DAB17047B2641527A33F9867C96DBBD9636EF40F6B805D5`.

Initial and corrected Stage 7 browser runs both pass 32 responsive cases and nine functional groups with no measured overflow/undersized controls or uncaught exceptions. All 15 captures were opened in each bounded visual pass. The correction uses full-width graph nodes for narrow/enlarged layouts; it also distinguishes saved/shared events and provides specific companion permission-denial replies. The final run verifies actual companion traces, isolated demo storage, invitation cancellation and acceptance, node inspection, blocked workflow, manual replay, timed play/pause and existing-feature destinations. Source detector returned `[]` once on changed UI; that is limited source analysis, not native certification. A hidden dedicated Chrome required an approved outside-sandbox launch after the sandboxed process exited before exposing its port.

Existing Stage 4 browser interactions pass all nine groups on the final build. Remaining existing workflow regressions and mandatory independent Impeccable handoffs are being recorded below. No later-stage work is authorized by this entry.

### Final verification and completion

Stage 5 browser regressions passed all seven groups. Stage 6 then caught an overly broad unsupported-intent fallback: the older companion parser classified curtain commands as unsupported before the existing device interpreter could clarify them. The guard now applies only to the companion module. Fan/curtain regression cases were added to the orchestrator suite. Mobile typecheck, all 13 orchestrator groups and the subsequent export pass. This functional correction does not change the developer UI; its reviewed bundle remains identical. The final main bundle is `entry-05fc1c2213d199fc54ea7541ae35bd10.js` (3,276,592 bytes), with `DeveloperScreen-5af89006c8cf5529b9aa7fdfe2c42eea.js` (22,017 bytes).

After that correction, the full Stage 6 interaction suite passed **nine groups** and Stage 3 passed **15 groups**, both exit 0 with no uncaught exceptions. Stage 2's first run passed its six workflow assertions but exited 1 after a story-player `play()`/`pause()` AbortError; its output is preserved as `stage7-stage2-first-run.json`. An unchanged rerun completed **six groups and ten empty/legacy route checks**, with zero exceptions/failures in `stage2-interactions.json`. The execution handle expired during the session interruption before its exit code was collected, so the completed JSON is the evidence for that rerun. No audio code or test expectations were changed to suppress the exception. This is a recorded intermittent media limitation, not a claim of provider or physical audio certification.

The required independent finish reviewer opened all 15 Stage 7 screenshots and sampled the final source and privacy boundaries, returning **ship** at the **local Expo Web prototype** scope with no material findings. [stage7-review.md](stage7-review.md) contains all five review-contract sections. The required documenter produced the complete [stage7-design-check.md](stage7-design-check.md), comparing the final code and six representative EN/JA desktop/mobile captures to the incumbent system and preserving canonical design files. Its final chat response was interrupted by a usage limit; on resumption the parent verified the written report, including its evidence, comparison, limitations and five-line system summary.

Final whitespace checks pass. Server/shared/API/DataProvider, family report implementation, house visualizations, package manifests, lockfile and canonical design documents remain unchanged. No dependency installation, external message, hardware action, commit, deployment or Stage 8 work occurred. The fixture and dedicated browser endpoints were no longer running on resumption; the task-created `.stage7-chrome` profile was removed only after verifying its resolved absolute workspace path. Ordinary browser profiles were untouched.

**Stage 7 is complete at the documented implementation and local Expo Web verification scope. Stop after Stage 7.** Native devices, OS font scaling/gestures, VoiceOver/TalkBack, physical providers and production authorization are not certified by these fixture checks. Existing local-storage and simultaneous-tab limitations remain.

## Stage 8 — final integration, testing and demo (16 October 2026)

No new product features. Brought the team's demo pictures, see-through pixel icons and the floor-plan pin fix from `main`; removed the unused "coming soon" companion screen; made the Stage 5 interest-approval test wait for each save; added `verify-stage8.cjs` (private companion conversation never reaches family or student screens, the server or storage; fictional and simulated labels) and `verify-all.cjs` (runs every suite with clean browser storage). `render.yaml` now includes the agent-collaboration screen in hosted builds.

Results: both typechecks pass; all 11 suites pass (50 domain checks; browser Stages 2–8: 6, 15, 9, 7, 9, 9 and 3 groups, Stage 7 with 32 layouts, zero exceptions). Full report, demo script, untested items and production gaps: [stage8-final.md](stage8-final.md). **Not production-ready.**
