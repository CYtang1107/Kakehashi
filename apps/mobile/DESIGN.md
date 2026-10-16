---
name: KAKEHASHI
description: Calm, readable companionship and home support, with the older adult in control.
colors:
  primary: '#245846'
  primary-pressed: '#173F31'
  background: '#F5F6F3'
  surface: '#FFFFFF'
  secondary: '#E8F0EA'
  accent: '#F3D9C9'
  text: '#202923'
  text-secondary: '#53645A'
  border: '#78877C'
  separator: '#DEE5DF'
  danger: '#A52B23'
  danger-surface: '#FAEAE7'
  warning-text: '#73501B'
  warning-surface: '#F5EBD6'
rounded:
  control: 16
  card: 24
  dialog: 28
spacing:
  xs: 4
  sm: 8
  md: 12
  lg: 16
  xl: 24
  xxl: 32
  section: 40
---

# KAKEHASHI design system

A welcoming home: warm neutral surroundings, white surfaces, quiet sage accents and confident deep-green actions. Typography, space and hierarchy do the work. Translucency belongs to the floating navigation; content cards stay solid. Existing routes, state, APIs, consent gates and workflows remain in place.

`src/theme.ts` owns portable tokens. `src/design-system/` owns shared components. `src/ui.tsx` preserves the existing public component contracts. Use the active `palette` from `useAccessibilityPreferences()` inside screens and components, including legacy screens. Keep scene-specific colours in 3D artwork and maps where they describe the scene rather than application chrome.

| Before | After | Why |
| --- | --- | --- |
| Custom font throughout the UI | Platform system font for UI; Mincho for memories | Familiar reading, clear hierarchy, retained Japanese identity |
| Heavy control and card outlines | One-unit control outlines, quiet separators and soft elevation | Distinguish actions from structural surfaces |
| 12-unit, single-line role navigation labels | Wrapping 15-unit role labels; 16-unit older-adult labels | Keep destinations readable and allow larger text |
| Repeated full-width back buttons | Labelled contextual back action | Keep navigation clear without dominating the task |
| Separate settings modal | Shared accessible dialog | Consistent focus trapping, Escape dismissal and focus return |
| Fixed light colours in legacy views | Active theme palette and semantic decision colours | Keep light, dark and high-contrast experiences coherent |

## Older-adult colour scheme

Every `/her` and `/her/*` route selects an Elderly Care palette through `useAccessibilityPreferences`, including shared controls, dialogs, browser chrome and the digital-house interface. Other roles retain their own palette. The light palette uses Lavender `#7F6890` for primary actions, Avocado `#C5D4AB` for friendship and completed-status surfaces, Astra `#FCE8B8` for visits and calendar accents, Umami `#F4BF90` for home accents, and Mocha `#A17A74` for control outlines. Warm neutral backgrounds and white cards keep these accents selective. Dark and stronger-contrast variants preserve the same visual identity.

Pastels carry dark text rather than white labels. Selected navigation uses darker lavender text, a visible outline and increased weight. Existing large targets, system typography, text-size preferences, focus indicators and reduced-motion behaviour remain available. Warning, error and emergency-action tokens keep their existing safety colours; photographs, maps and scene artwork retain their content colours.

`npm run contrast -w apps/mobile` includes all three older-adult palettes, checks text on pastel surfaces, and requires at least 7:1 for stronger-contrast body and supporting text. Physical-device and screen-reader validation remain separate from browser checks.

## Typography

The system font uses the platform's native face through React Native's `System` family. `AppText` also maps legacy Zen Kaku UI styles to the system face, preserving their weight. Mincho remains the story/display accent; raw native text and the retained scene artwork may still use their existing faces.

| Variant | Size / line height | Weight | Tracking |
| --- | --- | --- | --- |
| Title | 34 / 42 | 700 | -1 |
| Section | 23 / 32 | 600 | -0.45 |
| Body | 19 / 30 | 400 | Normal |
| Body bold | 19 / 30 | 600 | Normal |
| Caption | 17 / 26 | 400 | Normal |
| Eyebrow | 15 / 24 | 600 | 0.5 |
| Value | 32 / 40 | 600 | -0.8 |
| Button | 18 / 27 | 600 | -0.15 |
| Story | 20 / 34 | Mincho 600 | Normal |

Normal, Large (1.15) and Extra Large (1.3) preferences multiply text measurements. Native font scaling remains enabled. Important labels wrap rather than truncate. Wordmark and diagram labels have contextual sizes.

## Layout and navigation

