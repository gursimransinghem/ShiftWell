---
title: "Validation Study Protocol: ShiftWell Circadian Optimization for Shift Workers"
date: 2026-04-07
project: ShiftWell
phase: 35 (Validation Study Design)
domain: Clinical study design, sleep research methodology, biostatistics
tags: [study-protocol, CONSORT, STROBE, PSQI, ESS, cohort, validation, IRB, power-analysis]
confidence: HIGH (methodology), MEDIUM (effect size assumptions), HIGH (instrument selection)
---

# Validation Study Protocol

**Full Title:** "Effect of a Calendar-Integrated Circadian Optimization App on Sleep Quality in Shift Workers: A Prospective Cohort Study with Within-Subject Pre/Post Design"

**Short Title:** ShiftWell Validation Study

**Protocol Version:** 1.0
**Protocol Date:** 2026-04-07

**Reporting Guideline:** STROBE (Strengthening the Reporting of Observational Studies in Epidemiology) -- prospective cohort design. CONSORT elements adapted for within-subject comparison.

---

## 1. Study Overview

### 1.1 Study Type

Prospective cohort study with within-subject pre/post design.

**Rationale for prospective cohort (not RCT):**
- No control group is denied a beneficial intervention
- Within-subject design maximizes statistical power with smaller N
- Shift worker schedules are highly idiosyncratic; between-subject variation is enormous
- Practical: ShiftWell's user base during the study period may be too small for proper randomization
- Ethical: withholding a behavioral intervention from shift workers who volunteered is questionable given the evidence that interventions help

### 1.2 Study Design

```
Day 0:       Enrollment, informed consent, baseline PSQI + ESS
             Install ShiftWell, connect calendar, complete onboarding
             Apple Watch worn from this night forward

Day 1-30:    BASELINE PERIOD
             ShiftWell generates plans but user has NO obligation to follow them
             HealthKit records actual sleep passively
             App tracks plan adherence, sleep debt, schedule
             PSQI and ESS administered at Day 30

Day 31-90:   INTERVENTION PERIOD
             User actively follows ShiftWell recommendations
             Algorithm adjusts based on feedback (v1.2 feedback engine)
             All ShiftWell features active (notifications, plans, coaching)
             PSQI and ESS administered at Day 60 and Day 90

Day 90:      Study completion
             Final PSQI + ESS
             Exit survey (usability, trust, perceived benefit)
             Optional: 6-month follow-up for retention
```

### 1.3 Rationale for 30-Day Baseline + 60-Day Intervention

- **30-day baseline:** Captures at least 2 full shift rotation cycles for most schedules. Allows establishment of HealthKit baseline and biometric calibration (14-night minimum).
- **60-day intervention:** Sufficient for algorithm convergence (<15 min discrepancy target within 7 nights), circadian adaptation assessment, and meaningful PSQI change detection.
- **Total 90 days:** Matches the standard PSQI recall period (1 month) applied at three timepoints, enabling clean pre/post comparison across two full PSQI windows.

---

## 2. Participants

### 2.1 Inclusion Criteria

| Criterion | Requirement | Rationale |
|-----------|-------------|-----------|
| Age | 18-65 years | Standard adult range; avoids pediatric/geriatric confounds |
| Shift work | Currently working rotating or fixed night shifts | Target population |
| Shift frequency | >= 3 night shifts per month | Minimum exposure for circadian disruption |
| iOS device | iPhone with iOS 16+ | ShiftWell platform requirement |
| Apple Watch | Series 8 or later, worn during sleep >= 5 of 7 nights | Sleep staging requires Series 8+; data quality threshold |
| Calendar | Digital calendar with shift events (Apple, Google, or QGenda) | ShiftWell's calendar sync is core to the intervention |
| English literacy | Able to read and complete English-language surveys | PSQI and ESS are English-validated; translations add complexity |

### 2.2 Exclusion Criteria

| Criterion | Rationale |
|-----------|-----------|
| Diagnosed untreated sleep disorder (insomnia, OSA, narcolepsy) | Confound; these conditions require clinical treatment, not app intervention |
| Treated shift work sleep disorder (SWSD) | Acceptable -- treated SWSD is the target population |
| Current use of sedative/hypnotic medications started within 30 days | Confound; medication effects on sleep architecture |
| Planned timezone change during study period | Invalidates circadian alignment data |
| Planned extended leave (> 7 consecutive days off shifts) | Insufficient shift exposure during study window |
| Pregnancy (current or planned) | Sleep architecture changes; ethical considerations |
| Beta-blocker or calcium channel blocker use | Invalidates HRV data (artificially alters autonomic metrics) |

