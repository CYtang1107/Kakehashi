# Frontend usability and accessibility audit — Stage 0

15 October 2026. Method: source inspection of every screen, shared UI/theme, native bridges and server HTML; executed contrast check and web export. No screen redesign or fixes were made. No application screenshots or visual regression fixtures were found (the committed PNGs are design/logo assets). No browser automation, native emulator/device session, VoiceOver, or TalkBack session was exercised. Findings explicitly distinguish verified code from risks needing interaction testing.

## Platform and implementation verdict

**Partial platform conformance; insufficient evidence for accessibility sign-off.** This is a React Native/Expo application with Router stacks/tabs and native media/location modules, not a separate web port. Its custom shared controls, incomplete inset/focus handling, gesture-led visualizations and compact typography need improvement. No disabled system-back or edge-swipe override was found; do not claim those gestures are broken.

The design has a coherent KAKEHASHI identity: night-indigo frame, paper surfaces, a visit thread, typed consent choices and bilingual content. Preserve that product meaning while planning a complete elderly-friendly presentation. Most audited text colors are already strong; the principal systemic problems are sizing, overload, focus semantics, feedback and lifecycle handling.

## Source-based health score

Scores are provisional implementation assessments, not measured compliance, frame-rate or user-study results. A low runtime confidence is not converted into a claimed runtime failure.

| Dimension | Score / 4 | Evidence |
| --- | --- | --- |
| Accessibility | 1 | Field label association absent by default; multiple small targets; unlabeled visual subcontrols; no complete modal focus strategy |
| Performance | 2 | Low-resolution house rendering and compressed photo capture help; eager lists, continuous visuals and large exported font set remain |
| Appearance/theming | 3 | Strong centralized color/text base and 17 passing text pairs; inline sizes/colors and no dark scheme |
| Platform conformance | 2 | Router/native APIs are sound foundations; compact custom controls, incomplete body insets and no reduced-motion handling |
| Adaptivity | 2 | One-column/two-column layouts exist; breakpoint depends only on width, independent scroll panels and fixed-height controls need scaling/short-height tests |
| **Total** | **10 / 20** | **Acceptable foundation; significant accessibility work required** |

Issue count: **0 demonstrated P0, 9 P1, 6 P2, 0 P3**. P1 means major usability difficulty or a verified/potential accessibility barrier to resolve before release; P2 means a meaningful improvement with a workaround. No rendered screen failure is asserted from source alone.

## Prioritized findings

### U01 — P1: Small shared text and safety metadata

**Location:** `src/theme.ts:36`; `src/ui.tsx:226`, `:270`; `app/her/index.tsx:85`, `:95`, `:153`; family/student layouts. **Category:** accessibility/typography. Shared body/buttons/inputs are 15, caption 12.5, eyebrow 13, tabs 12. Her primary body is 18 and headings 22, but helper-check labels fall to 15 and feedback labels to 16. Photo-kind badges are 11.5 in `PhotoCarousel.tsx:41`; SVG room/month labels are around 10–11.

Older adults must read essential context as easily as the primary action. Plan 18–20 body and control labels, 16–18 supporting text, and 24–32 headings on senior-facing surfaces; compact metadata can remain role-specific where tested. Do not infer a WCAG violation just from a font size: the issue is suitability and scaling. Suggested command: `$impeccable typeset`.

### U02 — P1: Targets below the native minimum and proposed senior standard

**Location:** `ui.tsx:17`, `:31`, `:39`, `:234`; `Audio.tsx:29`; `stories/index.tsx:66`; `NeighbourhoodMap.tsx` directions control; `student/team.tsx` readiness rows. **Category:** accessibility/platform. Language/role controls have 32 height; back and audio buttons are 40 square; story close is 36 square; directions is a 20 icon with 8 padding (about 36 square). Shared Button is 46 high: above the iOS 44 target but below the Android 48 recommendation. ReadConfirm and several checkbox rows have no guaranteed minimum; team single-line rows have only 6 vertical padding.

Use at least 48 square effective targets across platforms and 56–64 height for primary older-adult actions, with spacing. Keep help tiles' existing 110, timing 60 and ratings 80 minimum heights. `hitSlop` is useful but should not cause competing hit regions. This is a native/elderly usability finding; WCAG 2.2 AA web target size is 24 CSS px with exceptions, not 44/48. Suggested command: `$impeccable adapt`.

