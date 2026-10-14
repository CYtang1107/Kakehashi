# Night Band Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give KAKEHASHI a night-indigo header band and bottom bars, persimmon accents, and two-column laptop layouts on the five video screens, as set out in `docs/superpowers/specs/2026-10-14-night-band-layout-design.md`.

**Architecture:** New colour tokens in `theme.ts`, checked by a small contrast script. The shared `TopBar`, `Screen` and `Button` in `src/ui.tsx` carry the band; a new `Columns` component (in `src/ui.tsx`) splits content side by side at 900 px and stacks it below. Each video screen moves its `Heading` into `Screen`'s `header` prop and wraps its body in `Columns`.

**Tech Stack:** Expo SDK 57, expo-router, React Native 0.86 + react-native-web, TypeScript. No test runner in the app: checks are `tsc --noEmit`, a `tsx` contrast script, and the browser at 375 px and 1,280 px.

All paths are relative to the repo root (`kakehashi/`). The dev app runs with `npm run dev` (server on 4100, app on 8081).

---

## File map

| File | Change |
|---|---|
| `apps/mobile/scripts/check-contrast.ts` | New: asserts WCAG contrast for every text/background pair |
| `apps/mobile/package.json` | New `contrast` script |
| `apps/mobile/src/theme.ts` | New night/persimmon tokens; eyebrow colour |
| `apps/mobile/src/ui.tsx` | Night `TopBar` and `LangToggle`; `Screen` `header` + `wide`; `NightBand`; `Columns`, `useWide`; night primary `Button` |
| `apps/mobile/app/_layout.tsx` | Light status bar |
| `apps/mobile/app/family/_layout.tsx`, `apps/mobile/app/student/_layout.tsx` | Night tab bars |
| `apps/mobile/app/family/house.tsx` | Header band + Columns |
| `apps/mobile/app/item/[id].tsx` | Header band with icon + Columns |
| `apps/mobile/app/stories/index.tsx` | Header band + Columns with sticky globe |
| `apps/mobile/app/student/index.tsx` | Header band + Columns in the "With her" step |
| `apps/mobile/app/her/index.tsx` | Large header band |

---

### Task 1: Contrast check and colour tokens

**Files:**
- Create: `apps/mobile/scripts/check-contrast.ts`
- Modify: `apps/mobile/package.json` (scripts)
- Modify: `apps/mobile/src/theme.ts:3-19` (colors), `:35` (eyebrow)

- [ ] **Step 1: Write the failing check**

Create `apps/mobile/scripts/check-contrast.ts`:

```ts
// WCAG contrast check for the colour pairs the app uses. Run: npm run contrast -w apps/mobile
import { colors, decisionColor } from '../src/theme';

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [label, text, background, minimum]
const pairs: [string, string, string, number][] = [
  ['band title', colors.onNight, colors.night, 4.5],
  ['band caption', colors.onNightSoft, colors.night, 4.5],
  ['band eyebrow / active tab', colors.kakiNight, colors.night, 4.5],
  ['chip in band', colors.onNight, colors.nightRaised, 4.5],
  ['persimmon on raised', colors.kakiNight, colors.nightRaised, 4.5],
  ['primary button', colors.onNight, colors.night, 4.5],
  ['eyebrow on paper', colors.kakiInk, colors.paper, 4.5],
  ['eyebrow on sheet', colors.kakiInk, colors.sheet, 4.5],
  ['eyebrow on tinted card', colors.kakiInk, colors.aiTint, 4.5],
  ['body on paper', colors.ink, colors.paper, 4.5],
  ['caption on paper', colors.inkSoft, colors.paper, 4.5],
  ['caption on sheet', colors.inkSoft, colors.sheet, 4.5],
  ...Object.entries(decisionColor).map(([k, c]) => [`decision ${k}`, c.fg, c.bg, 4.5] as [string, string, string, number]),
];

let failed = 0;
for (const [label, fg, bg, min] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2)}:1  ${label} (${fg} on ${bg})`);
}
if (failed) { console.error(`${failed} pair(s) below WCAG AA`); process.exit(1); }
```

Add to `apps/mobile/package.json` `"scripts"`:

```json
"contrast": "tsx scripts/check-contrast.ts",
```

- [ ] **Step 2: Run it to see it fail**

Run: `npm run contrast -w apps/mobile`
Expected: FAIL. `colors.onNight` etc. are `undefined`, so `lum` throws or pairs print `NaN` and the script exits non-zero.

- [ ] **Step 3: Add the tokens**

In `apps/mobile/src/theme.ts`, replace the comment and `colors` object (lines 3-19) with:

```ts
// Night-indigo band (夜), kinari text on it, persimmon (柿) accents; washi-grey paper below.
// Decision colours keep their meanings: moss = keep, plum = family, indigo = pass on, persimmon = recycle.
export const colors = {
  paper: '#ECEEEA',
  sheet: '#FAFBF8',
  ink: '#1C2330',
  inkSoft: '#59616F',
  line: '#D5D9D1',
  night: '#121A2A',
  nightRaised: '#1E2A40',
  onNight: '#F3EEE4',
  onNightSoft: '#A9B3C6',
  kakiNight: '#F08A4B',
  kakiInk: '#A04A22',
  ai: '#2B4C7E',
  aiTint: '#E3E9F3',
  moss: '#4F6B3A',
  mossTint: '#E6ECDF',
  plum: '#7A4A6E',
  plumTint: '#EFE3EC',
  kaki: '#B5562B',
  kakiTint: '#F4E3D9',
  danger: '#B3261E',
} as const;
```

And change the `eyebrow` line in `type`:

```ts
  eyebrow: { fontFamily: fonts.medium, fontSize: 13, color: colors.kakiInk },
