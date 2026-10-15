---
name: KAKEHASHI
description: Readable companionship and home support, with the older adult in control.
colors:
  primary: "#235A46"
  primary-pressed: "#173F31"
  background: "#F8F7F2"
  surface: "#FFFFFF"
  secondary: "#E3EFE7"
  accent: "#F3D9C9"
  text: "#202923"
  text-secondary: "#506358"
  border: "#718578"
  separator: "#D3DED5"
  danger: "#A52B23"
  danger-surface: "#FAEAE7"
  warning-text: "#73501B"
  warning-surface: "#F5EBD6"
  moss: "#4F6B3A"
  moss-tint: "#E6ECDF"
  plum: "#7A4A6E"
  plum-tint: "#EFE3EC"
  indigo: "#2B4C7E"
  indigo-tint: "#E3E9F3"
  kaki: "#8E401F"
  high-contrast-text: "#101B14"
  high-contrast-support: "#263E30"
typography:
  title:
    fontFamily: "ZenKakuGothicNew_700Bold"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: "42px"
  section:
    fontFamily: "ZenKakuGothicNew_700Bold"
    fontSize: "23px"
    fontWeight: 700
    lineHeight: "34px"
  body:
    fontFamily: "ZenKakuGothicNew_400Regular"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: "30px"
  body-bold:
    fontFamily: "ZenKakuGothicNew_700Bold"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: "30px"
  caption:
    fontFamily: "ZenKakuGothicNew_500Medium"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: "27px"
  eyebrow:
    fontFamily: "ZenKakuGothicNew_500Medium"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: "27px"
  story:
    fontFamily: "ShipporiMincho_600SemiBold"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "34px"
  value:
    fontFamily: "ZenKakuGothicNew_700Bold"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "40px"
  button:
    fontFamily: "ZenKakuGothicNew_700Bold"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: "28px"
  navigation:
    fontFamily: "ZenKakuGothicNew_500Medium"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
  pill-label:
    fontFamily: "ZenKakuGothicNew_700Bold"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: "27px"
rounded:
  control: "12px"
  card: "16px"
  dialog: "20px"
  pill: "99px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  button-secondary-selected:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.text}"
  button-danger:
    backgroundColor: "{colors.danger-surface}"
    textColor: "{colors.danger}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "24px"
  card-tinted:
    backgroundColor: "{colors.secondary}"
    rounded: "{rounded.card}"
    padding: "24px"
  switch-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body-bold}"
    rounded: "{rounded.control}"
    padding: "12px"
  status-info:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.card}"
    padding: "24px"
  status-warning:
    backgroundColor: "{colors.warning-surface}"
    textColor: "{colors.warning-text}"
  status-error:
    backgroundColor: "{colors.danger-surface}"
    textColor: "{colors.danger}"
  pill:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary}"
    typography: "{typography.pill-label}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
  decision-keep:
    backgroundColor: "{colors.moss-tint}"
    textColor: "{colors.moss}"
    typography: "{typography.pill-label}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
  navigation:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.navigation}"
  dialog:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.dialog}"
    padding: "24px"
---

# Design System: KAKEHASHI

## Overview

**Creative North Star: "A Welcoming Home"**

Warm, readable and calm: KAKEHASHI uses ivory surroundings, white cards, sage notes and deep-green actions to help an older adult understand the next useful choice. Rounded rectangles and restrained shadows give controls a familiar, welcoming character. English and Japanese share a spacious hierarchy.

The older adult's autonomy shapes visual emphasis. Actions, consent and the option to defer remain readable and named. Shared reading preferences adapt the interface without taking the user away from the current task.

**Key Characteristics:**

- Large, wrapping text with labelled actions.
- Warm surfaces and clear dark foregrounds.
- Gentle corners and restrained card depth.
- Reading preferences shared across roles.

This document captures Stage 1 of the shared UI replacement: `src/theme.ts`, `src/ui.tsx`, `src/design-system/`, role navigation, the older-adult pilot at `/her` and the reference at `/design-system`. Existing routes and APIs remain compatible. Tokens are normative for these shared components and future migration; they do not certify every legacy screen. Sizes use portable px notation in frontmatter and React Native logical units in source.

## Colors

The palette pairs a warm domestic background with a strong, quiet action color. Frontmatter owns exact values; source compatibility aliases such as `paper/sheet/ink/night` map to the same primitives.

### Primary

