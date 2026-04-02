---
phase: 05-live-activities-recovery-score
verified: 2026-04-02T14:23:14Z
status: passed
score: 5/5 must-haves verified
re_verification: false
accepted_limitations:
  - id: LIVE-01-LIVE-02-LIVE-03
    description: "Live Activities are stubs with notification fallbacks. Real ActivityKit requires Xcode + EAS Build, blocked on Apple Developer enrollment. API surface is correct for future swap-in. Accepted for TestFlight v1.0."
---

# Phase 5: Live Activities & Recovery Score — Verification Report

**Phase Goal:** Users can glance at Dynamic Island or lock screen to see their sleep status, and the Today screen shows a meaningful plan-adherence score
**Verified:** 2026-04-02T14:23:14Z
**Status:** PASSED
**Re-verification:** No — initial verification

## Accepted Limitation (Pre-Declared)

LIVE-01, LIVE-02, LIVE-03 are implemented as notification-based stubs because Xcode is not installed and EAS Build is blocked on Apple Developer enrollment. The `live-activity-service.ts` has the correct expo-widgets-compatible API surface (`startSleepActivity`, `updateSleepActivity`, `endSleepActivity`, `LiveActivityState`) so real ActivityKit can be slotted in without changing call sites. This limitation was declared before verification and is accepted for TestFlight v1.0.

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | During wind-down, Dynamic Island shows countdown without opening app | STUB-ACCEPTED | `live-activity-service.ts` schedules a local notification as fallback; API surface correct for ActivityKit swap-in; `LIVE_ACTIVITIES_AVAILABLE` guard in place |
| 2 | At bedtime, Live Activity transitions to "Sleep" message | STUB-ACCEPTED | `startSleepActivity` pre-schedules sleep transition notification (`body: 'Sleep well'`) via `TIME_INTERVAL` trigger at `bedtimeISO` |
| 3 | Morning Live Activity shows sleep score or AM routine countdown | STUB-ACCEPTED | `startSleepActivity` pre-schedules morning transition notification at `wakeTimeISO`, body is `Recovery: ${score}/100` or `Morning routine` |
| 4 | Today screen prominently displays Shift Readiness Score | VERIFIED | `showRecovery` gate no longer requires `isAvailable`; `RecoveryScoreCard` shows when `adherenceScore !== null`; fallback chain: HK weeklyAccuracy -> HK lastNight -> adherenceScore |
| 5 | Score trends visible over time (improving/declining) | VERIFIED | `WeeklyTrendChart` uses `adherenceDailyScores` from `useScoreStore.weeklyScores()` when HK `dailyScores` is empty; null scores render as empty bar (`'-'`) |

