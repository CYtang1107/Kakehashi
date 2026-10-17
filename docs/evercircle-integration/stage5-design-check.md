# Stage 5 design compatibility check

Checked 16 October 2026. Conclusion: the local Expo Web friendship demonstration is compatible with KAKEHASHI's incumbent **A Welcoming Home** design. This is an ordinary code-led Operate extension, with no new visual identity, token family or component system. The finish reviewer records `disposition: ship` for this web-demo scope in [stage5-review.md](stage5-review.md).

## Authority and evidence

Compared the final social screens and Friends route wrappers against `apps/mobile/PRODUCT.md`, `apps/mobile/DESIGN.md`, `apps/mobile/.impeccable/design.json` and `apps/mobile/.impeccable/surfaces/friendship.md`, using the Impeccable `reference/document.md` guidance. Read [stage5-implementation.md](stage5-implementation.md) and the final finish review. Canonical product/design documents and the sidecar remain unchanged; this scoped comparison records the extension and historical documentation drift without replacing their Stage 1 authority.

Source inspection covered `src/evercircle/social/` screen composition, shared page/confirmation wrapper, matching rules and storage adapters; `app/her/friends.tsx` and its four subroute wrappers; the shared theme, reading preferences and `HerPage`; and the retained `LegacyFriendsContent` integration. All five Friends destinations retain `FeatureBoundary` and use the established older-adult shell.

Evidence checked directly:

- `apps/mobile/.impeccable/review/stage5-verification.json`: 80 layout records, seven interaction groups marked passed, empty failures and exceptions. The layout matrix covers five routes, EN/JA, widths 320/390/768/1440 and Normal/Extra Large, with high contrast in enlarged cases.
- Presence of all 27 `stage5-*.png` screenshots. Visually opened `stage5-friends-en-390.png`, `stage5-permissions-ja-390.png`, `stage5-recommendation-en-390.png` and `stage5-history-ja-1440.png` for this comparison. These show the identity/permission hierarchy, enlarged Japanese labels, explanation before compatibility score, and the latest message above the composer.
- The independent finish review documents visual inspection of all 27 captures, including all five surfaces, discovery/message states and four latest-history captures. That broader inspection is reviewer evidence, not a claim that this documenter independently opened every image.

Builder-executed evidence in the implementation record includes mobile/server typechecks, 14 social domain groups, 12 companion domain groups, hosted export, 30 contrast combinations, and existing browser regressions of nine Stage 4, 15 Stage 3 and six Stage 2 groups. The detector reported no findings. These checks were not rerun for this documentation pass. The final Stage 5 JSON is complete, but its process handle expired before the final exit status was collected; the earlier complete browser run exited successfully.

## Compatible design decisions

| Area | Final implementation and comparison |
| --- | --- |
| Color and material | Shared ivory surroundings, white cards, sage support/selection and deep-green actions retain the canonical palette. Custom message surfaces read the active preference palette. No new hardcoded color or font is introduced in the social screens. |
| Typography | Titles, headings, explanations, scores, sender names and messages use shared `AppText` variants. `Field` supplies the scalable composer typography. Zen Kaku Gothic New remains the UI face; English/Japanese labels wrap. The compatibility number uses caption emphasis after the common-interest explanation. |
| Controls | `Button`, `AccessibleSwitch`, `Fold`, `Field`, `StatusBanner`, `EmptyState` and `ConfirmationDialog` retain labelled actions, visible states and the existing accessibility semantics. Destructive block confirmation uses the shared danger treatment. |
| Cards and depth | Recommendations, demo identities and communities use shared `Card`. Standard quiet white-card elevation and high-contrast borders remain inherited. No decorative material or new illustration is required. |
| Layout and navigation | `SocialPage` delegates to `HerPage`/`ScreenFrame` with a readable single content column and natural vertical scrolling. Compact bottom navigation and wide side navigation are inherited. Permissions, demo switching, communities and conversations use labelled routes and Back, preserving the four global destinations. |
| Reading preferences | The global Normal/Large/Extra Large, high-contrast and reduced-motion preferences continue across roles. Latest-message scrolling reads reduced motion. Existing preference persistence remains web localStorage with session fallback; native reading-preference persistence is still unimplemented. |
| Autonomy and content order | Explicit profile approval precedes independent sharing; bilateral permission precedes scoring; shared interests precede the score; confirmed invitation precedes recipient acceptance and messaging. The signature interaction implements the surface contract without dating gestures or popularity language. |
| Existing household tasks | `LegacyFriendsContent` remains under Friends for Tanaka, preserving students and existing activity acceptance/Not now actions. Selecting a fictional social identity does not replace the household identity. |

## Deliberate local differences

The conversation introduces task-specific message bubbles and a persistent composer rather than another global primitive. Bubbles use a 16-unit radius, 20-unit padding, a one-unit palette border and 95% width; sender labels accompany sage/white surfaces and left/right alignment. These are local composition choices within the established color and shape vocabulary. The composer keeps the existing labelled field and Send button, with its field height scaled between 80 and 140 units. The history captures support latest-message visibility in the measured web cases.

Discovery uses a generic shared card composition with an expandable score explanation. The existing presentation-only `FriendRecommendationCard` does not have to become a second matching API. Six fictional communities and nine total demo identities use ordinary shared cards and explicit actions. Approval, field grants, matching eligibility, invitation state and local storage errors are written in user-facing terms; reports and scripted replies identify the demonstration boundary.

The deterministic weighted model is a local capability extension: hobbies/languages/time/communication/activities/location use 40/20/15/10/10/5 weights, with unshared optional values contributing zero. The source gates eligibility before summary construction/scoring and projects an allowlist. This supports the product's autonomy commitment without asserting real AI or remote introduction/delivery. No new backend, dependency or AI service is part of the documented implementation.

## Historical documentation drift

`PRODUCT.md` describes Stage 1 frontend foundations and says there is no matching. Stage 5 now implements explicitly local deterministic matching, invitations and messages. That sentence is historical scope, and the implementation record supplies the current feature boundary; it is not a reason to invent a replacement product identity.

`DESIGN.md` also explicitly captures Stage 1. Its Stage 1 pilot/navigation discussion and the sidecar's representative family-tab preview do not inventory the later older-adult persistent shell or these social routes. The actual social implementation inherits the later shell and existing shared primitives. The sidecar's source list and migration limitations likewise remain a historical snapshot, not an exhaustive current route list. No conflicting token family was found in the inspected extension.

Social state now has its own web localStorage and native FileSystem adapters. This does not resolve the separate documented limitation on native reading-preference persistence. The canonical caveats about dark appearance, native accessibility verification and legacy areas must not be interpreted as completed work merely because this feature adds persistence for its own data.

## Verification limits and disposition

The evidence supports shipping the local Expo Web demonstration and preserving the current design authority. Screenshots are browser review artifacts captured by the Stage 5 verification workflow, not newly generated shipping artwork; this extension adds no raster asset requiring a new visual provenance record.

Web captures, DOM measurements and source semantics do not certify native device storage, safe areas, OS font scaling, keyboard/IME behavior, gestures, VoiceOver or TalkBack. No assistive-technology runtime certification is made. The browser fixture also does not validate live server handlers, remote messaging, authentication or external providers. These boundaries match the implementation and finish-review records. No design-system rewrite or app fix is required by this comparison within the reviewed scope.
