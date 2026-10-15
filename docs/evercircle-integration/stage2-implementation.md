# Stage 2 — older-adult experience

15 October 2026. This extends the Stage 1 React Native / Expo design system. It does not implement companionship, matching, reminders or smart-device simulation services.

## Routes and navigation

The existing `/her` URL is Home. A nested Expo Router stack provides persistent context: Home, Friends, My Home and Memories. Wide web uses a side rail; compact screens use bottom navigation, wrapping into two rows when the app or system font scale requires room. Settings is always labelled in the top bar. Subpages have Back with a Home fallback; the primary destinations remain available on every older-adult page.

| Route | Purpose |
| --- | --- |
| `/her` | Greeting, Japan household date, labelled future companion entry, next student visit, today's plans, My Day, home/memory/social shortcuts and relevant weather warning |
| `/her/friends` | Existing students and readiness, existing activities; accept/defer proposed activities; explicit future matching/community notice |
| `/her/my-home` | Request Help, Upcoming Helpers, Home Safety, House Information, Digital House, future Smart Home |
| `/her/help` | Original four help categories and two timings; waiting requests; completed-service feedback |
| `/her/helpers` | Booked helper name, date, kind, hours, organization, checked status and door rule |
| `/her/safety` | Existing safety suggestions/statuses and labelled cost estimates, presented for the older adult |
| `/her/house-information` | Existing condition records, house wishes and digital-house entry |
| `/her/digital-house` | Existing 3D, floor plan, memory tour and neighbourhood map; rooms/items, safety, house information and room photos; `?view=map` retained |
| `/her/memories` | Seven explicit entries: belongings, photos, audio, stories, decisions, family wishes and sharing |
| `/her/memories/collection?filter=...` | Derived item collections; family wishes include existing house wish/words and family notes; empty collections link to all belongings |
| `/her/item/:id` | Existing item photos/audio/story/recording, choices, family wish, hold, tracking/journey, thanks, optional worth, public sharing and withdrawal |
| `/her/my-day` | Sorted projection of visits, accepted activities, planned calls and dated booked helpers; live outing summary/map; weather; future reminders |
| `/her/settings` | Cross-role reading settings, language, existing recording-consent API, item sharing entry, demo privacy limitation and role switch |
| `/her/companion`, `/her/smart-home` | Honest coming-soon descriptions, useful existing destinations and return navigation |

Legacy `/item/:id`, `?as=student`, `/family/house`, `?view=map`, and every other old route remain. The older-adult item wrapper selects a presentation component; it does not pretend to authenticate a role. Student-only moderation, handover, delivery and family administration remain in their existing roles.

## Preservation map

| Existing older-adult capability | New reachable location / unchanged contract |
| --- | --- |
| Expected student visit | Home and My Day; computed from `home.visits`, never a second booking store |
| Request local help | My Home → Request Help; `askHelp(home.id, { kind, when, by: 'her' })` |
| Waiting requests | Request Help; requested/open services from the same home bundle |
| Who is coming and door rule | My Home → Upcoming Helpers; same workers and booked services |
| Good / okay / not-good feedback | Request Help; `helpStatus(home.id, service.id, { feedback })` |
| Weather advice / student check-in expectation | Home warning and My Day; same weather endpoint and advice translations, with source/demo/unavailable distinction |
| Relevant outing | My Day live-outing summary and map; same shared four-hour validity predicate; no new tracking or consent bypass |
| Belongings, item states and Not now | Memories → collection → item; all CHOICES retained, open/Not now first and immediately available; other choices reviewed before the existing PATCH |
| Photographs and recorded stories | Same PhotoCarousel, AddPhotoCard, StoryPlayer and StoryRecorder; permission/sharing remain separate |
| Family wishes | Displayed as suggestions, never votes; item and house wishes remain in the same records |
| Home functionality | Reused safety estimates, condition fields, 3D/floor plan/memory/map and room-photo components |

My Day distinguishes dates before the household's current day as unfinished older records. It never silently reschedules a visit. Activity times remain visible. It does not infer reminder delivery or invent phone numbers. Accepted activities and booked helpers update through the shared DataProvider refresh. A proposed activity's explicit acceptance or Not now uses the existing activity endpoint.

## Architecture and file scope

- `app/her/_layout.tsx` owns persistent adaptive navigation and shared feedback. `src/her/HerPage.tsx` owns data/error gating, scrolling, page focus and Back. `src/her/plans.ts` derives a timeline from HomeBundle.
- Thin route files load `src/her/Screens.tsx`, `HelpScreen.tsx` or `ItemDetail.tsx`. Domain state continues to live in `src/data.tsx`; transient selections, errors, busy flags and dialogs use local React state.
- Existing `app/item/[id].tsx` retains its legacy implementation and adds an older-adult presentation wrapper. Optional worth is extracted into `src/ItemWorth.tsx` for reuse, with a recoverable request error.
- Existing `app/family/house.tsx` supports the older-adult shell and keeps legacy URLs/operations. Its segments are enlarged; house administration remains in family/student screens. Reduced motion stops the existing memory tour and Home3D movement.
- Reused `Audio.tsx`, `PhotoCarousel.tsx`, `Journey.tsx`, `StoryShare.tsx`, `SaferHome.tsx` and `NeighbourhoodMap.tsx` adopt scalable text where changed. Playback and map controls are enlarged; photos have labelled previous/next; sharing supports senior copy without student moderation. Photo authorship can be supplied explicitly by the senior wrapper.
- `src/i18n.tsx` adds typed English/Japanese `h*` keys. No styling framework, dependency, API function, DataProvider, shared contract, backend, data file or package manifest is changed in Stage 2.
- `scripts/preview-design-system.cjs` gains isolated verification fixtures; `scripts/verify-stage2.cjs` exercises the new frontend through Chrome DevTools Protocol. Fixtures never import the real database, reset the application, or contact providers.

## Validation scope

See the Stage 2 section of [progress.md](progress.md) for exact executed results and [stage2-review.md](stage2-review.md) for the independent review. Web viewport checks are not iOS/Android evidence. Live camera, microphone capture/upload, GPS, remote map directions/providers, payments and actual server mutations are outside the disposable fixture checks.

The application remains a demonstration without authenticated household authorization. Native preference persistence, dark appearance and a full legacy-screen accessibility migration remain later work. Stage 2 adds no real companion conversation, friendship matching, reminder delivery, or device monitoring.
