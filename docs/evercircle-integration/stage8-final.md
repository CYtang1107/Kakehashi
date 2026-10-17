# Stage 8: final integration, testing and demo (16 October 2026)

Stage 8 checks that KAKEHASHI and the EverCircle features work together as one demonstrable prototype. It added no product features. This report separates what passed, what failed and what was not tested. **The prototype is not production-ready**; see "Production gaps".

## What changed in Stage 8

| Change | Why |
| --- | --- |
| Brought two commits from `main` onto `demo`: the team's own sunglasses photo, and AI-made pictures (labelled as illustrations) with see-through pixel icons for the sewing machine, TV, camera, desk and kimono; plus the floor-plan pin fix | Demo quality: real pictures in the item album and 3D house. Both commits touch only server files, demo assets and `FloorPlan.tsx`, which `demo` had not changed |
| Floor-plan pins use a plain click on web (`onPress: null` + `onClick`) | react-native-svg passed responder props to the DOM `<g>` (console errors) and overwrote `onClick` |
| Removed the unused `FutureScreen` and its "AI conversation is not available yet" copy (EN/JA) | Dead code with copy that contradicted the working companion |
| `verify-stage5.cjs` waits for each interest save before the next Remember | The second Remember is disabled while the first save runs; tapping after a fixed 80 ms made the test fail at random (1 of 4 runs). App behaviour unchanged |
| New `verify-stage8.cjs` | Demo boundaries no earlier suite checked (below) |
| New `verify-all.cjs` | One command runs every suite and writes `.impeccable/review/verify-all.json` |
| `render.yaml` sets `EXPO_PUBLIC_EVERCIRCLE_DEVELOPER=1` | Web exports omit `/developer/agents` without it, and the demo needs that screen |
| README: EverCircle section, corrected AI promise, checks, honest limits | Documentation |

Not merged from `main`: six layout and README commits for screens this branch has redesigned (role picker, her screen, phone layouts, her-circle card). They conflict in seven files and would undo the new design; the her-circle idea is covered by EverCircle.

## Results

