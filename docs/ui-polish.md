# Charcoal and crimson UI polish

The user's palette is applied to the working app: graphite #141416, raised charcoal #1D1D20, muted crimson #B94349, soft red #E77875, warm chalk #F1EDE7, and smoke #ABA8AD. Both system color schemes use this requested dark identity. Filled actions use the deeper red for contrast; accent text uses the lighter red.

## Design changes

| Before | After | Why |
| --- | --- | --- |
| Blue/light starter palette with unrelated green timer states | One shared charcoal, crimson and chalk palette | Matches the user's direction across screens, controls, tabs and timer |
| Most controls had similar outlined prominence | Crimson primary actions, neutral default controls, quiet compact row actions | Task content has a clearer hierarchy |
| Title, metadata and actions stacked in every row | Title and metadata share an edit target; actions can sit alongside them when room permits | More compact tablet rows, with wrapping on phones |
| Large generic priority heading | Direct priority label and three quota marks | Makes the three-priority budget visible |
| Focus promotion was mostly text | Configured countdown preview and a clear Start Focus action | Makes Focus recognizable in the workspace |
| Full-width settings and capture forms | Constrained form width, grouped work/break fields, labeled trailing switches | Improves readability and alignment on tablet |
| System theme could leave navigation chrome light | Shared dark navigation theme, explicit tab colors, light status-bar text | Avoids light headers and unreadable tabs when the OS is light |
| Web focus styling relied on defaults | Explicit soft-red keyboard outlines and field focus borders | Makes focus easier to locate |

System fonts stay local; no font, image, icon or animation library was added. No entrance animations were added to frequent task-management actions. Focus remains minimal. Storage schemas, mutation logic, notification scheduling, native configuration and dependencies were not changed in this polish pass.

## Files in this pass

- `src/constants/theme.ts`, `src/components/themed-text.tsx`, `src/global.css`: semantic tokens, typography, and web focus treatment.
- `src/components/planner/controls.tsx`, `workspace.tsx`, `task-row.tsx`: button hierarchy, fields, shell, responsive task rows.
- `src/app/(tabs)/index.tsx`: priority quota and Focus preview composition.
- `src/components/planner/focus-config.tsx`, `task-form.tsx`: form grouping and themed switches, with the same change handlers.
- `src/components/app-tabs.tsx`, `app-tabs.web.tsx`, `src/app/_layout.tsx`: matching native/web tab and navigation chrome.
- `src/app/timer.tsx`, `src/components/planner/dev-fixtures.tsx`: matching countdown and development chrome colors.

## Verification

TypeScript, web production export with offline-shell generation, iOS/Android JavaScript/Hermes exports, and `git diff --check` passed. These exports do not establish rendered behavior or a successful native binary build. No tests were added or run, as instructed.

The lint command was run interactively. It requested installation/configuration of ESLint; this was declined, and lint remains unavailable. No tooling was installed.

Computed contrast ratios: body 15.78:1; secondary text on raised charcoal 7.16:1; accent on selected surface 5.41:1; filled action 4.55:1; pressed action 5.56:1; input boundary 3.26:1; break timer 6.43:1. These cover token pairs, not every composited/native state.

Visual inspection remains unavailable: browser inventory still reports the browser host unavailable, and native Computer Use permission was previously denied. Phone/tablet rendering, 200% zoom, native text scaling, focus traversal and touch interactions have not been verified visually. The existing Taste Skill gate remains **GATE: ERROR** from the prior run (local-port/checker failure); it instructed against rerunning after that environment error. No gate pass, performance pass or waiver is claimed.

Independent source review also found RN Web's separate active-thumb color and small default switch target. The web-only thumb color is now explicit, and CSS enlarges the actual checkbox to at least 48×48 while retaining its 48×24 visual. Native tab material receives a dark appearance override through SDK 58's documented `unstable_nativeProps` host API, because iOS 26+ ignores tab backgroundColor. This API is version-sensitive and should be rechecked on Expo upgrades; physical rendering remains unverified. [SDK 58 native tabs](https://docs.expo.dev/versions/v58.0.0/sdk/router/native-tabs/#unstable_nativeprops).

Native launch splash and app-icon assets retain the existing starter artwork; this pass did not edit native configuration. The earlier inferred keyboard-avoidance finding is still unverified and unchanged.
