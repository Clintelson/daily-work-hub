# Daily Work Hub

Daily Work Hub is a local-only personal work-planning app for phone and tablet. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Repository facts and conventions

- This is currently an Expo starter, not an implemented planner. `README.md` identifies Android and iOS as product targets; the repository also supports web through React Native Web and platform-specific components.
- `package.json` currently declares Expo SDK 58 (`~58.0.25`), React 19.3, React Native 0.88.1, and Expo Router 58. Recheck versions before implementation.
- TypeScript is strict. Use `@/*` for `src/*` and `@/assets/*` for assets. Follow existing functional components, React Native `StyleSheet`, and import conventions.
- Routes are in `src/app/`; reusable components, hooks, and theme tokens are in `src/components/`, `src/hooks/`, and `src/constants/theme.ts`. Reuse `ThemedText`, `ThemedView`, `useTheme`, colors, spacing, and safe-area patterns.
- Native tabs use `src/components/app-tabs.tsx`; web tabs use `app-tabs.web.tsx`. Preserve platform-specific boundaries; browser APIs and CSS belong in web-specific code.
- `app.json` currently locks orientation to portrait and uses automatic light/dark appearance. Tablet-specific behavior and landscape Focus Mode have not been established.
- No durable app storage, task model, timer implementation, test setup, ESLint configuration, or EAS configuration is present. Storage selection and platform capabilities must be verified before implementation; do not describe planned features as working.
- npm is the current package manager (`package-lock.json`; no `bun.lock`). No contribution guide or additional repository instruction files were found during this review.

## Product guardrails

- Quick capture: task title, optional note, and due date. Task states: not started, in progress, and done.
- Today: an easy-to-scan plan with at most three priorities. Include a “Waiting on” list with optional follow-up dates.
- End-of-day review: let the user carry unfinished tasks forward or leave them for later.
- Focus Mode: configurable work and break durations, automatic work/break cycling, a selectable session limit or manual stop, and the ability to stop early.
- Where supported, enter a fullscreen landscape Focus view showing only the timer. Keep configuration and other content outside that view; preserve a usable, accessible way to exit or stop early.
- Signal work/break transitions with sound or vibration where supported. Basic settings include week start and reminder defaults.
- Keep search, export, restore, and cross-device sync out of scope unless the user requests them.

## Local-only data

- Persist tasks, settings, priorities, waiting items, and timer state durably on the user's device. In-memory state must not be the only persistence; normal task management must work offline.
- Do not add accounts, a backend, cloud storage, automatic sync, or analytics that transmit personal task data. The web `output: "server"` setting is not permission to store personal data on a server.
- No storage dependency or persistence convention exists yet. Choose appropriate durable on-device storage using official SDK-compatible documentation. For web, prefer an existing durable database approach or IndexedDB; do not default to `localStorage` as the sole store unless the project explicitly requires it and documents its limitations.
- Save timer phase, configuration, and timestamps needed to derive remaining time and elapsed cycles accurately after backgrounding or reopening. Do not rely on an interval continuing in the background.
- Keep task and timer behavior understandable and recoverable. Ordinary navigation, refresh, or restart must not lose data. Never seed demo tasks into real persistent user data.

## Platform behavior and interface

- Verify platform-specific behavior against official Expo, React Native, and operating-system documentation before implementation, including orientation, fullscreen, timers, notifications, sound, vibration, and permissions.
- Reconcile the current portrait lock with supported Focus Mode orientation behavior through app configuration and supported APIs. Do not promise that web can force orientation or reliably execute background timers. Explain limitations plainly and provide a fallback that preserves core task and timer use.
- Do not claim the app can silence other apps' notifications without verified platform/app support and required user-granted access. Otherwise guide users to OS Focus or Do Not Disturb settings, keeping Daily Work Hub notifications allowed where the OS supports it.
- Keep the interface calm, modern, readable, and touch-friendly on phone and tablet. Today should be easy to scan; Focus Mode should stay visually minimal.
- Respect contrast, system text sizing, reduced motion, accessible labels, touch target sizes, safe areas, and light/dark themes.
- Reuse existing architecture and dependencies. Avoid unnecessary libraries, abstractions, and unrelated redesigns.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring application changes done, subject to explicit user instructions. Do not add or run tests unless the user asks. When verification is requested, prefer existing project commands and report actual results.

