# Branding, launch and notification access

Use Superpowers inline execution and Ponytail: reuse the already-installed expo-image, expo-splash-screen, expo-notifications and React Native APIs. No new dependencies or automated tests.

User authorization: use supplied logo PNG and flashscreen.gif, remove development fixture UI, and implement the needed notification opt-in/access flow. Keep unrelated uncommitted task/calendar/font work intact.

- [x] Use the supplied logo alongside the header wordmark, preserving its aspect ratio.
- [x] Remove fixture toolbar and URL-driven preview selection from the app root; normal launches always open real device data. Leave old fixture source isolated rather than deleting unrelated files or personal data.
- [x] Configure the native static splash with the logo on cream matching the supplied GIF, then show the original GIF in an app-controlled launch screen. OS launch screens cannot play a GIF. Play once per cold launch with bounded duration, immediate Skip, reduced-motion still-logo fallback, and loading/error escape paths. Use native expo-image decoding, not a JS frame loop. Hide native splash after the launch image displays; a watchdog releases it on decoder failure. Mount the planner only after launch completes so hidden controls cannot receive keyboard focus.
- [x] Add notification access status, explicit opt-in, denied/settings recovery, and foreground refresh. Dashboard action explains that it enables both local due-date summaries and Focus alerts; Settings access action grants permission without discarding form edits. Only notifications need user-granted OS access. No calendar/location/contacts/microphone/storage permissions or push tokens.
- [x] Reuse the same permission helper in existing alert/reminder request paths; respect canAskAgain and provisional iOS authorization. Keep task data local and retain normal use when permission is denied.
- [x] Run typecheck, lint without accepting tooling installation, web/native exports and native config introspection. Request focused source review; report unavailable device/rendered checks.

Native config change: app.json's existing splash plugin gets the supplied PNG and matching cream background (#F1EDE7, sampled from the GIF). This is required for the requested branded launch and needs a native rebuild. Preserve the user's existing expo-image plugin addition. No signing, entitlements, build profiles or release changes. Roll back only these splash properties to restore prior launch artwork; no data changes or migration.

Permission behavior uses the existing native notification module/permissions. Enabling the dashboard option updates only existing durable reminder/Focus preferences after access is allowed. It never bypasses an OS denial or turns on unrelated permissions. Disabling features remains available in Settings; reverting code does not delete tasks or settings.

Permission refinement: native config introspection and the installed expo-image Android manifest exposed legacy READ_EXTERNAL_STORAGE/WRITE_EXTERNAL_STORAGE declarations. The app only reads bundled/internal assets, so app.json now blocks these unused external-storage permissions. This reduces access; it does not request new permissions. Native module POST_NOTIFICATIONS and existing VIBRATE remain available. Reverting only blockedPermissions would restore the old legacy declarations, not remove tasks.

Completed: branding, bounded launch, live-data-only root and notification consent/recovery paths implemented. Strict typecheck, whitespace check, web/native JS exports and config introspection passed. Lint requested setup and was declined; no tests ran. Two source reviews found no important issue in the final root/launch/access flow. Device/release-build checks remain unverified and are listed in docs/branding-and-notification-access.md.
