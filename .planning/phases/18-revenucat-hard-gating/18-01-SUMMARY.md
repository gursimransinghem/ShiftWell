---
phase: 18-revenucat-hard-gating
plan: "01"
subsystem: premium
tags: [premium, paywall, grandfathering, feature-gating, adaptive-brain]
dependency_graph:
  requires:
    - "17-01"  # growth engine (AB testing, referral)
  provides:
    - "grandfathering module — isGrandfathered(installedAt) -> boolean"
    - "premium feature type expansion — adaptive_brain, ai_coaching, pattern_recognition, predictive_scheduling"
    - "paywall gates on Today screen for adaptive brain"
  affects:
    - "src/store/premium-store.ts — canAccess now respects grandfathering"
    - "app/(tabs)/index.tsx — AdaptiveInsightCard + SleepDebtCard gated"
    - "app/(tabs)/settings.tsx — Free Plan section for non-premium users"
tech_stack:
  added: []
  patterns:
    - "isGrandfathered(installedAt): pure synchronous function with safety-net for null/invalid dates"
    - "isFeatureAvailable accepts status object { isPremium, isInTrial?, isGrandfathered? }"
    - "PremiumFeatureGate inline component — locked card with upgrade CTA"
key_files:
  created:
    - src/lib/premium/grandfathering.ts
    - __tests__/lib/premium/grandfathering.test.ts
    - __tests__/lib/premium/entitlements.test.ts
  modified:
    - src/lib/premium/entitlements.ts
    - src/store/premium-store.ts
    - app/(tabs)/index.tsx
    - app/(tabs)/settings.tsx
    - src/store/brief-store.ts
decisions:
  - "PAYWALL_LAUNCH_DATE set to 2026-06-01 — placeholder until actual TestFlight launch date known; all current users grandfathered by design"
  - "isGrandfathered returns true for null/undefined/invalid dates — safety net for unknown install dates"
  - "Exact match on PAYWALL_LAUNCH_DATE is grandfathered (<=, not <) — same day = early adopter"
  - "SleepDebtCard gated with canUseAdaptiveBrain — it is Adaptive Brain data, not a free-tier feature"
  - "On-shift AdaptiveInsightCard uses simpler AND gate (not ternary with fallback) since on-shift context is not the primary paywall entry point"
metrics:
  duration: "~25 minutes"
  completed: "2026-04-07"
  tasks: 2
  files_changed: 8
---

# Phase 18 Plan 01: RevenueCat Hard Gating Summary

**One-liner:** Activated premium feature gating for Adaptive Brain with grandfathering logic (isGrandfathered via installedAt timestamp, PAYWALL_LAUNCH_DATE 2026-06-01) and paywall gates on Today screen and Settings.

## What Was Built

### Grandfathering Module (src/lib/premium/grandfathering.ts)

Pure synchronous function `isGrandfathered(installedAt: string | null | undefined): boolean` with boundary date `PAYWALL_LAUNCH_DATE = new Date('2026-06-01T00:00:00.000Z')`.

Safety rules:
- Null/undefined installedAt → grandfathered (unknown install date = legacy user)
- Invalid ISO string → grandfathered (parse error = treat as legacy)
- Exact match on PAYWALL_LAUNCH_DATE → grandfathered (`<=` comparison)

### Entitlements Update (src/lib/premium/entitlements.ts)

Added 4 premium-only Feature types:
- `adaptive_brain` — Adaptive Brain: debt card, insight card, circadian protocols
- `ai_coaching` — Future Phase 20
- `pattern_recognition` — Future Phase 23
- `predictive_scheduling` — Future Phase 22

Updated `isFeatureAvailable` signature from `(feature, isPremium: boolean)` to `(feature, status: { isPremium, isInTrial?, isGrandfathered? })`.

All 14 existing free features remain free. The premium features are not in FREE_FEATURES.

### premium-store.ts canAccess Wiring

`canAccess` now reads the stored `isGrandfathered` value and passes it through `isFeatureAvailable`. The store already had `isGrandfathered` state and `resolveGrandfathered()` action (from pre-existing feature-gate.ts integration).

### Today Screen Gates (app/(tabs)/index.tsx)

- `canUseAdaptiveBrain = canAccess('adaptive_brain')` derived at render time
- Recovery state `AdaptiveInsightCard`: ternary gate — shows card when accessible, `PremiumFeatureGate` component when not
- On-shift state `AdaptiveInsightCard`: AND gate (hidden when not accessible)
- `SleepDebtCard`: `canUseAdaptiveBrain && showDebtCard` guard

**PremiumFeatureGate** — inline component with lock icon, title, description, and "Unlock Premium" CTA navigating to `/paywall`.

### Settings Free Plan Section (app/(tabs)/settings.tsx)

Shown to `!isPremium && !isInTrial && !isGrandfathered` users:
- "YOUR FREE PLAN INCLUDES" section listing 6 core free features
- "UNLOCK WITH PREMIUM" section listing 4 premium features with lock icons
- "Upgrade to Premium" CTA navigating to paywall

## Tests

33 new tests across 2 suites:
- `__tests__/lib/premium/grandfathering.test.ts` — 6 boundary logic tests
- `__tests__/lib/premium/entitlements.test.ts` — 27 tests (feature classification, isFeatureAvailable paths, getLockedFeatures)

Total after phase: 817 tests (816 passing + 1 pre-existing failure unrelated to this plan).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed brief-store.ts call to old isFeatureAvailable boolean signature**
- **Found during:** Task 1 full test run
- **Issue:** `brief-store.ts` called `isFeatureAvailable('cloud_backup', isPremium)` with a boolean — broke when signature changed to object form
- **Fix:** Updated to `isFeatureAvailable('cloud_backup', { isPremium })`
- **Files modified:** src/store/brief-store.ts
- **Commit:** f01d377

### Context Notes

- `feature-gate.ts` (pre-existing from Phase 18 scaffold) serves as the async AsyncStorage-based grandfathering system for `computeIsGrandfathered`. The new `grandfathering.ts` provides the synchronous pure function the plan specified, using the `installedAt` ISO string directly (as written to AsyncStorage with key `'installedAt'` by the onboarding calendar screen).
- PAYWALL_LAUNCH_DATE uses `<=` (same-day grandfathered) as specified in the plan behavior spec.
- Pre-existing test failures (3 suites): `feedbackResult` missing in AdaptiveContext types, plan-store partialize test — these existed before this plan and are out of scope.

## Known Stubs

- **PAYWALL_LAUNCH_DATE (src/lib/premium/grandfathering.ts:14)** — Set to `2026-06-01`. This is intentional: all current users are grandfathered by design until the actual TestFlight launch date is known. Update this constant when the paywall goes live in production.
- **`resolveGrandfathered()` must be called** — premium-store's `isGrandfathered` starts as `false`. The app root must call `resolveGrandfathered()` during initialization for grandfathering to take effect. This wiring is expected in Phase 18 integration (not part of this plan's scope).

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/lib/premium/grandfathering.ts | FOUND |
| __tests__/lib/premium/grandfathering.test.ts | FOUND |
| __tests__/lib/premium/entitlements.test.ts | FOUND |
| .planning/phases/18-revenucat-hard-gating/18-01-SUMMARY.md | FOUND |
| Task 1 commit f01d377 | FOUND |
| Task 2 commit b55f016 | FOUND |
| 33 new tests passing | VERIFIED |
| No new test regressions | VERIFIED (3 pre-existing failures, unchanged) |