### U03 — P1: Shared fields lack a programmatically attached label

**Location:** `ui.tsx:270`. **Category:** accessibility. `Field` renders a sibling Text label and TextInput without assigning `accessibilityLabel` or an ID-based relationship. Callers can pass input props, but most rely on the visible label only. Placeholders are not dependable replacement labels. This affects reports, names, prices, dates, notes and savings goals.

Use the localized label as a default accessible name, support platform-specific association, required/error/help descriptions and announced validation. Headings (`Heading`, `NightBand`, section Text) also lack explicit heading roles. Test VoiceOver/TalkBack and rendered web semantics. Related web criteria: 1.3.1 and 4.1.2. Suggested command: `$impeccable harden`.

### U04 — P1: Large text can collide with fixed layout and truncated summaries

**Location:** `ui.tsx:17`, `:207`, `:208`, Button; `family/house.tsx` four-view selector; side-by-side controls in student add/letter/photo screens; `NeighbourhoodMap.tsx` one-line rows. **Category:** accessibility/adaptivity. Fixed control heights, horizontal groups and `numberOfLines={1}` reduce room for enlarged English/Japanese text. A width >=900 always selects fit-panel layout even when text scaling or window height leaves little content area.

React Native Text scaling defaults to enabled; no `allowFontScaling={false}` or global scaling cap was found. Fixed `fontSize` alone does **not** prove scaling is disabled. Verify at system large/accessibility sizes and web 200%/400% zoom, then allow wrapping, content-driven height and stacking. SVG/canvas text does not follow ordinary Text scaling. Suggested command: `$impeccable adapt`.

### U05 — P1: Visual house/globe/map controls lack equivalent semantics

**Location:** `FloorPlan.tsx:14` and item `G` handlers; `Home3D.tsx:186`; `StoryGlobe.tsx:149`; server map/track CSS and marker handlers. **Category:** accessibility/platform. Floor-plan pins use 21-grid-unit circles and onPress without item names/roles; its root label is fixed English. Canvas meshes do not expose a semantic item list. Server nearby dots are 13 px and pins 32x42 with click handlers, with no explicit keyboard/ARIA behavior on custom marker elements.

Lists elsewhere in house/story/map screens are useful existing alternatives. Keep them reachable with clear names and equivalent actions; add a room/status summary and labelled selection controls, not just larger visual pins. Generic iframe titles need localization, and embedded content needs its own keyboard/screen-reader QA. Related web criteria: 2.1.1 and 4.1.2. Native semantics vary and are not tested. Suggested command: `$impeccable harden`.

### U06 — P1: Story modal has no explicit focus lifecycle or inset strategy

**Location:** `stories/index.tsx:60–74` (source range described here, not a runtime trace). **Category:** accessibility/adaptivity. Modal is a sliding panel nested inside dismissing Pressables; close is icon-only and 36 square. The implementation does not explicitly focus the title/close control, restore the trigger focus, isolate background accessibility content, handle web Escape, or inset the sheet bottom. Native Modal may supply some platform behavior; actual focus trapping is unverified.

Use localized title/close, a large close target, tested initial/return focus, background isolation, keyboard dismissal, keyboard-safe scrolling and bottom inset. Validate backdrop handling with screen readers. Related web criteria: 2.4.3, 2.4.7, 2.4.11. Suggested command: `$impeccable harden`.

### U07 — P1: Older-adult mutations lack actionable failure feedback

**Location:** `her/index.tsx:39`, `:49`; `student/wallet.tsx:31–33`; `Handover.tsx` field-note mutation; `Touchpoints.tsx` run/log; `Community.tsx` activity mutation. **Category:** implementation integrity/feedback. Her help submission uses try/finally without catch; rating has no busy/error guard. Wallet load rejects without catch; when home data exists but wallet data does not, it returns an empty Screen, not a wallet loading/error/retry state. Several card mutations similarly lack error rendering. Concurrent buttons can also remain active when a sibling request is busy.

Give persistent, plainly worded failure and retry states; retain drafts/selections, prevent duplicate submission, and only clear input after success. Toasts clear after 2400 ms (`data.tsx`) and are insufficient as the only record of an important action. Preserve the existing polite live-region attempt; add platform announcements where needed. Suggested command: `$impeccable harden`.

