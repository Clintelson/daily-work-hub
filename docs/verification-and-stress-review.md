# Verification and stress review

## Actual verification

- Strict TypeScript check passed after the implementation and review fixes.
- Production static web export and offline app-shell generation passed.
- iOS and Android JavaScript/Hermes exports passed. These are bundle checks, not native binary builds or device tests.
- Expo public configuration and native configuration introspection succeeded. iPad support is enabled, both portrait and landscape are declared, and web output is static.
- `git diff --check` passed.
- The existing lint command was attempted. Expo immediately tried to add missing ESLint tooling; it was interrupted, and its package declarations were removed. No ESLint configuration or dependency was retained. Lint has not passed.
- No automated tests were added or run, as instructed.
- Browser host discovery failed; native Computer Use reported that permissions are not granted. No rendered UI, browser interactions, offline reload, background recovery, notification delivery, hardware orientation, screen-reader navigation, keyboard avoidance, or real-device timing was verified.
- Taste Skill gate: **GATE: ERROR**. Its consistency checker could not find a free port in 5200–5299; its layout checker exited with a listener warning and no report. No visual checks passed, no waivers were added, and the gate was not rerun after its explicit stop instruction. No performance report was available. The app uses the approved native agenda design rather than the skill's marketing-page layouts, motion, imagery, or font downloads.
- Dependency installation reported three moderate vulnerabilities in the dependency tree. No broad dependency upgrades or automatic audit fixes were performed.

## Changed areas

- `src/app/(tabs)/`: Today, Tasks, Focus setup, Review, and platform tab layout.
- `src/app/capture.tsx`, `settings.tsx`, `timer.tsx`, `_layout.tsx`: task editing, settings, separate timer screen, routing/provider setup.
- `src/components/planner/`: shared controls, task form/rows, workspace, Focus configuration, and isolated development fixture switch.
- `src/hooks/use-hub.tsx`, `src/lib/`: durable state, validation, date/timer derivation, native/web storage, notifications, browser fullscreen/audio, fixtures, and offline registration.
- `src/constants/theme.ts`: shared light/dark semantic tokens.
- `app.json`, `package.json`, `package-lock.json`, `scripts/offline.mjs`: approved SDK modules and native/static-web configuration, plus offline build generation.
- Replaced the two starter routes; other starter components/assets are left intact. The user's existing AGENTS.md changes were preserved.

## Independent correctness review

A read-only independent reviewer identified concurrent-tab overwrites, priority validation around midnight, due-only Review membership, stale Focus selection, and stop/completion notification races. Changes apply mutations atomically against persisted web state; detect conflicting same-task edits; enforce the cap for every priority date; track completion/review dates; synchronize task selection with the URL; and invalidate stopped notification sessions. A session-ID guard prevents a stale timer view from clearing a newer stored session. Explicit replanning clears the review marker. These fixes were inspected and compiled; their device/browser behavior still needs manual verification.

## Break UI surface map

All limits refer to `src/lib/model.ts` validation and corresponding form limits. List length has no product cap; task lists render 30 rows per page, and Focus selection renders 10 options per page.

| Rendered value | Source | Type / limit | Optional? |
| --- | --- | --- | --- |
| Task title, edit label, Focus option | Task.title | String, 240 UTF-16 code units | No |
| Note in editor | Task.note | String, 4,000 | Yes, empty string |
| Due-date metadata and form field | Task.due | Local date, YYYY-MM-DD, 1900–9999 | Yes |
| Waiting description | Task.waiting | String, 240 | Yes |
| Follow-up metadata and form field | Task.followUp | Local date, YYYY-MM-DD, 1900–9999 | Yes |
| Status text, state mark, next-action label | Task.status | Not started / In progress / Done | No |
| Priority selected state and button label | Task.priority, current day | Local date or empty; at most three per date | Yes |
| Plan-for-today switch | Task.planned | Local date or empty | Yes |
| Completed/unfinished membership | Task.completedOn, reviewedOn, planned, due, status | Optional valid dates and status | Yes |
| Task/priority/completion/page counts | Derived from arrays and page index | Integers, list length unbounded; locale-formatted counts | No |
| List length, pagination and empty state | HubState.tasks and filtered lists | Unbounded list, pages of 30/10 | No |
| Day heading | Current local day | Locale-formatted date | No |
| Week start | Settings.weekStart | Monday / Sunday | No |
| Reminder preference | Settings.reminder | None / On due date | No |
| Work/break/session fields and explanatory duration | Settings.work/rest/sessions | Integers: 1–180 / 1–60 / 1–24 | No |
| Loop/sound/vibration/background switches | Settings boolean fields | Boolean | No |
| Countdown, accessible phase and remaining-time label | deriveFocus(saved session, current timestamp) | Work / break / complete; 0–10,800 seconds per work interval | No |
| Error/status messages | Validation/storage/API branches and save state | Application-owned strings; platform error text is not length-bounded | Conditional |
| Preview banner and selected fixture segment | Development fixture mode | Six fixed modes | Development only |
| Navigation, section and action labels | Application-owned strings | Finite English strings; no localization system | No |

