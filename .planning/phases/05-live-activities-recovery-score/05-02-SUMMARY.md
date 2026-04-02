---
phase: 05-live-activities-recovery-score
plan: 02
subsystem: ui
tags: [recovery-score, zustand, healthkit, today-screen, adherence]

# Dependency graph
requires:
  - phase: 05-01
    provides: useScoreStore (todayScore, weeklyScores), score-store.ts
affects:
  - app/(tabs)/index.tsx — Today screen recovery section now shows without Apple Watch
  - src/hooks/useRecoveryScore.ts — extended with non-HealthKit adherence path

provides:
  - RecoveryScoreCard visible without HealthKit (adherenceScore fallback)
  - WeeklyTrendChart visible without HealthKit (adherenceDailyScores fallback)
  - showRecovery gate no longer requires isAvailable

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useScoreStore.getState() inside useCallback — safe Zustand imperative accessor pattern"
    - "Fallback chain: HK weeklyAccuracy -> HK lastNight -> adherenceScore (non-HK)"
    - "Chart fallback: HK dailyScores.length > 0 ? HK : adherenceDailyScores"

key-files:
  created: []
  modified:
    - src/hooks/useRecoveryScore.ts
    - app/(tabs)/index.tsx

key-decisions:
  - "showRecovery gate removes isAvailable requirement — score visible without Apple Watch (SCORE-02)"
  - "adherenceScore and adherenceDailyScores populated before HealthKit guard — always runs regardless of HK availability"
  - "WeeklyTrendChart prefers HealthKit dailyScores when non-empty — no regression for HK users"

# Metrics
duration: 2min
completed: 2026-04-02
---

# Phase 5 Plan 02: Today Screen Recovery Score Wire-Up Summary

**useRecoveryScore extended with score-store adherence fallback — Today screen shows recovery score without Apple Watch**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-02T14:17:21Z
- **Completed:** 2026-04-02T14:19:23Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Extended `useRecoveryScore` with `adherenceScore` and `adherenceDailyScores` fields sourced from `useScoreStore.getState()` — non-HealthKit primary path for v1.0
- Relaxed `showRecovery` gate in `app/(tabs)/index.tsx` — removed `recovery.isAvailable` requirement; score now shows when `adherenceScore !== null`
- `RecoveryScoreCard` score prop adds `recovery.adherenceScore` as final fallback in chain
- `WeeklyTrendChart` falls back to `adherenceDailyScores` when HealthKit `dailyScores` is empty
- All 27 existing score-store tests pass; TypeScript clean across both modified files

## Task Commits

1. **Task 1: Extend useRecoveryScore with non-HealthKit adherence fallback** - `ed3cb41` (feat)
2. **Task 2: Relax showRecovery gate + wire adherence data to display** - `72f777e` (feat)

## Files Created/Modified

- `src/hooks/useRecoveryScore.ts` — New fields `adherenceScore`, `adherenceDailyScores`; import `useScoreStore`; `.getState()` call in `fetchData` before HealthKit guard
- `app/(tabs)/index.tsx` — `showRecovery` gate drops `isAvailable`; `RecoveryScoreCard` score chain adds adherence fallback; `WeeklyTrendChart` uses `adherenceDailyScores` when HK data absent

## Decisions Made

- `useScoreStore.getState()` is used rather than the React hook — this is correct inside `useCallback` (no Rules of Hooks violation; the imperative accessor bypasses React's subscription model as intended by Zustand's design)
- Non-HealthKit values are populated *before* the `if (!hkAvailable || !plan)` early-return so they are always set even when HealthKit is unavailable

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. `adherenceScore` and `adherenceDailyScores` are wired to live store data via `useScoreStore.getState()`. The score-store was populated in Plan 01. No placeholder values flow to the UI.

## Issues Encountered

- Worktree branch `worktree-agent-a66c0987` was behind `main` (missing Plan 01 commits). Resolved with `git merge main` (fast-forward) before executing tasks. This is expected parallel-agent behavior, not a defect.

## User Setup Required

None.

## Next Phase Readiness

- Plan 02 closes SCORE-02: Recovery Score visible on Today screen without Apple Watch
- Plan 03 (Live Activity stub) is already complete per STATE.md — phase 05 is fully executed
- SCORE-01, SCORE-02, SCORE-03 all satisfied

---
*Phase: 05-live-activities-recovery-score*
*Completed: 2026-04-02*

## Self-Check: PASSED

- FOUND: src/hooks/useRecoveryScore.ts
- FOUND: app/(tabs)/index.tsx
- FOUND: .planning/phases/05-live-activities-recovery-score/05-02-SUMMARY.md
- FOUND commit: ed3cb41 (Task 1)
- FOUND commit: 72f777e (Task 2)
