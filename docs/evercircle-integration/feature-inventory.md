# Existing feature inventory and preservation checklist

Stage 0, 15 October 2026. Scope: every source screen under `apps/mobile/app/`, its three navigation layouts, and the server-rendered surfaces used by those screens. Preserve means retain behavior, data, consent meaning, and route compatibility; it does not mean freeze visual styling. Runtime completion has not been verified; compiler/export results are in [progress.md](progress.md).

## Route-by-route inventory

There are **13 application screen files and 3 layout files**. `/family/index` and `/student/index` resolve to `/family` and `/student`; they are not extra destinations.

| Route / source relative to `apps/mobile/app/` | Verified features and entry points | State / API / reuse | Preservation and improvement |
| --- | --- | --- | --- |
| `/` — `index.tsx` | Five demo role cards, home/beyond grouping, language toggle, example-data notice | `I18nProvider`; `TopBar`, `NightBand`, `Columns`; navigates to all role roots | Keep all role entries. Make demo identity clear, translate fixed headline, increase hints. This is not sign-in. |
| `/her` — `her/index.tsx` | Greeting/date; calm weather note; next student visit; booked helpers and door rule; four help categories; timing selection; waiting requests; completed-job ratings | `HomeBundle`, local kind/busy; `askHelp`, `helpStatus`, refresh; `WeatherNote`, worker names, cards/columns | Keep the two-tap help request and 110/60/80 minimum-height controls, safety rule and upcoming visits. Improve failure feedback and empty states; add EverCircle entry points later without burying help. No item-choice controls exist directly here. |
| `/family` — `family/index.tsx` | Live outing/weather banners; year-of-visits thread; newest written story; folded student, activities, and service cards | Shared home; `VisitThread`, `StudentsCard`, `ActivitiesCard`, `ServicesCard`; links to item/house and `house?view=map` | Preserve visit continuity, wishes rather than votes, visible warnings and student checks. Keep frequent tasks visible instead of relying entirely on folds. |
| `/family/house` — `family/house.tsx` | Four views: 3D, floor plan, memory tour, neighbourhood map. 3D colors by choices/stories/fixes; evening installed/planned lights. Right panel: items, safer home, future, room photos. Memory audio/photos/journey and location list/directions | Local view, selection, tour, lighting, section and focus state; `Home3D`, `FloorPlan`, `PhotoCarousel`, `StoryPlayer`, `TrackMap`, `NearbyList`, safety/future cards | Preserve all modes and coordinate meanings. `?view=map` is supported; other view strings do not initialize those modes. Enlarge segments, retain textual alternatives to visual pins, give motion controls. Smart Home Simulation should reuse room data separately from actual fixes. |
| `/family/plan` — `family/plan.tsx` | Plan selection, price summary, demo/Stripe-test checkout, payment history; resale proceeds allocation | Local chosen plan/busy/error; `checkout`, `proceeds`, `WebBrowser`; shared plans and payments | Preserve test-only money behavior and senior ownership of proceeds. Improve the selected-plan confirmation, fixed English descriptions, smaller choice chips, and return-from-browser feedback. |
| `/family/reports` — `family/reports.tsx` | Printed-letter links/status, planned/logged calls, visit reports with checked/read-by badges, thank-you messages | `LetterCard`, `CallsCard`, shared visit/item data; printable server URL | Preserve review provenance, letters and calls. Improve grouped dates, readable badges, scan order and long-history behavior. |
| `/student` — `student/index.tsx` | Before: weather check-in, consent, field notes. With her: items, add-item link, folded room capture/safety/help/future/activities/outing. After: checked report, letter, calls | Local before/with/after step; `consent`, refresh; `Handover`, `Touchpoints`, `Community`, `Services`, `Outing`, `Weather` components; item links include `?as=student` | Preserve workflow and every folded feature, human-read checks and foreground location lifecycle. Step switches currently unmount content; redesign needs explicit draft retention and recording/outing status. |
| `/student/add` — `student/add.tsx` | Camera/gallery, item name and room, optional photo/name estimate, save and open student item detail | Local photo/name/room/estimate/busy/error; `ImagePicker`, `addItem`, `estimate`, `replaceItem` | Preserve optional estimation and open/not-now default. Improve labels/errors, room selector, scaling in side-by-side buttons and permission-denied recovery. |
| `/student/wallet` — `student/wallet.tsx` | Student selector, monthly/pending/paid totals, demonstration payday, savings goal and percentage tracker, pay history, folded neutral NISA information/link | Separate `Wallet` state; `wallet`, `setGoal`, `payout`; `Field`, `Fold`, `Pill` | Preserve work-pay distinction from resale, example rates and tracker-only savings. Initial wallet load lacks a catch/error state; switching students can temporarily show the prior wallet. Needs failure/race treatment during its later redesign. |
| `/student/team` — `student/team.tsx` | Pair/trainee cards, badges, seven readiness checkboxes and dates | `studentStep`, refresh; shared `READINESS` and `isReady`, `StudentBadges` | Preserve sign-off prerequisites and withdrawal semantics. Enlarge rows, clearly identify coordinator operation; currently reachable without authenticated coordinator role. |
| `/worker` — `worker/index.tsx` | Demo helper picker, clearance checks, six rules, skill-matched job board, accept action, own booked/done jobs and earned total; area-only listings | Local worker/board/busy/error; `jobs`, `acceptJob`; shared `isCleared`, commission rules | Keep `/worker` even if human-facing copy says Helper. Preserve fixed price, clearance/skills, 85/15 split, area-only projection and feedback. Clarify loading vs no jobs and demo identity. |
| `/stories` — `stories/index.tsx` | Public stories and example labels; interactive town globe/list; modal story/journey; approved comments, heart/undo, compose, share; web `#itemId` scroll links | Own story/error/selection state plus inherited `Screen` home dependency; `stories`, `storyHeart`, `storyComment`; `StoryGlobe`, `PhotoCarousel`, `StoryPlayer` | Preserve moderation, approximate location, media consent and invented-story labels. Add visible action labels, accessible modal navigation, loading/retry, and independent public loading. Native sharing currently sends title/story text, not a web deep link. |
| `/item/:id` — `item/[id].tsx` | Photos/pixel icon, story/audio, decision/hold status, journey/tracking, sharing status, value on request. Student mode: choices, media/story editing, recording, handover/delivery, public sharing and moderation. Family mode: wishes, shared status | `id`, `?as=student`; local drafts/busy/error; item mutation `run()` plus `replaceItem`; `Audio`, `PhotoCarousel`, `StoryShare`, `Journey`, `TrackMap` | Preserve legacy URL and actor presentation, not as security. Keep not-now first, hold rule, media types and value hidden until requested. Add task grouping and safe pending/error states; no automatic import to AI memory. |

