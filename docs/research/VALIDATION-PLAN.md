---
title: "Validation Plan: 30-Day Internal Convergence Study"
date: 2026-04-07
project: ShiftWell
domain: Study design, clinical validation, statistical methods
tags: [validation, convergence-study, within-subject, PSQI, adherence, power-analysis]
source: Sleep intervention meta-analyses, clinical trial methodology, power calculation standards
confidence: HIGH (study design), MEDIUM (effect size assumptions)
---

# Validation Plan: 30-Day Internal Convergence Study

**Purpose:** Define success metrics, study design, and statistical methods for a 30-day internal study validating that ShiftWell's feedback algorithm reduces the discrepancy between planned and actual sleep.

**Study type:** Within-subject, pre/post comparison (AB design)  
**Duration:** 30 days (14-day baseline + 14-day intervention + 2-day buffer)  
**Setting:** Free-living, ambulatory (participants use their own Apple Watch)

---

## 1. Study Design

### 1.1 Design: Within-Subject, Pre/Post Comparison

```
Day 1-14:  Phase A — Baseline (feedback OFF)
           Circadian engine generates plans.
           HealthKit records actual sleep.
           No plan adjustments from feedback data.

Day 15-16: Buffer (transition to feedback ON)
           EWMA initialized from baseline discrepancy data.

Day 17-30: Phase B — Intervention (feedback ON)
           Convergence algorithm active.
           Plans adjust nightly based on discrepancy EWMA.
           All other app features identical to Phase A.
```

### 1.2 Rationale for Within-Subject Design

- **Eliminates between-subject variability:** Each participant serves as their own control. Shift worker sleep patterns are highly idiosyncratic -- between-subject designs require much larger samples to detect effects.
- **Statistical power advantage:** Paired comparisons with correlated repeated measures require fewer participants than independent-groups designs (reduced by factor of `2(1 - r)` where r is within-subject correlation).
- **Ethical simplicity:** No control group is denied the intervention permanently.
- **Practical:** ShiftWell's user base at TestFlight launch will be small (10-30 users). Within-subject designs extract maximum information from limited samples.

### 1.3 Inclusion Criteria

| Criterion | Requirement | Rationale |
|-----------|-------------|-----------|
| Shift work status | Currently working rotating or night shifts | Target population |
| Apple Watch | Series 8 or later, worn during sleep >= 5 of 7 nights | Data quality requirement; Series 8+ has sleep staging |
| ShiftWell usage | Active daily app use (open app >= 1x/day) | Ensures plan awareness |
| Calendar sync | At least one calendar connected with shift events | Enables automatic plan generation |
| Age | 18-65 | Standard adult range |
| Sleep disorders | No diagnosed untreated sleep disorders (treated SWSD acceptable) | Confound reduction |

### 1.4 Exclusion Criteria

- Apple Watch data quality score < 0.6 on > 50% of nights during baseline
- Fewer than 10 nights of valid data in either phase
- Timezone change during study period
- Extended leave (> 5 consecutive days off shifts) during either phase
- Use of sedative/hypnotic medications started or stopped during study

---

## 2. Outcome Measures

### 2.1 Primary Outcome: Mean Plan-vs-Reality Discrepancy

**Definition:** The absolute difference between planned and actual sleep onset time, averaged across all valid nights in each phase.

```
Primary Outcome = mean(|actual_bedtime - planned_bedtime|)
                  computed separately for Phase A and Phase B
```

**Unit:** Minutes  
**Direction:** Lower is better  
**Clinically meaningful threshold:** Reduction of >= 15 minutes (from the literature review: 15 minutes is the convergence target; this represents one-half of the MAX_ADJUST bound)

**Why onset time (not offset):** Sleep onset is more volitional and more amenable to behavioral intervention than wake time (which is often alarm-driven). Onset discrepancy also has the largest variance in shift workers.

### 2.2 Secondary Outcomes

