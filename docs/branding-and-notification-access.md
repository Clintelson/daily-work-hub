# Branding and notification access

## Changes

The supplied PNG is displayed at 48×48 beside the header wordmark, preserving its aspect ratio and transparency. The My data/Demo/Worst case controls, preview banner and URL-driven fixture selection are disconnected from the app entry point. Normal launches always hydrate the real local store; no tasks are seeded, reset or deleted. Historical fixtures remain isolated source files.

The native splash uses #F1EDE7, sampled from the supplied GIF's background. Android 12+ now uses a native AnimatedVectorDrawable: a one-second pulse/lift recreation of the supplied four-tile logo, with a static VectorDrawable fallback on older Android versions. This is vector motion rather than native GIF playback. Artwork fits the system's circular mask throughout the pulse. Android animator settings govern the native animation; reduced-motion behavior still needs release-device verification. The system can truncate the animation when content is ready; the app does not hold launch just to complete it.

`plugins/with-animated-splash.js` copies bundled XML into generated drawable and drawable-v31 directories and overrides the existing Expo splash theme's icon/duration. It must appear BEFORE expo-splash-screen in app.json: SDK 58 executes styles mods in reverse registration order. Expo still owns the activity, theme background and splash dismissal; no native source is hand-edited. No dependency, permission, signing or EAS profile changes are needed for this addition.

Android mounts the planner behind the native splash immediately and removes the secondary GIF intro. It hides the native splash after root content layout, fonts settling and local data hydration (including restored Focus navigation). A storage error reveals the existing retry UI; after seven seconds, a stalled startup reveals the loading/retry interface with system fonts instead of trapping the app behind branding. Failed/stalled cold links to the fullscreen timer first return to Today, where recovery controls are available; successful hydration still restores a saved Focus session.

iOS retains the static PNG native launch screen followed by the original 100-frame/four-second GIF; web uses the same GIF intro. Skip exits immediately; reduced motion shows the PNG briefly instead; image errors fall back to the logo; a seven-second watchdog releases startup even if decoding/display events fail. Artwork is bounded by both window dimensions. On these platforms the planner mounts only after the intro exits, preventing interaction with hidden controls. Font loading starts immediately and system fallback remains usable if Skip wins the race. Navigation or ordinary foregrounding does not replay the intro.

Today has a notification-access card with actual OS status. Allow notifications requests consent, then saves the existing due-date/Focus-alert preferences only after access is allowed. It never grants permission on the user's behalf. OS denial leaves planning and timers available; when the OS will not ask again, Open device Settings provides recovery. Status is rechecked on foreground. Settings has a separate access card that grants permission without mutating unsaved preference edits; features still follow its existing Save action. The shared permission helper is reused by both reminder and Focus request paths and recognizes provisional iOS access.

Only notification access is requested. This does not add calendar, location, contacts, microphone or file-access prompts, push tokens, accounts or cloud data. Bundled/internal assets need no external storage access, so native configuration blocks legacy Android READ_EXTERNAL_STORAGE and WRITE_EXTERNAL_STORAGE declarations inherited from the image/base stack. Existing VIBRATE and the notification module's POST_NOTIFICATIONS declaration remain. Native rebuild is needed for config changes; no build, deployment or release was performed.

## Files

- `src/components/launch-screen.tsx`, `src/app/_layout.tsx`: launch sequence and removal of fixture entry points.
- `src/components/planner/workspace.tsx`: real logo and normal content insets.
- `src/lib/notification-access.ts` and `.web.ts`, `src/components/planner/notification-access-card.tsx`: permission status, request and settings recovery.
- `src/app/(tabs)/index.tsx`, `src/app/settings.tsx`: access UI at the dashboard and settings.
- `src/lib/focus-alerts.ts`, `src/lib/task-reminders.ts`: shared permission request logic.
- `src/components/themed-text.tsx`, planner controls, native tabs and root header: font readiness fallbacks for early Skip.
- `plugins/with-animated-splash.js`, `assets/branding/android/*.xml`, `app.json`: Android animated/static native splash resources, preserving the existing Expo splash/iOS configuration, legacy-storage permission blocking and user's expo-image plugin addition.
- `README.md`: current launch/access behavior and removal of developer controls.

Other uncommitted task/calendar/font changes were preserved.

## Verification and limits

For the native animated splash update, TypeScript passes. Production web export/offline shell generation and iOS/Android JavaScript/Hermes exports pass. Native config introspection succeeds and shows the custom icon and 1,000 ms duration in Theme.App.SplashScreen. Android prebuild succeeds in an isolated temporary project; repeating it produces identical splash theme/vector resources. The installed Android 36 aapt2 compiles all generated app resources, then compiles and links the three custom drawable resources against android.jar, including inline gradients and animation. The resulting resource-only validation package is not an installable Daily Work Hub APK. No full native app binary was built or device animation/permission checks performed.

Lint was run interactively; missing ESLint installation/configuration was declined. Lint did not pass. No automated tests were added or run, following AGENTS.md.

Independent source review identified a blank recovery screen for failed cold timer links; the Android root now redirects those links to Today's existing retry view before hiding the splash. No other important source issues were reported. Device checks are still required for Android 12+ cold/warm startup, Android 11 static fallback, system animation scale disabled, fast launch truncation, active-session recovery during orientation changes, local storage error recovery (including timer links), iOS/web Skip and reduced motion, landscape sizing, actual OS permission dialogs, denial/settings return, and notification delivery. Root layout readiness does not independently verify the native timer's orientation transition has finished. Browser/native visual inspection remains unavailable in this environment; no rendered pass is claimed. Expo Go's pre-JavaScript loader cannot be replaced by app code; test this native splash in a rebuilt release/preview app, not Expo Go or only a Metro reload. The OS may still delay or suppress alerts according to notification and Focus/Do Not Disturb settings.

To roll back only the native animation, remove the local splash plugin from app.json and restore the previous Android LaunchScreen branch in src/app/_layout.tsx, then regenerate/rebuild the native app. The normal Expo PNG splash remains configured. Remove the plugin/source XML only when no longer referenced; do not delete local stores. Other launch/access changes can be reverted separately. Disable reminder/Focus preferences in Settings if reverting alert support. Permission grants remain controlled by device Settings.

References: [SDK 58 Image](https://docs.expo.dev/versions/v58.0.0/sdk/image/), [SplashScreen](https://docs.expo.dev/versions/v58.0.0/sdk/splash-screen/), [Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/), [AccessibilityInfo](https://reactnative.dev/docs/accessibilityinfo), [Linking settings](https://reactnative.dev/docs/linking#opensettings).

Native animation references: [Android system splash specifications](https://developer.android.com/develop/ui/views/launch/splash-screen), [VectorDrawable/AVD](https://developer.android.com/develop/ui/views/graphics/vector-drawable-resources), [Expo config plugins](https://docs.expo.dev/config-plugins/plugins/).
