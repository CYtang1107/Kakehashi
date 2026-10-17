# Stage 7 design-system check

Checked 16 October 2026. Outcome: compatible with the established **A Welcoming Home** visual system at the local Expo Web prototype scope. This is an ordinary code-led Operate extension, not a new visual world or an approved system change. No changes were made to `apps/mobile/PRODUCT.md`, `apps/mobile/DESIGN.md`, or `apps/mobile/.impeccable/design.json`.

## Evidence and authority

This handoff follows the shipped `D:/kakehashi/.agents/skills/impeccable/agents/impeccable_documenter.toml` definition and `reference/document.md`. The degraded definition was initially read during discovery; the shipped role was then located and used. The build, rather than intended future behavior, is the source of truth.

Compared the canonical product/design documents and sidecar with `apps/mobile/.impeccable/surfaces/agent-collaboration.md`, `app/developer/agents.tsx`, `src/evercircle/orchestrator/DeveloperScreen.tsx`, `AgentGraph.tsx`, the orchestrator model, `companion/CompanionScreen.tsx`, `src/theme.ts`, and `src/design-system/ScreenFrame.tsx`. Implementation context comes from `stage7-implementation.md`; the independent finish review in `stage7-review.md` records disposition `ship` and inspection of all 15 final captures.

Independently opened these representative final viewport captures under `apps/mobile/.impeccable/review/`:

- `stage7-panel-en-1440.png` and `stage7-panel-ja-390.png`.
- `stage7-matching-ja-1440.png` and `stage7-matching-en-390.png`.
- `stage7-denied-en-1440.png` and `stage7-denied-ja-390.png`.

These provide desktop/mobile and English/Japanese evidence across panel, matching, and denied states. Scrolled graph captures are viewport excerpts, not clipped full-page exports. No browser actions or tests were performed in this documenter pass. Test counts and behavioral results remain attributable to the implementation and review records; remaining regressions belong to the parent validation pass.

## Comparison

| System commitment | Final implementation and comparison |
| --- | --- |
| Palette and readable surfaces | The graph reads the active accessibility palette; the surrounding frame, buttons, banners, folds, and dialog use shared components. Ivory, white, sage, deep green, dark foregrounds, and pale-red denial treatments retain their established roles. Captures show dark text on sage and white text on the primary action. No new palette is required. |
| Typography and labelled actions | `AppText` and shared buttons retain Zen Kaku Gothic New and the established title/section/body/caption/button hierarchy. English and Japanese wrap; graph nodes have flexible height with a 66-unit minimum. Narrow captures retain complete node labels. The desktop Japanese transition heading wraps at its available width without hiding content. |
| Spacing, shape, and depth | The frame keeps the shared 1200-unit wide maximum and scrolling content. Diagram nodes use 12-unit corners and padding, with 40-unit graph gaps; surrounding groups reuse the 12/16/24/32 rhythm. White and sage diagram nodes are functional outlined controls, not a new elevated card family. No decorative shadow, raster material, or competing identity is introduced. |
| Responsive behavior | Graph/details stack below `1000 * scale`; graph nodes become full-width below `600 * scale`. The Japanese narrow first viewport places the next decision below the fold because the title, scope copy, and controls wrap. This is a documented readability adaptation, not fulfillment of the literal all-controls-in-first-viewport promise at every size. |
| Autonomy and product truth | Saving, sharing, invitation preparation, confirmation, and fictional acceptance remain separate choices. Scope text identifies local fictional tooling and distinguishes persona switching from account access. Denial names the blocked action and offers permission recovery guidance. Companion still presents destination buttons, shared fields, pending-interest approval, and existing privacy navigation. The developer graph is lazy-loaded through its own gated route, without an older-adult navigation entry. |
| States, motion, and interpretation | Active nodes use sage and stronger outlines; denial adds a red dashed connection and an explicit blocked label. Text states the current transition, so meaning is not color-only. Source disables pulses and autoplay under reduced motion and preserves manual steps. Replay changes the event cursor rather than invoking business logic. Still captures establish appearance; behavior depends on the source and supplied verification. |

The later unsupported-intent guard is restricted to `module === 'companion'`. It changes routing rather than the developer UI styling or composition; the supplied review covers that final source and the parent reports the reviewed developer bundle unchanged.

## Historical drift and limits

`PRODUCT.md` describes Stage 1 frontend-only work and defers matching/device integration. `DESIGN.md` and the sidecar retain the Stage 1 component inventory and evidence scope. Later deterministic matching, companion orchestration, and simulated home control therefore exceed that historical inventory while preserving its autonomy, consent, readable controls, and truthful-demo commitments. This does not establish remote AI, real hardware, authenticated identity, or native-device coverage.

The diagram's local responsive thresholds are not the canonical `useWide()` contract: they use width and app scale, without its height/native-font-scale eligibility checks. Here they control an always-scrolling developer diagram, not a fitted `Screen`/`Columns` layout. The supplied web evidence supports this surface-specific adaptation; do not promote it into a replacement for the documented Fit Must Fit rule or claim native equivalence.

The canonical inventory retains a legacy `eyebrow` token and treatment. The sampled Stage 7 UI does not use decorative eyebrows; this pass neither reendorses that historical treatment nor extends it to new surfaces. No new craft-floor defect was identified in the sampled captures. Historical inventory drift and surface-specific layout behavior are recorded, not repaired or canonized, because the authorized work is an extension and the write boundary is this report only.

Native layout, VoiceOver/TalkBack, OS font scaling, physical hardware, secure identity, and production authorization remain outside this evidence.

## Five-line system summary

1. Palette: warm ivory and white with sage support, deep-green actions, dark text, and established semantic denial colors.
2. Type: Zen Kaku Gothic New; title 30/42, section 23/34, body 19/30, caption 17/27, button 19/28 before preference scaling.
3. Form: wrapping labelled controls, 12-unit control corners, generous spacing, and restrained or tonal depth.
4. Named rules retained: Readable Surface, Meaning Stays, Reading First, Fit Must Fit, and Quiet Depth.
5. Interaction: explicit approvals, recoverable denials, shared reading preferences, and reduced-motion manual replay.
