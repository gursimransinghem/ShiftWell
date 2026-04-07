---
phase: 13-sleep-feedback-research
plan: "01"
subsystem: research-and-specification
tags: [research, wearable-accuracy, feedback-loop, algorithm-spec, validation-plan, healthkit, sleep-science]
dependency_graph:
  requires: []
  provides:
    - LITERATURE-REVIEW.md — 20-source evidence base for Phase 14-15 implementation
    - ALGORITHM-SPEC.md — EMA convergence algorithm with full parameter specification
    - VALIDATION-PLAN.md — 30-day within-subject AB study design
    - SLEEP-SCIENCE-DATABASE.md v1.2 — Phase 13 citation additions
  affects:
    - Phase 14 (HealthKit persistence layer) — use asleepStart field, 14-night ring buffer spec
    - Phase 15 (convergence engine) — implement EMA formula with guards from ALGORITHM-SPEC.md
    - Phase 16 (validation) — execute VALIDATION-PLAN.md 30-day study
tech_stack:
  added: []
  patterns:
    - EWMA (alpha=0.3) for noisy consumer wearable data smoothing
    - AB within-subject design for small-n pilot validation
    - JITAI framework for mHealth adaptive intervention design
    - Wilcoxon signed-rank test for non-normal paired sleep deviation data
key_files:
  created:
    - .planning/phases/13-sleep-feedback-research/LITERATURE-REVIEW.md
    - .planning/phases/13-sleep-feedback-research/ALGORITHM-SPEC.md
    - .planning/phases/13-sleep-feedback-research/VALIDATION-PLAN.md
  modified:
    - docs/science/SLEEP-SCIENCE-DATABASE.md (v1.2 section added)
decisions:
  - "Use asleepStart not inBedStart: removes 10-30 min pre-sleep in-bed time from feedback signal (Natale 2021, r=0.91 timing correlation)"
  - "Dead zone 20 min: median Apple Watch TST error is ±15-20 min (Menghini 2021 meta-analysis) — sub-20-min discrepancies are instrument noise"
  - "EMA alpha=0.3: balances 7-night responsiveness vs. noise stability (Phillips 2017, Skeldon 2016)"
  - "30-min per-cycle cap: circadian resetting capacity maximum 1-2h/day (Golombek 2010) — 30 min is conservative and safe"
  - "Wilcoxon not t-test: shift worker deviation distributions are non-normal (outlier nights, transition events)"
  - "n=20 minimum: power=0.80 to detect d=0.6 medium effect at alpha=0.05, paired design"
  - "Pause during active circadian protocol: protocol prescribes a moving target; feedback would misread movement as deviation"
metrics:
  duration: "11 minutes"
  completed_date: "2026-04-07"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
---

# Phase 13 Plan 01: Sleep Feedback Research Summary

**One-liner:** EMA convergence algorithm (alpha=0.3, 20-min dead zone, 30-min cap) grounded in 20 peer-reviewed sources, with a 30-day within-subject Wilcoxon-validated study design for Phase 16 convergence testing.

---

## What Was Built

Three research documents and an updated science database produced to ground Phase 14–15 implementation in peer-reviewed evidence.

### LITERATURE-REVIEW.md (547 lines)

20 peer-reviewed sources across three domains:

**Domain 1 — Wearable Sleep Accuracy (8 sources):** Chinoy 2021 (7-device PSG), de Zambotti 2019 (foundational framework), Menghini 2021 (meta-analysis: 89% TST sensitivity, 52% wake specificity), Mantua 2025 (six-device comparison: Apple Watch S8 kappa 0.53, TST bias +20 min), Chintalapudi 2024 (Oura 0.65 > Apple Watch 0.60 > Fitbit 0.55), Pesonen 2018 (daytime sleep accuracy: +32 min overestimation vs. +18 min nighttime), Driller 2023 (TST + timing more reliable than stage composition), WSS 2025 (multi-night trending best practice).

**Domain 2 — Apple Watch Specifically (4 sources):** Natale 2021 (timing r=0.91 — more accurate than duration), Apple 2025 white paper (asleepStart vs inBedStart distinction), npj Digital Medicine meta-analysis 2025 (TST overestimate +6 to +40 min range), Duking 2020 (restless sleep degrades accuracy — shift worker relevance).

**Domain 3 — Feedback Loop Architectures (8 sources):** Borbely 1982 (Process S calibration basis), Phillips 2017 (individual tau_s estimation from actigraphy — direct precedent), Skeldon 2016 (5–7 cycle convergence prediction at EMA α=0.3), Golombek 2010 (30-min cap biological basis), Nahum-Shani 2018 (JITAI framework), Rivera 2018 (control systems parameterization), Tanigawa 2024 (shift worker JITAI feasibility), Aji 2022 (self-monitoring + feedback BCT combination, d=0.58).

