# Stage 1 finish review

Date: 15 October 2026. Reviewed against `apps/mobile/PRODUCT.md`, the pinned shared-system direction contract and Impeccable craft/iOS/Android guidance. Scope: shared foundations, component reference, older-adult pilot and compatibility changes.

## 1. Disposition

**Ship the scoped Stage 1 frontend prototype.** No unresolved material introduced defect was found after the helper-picker correction. No visual rebuild or replacement of the reviewed web captures is needed. This is not native release certification. The builder must complete the planned DESIGN.md and progress documentation before final handoff.

## 2. Material findings

- **Resolved compatibility defect — `apps/mobile/app/worker/index.tsx:53`.** Enlarged shared caption typography let the helper-provider description exceed the phone viewport. The added `maxWidth: '100%'` constrains the picker and permits wrapping without changing selection behavior. `worker-verification.json` records 16 clean measurements across English/Japanese, Normal/Extra Large and 320/390/768/1440 widths.
- No other material Stage 1 finding remains. Existing small inline controls on house/story screens remain outside this foundation/pilot migration and are documented as later work.

## 3. Fidelity to the pinned brief

The implementation uses the requested ivory #F8F7F2, deep green #235A46, sage #E3EFE7, charcoal #202923 and white surfaces. Generous spacing, rounded cards, labelled actions and restrained shadows create the intended welcoming home companion. Base title/section/body/supporting/button/tab sizes align with the requested ranges. Normal/Large/Extra Large adjustments preserve the content hierarchy. Seven reusable card patterns and the requested buttons, switch/input, confirmation, banner, toast and empty state are present and findable in the component reference. The pilot retains visits, visitor identity, door guidance, help choices and service feedback; no AI or device capability is claimed.

All eight requested screenshots were inspected once: `reference-en-390-normal.png`, `reference-en-1440-normal.png`, `reference-ja-390-extraLarge.png`, `reference-ja-1440-extraLarge.png`, `her-en-390-extraLarge.png`, `her-en-1440-extraLarge.png`, `her-ja-390-extraLarge.png`, `her-ja-1440-extraLarge.png`. Each shows the correct rendered surface, readable copy and clean wrapping. At Extra Large the pilot intentionally favors one scroll sequence over cramped desktop columns.

## 4. Accessibility and compatibility assessment

`AppText.tsx:17` and the shared input leave native font scaling enabled. Preference state is provided at the root across roles; shared controls adopt text size and contrast. Buttons expose names, disabled/busy/selected states and generous minimum targets. Switches have named state and description; input labels, hints and error feedback are available. Heading roles, visible labels, safe-area handling, keyboard accommodation and reduced-motion composition are present in source.

`ConfirmationDialog.tsx:27` implements web initial focus, keyboard containment, Escape dismissal and focus restoration; browser evidence confirms containment and restoration to Reading settings. Cancel preserves an example note, confirmation clears it. Native Modal close handling and accessibility modality are implemented, but native focus behavior remains untested. The existing two-tap help payload is preserved; the disposable fixture confirms failed submission feedback and successful retry. Legacy APIs, routing and domain types were not replaced.

Preferences persist on web; `preferences.tsx:10` deliberately keeps native preferences session-only. Inline typography on unmigrated screens does not yet follow application reading-size preferences. Those limits are accurately declared in PRODUCT.md. Dark appearance and full native platform adaptation remain future work.

## 5. Evidence and scope limits

The reviewed `verification.json` records 28 reference/pilot matrix cases with no measured horizontal overflow or exposed controls below the script's 44px threshold, three successful interaction checks, 12 route smoke observations and zero runtime exceptions. Legacy route smokes are English/Normal; they are not a full language/reading-mode matrix. The worker follow-up separately covers both languages and Normal/Extra Large. Source tokens establish a 48-unit minimum for new controls, but the browser scanner's 44px threshold is not Android target certification. Workspace typechecks, Expo web export and 30 contrast pairs passed as reported by the builder; the reviewer did not rerun those checks.

Captures are real headless Chrome Expo Web renders against disposable illustrative data. They do not prove iOS/Android rendering, OS large-text behavior, safe-area/IME behavior, VoiceOver/TalkBack, native dialog focus, gestures or native font-loading compatibility. No native simulator/device captures were available. Native build and device accessibility QA remain required before native release. Browser zoom, short-height layouts, rating submission and assistive-technology runtime behavior were not established by this evidence. The detector's web result is not a native verdict. No generated raster assets or image compositions ship in this code-led system. The original household and user-owned Stage 0 lockfile changes were preserved.
