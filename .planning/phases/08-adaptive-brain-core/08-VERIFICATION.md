---
phase: 08-adaptive-brain-core
verified: 2026-04-07T04:22:32Z
status: passed
score: 5/5 must-haves verified
gaps:
  - truth: "App recalculates the sleep plan exactly once per day when brought to foreground (debounced — does not re-run on every app switch)"
    status: resolved
    reason: "Fixed: AppState background->active subscription added inside useAdaptivePlan useEffect. runAdaptiveBrain fires on both cold launch (mount) and foreground transitions. Debounce gate prevents duplicate runs. Commit 76f0705."
    artifacts:
      - path: "app/_layout.tsx"
        issue: "AppState 'change' handler (lines 99-116) handles calendar sync and score finalization but does NOT invoke runAdaptiveBrain or call any adaptive brain trigger on background->active transition"
      - path: "src/hooks/useAdaptivePlan.ts"
        issue: "useEffect([], []) fires once on mount only. In RN, mounting only happens on cold launch — not on background->foreground if the component stays mounted."
    missing:
      - "Add runAdaptiveBrain(deps) call to the AppState background->active handler in app/_layout.tsx, or add a separate useEffect with AppState subscription inside useAdaptivePlan.ts that re-invokes runAdaptiveBrain on foreground"
      - "The debounce gate already exists and is correct — only the trigger wiring is missing"
human_verification:
  - test: "Confirm AdaptiveInsightCard content is visually correct"
    expected: "Card shows a human-readable change description, the factor icon (color-coded), and either Accept/Dismiss (learning mode) or Undo (calibrated mode) buttons"
    why_human: "Cannot render React Native components in Jest node environment"
  - test: "Confirm SleepDebtCard renders correctly with real HealthKit data"
    expected: "Debt bar shows hours, bank bar shows banked credit when present, 14-night label appears when adaptiveContext is populated"
    why_human: "HealthKit is hardware-dependent and cannot be verified programmatically in test environment"
---

# Phase 8: Adaptive Brain Core — Verification Report

**Phase Goal:** The Adaptive Brain runs once each morning on app foreground, calculates sleep debt over a 14-night rolling window, and surfaces a human-readable explanation of any plan changes on the Today screen.
**Verified:** 2026-04-07T04:22:32Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | App recalculates once per day when brought to foreground (debounced) | PARTIAL | Debounce gate exists and is correct inside `runAdaptiveBrain()`. However, the trigger only fires on cold launch (component mount via `useEffect([], [])`). The `AppState background->active` handler in `_layout.tsx` does NOT call `runAdaptiveBrain`. A backgrounded-but-not-killed app will miss the foreground trigger. |
| 2 | Sleep debt balance reflects prior 14 nights of adherence data | VERIFIED | `runAdaptiveBrain` calls `getSleepHistory(subDays(today, 14), today)` and passes history to `buildAdaptiveContext`, which calls `computeDebtLedger`. `SleepDebtCard` reads `adaptiveContext.debt.rollingHours` and labels the bar "Deficit from last 14 nights" when context is available. Test 6 in `useAdaptivePlan.test.ts` explicitly validates the 14-night chain. |
| 3 | AdaptiveInsightCard appears on Today screen showing what changed and which factor drove it | VERIFIED | Card rendered conditionally in both `recovery` and `on-shift` states in `index.tsx` (`adaptiveContext && adaptiveChanges.length > 0`). Card receives `changes` (from `pendingChanges`) and `context` (from `adaptiveContext`). Displays `primary.humanReadable`, `primary.reason`, factor icon, and color-coded accent. `onDismiss={dismissChanges}` wired to store. |
| 4 | Plan change card includes undo action that reverts to previous plan | VERIFIED | `onUndo={undoPlan}` wired in both render sites in `index.tsx`. `undoPlan()` in plan-store restores `planSnapshot` within 24h window. `AdaptiveInsightCard` shows Undo button for calibrated phase (`!isLearning && daysTracked > 0`). |
| 5 | A human-readable log entry is written for every plan change | VERIFIED | `dismissChanges()` in plan-store stamps each `AdaptiveChange` with ISO timestamp and appends to `changeLog` (capped at 30, persisted via Zustand `persist` middleware). All three dismiss paths (X button, Accept, Dismiss) call `onDismiss()` before `setDismissed(true)`. 6 tests in `plan-store.test.ts` cover this chain. |

