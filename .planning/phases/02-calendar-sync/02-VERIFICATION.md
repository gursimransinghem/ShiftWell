---
phase: 02-calendar-sync
verified: 2026-04-02T12:34:01Z
status: human_needed
score: 14/14 must-haves verified
human_verification:
  - test: "Apple Calendar connection in onboarding"
    expected: "iOS permission dialog appears when tapping Apple Calendar card; on grant, calendar list with toggles shows"
    why_human: "Permission dialogs and native calendar access require a real device or simulator with Expo Go"
  - test: "Shift review list with confidence indicators"
    expected: "Events with high confidence (>=0.80) show green dot and are pre-checked; medium confidence (0.50-0.79) show amber dot; user can toggle individual shifts"
    why_human: "Requires real calendar data and UI interaction to verify pre-check logic and visual indicators"
  - test: "Google Calendar OAuth flow"
    expected: "Tapping Google Calendar card triggers Google Sign-In sheet; on success, calendar list appears"
    why_human: "Google Sign-In requires a dev build (not Expo Go) and real Google Cloud credentials (EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)"
  - test: "Background sync fires on app open (AppState transition)"
    expected: "runCalendarSync() is called when app returns to foreground while at least one calendar is connected"
    why_human: "AppState transitions require a real device or simulator and cannot be verified by static grep"
  - test: "Deletion detection removes orphaned sleep block events"
    expected: "When a shift previously synced from calendar disappears from next fetch, the shift is removed from store and any ShiftWell calendar events for that shift are deleted"
    why_human: "Requires live calendar data that changes between syncs to verify the deletion detection path end-to-end"
  - test: "Calendar Settings section visual quality"
    expected: "Settings screen shows Calendar Sync section with provider cards, toggles, write preferences, notification pills (Silent/Badge/Push), and Disconnect option. Dark theme, gold accents, no visual glitches."
    why_human: "Visual quality and UI layout require human eyes on a running device"
---

# Phase 02: Calendar Sync Verification Report

**Phase Goal:** Users can connect their real calendars and ShiftWell reads shifts automatically
**Verified:** 2026-04-02T12:34:01Z
**Status:** human_needed (all automated checks passed)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Calendar types and interfaces defined for Apple and Google event normalization | VERIFIED | `calendar-types.ts` exports `RawCalendarEvent`, `CalendarMeta`, `ChangeNotificationMode` (line 8, 18, 27) |
| 2 | Calendar store persists connected state, calendar toggles, and write preferences | VERIFIED | `calendar-store.ts` — Zustand store with `persist` middleware, `calendar-storage` key, SecureStore for token (lines 12, 177) |
| 3 | Shift detector returns confidence scores (0.0-1.0) for calendar events | VERIFIED | `shift-detector.ts` exports `shiftConfidence()` with keyword, negative-keyword, and duration heuristics (line 45) |
| 4 | CalendarService can request Apple Calendar permission and fetch events | VERIFIED | `calendar-service.ts` exports `requestCalendarAccess`, `fetchAppleCalendars`, `fetchAppleEvents` (lines 22, 31, 47) |
| 5 | CalendarService can create ShiftWell calendar and write sleep block events | VERIFIED | `calendar-service.ts` exports `getOrCreateShiftWellCalendar` (line 70), `writeSleepBlock` (line 118), `deleteSleepBlock` (line 153); color `#6B5CE7` and "Sleep —"/"Nap —" title format confirmed |
| 6 | Google Calendar REST API client fetches events and handles delta sync | VERIFIED | `google-calendar-api.ts` exports `fetchGoogleCalendarList`, `fetchGoogleEvents`, `fetchGoogleEventsDelta`, `createGoogleEvent`, `deleteGoogleEvent`; base URL `googleapis.com/calendar/v3` confirmed; HTTP 410 handled at line 160 |
| 7 | Background sync task is defined and registerable | VERIFIED | `background-sync.ts` exports `CALENDAR_SYNC_TASK = 'SHIFTWELL_CALENDAR_SYNC'`, `registerCalendarBackgroundSync`, `unregisterCalendarBackgroundSync`; `TaskManager.defineTask` at line 17; `minimumInterval: 20 * 60` at line 35 |
| 8 | App-open sync fires when AppState transitions to active | VERIFIED | `app/_layout.tsx` imports `background-sync` as side-effect (line 17), `AppState.addEventListener` (line 82), `runCalendarSync` called in listener (line 86) |
| 9 | Sync detects deleted/changed shifts and removes them from store (D-16) | VERIFIED | `calendar-service.ts` lines 252-277: `getCalendarSyncedShiftIds()`, `removedShiftIds` diff, `removeShift`, orphaned sleep block cleanup via `deleteSleepBlock`, `markRecalculationNeeded` stub |
| 10 | User sees Apple and Google provider cards in onboarding | VERIFIED | `app/(onboarding)/calendar.tsx` renders `CalendarProviderCard` for both providers (lines 253, 273); "Connect Your Calendar" heading (line 247); "Skip for now" option (line 302) |
| 11 | After connecting, user sees calendar toggle list and can tag Work Schedule | VERIFIED | `calendar.tsx` renders `CalendarToggleList` (line 330); `CalendarToggleList.tsx` has Work badge and `onSetWorkCalendar` prop (lines 62-64) |
| 12 | Shift review list shows confidence-based pre-checking | VERIFIED | `ShiftReviewList.tsx` uses `HIGH_CONFIDENCE = 0.80`, `CONFIDENCE_GREEN = '#34C759'`, `CONFIDENCE_AMBER = '#F5A623'`; "These look like your shifts" heading (line 170); pre-check logic at line 135 |
| 13 | Calendar screen wired into onboarding Stack | VERIFIED | `app/(onboarding)/_layout.tsx` line 22: `<Stack.Screen name="calendar" />` |
| 14 | Calendar management accessible from Settings (D-01) | VERIFIED | `CalendarSettingsSection.tsx` (601 lines) with `useCalendarStore`, "Calendar Sync" header, provider cards, toggles, write prefs, Silent/Badge/Push notification pills, Disconnect handlers; imported and rendered in `app/(tabs)/settings.tsx` at line 504 |