**Score:** 5/5 truths verified (3 with accepted stub limitation, 2 fully verified)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/adherence/adherence-calculator.ts` | Pure score formula, exports `computeAdherenceScore`, `AdherenceEvent`, `AdherenceEventType` | VERIFIED | 49 lines, no React/RN imports, 40/35/25pt weights, null for no-shift days |
| `src/store/score-store.ts` | Zustand persist store, exports `useScoreStore`, `DailyScore`, `ScoreStore` | VERIFIED | 104 lines, mirrors notification-store pattern, `partialize` excludes setters |
| `__tests__/store/score-store.test.ts` | Unit tests for formula and store behavior | VERIFIED | 27 tests passing — 10 formula cases + 17 store behavior cases |
| `src/lib/adherence/live-activity-service.ts` | Stub with correct API surface, notification fallback, `LIVE_ACTIVITIES_AVAILABLE` guard | VERIFIED (STUB-ACCEPTED) | 137 lines, no expo-widgets import, `SchedulableTriggerInputTypes.TIME_INTERVAL` fix applied |
| `src/hooks/useNightSkyMode.ts` | Calls `startSleepActivity` on activation, `endSleepActivity` on deactivation | VERIFIED | `useRef` + `useEffect([data.isActive])` pattern; imports from `live-activity-service` |
| `src/hooks/useRecoveryScore.ts` | Extended with `adherenceScore` + `adherenceDailyScores` fields | VERIFIED | `useScoreStore.getState()` called inside `fetchData` before HealthKit guard |
| `app/(tabs)/index.tsx` | Relaxed `showRecovery` gate, fallback score chain, `WeeklyTrendChart` fallback | VERIFIED | Gate drops `isAvailable`; score chain adds `recovery.adherenceScore`; chart uses `adherenceDailyScores` when HK empty |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/store/score-store.ts` | `AsyncStorage` | Zustand persist with `partialize` | WIRED | `partialize: (s) => ({ dailyHistory, pendingEvents, lastFinalizedDateISO })` confirmed at line 97-101 |
| `src/lib/adherence/adherence-calculator.ts` | `src/store/score-store.ts` | Called by `finalizeDay` | WIRED | `computeAdherenceScore(s.pendingEvents, hasSleepBlock, dateISO)` at line 68 |
| `src/hooks/useNightSkyMode.ts` | `src/lib/adherence/live-activity-service.ts` | `startSleepActivity` on `isActive` flip | WIRED | `useEffect([data.isActive])` calls `startSleepActivity` at line 140, `endSleepActivity` at line 151 |
| `src/lib/adherence/live-activity-service.ts` | `expo-notifications` | `scheduleNotificationAsync` for stub fallback | WIRED | Four `scheduleNotificationAsync` calls (wind-down, sleep, morning, update); all use `TIME_INTERVAL` trigger type |
| `app/(tabs)/index.tsx` | `src/hooks/useRecoveryScore.ts` | `useRecoveryScore()` call | WIRED | `recovery.adherenceScore` used in `showRecovery` gate (line 84) and `RecoveryScoreCard` score prop (line 184) |
| `src/hooks/useRecoveryScore.ts` | `src/store/score-store.ts` | `useScoreStore.getState()` inside `fetchData` | WIRED | Line 91-93: `useScoreStore.getState().todayScore()` and `weeklyScores()` |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `app/(tabs)/index.tsx` (RecoveryScoreCard) | `recovery.adherenceScore` | `useScoreStore.getState().todayScore()` in `fetchData` | Yes — reads from `dailyHistory` in AsyncStorage-persisted store | FLOWING |
| `app/(tabs)/index.tsx` (WeeklyTrendChart) | `recovery.adherenceDailyScores` | `useScoreStore.getState().weeklyScores()` in `fetchData` | Yes — maps last 7 days from `dailyHistory`; returns `null` for unfinalized days | FLOWING |
| `WeeklyTrendChart` | `dailyScores` prop | HK `dailyScores` or `adherenceDailyScores` fallback | Conditional — HK path requires HealthKit data; adherence path reads from store | FLOWING (both paths wired) |

Note: `adherenceScore` will be `null` until `finalizeDay` is called (daily nightly job). The `showRecovery` gate correctly gates on `adherenceScore !== null`, so the card only renders after the first finalized day. This is correct behavior, not a hollow prop.

---

## Behavioral Spot-Checks

Step 7b skipped for Live Activity stubs (no runnable native module in Expo Go environment). Score store behavior verified via Jest test suite (27/27 passing).

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| computeAdherenceScore formula | `npx jest __tests__/store/score-store.test.ts --no-coverage` | 27 tests passed | PASS |
| TypeScript compilation (phase 05 files) | `npx tsc --noEmit 2>&1 \| grep phase-05-files` | No errors in any phase 05 file | PASS |
| Pre-existing TS errors | `settings.tsx` — 3 errors on `Promise<SyncStatus>` property access | Pre-existing, unrelated to phase 05 | INFO (not a phase 05 issue) |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| LIVE-01 | 05-03-PLAN.md | Wind-down countdown on Dynamic Island / lock screen | STUB-ACCEPTED | `startSleepActivity` schedules notification with `label` (e.g. "Wind-down in 45 min"); `LIVE_ACTIVITIES_AVAILABLE` guard present; real ActivityKit path stubbed for EAS Build |
| LIVE-02 | 05-03-PLAN.md | At bedtime, Live Activity displays "Sleep" message | STUB-ACCEPTED | Pre-scheduled sleep notification at `bedtimeISO` with `body: 'Sleep well 😴'` |
| LIVE-03 | 05-03-PLAN.md | Morning Live Activity shows sleep score or AM routine countdown | STUB-ACCEPTED | Pre-scheduled morning notification at `wakeTimeISO` with `body: Recovery: ${score}/100` or `Morning routine` |
| SCORE-01 | 05-01-PLAN.md | App calculates Shift Readiness Score based on plan adherence | SATISFIED | `computeAdherenceScore` (40/35/25 weights, null for no-shift days) + `useScoreStore` persist store |
| SCORE-02 | 05-02-PLAN.md | Score displays prominently on Today screen | SATISFIED | `showRecovery` gate drops `isAvailable`; `RecoveryScoreCard` shows on `adherenceScore !== null`; `accuracy_tracking` is free-tier feature |
| SCORE-03 | 05-01-PLAN.md + 05-02-PLAN.md | Score trends visible over time (improving/declining) | SATISFIED | `weeklyScores()` returns 7-day window; `WeeklyTrendChart` renders null as empty bar (`'-'`), score as colored bar |

