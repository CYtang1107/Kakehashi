# Stage 3 design extension check

15 October 2026. Source comparison using the Impeccable documenter workflow. Authority: [PRODUCT.md](../../apps/mobile/PRODUCT.md), [DESIGN.md](../../apps/mobile/DESIGN.md), [design sidecar](../../apps/mobile/.impeccable/design.json) and the task-specific [roles direction](../../apps/mobile/.impeccable/surfaces/roles.md). Implementation scope is recorded in [stage3-implementation.md](stage3-implementation.md).

## Five-line summary

1. Existing family, student, helper, public-story and item screens extend **A Welcoming Home** through the established shared components.
2. `theme.ts` and `AppText.tsx` are unchanged: no new palette or typography primitives, font loading or imagery assets were introduced in this change.
3. Family/student navigation now uses wrapping, content-height tabs; the common toolbar groups secondary actions in Settings.
4. Reading controls, recoverable feedback and retained drafts extend existing tasks without defining a new visual identity.
5. Canonical design/product documents remain unchanged; this is source evidence, with browser and native verification outside this check.

## Evidence and extension differences

| Concern | Source evidence and comparison |
| --- | --- |
| Shared visual vocabulary | Role screen files import `AppText as Text` and reuse `type`, `fonts`, `colors`, `Card`, `Button`, `Field`, `Columns` and `StatusBanner`. `src/theme.ts` retains the documented warm surfaces, deep-green actions, decision colors, Zen Kaku Gothic New and Shippori Mincho roles. Local size/family overrides remain; they are not new system tokens. Existing photos, pixel sprites, house views and globe remain in use. |
| Family/student tabs | `src/design-system/RoleTabBar.tsx` consumes Expo state/descriptors, emits tab press/long-press events and navigates existing routes. Both role `_layout.tsx` files retain four destinations and `backBehavior="history"`. Tabs use `AppText` at the existing navigation size, a 60-unit minimum height, selected border/sage fill and selected semantics. At `width < 480 × appScale × fontScale`, they wrap into two rows. This differs from DESIGN.md's below-icon labels and fixed 104/130-unit bar description, and the sidecar's representative navigation snippet: icons now sit beside labels and height grows with content. Treat this as the Stage 3 navigation extension, not an updated global specification. |
| Common toolbar | `src/ui.tsx:30` keeps labelled Back visible and opens a shared `ConfirmationDialog` from Settings for role, language and reading actions. Closing Reading settings explicitly returns web focus to the stable Settings trigger; source also attempts native accessibility focus through `findNodeHandle`, without device evidence. This differs from DESIGN.md's description of separately exposed toolbar controls. The source still uses the existing controls, active palette and reading dialog. |
| Role composition | Family home uses `useWide()` and places a concise pair/completed-visit count plus next recorded visit before outing/weather on compact layouts; `src/VisitThread.tsx` retains the fuller readable history and recorded-story context follows. Student home retains the Before / With Her / After sequence and recording consent. Helper starts with labelled demonstration identity and clearance. Public stories retain globe plus labelled list, public context and example labels. Item detail keeps the story, family wishes and explicit decision review. These are surface-specific compositions under `roles.md`, not system-wide layout rules. |
| Feedback and draft continuity | Wallet/helper loaders use request versions, error banners and retry. Mutation controls expose busy/disabled states. `src/useStoryDraft.ts` is shared by both item presentations: dirty text survives language/data refresh for the same item; clean drafts follow displayed prose; unchanged saves are disabled and retained-language drafts are labelled. Item confirmation preserves the Not now/open path and reviews other decisions. Public comments retain draft text on failed send. |
| Reading and motion | `AppText` continues app-scaled sizes/line heights with native font scaling enabled and language metadata. `useWide()` still includes viewport height, app scale and OS font-scale eligibility. `StoryGlobe.tsx` now suppresses automatic sway/pulses and replaces zoom interpolation with immediate updates under reduced motion; explicit interaction remains. |

## Limits

This document records inspected source and the current working-tree diff; it does not claim rendered layout, interaction-test results, native OS scaling, VoiceOver/TalkBack or physical-device evidence. Browser execution and the final review are separate work products. Media capture/upload, external providers, maps, sharing sheets and the known audio race retain the implementation report's limits.

Migration to `AppText` does not establish complete high-contrast coverage: several retained custom selectors and semantic colors still read static `colors`, while shared controls and the new tab bar read the active palette. Existing one-off values, raw glyph/avatar text, spatial views and stored/provider copy were not promoted into the design system or certified here.

DESIGN.md, `.impeccable/design.json` and PRODUCT.md intentionally retain their existing Stage 1 scope statements and representative patterns. This extension check neither repairs historical scope drift nor canonizes the changed toolbar/tab composition; a future canonical refresh requires its own explicit scope.
