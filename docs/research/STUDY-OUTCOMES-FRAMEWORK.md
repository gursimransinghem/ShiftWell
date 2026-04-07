---
title: "Study Outcomes Framework: Measurement Definitions and Rationale"
date: 2026-04-07
project: ShiftWell
phase: 35 (Validation Study Design)
domain: Outcome measurement, validated instruments, clinical endpoints, study metrics
tags: [outcomes, PSQI, ESS, adherence, sleep-debt, recovery, measurement, validation-study]
confidence: HIGH (instrument properties), MEDIUM (app-derived metric validation)
---

# Study Outcomes Framework

**Purpose:** Define every outcome measure in the ShiftWell validation study: what it is, why it was chosen, how it is measured, at what timepoints, and what constitutes clinically meaningful change. This framework ensures transparent, reproducible measurement.

---

## 1. Primary Outcome: Pittsburgh Sleep Quality Index (PSQI)

### 1.1 Instrument Description

The PSQI is the most widely used validated self-report measure of sleep quality. Developed by Buysse et al. (1989) at the University of Pittsburgh, it has been used in thousands of studies and translated into dozens of languages.

**Structure:**
- 19 self-rated questions (+ 5 bed-partner questions, not scored)
- Generates 7 component scores (0-3 each):
  1. Subjective sleep quality
  2. Sleep latency (time to fall asleep)
  3. Sleep duration
  4. Habitual sleep efficiency
  5. Sleep disturbances (pain, breathing, temperature, etc.)
  6. Use of sleeping medication
  7. Daytime dysfunction (trouble staying awake, enthusiasm)
- Global score: sum of 7 components = 0-21

**Scoring:**
| Global Score | Interpretation |
|-------------|---------------|
| 0-5 | Good sleep quality |
| 6-10 | Poor sleep quality |
| 11-15 | Very poor sleep quality |
| 16-21 | Severe sleep quality problems |

### 1.2 Psychometric Properties

| Property | Value | Source |
|----------|-------|--------|
| Sensitivity (good vs. poor sleeper) | 89.6% | Buysse et al. 1989 |
| Specificity | 86.5% | Buysse et al. 1989 |
| Cronbach's alpha (general population) | 0.70-0.83 | Multiple validation studies |
| Cronbach's alpha (shift workers) | 0.38-0.46 | Ohayon et al. 2021 (CAUTION) |
| Test-retest reliability | 0.85 | Buysse et al. 1989 |
| MCID (minimal clinically important difference) | >= 3 points | Hughes et al. 2009; clinical consensus |

### 1.3 Why PSQI as Primary Outcome

1. **Most validated instrument:** Used in 10,000+ studies; reviewers and journals recognize it immediately
2. **Captures subjective experience:** Objective metrics (actigraphy) miss what matters to the user -- how they FEEL about their sleep
3. **Sensitive to intervention effects:** PSQI detects changes from behavioral sleep interventions with effect sizes of 0.5-1.0
4. **Publication standard:** JCSM, Sleep Health, and Sleep all expect PSQI as a primary or secondary outcome
5. **Recall period (1 month):** Aligns naturally with ShiftWell's 30-day assessment intervals

### 1.4 Known Limitations in Shift Workers

**Internal consistency is poor (alpha 0.38-0.46) in shift worker populations.** This is a significant limitation. The PSQI was designed for people with regular sleep schedules. Shift workers face specific challenges:

- Component 4 (habitual sleep efficiency) assumes a single sleep period
- Component 3 (sleep duration) is ambiguous when naps are included
- "Typical" bedtime/wake time questions are unanswerable for rotating schedules

**Mitigation Strategy:**
1. Report Cronbach's alpha for the study sample
2. Analyze component scores separately (not just global score)
3. Supplement with app-derived objective metrics (Section 4)
4. Add shift-specific instructions: "For this questionnaire, report your PRIMARY sleep period only (not naps)"
5. If alpha < 0.60 in study sample, note as limitation and emphasize secondary outcomes

### 1.5 Measurement Schedule

| Timepoint | Day | Purpose |
|-----------|-----|---------|
| Baseline | Day 0 | Pre-study sleep quality (reflects pre-enrollment month) |
| End of baseline | Day 30 | Confirm baseline stability; PSQI reflects baseline period |
| Mid-intervention | Day 60 | Track intervention trajectory |
| Post-intervention | Day 90 | Primary endpoint; PSQI reflects full intervention period |

