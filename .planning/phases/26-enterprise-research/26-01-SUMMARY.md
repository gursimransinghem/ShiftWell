---
phase: 26-enterprise-research
plan: "01"
subsystem: enterprise
tags: [enterprise, B2B, HIPAA, ROI, competitive-analysis, compliance, research]
requires:
  - docs/research/ENTERPRISE-LITERATURE-REVIEW.md
  - docs/science/SLEEP-SCIENCE-DATABASE.md
provides:
  - .planning/phases/26-enterprise-research/ENTERPRISE-OUTCOMES-FRAMEWORK.md
  - .planning/phases/26-enterprise-research/HIPAA-COMPLIANCE-ASSESSMENT.md
  - .planning/phases/26-enterprise-research/COMPETITIVE-ANALYSIS-ENTERPRISE.md
affects:
  - Phase 27 ENT-01 (employer dashboard data pipeline schema)
  - Phase 28 (enterprise sales materials)
  - Phase 30 (enterprise sales strategy)
tech-stack:
  added: []
  patterns:
    - "Safe Harbor de-identification + Laplace differential privacy for employer data"
    - "BAA-first architecture: no employer API key without signed BAA"
    - "ROI calculation: absenteeism + turnover + injury vs. platform cost"
key-files:
  created:
    - .planning/phases/26-enterprise-research/ENTERPRISE-OUTCOMES-FRAMEWORK.md
    - .planning/phases/26-enterprise-research/HIPAA-COMPLIANCE-ASSESSMENT.md
    - .planning/phases/26-enterprise-research/COMPETITIVE-ANALYSIS-ENTERPRISE.md
  modified: []
decisions:
  - "BAA required before any employer data flow — architectural constraint, not optional"
  - "Epsilon = 1.0 for differential privacy on employer dashboard aggregate queries"
  - "Cohort minimum = 20 users before any subgroup statistic is reported to employer"
  - "CNO/VP Nursing is primary enterprise buyer, not general HR"
  - "Pricing: $5/$10/$15 per seat per month (Standard/Professional/Enterprise)"
  - "90-day free pilot at 50-200 users to generate publishable ROI data"
  - "SOC 2 deferred until $50K+ ARR from enterprise — use HIPAA docs + BAA as interim trust signals"
metrics:
  duration: "6 minutes"
  completed_date: "2026-04-07"
  tasks_completed: 3
  files_created: 3
  total_lines: 942
---

# Phase 26 Plan 01: Enterprise Research Summary

**One-liner:** Three enterprise research documents grounding ShiftWell's B2B platform in employer ROI metrics, HIPAA compliance architecture, and competitive gap analysis against Wellhub, Virgin Pulse, Lyra, and Spring Health.

---

## What Was Built

Three planning-phase research documents providing the design constraints for Phase 27 (employer dashboard) and Phase 30 (enterprise sales):

### ENTERPRISE-OUTCOMES-FRAMEWORK.md (319 lines)
- 6 primary employer metrics: absenteeism rate, presenteeism proxy (recovery score trend), shift callout rate, injury/error incident correlation, voluntary turnover rate, onboarding cost savings
- 4 secondary metrics unique to ShiftWell: circadian disruption index, sleep debt accumulation rate, pre-adaptation adherence, algorithm convergence rate
- ROI formula with worked 100-nurse ICU example: $370,205 savings vs. $6,000 platform cost = 6,170% ROI
- Data collection requirements for per-user, aggregate, and employer-provided data
- 13 peer-reviewed sources cited (RAND 2016, NIOSH Caruso 2014, Kecklund 2016, AHA 2025, Belenky 2003, AMN Healthcare 2023)

### HIPAA-COMPLIANCE-ASSESSMENT.md (309 lines)
- Consumer vs. enterprise HIPAA status clearly delineated (no obligation for v1.0-v1.3; BAA required for Phase 27+)
- Complete data flow map (5 flows classified by PHI status)
- Safe Harbor 18-identifier mapping to ShiftWell data — 8 identifiers relevant (names, email, dates, device IDs, IP, biometric, geographic, unique IDs)
- Differential privacy specification: Laplace mechanism, epsilon = 1.0, cohort minimum 20
- Technical safeguards per HIPAA §164.312 (AES-256, TLS 1.3, RBAC, audit logs)
- BAA template provisions (all 9 required HHS provisions)
- SOC 2 Type II roadmap ($24K-$50K Year 1; defer until $50K+ ARR)
- Phase 27 development checklist (12 items, all must be true before first pilot)