### 2.3 Sample Size and Power Calculation

**Primary outcome:** PSQI global score change from baseline (Day 0) to post-intervention (Day 90).

**Power calculation parameters:**

| Parameter | Value | Source/Justification |
|-----------|-------|---------------------|
| Expected baseline PSQI | 8.5 | Shift workers average PSQI 7-10 (>5 = poor quality) |
| Expected post-intervention PSQI | 5.5 | Target: cross the clinical threshold (>5 to <=5) |
| Expected mean difference | 3.0 points | Matches MCID (minimal clinically important difference) |
| Standard deviation of difference | 3.5 | Conservative; accounts for heterogeneous shift patterns |
| Effect size (Cohen's d_z) | 0.857 | 3.0 / 3.5 = 0.857 (large effect) |
| Alpha | 0.05 (two-tailed) | Standard |
| Power (1 - beta) | 0.80 | Standard minimum |

**Sample size calculation (paired t-test):**

```
N = ((z_alpha/2 + z_beta) / d_z)^2
N = ((1.96 + 0.84) / 0.857)^2
N = (2.80 / 0.857)^2
N = (3.267)^2
N = 10.67

Round up: N = 11 (minimum analyzable)
```

**Adjustments:**
- Non-parametric test efficiency loss (+15%): N = 13
- Expected dropout/exclusion rate (30%): N = 19
- Subgroup analysis capability (shift types): N = 25+

**With additional power for secondary outcomes (d = 0.5):**

```
N = ((1.96 + 0.84) / 0.50)^2 = (5.60)^2 = 31.4
With 30% dropout: N = 45
For comfortable power across primary + secondary: N = 50
```

### 2.4 Recommended Sample Size

| Tier | N Enrolled | N Analyzable | Power (primary) | Power (secondary, d=0.5) |
|------|------------|-------------|-----------------|--------------------------|
| Minimum viable | 50 | 35 | 0.99 | 0.69 |
| Target | 100 | 70 | 0.99+ | 0.92 |
| Ideal | 150 | 105 | 0.99+ | 0.98 |

**Recommendation: Enroll 100 participants.** This provides robust power for the primary outcome and adequate power for secondary outcomes and subgroup analyses.

---

## 3. Primary Outcome

### 3.1 Pittsburgh Sleep Quality Index (PSQI) Change from Baseline

**Instrument:** PSQI (Buysse et al., 1989)
- 19-item self-report questionnaire
- Measures sleep quality over the preceding 1-month period
- 7 component scores: subjective sleep quality, sleep latency, sleep duration, habitual sleep efficiency, sleep disturbances, use of sleeping medication, daytime dysfunction
- Global score: 0-21 (higher = worse quality)
- Clinical threshold: >5 = poor sleep quality

**Administration Schedule:**

| Timepoint | Day | PSQI Recall Period | Purpose |
|-----------|-----|-------------------|---------|
| Baseline | Day 0 | Pre-study month | Establish starting sleep quality |
| Mid-baseline | Day 30 | Days 1-30 | Confirm baseline stability |
| Mid-intervention | Day 60 | Days 31-60 | Track intervention trajectory |
| Post-intervention | Day 90 | Days 61-90 | Primary outcome measurement |

**Primary comparison:** PSQI at Day 0 vs. PSQI at Day 90

**Clinically meaningful change:** >= 3 points improvement (MCID per clinical consensus; Hughes et al., 2009; PMC8391581)

### 3.2 Validation Concerns for Shift Workers

**Important caveat:** The PSQI was not originally validated for shift worker populations. A 2021 study of long-haul truck drivers found Cronbach's alpha of 0.46 in night shift workers (well below the 0.70 threshold for acceptable internal consistency). This is because:
- PSQI assumes a single sleep period per day
- Shift workers often have fragmented sleep (main sleep + naps)
- Irregular schedules make "typical" sleep patterns difficult to report

**Mitigation:**
1. Supplement PSQI with app-derived objective metrics (see Section 5)
2. Add shift-specific instructions to PSQI administration ("report your primary sleep period, not naps")
3. Compute component scores separately to identify which aspects change
4. Report Cronbach's alpha for the study sample to document internal consistency

Sources:
- [PSQI (University of Pittsburgh)](https://www.sleep.pitt.edu/psqi)
- [PSQI Review (PMC11973415)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11973415/)
- [PSQI Shift Worker Validation (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0003687021002040)

---

## 4. Secondary Outcomes

### 4.1 Epworth Sleepiness Scale (ESS)

**Instrument:** ESS (Johns, 1991)
- 8-item self-report questionnaire
- Measures general level of daytime sleepiness
- Total score: 0-24 (higher = more sleepy)
- Thresholds: 0-10 = normal, 11-14 = mild sleepiness, 15-17 = moderate, 18-24 = severe

**Psychometric Properties:**
- Cronbach's alpha: 0.73-0.90 (mean 0.82) across 10 studies
- Test-retest reliability (ICC): 0.81-0.93 across 5 studies
- In Korean shift workers (N=12,056): two-factor structure, suggesting ESS may measure two related but distinct constructs in shift workers

**Administration:** Same schedule as PSQI (Days 0, 30, 60, 90)

**Primary ESS comparison:** Day 0 vs. Day 90

Sources:
- [Cleveland Clinic ESS](https://my.clevelandclinic.org/health/diagnostics/epworth-sleepiness-scale-ess)
- [ESS Official Site](https://epworthsleepinessscale.com/about-the-ess/)
- [PMC6935560 (Shift Worker Factor Analysis)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6935560/)

### 4.2 Actigraphy Concordance

**Definition:** Agreement between ShiftWell's planned sleep windows and Apple Watch-measured actual sleep timing.

```
Concordance = 1 - (mean(|actual_onset - planned_onset|) / planned_duration)
```

**Target:** Concordance > 0.85 (actual sleep within 15% of planned window)

**Measurement:** Automated, nightly, via HealthKit data vs. plan data

### 4.3 App Adherence Rate

**Definition:** Percentage of nights where the user's actual sleep onset falls within +/- 30 minutes of the planned bedtime.

```
Adherence Rate = count(nights where |onset_delta| <= 30 min) / count(valid nights) * 100
```

**Target:** >= 70% adherence rate during intervention period

### 4.4 Sleep Debt Trajectory

**Definition:** Change in accumulated sleep debt over the study period.

```
Sleep Debt = sum(sleep_need - actual_sleep) over rolling 14-night window
```

**Target:** Sleep debt trending downward (negative slope) during intervention period

**Measurement:** Automated via ShiftWell's sleep debt engine

### 4.5 Transition Recovery Time

**Definition:** Number of nights required to return to baseline sleep quality after a shift-type transition (e.g., night shift to day off).

```
Transition Recovery = nights until recovery score returns to within 10% of baseline
```

**Target:** Intervention group recovers faster than baseline period

---

## 5. Assessment Timeline

| Day | PSQI | ESS | App Metrics | Exit Survey | Notes |
|-----|------|-----|-------------|-------------|-------|
| 0 | X | X | Begin | | Enrollment, consent, onboarding |
| 1-30 | | | Continuous | | Baseline period (passive) |
| 30 | X | X | Continuous | | End baseline; begin intervention |
| 31-60 | | | Continuous | | Active intervention |
| 60 | X | X | Continuous | | Mid-intervention check |
| 61-90 | | | Continuous | | Active intervention continues |
| 90 | X | X | Continuous | X | Study completion |
| 180 | | X | | | Optional 6-month follow-up |

---

## 6. Data Collection Protocol

### 6.1 Automated Collection (In-App)

All of the following are collected automatically by ShiftWell without user action:

```typescript
interface NightlyStudyRecord {
  // Identifiers (anonymized for analysis)
  participantId: string;       // Pseudonymized study ID
  studyDay: number;            // 1-90
  phase: 'baseline' | 'intervention';

  // Plan data
  plannedBedtime: Date;
  plannedWakeTime: Date;
  plannedDurationMinutes: number;
  shiftContext: 'night-shift' | 'day-shift' | 'day-off' | 'transition';

  // Actual data (HealthKit)
  actualBedtime: Date | null;
  actualWakeTime: Date | null;
  totalSleepMinutes: number;
  deepSleepMinutes: number;
  remSleepMinutes: number;
  coreSleepMinutes: number;
  sleepEfficiency: number;
  dataQualityScore: number;

  // Biometrics (HealthKit)
  overnightHRV: number | null;       // SDNN (ms)
  restingHeartRate: number | null;    // bpm
  respiratoryRate: number | null;     // breaths/min

  // Discrepancy data
  onsetDiscrepancyMinutes: number;
  offsetDiscrepancyMinutes: number;
  durationDiscrepancyMinutes: number;

  // App engagement
  appOpenedToday: boolean;
  notificationsReceived: number;
  notificationsTappedThrough: number;

  // Recovery
  recoveryScore: number;
  sleepDebtMinutes: number;
  biometricModifierApplied: boolean;
}
```

### 6.2 Self-Report Collection (In-App Questionnaires)

| Instrument | Items | Administration | Method |
|------------|-------|---------------|--------|
| PSQI | 19 items | Days 0, 30, 60, 90 | In-app questionnaire (full validated instrument) |
| ESS | 8 items | Days 0, 30, 60, 90 | In-app questionnaire (full validated instrument) |
| Daily fatigue (optional) | 1 item (1-5 Likert) | Every morning | In-app prompt (dismissible) |
| Exit survey | 10 items | Day 90 | In-app: perceived benefit, trust, usability |

### 6.3 Data Quality Requirements

For a participant's data to be analyzable:
- Minimum 20 valid nights in baseline period (of 30)
- Minimum 40 valid nights in intervention period (of 60)
- Valid night: data quality score >= 0.6 AND total sleep >= 30 min AND <= 14 hours
- PSQI completed at Day 0 AND Day 90 (minimum)
- ESS completed at Day 0 AND Day 90 (minimum)
- No protocol violations (timezone change, extended leave, medication change)

---

## 7. Statistical Analysis Plan

### 7.1 Primary Analysis

**Test:** Paired samples comparison (PSQI Day 0 vs. Day 90)

```
Primary analysis: Wilcoxon signed-rank test (non-parametric)
  H0: Median PSQI change = 0
  H1: Median PSQI change < 0 (improvement)
  Alpha: 0.05 (one-tailed, pre-specified directional hypothesis)
  Effect size: Matched-pairs rank-biserial correlation (r)

Sensitivity analysis: Paired t-test (if Shapiro-Wilk confirms normality)
  Report Cohen's d_z for effect size
```

### 7.2 Secondary Analyses

| Outcome | Test | Correction |
|---------|------|-----------|
| ESS change (Day 0 vs Day 90) | Wilcoxon signed-rank | BH-FDR q=0.05 |
| Plan adherence rate (baseline vs intervention) | McNemar's test | BH-FDR q=0.05 |
| Sleep debt trajectory (slope test) | Linear mixed model | BH-FDR q=0.05 |
| TST change | Paired t-test / Wilcoxon | BH-FDR q=0.05 |
| Actigraphy concordance change | Paired t-test / Wilcoxon | BH-FDR q=0.05 |

### 7.3 Longitudinal Analysis

Mixed-effects model with repeated measures:

```
PSQI_score ~ timepoint + (1 | participant)

Where:
  timepoint = Day 0, 30, 60, 90
  Random intercept for participant (accounts for individual variation)
  Fixed effect of timepoint captures the intervention trajectory
```

This allows:
- Modeling the trajectory of change (linear, quadratic)
- Handling missing data (participants who miss Day 60 assessment)
- Testing whether improvement continues or plateaus

### 7.4 Subgroup Analyses (Exploratory)

| Subgroup | Comparison | Rationale |
|----------|-----------|-----------|
| Rotating vs. fixed night shifts | PSQI change by shift type | Different circadian disruption patterns |
| Healthcare vs. non-healthcare | PSQI change by industry | Hospital shift workers may differ |
| High baseline PSQI (>=10) vs. moderate (6-9) | Change magnitude | More impaired users may benefit more |
| High app adherence (>=70%) vs. low (<70%) | Dose-response | Does following the plan matter? |
| Apple Watch data quality high vs. low | Biometric modifier utility | Does wearable data improve outcomes? |

### 7.5 Power Calculation Summary

| Analysis | N=35 | N=70 | N=105 | Effect Size |
|----------|------|------|-------|-------------|
| PSQI change (primary, d_z=0.86) | 0.97 | 0.99+ | 0.99+ | Large |
| ESS change (d_z=0.50) | 0.63 | 0.88 | 0.97 | Medium |
| Adherence rate change | 0.55 | 0.82 | 0.95 | Medium |
| Subgroup (n=17 vs 17) | 0.50 | 0.50 | 0.50 | Exploratory |

---

## 8. IRB Pathway

### 8.1 Risk Classification

**Risk level:** Minimal risk

**Justification:**
- The intervention is behavioral (sleep timing recommendations), not pharmacological or invasive
- Maximum adjustment to sleep timing is bounded (30 min per cycle, never below minimum sleep need)
- All data is collected passively through existing consumer devices (iPhone, Apple Watch)
- No clinical procedures, no blood draws, no medical devices
- Users retain full control and can ignore recommendations at any time
- Risk of harm from sleep timing optimization is negligible

### 8.2 Likely IRB Determination

**Exempt (Category 3):** Research involving benign behavioral interventions where:
1. The intervention is brief, harmless, painless, not physically invasive
2. Not likely to have significant adverse lasting impact
3. The investigator has no reason to think subjects will find the intervention offensive

ShiftWell's sleep recommendations qualify as a "benign behavioral intervention" -- suggesting sleep timing changes is comparable to suggesting exercise timing changes.

**However:** If collecting identifiable health data (HealthKit biometrics linked to study ID), a **limited IRB review** may be required under the revised Common Rule.

### 8.3 IRB Pathway Recommendation

```
Step 1: Prepare protocol package (this document + consent form + survey instruments)
Step 2: Submit to IRB for exempt determination
        Options:
        a) University IRB (if founder has academic affiliation)
        b) Central IRB (e.g., WCG IRB, Sterling IRB) — $1,500-$5,000
        c) Self-determination (NOT recommended for publishable research)
Step 3: If exempt: proceed with enrollment
        If expedited review required: ~4-6 week review cycle
Step 4: Annual continuing review (if required by IRB)
```

**Cost estimate:** $1,500-$5,000 for central IRB review

### 8.4 Informed Consent Requirements

Even for exempt research, informed consent is required. Key elements:

1. Study purpose: "We are testing whether ShiftWell improves sleep quality for shift workers"
2. Duration: 90 days of app use with 4 survey assessments
3. Data collected: Sleep data from Apple Watch, app usage, survey responses
4. Risks: Minimal -- sleep timing suggestions may not suit all individuals
5. Benefits: Personalized sleep optimization; contribution to shift worker research
6. Voluntariness: Participation is voluntary; withdrawal does not affect app access
7. Data handling: All data de-identified for analysis; no individual data shared with employers
8. Contact: Investigator contact for questions or concerns

---

## 9. Timeline

| Phase | Duration | Activity |
|-------|----------|----------|
| **Preparation** | 2-3 months | IRB submission, study materials, app study mode implementation |
| **Recruitment** | 1-2 months | Recruit 100 participants via App Store, social media, hospital partnerships |
| **Enrollment** | 2-4 weeks | Staggered enrollment (cohorts of 25-30) |
| **Baseline** | 30 days | Passive data collection per participant |
| **Intervention** | 60 days | Active intervention per participant |
| **Analysis** | 4-6 weeks | Data cleaning, statistical analysis, manuscript drafting |
| **Total** | ~8-10 months | From IRB submission to manuscript submission |

---

## 10. Target Journals

| Journal | Impact Factor | Fit | Rationale |
|---------|--------------|-----|-----------|
| **Journal of Clinical Sleep Medicine** | 4.8 | Excellent | Primary clinical sleep journal; strong interest in digital interventions |
| **Sleep Health** | 5.2 | Excellent | Policy and population focus; shift work is a public health issue |
| **Chronobiology International** | 2.8 | Good | Circadian-specific journal; appreciates algorithm-based approaches |
| **Journal of Occupational and Environmental Medicine** | 2.3 | Good | If framing emphasizes employer outcomes and workplace intervention |
| **npj Digital Medicine** | 15.2 | Stretch | High impact; would need strong methodology and large N |
| **SLEEP** | 5.6 | Stretch | Top sleep journal; would need very strong results |

**Recommendation:** Target JCSM or Sleep Health as primary submission. Both have published similar digital health sleep intervention studies and are receptive to within-subject designs with validated instruments.

---

## 11. Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Study design (within-subject cohort) | HIGH | Standard methodology for behavioral interventions |
| PSQI as primary outcome | HIGH | Most validated sleep quality instrument; 89.6% sensitivity |
| PSQI validity in shift workers | MEDIUM | Known internal consistency concerns; mitigated by supplementary metrics |
| ESS validity in shift workers | MEDIUM | Good psychometric properties; possible two-factor structure |
| Power calculation | HIGH | Conservative assumptions; N=100 provides robust power |
| Effect size assumption (d=0.86) | MEDIUM | Based on intervention literature; actual effect may be smaller |
| IRB exempt determination | MEDIUM | Likely exempt but depends on specific IRB; central IRBs vary |
| Timeline (8-10 months) | MEDIUM | Recruitment may take longer than expected |

---

*Assembled for ShiftWell Phase 35 -- 2026-04-07*
*Protocol follows STROBE guidelines for observational studies with CONSORT elements adapted for within-subject comparison.*
