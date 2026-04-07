---
phase: 14-healthkit-sleep-ingestion
plan: 01
subsystem: healthkit
tags: [healthkit, sleep-ingestion, feedback-engine, biometrics, adaptive-brain]
dependency_graph:
  requires:
    - "13-01: ALGORITHM-SPEC.md (accuracy thresholds, dead zone, asleepStart requirement)"
    - "08-02: useAdaptivePlan runAdaptiveBrain function (extended in this plan)"
  provides:
    - "getSleepHistoryForRange: 30-night HealthKit ingestion with asleepStart filter"
    - "discrepancyHistory: SleepComparison[] persisted in plan-store"
    - "biometric-reader: fetchOvernightHRV, fetchRestingHeartRate, fetchSleepingWristTemperature, fetchDailyStepCount, detectDeviceTier"
  affects:
    - "15-algorithm-feedback-engine: consumes discrepancyHistory for EMA convergence"
tech_stack:
  added:
    - "src/lib/healthkit/biometric-reader.ts (new module)"
  patterns:
    - "Zustand persist partialize: discrepancyHistory added to persisted keys"
    - "TDD RED-GREEN: failing tests written before implementation"
    - "Graceful HealthKit fallback: all functions return null/[] on unavailable HK, never throw"
key_files:
  created:
    - "src/lib/healthkit/biometric-reader.ts"
    - "__tests__/lib/healthkit/sleep-ingestion.test.ts"
    - "__tests__/lib/healthkit/biometric-reader.test.ts"
  modified:
    - "src/lib/healthkit/healthkit-service.ts"
    - "src/store/plan-store.ts"
    - "src/hooks/useAdaptivePlan.ts"
    - "src/types/healthkit.d.ts"
    - "__mocks__/healthkit.js"
    - "__tests__/store/plan-store.test.ts"
    - "__tests__/hooks/useAdaptivePlan.test.ts"
decisions:
  - "asleepStart used (not inBedStart) for feedback timing per Phase 13 research — removes 10-30 min pre-sleep latency from deviation signal"
  - "discrepancyHistory added to zustand persist partialize — survives app restart for Phase 15 feedback engine"
  - "biometric-reader created as separate module from hrv-reader — different interface (sleepStart/sleepEnd inputs vs date-based, Phase 14 contract)"
  - "SleepPlan.blocks used to find planned main-sleep block by date — SleepPlan has no .days property"
  - "detectDeviceTier uses opportunistic data presence check — HRV samples = Watch present, temperature samples = Series 8+"
  - "fetchDailyStepCount returns 0 (not null) — absent step data treated as zero activity not missing signal"
metrics:
  duration: "8 minutes"
  completed_date: "2026-04-07"
  tasks: 4
  files_modified: 9
  tests_added: 34
  tests_total: 778
---

# Phase 14 Plan 01: HealthKit Data Foundation Summary

**One-liner:** 30-night HealthKit sleep ingestion with SleepComparison discrepancy history persisted in plan-store, plus biometric readers (overnight HRV, resting HR, wrist temp, step count) with device-tier detection.

## What Was Built

### Task 1: getSleepHistoryForRange + plan-store discrepancyHistory

Added `getSleepHistoryForRange(nights: number = 30)` to `healthkit-service.ts`:
- Calls `getSleepHistory` with a capped 30-night range
- Filters records to those with `asleepStart !== null` (Phase 13 requirement: use sleep onset, not in-bed time)
- Returns `[]` when HealthKit unavailable — never throws

Extended `plan-store.ts` with:
- `discrepancyHistory: SleepComparison[]` — persisted via zustand `partialize`
- `setDiscrepancyHistory(history)` — replaces history, sliced to 30 records
- `appendDiscrepancy(comparison)` — appends single comparison, auto-trims to 30

Tests: 14 tests covering HK availability fallback, store slice behavior, null actual handling.

### Task 2: Wire discrepancy history into useAdaptivePlan

Extended `runAdaptiveBrain` in `useAdaptivePlan.ts`:
- Added `setDiscrepancyHistory` to `AdaptiveBrainDeps` interface
- After `setAdaptiveContext` is called, fetches 30-night history via `getSleepHistoryForRange(30)`
- For each HealthKit record, finds the planned `main-sleep` block by matching date
- Calls `comparePlannedVsActual(plannedBlock, record)` to produce `SleepComparison`
- Calls `setDiscrepancyHistory(comparisons)` with all comparisons
- Guard: `if (planForComparison && thirtyNightHistory.length > 0)` — null plan on first launch doesn't crash
- Empty `setDiscrepancyHistory([])` when no HK data (feedback engine pauses cleanly)