**Score:** 14/14 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/calendar/calendar-types.ts` | RawCalendarEvent, CalendarMeta, ChangeNotificationMode interfaces | VERIFIED | 27 lines, all 3 types exported |
| `src/lib/calendar/calendar-store.ts` | Zustand store for calendar state | VERIFIED | 186 lines, `useCalendarStore` exported, persist with SecureStore for token |
| `src/lib/calendar/calendar-service.ts` | Apple Calendar CRUD + runCalendarSync | VERIFIED | 282 lines, all 7 required exports present, deletion path at lines 252-277 |
| `src/lib/calendar/shift-detector.ts` | Confidence-scored shift detection | VERIFIED | 182 lines, `shiftConfidence`, `NEGATIVE_KEYWORDS`, `separateShiftsFromPersonalWithConfidence` all exported |
| `src/lib/calendar/google-calendar-api.ts` | Google Calendar REST client | VERIFIED | 237 lines, 5 functions exported, 410 handling present |
| `src/lib/calendar/background-sync.ts` | Background task definition | VERIFIED | 49 lines, task defined, register/unregister exported |
| `__mocks__/expo-calendar.ts` | Jest mock for expo-calendar | VERIFIED | `requestCalendarPermissionsAsync` mocked |
| `__mocks__/@react-native-google-signin/google-signin.ts` | Jest mock for google-signin | VERIFIED | `GoogleSignin` mocked |
| `src/components/calendar/CalendarProviderCard.tsx` | Apple/Google connection card | VERIFIED | 145 lines, `#34C759` green dot, `ACCENT.primary` button |
| `src/components/calendar/CalendarToggleList.tsx` | Per-calendar toggle list | VERIFIED | 239 lines, `workCalendarId` prop, "Work" badge present |
| `src/components/calendar/ShiftReviewList.tsx` | Confidence-based shift review | VERIFIED | 365 lines, 0.80 threshold, amber/green indicators, heading text present |
| `src/components/calendar/CalendarSettingsSection.tsx` | Settings section for calendar management | VERIFIED | 601 lines, all required controls present |
| `src/components/calendar/index.ts` | Barrel export | VERIFIED | Exports all 4 calendar components |
| `app/(onboarding)/calendar.tsx` | Onboarding calendar screen | VERIFIED | 478 lines, 3-phase flow (connect/calendars/review) |
| `app/(tabs)/settings.tsx` | Settings with calendar section | VERIFIED | `CalendarSettingsSection` imported and rendered at line 504 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `calendar-service.ts` | `calendar-types.ts` | `import RawCalendarEvent` | WIRED | Line 11: `import type { RawCalendarEvent, CalendarMeta }` |
| `calendar-store.ts` | `calendar-types.ts` | `import CalendarMeta` | WIRED | Line 13: `import type { CalendarMeta, ChangeNotificationMode }` |
| `calendar-service.ts` | `expo-calendar` | ExpoCalendar API calls | WIRED | Lines 23, 32, 52, 71, 78: `ExpoCalendar.*` calls present |
| `google-calendar-api.ts` | `googleapis.com/calendar/v3` | fetch with Bearer token | WIRED | Line 13: `GCAL_BASE` constant; fetch calls throughout |
| `background-sync.ts` | `expo-task-manager` | `TaskManager.defineTask` | WIRED | Line 17: `TaskManager.defineTask(CALENDAR_SYNC_TASK, ...)` |
| `app/_layout.tsx` | `background-sync.ts` | import for task registration side-effect | WIRED | Line 17: `import '@/src/lib/calendar/background-sync'` |
| `calendar-service.ts` | `shifts-store.ts` | `removeShift` for deletion-detected shifts | WIRED | `getCalendarSyncedShiftIds`, `removeShift`, `markRecalculationNeeded` all confirmed in shifts-store |
| `app/(onboarding)/calendar.tsx` | `calendar-service.ts` | `requestCalendarAccess, fetchAppleCalendars` | WIRED | Lines 30-35 imports; called in Apple connect handler |
| `app/(onboarding)/calendar.tsx` | `calendar-store.ts` | `useCalendarStore` | WIRED | Line 36: imported; used throughout |
| `ShiftReviewList.tsx` | `shift-detector.ts` | `shiftConfidence` for pre-checking | WIRED | `confidence` prop from parent; HIGH_CONFIDENCE = 0.80 threshold used |
| `CalendarSettingsSection.tsx` | `calendar-store.ts` | `useCalendarStore` for all state | WIRED | Lines 133-155: reads and writes via store |
| `settings.tsx` | `CalendarSettingsSection.tsx` | import and render | WIRED | Line 17 import, line 504 render |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `calendar.tsx` (onboarding) | `appleCalendars` | `fetchAppleCalendars()` → `ExpoCalendar.getCalendarsAsync()` → `connectApple()` → store | Yes — calls native API, stores in Zustand | FLOWING |
| `calendar.tsx` (onboarding) | `scoredEvents` | `fetchAppleEvents()` → `shiftConfidence()` per event | Yes — maps real calendar events with scores | FLOWING |
| `CalendarSettingsSection.tsx` | `appleConnected`, `appleCalendars` | `useCalendarStore` → persisted in AsyncStorage | Yes — hydrated from persist layer | FLOWING |
| `runCalendarSync()` | `allEvents` | `fetchAppleEvents` + `fetchGoogleEventsDelta`/`fetchGoogleEvents` | Yes — aggregates from both providers | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Calendar test suite (54 tests) | `npx jest "calendar" --passWithNoTests` | 54 passed, 5 suites | PASS |
| `shiftConfidence` exported | `grep "export function shiftConfidence" src/lib/calendar/shift-detector.ts` | Found line 45 | PASS |
| `runCalendarSync` exported | `grep "export async function runCalendarSync" src/lib/calendar/calendar-service.ts` | Found line 184 | PASS |
| Deletion path wired to shifts-store | `grep "getCalendarSyncedShiftIds\|removedShiftIds" src/lib/calendar/calendar-service.ts` | Found lines 252-253 | PASS |
| Dependencies installed | `grep expo-calendar package.json` | `"expo-calendar": "~55.0.10"` | PASS |
| app.json iOS permissions | `grep NSCalendarsFullAccessUsageDescription app.json` | Found line 25 | PASS |

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|---------------|-------------|--------|----------|
| CAL-01 | 02-01, 02-03 | User can connect Apple Calendar (read access to shifts + personal events) | SATISFIED | `requestCalendarAccess`, `fetchAppleCalendars`, `fetchAppleEvents` in `calendar-service.ts`; Apple connect flow in `calendar.tsx` |
| CAL-02 | 02-02, 02-03 | User can connect Google Calendar (read access to shifts + personal events) | SATISFIED | `google-calendar-api.ts` with full REST client; Google Sign-In flow in `calendar.tsx` |
| CAL-03 | 02-01, 02-03 | App auto-detects shift events from connected calendars | SATISFIED | `shiftConfidence()` with keyword/duration/negative-keyword heuristics; `separateShiftsFromPersonalWithConfidence`; work calendar bypass |
| CAL-04 | 02-01, 02-04 | App writes sleep blocks back to user's calendar as real events | SATISFIED | `writeSleepBlock`, `updateSleepBlock`, `deleteSleepBlock` in `calendar-service.ts`; `getOrCreateShiftWellCalendar` creates ShiftWell calendar; write prefs in `CalendarSettingsSection` |
| CAL-05 | 02-02, 02-04 | Sleep blocks auto-update when calendar changes (dynamic rescheduling) | SATISFIED | `runCalendarSync()` with delta sync (`fetchGoogleEventsDelta`), `AppState` listener in `_layout.tsx`, background task every 20 min; deletion path removes orphaned sleep blocks |
| CAL-06 | 02-01, 02-03, 02-04 | User can configure which calendars to read and write to | SATISFIED | `CalendarToggleList` with per-calendar toggles; `toggleCalendar` in store; write target selection in `CalendarSettingsSection` (D-11, D-12); work calendar tag (D-07) |

