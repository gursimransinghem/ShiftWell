---
phase: 03-sleep-plan-generation
plan: "01"
subsystem: plan-store + calendar-write
tags: [plan-generation, calendar-write, circadian-reset, zustand, debounce, tdd]
dependency_graph:
  requires:
    - 02-calendar-sync (calendar-store eventIdMap, writeSleepBlock/updateSleepBlock/deleteSleepBlock)
    - src/lib/circadian/index (generateSleepPlan)
    - src/store/shifts-store (recalculationNeeded, markRecalculationNeeded)
  provides:
    - writeChangedBlocks (diff-based calendar sync for all 8 block types)
    - usePlanStore.lastResetAt (Circadian Reset marker)
    - recalculationNeeded subscription (auto-triggers plan regeneration)
  affects:
    - src/store/plan-store.ts (extended with calendar write-back + Circadian Reset)
    - src/lib/calendar/plan-write-service.ts (new service)
tech_stack:
  added: []
  patterns:
    - Diff-based calendar sync by block ID (prevents event flickering)
    - Module-level debounce timer (500ms) for rapid recalculation bursts
    - Non-blocking calendar write-back (.catch() pattern — plan never fails from calendar errors)
    - Inverse eventIdMap build (planBlockId -> calEventId) at start of writeChangedBlocks
key_files:
  created:
    - src/lib/calendar/plan-write-service.ts
    - __tests__/store/plan-store.test.ts
  modified:
    - src/store/plan-store.ts
decisions:
  - plan-write-service handles all 8 SleepBlockType values — calendar-service.ts only handles main-sleep/nap (D-04 two-tier write preserved)
  - recalculationNeeded cleared BEFORE debouncedRegenerate to prevent subscription loop (Pitfall 2)
  - writeChangedBlocks builds inverse map (planId->calEventId) from eventIdMap to avoid O(n^2) lookups (Pitfall 1)
  - Non-blocking calendar write: errors logged to console.warn, plan state is always set first
  - Unchanged blocks not deleted/recreated — blockChanged() detects time-shift only (anti-flicker, PLAN-06)
metrics:
  duration: 5min
  completed_date: "2026-04-02"
  tasks_completed: 2
  files_changed: 3
---

# Phase 03 Plan 01: Plan-Store Calendar Write-Back and Circadian Reset Summary

**One-liner:** Wired plan-store to diff-based Apple Calendar write-back (all 8 block types) with 500ms debounced Circadian Reset subscription consuming shifts-store.recalculationNeeded.

## What Was Built

### src/lib/calendar/plan-write-service.ts (new — 155 lines)

- `buildPlanBlockTitle(block)` — formats calendar event titles for all 8 SleepBlockType values (main-sleep, nap, wind-down, wake, caffeine-cutoff, meal-window, light-seek, light-avoid)
- `writePlanBlock(block, calendarId)` — creates a calendar event for any block type via ExpoCalendar.createEventAsync; priority 1 blocks get a -15min alarm
- `blockChanged(a, b)` — detects start/end time differences between two versions of the same block
- `writeChangedBlocks(oldPlan, newPlan, calStore)` — full diff+sync: deletes removed blocks, creates new ones, updates changed ones. Unchanged blocks are left alone (no flicker). Best-effort: per-block errors logged, sync continues.

### src/store/plan-store.ts (extended)

- Added `lastResetAt: Date | null` to PlanState — set when a Circadian Reset triggered regeneration
- `regeneratePlan` is now `async` and accepts `opts?: { isCircadianReset?: boolean }`
- After successful `generateSleepPlan()`, calls `writeChangedBlocks(oldPlan, plan, calStore)` non-blocking
- New module-level `debouncedRegenerate(opts, ms=500)` with clearTimeout pattern
- New Zustand subscription on `recalculationNeeded`: clears flag first, then calls `debouncedRegenerate({ isCircadianReset: true })`

### __tests__/store/plan-store.test.ts (new — 240 lines)

6 tests covering PLAN-01 through PLAN-04 and PLAN-06:
1. PLAN-01: generateSleepPlan called with correct shifts + profile
2. PLAN-02: writeChangedBlocks called with new plan + calendarStore after regeneratePlan
3. PLAN-03: commuteDuration=45 passes through to algorithm
4. PLAN-04: off-day produces no priority-1 main-sleep block
5. PLAN-06: recalculationNeeded triggers regeneration + clears flag + sets lastResetAt
6. PLAN-06: debounce — 3 rapid changes → 1 generateSleepPlan call

## Test Results

- 237 existing tests (unchanged) + 6 new tests = 243 total — all pass
- TypeScript errors in settings.tsx (lines 368-375) are pre-existing, unrelated to this plan

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test setup subscription interference**

- **Found during:** Task 1 (RED) to Task 2 (GREEN) transition
- **Issue:** Zustand store subscriptions fire during `beforeEach` `setState` calls, contaminating mock call counts for tests checking `generateSleepPlan` call count (toHaveBeenCalledTimes(1))
- **Fix:** Restructured `beforeEach` to call `jest.clearAllMocks()` AFTER all store resets, then reset `plan: null` one more time to discard any subscription-triggered plan set during setup
- **Files modified:** `__tests__/store/plan-store.test.ts`
- **Impact:** Tests PLAN-01, PLAN-03 also updated to use `setState` + `clearAllMocks` inline before the explicit `regeneratePlan` call, ensuring exactly 1 mock call per test

### Pre-existing Issues Deferred

- `app/(tabs)/settings.tsx:368-375` TypeScript errors (`lastSyncedAt`, `pendingCount` on `Promise<SyncStatus>`) — pre-existing, unrelated to this plan. Logged to deferred-items.

## Self-Check: PASSED

- FOUND: src/lib/calendar/plan-write-service.ts
- FOUND: src/store/plan-store.ts
- FOUND: __tests__/store/plan-store.test.ts
- FOUND commit: 7230f83 (TDD RED test scaffold)
- FOUND commit: 10f2042 (implementation + GREEN)
- All 243 tests pass