**Score:** 4/5 truths verified (1 partial)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/adaptive/types.ts` | `AdaptiveChange` with `timestamp?: string` | VERIFIED | Line 151: `timestamp?: string` — ISO string, populated when moved to `changeLog` on dismiss |
| `src/store/plan-store.ts` | Persisted plan-store with `changeLog`, `dismissChanges` moving to log | VERIFIED | Lines 1-3: persist + AsyncStorage imports. Line 35: `changeLog: AdaptiveChange[]`. Lines 153-163: `dismissChanges` stamps with timestamp and appends. Lines 171-179: `persist` config with `partialize`. |
| `src/components/today/AdaptiveInsightCard.tsx` | X button and Accept button call `onDismiss()` | VERIFIED | Line 62: X button `onPress={() => { onDismiss(); setDismissed(true); }}`. Line 87: Accept `onPress={() => { onDismiss(); setDismissed(true); }}`. Line 93: Dismiss also calls `onDismiss()`. |
| `src/hooks/useAdaptivePlan.ts` | Daily debounce gate via `AsyncStorage` date key | VERIFIED (partial trigger) | Lines 25, 56-57: `ADAPTIVE_LAST_RUN_KEY` and `AsyncStorage.getItem` check. Line 87: `setItem` after success. Gate logic is correct. Trigger only fires on mount — not on foreground transition. |
| `app/(tabs)/index.tsx` | `showDebtCard` gate, `AdaptiveInsightCard` wired with `onDismiss`/`onUndo` | VERIFIED | Lines 149-152: `debtContext` selector and `showDebtCard` boolean. Line 526: `{showDebtCard && <SleepDebtCard />}`. Lines 487-493 and 616-622: `AdaptiveInsightCard` with `onUndo={undoPlan}` and `onDismiss={dismissChanges}`. |
| `__tests__/store/plan-store.test.ts` | Tests for `changeLog`, `dismissChanges`, persist `partialize` | VERIFIED | Lines 255-367: `describe('usePlanStore — changeLog persistence (BRAIN-06)')` with 6 tests covering dismiss→log migration, cap, ISO timestamp, partialize shape, and undoPlan independence. |
| `__tests__/components/AdaptiveInsightCard.test.ts` | Tests for X, Accept, Dismiss, Undo callback wiring | VERIFIED | 11 tests covering all button callbacks via source-analysis pattern. All pass. |
| `__tests__/hooks/useAdaptivePlan.test.ts` | Tests for daily debounce gate and 14-night debt chain | VERIFIED | 6 tests: skip-today, run-null, run-yesterday, setItem-on-success, no-setItem-on-error, 14-night history chain (BRAIN-02). All pass. |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/store/plan-store.ts` | `@react-native-async-storage/async-storage` | Zustand persist middleware | WIRED | `createJSONStorage(() => AsyncStorage)` at line 173 |
| `src/store/plan-store.ts` | `src/lib/adaptive/types.ts` | `AdaptiveChange` import for `changeLog` typing | WIRED | Line 12: `import type { AdaptiveContext, AdaptiveChange }` |
| `src/components/today/AdaptiveInsightCard.tsx` | `src/store/plan-store.ts` | `onDismiss` callback wired in `index.tsx` | WIRED | `index.tsx` line 148: `dismissChanges = usePlanStore(s => s.dismissChanges)`, line 491: `onDismiss={dismissChanges}` |
| `src/hooks/useAdaptivePlan.ts` | `@react-native-async-storage/async-storage` | AsyncStorage date key debounce | WIRED | Lines 13, 56-57, 87 |
| `src/hooks/useAdaptivePlan.ts` | `src/lib/adaptive/context-builder.ts` | `buildAdaptiveContext` called with 14-night history | WIRED | Lines 69-75 |
| `src/lib/adaptive/context-builder.ts` | `src/lib/adaptive/sleep-debt-engine.ts` | `computeDebtLedger` called inside `buildAdaptiveContext` | WIRED | `context-builder.ts` line 13 import, line 146 call |
| `app/(tabs)/index.tsx` | `src/store/plan-store.ts` | `adaptiveContext.debt.severity` read for `SleepDebtCard` gate | WIRED | Lines 149-152 |
| `app/_layout.tsx` | `src/hooks/useAdaptivePlan.ts` | AppState background->active trigger calls `runAdaptiveBrain` | NOT WIRED | `_layout.tsx` AppState handler (lines 99-116) handles calendar sync and score finalization but does NOT invoke `runAdaptiveBrain`. Cold launch covers the mount case. Foreground-without-restart case is uncovered. |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `AdaptiveInsightCard` | `changes: AdaptiveChange[]` | `pendingChanges` from `plan-store`, set by `setAdaptiveContext` after `computeDelta` | Yes — `computeDelta` computes real diffs between plan snapshots | FLOWING |
| `SleepDebtCard` | `adaptiveContext.debt.rollingHours`, `bankHours` | `plan-store.adaptiveContext`, populated by `runAdaptiveBrain` → `buildAdaptiveContext` → `computeDebtLedger` → 14-night HealthKit history | Yes — real HealthKit data when available; score-based fallback when not | FLOWING |
| `SleepDebtCard` (fallback path) | `dailyHistory` | `score-store`, populated by `finalizeDay` | Yes — real score accumulation | FLOWING |

