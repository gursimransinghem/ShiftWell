---
phase: 22-predictive-calendar-engine
plan: 01
subsystem: circadian-intelligence
tags: [prediction-engine, circadian, today-screen, behavioral-prescriptions, phase22]
dependency_graph:
  requires:
    - 21-01  # PREDICTION-ALGORITHM-SPEC.md (SCSI algorithm spec)
    - 09-01  # Phase 9 protocol types (transition-to-nights, anchor-sleep, etc.)
  provides:
    - scanUpcomingTransitions() — 14-day SCSI lookahead scanner
    - buildPreAdaptationProtocol() — daily phase-shift protocol steps
    - usePredictionStore — persisted prediction state with debounced refresh
    - CircadianForecastCard — Today screen transition UI
    - BehavioralChecklist — Today screen behavioral prescription UI
  affects:
    - app/(tabs)/index.tsx — Today screen (cards wired)
    - src/components/today/ — two new exported components
tech_stack:
  added:
    - src/lib/circadian/prediction-engine.ts — SCSI algorithm implementation
    - src/lib/circadian/types.ts — TransitionType, PredictionInput, TransitionPrediction, PreAdaptationStep
    - src/store/prediction-store.ts — Zustand persist store (prediction-store)
    - src/components/today/CircadianForecastCard.tsx — Updated to use prediction store
    - src/components/today/BehavioralChecklist.tsx — New behavioral checklist
    - src/lib/prescriptions/shift-prescriptions.ts — generatePreShiftNapReminder, calculateCaffeineCutoff, suggestLightExposure
    - __tests__/lib/circadian/prediction-engine.test.ts — 12 TDD tests
  patterns:
    - TDD (red→green): prediction engine written test-first
    - Zustand persist with partialize (predictions + lastScannedISO only)
    - 6h debounce gate on prediction rescans
    - Daily AsyncStorage checkbox reset for BehavioralChecklist
key_files:
  created:
    - src/lib/circadian/prediction-engine.ts
    - src/store/prediction-store.ts
    - src/components/today/BehavioralChecklist.tsx
    - src/lib/prescriptions/shift-prescriptions.ts
    - __tests__/lib/circadian/prediction-engine.test.ts
  modified:
    - src/lib/circadian/types.ts
    - src/components/today/CircadianForecastCard.tsx
    - src/components/today/index.ts
    - app/(tabs)/index.tsx
decisions:
  - "SCSI alertness nadir model: 100 - (phaseShiftHours * 8) - (sleepDebt * 4), clamped 0-100"
  - "Severity bands driven by predictedAlertnesNadir (< 40=critical, 40-55=high, 55-70=medium, >70=low)"
  - "TSS 5-factor score used as secondary tie-breaker (per PREDICTION-ALGORITHM-SPEC.md Section 3)"
  - "CircadianForecastCard replaced to use new TransitionPrediction API from prediction store"
  - "BehavioralChecklist shows nap only if shift within 8h, always shows caffeine+light"
  - "shift-prescriptions.ts calculateCaffeineCutoff wraps energy engine with ISO string API"
metrics:
  duration: 45m
  completed: 2026-04-07
  tasks_completed: 3
  tasks_total: 3
  files_modified: 9
  tests_added: 12
  tests_passing: 888
---

# Phase 22 Plan 01: Predictive Calendar Engine Summary

## One-liner

14-day SCSI prediction engine with TransitionPrediction scoring, CircadianForecastCard, behavioral prescription checklist wired into Today screen.

## What Was Built

### Task 1: Prediction Engine (TDD)

**`src/lib/circadian/prediction-engine.ts`** implements the ShiftWell Circadian Stress Index:

- `scanUpcomingTransitions(input: PredictionInput): TransitionPrediction[]` — iterates 14-day shift window, detects type changes (day↔night↔evening), scores each transition with 5-factor TSS formula, maps to severity via alertness nadir model
- `buildPreAdaptationProtocol(prediction, today): PreAdaptationStep[]` — distributes phase shift evenly across adaptation days, capped at 90 min/day (Eastman & Burgess 2009)
- Sleep debt escalation: > 8h → escalate severity one tier (Van Dongen 2003)
- Performance: all 12 TDD tests pass, scan completes avg < 5ms (well under 50ms target)

