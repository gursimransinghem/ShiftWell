---
phase: 21-predictive-scheduling-research
plan: 01
subsystem: research
tags: [fatigue-modeling, SAFTE, FAID, CAS, three-process-model, prediction, circadian, lookahead, shift-work, SCSI]

# Dependency graph
requires:
  - phase: 08-adaptive-brain-core
    provides: "CircadianState pattern and energy-model.ts architecture that prediction extends"
  - phase: 03-sleep-plan-generation
    provides: "classify-shifts.ts, sleep-windows.ts, PlanBlock types the prediction engine integrates with"
provides:
  - "FATIGUE-MODEL-COMPARISON.md: 4-model evaluation with mobile scoring and definitive recommendation"
  - "PREDICTION-ALGORITHM-SPEC.md: SCSI algorithm spec with TypeScript interfaces for Phase 22 implementation"
  - "SLEEP-SCIENCE-DATABASE.md v1.3: 13 new predictive scheduling citations"
affects:
  - 22-predictive-scheduling-implementation
  - src/lib/prediction/

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hybrid fatigue model: Modified TPM (Three-Process) + FAID-inspired schedule scorer"
    - "Two-layer degradation: calendar-only mode (schedule scorer) upgrades to biometric-enhanced (TPM) as data becomes available"
    - "CircadianState propagation pattern: carry forward acrophaseHour, sleepDebtHours, consecutiveNightShifts across 14-day lookahead"

key-files:
  created:
    - ".planning/phases/21-predictive-scheduling-research/FATIGUE-MODEL-COMPARISON.md"
    - ".planning/phases/21-predictive-scheduling-research/PREDICTION-ALGORITHM-SPEC.md"
  modified:
    - "docs/science/SLEEP-SCIENCE-DATABASE.md"

key-decisions:
  - "Recommendation: Hybrid Modified Three-Process Model + FAID-inspired Transition Stress Scorer — extends existing Two-Process engine without replacing it, all equations public domain"
  - "Do NOT license SAFTE-FAST or CAS — enterprise pricing ($10K-100K+/yr), wrong tier for consumer app"
  - "Algorithm name: ShiftWell Circadian Stress Index (SCSI)"
  - "5-factor TSS scoring: rotation direction, recovery time, consecutive nights, cumulative debt, shift duration — all weights from published research"
  - "Sleep debt escalation rule: >8h entering a transition bumps severity one tier (Van Dongen 2003)"
  - "Transition detection threshold: >4h phase shift required (Eastman & Burgess 2009)"
  - "Pre-adaptation window: 2-4 days before transition depending on severity (Crowley 2003)"
  - "Performance target: full 14-day SCSI scan <50ms on-device"

patterns-established:
  - "Research deliverable pattern: COMPARISON doc → SPEC doc; comparison drives recommendation, spec implements it"
  - "Graceful degradation: calendar-only fallback (FAID-mode) → sleep data mode (TPM-mode)"

requirements-completed:
  - RES-09
  - RES-10

# Metrics
duration: 6min
completed: 2026-04-07
---

# Phase 21 Plan 01: Predictive Scheduling Research Summary

**SCSI algorithm designed from scratch: hybrid Three-Process Model + FAID-inspired scorer with 15 cited sources, TypeScript interfaces, and full Phase 22 integration spec**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-07T18:23:37Z
- **Completed:** 2026-04-07T18:29:32Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Evaluated 4 biomathematical fatigue models (Two-Process, SAFTE, FAID, CAS + TPM) against 5 mobile-specific criteria with scored comparison matrix
- Made definitive recommendation: hybrid Modified Three-Process Model + FAID-inspired Transition Stress Scorer — extends existing engine, all equations in public domain, no licensing required
- Named the algorithm: ShiftWell Circadian Stress Index (SCSI), fully specified with TypeScript interfaces for Phase 22
- Documented all 5 scoring penalty functions with exact formulas, sources, and calibration rationale
- Added 13 new peer-reviewed citations to SLEEP-SCIENCE-DATABASE.md under a new v1.3 Predictive Scheduling section

## Task Commits

1. **Task 1: Fatigue model comparison** - `0f908c8` (feat)
2. **Task 2: Prediction algorithm specification + SLEEP-SCIENCE-DATABASE update** - `95a1323` (feat)

## Files Created/Modified

