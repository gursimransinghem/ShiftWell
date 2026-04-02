---
phase: 01-foundation-onboarding
plan: 03
subsystem: ui
tags: [expo-location, geocoding, haversine, react-native, onboarding, commute, unit-tests]

# Dependency graph
requires:
  - phase: 01-01
    provides: UserProfile with workAddress/homeAddress/commuteDuration fields, onboarding constants
provides:
  - Commute estimation utility (haversineKm + estimateCommuteDuration) with full test coverage
  - Address entry onboarding screen (Step 7 of 8) with geocoding-based commute calculation
  - expo-location configured in app.json with locationWhenInUsePermission
affects: [02-calendar-sync, 03-night-sky-mode, 05-live-activities]

# Tech tracking
tech-stack:
  added: [expo-location ~55.1.4]
  patterns: [TDD red-green for utility functions, KeyboardAvoidingView pattern for address/text-heavy screens]

key-files:
  created:
    - src/utils/commute.ts
    - __tests__/utils/commute.test.ts
    - app/(onboarding)/addresses.tsx
  modified:
    - app.json
    - package.json

key-decisions:
  - "expo-location geocoding returns LocationGeocodedLocation with optional (not nullable) altitude/accuracy — tests use minimal object shape"
  - "estimateCommuteDuration uses 30 km/h urban average speed constant for consistent distance-to-time conversion"
  - "Skip option sets commuteDuration=30 (default) — user is never blocked from completing onboarding"

patterns-established:
  - "Utility functions: tested via TDD before screen integration"
  - "Onboarding screens: KeyboardAvoidingView wraps ScrollView for text-heavy screens"
  - "Geocoding failure: always returns safe default (30 min), never throws to UI"

requirements-completed: [ONB-04]

# Metrics
duration: 18min
completed: 2026-04-02
---

# Phase 01 Plan 03: Address Entry + Commute Estimation Summary

**Haversine geocoding utility with 8 unit tests and address entry onboarding screen (Step 7) using expo-location for commute calculation**

## Performance

- **Duration:** 18 min
- **Started:** 2026-04-02T09:40:00Z
- **Completed:** 2026-04-02T09:58:00Z
- **Tasks:** 2
- **Files modified:** 5 (3 created, 2 updated)

## Accomplishments
- Commute utility `src/utils/commute.ts` with `haversineKm` (great-circle distance) and `estimateCommuteDuration` (geocoding + 30 km/h urban speed)
- 8 passing unit tests covering haversine edge cases and geocoding success/failure paths (TDD)
- Address entry screen at `app/(onboarding)/addresses.tsx` — Step 7 of 8 — with Calculate Commute button, result display, and Skip option
- expo-location plugin added to app.json with `locationWhenInUsePermission` string

## Task Commits

Each task was committed atomically:

1. **Task 1: Commute estimation utility with tests** - `95df3ad` (feat)
2. **Task 2: Address entry screen + expo-location config** - `26a29b0` (feat)

## Files Created/Modified
- `src/utils/commute.ts` - haversineKm and estimateCommuteDuration exports, fallback to 30 min on geocoding failure
- `__tests__/utils/commute.test.ts` - 8 unit tests: 3 haversine cases, 5 estimateCommuteDuration cases
- `app/(onboarding)/addresses.tsx` - Work/home address entry, geocoding trigger, commute result display, skip flow
- `app.json` - expo-location plugin with locationWhenInUsePermission
- `package.json` - expo-location ~55.1.4 added as dependency

## Decisions Made
- expo-location types use `number | undefined` (not null) for altitude/accuracy — test mocks use minimal object shape `{ latitude, longitude }` to avoid type errors
- 30 km/h urban average constant aligns with plan specification (30km = 60 min)
- Skip path always writes commuteDuration=30 to store for safe downstream algorithm use

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type error in test mocks**
- **Found during:** Task 1 (TDD GREEN phase)
- **Issue:** Plan's test template used `altitude: null, accuracy: null` but expo-location types declare these as `number | undefined`, not nullable
- **Fix:** Changed mock geocode results to `{ latitude, longitude }` (omitting optional fields entirely)
- **Files modified:** `__tests__/utils/commute.test.ts`
- **Verification:** All 8 commute tests pass, all 197 total tests pass
- **Committed in:** 95df3ad (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — type mismatch in test mocks)
**Impact on plan:** Fix was required to make tests pass. No scope creep. Plan intent preserved exactly.

## Issues Encountered
- jest flag `--testPathPattern` deprecated in favor of `--testPathPatterns` — used correct flag throughout

## User Setup Required
None - no external service configuration required. expo-location permission strings are declared in app.json and will be presented to users at runtime by iOS.

## Next Phase Readiness
- Commute utility is wire-ready for any screen needing address-to-minutes calculation
- addresses.tsx is the last screen before healthkit (Step 8) — onboarding flow is now structurally complete
- expo-location configured and installed, ready for any future location-based features

---
*Phase: 01-foundation-onboarding*
*Completed: 2026-04-02*
