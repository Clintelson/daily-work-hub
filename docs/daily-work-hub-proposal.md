# Daily Work Hub implementation proposal

Status: proposed, awaiting approval of storage, native dependencies, and configuration. No application implementation has changed.

## Existing project and approach

The repository is an Expo SDK 58 starter using React 19.3, React Native 0.88.1, strict TypeScript, Expo Router, native/web tab components, themed primitives, and StyleSheet. Keep these conventions and the user's existing AGENTS.md changes.

Recommended: one shared native-first planner, native SQLite persistence, and a separate IndexedDB implementation for web. Reuse installed modules for navigation and per-screen orientation. SQLite is documented for SDK 58 and persists across app restarts. IndexedDB avoids SQLite's experimental web setup and browser localStorage as the task store.

An all-platform SQLite implementation reduces adapter code but adds experimental web requirements. A web-only planner avoids native work but fails the phone/tablet app brief. Neither is recommended.

## Proposed design

The primary job is choosing and doing today's work. The interface should read like a compact daily agenda rather than a dashboard of statistics.

- Color: paper #F7F9FC, white #FFFFFF, ink #172B4D, slate #52627A, blue #2459C4, success #23664D. Provide semantic dark equivalents and measure contrast during implementation.
- Type: existing local system sans, 32px day heading, 22px section headings, 16px task text, 14px metadata. Keep text scaling enabled; use tabular timer digits. Avoid network font dependencies.
- Layout: phone uses a single column; tablet uses a wider task column and a narrower focus/waiting column. Keep all text left aligned except the Focus countdown. Reuse spacing tokens with 16/24/32px hierarchy.
- Character: three clearly ordered priorities, restrained blue selection, generous breathing room, flat list rows, and fine separators. No decorative hero, charts, stock images, or card grid.
- Navigation: Today, Tasks, Focus, Review; settings through a labeled header action. Retain platform-specific tab implementations. Fullscreen Focus is a separate Router screen outside tabs.

```text
Phone                     Tablet
Today       Add task      Today                         Add task
Tuesday, 17 November      Tuesday, 17 November
Your three priorities     Your three priorities         Focus setup
Today's tasks             Today's tasks                 Waiting on
Waiting on                Review day
Review day
Today Tasks Focus Review  Platform navigation
```

This adapts the requested design skills to a working native app. Marketing-page section heights, promotional entrances, and Tailwind are inappropriate for this existing React Native project. The UI/UX search returned a marketing layout; retain its flat, readable styling guidance and discard that layout.

## Behavior and data

- Task: ID, required title (proposed limit 240 characters), optional note (4,000), optional due date, planned date, three-state status, priority date, optional waiting description and follow-up date. Dates use local calendar dates, with validation for impossible dates.
- Today includes explicitly planned tasks and unfinished tasks due today or overdue. Waiting tasks appear separately. Enforce three priorities per local date in shared mutation logic, including after hydration.
- Quick capture opens a small labeled form. All tasks remain available in Tasks. Empty real storage starts empty; fixtures never enter persistent storage.
- Review separates completed and unfinished tasks. Carry forward changes planned date to tomorrow and clears today's priority; leave for later removes the planned date and priority but preserves the task, note, and due date. Overdue tasks remain visible under their due-date rule.
- Settings persist week start, reminder default, focus durations, session count/manual stop, sound and vibration. Clearly label deferred task reminders; do not imply they are scheduled.
- Native persistence uses expo-sqlite/kv-store with a versioned document; web uses a versioned IndexedDB store. Serialize writes and surface failures. Do not overwrite unreadable data with an empty default. No accounts, remote database, analytics, or network transmission of tasks.
- Focus stores selected task ID, immutable session configuration, start timestamp and active/stopped state. Derive phase, completed cycles and remaining time from timestamps on reopen, foreground and display ticks. No reliance on background intervals. A finite run ends at its final work interval without another break. Stop early persists termination and cancels pending alerts.
- Focus renders countdown only, with one accessible, unobtrusive stop/exit control. Configuration stays on the preceding screen. Use installed Expo Router/React Native Screens per-screen orientation rather than adding an orientation dependency. Restore normal navigation on exit.
- Ask for notification permission only when enabling background alerts. Use local notifications and foreground vibration where supported; never request push tokens. Use generic notification content without task titles or notes. Schedule within OS limits and expose limits for indefinite sessions; no promise of unlimited background alert scheduling.
- Explain OS Focus/Do Not Disturb setup briefly. The app does not control other apps' notifications. Browsers cannot guarantee orientation locks or timer alerts while suspended. Keep timestamp recovery functional if fullscreen, rotation, or alerts are unavailable.
- Preserve tablet multitasking rather than forcing iPad exclusive fullscreen. Adapt the timer to the actual window when the OS declines landscape.
- Web offline reload needs an app-shell cache/service worker, separate from IndexedDB. Cache only application assets, never personal task data. Propose static web output because no server behavior is needed; verify a production export and offline reload before claiming offline web support.

## Changes requiring explicit approval

| Change | Files/systems | Risks and review |
| --- | --- | --- |
| Store personal tasks, settings and timer state locally | New storage/model modules under src; SQLite device database; browser IndexedDB | Uninstalling the app or clearing site data can remove data; storage is not promised to be encrypted or backed up. Inspect hydration, validation and failure handling; manually close/reopen and check retained values. No destructive migration or reset. |
| Install SDK-compatible expo-sqlite and expo-notifications | package.json, package-lock.json; native app binary | Native compatibility and package install scripts. Install only using npx expo install; inspect resolved versions and dependency diff. Notification delivery depends on OS permissions and policy. |
| Enable supported orientation and local notifications; enable offline web assets | app.json, Router layout, platform-specific focus/notification code, web app-shell cache | Replace global portrait restriction with per-screen behavior; declare required config plugins. Native configuration can require a rebuilt app. Static web output changes export shape but publishes nothing. Review generated Expo configuration and export locally. |

No signing, EAS, account, production deployment or store submission changes are proposed. No changes to generated ios/ or android/ directories.

Rollback: revert only implementation files and dependency/config diffs, preserving the user's unrelated changes. Leave local stores intact; rollback must not delete user data. Cancel this app's scheduled Focus alerts when disabling the feature. Keep versioned storage readable by the implemented version; future incompatible migrations need separate review.

## Verification and stress review

Run typecheck and the existing lint command. If Expo lint requires ESLint installation/configuration, report that instead of silently installing tooling. Inspect SDK compatibility and local production export. No automated tests will be added or run without a user request.

Manually verify capture, status changes, the priority cap, waiting follow-ups, review actions, write failures, restart recovery, work/break boundaries, final completion, early stop and notification cancellation. Verify native orientation and background alerts on available hardware/simulator and report anything unavailable.

Break UI uses an isolated development-only fixture source with Demo, Worst case, Empty, One and 1,000 rows. Keep URL selection for web. Include realistic long multilingual task titles, long unbroken identifiers, absent notes, long waiting descriptions, overdue dates and large lists. Inspect 320px, phone and tablet widths, enlarged text, dark theme, reduced motion and keyboard access. Report breaks and recommended fixes before applying new changes arising from that audit, as required by the requested skill.

Official references checked: https://docs.expo.dev/versions/v58.0.0/ ; https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/ ; https://docs.expo.dev/versions/v58.0.0/sdk/screen-orientation/ ; https://docs.expo.dev/versions/v58.0.0/sdk/notifications/ ; https://docs.expo.dev/llms.txt . Fetch the relevant detailed SDK, React Native, browser and OS documentation again for each implementation area before coding it.
