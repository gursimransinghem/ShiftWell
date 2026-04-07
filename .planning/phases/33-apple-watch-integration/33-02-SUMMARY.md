---
phase: 33-apple-watch-integration
plan: "02"
subsystem: ui-watch-complication
tags: [hrv, apple-watch, calibration-banner, background-delivery, complication]
dependency_graph:
  requires: [33-01]
  provides: [hrv-calibration-banner, watch-complication-spec, background-delivery-config]
  affects: [today-screen, app-config]
tech_stack:
  added: [src/components/today/HRVCalibrationBanner.tsx, WATCH-COMPLICATION-SPEC.md]
  patterns: [expo-ionicons, zustand-store-read, modal-detail-view]
key_files:
  created:
    - src/components/today/HRVCalibrationBanner.tsx
    - .planning/phases/33-apple-watch-integration/WATCH-COMPLICATION-SPEC.md
  modified:
    - src/components/today/index.ts
    - app/(tabs)/index.tsx
    - app.json
decisions:
  - "Watch complication flagged REQUIRES-NATIVE — Expo managed workflow cannot directly build watchOS extensions"
  - "Interim strategy: TestFlight users use lock screen widget or Live Activity (Phase 5) as proxy"
  - "AppGroup group.app.shiftwell documented as data sharing pattern for future native build"
  - "UIBackgroundModes adds fetch + remote-notification (healthkit not needed for observer queries post-watchOS 8)"
  - "NSHealthShareUsageDescription updated to explicitly mention HRV per App Store review guidelines"
metrics:
  duration: "8 minutes"
  completed: "2026-04-07"
  tasks: 2
  files: 5
---

# Phase 33 Plan 02: Watch Complication and HRV Banner Summary

HRVCalibrationBanner component showing Day X/14 calibration progress and post-calibration HRV Enhanced badge, plus app.json background delivery entitlement and full watchOS complication specification with AppGroup data-sharing pattern.

## What Was Built

### Task 1: HRV Calibration Banner and Today Screen Updates

**`src/components/today/HRVCalibrationBanner.tsx`** — new component:
- Renders nothing when no Apple Watch detected (`hrv_available === false && !hrv_calibrating`)
- Shows calibration card during days 1-13:
  - Ionicons `watch-outline` in gold (#F59E0B)
  - Title: "Calibrating Apple Watch HRV"
  - Subtitle: "Day X/14 — HRV will improve your recovery score accuracy"
  - Thin gold progress bar filling from 0 to 100% over 14 nights
  - Days remaining note: "X nights remaining"
- Shows "HRV Enhanced" tappable badge post-calibration:
  - Tapping opens modal with current SDNN and baseline values
  - Modal: "Your Apple Watch HRV data is contributing to your recovery score"
- Shows "HRV paused during shift transition" note when `hrv_suppressed_transition`
- Reads all state directly from score-store (no props)

**`src/components/today/index.ts`**: exports `HRVCalibrationBanner`

**`app/(tabs)/index.tsx`**: imports and renders banner below `ScoreBreakdownCard` and above `SleepDebtCard` in the recovery state section

### Task 2: Background Delivery and Watch Complication Config

**`app.json`** updates:
- `UIBackgroundModes`: adds `fetch` and `remote-notification` (enables background HealthKit delivery wake)
- `NSHealthShareUsageDescription`: updated to explicitly mention HRV from Apple Watch (App Store review compliance)
- `com.apple.developer.healthkit.background-delivery: true` was already present (confirmed)

**`.planning/phases/33-apple-watch-integration/WATCH-COMPLICATION-SPEC.md`**:
- Complication type: `CLKComplicationTemplateCircularSmallSimpleText` (primary), `CLKComplicationTemplateGraphicCircularStackText` (graphic)
- Data: recovery score (primary), shift countdown/label (secondary)
- Full Swift `CLKComplicationDataSource` implementation reference
- AppGroup data sharing: `UserDefaults(suiteName: "group.app.shiftwell")`
- Refresh: 2-hour cadence via `CLKComplicationServer.reloadTimeline()`
- Flagged `REQUIRES-NATIVE` — full implementation deferred to Phase 36+ (post Expo ejection or custom native module)
- TestFlight interim: iOS lock screen widget or existing Live Activity (Phase 5)

## Deviations from Plan

None — plan executed exactly as written.

The watch complication native development is correctly documented as a stub per the plan spec: "Document as REQUIRES-NATIVE flag — plan a future phase for full native watchOS complication."

## Test Results

| Suite | Tests | Status |
|-------|-------|--------|
| Full suite | 908 | 907 pass, 1 fail (pre-existing) |

No regressions from Plan 02 changes.

## Known Stubs

- Watch face complication: documented as REQUIRES-NATIVE — actual watch face UI requires native Swift watchOS extension. The spec document serves as the implementation blueprint for Phase 36+.

## Self-Check: PASSED

- src/components/today/HRVCalibrationBanner.tsx: FOUND
- app.json background-delivery entitlement: FOUND
- WATCH-COMPLICATION-SPEC.md: FOUND
- Commit 1bb1287 (Task 1 HRV banner): FOUND
- Commit d93ab3d (Task 2 config + spec): FOUND