All 6 requirement IDs (CAL-01 through CAL-06) are accounted for — no orphaned requirements.

### Anti-Patterns Found

No blockers or significant anti-patterns detected.

| File | Pattern | Severity | Notes |
|------|---------|----------|-------|
| `calendar-service.ts` | `// Phase 3 will implement full Circadian Reset` comments | Info | Intentional stub comment — Phase 3 scope for full algorithm. `markRecalculationNeeded` is the correct handoff point. |
| `app.json` | `PLACEHOLDER_CLIENT_ID` in google-signin plugin | Info | Documented intentionally — real client ID requires Sim to create Google Cloud OAuth credential (user_setup in Plan 02-02). Runtime uses `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` env var. |

### Human Verification Required

#### 1. Apple Calendar Connection in Onboarding

**Test:** Run `npx expo start`, navigate through onboarding to the Calendar screen (after HealthKit). Tap "Apple Calendar" — Connect button.
**Expected:** iOS native permission dialog appears. On grant, calendar list shows with toggles for each calendar found. All calendars toggled on by default.
**Why human:** Native iOS permission dialog requires a real device or simulator running Expo Go.

#### 2. Shift Review Confidence Indicators

**Test:** After connecting Apple Calendar in onboarding, proceed past the toggle list. Shift review screen should appear.
**Expected:** Detected events show confidence indicators — green dot and pre-checked for shifts (ER shifts, long events with keywords); amber dot for borderline; unchecked for personal events. "These look like your shifts" heading visible.
**Why human:** Requires real calendar events to flow through and visual assessment of confidence indicator rendering.