Content uses a 24-unit outer margin, 24-unit section rhythm, 760-unit compact maximum and 1240-unit wide maximum. `ScreenFrame` reduces its margin on very small screens. `useWide()` also considers viewport height and reading scale, so short windows and larger text fall back to a single scrolling column. Existing independently scrolling desktop panels remain available.

The public home and Stories routes share the same story-feed composition. The role chooser uses a two-column grid when there is room. Family and student tabs retain Expo's history, events and destinations. Desktop general navigation lives in the top toolbar; mobile navigation lives in a floating dock.

The older-adult shell uses a sidebar on wide desktops and a labelled bottom dock otherwise. Its navigation targets are at least 64 units on desktop and 76 on mobile; labels are 18 and 16 units respectively. “My home” distinguishes the house destination from the main Home tab. Task navigation rows are at least 80 units high, with an icon, visible label and directional chevron. On narrow screens or with larger text, role navigation wraps into two rows so labels stay legible. Content stays spacious and sequential rather than becoming a dense dashboard.

## Controls and surfaces

- `Button` preserves its label, handler, disabled, busy, selected, accessibility and style props. Primary, secondary and destructive contracts remain compatible; tertiary is available for lower-emphasis actions. Primary minimum height is 60; other variants use 56; minimum width is 48. Loading preserves the label and prevents duplicate activation.
- `IconButton` requires an accessible label and has a 48-unit target. Use it for supplementary controls such as closing a dialog. Important older-adult actions retain visible text.
- Inputs retain visible labels, required/error/hint states, caller focus handlers and native input props. Labels and hints are associated with web inputs. Focus changes the outline without changing field geometry. Web checked, expanded, pressed, busy, disabled and selected states are explicit ARIA attributes alongside native accessibility states; heading levels distinguish pages from sections.
- Switch rows retain the accessible checked state and one activation target. Descriptive copy wraps beside the switch.
- Cards use a 24-unit radius and padding, a quiet separator and restrained ambient shadow. Tinted cards use tonal separation. High contrast increases borders.
- Decision colours retain their original meanings: keep/moss, family/plum, pass/indigo, recycle/clay, undecided/neutral. `getDecisionColors(palette)` and `getRoomColors(palette)` provide theme-aware versions; legacy static exports remain compatible.
- Shared dialogs preserve confirm/cancel callbacks, busy guards, native dismissal and keyboard controls. The settings dialog preserves its original preview, save and cancel semantics and backdrop dismissal.

## Motion and platform behaviour

Press feedback is immediate. Web controls use a subtle 0.98 press scale with a 120ms transition; focus-visible keyboard activation does not scale. Native shared buttons change pressed styling immediately. Hover is gated to precise pointing devices. Route changes are immediate; occasional shared dialogs use a short platform fade. Existing gesture, globe, voice and smart-home implementations remain intact.

`global.css` supplies web-only platform refinements: dynamic viewport height, safe-area-aware viewport metadata, touch manipulation, input focus rings, control-only selection suppression, thin scrollbars and restrained navigation translucency. The root updates browser chrome and CSS tokens from the current appearance preference. Pinch zoom remains available.

Both the OS and app reduced-motion preference disable shared motion. Reduced-transparency and increased-contrast media queries make floating chrome solid. High-contrast controls retain clear outlines. Native reading preferences keep their existing session-only persistence; web preferences retain their existing storage key and data shape.

## Verification

Run `npm run typecheck -w apps/mobile`, `npm run contrast -w apps/mobile`, `node apps/mobile/scripts/verify-all.cjs --domain-only` and `npm run build:hosted`. The contrast check covers normal, high-contrast and dark semantic pairs. The design-system route provides an interactive component reference. The role tab settings action uses Expo Router so it reaches the existing `/settings` route from either family or student tabs.

Browser emulation verifies layout and interactions; it does not certify physical touch feel, the software keyboard, iOS browser chrome, native screen readers or real-device text scaling. Those still require hardware validation.

Verified in this redesign: 37 unique routes loaded without a render error or page-level horizontal overflow; responsive checks used 320, 390, 768 and 1440-unit widths. Browser interaction checks covered fields, switches, disclosures, example save/cancel/confirm actions, dialog Tab wrapping and Escape/focus return, appearance previews, high contrast, enlarged text, reduced motion and English/Japanese switching. All 50 existing domain checks and 44 contrast pairs passed. No server, shared business-rule, dependency or route-path changes were made. Camera, microphone, payment and physical-device workflows were not exercised.
