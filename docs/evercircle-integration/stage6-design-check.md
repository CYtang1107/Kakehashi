# Stage 6 design compatibility check

Checked 16 October 2026. The local Expo Web Smart Home and daily-assistance demonstration remains compatible with KAKEHASHI's incumbent **A Welcoming Home** design. This is an ordinary code-led Operate extension with no new visual identity, token family, font, dependency or shipping raster asset. The independent finish review records `disposition: ship` for this web scope in [stage6-review.md](stage6-review.md), with no material fixes.

## Authority and evidence

Compared the final extension with `apps/mobile/PRODUCT.md`, `apps/mobile/DESIGN.md`, `apps/mobile/.impeccable/design.json` and the confirmed `apps/mobile/.impeccable/surfaces/home-assistance.md` direction contract, following Impeccable's `reference/document.md`. Read [stage6-implementation.md](stage6-implementation.md) and the independent finish review. The canonical product/design files and sidecar remain unchanged. Their established palette, typography, shared component rules and accessibility caveats still apply; their historical Stage 1 feature inventory is not a complete description of Stage 6.

Source sampling covered `src/theme.ts`; shared `AppText`, `Controls`, `Cards`, `ScreenFrame` and reading-preference palette selection; `HerPage` and the older-adult route shell; SmartHomeDashboard, DeviceControl, CommandInput, RoutineCard and DemoStatus; DailyAssistance/VisitReminder; daily-companion delegation; and the My Home/My Day integrations in `src/her/Screens.tsx`. The Smart Home route wrapper and the shell's Smart Home navigation selection were checked. The implementation and independent review supply the wider domain/storage/voice boundary evidence; this documenter did not independently rerun those suites or inspect every supporting module.

Evidence checked directly:

- `apps/mobile/.impeccable/review/stage6-verification.json` contains 64 layout records covering four routes, EN/JA, widths 320/390/768/1440 and Normal/Extra Large. Every measured overflow and small-control list is empty; all nine interaction groups pass; failures and exceptions are empty. The final group records no household mutations or hardware requests.
- All 35 final `stage6-*.png` captures are present. This documenter visually opened eight: `stage6-smart-home-en-1440.png`, `stage6-smart-home-ja-390.png`, `stage6-devices-en-390.png`, `stage6-my-day-en-1440.png`, `stage6-reminders-ja-390.png`, `stage6-routine-en-390.png`, `stage6-form-en-390.png` and `stage6-companion-response-en-390.png`. These include the top-of-screen hierarchy, enlarged Japanese wrapping, complete device actions, reminder status, routine review, focused labelled fields and companion summary.
- The builder and independent reviewer each report opening all 35 final captures. The broader all-capture judgment belongs to those passes; this documenter sampled eight independently.

The implementation record reports the final successful web export (`entry-906908efc9dedc10872048a39b7c2626.js`, 1,062 modules, approximately 3.3 MB), mobile/server typechecks, 37 domain groups and all 30 shared contrast combinations. It also records the successful final browser command, the corrected harness selectors/stubs and the correction to introductory spacing. These checks were not rerun for this documentation pass. Existing-workflow regression evidence is maintained in the progress and implementation records rather than recertified here.

## Compatible design decisions

