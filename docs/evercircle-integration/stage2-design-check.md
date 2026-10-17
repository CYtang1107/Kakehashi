# Stage 2 design-system extension check

15 October 2026. Source-based finish handoff for the older-adult experience. The checked implementation extends the incumbent Stage 1 **A Welcoming Home** system. Its shared tokens, text roles and control APIs still match the established design documents. This pass preserves `apps/mobile/DESIGN.md`, its `.impeccable/design.json` sidecar, product context and surface brief.

## Five-line system summary

1. Ivory surroundings, white surfaces, sage selection and deep-green actions retain the existing semantic palette and separate decision colors.
2. `AppText` retains Zen Kaku Gothic New UI roles, the Shippori Mincho story role, app text scaling and native `allowFontScaling`.
3. Existing labelled `Button`, `Field`, `AccessibleSwitch`, cards, notices and confirmation APIs supply the Stage 2 interactions.
4. `HerPage` uses the shared scrolling `ScreenFrame`; the older-adult shell adds persistent navigation around that content.
5. Active palette preferences, reduced-motion stack behavior, recoverable errors and explicit choice/consent controls remain part of the extension.

## Checked files

Paths below are relative to `apps/mobile/` unless stated otherwise.

- Authority and context: `DESIGN.md`, `.impeccable/design.json`, `PRODUCT.md`, `.impeccable/surfaces/older-adult.md`; repository-level `docs/evercircle-integration/stage2-implementation.md`.
- Shared source: `src/theme.ts`, `src/design-system/AppText.tsx`, `src/design-system/Controls.tsx`, `src/design-system/ScreenFrame.tsx`, and the public exports/`Field` alias in `src/ui.tsx`.
- Representative extension source: `app/her/_layout.tsx`, `src/her/HerPage.tsx`, `src/her/Screens.tsx`, `src/her/ItemDetail.tsx`.

The shell reads the active palette, renders labelled Settings and four destinations, and disables stack animation for reduced motion. `HerPage` keeps loading/retry feedback and Back within the scrolling frame. Screens reuse shared controls for destinations, activities, reading settings and recording consent. Item detail uses the existing story typography, decision chip, multiline field and confirmation dialog; its language-aware draft handling adds no visual primitive or control API.

## Surface scope and uncaptured differences

The web rail threshold (`1100 × appScale`), rail width (`260 × appScale`) and compact navigation wrapping rule belong to this older-adult shell. They do not replace the shared `useWide()` eligibility rules or establish a global navigation layout. Shell tabs use palette-aware `Pressable` controls with a 60-unit minimum height and `AppText` at 16/24; they currently inherit the default body font rather than the documented family/student navigation weight.

Local spacing literals remain in these screens. My Day's divider repeats the existing separator color as a literal (`#D3DED5`). These observations are not new tokens or sanctioned system changes. The sidecar remains the Stage 1 component preview, including its representative family navigation; it is not a preview of the new older-adult shell.

Existing Stage 1 scope statements, including legacy migration exclusions, remain historical context. This check does not refresh or canonize those statements as a description of all Stage 2 behavior. Current implementation scope and executed validation belong in `stage2-implementation.md` and `progress.md`.

This documentation pass inspected source only. It adds no rendered, native, VoiceOver, TalkBack or device font-scaling evidence. Native behavior remains untested.
