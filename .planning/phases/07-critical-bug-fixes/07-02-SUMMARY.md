---
phase: 07-critical-bug-fixes
plan: 02
subsystem: ui
tags: [typescript, react-native, expo-router, zustand, healthkit, live-activity]

# Dependency graph
requires:
  - phase: 05-live-activities-recovery-score
    provides: live-activity-service.ts with LiveActivityState.score field
  - phase: 05-live-activities-recovery-score
    provides: score-store with todayScore() method
  - phase: 04-night-sky-mode-notifications
    provides: useNightSkyMode hook + startSleepActivity integration
  - phase: 01-foundation-onboarding
    provides: UserProfile type with commuteDuration and napPreference (boolean)
provides:
  - Zero TypeScript compilation errors (EAS build unblocked)
  - AdaptiveInsightCard shows real before/after plan differences via planSnapshot
  - Morning Dynamic Island transition includes today's recovery score
affects:
  - 07-01-critical-bug-fixes (shares circadian tab + settings screen)
  - EAS production build pipeline

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zustand imperative read inside useEffect: useScoreStore.getState() not useScoreStore hook"
    - "Expo Router typed routes: use 'as any' cast for group routes like /(onboarding)"
    - "UserProfile.napPreference is boolean: nap duration > 0 converts to true"
    - "SleepComparison.actual uses durationMinutes not totalHours — always divide by 60"
    - "ShiftEvent type annotations in implicit-any callbacks replace ReturnType<typeof useShiftsStore>['shifts']"

key-files:
  created: []
  modified:
    - "app/(tabs)/circadian.tsx"
    - "app/(tabs)/profile.tsx"
    - "app/(tabs)/settings.tsx"
    - "app/(tabs)/index.tsx"
    - "app/index.tsx"
    - "components/ExternalLink.tsx"
    - "src/hooks/useAdaptivePlan.ts"
    - "src/hooks/useNightSkyMode.ts"

key-decisions:
  - "BUG-05: planSnapshot (not currentPlan) passed as old-plan arg to computeDelta — enables real before/after delta for AdaptiveInsightCard"
  - "BUG-06: useScoreStore.getState().todayScore() called imperatively inside useEffect (not as hook) per Zustand pattern for effects"
  - "app/index.tsx dev seed data fixed: napPreference: true (boolean), commuteDuration: 15 (correct field name)"
  - "ExternalLink.tsx href cast to 'any' — standard Expo Router pattern for external URLs not in generated route union"
  - "settings.tsx napPreference saved as napMinutes > 0 (boolean conversion from stepper number)"

patterns-established:
  - "Zustand in useEffect: use Store.getState() not hook — avoids React hook call-order violations"
  - "SleepComparison: always access durationMinutes, never totalHours (field does not exist)"
  - "UserProfile: commuteDuration not commuteMinutes, napPreference is boolean"

requirements-completed: [BUG-04, BUG-05, BUG-06]

# Metrics
duration: 18min
completed: 2026-04-07
---

# Phase 07 Plan 02: TypeScript Errors, AdaptiveInsightCard Delta, and Dynamic Island Score Summary

**Zero TypeScript errors (was 13) via type annotations and field renames; AdaptiveInsightCard now diffs planSnapshot vs currentPlan; morning Dynamic Island includes today's recovery score from score-store**

## Performance

- **Duration:** 18 min
- **Started:** 2026-04-07T01:31:14Z
- **Completed:** 2026-04-07T01:49:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Eliminated all 13 TypeScript compilation errors across 6 files — EAS production build unblocked
- Fixed BUG-05: AdaptiveInsightCard's computeDelta now receives distinct old/new plans; AdaptiveInsightCard shows real schedule differences instead of "no changes"
- Fixed BUG-06: startSleepActivity now includes today's recovery score — morning Dynamic Island transition shows "Recovery: {score}/100"

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix all 13 TypeScript errors (BUG-04)** - `a709b67` (fix)
2. **Task 2: Fix AdaptiveInsightCard delta + Dynamic Island score (BUG-05, BUG-06)** - `41110e7` (fix)

**Plan metadata:** (created in final commit)

## Files Created/Modified
- `app/(tabs)/circadian.tsx` - Added ShiftEvent import; annotated 6 implicit-any callback params
- `app/(tabs)/profile.tsx` - Fixed totalHours→durationMinutes/60; router.push as any cast
- `app/(tabs)/settings.tsx` - Fixed commuteMinutes→commuteDuration; napPreference boolean conversion
- `app/(tabs)/index.tsx` - Fixed totalHours→durationMinutes/60 in recovery data computation
- `app/index.tsx` - Fixed dev seed data: napPreference boolean, commuteDuration field name
- `components/ExternalLink.tsx` - Cast href to any for external URL compatibility with typed routes
- `src/hooks/useAdaptivePlan.ts` - Destructures planSnapshot; uses it as old-plan arg in computeDelta
- `src/hooks/useNightSkyMode.ts` - Adds useScoreStore import; passes score to startSleepActivity

## Decisions Made
- BUG-05 fix is purely in useAdaptivePlan.ts — no changes to plan-store.ts needed because the snapshot is already saved correctly inside regeneratePlan() before plan overwrite
- BUG-06 uses imperative `useScoreStore.getState()` inside useEffect per established Zustand pattern (Phase 04 decision), not hook form
- app/index.tsx dev seed data also fixed as part of BUG-04 (was causing 2 of the 13 errors)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed dev seed data in app/index.tsx**
- **Found during:** Task 1 (TypeScript compilation check)
- **Issue:** `app/index.tsx` line 40: `napPreference: 20` (number) and `commuteMinutes: 15` (wrong field) caused 2 TS errors not in the plan's listed files
- **Fix:** Changed to `napPreference: true` and `commuteDuration: 15` to match UserProfile type
- **Files modified:** `app/index.tsx`
- **Verification:** `npx tsc --noEmit` returned zero errors after fix
- **Committed in:** a709b67 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in dev seed data)
**Impact on plan:** Required for zero-error goal. app/index.tsx was causing 2 of the 13 errors. Minimal scope expansion — dev-only seed data, no production logic changed.

## Issues Encountered
- Worktree branch was behind main by ~60 commits; files circadian.tsx and profile.tsx did not exist in the worktree. Merged main into worktree (no conflicts) before proceeding.

## Known Stubs
None — all bug fixes wire real data. No placeholder values introduced.

## Next Phase Readiness
- All TypeScript errors resolved — EAS build pipeline is unblocked
- AdaptiveInsightCard will now show meaningful before/after comparisons when adaptive brain regenerates the plan
- Morning Dynamic Island will display recovery score for shift workers
- Plan 07-01 (remaining BUG-01, BUG-02, BUG-03) can proceed in parallel or after this

---
*Phase: 07-critical-bug-fixes*
*Completed: 2026-04-07*