Extended `useAdaptivePlan.test.ts`: 4 new tests (10 total, 6 Phase 8 tests all pass).

### Task 3: Full regression check

Full suite confirmed passing after deviation fix: `plan-store.test.ts` BRAIN-06-05 test expected the old partialize keys list and needed `discrepancyHistory` added. Fixed and all 758 tests passed before Task 4.

### Task 4: Biometric Readers + Device-Tier Detection

Created `src/lib/healthkit/biometric-reader.ts`:
- `fetchOvernightHRV(sleepStart, sleepEnd)` — mean SDNN (ms) from sleep window, null fallback
- `fetchRestingHeartRate(date)` — Apple daily resting HR, returns latest sample, null fallback
- `fetchSleepingWristTemperature(sleepStart, sleepEnd)` — delta Celsius from baseline, null on unsupported device (try/catch for Series 8+ identifier)
- `fetchDailyStepCount(date)` — sums step samples, returns 0 (not null) when unavailable
- `detectDeviceTier()` — opportunistic tier detection: 'iphone-only' | 'watch-basic' | 'watch-advanced'

Updated `requestAuthorization()` to include `heartRateVariabilitySDNN`, `restingHeartRate`, `appleSleepingWristTemperature`, `stepCount`.

Updated `healthkit.d.ts` with new `QuantityTypeIdentifier` enum values.
Updated `__mocks__/healthkit.js` with new identifier strings.

20 new biometric-reader tests. All 778 tests pass.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] SleepPlan has no .days property**
- **Found during:** Task 2 implementation
- **Issue:** Plan action used `currentPlan.days?.find(...)` pattern, but `SleepPlan` has `blocks: PlanBlock[]` not a `days` array
- **Fix:** Used `currentPlan.blocks.find(b => b.type === 'main-sleep' && format(b.start) === nightDateISO)` to locate the planned sleep window
- **Files modified:** `src/hooks/useAdaptivePlan.ts`

**2. [Rule 1 - Bug] plan-store.test.ts partialize key assertion regression**
- **Found during:** Task 3 full test suite run
- **Issue:** BRAIN-06-05 test asserted exact partialize key set without `discrepancyHistory` — caused 1 test failure
- **Fix:** Updated assertion to include `discrepancyHistory` in the expected key set
- **Files modified:** `__tests__/store/plan-store.test.ts`
- **Commit:** 0c9bfd2

**3. [Rule 2 - Missing functionality] HealthKit type declarations incomplete**
- **Found during:** Task 4 TypeScript compilation
- **Issue:** `healthkit.d.ts` only declared `heartRate` and `heartRateVariabilitySDNN` — the three new biometric identifiers would have caused TypeScript errors
- **Fix:** Added `restingHeartRate`, `appleSleepingWristTemperature`, and `stepCount` to `QuantityTypeIdentifier` enum
- **Files modified:** `src/types/healthkit.d.ts`, `__mocks__/healthkit.js`

## Known Stubs

None. All functions are fully implemented. `discrepancyHistory` is populated from real HealthKit data (when available) and persists to AsyncStorage. The Phase 15 feedback engine will consume it directly from the store.

## Self-Check: PASSED

All key files found:
- src/lib/healthkit/healthkit-service.ts: FOUND
- src/store/plan-store.ts: FOUND
- src/hooks/useAdaptivePlan.ts: FOUND
- __tests__/lib/healthkit/sleep-ingestion.test.ts: FOUND
- src/lib/healthkit/biometric-reader.ts: FOUND
- __tests__/lib/healthkit/biometric-reader.test.ts: FOUND

All commits verified:
- 36ef8d3 (Task 1 — getSleepHistoryForRange + plan-store discrepancyHistory): FOUND
- bab4e80 (Task 2 — useAdaptivePlan discrepancy wiring): FOUND
- 0c9bfd2 (Task 3 — regression fix for plan-store.test.ts): FOUND
- 8c4b337 (Task 4 — biometric-reader.ts): FOUND

Full test suite: 778 tests passing, 0 failing, 55 suites.
