---
phase: 38-advanced-platform-features
plan: 01
subsystem: enterprise
tags: [multi-facility, schedule-optimizer, circadian, HIPAA, recharts, react, typescript]

requires:
  - phase: 27-outcome-data-pipeline
    provides: buildCohortMetrics, UserRecord, CohortMetrics, AnonymizedExport types

provides:
  - Multi-facility report engine (buildMultiFacilityReport, getFacilityRanking, getCrossFacilityComparison)
  - Schedule optimizer with circadian disruption model (analyzeScheduleImpact, generateOptimizationRecommendations)
  - Manager fatigue alert UI component (ManagerAlerts.tsx)
  - Multi-facility dashboard page (dashboard/app/facilities/page.tsx)
  - Facilities API route (GET /api/facilities)

affects:
  - 28-employer-dashboard
  - 29-api-layer
  - 30-enterprise-sales-kit

tech-stack:
  added: []
  patterns:
    - "Multi-facility aggregation: buildMultiFacilityReport wraps buildCohortMetrics per facility, then computes network-wide weighted averages"
    - "TDD: RED (missing module) → GREEN (implementation) → verified with 20 behavioral tests"
    - "Circadian disruption model: penalty-based scoring with adaptation bonus (Eastman, Folkard, Kecklund citations)"
    - "HIPAA enforcement: anonymizedId pattern in UI — real identities never reach employer component"

key-files:
  created:
    - src/lib/enterprise/multi-facility.ts
    - src/lib/enterprise/schedule-optimizer.ts
    - src/lib/enterprise/__tests__/advanced.test.ts
    - dashboard/components/ManagerAlerts.tsx
    - dashboard/app/facilities/page.tsx
    - dashboard/app/api/facilities/route.ts
  modified: []

key-decisions:
  - "Consistent nights threshold set at 90% (not 70%) — a single day shift mixed in indicates rotation, not adaptation"
  - "Long-run night penalty (5+ consecutive) suppressed for adapted permanent night workers — Kecklund & Axelsson 2016 specifically addresses rotating workers"
  - "Night-to-day transition added as highest disruption pattern (25 pts) — backward phase-advance opposes circadian delay direction"
  - "DP disabled (cohortThreshold=0) in unit tests to isolate multi-facility logic from stochastic noise"
  - "Recommendation threshold set at >60 disruption index (not >=60) to avoid edge-case false positives"

patterns-established:
  - "Pattern 1: Multi-facility builds CohortMetrics independently per facility, then aggregates — never mixes user populations"
  - "Pattern 2: Schedule optimizer uses penalty-based scoring; each disruption type maps to a published study"
  - "Pattern 3: Manager alert UI always shows anonymizedId only — never accepts or renders real worker name"

requirements-completed: [ENT-09, ENT-10, ENT-11]

duration: 9min
completed: 2026-04-07
---

# Phase 38 Plan 01: Advanced Platform Features Summary

**Multi-facility CohortMetrics engine + circadian disruption schedule optimizer + HIPAA-compliant manager alert UI with Recharts facilities dashboard**

## Performance

- **Duration:** 9 min
- **Started:** 2026-04-07T20:04:30Z
- **Completed:** 2026-04-07T20:13:39Z
- **Tasks:** 2 (Task 1: TDD with 3 commits; Task 2: 1 commit)
- **Files modified:** 6 created

## Accomplishments

- Built `buildMultiFacilityReport()` that calls `buildCohortMetrics` per facility and aggregates into `CrossFacilityReport` with weighted network averages, ranked list, and best/worst identification
- Implemented circadian disruption scoring engine using penalty model (rapid reversal +30, long run +15, evening-to-day +20, night-to-day +25, consistent nights adaptation -10) with literature citations (Eastman & Burgess 2009, Kecklund & Axelsson 2016, Folkard & Tucker 2003)
- Built `generateOptimizationRecommendations()` that fires for workers >60 disruption index, selecting from 3 evidence-based interventions (permanent nights 35%, night cap 18%, Eastman clockwise protocol 22%)
- Created HIPAA-compliant `ManagerAlerts` component displaying anonymized worker IDs with consent disclaimer, risk sorting, and opt-out notice
- Created multi-facility facilities dashboard page with tab selector, summary cards, Recharts bar chart vs network avg, ranked facility list, and per-facility drill-down with manager alerts

## Task Commits

1. **TDD RED: failing tests for multi-facility + schedule optimizer** - `afd6f07` (test)
2. **GREEN: implement multi-facility.ts and schedule-optimizer.ts** - `3fb317b` (feat)
3. **Task 2: ManagerAlerts UI + facilities dashboard page** - `bacc3f2` (feat)