### U08 — P1: Consequential actions need clearer review and consent scope

**Location:** `StoryShare.tsx` share form, `Services.tsx` post/book/cancel, `family/plan.tsx` pay action; letter controls/server letter status. **Category:** implementation integrity/privacy UX. No generic confirmation-dialog component was found. Many actions submit immediately. Public sharing defaults photos to true when photo content is available, uses compact chips and a student agreement button, and has no separate stored senior approval receipt. Direct booking shows price but lacks the explicit `agreed` gate present in job posting. Printing has a read checkbox, but mailing is available from draft and the server accepts it without read confirmation.

Use a short, concrete review for sharing, introductions, booking and money-labelled actions: who sees what, exact price/date/person, a clear action label and an easy Not now/Cancel. Avoid adding confirmation to every ordinary tap; keep two-tap help, with a durable success summary/undo if supported. Do not claim a frontend checkbox authenticates consent. Preserve existing review checks, and schedule the specific server transition gap for later hardening. Suggested command: `$impeccable clarify`.

### U09 — P1: One confirmed contrast miss outside the tested token pairs

**Location:** `Services.tsx:15` open-status Pill; `ui.tsx:254` Pill label; `theme.ts` line color. **Category:** appearance/accessibility. All **17** scripted pairs passed at >=4.5:1. Additional calculations found `#9A6A12` on `#F5EBD6` is **3.99:1**, used for a 12-point bold open-status label. This is below normal-text AA. The same foreground on sheet is 4.55:1. White on opaque `#B5562B` is 4.85:1; translucent photograph overlays depend on image content and remain unverified.

`#D5D9D1` on sheet is **1.38:1**. Where that border is the only indication of an input/control boundary, review against non-text 3:1; decorative card separators are not automatically failures. Expand contrast coverage to status colors, focus and composites; darker open-status text is preferable to shrinking/removing labels. The confirmed small status-label miss must be resolved before an AA claim. Suggested command: `$impeccable colorize`.

### U10 — P2: Information architecture is dense and discoverability relies on folds

**Location:** `family/house.tsx`; student with/after steps; `item/[id].tsx`; shared `Fold`. **Category:** usability/navigation. House has four views plus secondary sections/color/light controls; item detail mixes story, media, wishes, journey, sharing and value with student editing; a student can enter multiple folded tasks. Expanded Fold removes the title/summary trigger and provides a generic Show less control, which loses section context for assistive technology. No expanded=true counterpart stays in place.

Use a stable section header with expanded state and section-specific accessible name. Keep the current three-step visit model. Senior entry should surface Today, Talk, People, Home/help and privacy in a simple hierarchy, with technical collaboration in a separate optional destination. Avoid eight new cards on `/her`. Suggested command: `$impeccable distill`.

### U11 — P2: Icon actions have accessible names but few visible names

**Location:** stories `Action` at `index.tsx:214`, globe `GlobeButton`, nearby directions, StoryPlayer. **Category:** usability/accessibility. Heart/message/share are icon/count actions: they have accessible labels and hitSlop, but no visible words. Globe controls likewise have names only for assistive tech. Audio's label remains Play story while playing.

Add visible labels for common senior-facing actions; expose play/pause state and localized tooltips/help where useful. Keep decorative icons hidden from accessibility traversal. Do not label all existing icons as unnamed: many have explicit accessibility labels or child text. Suggested command: `$impeccable clarify`.

### U12 — P2: Native keyboard/bottom inset and wide-web scrolling need QA

**Location:** `ui.tsx:57`, `:142`; `_layout.tsx` scrollbar injection; form screens; portrait-only app config. **Category:** adaptivity/platform. Screen provides top inset through TopBar and fixed 40 bottom scroll padding, but no general bottom safe-area or IME avoidance. There is no KeyboardAvoidingView. Tabs may provide some inset protection, whereas standalone her/item/helper screens need checks. Wide `fit` panels have independent scroll/fades, and global 6 px scrollbars make scroll affordances subtler.

