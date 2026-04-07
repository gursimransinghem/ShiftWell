---
phase: 08-adaptive-brain-core
plan: 02
subsystem: ui
tags: [react-native, zustand, async-storage, healthkit, adaptive-brain, tdd]

# Dependency graph
requires:
  - phase: 08-01
    provides: plan-store adaptiveContext/debt, AdaptiveInsightCard, changeLog persistence

provides:
  - "runAdaptiveBrain() exported function with daily debounce gate (AsyncStorage 'adaptive-last-run')"
  - "SleepDebtCard conditional render gate: hidden when debt.severity='none' AND bankHours=0"
  - "6-test suite covering debounce skip/run/retry and BRAIN-02 14-night debt chain"

affects: [adaptive-brain, today-screen, healthkit-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Extracting async hook logic into exported functions for direct testability in node env"
    - "AsyncStorage date-key debounce pattern for daily-once operations"
    - "Store selector gate pattern: {showX && <Component />} reading adaptiveContext from plan-store"

key-files:
  created:
    - __tests__/hooks/useAdaptivePlan.test.ts
  modified:
    - src/hooks/useAdaptivePlan.ts
    - app/(tabs)/index.tsx

key-decisions:
  - "runAdaptiveBrain extracted as exported async function — hooks cannot be tested in node env (renderHook requires jsdom)"
  - "AsyncStorage setItem called AFTER setAdaptiveContext succeeds — failures retry on next foreground"
  - "showDebtCard fallback is true (not false) when adaptiveContext is null — card visible on first launch before HealthKit runs"
  - "plan-store mock uses minimal jest.fn() stubs — runAdaptiveBrain receives all deps via parameter injection, no store access needed"

patterns-established:
  - "Pattern: Extract hook async logic to runX(deps) for node-compatible TDD — hooks with useEffect cannot be rendered in Jest node env"
  - "Pattern: Debounce gate reads AsyncStorage first, returns early on date match, writes key only on full success"

requirements-completed:
  - BRAIN-01
  - BRAIN-02

# Metrics
duration: 20min
completed: 2026-04-07
---

# Phase 08 Plan 02: Adaptive Brain Debounce Gate + SleepDebtCard Gating Summary

**Daily debounce gate via AsyncStorage date-key prevents double-runs (BRAIN-01), and SleepDebtCard hides when debt.severity='none' and bankHours=0 with fallback-visible on first launch (BRAIN-02)**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-07T04:13:27Z
- **Completed:** 2026-04-07T04:33:00Z
- **Tasks:** 2 completed
- **Files modified:** 3

## Accomplishments

- Extracted `runAdaptiveBrain(deps)` as exported testable function with full daily debounce logic
- AsyncStorage `adaptive-last-run` key gates execution: skip if today's date matches, write only on success
- 14-night HealthKit history flows through `buildAdaptiveContext` -> `computeDebtLedger` -> `adaptiveContext.debt` (BRAIN-02 chain validated by test 6)
- SleepDebtCard conditionally rendered in Today screen via `showDebtCard` selector on `plan-store.adaptiveContext.debt`
- 6-test suite added; full suite now at 377 tests (up from 354 baseline), zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Daily debounce gate + tests** - `25ccbcb` (feat)
2. **Task 2: SleepDebtCard conditional render gate** - `63fa2ea` (feat)

## Files Created/Modified

- `src/hooks/useAdaptivePlan.ts` - Added `runAdaptiveBrain()` export, AsyncStorage debounce gate, `ADAPTIVE_LAST_RUN_KEY` constant, `AdaptiveBrainDeps` interface
- `__tests__/hooks/useAdaptivePlan.test.ts` - Created: 6 tests covering skip-today, run-null, run-yesterday, set-key-on-success, no-key-on-error, 14-night-history chain
- `app/(tabs)/index.tsx` - Added `debtContext` selector, `showDebtCard` gate, wrapped SleepDebtCard in conditional render

## Decisions Made

- **runAdaptiveBrain extracted as standalone function:** React hooks with `useEffect` cannot be rendered in Jest node environment. Extracting the core logic to a named function enables direct `await runAdaptiveBrain(deps)` testing without renderHook.
- **Fallback `showDebtCard = true` when context is null:** On first launch or when HealthKit is unavailable, `adaptiveContext` is null. Defaulting to visible ensures the card appears rather than being silently hidden.
- **AsyncStorage write after success:** Writing the date key only after full success means any error allows a retry on the next foreground transition.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed jest.mock TDZ hoisting in test file**
- **Found during:** Task 1 (GREEN phase)
- **Issue:** Original test had `mockGetState` referenced inside `jest.mock()` factory which is hoisted before variable initialization — `ReferenceError: Cannot access 'mockGetState' before initialization`
- **Fix:** Replaced complex `Object.assign(jest.fn(), { getState: mockGetState })` with minimal `jest.fn()` stubs since `runAdaptiveBrain` receives deps via parameters and never calls `usePlanStore` directly
- **Files modified:** `__tests__/hooks/useAdaptivePlan.test.ts`
- **Committed in:** 25ccbcb (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - test infrastructure bug)
**Impact on plan:** Single fix to test mock pattern, no scope change. All 6 planned tests pass.

## Issues Encountered

None beyond the mock hoisting issue (documented as deviation above).

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - both features are fully wired. `showDebtCard` reads real `adaptiveContext.debt` from plan-store which is populated by `runAdaptiveBrain` via the full HealthKit -> `buildAdaptiveContext` -> `computeDebtLedger` pipeline.

## Next Phase Readiness

- BRAIN-01 and BRAIN-02 complete — adaptive brain runs once daily, SleepDebtCard visibility is threshold-gated
- Phase 08 (adaptive-brain-core) is complete — plans 01 and 02 both done
- Ready for Phase 09 (TestFlight prep) or next milestone work

---
*Phase: 08-adaptive-brain-core*
*Completed: 2026-04-07*
