---
phase: 33-apple-watch-integration
plan: "01"
subsystem: healthkit-hrv
tags: [hrv, apple-watch, recovery-score, biometrics, sleep-apnea]
dependency_graph:
  requires: [32-01]
  provides: [hrv-processor, hrv-reader, score-store-hrv, biometric-reader-apnea]
  affects: [score-store, today-screen, recovery-display]
tech_stack:
  added: [src/lib/hrv/hrv-processor.ts, src/lib/hrv/__tests__/hrv-processor.test.ts]
  patterns: [zustand-async-enrichment, tdd-red-green, biometric-null-safety]
key_files:
  created:
    - src/lib/hrv/hrv-processor.ts
    - src/lib/hrv/__tests__/hrv-processor.test.ts
  modified:
    - src/lib/healthkit/hrv-reader.ts
    - src/store/score-store.ts
    - src/lib/healthkit/biometric-reader.ts
    - jest.config.js
decisions:
  - "finalizeDay stays synchronous for backward compat; HRV enrichment is separate async finalizeWithHRV()"
  - "DailyScore.hrv_score is optional (not required) — preserves existing test fixtures"
  - "buildHRVWeights uses 0.50/0.45/0.00/0.05 for no-HRV case (not 0.55/0.40/0.05) to sum to 1.0"
  - "biometric-reader uses string literals for iOS 18+ identifiers (sleepApneaEvent, breathingDisturbances)"
metrics:
  duration: "12 minutes"
  completed: "2026-04-07"
  tasks: 3
  files: 6
---

# Phase 33 Plan 01: Apple Watch HRV Integration — Core Algorithm Summary

HRV processor, reader, and score-store integration using BIOMETRIC-ALGORITHM-SPEC.md deviation-based formula with 14-night calibration and dynamic weight redistribution (40/30/25/5 with HRV, 50/45/0/5 without).

## What Was Built

### Task 1: HRV Processor and Reader Modules (TDD)

**`src/lib/hrv/hrv-processor.ts`** — core algorithm:
- `calculateHRVScore(rmssd, baseline)`: deviation-based score, anchor at 70 for baseline, ±30% = ±30 points, clamped [0, 100]
- `shouldIncludeHRV(available, days, transition)`: 3-gate guard — Apple Watch paired + 14+ nights + no transition
- `updateBaseline(values, newValue, maxDays=30)`: FIFO rolling window, returns updated array and mean
- `buildHRVWeights(available, days)`: dynamic weight redistribution per BIOMETRIC-ALGORITHM-SPEC.md §3.1

**`src/lib/hrv/__tests__/hrv-processor.test.ts`** — 28 unit tests (TDD RED→GREEN):
- `calculateHRVScore`: 9 tests covering boundary values, clamping, and score mapping
- `shouldIncludeHRV`: 7 tests covering all gate combinations
- `updateBaseline`: 6 tests covering rolling window, max days, and mean computation
- `buildHRVWeights`: 6 tests covering weight sums and day boundary at 14

**`src/lib/healthkit/hrv-reader.ts`** — added `fetchOvernightHRV(sleepWindowStart, sleepWindowEnd)`:
- Queries HealthKit `heartRateVariabilitySDNN` for explicit sleep window
- Returns null if fewer than 3 samples (outlier rejection per BIOMETRIC-ALGORITHM-SPEC §5.3)
- Never throws — all errors return null

### Task 2: Score-Store HRV Integration

**`src/store/score-store.ts`** updated with:
- HRV state fields: `overnightSDNN`, `personalHRVBaseline`, `hrvBaselineValues`, `hrvBaselineDays`, `hrv_available`, `hrv_score`, `hrv_calibrating`, `hrv_calibration_progress`, `hrv_suppressed_transition`
- Sleep quality suppression fields: `sleepQualitySuppressed`, `sleepQualityScreeningMessage`
- `finalizeDay()` remains synchronous (backward compatible — 27 existing tests pass)
- `finalizeWithHRV(dateISO, opts?)` is the new async enrichment function:
  - Checks circadian transition state from plan-store
  - Fetches HRV from HealthKit using sleep window from plan-store
  - Updates rolling 30-day baseline (frozen during transitions per spec §4.2)
  - Recomputes recovery score with dynamic weights when HRV is active
  - Handles sleep apnea/breathing disturbance suppression
- All HRV baseline fields persisted to AsyncStorage

### Task 3: Sleep Apnea and Breathing Disturbance Readers