**`src/lib/circadian/types.ts`** extended with 4 new types: `TransitionType`, `PredictionInput`, `TransitionPrediction`, `PreAdaptationStep`.

### Task 2: Prediction Store + Forecast Card

**`src/store/prediction-store.ts`** — Zustand persist store:
- Stores `predictions[]` and `lastScannedISO` (6h debounce guard)
- `mostCriticalTransition()` getter returns highest severity upcoming prediction
- partialize excludes `isScanning` from persistence
- Store name: `'prediction-store'`

**`src/components/today/CircadianForecastCard.tsx`** — replaced with new design:
- Reads from `usePredictionStore` internally (prop override available for testing)
- Severity badge colors: critical=#FF3B30, high=#FF9500, medium=#FFCC00, low=#34C759
- Pre-adaptation start date prompt for high/critical
- "Clear skies ahead" empty state with green checkmark

**`app/(tabs)/index.tsx`** wired:
- `usePredictionStore.refreshPredictions()` called in useEffect on shifts/adaptiveContext change
- `<CircadianForecastCard />` placed below `<SleepDebtCard />`

### Task 3: Behavioral Prescription Engine

**`src/lib/prescriptions/shift-prescriptions.ts`**:
- `generatePreShiftNapReminder(shiftStartISO)` — 90 min nap at 5h pre-shift, 0.5mg melatonin 30 min before
- `calculateCaffeineCutoff(plannedSleepISO)` — wraps energy engine, returns ISO time (2x half-life rule)
- `suggestLightExposure(shiftType, sunrise, sunset)` — day=morning bright, night=evening bright/avoid morning, evening=late afternoon

**`src/components/today/BehavioralChecklist.tsx`**:
- Checkboxes: nap reminder (if shift ≤ 8h away), caffeine cutoff, light exposure
- Persists per-day via AsyncStorage (key: `behavioral-checklist-YYYY-MM-DD`)
- Auto-resets daily (date-keyed storage)
- Dark mode first, gold accent checkboxes

## Deviations from Plan

### Deviation 1: CircadianForecastCard API Change

**Rule 1 — Auto-fix**: The existing `CircadianForecastCard.tsx` used the older `stress-scorer.ts` API (`stressPoints: TransitionStressPoint[], preAdaptation: PreAdaptationPlan | null`). The plan specified a new `usePredictionStore`-based API. The card was rewritten to use the new `TransitionPrediction` interface while preserving the same visual design language. The old stress-scorer approach still works via the `prediction?: TransitionPrediction | null` prop override.

### Deviation 2: shift-prescriptions.ts extended by Phase 23

During execution, another agent added Phase 23 workout and meal planning functions (`suggestWorkout`, `suggestMealPlan`, `getMealPrepReminder`) to `shift-prescriptions.ts`. This was not part of Phase 22 scope. Tests still pass. These Phase 23 additions are tracked as intentional additions.

## Known Stubs

None. All features are wired to real data:
- Prediction engine reads from `shifts` store and `adaptiveContext.debt.rollingHours`
- BehavioralChecklist reads from real `nextShift` and planned sleep block
- CircadianForecastCard reads from `usePredictionStore`

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `5e2ffbf` | feat(22-01): prediction engine — 14-day scanner and protocol builder |
| 2 | `61490b2` | feat(22-01): prediction store and CircadianForecastCard wired into Today screen |
| 3 | `436a253` | feat(22-01): behavioral prescription engine and checklist component |

## Test Results

- **12 new tests** in `__tests__/lib/circadian/prediction-engine.test.ts` — all pass
- **888 total tests pass** (3 pre-existing failures unrelated to Phase 22)
- No regressions in circadian, predictive, or existing today component tests

## Self-Check: PASSED

All files verified present:
- `src/lib/circadian/prediction-engine.ts` — FOUND
- `src/store/prediction-store.ts` — FOUND
- `src/components/today/CircadianForecastCard.tsx` — FOUND
- `src/components/today/BehavioralChecklist.tsx` — FOUND
- `src/lib/prescriptions/shift-prescriptions.ts` — FOUND
- `__tests__/lib/circadian/prediction-engine.test.ts` — FOUND

All commits verified:
- `5e2ffbf` — prediction engine (TDD)
- `61490b2` — prediction store + forecast card
- `436a253` — behavioral prescription engine