| Area | Final implementation and comparison |
| --- | --- |
| Color and material | Ivory surroundings, white cards, sage selection and deep-green actions inherit the theme and active palette. The sampled extension introduces no new color or material system. High-contrast screenshots show the established stronger foregrounds and card/control borders. |
| Typography | Shared AppText preserves Zen Kaku Gothic New: title 30/42, section 23/34, body 19/30, caption 17/27 and button 19/28 before preference scaling. Field inherits scalable body typography. Japanese labels wrap, including room choices, reminder metadata and section headings. No new font, display face or decorative kicker appears in the inspected extension. |
| Controls and feedback | Named Button actions expose the next device action rather than requiring interpretation of an icon. Room choices retain the shared selected treatment. Field, Fold, ConfirmationDialog and StatusBanner preserve visible labels, focus treatment, explicit cancellation and recoverable feedback. Device/reminder changes have readable status or live-region feedback. |
| Shapes and depth | Device and reminder cards inherit the shared 16-unit card radius, 24-unit padding and ordinary quiet elevation or high-contrast border. Controls inherit the 12-unit radius and minimum 60-unit primary/56-unit secondary heights. Routine previews use ordinary spaced text instead of extra nested cards. |
| Layout and navigation | HerPage delegates to the always-scrolling ScreenFrame, retaining a compact readable content column, flexible room buttons and the persistent older-adult shell. The existing wide side navigation and compact wrapping bottom navigation remain in place; Smart Home stays under My Home. No new fitted-panel or wide-layout rule is introduced. |
| Reading preferences | Text, fields, buttons and cards continue through shared Normal/Large/Extra Large, high-contrast and reduced-motion preferences. AppText retains native font-scaling permission. Stage 6 introduces no animation and does not change global reading-preference persistence. |
| Product autonomy | Simulation is stated before controls and in outcomes. Routine preview lists exact targets and change/already-set status before a separate Apply action. Ambiguity presents named choices; unknown commands do not silently change state. Browser voice asks for per-command consent and leaves recognized words for text review. |
| My Day continuity | Date and the existing-record visit projection precede weather and plans; local personal tasks follow. Reminder completion/undo, suggestions and editable scheduled activities use the existing large-card hierarchy. Trusted-person shortcuts use recorded names/existing routes and do not claim message delivery. |

The observed extension follows the incumbent **Readable Surface**, **Reading First** and **Quiet Depth** rules. It uses the scrolling ScreenFrame path, so it does not introduce an exception to **Fit Must Fit**. Existing decision colors and decision workflows remain outside this local control/task addition, consistent with **Meaning Stays**.

## Deliberate local differences

Devices use ordinary Card plus a named action Button rather than the presentation-only DeviceControlCard switch composition. This makes the requested resulting action explicit, including open/close curtains, while retaining the shared control vocabulary. Repeated cards represent actual allowlisted simulated devices and dated personal tasks.

The first-viewport contract has a compact-layout adaptation: desktop shows the complete first device control; at 390 with enlarged Japanese text, the first card begins above bottom navigation and continues through vertical scrolling. The independently opened device-detail capture shows full-size named actions. This is consistent with the confirmed large-text preference and compact single-column wrapping requirement; it does not justify shrinking or clipping the action to fit one viewport.

My Day extends the existing plans composition rather than replacing it with another stored visit list. The same recorded visit can appear in the upcoming reminder and the retained plan list; that is a read projection, not a second persisted schedule. Local reminders, personal activities and device states remain explicitly demonstrative. Companion summary/device replies reuse the established chat treatment and delegate to the shared assistance/command path.

## Historical documentation drift

PRODUCT.md explicitly describes Stage 1 frontend foundations and says there is no matching or device integration. Later local matching and Stage 6 simulated device/task behavior extend that historical capability inventory. No real device integration is implemented: simulated controls do not turn the product statement into a hardware claim. The scoped implementation records supply the current boundaries without requiring a new brand or product identity.

DESIGN.md explicitly captures the Stage 1 shared replacement. Its pilot/navigation discussion and the sidecar's representative family/student navigation snippets do not inventory the later persistent older-adult shell, Smart Home route, command flow or personal-task cards. The shell in the captures is inherited from intervening work. Stage 6 composes existing primitives rather than introducing a conflicting token family; this pass therefore preserves the canonical files and their historical source lists.

The new home-demo native FileSystem adapter does not implement native reading-preference persistence. Browser recognition availability and consent do not establish native voice support. The existing caveats about native accessibility, dark appearance and legacy 3D reduced motion remain unresolved; Home3D/FloorPlan and their real safety/visualization behavior are outside this extension.

No craft-floor defect found in the sampled extension is promoted into a reusable design rule. Historical scope drift and the compact first-card continuation are reported here, without changing canonical tokens or documenting unverified native behavior as a design-system guarantee.

## Verification limits and disposition

The evidence supports the local Expo Web demonstration and preservation of the incumbent design authority. Captures are review artifacts from the exported app with disposable fixture data; no generated raster artwork ships and no new raster provenance entry is needed.

Web captures, DOM measurements, source semantics and voice stubs do not certify native storage, safe areas, keyboard/IME behavior, OS font scaling, gestures, VoiceOver/TalkBack, physical microphone/provider recognition quality or device performance. No native usability or assistive-technology certification is made. There is no real hardware, notification, external messaging, backend or later-stage implementation claim. No app change or canonical design-system rewrite is required by this comparison within the reviewed scope.