### COMPETITIVE-ANALYSIS-ENTERPRISE.md (314 lines)
- Market overview: $61B enterprise wellness market, healthcare = 28%, $200-$500/employee/year budgets
- Deep analysis of 6 platforms: Wellhub, Virgin Pulse, Lyra, Spring Health, Headspace, Kronos/UKG
- 6 absolute gaps in existing solutions (no circadian awareness anywhere in market)
- Feature comparison matrix (ShiftWell vs. 4 competitors)
- ShiftWell positioning: "workforce sleep science" vs. "employee wellness program"
- Pricing tiers: $5/$10/$15/seat/month + 90-day free pilot
- Sales motion: CNO-first direct outreach + scheduling vendor partnerships (QGenda, Kronos)
- Research publication strategy for generating publishable ROI data

---

## Decisions Made

1. **BAA is architectural, not optional.** No employer API key is issued without a signed BAA. This is enforced in code (Phase 27), not just in contract terms.

2. **Differential privacy epsilon = 1.0.** Standard healthcare analytics balance. Applied server-side before API response. Cohort minimum = 20 per subgroup.

3. **CNO/VP Nursing is primary enterprise buyer.** They control scheduling and understand circadian burden. Selling through general HR requires educating them on sleep science from scratch — slower cycle with lower win rates.

4. **Pricing anchored at $5/seat/month.** At this price, the ROI case is mathematically compelling without any salesmanship. Even one prevented nurse departure (at $125K) pays for 2,000+ months of the platform at a 100-person unit.

5. **90-day free pilot before revenue.** Required to generate publishable outcomes data. No peer-reviewed study has measured digital sleep intervention ROI for shift workers — this is ShiftWell's first-mover scientific opportunity.

6. **SOC 2 deferred until $50K+ ARR.** HIPAA compliance documentation and BAA execution are sufficient trust signals for pilot contracts. SOC 2 investment is justified when enterprise revenue covers its cost ($24K-$50K Year 1).

---

## Deviations from Plan

None — plan executed exactly as written. The existing `docs/research/ENTERPRISE-OUTCOMES-FRAMEWORK.md` and `docs/research/HIPAA-COMPLIANCE-ASSESSMENT.md` (created earlier in Phase 26) were used as source material and the planning-phase documents were created with the exact section structure specified in the plan.

---

## Known Stubs

None. These are research documents — no data placeholders or stub content. All metrics include published benchmarks, all frameworks reference peer-reviewed sources, all specifications are actionable for Phase 27 implementation.

---

## Links to Phase 27

The ENTERPRISE-OUTCOMES-FRAMEWORK.md provides the exact data schema Phase 27 must implement:
- `recovery_score`, `adherence_flag`, `sleep_debt_balance`, `shift_type` per user per day
- Employer dashboard API must return: mean recovery score by department, sleep debt trend, pre-adaptation adherence rate, algorithm convergence trend
- BAA required before any employer API endpoint is activated

The HIPAA-COMPLIANCE-ASSESSMENT.md provides the Phase 27 development checklist (12 items). Every item is a go/no-go gate before pilot launch.

---

## Self-Check: PASSED

Files created:
- FOUND: .planning/phases/26-enterprise-research/ENTERPRISE-OUTCOMES-FRAMEWORK.md (319 lines)
- FOUND: .planning/phases/26-enterprise-research/HIPAA-COMPLIANCE-ASSESSMENT.md (309 lines)
- FOUND: .planning/phases/26-enterprise-research/COMPETITIVE-ANALYSIS-ENTERPRISE.md (314 lines)

Commits verified:
- b6c5c92: feat(26-01): produce enterprise outcomes framework
- bc46a03: feat(26-01): produce HIPAA compliance assessment
- e05bb80: feat(26-01): produce enterprise competitive analysis

Verification checks:
- PASS: All 3 files >= 80 lines
- PASS: HIPAA doc contains "BAA", "differential privacy", "de-identification" (>= 5 matches)
- PASS: Competitive doc contains "Wellhub", "Virgin Pulse", "pricing", "positioning" (>= 4 matches)
- PASS: ENTERPRISE-OUTCOMES-FRAMEWORK.md contains ROI formula
- PASS: HIPAA-COMPLIANCE-ASSESSMENT.md contains differential privacy spec