Retain two-column desktop task layouts where useful, but permit full-page scroll at large text/short height. Keep visible scroll affordances, heading landmarks and predictable keyboard traversal. Test 320/375/390 phones, tablet/split-window, 900 breakpoint, 1280 desktop, 200%/400% zoom and on-screen keyboard. Portrait locking is intentional in config; assess whether it should continue for users needing landscape, rather than claiming tested landscape failure. Suggested command: `$impeccable adapt`.

### U13 — P2: Motion preferences are not consulted

**Location:** `Home3D.tsx` auto-rotation/pulsing useFrame; `StoryGlobe.tsx` frame loop; `family/house.tsx` seven-second tour; stories smooth hash-scroll/sliding modal; `mapPage.ts` pulse and requestAnimationFrame. **Category:** accessibility/performance. No AccessibilityInfo reduced-motion check or web reduced-motion handling was found. The memory tour has stop controls, which should be preserved. Continuous house motion has no equivalent user pause.

Honor system motion preference, provide pause/static views, and suspend hidden/background animation. Keep status changes comprehensible through text. Globe implements touch/pinch and termination cleanup; it is not mouse-only. Its unconditional pan capture and wheel preventDefault warrant a physical-touch/scroll test, not a claimed broken gesture. Suggested command: `$impeccable animate`.

### U14 — P2: Large assets and eagerly rendered histories burden slower devices

**Location:** root font imports; `Home3D`, `StoryGlobe`, `.map()` histories in stories/items/wallet/reports; `ScrollPanel` scroll offset state. **Category:** performance. Web export produced **3,048,507 bytes of JS**, **50 files totaling 61,682,309 bytes**, and **29 font files totaling 58,612,316 bytes**. These are uncompressed artifacts, not measured network transfer or startup latency. Root font-package barrels correspond to exporting unused weights and icon sets as well as the five loaded weights. Histories use ScrollView/maps rather than virtualization.

Investigate direct font/icon imports and Japanese glyph-safe asset reduction, lazy-route loading and demand/visibility rendering of expensive views. Virtualize only lists shown to grow, keeping accessible reading order. Profile before a cache-library migration. Existing house low DPR (0.42), sprite run grouping and photo quality 0.5 are positive optimizations. Suggested command: `$impeccable optimize`.

### U15 — P2: Styling and localization drift make a complete redesign harder

**Location:** theme/ui, inline `her` typography, `HouseFuture` chips, server map HTML, root headline, photo/iframe labels and error fallbacks. **Category:** theming/implementation integrity. Inline radii/spacing/size variants are repeated. App is explicitly light-only; night header is not dark-mode support. English/Japanese UI keys are typed, but fixed-language errors, plan descriptions and print layout remain. Language persists on web only.

Centralize semantic sizes/spacing/focus/status colors; preserve legacy exports while migrating screens incrementally. Design light/high-contrast behavior first and add a deliberate dark appearance later if in scope. Expand bilingual coverage and choose a native persistence adapter explicitly. The source files are UTF-8; console encoding artifacts alone do not establish translation corruption. Suggested command: `$impeccable document` followed by `$impeccable harden`.

## Positive patterns to retain

- Older-adult help/ratings are large, labelled and short; door safety advice sits near visitor information.
- Real actions already use button/radio/checkbox roles and selected/checked states in many places.
- Not now is first, value is optional, family wishes are clearly distinguished from decisions, and AI-made illustrations are labelled.
- Bilingual keys, semantic colors, shared cards/buttons and responsive columns provide a practical migration foundation.
- High-contrast night/header/body pairs passed; public story inputs implement an explicit focus border rather than merely removing outline.
- Textual item/story/place lists complement maps/3D; retain them as first-class alternatives.

## Verification plan for the redesign

In each implementation stage, inspect one batched mobile/native and web pass, fix the discovered issues together, then make at most one confirmation pass. A browser viewport is web evidence, not evidence of native rendering or physical touch.

Verify the preservation checklist, large/system text sizes, labelled targets, reading order, input labels/errors, modal enter/exit, keyboard traversal/visible focus, permission rejection, offline/retry, pending submissions, safe areas and English/Japanese. Observe actual older-adult completion of help request, opening a memory, reviewing approved profile, rejecting an introduction and stopping sharing. Measure steps and recovery; do not remove consent/human-read steps merely to shorten a flow.

