# Stage 6 — simulated smart home and daily assistance

16 October 2026. Frontend extension after Stage 5. The user confirmed preserving the calm large-text My Home/My Day approach. No later stage is in scope.

## Architecture and behavior

`src/evercircle/smartHome/model.ts` owns an anchored, deterministic EN/JA command grammar, the eight-device allowlist across Living Room, Bedroom and Kitchen, and two routine definitions. Lights and fans accept on/off, curtains accept open/close, and the single living-room television accepts on/off. Missing room names with several matching devices return choices; nonexistent devices, negations, conditions, compound actions and unknown phrasing do not apply changes. This is intentionally limited language support.

`SmartHomeDashboard`, `RoomCard`, `DeviceControl`, `CommandInput`, `RoutineCard` and `DeviceActivityLog` reuse shared accessible components and reading preferences. Every device shows room, device, simulated state and a named action. Routines show every target, desired state and whether it will change; applying requires a separate button. The latest 20 actions contain device state changes and timestamps only. Already-set actions do not produce false change logs.

`homeDemo/{model,store,storage,storage.web}` owns household-scoped local demonstration state. Web uses a separate localStorage key; native source uses the already-installed Expo FileSystem dependency. It never calls household mutation APIs. Reading validates the schema and household and allowlists device IDs; corrupt reads offer Retry or a non-overwriting temporary session. Writes are serialized; failed writes show visible feedback and pause further changes until Retry succeeds. In-memory state remains visible. Native persistence has source/typecheck evidence, not device evidence. Simultaneous-tab synchronization and encrypted storage are not provided.

`assistance/model.ts` validates dated reminders and scheduled personal activities, with completion/undo and a 100-item local limit. `DailyAssistance` supplies large dated cards, status labels, a friendly hobby suggestion, an editable activity form, completed tasks and trusted-person shortcuts. The family shortcut displays the existing recorded family name; no phone number is invented. Student/helper shortcuts use existing routes and contact nobody automatically. Existing weather warnings/advice, outing/map context, and all planned/past visits, accepted activities, calls and helper bookings remain in My Day. The upcoming visit card projects existing `HomeBundle` records and never persists another visit list. Dates retain the existing household Asia/Tokyo convention.

`assistance/companion.ts` delegates device requests to the shared interpreter/store, summarizes today's recorded plans and pending personal items, and links My Day. A command with several matching devices opens Smart Home with the unresolved choices still available. The chat component contains no device parsing or device state mutation. Stage 4 profile/consent/chat storage stays separate; chat and recognition transcripts are session-only.

## Voice compatibility and consent

`voice.web.ts` detects unprefixed/prefixed browser recognition and speech synthesis. The consent dialog explains that a browser speech provider may receive microphone audio and asks for one command each time; cancel never starts recognition. Recognition fills text for review, and never applies a device change automatically. Stop, route blur, language change, errors and a 20-second limit end listening. KAKEHASHI never stores or uploads audio itself. Optional spoken feedback uses a local browser voice only, starts on explicit Read feedback aloud, and can be stopped. Missing voices/errors leave readable text.

`voice.ts` is the native fallback with no browser references and no new native dependency. Both platforms retain fully functional text controls. Physical microphones, actual browser-provider recognition quality and native voice are not certified by the stub tests.

Compatibility research: [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) documents limited support and possible server processing; [MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) distinguishes recognition and synthesis. [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/) was checked alongside the installed Expo 57/React Native 0.86 dependencies; audio recording support is not treated as native speech recognition support.

## Preserved boundaries

No hardware SDK, IoT endpoint, real notification, external message, backend, shared schema, package manifest or lockfile change. Home3D, FloorPlan, digital-house lighting and real safety-fix statuses remain untouched. Optional visualization coupling was deliberately omitted to keep simulation separate from recorded safety and preserve the existing 3D view.

## Verification

`verify-home-demo.cjs`: 11 pure groups covering device targeting/toggles, ambiguous and rejected commands, routines/idempotence, reminder validation/scheduling/completion, scoping/hydration/allowlists, visit projection and retention bounds. Existing pure suites: 12 companion/profile groups and 14 social groups. Mobile and server typechecks pass. Shared contrast checks pass all 30 combinations after an approved retry outside the sandbox; the initial tsx process failed before executing checks with `uv_os_get_passwd ENOMEM`.

Initial same-origin web export passed (1,062 modules, approximately 3.3 MB JS). The initial browser script stopped after five successful groups because it looked for “Send” instead of the existing “Send message” label; this was a test selector error. After correcting the selector, the initial full run passed 64 layouts, nine scenarios, no measured overflow/undersized controls and no uncaught exceptions. It recorded zero household mutations.

The first visual batch opened all 18 initial captures. It found excessive introductory space before smart controls. One correction batch shortened the simulation explanation and removed the redundant room heading, retained reminder-completion feedback above the list when the completed card moves, and placed activity suggestion before its form. Companion fallbacks preserve the existing unknown-visit and reminder guidance.

The corrected export passes with `entry-906908efc9dedc10872048a39b7c2626.js`, 1,062 modules and approximately 3.3 MB JS. Mobile typecheck passes again. A newly extended spoken-feedback stub initially supplied a plain object where the browser's real utterance expected a native SpeechSynthesisVoice; its assertion failed without recording audio. The harness now supplies a matching fake utterance as well as the fake speech provider. The final full command exits 0: **64 layouts, nine scenario groups, no measured overflow/undersized controls, no uncaught exceptions, and zero household mutation requests**. Sixteen detail captures supplement the top-of-screen/scenario captures, for 35 final images, all opened and validated. The regression suites and independent skill verdict are recorded in progress.md/stage6-review.md.

Evidence lives under `apps/mobile/.impeccable/review/stage6-*`. Screenshots are captures of the locally exported app and disposable fixture data; no generated raster assets ship. Native layout, safe areas, IME, OS font scaling, gestures and VoiceOver/TalkBack require device validation. Existing external-provider/media limitations remain.

Existing browser regressions all exit 0 with no uncaught exceptions: Stage 3 (15 groups), Stage 2 (six groups plus empty/legacy route checks), Stage 4 (nine groups) and Stage 5 (seven groups), using `--interactions-only`. The independent finish reviewer returns **ship** for its local Expo Web scope; see [stage6-review.md](stage6-review.md) for its five contract sections and source sampling limits. No post-review app edits were made.