---

## Behavioral Spot-Checks

Step 7b: SKIPPED for UI components — tests run against the node environment. The adaptive logic tests (plan-store, AdaptiveInsightCard source-analysis, useAdaptivePlan) are the behavioral equivalents.

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full test suite (377 tests) | `npx jest --no-coverage` | 377 passed, 0 failed | PASS |
| Phase 08 targeted tests (29 tests) | `npx jest --testPathPatterns="plan-store\|AdaptiveInsightCard\|useAdaptivePlan" --no-coverage` | 29 passed, 0 failed | PASS |
| `adaptive-last-run` key in hook | `grep "adaptive-last-run" src/hooks/useAdaptivePlan.ts` | 1 match at line 25 | PASS |
| `changeLog` cap `.slice(-30)` | `grep "slice(-30)" src/store/plan-store.ts` | 1 match at line 161 | PASS |
| `onDismiss()` at least 3 times in card | `grep -c "onDismiss()" src/components/today/AdaptiveInsightCard.tsx` | 3 matches | PASS |
| `showDebtCard` gate (declaration + usage) | `grep -c "showDebtCard" app/(tabs)/index.tsx` | 3 matches (declaration + 2 conditional renders: recovery + fallback) | PASS |
| AppState handler calls `runAdaptiveBrain` | `grep "runAdaptiveBrain" app/_layout.tsx` | 0 matches | FAIL — foreground trigger missing |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| BRAIN-01 | 08-02-PLAN.md | Morning recalculation runs once per day on app foreground — AppState background→active trigger with AsyncStorage daily debounce | PARTIAL | Debounce gate correct, cold launch covered. Background→active trigger NOT wired in `_layout.tsx`. |
| BRAIN-02 | 08-02-PLAN.md | Sleep debt engine operational — rolling 14-night debt tracker with banking protocol visible on Today screen | SATISFIED | 14-night chain validated by test 6. `SleepDebtCard` conditionally rendered via `showDebtCard`. `SleepDebtCard.tsx` shows bank bars when `bankHours > 0`. |
| BRAIN-04 | 08-01-PLAN.md | AdaptiveInsightCard renders on Today screen when plan changes — shows what changed, which factors drove it, with undo action | SATISFIED | Card wired in both `recovery` and `on-shift` states. `onUndo={undoPlan}` and `onDismiss={dismissChanges}` wired. Undo button present for calibrated phase. |
| BRAIN-06 | 08-01-PLAN.md | Plan change logger produces human-readable explanation — "Bedtime moved earlier because your next shift starts at 6am and debt is high" | SATISFIED | `dismissChanges` moves `pendingChanges` to `changeLog` with ISO timestamp. `changeLog` persisted via Zustand `persist`. `AdaptiveChange.humanReadable` + `reason` fields carry the human-readable explanation. |

