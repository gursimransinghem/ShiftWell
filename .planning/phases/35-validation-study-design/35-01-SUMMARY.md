---
phase: 35-validation-study-design
plan: 01
subsystem: research
tags: [validation, study-design, STROBE, IRB, statistics, PSQI, cohort-study]
dependency_graph:
  requires: []
  provides: [study-protocol, statistical-analysis-plan, IRB-pathway, power-calculation]
  affects: [phase-36-data-collection]
tech_stack:
  added: []
  patterns: [STROBE-cohort-reporting, CONSORT-flow, Bonferroni-correction, MICE-imputation, linear-mixed-effects]
key_files:
  created:
    - .planning/phases/35-validation-study-design/STUDY-PROTOCOL.md
    - .planning/phases/35-validation-study-design/STATISTICAL-ANALYSIS-PLAN.md
  modified: []
key_decisions:
  - "Observational cohort design (not RCT): avoids ethical issue of denying guidance to fatigued healthcare workers"
  - "PSQI as primary outcome: enables direct comparison with CBT-I literature; MCID = 3 points"
  - "Cohen's d=0.5 effect size assumption: conservative, between CBT-I (d=0.78) and passive digital (d=0.35)"
  - "Target n=100+ completers: exceeds minimum (34) to enable subgroup analyses with adequate power"
  - "USF IRB as primary pathway: Tampa-based, digital health experience, likely EXEMPT classification"
  - "Two-tailed test despite directional hypothesis: conservative for publication credibility"
  - "Bonferroni correction across secondary and subgroup analyses to prevent false positives"
  - "Anti-HARKing declaration: SAP locked before data collection; exploratory analyses labeled as such"
metrics:
  duration: 15min
  completed_date: 2026-04-07
  tasks: 2
  files: 2
---

# Phase 35 Plan 01: Validation Study Design Summary

**One-liner:** Pre-registered prospective cohort study protocol using PSQI as primary outcome with paired t-test SAP, power-justified at n=100 completers (d=0.5), targeting JCSM publication.

---

## What Was Built

Two IRB-ready, journal-preregistration-quality documents that constitute the complete scientific design of the ShiftWell validation study before any data collection begins.

**STUDY-PROTOCOL.md (627 lines):** Full STROBE-compliant protocol covering background and rationale (Two-Process Model, SWSD epidemiology, existing intervention limitations), study design (prospective observational cohort, 90-day pre-post, n=100-150), inclusion/exclusion criteria, recruitment plan (3-channel: in-app, social media, institutional), primary outcome (PSQI), secondary outcomes (ESS, SWQ, adherence, recovery score), data collection procedures, 12-month timeline, IRB pathway analysis (EXEMPT vs. EXPEDITED with USF IRB recommendation), authorship and publication targets, and STROBE compliance checklist.

**STATISTICAL-ANALYSIS-PLAN.md (457 lines):** Pre-specified SAP covering power calculation (d=0.5 from published literature, n=34 for 80% power, n=100+ target), primary analysis (paired t-test with normality fallback to Wilcoxon), dose-response ANCOVA with pre-specified adherence tertiles, three pre-specified subgroup hypotheses (shift type, baseline severity, high-adherence clinical significance), missing data strategy (complete case primary + MICE m=20 sensitivity), repeated measures ANOVA for trajectory analyses, linear mixed effects for recovery score, Bonferroni correction framework, and full R package list.

---

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Observational cohort (not RCT) | Ethical: cannot withhold guidance from fatigued healthcare workers; dose-response analysis provides internal causal evidence |
| PSQI as primary outcome | Gold standard (>10,000 studies), MCID established (3 points), enables direct comparison with CBT-I literature |
| Effect size d=0.5 | Conservative: between CBT-I d=0.78 and passive digital d=0.35; principled middle-ground for algorithm-guided personalized intervention |
| n=100+ completers | Exceeds minimum (34) for >95% power; enables subgroup analyses; provides margin for unexpected dropout |
| IRB: EXEMPT pathway first | Survey-only data; no PHI in research dataset; USF IRB preferred (Tampa, digital health experience) |
| Two-tailed test | Conservative for publication; directional hypothesis declared but two-tailed test used |
| Anti-HARKing declaration | SAP locked before data collection; critical for scientific credibility and journal acceptance |
| ClinicalTrials.gov registration | Required by ICMJE (JCSM, Sleep Health); establishes priority; builds credibility |

---

## Key Links to Future Phases

- **Phase 36 VAL-01:** STUDY-PROTOCOL.md defines enrollment criteria and consent requirements — Phase 36 must implement exactly these inclusion/exclusion criteria
- **Phase 36 VAL-02:** STATISTICAL-ANALYSIS-PLAN.md defines the analysis Phase 36 will execute on 90-day data — R analysis scripts should implement the paired t-test, ANCOVA, and mixed effects models defined here

---

## Success Criteria Assessment

- [x] STUDY-PROTOCOL.md follows STROBE guidelines with complete inclusion/exclusion criteria, primary outcome (PSQI), secondary outcomes (ESS, SWQ), timeline, and IRB pathway analysis
- [x] STATISTICAL-ANALYSIS-PLAN.md includes power calculation (d=0.5, 80% power = 34 completers, enrolled n=43+), primary paired t-test, dose-response ANCOVA, and pre-specified subgroup hypotheses
- [x] Both documents ready for IRB submission or journal pre-registration (STROBE compliance, ClinicalTrials.gov registration noted)
- [x] Study design avoids HARKing (anti-HARKing declaration; all hypotheses pre-specified before data collection)

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None. These are protocol documents (not code). No stubs, placeholders, or incomplete data flows.

---

## Self-Check: PASSED

Files verified:
- FOUND: .planning/phases/35-validation-study-design/STUDY-PROTOCOL.md (627 lines, min 120)
- FOUND: .planning/phases/35-validation-study-design/STATISTICAL-ANALYSIS-PLAN.md (457 lines, min 80)

Commits verified:
- f5ff714: feat(35-01): add STROBE-compliant study protocol
- e87e0ee: feat(35-01): add pre-specified statistical analysis plan