- `.planning/phases/21-predictive-scheduling-research/FATIGUE-MODEL-COMPARISON.md` — 4-section model evaluation: literature (15 sources), model deep dives (4 models), mobile scoring matrix (5 criteria), and definitive recommendation with implementation sizing
- `.planning/phases/21-predictive-scheduling-research/PREDICTION-ALGORITHM-SPEC.md` — 7-section SCSI algorithm spec: overview, TypeScript interfaces (PredictionInput, TransitionPrediction, CircadianState), numbered pseudocode, thresholds with citations, 7 edge cases, Phase 22 integration notes
- `docs/science/SLEEP-SCIENCE-DATABASE.md` — Added v1.3 section with 13 new citations covering fatigue models (Hursh 2004, Dawson 2005, Akerstedt 1997/2004, Folkard & Tucker 2003, Folkard & Lombardi 2006, Mallis 2004, Gander 2011, Moore-Ede 2004) and circadian adaptation science (Eastman 2009, Burgess 2003, St. Hilaire 2017, Wilson 2020 FIPS)

## Decisions Made

- **Hybrid model, not SAFTE or CAS:** SAFTE-FAST is enterprise-only ($10K-50K/yr). CAS parameters are fully proprietary — cannot be implemented independently. The Three-Process Model (TPM) equations are published (Akerstedt & Folkard 1997) and open-sourced (FIPS R package). TPM is a direct extension of the existing Two-Process engine rather than a parallel system.
- **SCSI algorithm name:** "ShiftWell Circadian Stress Index" — clearly communicates purpose, contains the brand, and distinguishes it from the academic Three-Process Model it derives from.
- **Five-factor TSS scoring:** Each factor derives from a specific published study. This makes the scoring defensible and auditable — not an arbitrary weighting scheme. Rotation direction from Czeisler 1990, recovery time from Belenky 2003, consecutive nights from Folkard & Tucker 2003, sleep debt from Van Dongen 2003, shift duration from Folkard & Lombardi 2006.
- **Pre-adaptation window 2-4 days:** Crowley et al. (2003) validated 3-5 days for 8-12h shifts. SCSI applies 2-4 days (conservative since ER shift workers get 1-2 days off between rotations — full ideal window rarely available).
- **Sleep debt >8h escalates severity one tier:** Van Dongen demonstrated cognitive impairment equivalent to 48h sleep deprivation after 14 nights of 6h sleep. Entering a hard transition with >8h accumulated debt is a distinct and more dangerous state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Resolved file path discrepancy for SLEEP-SCIENCE-DATABASE.md**
- **Found during:** Task 2
- **Issue:** Plan references `docs/research/SLEEP-SCIENCE-DATABASE.md` but the actual file is at `docs/science/SLEEP-SCIENCE-DATABASE.md`. No file exists at the plan's referenced path.
- **Fix:** Updated the correct `docs/science/SLEEP-SCIENCE-DATABASE.md` file (the canonical location) and committed it to the worktree. The reference in the plan spec was an authoring error — the science/ path is the correct canonical location per CLAUDE.md file map.
- **Files modified:** `docs/science/SLEEP-SCIENCE-DATABASE.md`
- **Committed in:** `95a1323` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical path resolution)
**Impact on plan:** Cosmetic path correction only. Research content unaffected. SLEEP-SCIENCE-DATABASE.md correctly updated at canonical location.

## Issues Encountered

The worktree branch (`worktree-agent-a3d658c7`) was diverged from `main` and did not contain the `.planning/` directory or `docs/` directory from the main branch. The plan phase directory and docs/science/ path were created fresh in the worktree. This is expected behavior for isolated agent worktrees.

## User Setup Required

None — no external service configuration required. This is a research phase producing documentation only.

## Next Phase Readiness

**Phase 22 (predictive-scheduling-implementation) is ready to begin with:**
- Algorithm fully specified: SCSI with 5-factor Transition Stress Scorer and Three-Process state propagation
- TypeScript interfaces defined: `PredictionInput`, `TransitionPrediction`, `LookaheadResult`, `CircadianState`
- Integration path clear: extends `energy-model.ts` without breaking existing 354 tests; feeds into existing `bedtimeOffsetMinutes` param in `computeSleepBlocks()`
- File structure specified: `src/lib/prediction/` with 6 files (~590 LOC estimated)
- Performance target: <50ms for full 14-day scan on-device
- All thresholds documented with citations — implementer does not need to research justification for any magic number

---
*Phase: 21-predictive-scheduling-research*
*Completed: 2026-04-07*
