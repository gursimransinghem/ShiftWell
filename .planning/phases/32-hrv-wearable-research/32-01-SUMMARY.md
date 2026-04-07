---
phase: 32-hrv-wearable-research
plan: 01
subsystem: research
tags: [hrv, rmssd, apple-watch, healthkit, recovery-score, wearable, polysomnography, shift-work]

# Dependency graph
requires:
  - phase: 09-circadian-protocols
    provides: transition protocol state (inCircadianTransition flag) needed for HRV suppression logic
  - phase: 05-live-activities-recovery-score
    provides: recovery score architecture that HRV formula extends
provides:
  - 16 peer-reviewed citations on HRV as recovery proxy with shift-worker specifics
  - Apple Watch PPG accuracy data (MAE 3-8ms overnight) vs polysomnography gold standard
  - Complete biometric algorithm spec: SDNN % deviation formula, dynamic weights, baseline calibration
  - Phase 33 implementation guide: file list, HealthKit query structure, permission requirements
affects:
  - Phase 33 Apple Watch Integration (implements this spec directly)
  - score-store.ts (weights change from 55/40/5 to 40/30/25/5 when HRV active)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Personal baseline normalization: % deviation from 30-day rolling mean (not population norms)"
    - "Dynamic weight adjustment: HRV at 25% when available, weights redistribute gracefully when unavailable"
    - "Transition freeze pattern: suspend biometric signals during known physiological disruption periods"
    - "14-night calibration gate before contributing to recovery score"

key-files:
  created:
    - .planning/phases/32-hrv-wearable-research/HRV-LITERATURE-REVIEW.md
    - .planning/phases/32-hrv-wearable-research/WEARABLE-ACCURACY-ASSESSMENT.md
    - .planning/phases/32-hrv-wearable-research/BIOMETRIC-ALGORITHM-SPEC.md
  modified: []

key-decisions:
  - "Use SDNN from HealthKit (not RMSSD) — Apple Watch provides SDNN via background HRV samples; RMSSD only available during Breathe sessions"
  - "Personal baseline (30-day rolling mean) over population norms — shift workers have systematically lower HRV; population thresholds would incorrectly flag all of them"
  - "HRV weight capped at 25% — meaningful signal but imperfect sensor (MAE 3-8ms); keep below 35% to avoid over-weighting"
  - "Nightly batch processing over real-time — overnight is highest accuracy window; real-time HRV adds noise not signal"
  - "Suspend HRV during Phase 9 transition protocols — low HRV during circadian transitions is normal (Viola 2007); penalizing it would be a design error"
  - "14-night minimum baseline before HRV contributes — below this, personal mean is unstable; 14 nights covers work+rest day patterns"

patterns-established:
  - "SDNN proxy pattern: use SDNN as RMSSD proxy for overnight HealthKit queries; % deviation approach is metric-agnostic"
  - "Transparency tagging: tag every recovery score with hrv_included, hrv_suppressed_reason, baseline_confidence"
  - "Backward compatibility guarantee: all existing users unaffected until they have Apple Watch + 14 nights data"

requirements-completed: [RES-16, RES-17, RES-18]

# Metrics
duration: 6min
completed: 2026-04-07
---

# Phase 32 Plan 01: HRV + Wearable Research Summary

**16-source HRV literature review, Apple Watch PPG accuracy assessment (MAE 3-8ms at rest), and complete biometric algorithm spec for SDNN % deviation recovery scoring with dynamic weights and transition-aware calibration**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-07T19:36:14Z
- **Completed:** 2026-04-07T19:42:10Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments

- Comprehensive HRV literature review citing 16 peer-reviewed sources — establishes RMSSD/SDNN as validated recovery proxy, documents shift-worker HRV disruption patterns, and defines personal baseline normalization as the correct approach
- Apple Watch accuracy assessment: MAE 3-8ms at rest vs PSG (usable for trend monitoring), 78-82% sleep stage accuracy (N3 worst at 62%), and explicit recommendation for nightly batch HealthKit processing over real-time
- Complete biometric algorithm spec defining SDNN % deviation formula, dynamic weight system (40/30/25/5 with HRV vs 55/40/5 without), transition period freeze logic, 14-night calibration protocol, HealthKit query structure, and Phase 33 implementation notes — Phase 33 can implement directly from this document

## Task Commits

1. **Task 1: HRV literature review and wearable accuracy assessment** - `17159cb` (feat)
2. **Task 2: Biometric algorithm specification** - `4437e56` (feat)

**Plan metadata:** (final docs commit — see below)

## Files Created

- `.planning/phases/32-hrv-wearable-research/HRV-LITERATURE-REVIEW.md` — 16 citations, RMSSD fundamentals, shift-work HRV, practical thresholds, algorithm implications
- `.planning/phases/32-hrv-wearable-research/WEARABLE-ACCURACY-ASSESSMENT.md` — PPG vs ECG accuracy, sleep stage detection, confidence weight recommendation, batch processing architecture
- `.planning/phases/32-hrv-wearable-research/BIOMETRIC-ALGORITHM-SPEC.md` — complete formula, dynamic weights, transition handling, baseline calibration, HealthKit query spec, Phase 33 file list

## Decisions Made

- **SDNN over RMSSD:** Apple Watch HealthKit provides SDNN via background sampling (not RMSSD). % deviation algorithm is metric-agnostic — works identically with SDNN baseline.
- **Personal baseline mandatory:** Shift workers show 8–15% lower 24-hour HRV than matched day-worker controls (Viola 2007). Population norms would constantly flag shift workers as "poor recovery." Personal 30-day rolling mean self-calibrates to their actual pattern.
- **25% HRV weight:** Balances meaningful signal contribution (Bellenger 2016: HRV adds 30% better correlation) against sensor imperfection (MAE 3-8ms). Keeping below 35% prevents over-weighting.
- **Nightly batch processing:** Overnight is the cleanest measurement window. Industry standard (WHOOP, Oura, Garmin all batch overnight). Real-time HRV adds noise.
- **Suspend HRV in Phase 9 transitions:** Viola 2007 shows HRV suppression during transitions is expected physiology. Applying HRV scoring here would penalize users for following the correct protocol.
- **14-night minimum:** Fewer than 14 nights produces unstable personal mean. 14 nights covers both work-day and rest-day patterns typical for most shift schedules.

## Deviations from Plan

None — plan executed exactly as written. All content from the plan's `<action>` sections was implemented, organized, and augmented with additional supporting detail (algorithm appendix, parameter reference table, backward compatibility notes).

## Issues Encountered

None.

## User Setup Required

None — this is a research phase producing documents, not code. No environment variables or external services required.

## Next Phase Readiness

Phase 33 (Apple Watch Integration) can implement directly from BIOMETRIC-ALGORITHM-SPEC.md:

- Files to modify are named (`src/store/score-store.ts`)
- New files are specified (`src/lib/hrv/hrv-processor.ts`, `src/lib/hrv/hrv-types.ts`)
- HealthKit permission is named (`HKQuantityTypeIdentifierHeartRateVariabilitySDNN`)
- Swift query structure is provided
- Backward compatibility is guaranteed (zero change for users without Apple Watch)
- The 20% recovery accuracy improvement target from the ROADMAP has a documented scientific basis

---
*Phase: 32-hrv-wearable-research*
*Completed: 2026-04-07*