- **Deep Green** (`primary`): primary action fills, active navigation, informational icons and normal focus indication.
- **Pressed Green** (`primary-pressed`): pressed primary actions; also the high-contrast primary fill.
- **Sage** (`secondary`): supportive notes, selected secondary controls and tinted cards.

### Secondary

- **Peach** (`accent`): a supporting surface, including the retained recycle decision background.
- **Warm Clay** (`kaki`): text on peach and the retained eyebrow/recycle treatment.

### Tertiary

The separate `decisionColor` mapping retains existing meaning: keep uses moss/moss-tint, family wishes use plum/plum-tint, pass uses indigo/indigo-tint, recycle uses kaki/accent, and open uses text-secondary/background. These colors label decisions; they are not additional primary action themes.

- **Moss**: keep decisions.
- **Plum**: family wishes.
- **Indigo**: pass decisions.
- **Danger Red**: destructive control text and error foregrounds, paired with danger-surface.
- **Warning Brown**: warning text/icons, paired with warning-surface.

### Neutral

- **Warm Ivory** (`background`): screen surroundings.
- **White** (`surface`): controls, dialogs and ordinary cards; also text on green.
- **Charcoal** (`text`): principal reading color.
- **Soft Charcoal Green** (`text-secondary`): supporting copy and inactive navigation.
- **Visible Green Grey** (`border`): control strokes.
- **Pale Green Grey** (`separator`): quiet structural dividers.
- **High-Contrast Ink / Support**: stronger text, supporting text and control borders when the preference is enabled.

High contrast changes text/ink, text-secondary/ink-soft, border/line, primary and focus. It retains the base surface and semantic decision colors. New controls must read the active `palette` from `useAccessibilityPreferences()`.

**The Readable Surface Rule.** Use dark text on sage and peach. Keep light text for deep-green fills.

**The Meaning Stays Rule.** Preserve the separate decision-color mapping and its labels when migrating screens.

## Typography

**Body and UI Font:** Zen Kaku Gothic New, registered in React Native under its weight-specific names in frontmatter. Regular, medium and bold are loaded directly.

**Story Font:** Shippori Mincho. Semibold supports the story role; bold remains available for existing display/glyph use.

UI text feels clear and conversational. The serif is a retained reading accent, not the shared screen-heading default. The root loads five weights directly.

### Hierarchy

| Source variant | Frontmatter token | Purpose |
| --- | --- | --- |
| `title` | title | Screen title; header accessibility role |
| `section` | section | Card/section title; header accessibility role |
| `body` | body | Principal prose and values expressed as sentences |
| `bodyBold` | body-bold | Important labels and supporting headings |
| `caption` | caption | Supporting explanations, never tiny footnotes |
| `eyebrow` | eyebrow | Retained warm-clay context label |
| `story` | story | Longer memory/story reading |
| `value` | value | Existing prominent values |
| `button` | button | Wrapping action labels |
| Caption override | navigation | Family/student tab labels |
| Bold caption override | pill-label | Static pill and decision labels |

`AppText(props: TextProps & { variant?: keyof typeof type })` defaults to `body`. It merges an optional style, then scales font size and line height by the app preference; `allowFontScaling` remains enabled for native OS scaling. It sets `ja-JP` or `en-GB` from the current language, allows text to shrink within flexible rows, and maps normal text/support colors to the active palette. Custom semantic foregrounds retain their meaning.

Reading settings offer Normal (1), Large (1.15), and Extra Large (1.3). App size multiplies the base measurements; it does not replace native font scaling. Preferences are shared across roles, saved in web localStorage, and retained only for the active session on native platforms or when web storage is unavailable. Dark appearance and native preference persistence are not implemented.

**The Reading First Rule.** Let text wrap and increase control height; do not clamp important shared action labels to a fixed single line.

Legacy inline `Text`, glyphs and avatar initials have not all migrated to `AppText`. Adjustable shared typography is not a claim that every screen's text responds to app preferences.

## Layout

A screen has a compact labelled toolbar, readable heading and spaced task content. Shared cards use generous internal padding and flexible rows; content remains in its reading order when columns stack. The frontmatter spacing scale is the base rhythm.

