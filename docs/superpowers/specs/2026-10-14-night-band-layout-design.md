# Night band: colour and layout refinement

Date: 14 October 2026
Scope: the five screens the TGIC video shows (her screen, Digital 実家, item page, story feed, student home), plus the shared top bar and tab bars every screen uses.
Goal: a stronger, more cinematic look for the video, recorded on both phone and laptop, without changing what any screen does.

## Decisions made

- Colour direction: **night indigo frame** (option C of three).
- How much is night: **a header band only** (option A of three). The 3D house, globe, maps and all cards stay on light paper.
- Recording: **phone and laptop**, so phone layout comes first and wide screens get a two-column version.

## 1. Colour system

New tokens in `apps/mobile/src/theme.ts`:

| Token | Value | Use |
|---|---|---|
| `night` | `#121A2A` | Header band, bottom tab bars, primary buttons |
| `nightRaised` | `#1E2A40` | Inactive tabs and chips inside the band |
| `onNight` | `#F3EEE4` | Titles and text in the band, text on primary buttons |
| `onNightSoft` | `#A9B3C6` | Captions in the band, inactive tab labels |
| `kakiNight` | `#F08A4B` | Eyebrows and the active tab on night (about 7:1) |
| `kakiInk` | `#A04A22` | Eyebrows and links on paper (about 5:1; today's `#B5562B` is about 4.1:1) |

Unchanged: `paper`, `sheet`, `ink`, `inkSoft`, `line`, and the decision colours (moss = keep, plum = family, indigo `#2B4C7E` = pass on, persimmon = recycle). Indigo is no longer the general accent; it stays in the decision colours only.

- `type.eyebrow` on paper uses `kakiInk`.
- Primary `Button`: `night` background, `onNight` text. Secondary: `sheet` background, `line` border, `ink` text (as today).
- Every text and background pair must meet WCAG AA (4.5:1 body, 3:1 large).

## 2. The night band

- `TopBar` (logo, back, Switch role, 日本語) becomes night: `onNight` text, persimmon focus/active states.
- `Screen` gets an optional `header` prop: `{ eyebrow?, title, sub?, leading?, large? }` (`leading`: something drawn left of the text, such as the item's pixel icon; `large`: her screen's bigger greeting). When given, the band draws the eyebrow (`kakiNight`), the title (Shippori Mincho, `onNight`) and the sub (`onNightSoft`) directly under the top bar, so the bar and heading read as one block. The screen's own `Heading` is removed.
- Screens that don't pass `header` keep their `Heading` in the body; they still get the night top bar.
- Bottom tab bars (family, student layouts): `night` background, no top border, active `kakiNight`, inactive `onNightSoft`.
- `StatusBar` style becomes `light`.

## 3. Phone and laptop layout

- Below 900 px wide: one column, 16 px side margins, full-width cards, touch targets at least 44 px. Content width stays at most 640 px.
- At 900 px and wider: `Screen` takes a `wide` prop that allows up to 1,120 px. A new `Columns` component (`left`, `right`, left about 58%, 20 px gap) puts content side by side, and stacks it (left first) below 900 px.

| Screen | Left | Right |
|---|---|---|
| Digital 実家 (`family/house`) | The stage: 3D / floor plan / memory / neighbourhood, colour-by and evening light | Items, Safer home, Future, Photos |
| Item page (`item/[id]`) | Photo album, pixel icon, her story, voice | Her choice, "Where is it now", sharing, student actions |
| Story feed (`stories`) | The globe and its story list; stays in view while scrolling (web `position: sticky`) | The posts |
| Student home (`student`), "With her" step only | Her items and the add-item button | The folding sections: room photos, safer home, help at home, the house's future, from home to community |

## 4. Her screen (`her`)

- Simpler band: only the greeting ("Good morning, Michiko") and the date, larger than other screens.
- Always one column, max 640 px, at every width. Text sizes, button sizes and the door rule stay as they are.

## 5. Not changing

The 3D house's own colours and lighting, the story globe, the map pages, the decision colours, any feature or text, and the screens outside the five (helper job board, wallet tab, plan, reports, add item, team): those only get the night top bar and tab bar through the shared components.

## Testing

- Typecheck both apps.
- Check each of the five screens in the browser at 375 px (phone) and 1,280 px (laptop) wide, in English and Japanese.
- Check contrast of every new text and background pair.
- Run the hosted build (`build:hosted`) once, so the online demo still works.
