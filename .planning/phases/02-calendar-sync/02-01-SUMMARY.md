---
phase: 02-calendar-sync
plan: 01
subsystem: calendar
tags: [calendar, types, store, shift-detection, expo-calendar, zustand, tdd]
dependency_graph:
  requires: []
  provides:
    - src/lib/calendar/calendar-types.ts
    - src/lib/calendar/calendar-store.ts
    - src/lib/calendar/calendar-service.ts
    - src/lib/calendar/shift-detector.ts (extended)
  affects:
    - All subsequent calendar-sync plans (02, 03, 04)
    - Shift detection pipeline
tech_stack:
  added:
    - expo-calendar ~55.0.10
    - expo-background-task ~55.0.10
    - expo-task-manager ~55.0.10
    - "@react-native-google-signin/google-signin ^16.1.2"
  patterns:
    - Zustand persist with SecureStore isolation for sensitive tokens
    - TDD (RED → GREEN) for all new modules
    - Jest mocks via moduleNameMapper for native modules
key_files:
  created:
    - src/lib/calendar/calendar-types.ts
    - src/lib/calendar/calendar-store.ts
    - src/lib/calendar/calendar-service.ts
    - src/lib/calendar/__tests__/calendar-store.test.ts
    - src/lib/calendar/__tests__/shift-detector.test.ts
    - src/lib/calendar/__tests__/calendar-service.test.ts
    - __mocks__/expo-calendar.ts
    - __mocks__/expo-secure-store.ts
    - __mocks__/@react-native-google-signin/google-signin.ts
  modified:
    - package.json (4 new deps)
    - app.json (iOS calendar permissions + background modes + plugins)
    - jest.config.js (src/ roots added, mock mappings added)
    - src/lib/calendar/shift-detector.ts (extended with confidence scoring)
decisions:
  - "birthday removed from NEGATIVE_KEYWORDS — test spec (Test 5) takes precedence over plan's keyword list; birthday party at 7h should score 0.70 (shift length, no keyword)"
  - "googleAccessToken excluded from Zustand persist partialize — stays in expo-secure-store only; in-memory cache on reconnect"
  - "jest.config.js extended to cover src/ roots and map native modules to mocks"
metrics:
  duration: 6 minutes
  completed: "2026-04-02"
  tasks: 2
  files: 13
requirements: [CAL-01, CAL-03, CAL-04, CAL-06]
---

# Phase 02 Plan 01: Calendar Foundation — Types, Store, Service, Shift Detector Summary

**One-liner:** Apple Calendar CRUD service + Zustand connection store + confidence-scored shift detector + Jest mocks, all test-driven with 41 passing tests.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install deps, define types, create store, scaffold mocks | 25cfc3f | package.json, app.json, jest.config.js, calendar-types.ts, calendar-store.ts, 3 mocks, calendar-store.test.ts |
| 2 | Extend shift detector + build Apple CalendarService | f3d7d0f | shift-detector.ts, calendar-service.ts, shift-detector.test.ts, calendar-service.test.ts |

## What Was Built

### calendar-types.ts
Three exports: `RawCalendarEvent` (normalized event from Apple/Google), `CalendarMeta` (calendar metadata with enabled toggle), `ChangeNotificationMode` ('silent' | 'badge' | 'push').

### calendar-store.ts
Zustand store with `persist` middleware (key: `'calendar-storage'`). Manages:
- Apple and Google connection state and calendar lists
- Toggle per calendar (D-03)
- Work calendar ID for heuristic bypass (D-07)
- Write preferences and native calendar ID (D-11, D-12)
- Change notification mode (D-15, default: 'silent')
- Event ID map (prevents duplicate events on re-sync)
- Google sync tokens and last-synced timestamp
- `getEnabledAppleCalendarIds()` / `getEnabledGoogleCalendarIds()` selectors

`googleAccessToken` is excluded from AsyncStorage persistence via `partialize` — stored in `expo-secure-store` only.

### calendar-service.ts
Six exported async functions:
- `requestCalendarAccess()` — permission request, returns boolean
- `fetchAppleCalendars()` — maps to CalendarMeta[], all enabled=true
- `fetchAppleEvents(calendarIds, start, end)` — maps to RawCalendarEvent[], filters all-day events
- `getOrCreateShiftWellCalendar()` — finds or creates calendar with `#6B5CE7` purple
- `writeSleepBlock(block, calendarId)` — creates event, title format "Sleep — 11:00 PM" / "Nap — 2:30 PM" per D-13
- `deleteSleepBlock(eventId, calendarId)` — deletes event

### shift-detector.ts (extended)
Added `shiftConfidence(summary, durationHours, options?)` with:
- `isWorkCalendar=true` → 1.0 (D-07 override)
- All-day (24h) → 0
- Duration < 5.5h → 0
- Negative keyword match → 0
- Shift length + keyword → 0.95
- Shift length only → 0.70

Added `separateShiftsFromPersonalWithConfidence()` returning `{ shifts, personal, confidenceMap }`.

Existing `separateShiftsFromPersonal()` and `createShiftEvent()` unchanged for backward compatibility.

## Test Results

```
Test Suites: 4 passed
Tests:       41 passed
  - calendar-store: 9 tests
  - shift-detector: 9 tests
  - calendar-service: 9 tests
  - ics-parser: 14 tests (pre-existing, still passing)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] "birthday" removed from NEGATIVE_KEYWORDS**
- **Found during:** Task 2 GREEN phase
- **Issue:** Plan includes "birthday" in NEGATIVE_KEYWORDS but Test 5 explicitly requires "Birthday Party" 7h to return >= 0.50. Having "birthday" in the list makes the function return 0, failing Test 5.
- **Fix:** Removed "birthday" from NEGATIVE_KEYWORDS. "Doctor Appointment" still returns 0 via "doctor". The behavior matches all 9 shift-detector test cases.
- **Files modified:** src/lib/calendar/shift-detector.ts
- **Commit:** f3d7d0f

**2. [Rule 3 - Blocking] jest.config.js extended to cover src/ and map native modules**
- **Found during:** Task 1 test run
- **Issue:** jest.config.js only scanned `__tests__/` root. Plan locates tests in `src/lib/calendar/__tests__/`. Also, `expo-calendar` and `expo-secure-store` needed moduleNameMapper entries or tests would fail to resolve native modules.
- **Fix:** Added `'<rootDir>/src'` to roots array. Added moduleNameMapper entries for expo-calendar, expo-secure-store, and @react-native-google-signin/google-signin.
- **Files modified:** jest.config.js
- **Commit:** 25cfc3f

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| src/lib/calendar/calendar-types.ts | FOUND |
| src/lib/calendar/calendar-store.ts | FOUND |
| src/lib/calendar/calendar-service.ts | FOUND |
| __mocks__/expo-calendar.ts | FOUND |
| __mocks__/@react-native-google-signin/google-signin.ts | FOUND |
| Commit 25cfc3f | FOUND |
| Commit f3d7d0f | FOUND |
