disposition: fix

Evidence scope: independent file/screenshot review on 15 October 2026, limited to Stage 2 Expo Web. No approved comp or quality-bar image was supplied or required for this explicitly specified extension. Native captures and device testing are unavailable; this is not native release approval.

## persistence

Pass. `apps/mobile/PRODUCT.md`, `DESIGN.md` and `.impeccable/surfaces/older-adult.md` preserve the established warm, accessible world. The pinned four-destination extension is code-led; no replacement-world roll or comp gate applies. The Stage 0 feature inventory and Stage 2 implementation map were read against sampled primary source (`app/her/_layout.tsx`, `src/her/HerPage.tsx`, `Screens.tsx`, `HelpScreen.tsx`, `ItemDetail.tsx`, `plans.ts`). Existing API contracts remain the mutation boundary.

All 16 required captures were opened and are valid: `.impeccable/review/stage2-{her,her-help,her-memories,her-item-sewing}-{en,ja}-{390,1440}.png`, relative to `apps/mobile`. They show the stated routes from the scroll area's top, at extra-large text/high contrast, with no blank or broken-image regions. These are viewport captures, not full-page or native screenshots; deliberately absent fixture media does not establish media visual quality.

The supplied `stage2-interactions.json` records six passing scenario groups with no exceptions. `stage2-layouts.json` supplies the broader layout observations but also preserves the earlier intermittent audio play/pause AbortError. The later passing run does not erase that observed race. Typechecks, export and 30 contrast pairs are builder-reported evidence, not independently rerun here.

## fidelity

| Element / promise | Assessment | Evidence |
| --- | --- | --- |
| TYPE | Match | Large bilingual sans controls and distinct serif memory prose inherit DESIGN.md; wrapping remains readable in all required captures. |
| MATERIAL | Match | Plain surfaces, restrained outlines and consistent line icons fit the established Operate world; no simulated physical material or new raster obligation. |
| GROUND | Match | Ivory page field, white controls and deep-green emphasis match the documented palette. |
| First viewport | Match | Greeting, household date, prominent companion action, honest coming-soon status and next recorded visit appear in the required Home captures. |
| Four destinations / Settings | Match | Wide rail and compact persistent bottom navigation retain labels and selected state; Settings remains visible. |
| Compact navigation wrapping | Adaptation | Two rows at enlarged text preserve readable labels and targets, explicitly allowed by the surface contract. |
| Existing help / autonomy | Match | Four help kinds, two timings, waiting state and three feedback values remain in source and recorded interactions. Not now precedes consequential item choices; those choices retain review/cancel. |
| My Day / future capabilities | Match | Timeline projects existing visits, accepted activities, planned calls and booked services. Future companionship, reminders and matching are honestly described rather than represented as working services. |
| Memories / Japanese editing | Contradicted | Japanese display reads `storyJa`, but the newly exposed older-adult editor starts with `story`; saving can replace the displayed Japanese story with its English counterpart. See fix 1. |
| Consent / shared features | Match within evidence | Recording consent, sharing withdrawal, optional value, house views and existing record reuse remain present in sampled source and supplied interactions. Device capture/upload and live integrations are outside this review. |

## ceiling

Reached for the supplied browser presentation and the established Operate direction, subject to fix 1. No extra ornament, motion or concept replacement is warranted. The original feature inventory was used as a preservation map, not treated as proof that every legacy workflow was executed. Native safe areas, system font scaling, VoiceOver/TalkBack, back gestures, camera/microphone, GPS, remote map/provider behavior and actual server mutations remain unverified. The two retained PhotoCarousel dark-media color advisories are not material blockers in this extension. The recorded intermittent saved-audio playback race remains a disclosed integration limitation.

## material_fixes

1. **P2 — Preserve the localized story when editing (bilingual content/autonomy promise).** In `apps/mobile/src/her/ItemDetail.tsx:25`, initialize/reset the draft from the story displayed for the current language (`pick(lang, item.story, item.storyJa)`), while protecting an in-progress draft from incidental language/data refreshes. Currently Japanese users receive an English edit field; Save at line 51 posts that English text, and the existing `apps/server/src/index.ts:125` deliberately deletes `storyJa`. Verify a Japanese item with both language fields: the editor must show its displayed Japanese prose, saving an unchanged draft must retain that prose, and an edited Japanese story must remain visible after refresh. Keep the existing API contract.

## keep

Preserve honest coming-soon wording, the readable four-destination shell, two-step help, explicit recording/sharing choices, and Not now as the first item decision.

---

Scoped verdict pass, 15 October 2026. The initial review above is retained as history; this pass scores its sole material finding.

## verdict

1. **Resolved — Localized story editing.** `src/her/ItemDetail.tsx` now initializes clean drafts from the displayed localized story, preserves dirty draft text and language across language/data changes, labels a retained draft when its language differs from the interface, and disables unchanged saves. `stage2-editor-draft-390.png` visibly shows the retained Japanese draft within the English interface and the language explanation; `stage2-editor-saved-1440.png` shows the saved Japanese prose with Save disabled. The targeted `stage2-editor.json` scenario passes Japanese initial-value, no-PATCH unchanged-save, dirty-language-switch and edited-save/reload assertions. The fixture explicitly invalidates `storyJa` on story updates like the existing server, so this addresses the original destructive replacement path without changing its API.

All 16 refreshed original captures were reopened and remain valid. The two focused editor captures are valid scrolled editor views, not document-top claims. The final evidence records 16 layout observations with no measured failures or exceptions. No regression attributable to this fix was identified in the scoped source/capture check. Final mobile typecheck and web export success are builder-reported.

## remaining

Clear for the one scored material fix. This verdict covers that fix, not a new whole-surface review. Native/device accessibility, live integrations and the previously observed intermittent saved-audio play/pause race retain the limitations recorded above; the editor-only pass does not retest or resolve them.

disposition: ship