**`src/lib/healthkit/biometric-reader.ts`** extended with:
- `fetchSleepApneaEvents(start, end)`: queries `HKCategoryTypeIdentifierSleepApneaEvent` (iOS 18+, Watch S9+), returns count or null
- `fetchBreathingDisturbances(start, end)`: queries `HKQuantityTypeIdentifierAppleSleepingBreathingDisturbances` (iOS 18+), returns rate/hr or null
- `shouldSuppressSleepQuality(apneaCount, disturbanceRate)`: returns true when apnea > 0 OR disturbances > 10/hr
- All three functions wrapped in try/catch for older iOS graceful degradation

Clinical screening message when suppressed: "Your sleep data suggests possible breathing disruptions. Sleep apnea is common in shift workers. Consider discussing with your doctor."

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Merge conflict in jest.config.js**
- **Found during:** Task 1 setup
- **Issue:** `jest.config.js` had a `<<<<<<< HEAD` / `>>>>>>> worktree-agent-a8e6a3d4` conflict blocking all tests
- **Fix:** Resolved by keeping the HEAD version (setupFiles + full roots covering all test directories)
- **Files modified:** `jest.config.js`
- **Commit:** `0b8e88b`

**2. [Rule 1 - Bug] finalizeDay async-incompatible with existing tests**
- **Found during:** Task 2
- **Issue:** Making `finalizeDay` async breaks 27 existing tests that call it synchronously and check state immediately
- **Fix:** Split into `finalizeDay` (sync, backward-compatible) and `finalizeWithHRV` (async, new enrichment). The plan's `finalizeDay` action was renamed to `finalizeWithHRV` to preserve the synchronous contract. Both are wired: `finalizeDay` writes the immediate adherence score, callers can then call `finalizeWithHRV` for HRV enrichment.
- **Files modified:** `src/store/score-store.ts`
- **Commit:** `45f3e0a`

**3. [Rule 2 - Missing] DailyScore.hrv_score must be optional**
- **Found during:** Task 2
- **Issue:** Making `hrv_score` required would fail all test fixtures that create `{ dateISO, score }` DailyScore objects
- **Fix:** Changed to `hrv_score?: number | null` (optional field)
- **Files modified:** `src/store/score-store.ts`

**4. [Rule 3 - Blocking] weight sum in buildHRVWeights**
- **Found during:** Task 1 test writing
- **Issue:** BIOMETRIC-ALGORITHM-SPEC says no-HRV weights are 0.55/0.40/0.05 = 1.00 — but this is the OLD formula from §1.1. The spec §3.1 adds transition=0.05 as a 4th component. 0.55+0.40+0.05+0.05 = 1.05 ≠ 1.0. The plan notes this fix: "adherence=0.50, debt=0.45, transition=0.05"
- **Fix:** No-HRV weights: adherence=0.50, debt=0.45, hrv=0.00, transition=0.05 (sum = 1.0)
- **Commit:** `0b8e88b`

## Test Results

| Suite | Tests | Status |
|-------|-------|--------|
| src/lib/hrv/__tests__/hrv-processor.test.ts | 28 | PASS |
| __tests__/store/score-store.test.ts | 27 | PASS |
| Full suite (pre-existing baseline) | 908 | 907 pass, 1 fail (pre-existing) |

Pre-existing failures (not caused by this plan): 8 test suites with merge conflicts in weekly-brief-generator.test.ts, settings.tsx, and 6 other files from other worktree agents.

## Known Stubs

- `debt_score = 60` in `finalizeWithHRV()` — hardcoded placeholder for sleep debt component. Full debt engine is wired from adaptive context (Phase 15 feedback engine). This only affects the HRV-weighted score, not the base adherence score from `finalizeDay()`.
- `transition_score = inCircadianTransition ? 70 : 100` — simplified penalty. Exact protocol-driven score deferred to future phase.

These stubs do not prevent Plan 01's goal (HRV algorithm infrastructure) — they are in `finalizeWithHRV` which is the async enrichment path.

## Self-Check: PASSED

- src/lib/hrv/hrv-processor.ts: FOUND
- src/lib/hrv/__tests__/hrv-processor.test.ts: FOUND
- src/lib/healthkit/hrv-reader.ts: FOUND
- src/store/score-store.ts: FOUND
- src/lib/healthkit/biometric-reader.ts: FOUND
- Commit 0b8e88b (Task 1): FOUND
- Commit 45f3e0a (Task 2): FOUND
- Commit 22e6a62 (Task 3): FOUND
