# KAKEHASHI 架け橋

実家じまい, started early and done together. The same two students visit an older parent every month: tea first, her stories, one room at a time, and a safer home. She decides everything, and "Not now" is the default answer. The adult child far away follows along in a digital 実家 and a monthly letter.

TGIC 2026 (Tokyo Global Innovation Challenge) entry. The app ships with an example family: Michiko Tanaka in Niigata, her son Kenji, and students Yui and Arif. All people are illustrative.

## Who uses it

| Role | What they can do |
| --- | --- |
| **Michiko** (her own screen) | Large text, few choices. See who is visiting next and who is coming to help, with the door rule against repair scams. Ask for help in two taps. Say how a job went. |
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

With her consent, a story can be shared publicly, named as she chooses (her first name or "someone in Niigata"), with or without her voice. She can take it down any time. Visitors' messages appear only after a student approves them, and messages with links, phone numbers or emails are refused.

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

- **Visit thread:** the family home opens on a year of visits drawn as knots on a white thread over indigo cloth (藍染): done, next, and months ahead.
- Cool washi-grey paper, indigo (藍) accent, sentence-case labels, Zen Kaku Gothic New and Shippori Mincho.
- Long screens use **folds**: a section shows one line (title and status) until tapped.

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
apps/mobile            Expo Router app (iOS, Android, web)
  app/                 Screens per role: her/, family/, student/, worker/, stories/, item/
  src/                 Shared components (3D house, maps, cards, i18n)
packages/shared        Types and rules shared by both
```

## Known limits

- A pilot prototype: no real sign-in (helpers pick who they are), and data is a JSON file.
- Not yet tested end to end on a phone.
- Prices, fees and subsidy figures are examples to verify.
- Demo IDs include the example family's surname; a real build should use random IDs.

## Data and credits

Map data © OpenStreetMap contributors (ODbL). Map tiles by OpenFreeMap. Weather warnings: Japan Meteorological Agency (気象庁). Places near the demo home were copied on 10 October 2026.
