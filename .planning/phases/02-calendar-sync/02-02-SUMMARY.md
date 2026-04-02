---
phase: 02-calendar-sync
plan: "02"
subsystem: calendar
tags: [google-calendar, background-sync, shift-detection, deletion-detection, d-16]
dependency_graph:
  requires: [02-01]
  provides: [google-calendar-rest-client, background-sync-task, run-calendar-sync, d-16-deletion-detection]
  affects: [shifts-store, app-layout, calendar-service]
tech_stack:
  added:
    - Google Calendar REST API v3 (fetch-based client, no SDK)
    - expo-task-manager (background task definition)
    - expo-background-task (20-min polling interval)
    - @react-native-google-signin/google-signin (app.json plugin + startup configure)
  patterns:
    - TDD RED/GREEN for google-calendar-api.ts (13 new tests)
    - Jest setupFiles for env var injection (prevents Supabase require-time error)
    - Side-effect import pattern for TaskManager.defineTask at module scope
    - Delta sync with 410 syncToken expiry fallback to full re-fetch
key_files:
  created:
    - src/lib/calendar/google-calendar-api.ts
    - src/lib/calendar/__tests__/google-calendar-api.test.ts
    - src/lib/calendar/background-sync.ts
    - jest.setup.ts
    - __mocks__/expo-task-manager.ts
    - __mocks__/expo-background-task.ts
    - __mocks__/supabase-client.ts
    - __mocks__/sync-engine.ts
    - src/lib/supabase/__mocks__/client.ts
  modified:
    - src/lib/calendar/calendar-service.ts (added runCalendarSync, imports)
    - src/store/shifts-store.ts (added source field, getCalendarSyncedShiftIds, markRecalculationNeeded)
    - src/lib/circadian/types.ts (added optional source field to ShiftEvent)
    - app/_layout.tsx (background-sync import, AppState listener, GoogleSignin.configure)
    - app.json (@react-native-google-signin/google-signin plugin)
    - jest.config.js (new mocks, setupFiles)
decisions:
  - "Google Calendar API client is pure fetch-based — no SDK at runtime. SDK used only for OAuth auth flow."
  - "D-10 two-tier write: Phase 2 writes sleep blocks only. Caffeine/meal/light plan items deferred to Phase 3 when circadian algorithm produces output."
  - "syncToken polling interval set to 20 minutes — middle of D-14 range (15-30 min). Balances freshness vs battery."
  - "Supabase env vars injected via jest.setup.ts setupFiles — avoids module-evaluation error when shifts-store is imported transitively."
  - "ShiftEvent.source field is optional (not breaking) — existing manual-entry shifts default to undefined, calendar-synced shifts get source='calendar'."
metrics:
  duration: "7min"
  completed_date: "2026-04-02"
  tasks_completed: 2
  files_created: 9
  files_modified: 6
  tests_added: 13
  tests_total: 237
---

# Phase 02 Plan 02: Google Calendar Client + Background Sync + D-16 Deletion Detection Summary

**One-liner:** Google Calendar REST API client (fetch/delta/write), 20-min background sync task, AppState-triggered sync, and D-16 deletion detection — removed shifts clean orphaned sleep blocks and flag Phase 3 Circadian Reset.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Google Calendar REST API client with delta sync (TDD) | af67f95 | google-calendar-api.ts, google-calendar-api.test.ts |
| 2 | Background sync task, AppState wiring, D-16 deletion detection | 463a97b | background-sync.ts, calendar-service.ts, _layout.tsx, app.json |

## What Was Built

### Task 1: Google Calendar REST API Client

`src/lib/calendar/google-calendar-api.ts` — five exported async functions:

- `fetchGoogleCalendarList` — GET calendarList, maps to `CalendarMeta[]` with `source='google'`
- `fetchGoogleEvents` — GET events for date range, handles all-day vs timed, skips cancelled, graceful per-calendar degradation on non-ok response
- `fetchGoogleEventsDelta` — delta sync with syncToken, handles HTTP 410 (expiry) by returning `{ events: [], nextSyncToken: null }` for caller to full-refetch
- `createGoogleEvent` — POST with D-13 title format ("Sleep — 11:00 PM")
- `deleteGoogleEvent` — DELETE by event ID

