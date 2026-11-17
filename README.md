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

Task reminder preferences are saved, but task reminders are deferred and labeled accordingly.

## Offline web export

```sh
npm run build:web
```

Serve `dist/` from a static host at the origin root over HTTPS (localhost is also suitable for service workers). The build generates an app-shell service worker that caches exported application files, separately from IndexedDB task data. Visit online and let the worker finish installing before relying on offline reloads. Development mode deliberately does not register the worker. Production offline reload has not been exercised in a browser in this environment.

## Development fixtures and checks

Development builds have an isolated fixture switch: My data, Demo data, Worst case, Empty, One, and 1,000 rows. Open `/?data=worst` to inspect realistic long titles, multilingual text and missing metadata; `/?data=huge` exercises pagination. These fixtures never seed persistent user data. Production ignores the fixture URL parameter.

```sh
npx tsc --noEmit
npm run lint
```

ESLint is not configured. Expo lint may try installing it automatically; do not accept that silently. No automated tests were added or run, following the repository instructions.

See [verification and stress review](docs/verification-and-stress-review.md) for actual results and outstanding device/browser checks.