```

- [ ] **Step 4: Run the check to see it pass**

Run: `npm run contrast -w apps/mobile`
Expected: every line starts with `ok`, exit code 0. If `decision recycle` (`#B5562B` on `#F4E3D9`) fails, change `kaki` to `#A04A22` and rerun; the 3D house reads the same token.

- [ ] **Step 5: Typecheck and commit**

Run: `npm run typecheck -w apps/mobile` (expected: no output after the `tsc --noEmit` line)

```bash
git add apps/mobile/scripts/check-contrast.ts apps/mobile/package.json apps/mobile/src/theme.ts
git commit -m "Night band: colour tokens and a WCAG contrast check"
```

---

### Task 2: Night buttons, status bar and tab bars

**Files:**
- Modify: `apps/mobile/src/ui.tsx` (`Button`, around line 136)
- Modify: `apps/mobile/app/_layout.tsx:16`
- Modify: `apps/mobile/app/family/_layout.tsx`, `apps/mobile/app/student/_layout.tsx` (Tabs `screenOptions`)

- [ ] **Step 1: Primary button turns night**

In `Button` (`src/ui.tsx`), replace:

```tsx
  const fg = primary ? colors.sheet : kind === 'danger' ? colors.danger : colors.ink;
```
with
```tsx
  const fg = primary ? colors.onNight : kind === 'danger' ? colors.danger : colors.ink;
```
and in its style replace `backgroundColor: primary ? colors.ai : colors.sheet` with `backgroundColor: primary ? colors.night : colors.sheet`.

- [ ] **Step 2: Light status bar**

In `apps/mobile/app/_layout.tsx` replace `<StatusBar style="dark" />` with `<StatusBar style="light" />`.

- [ ] **Step 3: Night tab bars**

In both `apps/mobile/app/family/_layout.tsx` and `apps/mobile/app/student/_layout.tsx`, replace the `screenOptions` object with:

```tsx
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.kakiNight, tabBarInactiveTintColor: colors.onNightSoft,
      tabBarStyle: { backgroundColor: colors.night, borderTopWidth: 0 }, tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 } }}>
```

- [ ] **Step 4: Typecheck, look, commit**

Run: `npm run typecheck -w apps/mobile`. Open http://localhost:8081/family/house: bottom bar is night with a persimmon active tab; primary buttons (e.g. memory "Play tour") are night with light text.

```bash
git add apps/mobile/src/ui.tsx apps/mobile/app/_layout.tsx apps/mobile/app/family/_layout.tsx apps/mobile/app/student/_layout.tsx
git commit -m "Night band: night primary buttons, light status bar, night tab bars"
```

---

### Task 3: Night top bar

**Files:**
- Modify: `apps/mobile/src/ui.tsx:12-45` (`LangToggle`, `TopBar`)

- [ ] **Step 1: Replace `LangToggle` and `TopBar`**

