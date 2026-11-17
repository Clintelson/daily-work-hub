# Daily Work Hub Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the approved local-only personal planner on native and web.
**Architecture:** Shared React Native screens and state, SQLite on native and IndexedDB on web. Timestamp-derived Focus sessions use a separate Router screen and platform notification/fullscreen helpers.
**Tech Stack:** Expo SDK 58, strict TypeScript, React Native StyleSheet, Expo Router, expo-sqlite, expo-notifications.
**Spec:** docs/daily-work-hub-proposal.md (approved by user).

## Global Constraints

- Preserve unrelated changes, particularly AGENTS.md. Work in the user's requested workspace; no commits or deployment.
- No accounts, backend, sync, analytics, or persistent demo records.
- No automated tests per repository instruction; use typecheck, existing lint command, export, and manual UI checks.
- Approval covers local data, the two SDK dependencies, orientation/notification config and static offline web output.
- Execute inline without another permission handoff; prior approval covers necessary implementation work.

## Review Focus

Storage failures must not silently discard edits. Midnight and local dates must stay correct. Reopening must recover timer phases and completion. Stopping must cancel alerts. Large titles and lists must preserve reachable controls.

### Task 1: Durable planner and timer model
- [x] Install approved Expo packages using expo install.
- [x] Create src/lib/model.ts for Task, Settings, HubState, date validation, and deriveFocus(session, now).
- [x] Create src/lib/storage.ts and storage.web.ts; read/write versioned documents; IndexedDB transaction completion is the web durability boundary.
- [x] Create src/hooks/use-hub.tsx provider with hydration, serialized persisted mutations, error handling and retry.

### Task 2: Planning screens and navigation
- [x] Update src/constants/theme.ts tokens; reuse ThemedText, ThemedView and useTheme.
- [x] Create reusable planner controls, task rows/form, and responsive workspace layout in src/components/.
- [x] Create Today, Tasks, Review, Focus setup and Settings routes, retaining platform tab boundaries.
- [x] Support all task states, three priorities, waiting follow-ups, carry forward and leave for later.

### Task 3: Focus and offline capabilities
- [x] Add src/lib/focus-alerts.ts and .web.ts; permission requested only for enabled alerts, generic local notifications, foreground web sound fallback.
- [x] Implement timestamp-derived fullscreen focus route with accessible stop, completion and reopen recovery.
- [x] Configure native per-screen orientation, notifications and static web output. Add production-only service worker registration and exported asset cache generation.

### Task 4: Stress review and verification
- [x] Add dev-only isolated fixture selection: Demo, Worst case, Empty, One, 1,000 rows; do not persist fixtures.
- [x] Run npx tsc --noEmit, CI=1 npm run lint (report missing tooling rather than installing), and production web export.
- [ ] Inspect phone/tablet rendering and exercise planner/restart/focus: unavailable because browser host and Computer Use permissions blocked inspection; reported explicitly.
- [x] Record actual findings, field limits, limitations and verification in docs; report stress findings before fixing them.

## Execution ledger

2026-11-17: Approved proposal; existing main workspace has user AGENTS.md edits. Ruling: keep work here, without commits, to preserve the user's shared workspace. Ruling: repository no-tests instruction overrides TDD test steps; manual interaction and compiler/export checks are the verification method. The design skills apply to native app content rather than marketing-page structures.

2026-11-17: Tasks 1–3 implemented. Task 4 fixture infrastructure and compiler/export/configuration checks complete; rendered and device checks unavailable. No tests or deployment performed. Independent review identified and prompted focused fixes for atomic browser mutations, same-task conflicts, midnight priorities, review membership, Focus task selection, and notification stop/completion races. One inferred keyboard issue is intentionally reported without a fix under Break UI. See docs/verification-and-stress-review.md.