## Navigation layouts

| Source | Behavior to preserve |
| --- | --- |
| `app/_layout.tsx` | Five font weights; I18n → Data providers; root Stack; custom top bars; StatusBar; web scrollbar CSS |
| `app/family/_layout.tsx` | Four labelled tabs: home, house, plan, reports; night background and active/inactive tint |
| `app/student/_layout.tsx` | Four labelled tabs: visit, add, wallet, team; same styling. Add is a destination with a form; do not accidentally turn it into an immediate camera action. |

The older-adult and helper screens have no nested layout or persistent section navigation. Switching role replaces the root route. All role navigation is a demonstration and grants no server identity.

## Server-rendered pages and non-screen endpoints

| Surface | Source | Verified responsibility / limits |
| --- | --- | --- |
| `/map/:homeId?lang=...` | `src/mapPage.ts`, handler `index.ts:535` | Neighbourhood pins/dots, directions and outing marker; remote MapLibre/tiles; web iframe/native WebView; polling of `/api/home/:id/outings/live`. Own styling and accessibility. |
| `/track/:itemId?lang=...` | `src/trackPage.ts`, handler `index.ts:222` | Item journey stops, new owner's area and time-derived delivery marker. A non-demo delivery is interpolated from time; it is not verified device GPS. |
| `/letters/:id` | `src/index.ts:889` | Large-type A4 HTML and print CSS; Japanese template with data fallback. No locale query behavior is implemented. |
| `/payment/success`, `/payment/cancel` | `src/index.ts:264`, `:279` | Test checkout return pages; success checks provider session and avoids duplicate session payments; English HTML. |
| `/files/*` | `src/index.ts:23`, `db.ts` | Static media delivery; no access check or expiring/revocable URL. |
| `/api/health` | `src/index.ts:60` | Reports API up and current AI/payment modes. No runtime call made in this audit. |
| `/api/reset` | `src/index.ts:953` | Mutates demo household/items. Not used during Stage 0. |

No Expo route was found for a public item tag page; the unused `api.tag` method has no matching API handler. Do not count it as a working feature.

## Component reuse map