```tsx
export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={lang === 'en' ? '日本語に切り替え' : 'Switch to English'}
      onPress={() => setLang(lang === 'en' ? 'ja' : 'en')}
      style={{ paddingHorizontal: 10, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#33415C', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.nightRaised }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.onNight }}>{lang === 'en' ? '日本語' : 'EN'}</Text>
    </Pressable>
  );
}

// The top of every screen: night indigo, joined to the page heading band below it when a screen has one.
export function TopBar({ back, roleSwitch }: { back?: boolean; roleSwitch?: boolean }) {
  const { top } = useSafeAreaInsets();
  const { t } = useI18n();
  return (
    <View style={{ paddingTop: top + 8, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.night }}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel={t('back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
          <Feather name="chevron-left" size={26} color={colors.onNight} />
        </Pressable>
      ) : (
        <Text numberOfLines={1} style={{ fontFamily: fonts.display, fontSize: 17, color: colors.onNight, flexShrink: 1 }}>KAKEHASHI <Text style={{ color: colors.kakiNight }}>架け橋</Text></Text>
      )}
      <View style={{ flex: 1 }} />
      {roleSwitch ? (
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={{ paddingHorizontal: 10, height: 32, justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.onNight }}>{t('switchRole')}</Text>
        </Pressable>
      ) : null}
      <LangToggle />
    </View>
  );
}
```

- [ ] **Step 2: Typecheck, look, commit**

Run: `npm run typecheck -w apps/mobile`. Open http://localhost:8081/ (role picker) and /family/house: the top bar is night; logo kinari with persimmon 架け橋; 日本語 toggle readable.

```bash
git add apps/mobile/src/ui.tsx
git commit -m "Night band: night top bar"
```

---

### Task 4: `Screen` header band, wide pages and `Columns`

**Files:**
- Modify: `apps/mobile/src/ui.tsx` (imports line 2; `Screen` lines 47-71; add `NightBand`, `useWide`, `Columns` after `Screen`)

- [ ] **Step 1: Imports**

Replace line 2 of `src/ui.tsx` with:

```tsx
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions, type TextInputProps, type ViewStyle } from 'react-native';
```

- [ ] **Step 2: Replace `Screen` and add the new pieces**

```tsx
export type ScreenHeader = { eyebrow?: string; title: string; sub?: string; leading?: React.ReactNode; large?: boolean };

// Laptop layouts start at this width; below it everything is one column.
export const WIDE_MIN = 900;
export function useWide() {
  return useWindowDimensions().width >= WIDE_MIN;
}

export function Screen({ children, back, roleSwitch = true, header, wide }: {
  children: React.ReactNode; back?: boolean; roleSwitch?: boolean; header?: ScreenHeader; wide?: boolean;
}) {
  const { data, error, refresh } = useData();
  const { t } = useI18n();
  const isWide = useWide();
  const maxWidth = wide && isWide ? 1120 : 640;
  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <TopBar back={back} roleSwitch={roleSwitch} />
      {error ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Card style={{ backgroundColor: colors.kakiTint, borderColor: 'transparent' }}>
            <Text style={type.bodyBold}>{t('serverDown', { url: API_BASE })}</Text>
            <Text style={type.caption}>{error}</Text>
            <Button label={t('retry')} onPress={refresh} />
          </Card>
        </View>
      ) : !data ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.ai} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {header ? <NightBand header={header} maxWidth={maxWidth} /> : null}
          <View style={{ padding: 16, gap: 14, maxWidth, width: '100%', alignSelf: 'center' }}>
            {children}
          </View>
        </ScrollView>
      )}
      <Toast />
    </View>
  );
}

// The page heading on night indigo, directly under the top bar so the two read as one band.
export function NightBand({ header, maxWidth }: { header: ScreenHeader; maxWidth: number }) {
  const { eyebrow, title, sub, leading, large } = header;
  return (
    <View style={{ backgroundColor: colors.night, paddingHorizontal: 16, paddingTop: 4, paddingBottom: large ? 24 : 18 }}>
      <View style={{ maxWidth, width: '100%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {leading}
        <View style={{ flex: 1, gap: 4 }}>
          {eyebrow ? <Text style={[type.eyebrow, { color: colors.kakiNight }]}>{eyebrow}</Text> : null}
          <Text style={[type.title, { color: colors.onNight }, large ? { fontSize: 34, lineHeight: 44 } : null]}>{title}</Text>
          {sub ? <Text style={[large ? { fontFamily: fonts.medium, fontSize: 18, lineHeight: 27 } : type.caption, { color: colors.onNightSoft }]}>{sub}</Text> : null}
        </View>
      </View>
    </View>
  );
}

// Two columns on a laptop (left about 58%), one stacked column on a phone.
// stickyLeft keeps the left column in view while the right one scrolls (web only).
export function Columns({ left, right, stickyLeft }: { left: React.ReactNode; right: React.ReactNode; stickyLeft?: boolean }) {
  const wide = useWide();
  if (!wide) return <>{left}{right}</>;
  const sticky = stickyLeft && Platform.OS === 'web' ? ({ position: 'sticky', top: 16 } as unknown as ViewStyle) : null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 20 }}>
      <View style={[{ flex: 1.38, minWidth: 0, gap: 14 }, sticky]}>{left}</View>
      <View style={{ flex: 1, minWidth: 0, gap: 14 }}>{right}</View>
    </View>
  );
}
```