#### 3. Google Calendar OAuth Flow

**Test:** In onboarding or Settings, tap "Google Calendar" — Connect. (Requires dev build + real `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` from Google Cloud.)
**Expected:** Google Sign-In sheet appears. After sign-in, Google calendars load and show in toggle list.
**Why human:** Google Sign-In requires a dev build (Expo Go does not support it) and real Google Cloud credentials.

#### 4. AppState Sync Trigger

**Test:** Connect a calendar provider. Background the app and bring it to foreground.
**Expected:** `runCalendarSync()` fires silently on return to active. Verify via device logs or by checking `lastSyncedAt` timestamp in Settings.
**Why human:** AppState transitions and background/foreground lifecycle require a running device.

#### 5. Deletion Detection End-to-End

**Test:** Have a shift synced from calendar. Remove it from the native calendar app. Trigger a sync (reopen app). Check Settings — shift should be gone from ShiftWell, and any sleep blocks for that shift should be removed from the ShiftWell calendar.
**Expected:** Shift removed from shifts-store, orphaned sleep block calendar events deleted.
**Why human:** Requires live calendar mutations between sync cycles.

#### 6. Calendar Settings Section Visual Quality

**Test:** Navigate to Settings tab, scroll to "Calendar Sync" section.
**Expected:** Dark background, gold accents, provider cards with status indicators, calendar toggle list, write preference switch, three notification pills (Silent/Badge/Push), Disconnect option with confirmation dialog. No visual glitches, premium feel.
**Why human:** Visual quality and layout require human assessment on a running app.

### Gaps Summary

No gaps — all automated checks passed. Phase 02 goal is fully implemented at the code level. Six human verification items remain, all requiring a running device or simulator with real credentials. These are UX/visual/runtime checks that cannot be automated.

---

_Verified: 2026-04-02T12:34:01Z_
_Verifier: Claude (gsd-verifier)_
