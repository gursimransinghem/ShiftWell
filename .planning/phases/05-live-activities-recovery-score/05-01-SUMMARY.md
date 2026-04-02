---
phase: 05-live-activities-recovery-score
plan: 01
subsystem: data
tags: [zustand, asyncstorage, adherence, recovery-score, persist]

# Dependency graph
requires:
  - phase: 04-night-sky-mode-notifications
    provides: notification-store pattern (create/persist/createJSONStorage/AsyncStorage)
provides:
  - computeAdherenceScore pure formula (40/35/25pt weights, null for no-shift days)
  - useScoreStore Zustand persist store (recordEvent, finalizeDay, weeklyScores, todayScore)
  - AdherenceEvent, DailyScore, AdherenceEventType types
affects:
  - 05-02-PLAN (will wire useScoreStore to RecoveryScoreCard + WeeklyTrendChart)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure formula function in src/lib/ with no React/RN deps — testable in isolation"
    - "Zustand persist with partialize excluding setters from AsyncStorage"
    - "ISO date strings throughout persist path (no Date objects)"
    - "Idempotent finalizeDay via lastFinalizedDateISO guard"
    - "history.slice(-30) trim on every finalizeDay to bound AsyncStorage growth"

key-files:
  created:
    - src/lib/adherence/adherence-calculator.ts
    - src/store/score-store.ts
    - __tests__/store/score-store.test.ts
  modified: []

key-decisions:
  - "AdherenceEvent uses dateISO string not Date object — safe for Zustand persist (no serialization surprises)"
  - "null return from computeAdherenceScore means no-shift day (distinct from 0 which means shift day with no adherence)"
  - "pendingEvents are never cleared after finalizeDay — they accumulate and are filtered by date at scoring time"

patterns-established:
  - "Pattern: pure formula in src/lib/, store in src/store/, tests in __tests__/store/"
  - "Pattern: TDD — tests written RED first, implementation GREEN second"
  - "Pattern: Zustand setState() in beforeEach to reset store between tests (no teardown needed)"

requirements-completed:
  - SCORE-01
  - SCORE-03

# Metrics
duration: 3min
completed: 2026-04-02
---

# Phase 5 Plan 01: Recovery Score Data Layer Summary

**Zustand adherence score store with ISO-date persistence, 40/35/25pt formula, and null/zero no-shift-day distinction — 27 tests green**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-02T14:10:51Z
- **Completed:** 2026-04-02T14:13:41Z
- **Tasks:** 2
- **Files modified:** 3 (all new)

## Accomplishments

- Pure `computeAdherenceScore` formula: notification_delivered=40, night_sky_activated=35, sleep_block_intact=25; null for no-shift days; deduplicates by type on same date
- `useScoreStore` with `recordEvent` (dedup guard), `finalizeDay` (idempotent, trims to 30), `weeklyScores` (7-day window, oldest→newest), `todayScore`
- 27 unit tests covering all formula cases and store behavior; full suite at 299 tests (was 272)

## Task Commits

1. **Task 1: adherence-calculator.ts — pure score formula** - `62e45b6` (feat)
2. **Task 2: score-store.ts — Zustand persist store** - `06f7875` (feat)

## Files Created/Modified

- `src/lib/adherence/adherence-calculator.ts` — Pure formula, no React/RN deps, AdherenceEvent/AdherenceEventType exports
- `src/store/score-store.ts` — Zustand store with persist, mirrors notification-store.ts pattern
- `__tests__/store/score-store.test.ts` — 27 tests covering formula (10) and store behavior (17)

## Decisions Made

- `pendingEvents` are never cleared after `finalizeDay` — they remain in state and are filtered by date at scoring time. This avoids the complexity of tracking which events have been consumed and keeps `recordEvent` idempotent across app restarts.
- `null` vs `0` distinction preserved throughout: `computeAdherenceScore` returns `null` when `hasSleepBlockOnDate=false`, and `weeklyScores` uses `found?.score ?? null` (not `?? 0`) so the chart can render no-shift days differently.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `useScoreStore` and `computeAdherenceScore` are ready for Plan 02 to wire into `RecoveryScoreCard` and `WeeklyTrendChart`
- `weeklyScores()` output shape `{day: string, score: number | null}[]` matches the existing chart component props
- `todayScore()` is ready to feed the card's primary display value

---
*Phase: 05-live-activities-recovery-score*
*Completed: 2026-04-02*