## Files Created/Modified

- `/Users/claud/Projects/ShiftWell/src/lib/enterprise/multi-facility.ts` - FacilityMetrics type, buildMultiFacilityReport, getFacilityRanking, getCrossFacilityComparison (162 lines)
- `/Users/claud/Projects/ShiftWell/src/lib/enterprise/schedule-optimizer.ts` - ShiftPattern, CircadianDisruptionScore, OptimizationRecommendation types; analyzeScheduleImpact, generateOptimizationRecommendations (339 lines)
- `/Users/claud/Projects/ShiftWell/src/lib/enterprise/__tests__/advanced.test.ts` - 20 behavioral tests for all new functions
- `/Users/claud/Projects/ShiftWell/dashboard/components/ManagerAlerts.tsx` - Alert list with HIPAA consent, anonymized IDs, risk sorting (344 lines)
- `/Users/claud/Projects/ShiftWell/dashboard/app/facilities/page.tsx` - Multi-facility dashboard with Recharts bar chart + ranked list (593 lines)
- `/Users/claud/Projects/ShiftWell/dashboard/app/api/facilities/route.ts` - GET /api/facilities stub returning FacilityConfig[]

## Decisions Made

- Set consistent-nights threshold at 90% (not 70%) — a worker with a day shift mixed in isn't adapted, they're rotating
- Suppressed long-run night penalty for permanent night workers — Kecklund study targets rotating workers, not adapted night staff
- Added night-to-day transition as separate penalty (25 pts) — backward phase-advance is the most disruptive transition type, not captured by the original D→N→D reversal pattern
- Test config uses `cohortThreshold: 0` (DP disabled) — isolates multi-facility logic from stochastic Laplace noise that would obscure deterministic comparison tests

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed consistent-nights threshold masking disruption in fragmented pattern**
- **Found during:** Task 1 GREEN phase — test `consistent night schedule (7+ nights) has lower disruption than fewer nights`
- **Issue:** `isConsistentNights()` used 70% threshold, incorrectly classifying night/day/night fragmented patterns as "consistent nights" (80% nights > 70%)
- **Fix:** Raised threshold to 90%; added night-to-day transition penalty (25 pts) to capture backward phase-advance disruption
- **Files modified:** src/lib/enterprise/schedule-optimizer.ts
- **Verification:** All 20 tests pass
- **Committed in:** `3fb317b`

**2. [Rule 1 - Bug] Fixed DP noise masking small-cohort multi-facility comparisons in tests**
- **Found during:** Task 1 GREEN phase — `computes separate CohortMetrics per facility` and `identifies best/worst` tests
- **Issue:** `defaultConfig.cohortThreshold: 50` applied DP noise to 3-user test cohorts (scale=100, overwhelmed 30-point signal)
- **Fix:** Changed test config to `cohortThreshold: 0` (DP disabled) — DP behavior is already tested in `anonymizer.test.ts`
- **Files modified:** src/lib/enterprise/__tests__/advanced.test.ts
- **Verification:** All 20 tests pass, DP-specific test uses separate `configHighThreshold`
- **Committed in:** `3fb317b`

---

**Total deviations:** 2 auto-fixed (2 Rule 1 - Bug)
**Impact on plan:** Both fixes were necessary to make the scoring model scientifically correct and tests isolated. No scope creep.

## Issues Encountered

- Long-run night penalty interaction with consistent-nights bonus: required careful scoring model design (penalty only for rotating workers, bonus for adapted workers)

## Known Stubs

- `dashboard/app/api/facilities/route.ts`: Returns deterministic fixture data (2 facilities per orgId). Real DB lookup planned in Phase 28.
- `dashboard/app/facilities/page.tsx` (`loadCrossFacilityOverview`): Constructs placeholder `FacilityCohortSummary` with linearly-declining scores. Real aggregation via `buildMultiFacilityReport` planned in Phase 28.
- These stubs are intentional for Phase 38 scope — dashboard renders correctly with placeholder data. Phase 28 will wire the real aggregation pipeline.

## Next Phase Readiness

- Phase 28 (employer-dashboard) can now import `buildMultiFacilityReport` from multi-facility.ts and wire it to real facility user data
- `ManagerAlerts` component is production-ready — props-driven, no stubs in the UI layer
- `analyzeScheduleImpact` + `generateOptimizationRecommendations` are ready to consume real shift data from the calendar sync pipeline
- All enterprise module tests passing (57 total)

---
*Phase: 38-advanced-platform-features*
*Completed: 2026-04-07*