- `Screen` centers content within a compact maximum width (680) or an eligible wide maximum (1200), with outer margins (20), content gap (24), and safe-area-aware bottom padding.
- `useWide()` requires width at least `1000 × appScale`, height at least `700 × appScale`, and native `fontScale <= 1.2`. This gives larger reading modes and short viewports a scrolling, single-column layout.
- `Screen({ children, back?, roleSwitch?, header?, wide?, fit? })` uses a normal vertical scroll unless `fit`, wide eligibility, loaded data and no error all hold. Eligible fitted screens use independently scrolling panels. Loading and error states stay recoverable; a connection banner offers retry.
- `Columns({ left, right, stickyLeft?, fill?, scrollLeft? })` uses a 1.38:1 column ratio, gap (20), and inner stack gaps (14) only when wide eligibility holds. Otherwise it renders left content then right content in the screen's scroll. Sticky left behavior is web-only.
- `ScreenFrame({ children, title?, description?, toolbar?, wide?, footer? })` is an independent always-scrolling frame. Its `wide` prop selects a maximum width, not the `useWide()` breakpoint. Horizontal padding is (16) below width (360), otherwise (20).
- Dialogs cap width at (560), use safe-area padding, and scroll their content within the viewport. Keyboard-aware screens and dialogs preserve reachable actions.

**The Fit Must Fit Rule.** Use the full wide-eligibility condition before choosing a fitted or two-column layout; readable text takes precedence over fitting a desktop composition.

## Elevation & Depth

White cards use a restrained ambient shadow; sage cards convey depth through tone and do not add that shadow. Flat cards use spacing instead of a filled surface. High-contrast cards gain a visible border. Dialogs use a charcoal translucent scrim to distinguish their modal layer.

### Shadow Vocabulary

- **Card ambient:** React Native `shadowColor` uses text, offset (0, 3), opacity (0.06), radius (12), Android elevation (2). The sidecar's web approximation is `0 3px 12px rgba(32,41,35,0.06)`.
- **Modal scrim:** `rgba(32,41,35,0.48)`.

**The Quiet Depth Rule.** Use the shared card shadow for ordinary white cards and tonal layering for sage surfaces.

Reduced motion is the logical OR of the user's preference and the OS setting. An active OS setting cannot be switched off inside the app. Shared dialogs use no animation when reduced motion is active, and the root stack disables its transition animation. The legacy 3D house view remains outside this migration. The exported feedback duration token (140ms) is available in theme; shared controls currently use immediate state styling rather than an invented animation.

## Shapes

Rounded rectangles distinguish controls, cards and dialogs using their frontmatter radii. Controls have a visible two-unit stroke; the global web focus outline is three units with a three-unit offset. Pills have capsule corners and compact text padding; they are informational rather than touch targets. Preserve flexible height and width for labels in both languages.

## Components

Public shared exports are available from `src/ui.tsx`; `ReadingSettings` and preference APIs are imported from their design-system modules.

### Buttons

Warm, confident and explicitly labelled.

`Button({ label, onPress, kind?, icon?, disabled?, busy?, selected?, accessibilityLabel?, accessibilityHint?, style? })` uses `kind: 'primary' | 'secondary' | 'danger'` and defaults to primary. `PrimaryButton`, `SecondaryButton` and `DestructiveButton` fix the kind; `IconLabelButton` requires a Feather icon and still carries a visible label.

Primary buttons have minimum height (60); secondary and destructive buttons use (56). All have minimum width (48), icon size (24), horizontal padding (24), vertical padding (12), and gap (12). These are minima, not fixed heights. Primary uses green/white; secondary uses white/charcoal; destructive uses danger-surface/danger. Pressed primary darkens; pressed or selected secondary uses sage. Focus changes the stroke to the palette focus color, supplemented by the global web outline. Disabled or busy buttons become inactive with opacity (0.6); busy shows a spinner and preserves the label. Accessibility state exposes disabled, busy and selected.

### Chips

`DecisionChip({ decision })` is a static decision label with the preserved semantic mapping. Open decisions have a dashed border. `Pill({ label, color?, bg? })` is a static status label with green/sage defaults. Neither is an interactive chip API.

### Cards / Containers

`Card({ children, style?, tint?, flat? })` uses white or sage with card radius, padding (24), and gap (16). Ordinary white cards use ambient elevation; high contrast adds a two-unit border. `flat` removes the filled card treatment and uses vertical padding (8) with gap (12).