**Orphaned requirements check:** BRAIN-03 and BRAIN-05 appear in REQUIREMENTS.md mapped to Phase 9 — correctly out of scope for Phase 8. No orphaned requirements.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/_layout.tsx` | 99-116 | AppState `background->active` handler does not invoke `runAdaptiveBrain` | Warning | Adaptive Brain does not fire on foreground transitions for non-killed apps. BRAIN-01 partial failure. |
| `src/hooks/useAdaptivePlan.ts` | 134 | `useEffect([], [])` comment "Run once on mount" — not on background->active | Info | Design intent documented, but foreground case is not covered by this approach alone. |

No stub anti-patterns found in component or store implementations. No placeholder returns, no empty state that feeds rendering, no TODO markers.

---

## Human Verification Required

### 1. AdaptiveInsightCard Visual Correctness

**Test:** Open the app with an adaptive plan change in effect (or seed `pendingChanges` in dev). Navigate to Today tab.
**Expected:** AdaptiveInsightCard appears at the top of the screen with color-coded left border, factor icon, `humanReadable` text, `reason` text, and either Accept/Dismiss buttons (learning mode) or Undo button (calibrated mode).
**Why human:** Cannot render React Native components in Jest node environment.

### 2. SleepDebtCard with Real HealthKit Data

**Test:** On a device with HealthKit sleep data for the past 14 nights, open the app.
**Expected:** `SleepDebtCard` shows the 14-night debt figure, label reads "Deficit from last 14 nights", bar fills proportionally. Card is hidden when `severity === 'none'` AND `bankHours === 0`.
**Why human:** HealthKit requires real device hardware; cannot be verified programmatically.

### 3. Background-to-Foreground Trigger (GAP)

**Test:** Open app fresh (cold launch) → background app for 1 second → foreground app. Check if adaptive brain fires again vs. the next day.
**Expected per spec:** Adaptive brain fires on foreground transition (debounced to once per day). Current implementation: does NOT fire on foreground transition if component is already mounted.
**Why human:** Requires runtime behavior verification on a physical device.

---

## Gaps Summary

**1 gap blocking full goal achievement:**

The BRAIN-01 requirement states the Adaptive Brain should run "once per day on app foreground" with an "AppState background→active trigger." The implementation added a correct debounce gate inside `runAdaptiveBrain()`, but the trigger itself only fires via `useEffect([], [])` in the hook — which runs on component mount (cold launch only). The `AppState background→active` handler in `app/_layout.tsx` (lines 99-116) handles calendar sync and score finalization but does NOT invoke `runAdaptiveBrain`.

**Practical impact:** On a device where the user opens the app daily without force-quitting (typical iOS behavior), the adaptive brain will only run once ever (on the first cold launch after install), or only after each explicit force-quit + reopen. Users who simply home-button out and return the next morning will not get a recalculation.

**Root cause:** The executor chose "Option B" (hook-based debounce) from the RESEARCH.md but implemented only the debounce gate portion without adding the AppState foreground subscription. The plan (08-02-PLAN.md) describes the foreground trigger semantics correctly in the design notes but the acceptance criteria only checked for the AsyncStorage key presence, not for AppState wiring.

**Fix required (minimal):** One of:
- Add an AppState subscription inside `useAdaptivePlan.ts` that calls `runAdaptiveBrain(deps)` on `background->active` transition, OR
- Add `runAdaptiveBrain` call inside the existing `_layout.tsx` AppState handler (requires importing deps from stores imperatively).

The debounce gate already prevents double-runs — the fix is purely wiring the foreground trigger.

---

*Verified: 2026-04-07T04:22:32Z*
*Verifier: Claude (gsd-verifier)*