All commands below were run on 16 October 2026 on the final Stage 8 code (`demo` branch plus this stage's changes), Windows, Node 25, Chrome 155 headless. Browser suites ran against a web export (`EXPO_PUBLIC_API_URL=same-origin EXPO_PUBLIC_EVERCIRCLE_DEVELOPER=1`) served by the disposable fixture host, so they test the real compiled app against in-memory fixture data, not the Express handlers.

| Check | Result |
| --- | --- |
| Mobile typecheck (`tsc --noEmit`) | **Pass**, exit 0 |
| Server typecheck | **Pass**, exit 0 |
| WCAG AA contrast (`npm run contrast`) | **Pass**, every pair (run before this stage's copy-only changes; the theme did not change) |
| Domain: EverCircle profile and memory | **Pass**, 12 checks |
| Domain: social matching, invitations, messages, blocking | **Pass**, 14 groups |
| Domain: smart home, commands, routines, reminders | **Pass**, 11 groups |
| Domain: orchestrator routing, events, privacy denial, replay | **Pass**, 13 groups |
| Browser Stage 2: older-adult screens, items, Not now, stories and media | **Pass**, 6 groups, 0 exceptions |
| Browser Stage 3: family, students, helpers, stories, letters, reports | **Pass**, 15 groups, 0 exceptions |
| Browser Stage 4: companion and profile | **Pass**, 9 groups, 0 exceptions |
| Browser Stage 5: friendship end to end | **Pass**, 7 groups, 0 exceptions (one earlier run failed on test timing; fixed in the test, see above) |
| Browser Stage 6: smart home and daily assistance | **Pass**, 9 groups, 0 exceptions |
| Browser Stage 7: orchestrator and agent graph, incl. 32 layouts (EN/JA × 320/390/768/1440 × Normal/Extra Large) | **Pass**, 9 groups, no overflow, no control under 44 px, 0 exceptions (one run failed because the previous suite left matching switched on in the shared browser profile; `verify-all.cjs` now clears storage before each suite) |
| Browser Stage 8: private conversation boundary, simulation labels | **Pass**, 3 groups, 0 exceptions |
| `verify-all.cjs` (all of the above) | **Pass**, 11 of 11 suites |

The layout matrices of Stages 2–6 (run without `--interactions-only`) were not re-run in Stage 8; their last results are in the Stage 2–6 reports. Stage 7's 32-case matrix was re-run.

## Privacy and safety: what was verified

| Rule | Evidence |
| --- | --- |
| Interests are stored only after Remember | Domain suite (evercircle) + Stage 5 browser run |
| Sharing for matching is a separate approval from saving | Orchestrator suite ("saving and sharing require distinct explicit steps") + Stage 7 |
| Matching uses only approved, shared information; opt-out stops recommendations | Social suite + Stage 5 |
| Invitations, acceptance, declining and blocking need confirmation; blocking closes the conversation for both | Orchestrator suite (rejected without confirmation at orchestrator and reducer) + Stage 5 |
| A denied workflow compares nothing and changes nothing; replay never repeats an action | Orchestrator suite + Stage 7 |
| Agent events never keep raw chat, memories, names or profile snapshots | Orchestrator suite |
| Private companion conversation never reaches family or student screens, is never sent to the server and is not stored | **Stage 8**: a unique marker typed to the companion is absent from `/family`, `/family/house`, `/family/reports`, `/family/plan`, `/student`, `/student/team`, from every request the fixture host received, and from local storage |
| Family and student code cannot read EverCircle data | Code check: no family, student or helper screen imports an EverCircle store (the family house page reuses two layout components only) |
| Fictional and simulated features say so | **Stage 8**: friendship demo, persona switch and smart home labels |
| Simulated devices never touch hardware | No device transport exists in the code; the Smart Home screen states it |

## Demo script (about 8 minutes)

Run on the laptop copy. Before each run: `npm run reset` (household data) and, in the agent screen, **Reset demo** (EverCircle data).

**A. Original KAKEHASHI.** Role picker → Michiko → My Day: the next student visit. Memories → an item (the sunglasses or the sewing machine) → play its story → choose **Not now**. My Home → House information. Help → a help request.

**B. EverCircle.** Talk to Companion → "I enjoy growing orchids." → **Remember** both suggested interests. Friends → Friendship sharing choices → allow matching and share gardening and orchids → back to Friends: Aiko Mori, with shared hobbies and the score explanation → Invite → confirm. Friends → Switch demo person → Aiko → Accept → Open messages. Then `/developer/agents` → Matching workflow, step by step.

**C. Smart home.** My Home → Smart Home → Living Room light → Turn on. Type "Turn on the bedroom light." My Day → tick a reminder. Show the device log and the updated reminder.

**D. Privacy.** Friendship sharing choices → turn matching off → Friends shows no recommendations. Open a conversation → Block → the composer closes. Agent screen → Run blocked workflow → Replay events.

**E. Family.** Switch role → Family → the visit thread and reports → Digital 実家 → Safer home. Point out that nothing from her companion conversation appears here.

## Simulation limits

- Everything in EverCircle is fictional and local: people, invitations, messages and devices. Nothing is sent or connected.
- The persona switch and the developer flag are not authentication.
- Browser speech input depends on the browser; native uses text input.
- Reminders are dated records, not alarms or notifications.

## Known issues

- Stage 2's story player has thrown an intermittent `play()`/`pause()` AbortError in one earlier run (recorded in Stage 7); it did not recur here.
- EverCircle storage is per browser, unencrypted and not synchronised between tabs.
- `npm ci` in a fresh worktree on Windows failed in an install script; installs with `--ignore-scripts` then lack esbuild's binary. Use the main checkout's install.

## Not tested

Phones (iOS/Android) end to end, native safe areas and gestures, OS-level text scaling, VoiceOver and TalkBack, physical microphones and speech providers, Safari and Firefox, the Express handlers behind the fixture host (browser suites use disposable in-memory fixtures), and the hosted Render build of this branch.

## Production gaps

Real sign-in and roles; server-side storage with encryption and access control for EverCircle data; consent records and audit logs; moderation and abuse handling for real messaging; real identity checks for helpers and matched people; device integration with safety review; notification delivery; native accessibility certification; security review and penetration testing; data-protection compliance (APPI) and a privacy notice.
