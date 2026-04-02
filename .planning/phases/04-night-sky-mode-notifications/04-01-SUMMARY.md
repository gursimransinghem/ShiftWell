---
phase: 04-night-sky-mode-notifications
plan: 01
subsystem: testing
tags: [jest, expo-notifications, react-native-svg, zustand, async-storage]

# Dependency graph
requires:
  - phase: 03-sleep-plan-generation
    provides: notification-service.ts stub and plan-store structure used as reference
provides:
  - Jest mock for expo-notifications (scheduleNotificationAsync, SchedulableTriggerInputTypes, etc.)
  - Jest mock for react-native-svg (Svg, Circle, G, Path, Text)
  - notification-store.ts with Zustand persist — windDownEnabled, caffeineCutoffEnabled, morningBriefEnabled, lead times
affects: [04-02, 04-03, 04-04, notification-service, RechargeArc]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Jest moduleNameMapper for native module mocks — pattern: '^package-name$' -> rootDir/__mocks__/package.ts
    - Zustand persist with partialize — store only preference scalars, not setters, to AsyncStorage
    - Type declaration shim in @types/ for packages not yet installed but needed for TypeScript compilation

key-files:
  created:
    - __mocks__/expo-notifications.ts
    - __mocks__/react-native-svg.ts
    - @types/react-native-svg.d.ts
    - __tests__/store/jest-mocks.test.ts
    - __tests__/store/notification-store.test.ts
  modified:
    - jest.config.js
    - src/store/notification-store.ts

key-decisions:
  - "react-native-svg type shim in @types/ prevents TS2307 without installing native package"
  - "react-native-svg mock uses plain HTML elements (svg/circle) not View from react-native — avoids node test environment import errors"
  - "notification-store exports NotificationPrefs interface (not NotificationPreferences) — aligns with plan spec and Phase 4 consumers"
  - "partialize excludes setter functions from AsyncStorage persistence — only scalar prefs serialized"

patterns-established:
  - "Mock native module pattern: create __mocks__/package.ts + add to jest.config.js moduleNameMapper + add @types/package.d.ts if not installed"
  - "Zustand persist: always use partialize to exclude action functions from serialization"

requirements-completed: [NOTIF-05, NSM-03]

# Metrics
duration: 18min
completed: 2026-04-02
---

# Phase 4 Plan 1: Night Sky Mode — Test Infrastructure Summary

**Expo-notifications and react-native-svg Jest mocks + Zustand notification-prefs store with AsyncStorage persistence**

## Performance

- **Duration:** 18 min
- **Started:** 2026-04-02T13:28:37Z
- **Completed:** 2026-04-02T13:46:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Jest mocks for `expo-notifications` and `react-native-svg` prevent native module crashes in all Phase 4 tests
- Both mocks registered in `jest.config.js` moduleNameMapper — no per-test jest.mock() boilerplate needed
- `notification-store.ts` stub replaced with full Zustand persist implementation — windDown/caffeineCutoff/morningBrief prefs persist across app restarts via AsyncStorage key `notification-prefs`
- 272 tests pass total (was 243 before Phase 4; 29 new tests added)

## Task Commits

1. **Task 1: Jest mocks for expo-notifications and react-native-svg** - `13ccc5f` (feat)
2. **Task 2: notification-store Zustand slice** - `ec47665` + `f1254e6` (feat — parallel agent merged store + test)

## Files Created/Modified

- `__mocks__/expo-notifications.ts` - Full mock with scheduleNotificationAsync → 'mock-id', SchedulableTriggerInputTypes.DATE = 'date'
- `__mocks__/react-native-svg.ts` - Svg/Circle/G/Path/Text as plain HTML element creators (avoids RN import in node env)
- `@types/react-native-svg.d.ts` - TypeScript module declaration shim for react-native-svg (package not installed)
- `jest.config.js` - Added two moduleNameMapper entries for expo-notifications and react-native-svg
- `src/store/notification-store.ts` - Full Zustand persist store replacing stub; exports useNotificationStore, NotificationPrefs
- `__tests__/store/jest-mocks.test.ts` - 5 tests verifying mock behavior
- `__tests__/store/notification-store.test.ts` - 11 tests verifying defaults, setters, and persistence key

## Decisions Made

- `react-native-svg` mock uses plain HTML SVG elements (`svg`, `circle`) rather than `View` from react-native, because the test environment is `node` and importing `react-native` directly would require the full RN test environment setup.
- Added `@types/react-native-svg.d.ts` type shim since the package is not installed — mock provides runtime behavior, type shim provides compile-time satisfaction.
- `notification-store` exports `NotificationPrefs` (matches plan spec) rather than the prior stub's `NotificationPreferences` — downstream consumers in Phase 4 plans reference this name.
- `partialize` added to persist config to exclude action functions (`setWindDown`, `setCaffeineCutoff`, `setMorningBrief`) from AsyncStorage serialization — only scalar preferences serialized.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @types/react-native-svg.d.ts type declaration**
- **Found during:** Task 1 (Jest mocks)
- **Issue:** `react-native-svg` not installed → TypeScript TS2307 "Cannot find module" error at compile time even with moduleNameMapper
- **Fix:** Created `@types/react-native-svg.d.ts` with minimal interface for Svg/Circle/G/Path/Text
- **Files modified:** `@types/react-native-svg.d.ts`
- **Verification:** TypeScript error resolved, 5 mock tests pass
- **Committed in:** `13ccc5f`

**2. [Rule 1 - Bug] react-native-svg mock uses plain HTML elements not View**
- **Found during:** Task 1 (Jest mocks)
- **Issue:** Original plan spec had mock using `View` from `react-native`, causing "Cannot use import statement outside a module" in node test environment
- **Fix:** Changed mock to use `React.createElement('svg')`, `React.createElement('circle')` etc. — avoids react-native import in node env
- **Files modified:** `__mocks__/react-native-svg.ts`
- **Verification:** All 5 mock tests pass including Circle element creation test
- **Committed in:** `13ccc5f`

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes required for correct test operation in node environment. No scope creep.

## Issues Encountered

- Parallel agent had already committed a compatible `notification-store.ts` and test file as part of 04-02 work — this plan's Task 2 implementation matched exactly. Final state is correct per plan spec.

## Known Stubs

None — all five preference fields (windDownEnabled, windDownLeadMinutes, caffeineCutoffEnabled, caffeineCutoffLeadMinutes, morningBriefEnabled) have real defaults and setter implementations wired to AsyncStorage persistence.

## Next Phase Readiness

- Phase 4 plans (04-02, 04-03, 04-04) can now import `expo-notifications` in tests without native module crashes
- Phase 4 plans can import `react-native-svg` components (for RechargeArc.tsx) without module resolution errors
- `useNotificationStore` provides preference state for notification scheduler and Night Sky Mode wind-down detection
- No blockers for Phase 4 continuation

---
*Phase: 04-night-sky-mode-notifications*
*Completed: 2026-04-02*
