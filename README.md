# KAKEHASHI 架け橋

実家じまい, started early and done together. The same two students visit an elderly parent every month to sort the home, record the story behind each item, and pass things on to someone who will use them. The adult child far away follows along in a digital map of the home.

TGIC 2026 (Tokyo Global Innovation Challenge) entry. The app ships with an example family (Michiko Tanaka in Niigata, her son Kenji, students Yui and Arif). All people are illustrative.

## What's in it

| Role | What they can do |
| --- | --- |
| **Family** | Home summary · **digital 実家** as a rotatable **3D** house, a floor plan, or **memory mode** (the house at dusk, every item that lived there glowing with its story, plus an automatic memory tour) · item stories with recordings · **suggest** what happens to an item (the senior decides) · **plan and payment** with resale credit · visit reports and thank-yous |
| **Students** | Visit checklist · **recording consent** · log an item with a photo and an **AI value estimate** · record the story (real audio) · create a **story tag QR** · log handovers to repair shops or licensed recyclers |
| **New owner** | **Scan the QR** (phone camera) or type the code · hear the story · see the item's journey · send a thank-you |

Japanese / English switch on every screen.

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

## AI value estimates (optional)

Without a key, estimates come from simple offline rules. To use Claude's vision model:

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

## Privacy defaults

- Story recordings need the senior's consent; the server refuses uploads without it.
- A scanned story tag shows only the senior's first name and town, never a surname or address.
- Students earn nothing from resale, so they have no reason to pressure anyone to let go of items.