`UpcomingVisitCard`, `MemoryCard`, `FriendRecommendationCard`, `HomeAssistanceCard`, `ReminderCard` and `SafetyCard` accept `{ title, description?, detail?, icon?, action?: ButtonProps, children? }` and supply their own contextual icons. `DeviceControlCard` adds required `value`, `onValueChange` and `controlLabel` for an accessible switch. These are presentation components; their names do not implement matching, device integration or backend actions.

### Inputs / Fields

`AccessibleTextInput` is a forwarded React Native `TextInput` with `TextInputProps & { label: string; hint?: string; error?: string; required?: boolean }`. `Field` aliases it for compatibility. Keep the visible label; required state appears in its localized label and ARIA state. The active hint includes explanatory/error text.

A white field uses a visible border, control radius and padding (16). Minimum height is (56), or (140) for multiline. Text and line height scale with the app reading setting while OS scaling stays enabled. Focus uses the focus stroke; errors use danger plus an alert message and invalid state. Native input props remain available; there is no separate shared disabled-field visual variant.

### Navigation

`TopBar({ back?, roleSwitch? })` combines KAKEHASHI with wrapping labelled back, role, language and reading-settings controls. `LangToggle()` offers the other language. Preserve navigation routes and back behavior.

Family and student bottom tabs use white, a quiet top separator, below-icon labels, green active state and supporting-text inactive state. Label typography follows the navigation token and `AppText` scaling. Bar height is (104 + bottom safe area) in Normal and (130 + bottom safe area) in larger app modes. These dimensions describe the shared role navigation, not a blanket guarantee for all legacy raw controls.

### Reading Settings & Confirmation

`ReadingSettings({ visible, onClose })` is the signature stable reading dialog: size choices, a text preview, high contrast and reduced motion update preferences immediately without leaving the task.

`ConfirmationDialog({ visible, title, message?, confirmLabel?, cancelLabel?, onConfirm?, onCancel, destructive?, busy?, children? })` supplies a localized cancel/close action followed by confirmation when present. Destructive confirmation uses the danger button. Busy disables cancel and blocks Escape/back dismissal. The dialog exposes an associated title/message, modal semantics, web initial focus, Tab containment, Escape cancellation and focus return. Native accessibility focus is requested in source; VoiceOver/TalkBack behavior requires device validation.

### Switches & Feedback

`AccessibleSwitch({ label, description?, value, onValueChange, disabled? })` makes the entire labelled row a switch target with minimum height (56). The visual native switch is hidden from accessibility to avoid duplicate controls. Keyboard/focus and checked/disabled semantics are exposed by the row.

`StatusBanner({ title, message?, tone?, action? })` supports info/success, warning and error; it pairs icon, title and optional recoverable action with a polite live region. `EmptyState` takes the same notice content plus an optional icon. `ToastFeedback({ message, onDismiss? })` retains a message for (6000ms), offers a (48 × 48) minimum close target, uses green/white and respects the bottom safe area; native announcements and a web live region are supplied.

`Fold({ title, summary?, icon?, children, open? })` offers a labelled expandable row with minimum height (56). `ReadConfirm({ checked, onChange, label })` is the retained explicit reading-confirmation checkbox row, also minimum height (56). Preserve their meaning when integrating new surfaces.

## Do's and Don'ts

### Do:

- **Do** build shared reading content with AppText and palette-aware components.
- **Do** keep clear labels alongside icons and allow English and Japanese text to wrap.
- **Do** honor OS scaling and reduced motion in addition to the app preferences.
- **Do** preserve consent, deferral, family-wish labels and existing routes when migrating presentation.
- **Do** use the complete wide-eligibility condition and permit vertical scrolling at larger text sizes.
- **Do** validate native devices and screen readers before claiming native accessibility coverage.

### Don't:

- **Don't** put pale text on sage or peach surfaces.
- **Don't** use fixed-height text containers that clip enlarged shared action labels.
- **Don't** turn static pills into unlabelled interactive controls.
- **Don't** claim all legacy text is adjustable or all raw controls meet the shared target minima.
- **Don't** claim native preference persistence, dark appearance, device integration or legacy 3D reduced-motion support is implemented.
- **Don't** treat web screenshots or source semantics as completed VoiceOver, TalkBack or native OS-scaling tests.

Typechecking, web export, shared contrast checks, representative web interactions and scoped route/viewport reviews provide Stage 1 evidence. Native screenshots, device font scaling and VoiceOver/TalkBack remain untested. No raster assets were generated for this replacement.