**Primary comparison:** Day 0 vs. Day 90 (pre-study vs. post-intervention)
**Trajectory analysis:** Day 0 -> Day 30 -> Day 60 -> Day 90 (longitudinal mixed model)

Sources:
- [University of Pittsburgh PSQI](https://www.sleep.pitt.edu/psqi)
- [PSQI Brief Review (PMC11973415)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11973415/)
- [PSQI MCID (PMC8391581)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8391581/)

---

## 2. Secondary Outcome: Epworth Sleepiness Scale (ESS)

### 2.1 Instrument Description

The ESS measures general level of daytime sleepiness by asking respondents to rate their likelihood of dozing in 8 common situations.

**Structure:**
- 8 items, each scored 0-3 (0 = would never doze, 3 = high chance of dozing)
- Situations include: sitting and reading, watching TV, sitting inactive in a public place, as a passenger in a car for an hour, lying down in the afternoon, sitting and talking, sitting quietly after lunch, in a car while stopped in traffic

**Scoring:**
| Total Score | Interpretation |
|-------------|---------------|
| 0-10 | Normal daytime sleepiness |
| 11-14 | Mild excessive daytime sleepiness |
| 15-17 | Moderate excessive daytime sleepiness |
| 18-24 | Severe excessive daytime sleepiness |

### 2.2 Psychometric Properties

| Property | Value | Source |
|----------|-------|--------|
| Cronbach's alpha | 0.73-0.90 (mean 0.82) | 10 studies |
| Test-retest ICC | 0.81-0.93 | 5 studies |
| Sensitivity for excessive sleepiness | ~93% | Johns 1991 |
| Factor structure (shift workers) | Two-factor | PMC6935560 |

### 2.3 Why ESS as Secondary Outcome

1. **Captures functional impact:** PSQI measures sleep quality; ESS measures DAYTIME CONSEQUENCES
2. **Clinically actionable:** ESS > 10 is a screening threshold for excessive daytime sleepiness
3. **Quick (2 minutes):** Low participant burden, improving compliance
4. **Sensitive to shift work:** Shift workers consistently score higher on ESS than day workers
5. **Complementary to PSQI:** Together, PSQI + ESS capture both the input (sleep quality) and the output (daytime function) of the sleep system

### 2.4 Shift Worker Considerations

- ESS may show a two-factor structure in shift workers (active situations vs. passive situations)
- Some ESS situations (e.g., "as a passenger in a car for an hour") may be less applicable to shift workers who drive to work at odd hours
- Despite limitations, ESS remains the most widely used and validated sleepiness measure

### 2.5 Clinically Meaningful Change

No formal MCID has been established for ESS. Based on the literature:
- A 2-3 point reduction is considered clinically meaningful
- Moving from >10 to <=10 (crossing the clinical threshold) is the most meaningful change
- Report both absolute change and threshold-crossing rate

Sources:
- [ESS Official Site](https://epworthsleepinessscale.com/about-the-ess/)
- [Cleveland Clinic ESS](https://my.clevelandclinic.org/health/diagnostics/epworth-sleepiness-scale-ess)
- [PMC6935560 (Factor Analysis in Shift Workers)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6935560/)
- [PMC9759004 (ESS Reliability Review)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9759004/)

---

## 3. App-Derived Metrics

These metrics are collected automatically by ShiftWell and do not require participant action. They provide objective, continuous data that supplements the periodic self-report instruments.

### 3.1 Plan Adherence Rate (%)

**Definition:** Percentage of valid nights where the user's actual sleep onset falls within +/- 30 minutes of the planned bedtime.

```
Adherence Rate = count(|actual_onset - planned_onset| <= 30 min) / count(valid_nights) * 100
```

**Rationale:** Measures whether users can and do follow ShiftWell's recommendations. High adherence validates the algorithm's practical utility; low adherence suggests the plans are impractical.

**Baseline:** Not applicable during baseline period (plans exist but users are not instructed to follow them)
**Target during intervention:** >= 70%
**Measurement:** Nightly, automated

### 3.2 Sleep Debt Trajectory

**Definition:** Accumulated sleep deficit over a rolling 14-night window, measured in minutes.

```
Sleep Debt = sum(max(0, sleep_need - actual_sleep)) over 14-night window
```

**Rationale:** Sleep debt is the core construct ShiftWell addresses. A downward trajectory during intervention indicates the app is helping users manage their sleep deficit.

**Expected pattern:**
- Baseline period: stable or increasing sleep debt
- Intervention period: decreasing sleep debt (flattening curve)

**Measurement:** Daily, automated
**Success threshold:** Statistically significant negative slope during intervention period

### 3.3 Transition Recovery Time

**Definition:** Number of nights after a shift-type transition (e.g., night shift -> day off) until the recovery score returns to within 10% of the user's personal baseline.

```
Transition Recovery = count(nights from transition until recovery_score >= baseline_score * 0.9)
```

**Rationale:** Shift transitions are the hardest moments for circadian health. Faster recovery indicates ShiftWell's circadian protocols are effective.

**Baseline measurement:** Count recovery nights during baseline period transitions
**Intervention measurement:** Count recovery nights during intervention period transitions
**Target:** Intervention recovery time < baseline recovery time
**Measurement:** Per-transition, automated

### 3.4 Onset Discrepancy (Minutes)

**Definition:** Absolute difference between planned and actual sleep onset time.

```
Onset Discrepancy = |actual_bedtime - planned_bedtime| in minutes
```

**Rationale:** Direct measure of plan accuracy and user compliance. The convergence of this metric indicates the algorithm is learning the user's behavior.

**Target:** Mean discrepancy < 15 minutes during intervention period
**Baseline reference:** Mean discrepancy during baseline period (expected 30-60 minutes)

### 3.5 Total Sleep Time (TST)

**Definition:** Total minutes of sleep recorded by Apple Watch per night.

**Correction:** Apply -15 minute correction for known Apple Watch overestimation (per meta-analysis evidence, see WEARABLE-ACCURACY-ASSESSMENT.md).

**Clinical threshold:** >= 420 minutes (7 hours) per CDC recommendation. For shift workers, a more realistic target is >= 360 minutes (6 hours) on work nights.

---

## 4. Composite Outcome Table

| Metric | Type | Source | Frequency | Baseline | Intervention Target | MCID |
|--------|------|--------|-----------|----------|-------------------|------|
| **PSQI global score** | Primary | Self-report | Day 0,30,60,90 | 8.5 (expected) | <= 5.5 | >= 3 points |
| **ESS total score** | Secondary | Self-report | Day 0,30,60,90 | 12 (expected) | <= 10 | 2-3 points |
| **Plan adherence %** | Secondary | App | Nightly | N/A | >= 70% | N/A |
| **Sleep debt** | Secondary | App | Daily | Stable/increasing | Decreasing slope | N/A |
| **Transition recovery** | Exploratory | App | Per transition | Baseline count | < baseline | N/A |
| **Onset discrepancy** | Secondary | App | Nightly | 30-60 min | < 15 min | 15 min |
| **TST** | Secondary | HealthKit | Nightly | 5-6 hours | >= 6.5 hours | 20 min |
| **Sleep efficiency** | Exploratory | HealthKit | Nightly | 75-82% | >= 85% | 3% |
| **Recovery score** | Exploratory | App | Daily | Baseline avg | > baseline | 10 points |
| **Daily fatigue (1-5)** | Exploratory | Self-report | Daily (optional) | Baseline avg | < baseline | 1 point |

---

## 5. Data Analysis Framework

### 5.1 Analysis Priorities

| Priority | Analysis | Test | Multiplicity |
|----------|----------|------|-------------|
| 1 (Primary) | PSQI Day 0 vs Day 90 | Wilcoxon signed-rank | No correction (pre-specified primary) |
| 2 | ESS Day 0 vs Day 90 | Wilcoxon signed-rank | BH-FDR q=0.05 |
| 2 | Onset discrepancy baseline vs intervention | Paired t-test / Wilcoxon | BH-FDR q=0.05 |
| 2 | TST baseline vs intervention | Paired t-test / Wilcoxon | BH-FDR q=0.05 |
| 2 | Sleep debt slope (intervention period) | Linear mixed model | BH-FDR q=0.05 |
| 3 (Exploratory) | Subgroup analyses | Various | Not corrected (exploratory) |
| 3 (Exploratory) | Transition recovery time | Paired comparison | Not corrected |

### 5.2 Missing Data Handling

| Scenario | Approach |
|----------|----------|
| Missing PSQI at Day 60 only | Participant retained; Day 60 excluded from trajectory model |
| Missing PSQI at Day 90 | Participant excluded from primary analysis (per-protocol) |
| Missing HealthKit nights (<20 baseline or <40 intervention) | Participant excluded from app-derived metric analyses |
| Missing daily fatigue ratings | Expected (optional metric); analyze available data only |
| MCAR test | Little's MCAR test to assess missingness mechanism |
| Sensitivity analysis | Multiple imputation for PSQI if >10% missing at Day 90 |

### 5.3 Reporting Standards

Following STROBE checklist (22 items) with additions:

- Flow diagram: enrollment -> exclusions -> analyzable N (per arm)
- Primary outcome: median change, 95% CI, Wilcoxon p-value, effect size (r)
- Secondary outcomes: point estimates with 95% CI, adjusted p-values
- Cronbach's alpha for PSQI and ESS in study sample
- Adherence and app engagement metrics (even if not statistically tested)
- Subgroup analyses clearly labeled as exploratory
- Data quality audit: % missing data, reasons for exclusion

---

## 6. Publication Strategy

### 6.1 Target Journals (Ranked)

| Rank | Journal | IF | Review Time | Fit Rationale |
|------|---------|-----|------------|---------------|
| 1 | **Journal of Clinical Sleep Medicine** | 4.8 | 4-8 weeks | Published similar digital intervention studies; strong interest in shift work |
| 2 | **Sleep Health** | 5.2 | 6-10 weeks | Population health and policy focus; shift work is a public health priority |
| 3 | **Chronobiology International** | 2.8 | 6-12 weeks | Circadian-specific; appreciates algorithmic approaches; less competitive |
| 4 | **Journal of Occupational and Environmental Medicine** | 2.3 | 4-8 weeks | If framing emphasizes employer outcomes and ROI |
| 5 | **JMIR mHealth and uHealth** | 5.0 | 8-12 weeks | Digital health focus; open access; high visibility |

### 6.2 Manuscript Structure

```
Title: "Effect of a Calendar-Integrated Circadian Optimization App
       on Sleep Quality in Shift Workers: A Prospective Cohort Study"

Abstract: Structured (Background, Methods, Results, Conclusions) — 250 words

Introduction:
  - Shift work sleep problem (Kecklund & Axelsson 2016)
  - AHA 2025 statement on circadian health
  - Gap: no published validation of calendar-integrated digital sleep intervention
  - Study objective

Methods:
  - Study design (STROBE)
  - Participants and eligibility
  - Intervention description
  - Outcome measures (PSQI primary, ESS + app metrics secondary)
  - Statistical analysis plan

Results:
  - Participant flow and demographics
  - Primary outcome (PSQI change)
  - Secondary outcomes
  - App engagement and adherence
  - Subgroup analyses (exploratory)

Discussion:
  - Interpretation of findings
  - Comparison to prior shift work sleep interventions
  - Strengths (real-world, calendar-integrated, objective + subjective)
  - Limitations (no control group, PSQI validity in shift workers)
  - Clinical and policy implications

Tables:
  1. Participant demographics
  2. PSQI scores at all timepoints (global + components)
  3. ESS scores at all timepoints
  4. App-derived metrics (baseline vs intervention)
  5. Subgroup analyses

Figures:
  1. Study design diagram (timeline)
  2. PSQI trajectory (Day 0 -> 30 -> 60 -> 90) with error bars
  3. Sleep debt trajectory (individual traces + group mean)
  4. Onset discrepancy convergence curve
```

### 6.3 Publication Value Propositions

**Why journals will be interested:**
1. First published study of a calendar-integrated sleep intervention for shift workers
2. Addresses the specific gap identified in Frontiers in Sleep 2024 ("no multicomponent digital sleep programme")
3. Combines validated instruments (PSQI, ESS) with objective app-derived metrics
4. Shift work sleep is a priority topic post-AHA 2025 statement
5. Practical implications for healthcare employers (ROI, if enterprise data available)

---

## 7. Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| PSQI as primary outcome | HIGH | Most validated instrument; 89.6% sensitivity; standard in field |
| PSQI validity in shift workers | MEDIUM | Known alpha concerns; mitigated by supplementary metrics |
| ESS as secondary outcome | HIGH | Well-validated; relevant to functional impact |
| App-derived metrics validity | MEDIUM | Face validity; convergence with validated instruments TBD |
| Power calculation adequacy | HIGH | Conservative effect size; N=100 provides robust power |
| Statistical analysis plan | HIGH | Standard methods; pre-specified primary analysis |
| IRB pathway | MEDIUM | Likely exempt but specific determination required |
| Publication target feasibility | HIGH | JCSM and Sleep Health have published similar studies |
| Timeline (8-10 months) | MEDIUM | Recruitment is the primary uncertainty |

---

*Assembled for ShiftWell Phase 35 -- 2026-04-07*
*Defines 10 outcome measures across 4 assessment timepoints, following STROBE reporting guidelines.*
