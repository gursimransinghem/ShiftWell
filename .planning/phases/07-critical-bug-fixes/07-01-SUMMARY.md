---
phase: 07-critical-bug-fixes
plan: 01
subsystem: premium-trial, score-store, navigation
tags: [bug-fix, trial, score, downgrade, routing]
dependency_graph:
  requires: []
  provides: [trial-auto-start, score-finalization, downgrade-screen]
  affects: [premium-store, score-store, app-lifecycle]
tech_stack:
  added: []
  patterns: [zustand-state-init, appstate-lifecycle, expo-router-replace]
key_files:
  created:
    - app/downgrade.tsx
  modified:
    - src/store/premium-store.ts
    - app/index.tsx
    - app/_layout.tsx
decisions:
  - "Trial auto-start placed in initializePremium before RevenueCat init — ensures immediate trial access on first launch without dev seed dependency"
  - "finalizeDay called on every background→active transition (not just cold launch) — captures any day the app was backgrounded"
  - "Expired-trial detection uses reactive useEffect on [trialStartedAt, isInTrial, isPremium] — handles both cold launch and runtime expiry"
metrics:
  duration: 4min
  completed_date: 2026-04-07
  tasks: 2
  files_modified: 4
---

# Phase 07 Plan 01: Critical Bug Fixes — Trial, Score, Downgrade Summary

Trial auto-start wired into initializePremium, score finalization hooked to AppState foreground transition, and downgrade screen built with 8 premium feature rows and upgrade CTA.

## What Was Built

### Task 1: Trial auto-start + score finalization (BUG-01, BUG-02)

**BUG-01 — Trial auto-start (`src/store/premium-store.ts`)**
Added `if (!trialStartedAt) { get().startTrial(); }` inside `initializePremium()` after trial state is refreshed from persisted date. This runs on every cold launch — `startTrial()` is idempotent (no-op if already started), so it's safe to call repeatedly. Trial now starts automatically without any dev seed dependency.

**BUG-01 — Remove seedMockData coupling (`app/index.tsx`)**
Removed `usePremiumStore.getState().startTrial()` call from `seedMockData`. Removed `usePremiumStore` import. This decouples trial start from dev scaffolding.

**BUG-04 partial — Type fixes (`app/index.tsx`)**
Fixed `napPreference: 20` (number) → `napPreference: true` (boolean) to match `UserProfile` interface. Fixed `commuteMinutes` → `commuteDuration` to match the correct field name.

**BUG-02 — Score finalization (`app/_layout.tsx`)**
Added `scoreState.finalizeDay(today, hasSleepBlock)` inside the `AppState background→active` handler. Imports added: `format` from `date-fns`, `useScoreStore`, `usePlanStore`, `router` from `expo-router`. The `hasSleepBlock` flag is derived from the current plan's blocks.

### Task 2: Downgrade screen + expired-trial routing (BUG-03)

**`app/downgrade.tsx` (new file, 240 lines)**
Full-screen downgrade screen matching paywall.tsx aesthetic:
- Header with hourglass icon, "Your Trial Has Ended" title, explanatory subtitle
- Feature summary card with 8 locked premium features (Ionicons icons + `lock-closed-outline`)
- Gold CTA button "Upgrade to ShiftWell Pro" → `router.replace('/paywall')`
- Secondary text link "Continue with free features" → `router.replace('/(tabs)')`
- Styles match paywall: COLORS/SPACING/RADIUS tokens, glass card, gold shadow on CTA

**Expired-trial routing (`app/_layout.tsx`)**
Added reactive selectors (`trialStartedAt`, `isInTrial`, `isPremium`) and new `useEffect` that routes to `/downgrade` when `trialStartedAt && !isInTrial && !isPremium`. Fires on state change (covers both cold launch and runtime expiry). Added `<Stack.Screen name="downgrade" options={{ headerShown: false }} />` to the navigation stack.

## Deviations from Plan

**1. [Rule 1 - Bug] Fixed `commuteMinutes` → `commuteDuration` in app/index.tsx**
- **Found during:** Task 1 (while checking napPreference type)
- **Issue:** `app/index.tsx` line 42 used `commuteMinutes` which doesn't exist on `UserProfile` — the correct field is `commuteDuration`
- **Fix:** Changed to `commuteDuration: 15`
- **Files modified:** app/index.tsx
- **Commit:** 97f703d

The plan mentioned fixing `napPreference` but didn't explicitly list `commuteMinutes`/`commuteDuration`. Fixed both since they were adjacent type errors in the same setProfile call.

## Verification Results

| Check | Result |
|-------|--------|
| `npx tsc` errors in premium-store/index.tsx/_layout/downgrade | 0 errors |
| `startTrial` appears in `initializePremium` | Line 91: `get().startTrial()` |
| `startTrial` in app/index.tsx | 0 occurrences (removed) |
| `finalizeDay` in app/_layout.tsx | Line 113 |
| app/downgrade.tsx exists | Yes |
| All 354 tests pass | 354/354 |

## Known Stubs

None — all three fixes wire real production behavior with no placeholder data.

## Self-Check: PASSED

Files confirmed:
- app/downgrade.tsx: EXISTS
- src/store/premium-store.ts: modified (initializePremium has startTrial call)
- app/index.tsx: modified (no startTrial, napPreference: true, commuteDuration)
- app/_layout.tsx: modified (finalizeDay, downgrade route, expired-trial useEffect)

Commits confirmed:
- 97f703d: feat(07-01): fix trial auto-start, score finalization, napPreference type
- 58d4a09: feat(07-01): add downgrade screen and expired-trial routing
