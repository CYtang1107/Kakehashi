# KAKEHASHI 架け橋

実家じまい, started early and done together. The same two students visit an older parent every month: tea first, her stories, one room at a time, and a safer home. She decides everything, and "Not now" is the default answer. The adult child far away follows along in a digital 実家 and a monthly letter.

TGIC 2026 (Tokyo Global Innovation Challenge) entry. The app ships with an example family: Michiko Tanaka in Niigata, her son Kenji, and students Yui and Arif. All people are illustrative.

**Try it online:** https://kakehashi-epq6.onrender.com (free hosting: the first visit after a quiet spell takes up to a minute, and the example family resets when the service restarts).

## Who uses it

| Role | What they can do |
| --- | --- |
| **Michiko** (her own screen) | Large text, few choices. See who is visiting next and who is coming to help, with the door rule against repair scams. Ask for help in two taps. Say how a job went. See **her circle** (a preview) and switch it on or off. |
| **Family** | The visit thread (every visit as a knot on a thread). The **digital 実家**: 3D house, floor plan, memory mode, neighbourhood map. Item stories and recordings. Share a **wish** about an item (never a vote). Safer home plan with costs, the house's future, help bookings, live outings. Plan and payment, visit reports, the monthly letter, call notes. |
| **Students** | A **Wallet** of earnings and a savings goal. A visit in three steps: **Before** (field notes, consent), **With her** (items, her stories, item photos, room photos, safer home, help, the house's future, activities, outing sharing), **After** (visit report with a fresh-eyes check, monthly letter, calls). **Team** tab: the seven-step evaluation every student passes. |
| **Helpers** | Checked local workers find jobs on the **job board**, at a price set beforehand, and see what they receive after the 15% fee. |
| **Story readers** | Anyone: read stories she chose to share, and send kind words that students approve. |

Every screen switches between Japanese and English.

## Run it

Requires Node.js 20 or newer.

```
npm install
npm run dev
```

This starts the API server on port 4100 and the Expo app on port 8081.

- **Browser:** open http://localhost:8081
- **Phone:** install **Expo Go** and scan the QR code Expo prints (phone and laptop on the same Wi-Fi). Taking photos, audio recording and location sharing work best here.
- If the phone can't reach the server, copy `apps/mobile/.env.example` to `apps/mobile/.env` and set `EXPO_PUBLIC_API_URL` to the address the server prints (for example `http://192.168.1.20:4100`).
- The maps need an internet connection.
- An "error installing React Native DevTools" line at start-up is harmless; the app runs without the debugger.

To start over with the example family: `npm run reset` (while the server runs).

To check colour contrast after changing the theme: `npm run contrast -w apps/mobile` (every text and background pair must meet WCAG AA).

### Public demo link (Render)

`render.yaml` sets up one free Render web service: the server is the API and also serves the built web app, so there is a single link to share. On [render.com](https://render.com), sign in with GitHub, choose **New → Blueprint**, pick this repository and apply.

- The free service sleeps after about 15 minutes without visitors; the first visit after that takes up to a minute.
- Demo data resets to the example family whenever the service restarts, and changes visitors make are shared by everyone using the link.
- No API keys are set: AI estimates run offline and payments stay in demo mode. Don't add live keys to a public demo.
- Demo photos are the team's own pictures, committed in `apps/server/demo` (the sunglasses), so the hosted demo shows them too. Never use a stranger's or a seller's photo. To add one: `npx tsx scripts/make-demo-asset.ts <photo> <item id>` in `apps/server` makes a resized WebP without metadata (phone photos can carry GPS) and its pixel icon.

To try the hosted build locally: `EXPO_PUBLIC_API_URL=same-origin npm run build:hosted`, then `npm run start:hosted` and open http://localhost:4100.

## Features

### Visits, stories and her choice

- Her stories: the story behind an item in her words and her real voice (with consent), kept for the family even after the item has gone.
- **Item photo album:** swipe through an item's pictures like a post: a photo of the item today, old family photos, and illustrations, which always carry an "Illustration (AI-made)" label so nothing imagined passes as a real memory. Photos stay private to the family.
- **Pixel icon from a photo:** the first real photo of an item also becomes its icon (32×32, the photo's own 16 colours) in lists, the floor plan and the 3D house. Students can pick another photo or go back to the drawn icon.
- Her choice for each item, with **Not now** first. An item she agrees to let go stays home until the next visit, in case she changes her mind.
- Visit reports pass a **fresh-eyes check** for pushy or disrespectful wording, then the student ticks **"I read this report myself"** before it can be sent. The family sees "Read by Yui before sending". The monthly letter can't be marked printed until a student confirms they read the whole letter.
- Between visits: a printed monthly letter (思い出だより) and a phone call, logged for the family with her agreement.

### Digital 実家

- **3D house** in pixel art. **Colour by** her choices, stories or planned fixes, with counts. **Evening light** shows the house at night lit only by night lights: *Tonight* (installed) or *With her plan* (also the ones she agreed to); unfixed fall risks pulse red.
- **Floor plan** with room photos, and **memory mode** (the house at dusk, every item with a story glowing, plus a memory tour).
- **Neighbourhood map** (MapLibre GL, OpenFreeMap tiles): her places as lettered pins (A–F: activity venues, her care support centre, doctor, supermarket, library) and every other clinic, pharmacy, care place and shop nearby as dots, with walking times and directions. The places are real, copied from OpenStreetMap (see `apps/server/src/nearby.ts`); her home and the activities are examples.

### Safer home plan (安心リフォーム)

Students note small fixes with her (handrail, removing a step, non-slip floor, sliding door, night light) with a length, count or area. She decides each one. The family sees a costed plan and an estimate of the care-insurance home-modification subsidy (介護保険の住宅改修: usually up to ¥200,000 of eligible work, often 90% covered, after care-level certification and approval). Prices in `packages/shared` are examples for QS members to replace with real local quotes.

### The house's future (家のこれから)

Japan has about 9 million empty homes (空き家). Only if she brings it up, students write down her wish for the house in her own words ("not decided yet" is the default). The family adds notes (wishes, not votes) and sees the condition noted on visits, what the house would cost each year if it stood empty, and early steps such as the inheritance registration required since April 2024. It is not a listing: KAKEHASHI never sells houses and takes no fees from estate agents.

### Help at home and the job board

1. She asks for help (garden, cleaning, small repair, heavy lifting) on her screen, by phone or on a visit.
2. With her, a student sets the price and date, ticks that she agreed to the price, and **posts it to the job board** (or books a helper directly).
3. **Helpers** who passed ID, interview and training checks see open jobs matching their skills: the price, the date, the **area only** (never her name or address), what they receive, and the fee.
4. A helper accepts; the job appears on her screen under "Who is coming". Afterwards she rates it.

**Commission:** KAKEHASHI keeps **15%** of each job for checks, insurance and coordination; the helper keeps 85% (a ¥6,000 job pays the helper ¥5,100).

**Rules for helpers** (shown on their screen): only checked helpers see or accept jobs; the price is fixed before they go, with no extra charges, new work or selling on the day; no cash or gifts from her, payment only through KAKEHASHI; go only on the booked day and show the ID; take, buy or throw away nothing outside the job; she rates every job and repeated complaints end access.

A safer-home fix she agreed to can be booked with a registered builder; finishing the job marks the fix done.

### Where is it now?

Each item's journey on a map: her home, the partner repair shop, the licensed recycler, and the new owner's **area** (a circle, never an address). While a student delivers an item, a marker moves along the route. The demo delivery (the writing desk) is simulated and labelled.

### Outing sharing

While a student walks her to an activity, the family follows the walk live on the neighbourhood map. It uses the **student's** phone, starts only after the student ticks that she agreed for this outing, stops when the outing ends or after 4 hours, and the route is then deleted (only its length is kept). Locations far from her home are refused. The demo walk is simulated and labelled.

### Weather check-in (天気の見守り)

Official warnings for her area come live from the Japan Meteorological Agency (気象庁, `/bosai/warning/data/r8/` feed since the 2026 warning revision), refreshed every 10 minutes. On any warning or emergency warning, and on heavy-snow or low-temperature advisories, students see "Call her today" and log the call: she's fine, needs help, or no answer. The family sees who called and when, with clear next steps if she needs help or did not answer; her screen shows one calm line of advice. If the weather service can't be reached the app says so. A labelled demo switch simulates a warning outside the season.

### Student wallet (学生の報酬)

A **Wallet** tab for students, like EVE's points screen. Pay is added automatically when the work is logged: each visit (when the report is sent), check-in call, weather check-in call and outing. It shows this month, waiting to be paid and paid so far, with a demo payday that pays to the student's own bank account. Students can set a **savings goal** (what for, a target, and the share of each payment to put aside) and watch it add up. A folded **long-term saving** section gives neutral information about NISA and links to the Financial Services Agency's official guide. KAKEHASHI never holds or invests students' money and gives no investment advice. Pay rates (¥1,300 an hour, ¥500 a call) are example assumptions.

### Story feed (物語の広場)

With her consent, a story can be shared publicly, named as she chooses (her first name or "someone in Niigata"), with or without her voice. She can take it down any time. Each story shows as a post: the item's photos to swipe through (only photos of the item itself, and only if she agrees; old family photos and illustrations stay with the family), or the story itself as the post when there are none, with hearts, messages and a share link. Visitors can leave their name blank to post as "Anonymous".

Above the posts, a **story globe** (adapted from EVE's EVEth) shows every shared story as a light on its town, rounded to about 10 km and never the home. Drag to spin, zoom in and out, and tap a light to open the story with "Where it went": the stages and dates of its journey, with no names or places. The demo adds six invented example stories from other towns (Akita, Sendai, Kanazawa, Onomichi, Kagoshima, Sapporo) so the globe shows how it fills up; they are marked "Example" in gold and take no messages. Messages appear only after a student approves them, and messages with links, phone numbers or emails are refused.

### Her circle (preview)

A mock-up of a future idea: people she chooses (family, her students, one neighbour) get a gentle "could someone check on her?" message when a morning does not look normal. Her screen shows who is in it and a switch only she controls; the family sees what she chose. Nothing is sensed or sent yet, a person always calls, and it never replaces 119. Camera-free Wi-Fi sensing such as RuView is one possible signal later (see the proposal).

## No pressure to let go

- **"Not now" is the first and default choice.** Most visits, nothing leaves the house.
- **Resale money belongs to her.** It never reduces the family's fee, and students earn nothing from resale.
- **The family shares wishes, not votes.**
- **Value is shown only when someone asks.**
- **Progress is measured in visits, stories and safer rooms**, never in items removed.

## Privacy and AI defaults

- Story recordings need her consent; the server refuses uploads without it.
- Public stories need her consent per story; visitors' messages are moderated.
- Job listings show the area only; item tracking shows the new owner's area only.
- Live location only during an outing she agreed to, deleted when it ends.
- AI works behind the scenes and never talks to her: it checks reports, helps with letters and estimates value only when asked, and a person confirms they read anything before it goes out. The server refuses reports and letter printing without that confirmation.

## Design

- **Night band:** every screen opens under a night-indigo band (夜) holding the title, with kinari text and persimmon (柿) accents; the bottom tab bars match. Pages sit on cool washi-grey paper below. Zen Kaku Gothic New for text, Shippori Mincho for titles and her words.
- **Decision colours keep their meaning everywhere:** moss = keep, plum = family, indigo = pass on, persimmon = recycle (in lists, the floor plan and the 3D house).
- **Laptop layout:** at 900 px and wider every page fits the window without the page scrolling. It splits into two columns (for example the 3D house beside the item list, the story globe beside the posts); a column that holds more scrolls on its own and fades at the bottom while there is more. Phones keep one column that scrolls as usual. Her screen keeps its large text in both.
- **Accessibility:** every text and background pair meets WCAG AA (checked by `npm run contrast`), text is at least 12 px, and buttons and links are at least 44 px tall. The chosen language is remembered after a reload.
- **Visit thread:** the family home shows a year of visits drawn as knots on a white thread over indigo cloth (藍染): done, next, and months ahead.
- Long screens use **folds**: a section shows one line (title and status) until tapped.
- The design decisions and the build plan are in `docs/superpowers/`.

## AI features (optional)

Without a key, value estimates come from simple offline rules and the fresh-eyes check uses an English/Japanese word list. With a key, Claude estimates value from the photo and reviews visit reports like a cold reader:

1. Create an API key at https://console.anthropic.com and set a monthly spend limit.
2. Copy `apps/server/.env.example` to `apps/server/.env` and set `ANTHROPIC_API_KEY=...`.
3. Restart `npm run dev`.

The key stays on the server and is never sent to the app.

## Payments (optional, test mode only)

Without a key, checkout runs in **demo mode** and records a payment without charging anything. To try Stripe's test screens, set `STRIPE_SECRET_KEY=sk_test_...` in `apps/server/.env`, restart, and pay with the test card `4242 4242 4242 4242`. Live keys (`sk_live_`) are refused on purpose: this pilot never moves real money.

## Project layout

```
apps/server            Express API, JSON-file storage (apps/server/data, not committed)
  src/index.ts         API routes
  src/seed.ts          The example family
  src/mapPage.ts       Neighbourhood map page (/map/:homeId)
  src/trackPage.ts     Item tracking page (/track/:itemId)
  src/weather.ts       Live JMA weather warnings
  src/pixelize.ts      Pixel icons from item photos (sharp)
  src/nearby.ts        Real nearby places from OpenStreetMap
  demo/                The team's own demo photos and their pixel icons
  scripts/             make-demo-asset.ts (turns a photo into a demo asset)
apps/mobile            Expo Router app (iOS, Android, web)
  app/                 Screens per role: her/, family/, student/, worker/, stories/, item/
  src/                 Shared components (3D house, maps, story globe, cards, i18n)
  scripts/             check-contrast.ts (WCAG check for the theme colours)
packages/shared        Types and rules shared by both
docs/superpowers       Design spec and build plan for the night band and laptop layout
render.yaml            The public demo on Render
```

## Known limits

- A pilot prototype: no real sign-in (helpers pick who they are), and data is a JSON file.
- Not yet tested end to end on a phone.
- Her circle is a preview only: nothing is sensed or sent.
- Prices, fees and subsidy figures are examples to verify.
- Demo IDs include the example family's surname; a real build should use random IDs.

## Data and credits

Map data © OpenStreetMap contributors (ODbL). Map tiles by OpenFreeMap. Weather warnings: Japan Meteorological Agency (気象庁). Places near the demo home were copied on 10 October 2026. Story globe coastlines: Natural Earth 1:50m land (public domain), via the world-atlas package. The sunglasses photo is our own.