Task IDs and session IDs are keys and route inputs, not displayed. No avatars, media, people profiles, money, chart values, or imported markup exist on this surface; those catalog categories do not apply. Task strings render as plain text.

## Part 1 — What broke

No visual break is confirmed: all findings below are inferred from source, not screenshots. Widths 320px/phone/tablet, 200% zoom, native enlarged text, dark rendering, reduced motion and RTL rendering could not be exercised. RTL localization is not established by this version.

| # | Severity | Field/scenario | Worst-case value | Inferred outcome | Recommended fix |
| --- | --- | --- | --- | --- | --- |
| 1 | Fragile | Capture/settings keyboard | Small iPhone with keyboard open, enlarged system text, long note | Save controls may stay behind the keyboard because the ScrollView has no keyboard avoidance or automatic keyboard insets. Not visually verified. | Verify on iOS; then add platform-appropriate keyboard insets/avoidance and dismissal at `src/components/planner/workspace.tsx:20`. |

## Part 2 — Decisions for you

Recommend automatic iOS keyboard insets plus a native device check before deciding whether broader keyboard avoidance is necessary. The evidence does not establish which adjustment this Expo/native layout needs. The inferred stress finding was left unchanged under Break UI's report-before-fix rule.

## Part 3 — What held up

Source inspection supports the following, without a rendered verification claim:

- Long task titles wrap without truncation; the text column has `minWidth: 0`, and the status control does not shrink. Full titles and notes remain available in the editor.
- Empty, single-item and 1,000-row fixtures exist; empty states provide next steps, counts use singular/plural forms, and pagination bounds rendered rows.
- Mixed statuses, missing notes, long waiting details, multilingual/emoji text, unbroken email-shaped titles, overdue dates and literal markup are represented in fixtures or handled at the same string boundary. Invalid dates and blank titles are rejected before durable writes.
- Timer digits use tabular figures. The countdown font adapts to available window dimensions.
- Explicit action hit areas are at least 48 units, except native switches whose platform hit behavior still needs device inspection. Actions wrap rather than relying on hover.
- Computed token contrast: light body 13.37:1, secondary text 6.20:1, primary action 6.36:1; dark secondary text 8.82:1 and selected accent text 5.74:1. These calculations do not replace a rendered contrast audit.
- No entrance animations were added to frequent planning actions; reduced-motion behavior does not depend on decorative transitions.

The development toggle is in `src/components/planner/dev-fixtures.tsx`, above the tab bar. Run the dev server and open `/?data=worst`; states are My data, Demo data, Worst case, Empty, One and 1,000 rows. It persists in the URL for reload, stays out of production, and never saves fixtures to the real database. It could not be inspected running here.

Say `fix all` or `fix 1` and I'll apply the inferred keyboard fix, then recheck what this environment permits.

## Remaining platform limits and manual checks

Check on devices: capture/edit and restart; offline task management; three-priority cap; waiting follow-ups; due-only completion/review; carry-forward and leave-for-later; storage error recovery; Focus first/last boundaries; automatic cycling; early stop; restart and background catch-up; local alert delivery/duplicates; permission denial; normal-orientation restoration; tablet multitasking; and system accessibility settings.

The native app requests orientation through the existing Router stack. iPad/resizable windows and browsers may refuse a landscape request; the timer remains usable. Local notification delivery follows OS permissions/power policy, with 48 future transitions refreshed on foreground. No exact-alarm access or control over other apps' notifications is claimed. Offline web reload depends on a successfully installed app-shell service worker on HTTPS/localhost; it remains unverified here.

Official references: [Expo SDK 58 SQLite](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/), [Expo notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/), [Expo orientation constraints and Router approach](https://docs.expo.dev/versions/v58.0.0/sdk/screen-orientation/), [Android notification permission](https://developer.android.com/develop/ui/compose/notifications/notification-permission), [Android alarm delivery](https://developer.android.com/develop/background-work/services/alarms), [React Native keyboard insets](https://reactnative.dev/docs/scrollview#automaticallyadjustkeyboardinsets-ios), [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB), [service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers), [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API).
