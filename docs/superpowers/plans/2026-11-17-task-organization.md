# Task organization, keyboard and reminders

Use superpowers:executing-plans for inline implementation.

Goal: reduce task-list clutter, add keyboard avoidance and bundle a legible font; clarify calendar integration before implementing platform/data side effects.

Design: preserve graphite #141416, charcoal #1D1D20, crimson #B94349, accent #E77875 and chalk #F1EDE7. Use locally bundled Lato regular/bold through existing expo-font. Open tasks are grouped into Overdue, Today, Tomorrow, Later and No date; completed work is collapsed. Task rows keep status/title visible and reveal priority/Focus actions on demand. Today preserves pinned priorities (including completed ones, matching the existing three-priority cap) and shows open planned work, with waiting and completed lists collapsed. No new sorting dependency or persistent task fields.

Keyboard: shared Workspace uses KeyboardAvoidingView with native platform behavior and measured header offset, wrapping its ScrollView; retain handled taps and enable drag dismissal. Keep web browser resizing behavior rather than native keyboard adjustment.

Tasks:
- [x] Inspect existing code and matching SDK docs; clarify calendar intent.
- [x] Add bundled licensed Lato files, load before splash dismissal with fallback on load error; apply to Text, fields and navigation labels.
- [x] Add keyboard avoidance and hide development fixture chrome during keyboard use.
- [x] Add deterministic task sorting, date groups, collapsed completed/waiting sections and expandable row actions without changing stored task data.
- [x] Implement approved calendar/reminder scope after clarification. Proposed local reminders: 09:00 local on due day and previous day, generic private notification text, opt-in using existing notification support. Device-calendar writes, new permissions or persistent reminder-schema changes require a concrete approval under AGENTS.md.
- [x] Typecheck, existing lint command without installing tooling, web/native exports; independent source review. No automated tests per project instructions. Report unavailable rendering/device checks.

Constraints: preserve user work and current stack. No native configuration or new dependency is needed for font/keyboard/grouping work. Calendar clarification is pending; do not assume permission to expose task data to an external calendar.

Ruling: after allowing time for the optional calendar clarification, implement the recommended in-app calendar/local reminders. No device-calendar access, new native permission, dependency or schema is required. Reuse existing stored None/On due date preference with a clear Today and tomorrow label; it now enables the requested functionality. Reminder summaries contain counts, never task titles/notes. Limit to 12 upcoming relevant mornings to reserve room for Focus alerts. Reopen refreshes timezone/schedules. No late/retroactive morning alerts. Turning off cancels only task reminders. Rollback: turn the preference off before reverting reminder support; all task data remains in the unchanged schema.

Source review found and fixed timezone reconciliation: local notification metadata now records the scheduled instant and must match the recalculated local 09:00 instant before keeping an existing reminder. Calendar interpretation used the recommended in-app option after the unanswered optional clarification; no device-calendar integration is claimed. Device/rendered checks remain unavailable and must be reported separately from compiler/export results.