| Existing component/module | Recommended treatment |
| --- | --- |
| `ui.tsx`: Screen/Columns/NightBand/TopBar | Retain exports for legacy routes; improve accessibility centrally. Add an independent app-shell seam so new modules can render their own loading/error states. Test wide-panel behavior before broad adoption. |
| Button/Field/ReadConfirm/Fold/Pill/DecisionChip | Preserve call sites and domain semantics. Strengthen size, wrapping, label associations, focus, selected/busy states and fold identity. DecisionChip/Pill are display elements, not undersized buttons. |
| `Audio.tsx` | Reuse saved-story playback with larger play/pause controls. Keep story recording consent distinct from future companion microphone/transcription consent; this recorder is not a chat/speech service. |
| `PhotoCarousel.tsx` | Reuse typed photo/old-photo/illustration labels; add explicit previous/next and position announcements; no generated image should become approved historical memory. |
| `PixelIcon.tsx`, `pixelArt.ts`, `landMask.ts` | Preserve item identity art and globe geography. Decorative glyphs should not replace meaningful names. No new image-generation workflow is needed for Stage 1. |
| `Home3D.tsx`, `FloorPlan.tsx` | Reuse shared room coordinates and visual renderer as optional views. Retain text/list alternatives. Simulation overlays must not mutate actual safety completion. |
| `NeighbourhoodMap.tsx`, `TrackMap.tsx`, `Journey.tsx` | Preserve map bridges, journey and area semantics. Add labelled controls/failure alternatives later; do not expose precise locations to matching. |
| `VisitThread.tsx` | Preserve signature visit-continuity view; supplement tiny SVG month labels with readable textual history. |
| `Community.tsx` | Reuse activities and student summaries. Activities are seeded interest-based suggestions; this is not agent matching. |
| `Services.tsx`, `SaferHome.tsx`, `HouseFuture.tsx` | Reuse explicit request/approval and provenance patterns; keep side effects in existing APIs. Do not let companion agents submit actions automatically. |
| `Handover.tsx`, `Touchpoints.tsx`, `StoryShare.tsx` | Retain report checking, human review, letters/calls and moderation. Show these as human workflows, not evidence of verified autonomous agents. |
| `Weather.tsx`, `Outing.tsx` | Preserve source/demo distinctions and scoped foreground location. Read-only summaries can inform assistance; a weather/network error must not imply safe conditions. |
| `api.ts`, `data.tsx`, `i18n.tsx`, shared contracts | Extend through an isolated adapter, selector bridge and typed bilingual keys; avoid wholesale replacement or mutation of `HomeBundle`. |

## Preservation acceptance checklist for later implementation

These are **future regression gates**, not claims of tests run in Stage 0.

- [ ] All 13 existing routes and family/student tabs remain reachable; old item URLs and `as=student`, `view=map`, story hashes still work.
- [ ] Older-adult next visit, who-is-coming, door rule, waiting requests, two-tap help and three rating choices remain available at large font sizes.
- [ ] Items start with not-now; her choices, family wishes, hold dates and custody journeys retain their meanings.
- [ ] Stories, recordings and photographs survive visual changes; all photo kinds are labelled; value remains optional.
- [ ] Public media stays explicitly opted in; withdrawal/moderation, contact-pattern rejection and example labels remain. Real-data release requires stronger media/access enforcement.
- [ ] 3D/day/evening/color-by, 2D, memory tour, room photos, map, directions and item tracking all remain available with textual fallbacks.
- [ ] Safety estimates, agreed fixes/builders, house wishes/notes/conditions/steps remain; price/subsidy numbers stay labelled examples.
- [ ] Before/with/after visit flow, consent, field notes, report check/read/send, letters and calls remain; pending drafts and foreground recording/location are protected during navigation.
- [ ] Readiness sign-off rules, helper clearance/skills, price agreement, area-only listings, accept/done/cancel/feedback and commission remain.
- [ ] Weather live/demo/unavailable labels and check-in outcomes remain; outing opt-in, stop, four-hour semantics and route deletion are retained and accurately described.
- [ ] Demo/Stripe-test checkout and student wallet/pay entries/goals remain; no redesign creates real transfers or investment behavior.
- [ ] English/Japanese toggle, translation fallback and content edits work; Japanese text and long labels fit across phone/tablet/web.
- [ ] Turning EverCircle off restores the original workflow without deleting or reseeding any legacy records.

Feature presence is verified from source. Camera, microphone, live GPS, maps, payment provider, AI provider, screen readers, and end-to-end completion remain unexecuted checks.