13 tests written TDD (RED then GREEN). All pass with mocked `global.fetch`.

### Task 2: Background Sync Infrastructure

**`src/lib/calendar/background-sync.ts`:**
- Exports `CALENDAR_SYNC_TASK = 'SHIFTWELL_CALENDAR_SYNC'`
- `TaskManager.defineTask` at module scope — dynamic import of `runCalendarSync` to avoid circular deps
- `registerCalendarBackgroundSync` — 20-min minimum interval, idempotent (checks isTaskRegisteredAsync)
- `unregisterCalendarBackgroundSync` — safe removal

**`runCalendarSync` in `calendar-service.ts`:**
- Fetches Apple events (full range) + Google events (delta with 410 fallback)
- Runs shift confidence scoring (≥0.80 threshold)
- Additive path: adds newly detected shifts with `source='calendar'`
- **D-16 deletion path:** compares fetched shift IDs vs stored calendar-synced IDs → removes deleted shifts, deletes orphaned sleep block events from ShiftWell calendar, calls `markRecalculationNeeded` for Phase 3

**`app/_layout.tsx`:**
- Side-effect import `'@/src/lib/calendar/background-sync'` ensures task is registered at module scope
- `GoogleSignin.configure` with calendar read+write scopes
- `AppState.addEventListener` fires `runCalendarSync` on every foreground transition

**`app.json`:** `@react-native-google-signin/google-signin` plugin added with placeholder `iosUrlScheme` (real client ID added when Sim creates Google Cloud OAuth credential per user_setup).

### Store/Type Updates

- `ShiftEvent.source?: 'calendar' | 'manual'` added to `circadian/types.ts`
- `shifts-store.ts`: `recalculationNeeded: string[]` state, `getCalendarSyncedShiftIds()`, `markRecalculationNeeded(shiftId)` actions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Supabase env var error blocked calendar-service tests**

- **Found during:** Task 2 (after adding useShiftsStore import to calendar-service.ts)
- **Issue:** `shifts-store.ts` → `sync-engine.ts` → `supabase/client.ts` → `createClient()` throws at module evaluation when `EXPO_PUBLIC_SUPABASE_URL` is empty string
- **Fix:** Added `jest.setup.ts` with `setupFiles` in `jest.config.js` that sets dummy env vars before module loading. Also added `__mocks__/supabase-client.ts` and `src/lib/supabase/__mocks__/client.ts` for any future direct mocking needs.
- **Files modified:** `jest.config.js`, `jest.setup.ts`, `__mocks__/supabase-client.ts`, `src/lib/supabase/__mocks__/client.ts`
- **Commit:** 463a97b

**2. [Rule 2 - Missing] Added mocks for expo-task-manager and expo-background-task**

- **Found during:** Task 2
- **Issue:** `background-sync.ts` imports both modules which have no Jest mocks
- **Fix:** Created `__mocks__/expo-task-manager.ts` and `__mocks__/expo-background-task.ts` with all required exports, registered in `jest.config.js`
- **Files modified:** jest.config.js + 2 new mock files
- **Commit:** 463a97b

## D-10 Note (Two-Tier Write Strategy)

Phase 2 writes sleep blocks only (main-sleep, nap). Caffeine cutoff, meal timing, light protocols are documented as deferred to Phase 3 — the circadian algorithm must run first to produce these outputs. The write infrastructure (`writeSleepBlock`, `createGoogleEvent`) is ready; Phase 3 will call it with the full plan.

## Known Stubs

None — all D-16 deletion detection is implemented. `markRecalculationNeeded` stores IDs in `recalculationNeeded[]` array. Phase 3's Circadian Reset algorithm will consume this array (documented intentional deferral, not a stub blocking this plan's goal).

## Test Summary

- 13 new tests in `google-calendar-api.test.ts`
- 237 total tests passing (up from ~183 before this plan)
- 0 tests broken from prior passing state

## Self-Check: PASSED

- [x] `src/lib/calendar/google-calendar-api.ts` exists
- [x] `src/lib/calendar/__tests__/google-calendar-api.test.ts` exists
- [x] `src/lib/calendar/background-sync.ts` exists
- [x] `runCalendarSync` in `src/lib/calendar/calendar-service.ts`
- [x] Commits af67f95 and 463a97b exist in git log
- [x] 237 tests passing
