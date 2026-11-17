# Daily Work Hub

A local-only personal planner for Android, iOS, and web, built with Expo SDK 58 and Expo Router.

Capture tasks with notes and due dates, choose up to three daily priorities, track waiting items, review unfinished work, and run configurable work/break cycles. The real workspace starts empty.

## Run

```sh
npm install
npm start
```

Use `npm run ios`, `npm run android`, or `npm run web` for the corresponding development session. Native configuration changes require rebuilding the app to take full effect; EAS is not configured and nothing has been published.

## Local storage

Native uses `expo-sqlite/kv-store`. Web uses IndexedDB, with changes read and written in one transaction to protect against stale browser tabs. Conflicting edits of the same task are rejected so the latest saved task survives. Writes must finish before the UI reports success. Unreadable saved data is preserved rather than reset. There is no server, account, analytics, or sync.

Closing the app does not intentionally clear its stores. Uninstalling it, clearing site data, private browsing policies, device loss, or OS/browser storage eviction can remove data. This version has no export/restore. Storage is not promised to be encrypted or backed up.

## Focus behavior

A saved start timestamp and session configuration determine the phase, remaining time, and completed cycles. Background JavaScript intervals are not required for recovery. Finite runs finish after the last work interval, without another break. Stop exits early and cancels this app's pending Focus alerts.

Native Focus requests landscape through the Router stack and hides system bars where supported. Tablet windows adapt when the OS refuses rotation. Web requests fullscreen from the Start action, with a timer view fallback; rotate the device manually. Reopening a browser cannot automatically regain fullscreen or audio permission.

Enable background Focus alerts in Settings to request local notification permission. Sound on native uses these alerts; foreground vibration can work without notification permission. Up to 48 upcoming transitions are scheduled, replenished when the app returns to the foreground. OS settings, power management, and notification permissions can delay or prevent alerts. Exact-alarm permission is not requested. Web sound is foreground-only and browser-dependent. Use OS Focus/Do Not Disturb yourself to silence other apps while allowing Daily Work Hub. The app does not control other apps' notifications.

Task due-date reminders are opt-in in Settings. Native builds schedule a private count-only summary at 09:00 local time for tasks due that day or tomorrow. The next 12 relevant mornings are scheduled, leaving room for Focus notifications. Edits, completion, and foreground/reopen reconcile reminders; disabling the preference cancels task reminders only. Morning times already passed are not rescheduled as late alerts. Background delivery follows OS notification policy. Web provides the in-app calendar without background reminders. This feature does not write to an external/device calendar.

## Offline web export

```sh
npm run build:web
```

Serve `dist/` from a static host at the origin root over HTTPS (localhost is also suitable for service workers). The build generates an app-shell service worker that caches exported application files, separately from IndexedDB task data. Visit online and let the worker finish installing before relying on offline reloads. Development mode deliberately does not register the worker. Production offline reload has not been exercised in a browser in this environment.

## Development fixtures and checks

Normal app launches always use real local data. The My data/Demo/Worst case toolbar and URL-based preview selection have been removed. Historical fixture source remains isolated from the app entry point and never seeds storage.

```sh
npx tsc --noEmit
npm run lint
```

ESLint is not configured. Expo lint may try installing it automatically; do not accept that silently. No automated tests were added or run, following the repository instructions.

See [verification and stress review](docs/verification-and-stress-review.md) for actual results and outstanding device/browser checks.

## Task list and typography

Tasks are grouped by Overdue, Today, Tomorrow, Later, and No date. Completed tasks and Today’s waiting list collapse; each row keeps its status and title visible, with priority/Focus actions behind More. The Tasks screen has a weekly Calendar view that follows the saved week start. Pinned priorities remain visible, including completed priorities, to keep the existing three-priority budget understandable.

The shared workspace has native KeyboardAvoidingView behavior and a measured screen offset; real-device keyboard checks are still needed. Lato regular/bold are bundled in assets/fonts under the included OFL license and loaded through the existing expo-font module. Normal use does not fetch fonts from a network.

## Branding and notification access

The app header uses assets/branding/dailyWorkHubLogo.png. Android 12+ uses a native animated vector recreation of the logo's pulse/lift on the cream background sampled from flashscreen.gif. Older Android versions receive the static vector. Android opens the planner directly after that splash, without a second GIF intro. The local plugin in plugins/with-animated-splash.js generates these resources during prebuild; keep it before expo-splash-screen because SDK 58 executes styles mods in reverse registration order. Rebuild and cold-launch an installed release/preview APK to assess it; Expo Go's own loader cannot show this native customization. The OS can shorten playback when the app is ready.

iOS retains the static native logo followed by the original four-second GIF; web plays the GIF at startup. Those intros retain Skip, a seven-second decoder watchdog and a static-logo reduced-motion fallback. Native Android motion follows system animator settings and needs device verification. No build signing, EAS profile, permission or dependency changes are part of this splash update. See docs/branding-and-notification-access.md for verification and rollback.

Today provides a notification access card. Allow notifications requests actual OS consent, then enables existing private due-date summaries and Focus alerts. Denial keeps task planning available, and a blocked permission offers Open device Settings. Settings shows access separately from feature preferences, so granting permission there does not discard unsaved edits. Returning from system Settings refreshes access. Only notifications need this OS permission; storage and the in-app calendar need no calendar, contacts, location, microphone or file-access prompts. No push tokens or remote service is used.
