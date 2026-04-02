---
phase: 05-live-activities-recovery-score
plan: 03
subsystem: notifications
tags: [live-activities, expo-notifications, ActivityKit, night-sky-mode, stub]

# Dependency graph
requires:
  - phase: 04-night-sky-mode-notifications
    provides: useNightSkyMode hook, NightSkyModeData shape, expo-notifications wired in _layout.tsx

provides:
  - live-activity-service.ts stub with full API surface (startSleepActivity, updateSleepActivity, endSleepActivity, LiveActivityState)
  - LIVE_ACTIVITIES_AVAILABLE guard separating Expo Go from EAS Build paths
  - Pre-scheduled three-transition notification fallback (wind-down, sleep, morning)
  - useNightSkyMode wired to call startSleepActivity on activation and endSleepActivity on deactivation

affects:
  - Phase 06 (any recovery score display that feeds into morning transition)
  - Future ActivityKit swap-in (single-file replacement in live-activity-service.ts)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "LIVE_ACTIVITIES_AVAILABLE guard pattern: Constants.appOwnership !== 'expo' && typeof global.__LIVE_ACTIVITY_NATIVE_MODULE__ !== 'undefined'"
    - "TimeIntervalTriggerInput with SchedulableTriggerInputTypes.TIME_INTERVAL for second-based scheduling"
    - "Pre-schedule all transitions in startSleepActivity (D-04) rather than updating incrementally"

key-files:
  created:
    - src/lib/adherence/live-activity-service.ts
  modified:
    - src/hooks/useNightSkyMode.ts

key-decisions:
  - "Live Activity trigger type uses SchedulableTriggerInputTypes.TIME_INTERVAL (not DateTriggerInput) — seconds-based scheduling matches the stub pattern; date-based used for actual scheduled notifications in notification-service.ts"
  - "useMemo return refactored from direct return to const data = useMemo(...) + return data — required to add useEffect side effect after memo computation"
  - "useEffect dependency is [data.isActive] only — avoids re-triggering service calls on unrelated plan/schedule changes"

patterns-established:
  - "Stub guard pattern: LIVE_ACTIVITIES_AVAILABLE isolates native code path — Expo Go safe, EAS Build ready"
  - "All three transition notifications pre-scheduled at startSleepActivity call time (D-04 pattern)"

requirements-completed:
  - LIVE-01
  - LIVE-02
  - LIVE-03

# Metrics
duration: 4min
completed: 2026-04-02
---

# Phase 05 Plan 03: Live Activity Service Stub Summary

**expo-notifications fallback for ActivityKit with correct API surface: startSleepActivity pre-schedules three transitions (wind-down/sleep/morning), wired to Night Sky Mode activation via useNightSkyMode useEffect**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-02T14:10:09Z
- **Completed:** 2026-04-02T14:13:52Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `src/lib/adherence/live-activity-service.ts` with the full expo-widgets-compatible API surface (startSleepActivity, updateSleepActivity, endSleepActivity, LiveActivityState interface)
- LIVE_ACTIVITIES_AVAILABLE guard ensures native ActivityKit code never runs in Expo Go — only in EAS development/production builds (Pitfall 4)
- All three sleep cycle transitions pre-scheduled in a single startSleepActivity call: wind-down fires immediately, sleep fires at bedtimeISO, morning fires at wakeTimeISO (D-04 pattern)
- useNightSkyMode now calls startSleepActivity on isActive false→true transition and endSleepActivity on true→false, using useEffect from react (not reanimated — per Phase 04 decision)
- All 299 tests pass with no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: live-activity-service.ts stub with notification fallback** - `afb80b8` (feat)
2. **Task 2: Wire Live Activity start/end to useNightSkyMode** - `a05312f` (feat)

## Files Created/Modified

- `src/lib/adherence/live-activity-service.ts` — Live Activity stub: LIVE_ACTIVITIES_AVAILABLE guard, notification fallback for all three transitions, correct API surface for future ActivityKit swap-in
- `src/hooks/useNightSkyMode.ts` — Added import of startSleepActivity/endSleepActivity, refactored useMemo to const+return, added useRef+useEffect for isActive transition detection

## Decisions Made

- Trigger type `SchedulableTriggerInputTypes.TIME_INTERVAL` used for second-based scheduling in stub; this differs from notification-service.ts which uses `DateTriggerInput` for absolute times — both are correct for their use cases
- `useMemo` return changed to `const data = ...` + `return data` to enable adding useEffect side effect after computation without breaking hook rules
- `[data.isActive]` as sole useEffect dependency — avoids redundant service calls when unrelated plan fields change

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript trigger type — `{ seconds: N }` not assignable to NotificationTriggerInput**
- **Found during:** Task 1 (live-activity-service.ts creation)
- **Issue:** Plan code used bare `{ seconds: 1 }` trigger objects. expo-notifications requires `{ type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: N }` — the plan's code snippet predated the typed API
- **Fix:** Added `type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL` to all four trigger objects in the file
- **Files modified:** src/lib/adherence/live-activity-service.ts
- **Verification:** `npx tsc --noEmit` — no errors on live-activity-service.ts
- **Committed in:** afb80b8 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — TypeScript type correction)
**Impact on plan:** Required for compilation. API behavior unchanged, trigger semantics identical.

## Issues Encountered

None beyond the trigger type fix above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Live Activity API surface is complete and test-safe — any future plan can import startSleepActivity/updateSleepActivity/endSleepActivity without modification
- Real ActivityKit swap-in requires: Xcode installed, EAS Build configured, Swift widget target created — all blocked on LLC/Apple Dev enrollment (Sim handling in parallel)
- Phase 06 (recovery score) can call updateSleepActivity with score when morning transition fires

---
*Phase: 05-live-activities-recovery-score*
*Completed: 2026-04-02*
