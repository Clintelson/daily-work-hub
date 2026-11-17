# Native animated splash implementation plan

> **For agentic workers:** Use superpowers:executing-plans for this approved implementation.

**Goal:** Show an animated logo in the Android 12+ system launch screen, then open the planner without a second GIF intro.

**Architecture:** A local Expo config plugin extends the existing SDK 58 splash plugin. Android selects an animated vector resource on API 31+ and a static vector on older versions. The existing iOS/web intro stays in place.

**Tech stack:** Expo SDK 58, Android VectorDrawable/AnimatedVectorDrawable, existing expo-splash-screen; no dependencies.

**Spec:** User-approved native Android splash proposal in this conversation.

## Constraints and review focus

- Preserve unrelated uncommitted work; implement in the current authorized workspace.
- Never hand-edit generated native directories. Native resource generation belongs in the plugin.
- Keep the logo within the system mask, use #F1EDE7, and cap animation at 1,000 ms. A short pulse/lift recreates the supplied GIF's motion; this is not GIF playback.
- Android 11 and earlier must select the static resource. Expo Go cannot preview these native changes.
- Do not hold launch merely to finish branding. Hide when layout, fonts (or fallback), and local hydration are ready; startup errors must not leave an invisible interactive app.
- Preserve iOS/web Skip, reduced motion, image failure handling, and timer recovery.
- Native animation follows OS animator settings; device verification remains necessary.
- No tests added/run, per AGENTS.md. Use typecheck, lint attempt, native prebuild/resource compilation, and bundle export.

## Task 1: Native resource generation

- [x] Add vector logo and 1,000 ms pulse/lift AVD in `assets/branding/android/`.
- [x] Add `plugins/with-animated-splash.js`, copying versioned resources during prebuild and overriding only the existing splash theme's icon/duration.
- [x] Register it before expo-splash-screen in `app.json` (SDK 58 styles mods execute in reverse registration order).
- [x] Inspect introspected theme and temporary Android prebuild; compile XML with the installed Android aapt2. Repeat prebuild to verify idempotency.

## Task 2: Single Android launch and documentation

- [x] Bypass `LaunchScreen` on Android in `src/app/_layout.tsx`. Keep native splash until the real content is laid out, hydrated and fonts settle, with bounded font fallback.
- [x] Update README and branding notes with Android/iOS/web differences, rebuild requirement, validation and rollback.
- [x] Run TypeScript, attempt existing lint without installing tooling, export platform bundles, inspect whitespace, and obtain fresh source review.

## Execution record

Approved native configuration change; no additional permission, storage, signing, or release changes. Existing workspace retained because the feature depends on uncommitted branding work here. No commit or release requested.

Implementation complete in source. SDK 58 styles-mod ordering was confirmed from installed withMod.js after the first introspection exposed the registration-order assumption; corrected ordering yields the custom icon/duration. Android prebuild twice generated identical splash resources. All generated resources compiled with aapt2; custom drawables also linked against Android 36 android.jar. TypeScript, production web export/offline shell and Android/iOS Hermes exports passed; Android export reran after the recovery fix. Whitespace check passed. Lint attempted but missing ESLint configuration/install declined; lint did not pass. No tests added/run, no full app APK built, no device animation pass claimed.

Fresh source reviewer identified failed/stalled cold /timer links revealing that route's empty pre-hydration view. Fixed with Android-only root navigation to Today's existing recovery UI before splash dismissal; successful hydration still restores saved Focus. Verified by source inspection, typecheck and Android export, not an automated test or device run. No other important source findings. Native orientation completion, playback on API 31/32/newer, pre-31 fallback and disabled animator settings remain release-device checks.