`npm run start`, `npm run android`, `npm run ios`, and `npm run web` launch development sessions; `npm run lint` invokes `expo lint`. Lint may offer to install/configure ESLint because it is not set up yet: do not silently install tooling or claim it passed. Documentation-only inspection work should stay within its requested scope.

Do not run `npm run reset-project` unless explicitly requested: it moves or deletes source, scripts, and starter assets.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

For requested cloud builds, signing, submission, and over-the-air updates, use EAS (`eas build`, `eas submit`, `eas update`). EAS is not configured in this repository yet; do not assume credentials or deployment targets. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples. Cloud builds do not require local Xcode or Android Studio.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. A native library not bundled in the matching Expo Go requires a development build: `npx expo run:ios` / `npx expo run:android` locally, or EAS with a configured development profile.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Skills and plugins

Use available, applicable skills; recheck availability in future sessions rather than installing missing ones automatically:

- `superpowers:using-superpowers` at the start of work; `superpowers:brainstorming` before creative product or behavior changes.
- `superpowers:writing-plans` after design approval and before multi-step implementation.
- `superpowers:test-driven-development` for requested feature or bug work, consistent with user instructions and project conventions. The rule against adding/running tests without a user request still applies.
- `superpowers:systematic-debugging` for bugs or unexpected behavior; `superpowers:verification-before-completion` before completion claims.
- Choose one relevant interface skill, such as `impeccable` or `ui-ux-pro-max`, for interface work. Use `animate-expo` for React Native/Expo motion and `mobile-native` specifically for web behavior on phones. `write-swift` applies only if Swift work is introduced; this repository is currently TypeScript/React Native.

Plugins provide skills or tools. Do not install or connect them unless the user asks or the task clearly requires them. Prefer existing project capabilities and relevant available skills.

## Working and reporting

- Follow higher-priority instructions and applicable repository rules. Keep changes within the requested scope and preserve unrelated user work.
- Do not expose secrets, credentials, or private environment data.
- Before finishing instruction edits, review for contradictions, unsupported platform assumptions, and unnecessary duplication or conflicts with higher-priority rules.
- Report changed files, main behavior or guardrails, verification actually performed, and material limitations. Do not claim unrun checks passed.
## Safety rules for AI coding in this project

Use these rules whenever you make or propose code changes.

### Do not change without explicit approval

Stop and explain the proposed change before editing any of these:

- Secrets, credentials, signing certificates, tokens, or `.env` files.
- Authentication, authorization, session handling, or backend access controls.
- Payments, subscriptions, purchase validation, or entitlement logic.
- Collection, storage, transmission, logging, or deletion of personal or sensitive data.
- iOS or Android permissions, entitlements, signing settings, build profiles, or native configuration.
- Dependencies that add native code, run install scripts, or involve major version upgrades.
- Database schemas, migrations, production data, destructive scripts, or broad file deletion.
- Release settings, production environment configuration, app store submissions, or over-the-air updates.

For these areas, first describe:
1. What needs to change and why.
2. Which files and systems are affected.
3. The security, privacy, data-loss, compatibility, or release risks.
4. How to review, test, and roll back the change.

Wait for explicit approval before proceeding.

### Always follow these practices

- Never put secrets in source code, prompts, logs, app bundles, or committed files. Use the project’s approved secret-management approach.
- Do not treat client-side checks as security controls. Enforce authorization and sensitive business rules on the server.
- Do not add analytics, tracking, permissions, or data collection unless the task requires it and the data flow is clear.
- Prefer small, focused changes. Do not rewrite unrelated files or perform broad cleanup as part of a feature.
- Before changing a dependency, explain why it is needed and check its Expo, React Native, and platform compatibility.
- Preserve existing behavior unless the request clearly calls for changing it.
- Never publish, deploy, submit, or release the app unless explicitly asked.
- Do not claim a change was tested unless you actually ran the relevant checks. Report checks that could not be run.

### For every coding task

1. Inspect the relevant files and follow existing project conventions.
2. Summarize the intended change before making high-impact edits.
3. Keep changes limited to the requested scope.
4. After editing, summarize changed files, notable risks, and checks performed.
5. Flag any assumptions or unresolved issues clearly.