- [ ] **Step 3: Typecheck and look**

Run: `npm run typecheck -w apps/mobile`. Every screen still renders (no screen passes `header` yet); content keeps its 16 px padding and 640 px width.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/ui.tsx
git commit -m "Night band: Screen header band, wide pages and Columns"
```

---

### Task 5: Digital 実家 (`family/house.tsx`)

**Files:**
- Modify: `apps/mobile/app/family/house.tsx:74-156` (the `return` of `House`) and its `ui` import

- [ ] **Step 1: Import `Columns`**

Add `Columns` to the existing import from `'../../src/ui'` in `house.tsx`, and remove `Heading` from it if nothing else uses it (check with `grep -n "Heading" apps/mobile/app/family/house.tsx`).

- [ ] **Step 2: Move the heading into the band and split the body**

Replace the start of the return (lines 74-79):

```tsx
  return (
    <Screen>
      {data ? (
        <>
          <Heading eyebrow={memory ? t('memoryHouse') : t('tabHouse')} title={...}
            sub={memory ? t('memoryLead') : view === 'map' ? t('mapLead') : t('dragToRotate')} />
```
with:
```tsx
  const header = data ? {
    eyebrow: memory ? t('memoryHouse') : t('tabHouse'),
    title: lang === 'ja' && data.home.seniorNameJa ? `${data.home.seniorNameJa.split(' ')[1]}さん · ${pick(lang, data.home.town, data.home.townJa)}` : `${data.home.seniorName.split(' ')[0]} · ${data.home.town}`,
    sub: memory ? t('memoryLead') : view === 'map' ? t('mapLead') : t('dragToRotate'),
  } : undefined;

  return (
    <Screen wide header={header}>
      {data ? (
        <Columns
          left={<>
```

Leave the next blocks as they are; they are now the left column: the view switcher row, `{view === 'map' ? <LiveOutingBanner /> : null}`, the stage `<Card>` (3D / floor plan / map and its legends) and the `{view === '3d' ? (<Card>…colour by / evening…</Card>) : null}` block.

Directly after that colour-by block (before `{view === 'map' ? (<NearbyList`), close the left column and open the right one:

```tsx
          </>}
          right={<>
```

At the end, replace the closing of the old fragment (the `</>` that closes after the items map and `)}`), i.e. lines 153-155:

```tsx
            </>
          )}
        </>
      ) : null}
```
with:
```tsx
            </>
          )}
          </>}
        />
      ) : null}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck -w apps/mobile`
Expected: no errors. If TS reports `Heading` unused, remove it from the import.

- [ ] **Step 4: Look at both widths**

At http://localhost:8081/family/house:
- 1,280 px wide: night band with "Digital 実家" eyebrow and "Michiko · Niigata"; 3D house and colour-by on the left; the Items / Safer / Future / Photos list on the right. Switch to Floor plan, Memory and Neighbourhood: each stage stays left, its list right.
- 375 px wide (browser pane resize "mobile"): one column, same order as before.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/app/family/house.tsx
git commit -m "Night band: Digital 実家 header band and two columns"
```

---

### Task 6: Item page (`item/[id].tsx`)

**Files:**
- Modify: `apps/mobile/app/item/[id].tsx:55-165` and its `ui` import

- [ ] **Step 1: Import `Columns`** (add to the `'../../src/ui'` import; drop `Heading` if unused afterwards).

- [ ] **Step 2: Band with the pixel icon**

Replace lines 55-64 (from `return (` through the closing `</View>` of the icon row):