All 6 requirement IDs from PLAN frontmatter accounted for. No orphaned requirements found for Phase 5 in REQUIREMENTS.md (status column shows all 6 as "Complete").

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/adherence/live-activity-service.ts` | 46-48 | `TODO: import ShiftWellLiveActivity` (2 TODO comments) | INFO | Intentional — marks real ActivityKit implementation site; not user-visible; accepted stub |
| `src/lib/adherence/live-activity-service.ts` | 108 | `TODO: activityRef?.update(state)` | INFO | Intentional — placeholder for real update path; not user-visible; accepted stub |
| `src/lib/adherence/live-activity-service.ts` | 128 | `TODO: activityRef?.end()` | INFO | Intentional — placeholder for real end path; not user-visible; accepted stub |

No blockers. All TODOs are intentional stubs for the pre-declared EAS Build limitation. No empty returns flowing to user-visible rendering. No hardcoded `[]` or `{}` passed to display components.

---

## Human Verification Required

### 1. Recovery Score Card Visibility

**Test:** Install the app on device. Enter a shift schedule. Ensure a sleep block exists in the plan. Manually call `useScoreStore.getState().recordEvent(...)` for all three event types via DevTools or a debug screen, then call `finalizeDay`. Navigate to Today tab.
**Expected:** `RecoveryScoreCard` renders with a numeric score (not null). `WeeklyTrendChart` renders with bars.
**Why human:** Requires real device session with store data; cannot test Zustand + AsyncStorage persistence programmatically in this environment.

### 2. Live Activity Notification Timing

**Test:** Set up a plan with a sleep block 10+ minutes in the future. Activate Night Sky Mode (or wait for wind-down window). Check notification center.
**Expected:** Three notifications are queued: one immediate (wind-down), one at bedtime ("Sleep well"), one at wake time ("Recovery: X/100" or "Morning routine").
**Why human:** Requires physical device with notification permissions; `expo-notifications` scheduling requires runtime, not static analysis.

### 3. WeeklyTrendChart null Bar Rendering

**Test:** In a state where some days have no finalized score, view the WeeklyTrendChart.
**Expected:** Null-score days show an empty bar with `'-'` label, not `0` or a full bar.
**Why human:** Visual rendering requires running the app; chart height logic at `score !== null ? ... : 4` (minimum height) confirmed in code but pixel output needs visual check.

---

## Gaps Summary

No gaps. All automated checks passed. Phase 05 goal is achieved subject to the pre-declared Live Activities stub limitation, which is architecturally correct (correct API surface, `LIVE_ACTIVITIES_AVAILABLE` guard, notification fallback) and accepted for TestFlight v1.0.

The only remaining work for LIVE-01/02/03 to fully satisfy their UI intent is the EAS Build + Xcode + ActivityKit swap-in, which is blocked on Apple Developer enrollment — a non-code dependency.

---

_Verified: 2026-04-02T14:23:14Z_
_Verifier: Claude (gsd-verifier)_