#### 2.2.1 Pittsburgh Sleep Quality Index (PSQI) Change

**Instrument:** PSQI (Buysse et al., 1989) -- 19-item self-report measure of sleep quality over the past month.

**Administration:** 
- Day 1: Baseline PSQI (reflecting pre-study month)
- Day 30: Post-intervention PSQI (reflecting study month)

**Scoring:** Global score 0-21 (higher = worse sleep quality). Score > 5 indicates poor sleep quality.

**Clinically meaningful change:** >= 3 points improvement (MCID per clinical consensus; Hughes et al., 2009). In orthopedic populations, MCID has been reported as 4.4 points, but general sleep populations use 3.0 as the standard threshold.

Source: [PMC8391581](https://pmc.ncbi.nlm.nih.gov/articles/PMC8391581/); [Pittsburgh PSQI](https://www.sleep.pitt.edu/psqi)

#### 2.2.2 Plan Adherence Rate Change

**Definition:** Percentage of nights where the user's actual sleep onset falls within +/- 30 minutes of the planned bedtime.

```
Adherence Rate = count(nights where |onset_delta| <= 30 min) / count(valid nights) * 100
```

**Target:** >= 70% adherence in Phase B (intervention)

**Rationale:** In shift worker populations, sleep schedule adherence is inherently lower than the general population. A 70% threshold accounts for nights where external factors (emergency overtime, social obligations) prevent adherence.

#### 2.2.3 Total Sleep Time (TST) Change

**Definition:** Mean nightly total sleep time (from HealthKit) across each phase.

**Unit:** Minutes  
**Direction:** Improvement = increase toward individual sleep need target  
**Clinical threshold:** >= 20 minutes increase is meaningful (represents catching up from chronic restriction common in shift workers)

#### 2.2.4 Sleep Efficiency Change

**Definition:** Mean sleep efficiency (TST / TIB * 100) from HealthKit across each phase.

**Unit:** Percentage  
**Direction:** Higher is better  
**Clinical threshold:** >= 3% improvement. Baseline shift worker sleep efficiency is typically 75-82%.

#### 2.2.5 Wake-Time Discrepancy

**Definition:** Mean absolute difference between planned and actual wake time, to assess offset convergence separately from onset.

```
Secondary Outcome = mean(|actual_wake - planned_wake|)
```

---

## 3. Statistical Methods

### 3.1 Primary Analysis: Paired Samples Comparison

**Preferred test:** Wilcoxon signed-rank test (non-parametric)

**Rationale:** 
- Small expected sample size (N=15-25) makes normality assumptions questionable
- Sleep discrepancy data is often right-skewed (you can't go to bed "before" the plan in most cases, but you can be arbitrarily late)
- Wilcoxon is the appropriate non-parametric alternative to paired t-test
- If Shapiro-Wilk test confirms normality (p > 0.05), paired t-test results will also be reported

**Test specification:**
```
H0: Median discrepancy (Phase B) = Median discrepancy (Phase A)
H1: Median discrepancy (Phase B) < Median discrepancy (Phase A)
Alpha: 0.05 (one-tailed, directional hypothesis)
```

**Effect size:** Matched-pairs rank-biserial correlation (r) for Wilcoxon; Cohen's d_z for paired t-test.

### 3.2 Secondary Analyses

| Outcome | Test | Notes |
|---------|------|-------|
| PSQI change | Wilcoxon signed-rank (paired) | Pre vs. post global score |
| Adherence rate change | McNemar's test or paired proportions | Binary per-night adherence |
| TST change | Paired t-test or Wilcoxon | Continuous, paired |
| Sleep efficiency change | Paired t-test or Wilcoxon | Continuous, paired |
| Wake-time discrepancy | Paired t-test or Wilcoxon | Continuous, paired |

### 3.3 Convergence Curve Analysis

Beyond the aggregate pre/post comparison, analyze the time course of convergence:

```
For each participant:
  1. Compute nightly |onset_delta| for all 30 days
  2. Fit exponential decay model to Phase B data:
     discrepancy(t) = D_initial * exp(-lambda * t) + D_asymptote
  3. Extract lambda (convergence rate) and D_asymptote (steady-state discrepancy)
  4. Report mean lambda and mean D_asymptote across participants
```

**Target:** Mean D_asymptote < 15 minutes; Mean lambda corresponds to 50% reduction within 5 nights.

### 3.4 Multiple Comparisons Correction

With five secondary outcomes, apply Benjamini-Hochberg false discovery rate (FDR) correction at q = 0.05. The primary outcome is tested at alpha = 0.05 without correction (pre-specified primary endpoint).

---

## 4. Power Analysis and Sample Size

### 4.1 Assumptions

| Parameter | Value | Source |
|-----------|-------|--------|
| Expected mean discrepancy (Phase A) | 45 minutes | Conservative estimate from shift worker literature; Chinoy et al. (2021) showed 30-60 min average discrepancy |
| Expected mean discrepancy (Phase B) | 20 minutes | Algorithm convergence target: <15 min; 20 min is conservative |
| Expected difference | 25 minutes | 45 - 20 = 25 min improvement |
| Standard deviation of difference | 25 minutes | Conservative; accounts for heterogeneous shift schedules |
| Effect size (Cohen's d_z) | 1.0 | 25 / 25 = 1.0 (large effect) |
| Alpha | 0.05 | Standard |
| Power | 0.80 | Standard minimum |
| Test | Two-tailed paired t-test | Conservative (one-tailed justified but two-tailed more conservative) |

### 4.2 Sample Size Calculation

Using the standard formula for paired t-test:

```
N = ((z_alpha/2 + z_beta) / d_z)^2
N = ((1.96 + 0.84) / 1.0)^2
N = (2.80)^2
N = 7.84

Round up: N = 8 participants (minimum)
```

**With adjustment for non-parametric test (15% efficiency loss):**
```
N_nonparametric = 8 / 0.85 = 9.4 -> N = 10
```

**With dropout/exclusion buffer (30%):**
```
N_enrolled = 10 / 0.70 = 14.3 -> N = 15
```

### 4.3 Recommended Sample Size

**Enroll: 20 participants**  
**Target analyzable: 15 participants**  
**Minimum viable: 10 participants**

Rationale for 20 over the calculated 15:
- Shift workers have high data loss rates (watch not worn, overtime disrupting sleep)
- Pilot nature of the study benefits from slightly larger N for secondary outcome power
- Subgroup analyses (night shift vs. rotating) benefit from additional participants
- Real-world TestFlight recruitment typically yields ~70% analyzable data

### 4.4 Sensitivity Analysis

If actual effect size is smaller than assumed:

| True d_z | Power at N=15 | Power at N=20 |
|----------|---------------|---------------|
| 1.0 (assumed) | 0.94 | 0.98 |
| 0.8 | 0.83 | 0.92 |
| 0.6 | 0.63 | 0.75 |
| 0.5 | 0.49 | 0.62 |

If d_z = 0.8 (still large), N=15 provides adequate power (0.83). Below d_z = 0.6, the study is underpowered and should be interpreted as pilot/hypothesis-generating.

---

## 5. Data Collection Protocol

### 5.1 Timeline

| Day | Activity | Data Collected |
|-----|----------|---------------|
| Day 0 | Enrollment, consent, PSQI administration | Baseline PSQI, demographics |
| Day 1-14 | Phase A: baseline (feedback OFF) | Nightly: planned sleep, actual sleep (HealthKit), discrepancy |
| Day 15-16 | Buffer: feedback initialization | EWMA initialization |
| Day 17-30 | Phase B: intervention (feedback ON) | Nightly: planned sleep, actual sleep, adjustment applied, discrepancy |
| Day 30 | Post-study PSQI, exit survey | Post PSQI, qualitative feedback |

### 5.2 Automated Data Collection (In-App)

The following data is collected automatically by ShiftWell:

```typescript
interface NightlyStudyRecord {
  // Identifiers
  participantId: string;    // Anonymized
  studyDay: number;         // 1-30
  phase: 'A' | 'buffer' | 'B';

  // Plan data
  plannedBedtime: Date;
  plannedWakeTime: Date;
  plannedDurationMinutes: number;
  shiftContext: string;

  // Actual data (from HealthKit)
  actualBedtime: Date | null;
  actualWakeTime: Date | null;
  totalSleepMinutes: number;
  deepSleepMinutes: number;
  remSleepMinutes: number;
  coreSleepMinutes: number;
  sleepEfficiency: number;
  dataQualityScore: number;

  // Discrepancy data
  onsetDiscrepancyMinutes: number;
  offsetDiscrepancyMinutes: number;
  durationDiscrepancyMinutes: number;

  // Feedback data (Phase B only)
  feedbackStatus: string;
  adjustmentOnsetMinutes: number;
  adjustmentOffsetMinutes: number;
  ewmaOnset: number;
  ewmaOffset: number;
  convergenceStatus: string;
  userOverride: boolean;

  // Context
  circadianProtocolActive: boolean;
  timezoneOffset: number;
}
```

### 5.3 Self-Report Data Collection

| Instrument | When | Method |
|------------|------|--------|
| PSQI | Day 0 (baseline), Day 30 (post) | In-app questionnaire |
| Daily sleep quality (1-5 Likert) | Every morning | In-app prompt (optional) |
| Exit survey | Day 30 | In-app: plan accuracy perception, trust in recommendations, usability |

### 5.4 Data Quality Requirements

For a participant's data to be analyzable:
- Minimum 10 valid nights in Phase A (of 14)
- Minimum 10 valid nights in Phase B (of 14)
- Valid night = data quality score >= 0.6 AND total sleep >= 30 min AND total sleep <= 14 hours
- PSQI completed at both timepoints
- No protocol violations (timezone change, extended leave)

---

## 6. Success Criteria

### 6.1 Primary Success

The study is successful if:

```
Wilcoxon signed-rank test:
  p < 0.05 (one-tailed) for Phase B < Phase A onset discrepancy
  AND
  Median reduction >= 15 minutes
```

### 6.2 Secondary Success (any 2 of 4)

1. PSQI global score improvement >= 3 points (p < 0.05)
2. Adherence rate increase >= 15 percentage points (Phase B vs. Phase A)
3. TST increase >= 20 minutes (p < 0.05)
4. >= 80% of participants reach convergence (< 15 min discrepancy) within 14 days

### 6.3 Algorithm Performance Metrics

| Metric | Success Threshold | Failure Threshold |
|--------|-------------------|-------------------|
| Mean convergence time | <= 7 nights | > 14 nights |
| Steady-state discrepancy | < 15 min | > 30 min |
| Adjustment oscillation | < 3 direction changes in 7 nights | > 5 |
| Data utilization rate | >= 70% of nights have usable data | < 50% |
| User override rate | < 20% of plans overridden | > 40% |

### 6.4 Safety Monitoring

| Red Flag | Action |
|----------|--------|
| Any participant's TST drops below 5h for 3+ consecutive nights | Contact participant; review plan; consider exclusion |
| Any participant reports worsening insomnia symptoms | Clinical review; may need withdrawal |
| Algorithm produces plans with < 6h sleep window | Code review; algorithm bug |
| 3+ participants show PSQI worsening >= 3 points | Halt study; review algorithm |

---

## 7. Analysis Plan

### 7.1 Descriptive Statistics

Report for both phases:
- Mean, SD, median, IQR of onset discrepancy (primary outcome)
- Mean, SD of TST, sleep efficiency, adherence rate
- Convergence curve parameters (lambda, D_asymptote)
- Data quality metrics (% valid nights, % missing data, % naps)

### 7.2 Primary Analysis

```python
from scipy.stats import wilcoxon, shapiro

# Test normality of differences
diffs = phase_b_discrepancy - phase_a_discrepancy
_, p_norm = shapiro(diffs)

if p_norm > 0.05:
    # Normal: report both parametric and non-parametric
    t_stat, p_ttest = ttest_rel(phase_a_discrepancy, phase_b_discrepancy)
    cohen_dz = diffs.mean() / diffs.std()

# Always report non-parametric (primary)
w_stat, p_wilcoxon = wilcoxon(phase_a_discrepancy, phase_b_discrepancy,
                               alternative='greater')
r_effect = 1 - (2 * w_stat) / (n * (n + 1))
```

### 7.3 Convergence Curve Fitting

```python
from scipy.optimize import curve_fit

def convergence_model(t, D_init, lam, D_asymp):
    return D_init * np.exp(-lam * t) + D_asymp

# Fit for each participant's Phase B data
for participant in participants:
    popt, pcov = curve_fit(convergence_model,
                           days, discrepancies,
                           p0=[45, 0.3, 10],
                           bounds=([0, 0, 0], [120, 2, 60]))
    lambda_est, d_asymp_est = popt[1], popt[2]
```

### 7.4 Reporting

Results will be reported following CONSORT guidelines adapted for within-subject design:
- Flow diagram showing enrollment, exclusions, and analyzable N
- Primary outcome: median reduction with 95% CI, Wilcoxon p-value, effect size
- Secondary outcomes: point estimates with 95% CI, adjusted p-values (BH-FDR)
- Convergence curves: individual participant traces + group mean
- Data quality audit: % missing data, reasons for exclusion

---

## 8. Ethical Considerations

### 8.1 Risk Assessment

**Risk level:** Minimal. The intervention adjusts sleep timing recommendations by a maximum of 30 minutes per cycle. No medications, devices, or invasive procedures.

**Potential risks:**
- Sleep disruption from suboptimal plan adjustments (mitigated by MAX_ADJUST bound and safety monitoring)
- Frustration from inaccurate Apple Watch data affecting plans (mitigated by data quality filtering)
- Over-reliance on app-generated sleep times (mitigated by user override capability and educational content)

### 8.2 Consent

- In-app informed consent screen before enrollment
- Clear explanation: "We are testing whether the app's feedback feature improves plan accuracy"
- Ability to withdraw at any time by disabling feedback in settings
- Data stored locally on device; anonymized summary exported for analysis

### 8.3 IRB Determination

For an internal pilot (founder + TestFlight beta users), formal IRB approval is likely not required if:
- Data is used for product improvement, not generalizable research publication
- No identifiable health data leaves the device without explicit consent
- Participation is voluntary and does not affect access to the app

If results are intended for publication, IRB approval should be obtained retrospectively or prospectively depending on institutional requirements.

---

## 9. Timeline and Resources

| Week | Activity | Owner |
|------|----------|-------|
| Week -2 | Implement feedback algorithm in codebase | Dev |
| Week -1 | Implement study data collection; test with synthetic data | Dev |
| Week 0 | Recruit participants from TestFlight beta users | Founder |
| Week 1-2 | Phase A: baseline data collection | Automated |
| Week 3-4 | Phase B: intervention data collection | Automated |
| Week 5 | Data export, cleaning, analysis | Dev/Founder |
| Week 6 | Results interpretation, algorithm tuning | Dev/Founder |

**Required resources:**
- ShiftWell app with feedback algorithm implemented
- 15-20 TestFlight beta users with Apple Watch Series 8+
- Basic statistical analysis (Python scipy or R)
- No external funding required

---

*Assembled for ShiftWell -- 2026-04-07*
*Based on: clinical trial methodology, sleep intervention meta-analyses (Lai et al., 2023), PSQI validation literature, standard power analysis methods*