```tsx
  return (
    <Screen back>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 84, height: 84, ... }}>
          <PixelIcon sprite={spriteFor(item)} size={64} />
        </View>
        <View style={{ flex: 1 }}>
          <Heading eyebrow={...} title={name} />
        </View>
      </View>
```
with:
```tsx
  const header = {
    eyebrow: `${room ? (lang === 'ja' ? room.nameJa : room.name) : ''}${item.year ? `, ${item.year}` : ''}`,
    title: name,
    leading: (
      <View style={{ width: 76, height: 76, borderRadius: 16, backgroundColor: colors.sheet, alignItems: 'center', justifyContent: 'center' }}>
        <PixelIcon sprite={spriteFor(item)} size={58} />
      </View>
    ),
  };

  return (
    <Screen back wide header={header}>
      <Columns
        left={<>
```

The photo carousel, the icon-reset link, her story block and `{item.audioUrl ? <StoryPlayer … /> : null}` stay as they are: they are the left column.

Directly before `{student ? (` (the line after the `StoryPlayer` line), close left and open right:

```tsx
        </>}
        right={<>
```

At the end, replace lines 162-165:

```tsx
      <Worth item={item} />

      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
    </Screen>
```
with:
```tsx
      <Worth item={item} />
        </>}
      />
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
    </Screen>
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck -w apps/mobile` (expected: clean).

- [ ] **Step 4: Look at both widths**

http://localhost:8081/item/sewing (family) and http://localhost:8081/item/sewing?as=student:
- 1,280 px: band with the pixel icon, "Tatami room, 1972" and "Sewing machine"; photos and her story left; her choice, wish, "Where is it now", sharing right.
- 375 px: one column, photos first.

- [ ] **Step 5: Commit**

```bash
git add "apps/mobile/app/item/[id].tsx"
git commit -m "Night band: item page header with its icon, two columns"
```

---

### Task 7: Story feed (`stories/index.tsx`)

**Files:**
- Modify: `apps/mobile/app/stories/index.tsx:29-52` and its imports

- [ ] **Step 1: Imports**

Replace `import { Heading, Screen, formatDate } from '../../src/ui';` with:

```tsx
import { Columns, Screen, formatDate } from '../../src/ui';
```

- [ ] **Step 2: Band and columns**

Replace the opening of the return through the posts and rules:

```tsx
    <Screen>
      <Heading eyebrow={t('feedEyebrow')} title={t('feedTitle')} sub={t('feedLead')} />
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
      {stories?.length ? (
        <View style={{ gap: 8 }}>
          …globe, hint, story buttons, legend…
        </View>
      ) : null}
      {stories?.map((s) => <StoryPost key={s.id} story={s} />)}
      {stories && stories.length === 0 ? <Text style={type.body}>{t('feedEmpty')}</Text> : null}
      <Text style={type.caption}>{t('feedRules')}</Text>
```
with (the globe `View` block is unchanged, only moved into `left`):
```tsx
    <Screen wide header={{ eyebrow: t('feedEyebrow'), title: t('feedTitle'), sub: t('feedLead') }}>
      {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
      <Columns stickyLeft
        left={stories?.length ? (
          <View style={{ gap: 8 }}>
            …globe, hint, story buttons, legend (unchanged)…
          </View>
        ) : null}
        right={<>
          {stories?.map((s) => <StoryPost key={s.id} story={s} />)}
          {stories && stories.length === 0 ? <Text style={type.body}>{t('feedEmpty')}</Text> : null}
          <Text style={type.caption}>{t('feedRules')}</Text>
        </>}
      />
```

The `<Modal>` block stays after `Columns`, unchanged.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck -w apps/mobile` (expected: clean).

- [ ] **Step 4: Look at both widths**

http://localhost:8081/stories:
- 1,280 px: band "物語の広場 / Stories from Japan's homes"; globe left, posts right; scrolling the posts keeps the globe in view; tapping a light still opens the story sheet; scroll-wheel over the globe still zooms.
- 375 px: globe above the posts, as before.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/app/stories/index.tsx
git commit -m "Night band: story feed header band, globe beside the posts"
```

---

### Task 8: Student home (`student/index.tsx`)

**Files:**
- Modify: `apps/mobile/app/student/index.tsx:40-90` and its `ui` import

- [ ] **Step 1: Import `Columns`** (add to the `'../../src/ui'` import; drop `Heading` if unused afterwards).

- [ ] **Step 2: Band**

Replace:

```tsx
    <Screen>
      <Heading eyebrow={t('visitToday', { name: … })} title={lang === 'ja' ? current.nameJa : current.name} />
```
with:
```tsx
    <Screen wide header={{
      eyebrow: t('visitToday', { name: lang === 'ja' && home.seniorNameJa ? home.seniorNameJa.split(' ')[0] : home.seniorName.split(' ')[1] ?? home.seniorName }),
      title: lang === 'ja' ? current.nameJa : current.name,
    }}>
```

- [ ] **Step 3: Columns in the "With her" step**

Replace the start of the `step === 'with'` branch:

```tsx
      ) : step === 'with' ? (
        <>
      <Text style={type.section}>{t('items')}</Text>
```
with:
```tsx
      ) : step === 'with' ? (
        <>
      <Columns
        left={<>
      <Text style={type.section}>{t('items')}</Text>
```

Replace:

```tsx
      <Button label={t('tabAdd')} kind="secondary" icon="camera" onPress={() => router.push('/student/add')} />
      <Text style={[type.section, { marginTop: 6 }]}>{t('moreWithHer')}</Text>
```
with:
```tsx
      <Button label={t('tabAdd')} kind="secondary" icon="camera" onPress={() => router.push('/student/add')} />
        </>}
        right={<>
      <Text style={[type.section, { marginTop: 6 }]}>{t('moreWithHer')}</Text>
```

And after the last `</Fold>` (the "from home to community" fold), before the `stepNextAfter` button:

```tsx
        </>}
      />
```

- [ ] **Step 4: Before and After stay narrow on a laptop**

The "Before" and "After" steps are short forms. Keep them readable at 1,280 px by wrapping each branch's fragment content in:

```tsx
<View style={{ maxWidth: 640, width: '100%', gap: 14 }}> … </View>
```

(the `before` branch: from `<WeatherCheckCard />` through the `stepNextWith` button; the `after` branch: `<ReportCard />`, `<LetterCard …/>`, `<CallsCard …/>`).

- [ ] **Step 5: Typecheck, look, commit**

Run: `npm run typecheck -w apps/mobile`. At http://localhost:8081/student, 1,280 px: band "Visit today with Michiko"/room name; Before step one 640 px column; "With her" step items left, folds right; 375 px: unchanged order.

```bash
git add apps/mobile/app/student/index.tsx
git commit -m "Night band: student home header band, two columns with her"
```

---

### Task 9: Her screen (`her/index.tsx`)

**Files:**
- Modify: `apps/mobile/app/her/index.tsx:55-60`

- [ ] **Step 1: Large band, one column**

Replace:

```tsx
    <Screen>
      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 34, lineHeight: 44, color: colors.ink }}>{t('herHello')}</Text>
        <Text style={[body, { color: colors.inkSoft }]}>{t('herToday', { date: today(lang) })}</Text>
      </View>
```
with:
```tsx
    <Screen header={{ title: t('herHello'), sub: t('herToday', { date: today(lang) }), large: true }}>
```

`Screen` is not given `wide`, so her screen stays at 640 px at every width.

- [ ] **Step 2: Typecheck, look, commit**

Run: `npm run typecheck -w apps/mobile` (remove now-unused imports if TS reports them). At http://localhost:8081/her: night band with the 34 px greeting and 18 px date; everything below unchanged; 1,280 px still one centred column.

```bash
git add apps/mobile/app/her/index.tsx
git commit -m "Night band: her screen greeting in a large band"
```

---

### Task 10: Full check, hosted build, push

- [ ] **Step 1: Contrast and types**

Run: `npm run contrast -w apps/mobile` (all `ok`), `npm run typecheck -w apps/mobile`, `npm run typecheck -w apps/server` (both clean).

- [ ] **Step 2: Browser pass**

For each of `/her`, `/family/house`, `/item/sewing`, `/stories`, `/student`: check at 375 px and 1,280 px, in English and 日本語 (toggle in the band). Look for: text clipped in the band, columns overlapping, the globe or 3D canvas blank, tab bar labels unreadable. Also open `/`, `/worker`, `/student/wallet`, `/family/plan`, `/family/reports` once: night top bar, nothing broken.

- [ ] **Step 3: Hosted build**

```bash
EXPO_PUBLIC_API_URL=same-origin npm run build:hosted
```
Expected: `Exported: dist`. Then `rm -rf apps/mobile/dist` so the dev server does not serve the old build.

- [ ] **Step 4: Push**

```bash
git push origin main
```
Render redeploys https://kakehashi-epq6.onrender.com in a few minutes; open `/stories` there once at laptop width.