### ALGORITHM-SPEC.md

Full specification of the EMA convergence engine:
- 8-step formula: guard checks → noise floor → EMA update → proportional gain → per-cycle cap → cumulative offset → minimum sleep guard → output
- Parameters: α=0.3, K_p=0.5, dead zone ±20 min, MAX_ADJUST 30 min, MIN_SLEEP 420 min
- All guard conditions documented with scientific rationale
- Edge cases: seeding (nights 1–3), daytime sleepers (confidence multiplier 0.75), split nights (primary block only), manual override (7-day pause), recovery after data gap
- Integration points: context-builder.ts, sleep-comparison.ts, plan-store (new actions setBedtimeOffset/setWakeOffset)

### VALIDATION-PLAN.md

30-day within-subject AB study design:
- Baseline Days 1–7 (feedback OFF) → Buffer Days 8–9 → Intervention Days 10–30 (feedback ON)
- Primary test: Wilcoxon signed-rank on paired (nights 1–7 vs. nights 22–28) mean absolute bedtime deviation
- Effect size: Cohen's d > 0.5 for Phase 16 go/no-go decision
- n=20 minimum (80% power, d=0.6, alpha=0.05, paired design)
- 4 failure criteria with specific algorithmic revision plans
- Pre-specified subgroup analyses: night vs. rotating vs. day shift, Apple Watch series version, baseline deviation magnitude
- Optional PSQI-SF 4-item end-of-study survey

### SLEEP-SCIENCE-DATABASE.md — v1.2 Section

10 new citations added: Phillips 2017, Skeldon 2016, Golombek 2010, Chintalapudi 2024, Pesonen 2018, Driller 2023, Duking 2020, Natale 2021, Tanigawa 2024, Aji 2022.

---

## Decisions Made

| Decision | Rationale | Future Plans Affected |
|----------|-----------|----------------------|
| Use `asleepStart` not `inBedStart` | Natale 2021 timing r=0.91; removes 10-30 min pre-sleep window | Phase 14 persistence layer wiring |
| Dead zone ±20 min | Menghini 2021 TST error floor; prevents chasing instrument noise | Phase 15 convergence engine |
| EMA α=0.3 | Phillips 2017; Skeldon 2016; 7-night effective window | Phase 15 convergence engine |
| 30-min per-cycle cap | Golombek 2010 circadian resetting capacity | Phase 15 convergence engine |
| Pause during circadian protocol | Protocol prescribes moving target — feedback would read movement as deviation | Phase 15 guard logic |
| Wilcoxon signed-rank (not t-test) | Non-normal deviation distributions in shift workers | Phase 16 validation analysis |
| n=20 minimum | Power calculation: 80% power at d=0.6, alpha=0.05, paired design | Phase 16 recruitment |
| Daytime sleep confidence multiplier 0.75 | Pesonen 2018: daytime accuracy significantly reduced; pending validation | Phase 15, revisit after Phase 16 |

---

## Deviations from Plan

None — plan executed exactly as written.

The prior session (2026-04-07) produced preliminary research documents in `docs/research/` (HEALTHKIT-FEEDBACK-LITERATURE-REVIEW.md, FEEDBACK-ALGORITHM-SPEC.md, VALIDATION-PLAN.md). These were used as input to this plan but the canonical documents were created in `.planning/phases/13-sleep-feedback-research/` as specified. No duplication issue — the docs/research/ versions are exploratory drafts; the .planning/ versions are the canonical spec documents.

---

## Known Stubs

None. All design decisions are grounded in peer-reviewed evidence. The `daytimeSleepConfidenceMultiplier = 0.75` parameter is documented as provisional (ALGORITHM-SPEC.md §8.2) pending the Phase 16 subgroup validation — this is intentional and noted in the spec.

---

## Self-Check: PASSED

| Item | Status |
|------|--------|
| LITERATURE-REVIEW.md exists | FOUND |
| ALGORITHM-SPEC.md exists | FOUND |
| VALIDATION-PLAN.md exists | FOUND |
| SLEEP-SCIENCE-DATABASE.md updated | FOUND |
| Task 1 commit `df5002b` | FOUND |
| Task 2 commit `3a99304` | FOUND |
| LITERATURE-REVIEW.md ≥80 lines (actual: 547) | PASS |
| ALGORITHM-SPEC.md contains "convergence" | PASS (27 matches) |
| VALIDATION-PLAN.md contains "Wilcoxon" and "15 min" | PASS (26 matches) |
| SLEEP-SCIENCE-DATABASE.md contains "Phase 13" and "v1.2" | PASS (5 matches) |
| No TODO/FIXME/placeholder stubs | PASS |