Priority: `$impeccable harden` and `$impeccable typeset`, then `$impeccable adapt`, `$impeccable clarify`/`$impeccable distill`, contrast coverage, motion/performance, and finally `$impeccable polish`. These are future actions only; Stage 0 stops at documentation.

## Standards used

The native target recommendations follow the loaded impeccable iOS (44 pt) and Android (48 dp) references; the proposed 56–64 senior action height is a project design target. Web [WCAG 2.2](https://www.w3.org/TR/WCAG22/) criteria include text contrast, reflow, keyboard operation, label/name and focus requirements. The web [AA target-size rule](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) permits spacing/other exceptions; it is distinct from native touch recommendations. [Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) applies to necessary control/state indicators. React Native documents [default Text scaling](https://reactnative.dev/docs/text#allowfontscaling) and [accessible names/state](https://reactnative.dev/docs/accessibility). Consult the repository's installed types/platform behavior during implementation; no WCAG/native compliance certification is claimed.

## Stage 1 remediation — 15 October 2026

The findings above retain the Stage 0 baseline. Stage 1 introduced the requested ivory/sage/green design system; it does not retroactively change the baseline score or certify the whole app. See [progress.md](progress.md#stage-1--implemented-shared-design-system) for exact files and executed checks.

| Finding | Stage 1 status |
| --- | --- |
| U01 typography | Shared body19/support17/section23/title30/button19/tab16 and scalable AppText implemented. Pilot metadata enlarged. Remaining inline screen typography is later migration. |
| U02 targets | Shared actions48 minimum, primary60/secondary56; stable folds/checkboxes/settings/switch row. Reference/pilot28 web scenarios have no exposed target <44. Existing house/story/audio inline controls remain. |
| U03 field labels | Field aliases AccessibleTextInput, supplying a localized name, required/error/hint and announced validation. Shared headings expose header roles. Web input validation/entry/save passed; native reader QA outstanding. |
| U04 scaling | AppText modes1/1.15/1.3 preserve native scaling; content wraps. Fit columns fall back on insufficient dimensions/scaling. Reference/pilot matrix clean; actual native OS scaling and web400% remain untested. |
| U05 visual alternatives | Existing list alternatives preserved; map/SVG/3D-specific accessibility not redesigned. |
| U06 modal focus | New reusable ConfirmationDialog keyboard containment/Escape/return focus passed. Existing stories-specific modal is not migrated. Native Modal focus/insets need device validation. |
| U07 feedback | Shared loading/connection/retry, persistent banners and retained/dismissible toast; pilot help/rating catch/pending states added. Fixture help failure/retry passed. Existing card-specific async errors remain. |
| U08 confirmation scope | Concrete reusable cancel/confirm dialog implemented and tested in local component reference; existing backend consent/letter gaps remain. Two-tap help preserved. |
| U09 contrast | Open-service label now6.13:1; outline3.94:1; primary8.01:1; body13.96:1. Expanded30-pair check passed. Photo composites and unmodified custom status colors are not certified. |
| U10 density/folds | Stable named expanded Fold with wrapping summary. Pilot improved; other task/screen information architecture remains unchanged. |
| U11 icon labels | Shared IconLabelButton, labelled switch row and help names; old story/globe/audio controls not globally migrated. |
| U12 insets/layout | Shared ScreenFrame/Screen keyboard-scroll and bottom-inset foundations; readable scrollbars; 28 clean web matrices. Worker picker caption overflow fixed and16 targeted layouts clean. Native keyboard/inset evidence outstanding. |
| U13 motion | Root-stack/new-dialog transitions obey device or app reduced-motion setting. Existing house/globe/story/map animations remain. |
| U14 assets | Direct imports reduced exported font bytes from58,612,316 to28,260,704. No latency/frame-rate claim. Existing visualization/list optimization remains. |
| U15 consistency | Semantic tokens, reusable components, EN/JA shared copy, cross-role preferences and design documentation added; no NativeWind/framework migration. Native persistence, dark appearance and remaining raw styling are open. |

No full-app accessibility score is assigned from this scoped pass. Native screenshots, screen readers, actual OS font scaling and live permission/provider flows were not exercised. Legacy route smoke tests were English/Normal/390 only; detailed reference/pilot and helper checks cover both languages and multiple sizes. Preserve this distinction in future reports.
