# Task organization, calendar, keyboard and Lato

## Implemented

- The shared workspace wraps its scroll view in KeyboardAvoidingView: padding on iOS, height on Android, disabled on web. Its screen offset is measured rather than assuming a fixed navigation header. Drag dismissal is enabled, and development fixture controls hide while a native keyboard is open.
- Tasks have date-based groups: Overdue, Today, Tomorrow, Later and No date. Within groups, due/planned dates, in-progress status, title and ID provide deterministic ordering. Completed work and Today waiting items collapse. Pinned priorities retain the existing budget and remain visible, including completed pinned tasks.
- Task rows keep title and status visible. More reveals priority and Focus actions, with one expanded row per list. Review keeps its carry-forward/later actions visible.
- Tasks has a weekly Calendar mode with previous/next week, Today, seven scrollable day targets, counts, and selected-day tasks. It follows the saved week start; completed tasks collapse. Calendar interpretation was not specified further, so the recommended local-only in-app interpretation was used. No OS/device calendar is read or written.
- Lato regular and bold are bundled locally from the official Google Fonts repository, including the OFL license in assets/fonts. Existing expo-font loads them before normal startup; the splash is released even if font loading reports an error. Text, fields, native labels and navigation titles use the supplied family. No new font dependency or native config plugin was added.
- Native task reminders are opt-in via Settings → Today and tomorrow. Existing stored None/On due date values are retained; no task/schema migration is needed. Permission is checked/requested when saving an enabled native preference. Web labels explain that background task reminders are unavailable; the in-app calendar works there.

## Reminder policy and privacy

At 09:00 local time, a summary states how many unfinished tasks are due that day or the next. Titles and notes are never put into the notification. Only future morning times are scheduled: tasks added after 09:00 do not trigger a late notification for that morning. The next 12 relevant mornings are queued, leaving room for the existing 48 Focus transition alerts. Reopen/foreground, task changes, saved preference changes and an hourly foreground refresh reconcile the schedule. Completion or editing removes/updates future summaries; turning reminders off cancels only task reminders. Timezone changes are reconciled on reopening by comparing both content and the scheduled timestamp.

This uses the already installed expo-notifications module and existing notification permission. There is no new dependency, native permission/config change, database schema, server, account or calendar sync. Notification schedules and timestamp metadata are stored by the OS. Reminders follow OS permission, clock and power policies; delivery at the exact second is not promised. If the app stays closed beyond the queued mornings, reopen it to refresh. Errors are surfaced with a retry action. Turning the preference off before reverting this feature cancels its schedules without deleting tasks.

## Verification

- Strict TypeScript and whitespace checks pass.
- Production web export with offline shell generation passes and includes both font files.
- iOS/Android JavaScript/Hermes exports pass; these are not native binary builds or device checks.
- Existing lint was run interactively; installation/configuration of missing ESLint was declined. Lint did not pass and no tooling was added.
- Independent read-only source review found a timezone reconciliation issue; it was fixed with scheduled-time metadata. No further definite correctness issue was reported.
- No automated tests were added or run, following AGENTS.md.
- Browser discovery still reports its host unavailable. Keyboard behavior, font rendering, notification delivery, permission denial and phone/tablet layout remain unverified on actual devices. The existing Taste visual gate remains ERROR from its prior checker/port failure; it was not rerun after its explicit stop instruction.

## Manual checks still needed

On iOS/Android, open capture and settings with keyboard/text size enlarged; ensure the last field and Save remain reachable. Check dark task lists at phone/tablet widths, long multilingual titles, expanded actions and empty/completed groups. In Calendar, check both week starts, year/month boundaries and all seven days. Enable native reminders, deny/re-enable permission, create tasks due today/tomorrow, complete and reschedule them, disable reminders, change timezone and reopen. Confirm task-reminder cancellation leaves Focus alerts intact and vice versa. Verify Lato and task management after restart/offline loading.

References: [SDK 58 Font](https://docs.expo.dev/versions/v58.0.0/sdk/font/), [Expo font guide](https://docs.expo.dev/develop/user-interface/fonts/), [Google Fonts Lato](https://github.com/google/fonts/tree/main/ofl/lato), [KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview), [SDK 58 notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/).
