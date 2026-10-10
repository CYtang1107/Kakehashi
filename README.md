# KAKEHASHI 架け橋

実家じまい, started early and done together. The same two students visit an elderly parent every month to sort the home, record the story behind each item, and pass things on to someone who will use them. The adult child far away follows along in a digital map of the home.

TGIC 2026 (Tokyo Global Innovation Challenge) entry. The app ships with an example family (Michiko Tanaka in Niigata, her son Kenji, students Yui and Arif). All people are illustrative.

## What's in it

| Role | What they can do |
| --- | --- |
| **Family** | Home summary (visits, stories, safer rooms) · **digital 実家** as a rotatable **3D** house, a floor plan with **real room photos**, or **memory mode** (the house at dusk, every item glowing with its story, plus a memory tour) · item stories with recordings · share a **wish** about an item (never a vote; the senior decides) · value shown **only when asked** · **plan and payment** (same fee whatever stays or goes) · the **monthly letter** and **call notes** · visit reports marked "checked for pressure" · student badges · local activities |
| **Students** | **Field notes** from earlier visits · recording consent · capture **room photos** · log an item with a photo and an **AI value estimate** · record the story (real audio) · create a **story tag QR** · her choice with "Not now" first · log handovers · write the **visit report**, which passes a **fresh-eyes check** for pushy wording before reaching the family · prepare the printed **monthly letter (思い出だより)** · log the **call between visits** · propose **local activities** matched to her interests · **Team** tab: the seven-step evaluation every student passes before visiting |
| **New owner** | **Scan the QR** (phone camera) or type the code · hear the story · see the item's journey · send a thank-you |

Japanese / English switch on every screen; the example family's stories, reports and notes are written in both languages, and her printed letter is in Japanese.

## Run it

Requires Node.js 20 or newer.

```
npm install
npm run dev
```

This starts the API server on port 4100 and the Expo app.

- **Browser:** open http://localhost:8081
- **Phone:** install **Expo Go**, scan the QR code Expo prints. Phone and laptop must be on the same Wi-Fi. Camera scanning and audio recording work best here.
- If the phone can't reach the server, copy `apps/mobile/.env.example` to `apps/mobile/.env` and set `EXPO_PUBLIC_API_URL` to the address the server prints (e.g. `http://192.168.1.20:4100`).

To start over with the example family: `npm run reset` (while the server runs).

## AI features (optional)

Without a key, value estimates come from simple offline rules and the fresh-eyes check uses an English/Japanese word list. With a key, Claude estimates value from the photo and reviews visit reports like a cold reader. To enable:

1. Create an API key at https://console.anthropic.com and set a monthly spend limit.
2. Copy `apps/server/.env.example` to `apps/server/.env` and set `ANTHROPIC_API_KEY=...`.
3. Restart `npm run dev`.

The key stays on the server and is never sent to the app. Each estimate is one paid API call (photo + short answer).

## Payments (optional, test mode only)

Without a key, checkout runs in **demo mode** and records a payment without charging anything. To try real Stripe screens with test cards:

1. Create a Stripe account and copy the **test** secret key (starts with `sk_test_`).
2. Set `STRIPE_SECRET_KEY=sk_test_...` in `apps/server/.env` and restart.
3. Pay with the test card `4242 4242 4242 4242`, any future date, any CVC.

Live keys (`sk_live_`) are refused on purpose: this pilot never moves real money.

## Project layout

```
apps/server   Express API, JSON-file storage (apps/server/data, not committed), Claude + Stripe integrations
apps/mobile   Expo Router app (iOS, Android, web)
packages/shared  Types shared by both
```

## Safer home plan (安心リフォーム)

Students note small home modifications with her (handrail, removing a step, non-slip floor, sliding door, night light) with a length, count or area. She decides each one (suggested, she agreed, not now, done). The family sees a costed plan and an estimate of the care-insurance home-modification subsidy (介護保険の住宅改修: usually up to ¥200,000 of eligible work, often 90% covered; it needs a care-level certification and approval before work). Prices in `packages/shared` are examples for QS members to replace with real local quotes. Fixes appear as markers on the floor plan.

## 3D views: colour by, and evening light

Under the 3D house, **Colour by** rings every item by her choice or by whether it has a story (with counts), or shows the safer-home fixes as markers. **Evening light** shows the house at night, lit only by night lights: *Tonight* uses the lights already installed; *With her plan* adds the ones she agreed to. Unfixed fall risks pulse red, and the legend names the rooms that are still dark.

## The house's future (家のこれから)

Japan has about 9 million empty homes (空き家), often because nobody asked the owner what she wanted while she could say. Students write down her wish for the house in her own words, only if she brings it up ("not decided yet" is the default). The family adds notes (wishes, not votes), sees the condition students noted on visits (roof, water, wood, walls, garden), what the house would cost each year if it stood empty (including the extra land tax if the city designates it), and a checklist of steps to take early, such as the inheritance registration that has been required since April 2024. It is not a listing: KAKEHASHI never sells houses and takes no fees from estate agents.

## Help at home (お手伝いの依頼)

Michiko has her own screen (large text, few choices). She taps Garden, Cleaning, Small repair or Heavy lifting, then "Soon" or "At the next visit"; a student calls her about the details. She can also ask by phone or on a visit, and students can ask for her. Students book only workers who passed the same checks as students (ID, interview, training): the Silver Human Resources Centre (シルバー人材センター), a home-help cooperative, a registered builder, or gig workers. Prices are fixed before anyone comes and the worker keeps 85%. Her screen always shows who is coming, with the rule "nobody comes from KAKEHASHI without a booking on this screen", against fake inspection and repair scams. Afterwards she taps how it went. A safer-home fix she agreed to can be booked with a builder; when the job is done, the fix is marked done.

## Neighbourhood map

A fourth view on the family's house screen (3D · Floor plan · Memory · Neighbourhood): a real street map with 3D buildings (MapLibre GL with free OpenFreeMap tiles from OpenStreetMap), showing her home, the clinic, the shop and the places for her local activities. Tap a pin for the activity, its date, who goes with her and roughly how long the walk takes; dotted lines are walks a student takes with her. The server serves the map page at `/map/:homeId`; the app shows it in an iframe on web and a WebView on phones (works in Expo Go). It needs an internet connection. All places are demo points, never a real address.

## No pressure to let go

- **"Not now" is the first and default choice.** Most items are never decided, and most visits nothing leaves the house.
- **Resale money belongs to the senior.** She chooses to keep it, save it for a grandchild, or donate it. It never reduces the family's fee, so nobody gains from her letting things go.
- **The family shares wishes, not votes** ("I'd love to keep it in the family", "Please ask her about its story").
- **Value is shown only when someone asks**, and the AI only says where an item would go *if* she chooses to let it go.
- **Change-of-mind hold:** an item she agrees to let go stays at home until the next visit; the server refuses an earlier handover.
- **Progress is measured in visits, stories and safer rooms**, never in items removed.

## Privacy defaults

- Story recordings need the senior's consent; the server refuses uploads without it.
- A scanned story tag shows only the senior's first name and town, never a surname or address.
- Students earn nothing from resale, so they have no reason to pressure anyone to let go of items.
