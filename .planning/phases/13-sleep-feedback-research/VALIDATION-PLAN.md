# Validation Plan: 30-Day HealthKit Feedback Convergence Study

**Phase:** 13 — Sleep Feedback Research  
**Document:** VALIDATION-PLAN.md  
**Version:** 1.0  
**Date:** 2026-04-07  
**Purpose:** Define the study design, success metrics, and statistical analysis plan for validating the Phase 15 feedback algorithm before Phase 16 rollout  

---

## Table of Contents

1. [Study Question](#1-study-question)
2. [Study Design](#2-study-design)
3. [Primary Success Metrics](#3-primary-success-metrics)
4. [Secondary Success Metrics](#4-secondary-success-metrics)
5. [Sample and Eligibility](#5-sample-and-eligibility)
6. [Statistical Analysis](#6-statistical-analysis)
7. [Data Collection Points](#7-data-collection-points)
8. [Failure Criteria](#8-failure-criteria)
9. [Subgroup Analyses](#9-subgroup-analyses)
10. [Ethical Considerations](#10-ethical-considerations)
11. [Execution Timeline](#11-execution-timeline)

---

## 1. Study Question

**Primary:** Does the HealthKit feedback algorithm reduce the discrepancy between ShiftWell's planned sleep timing and users' actual sleep timing (as measured by Apple Watch) to below 15 minutes within 7 nights of activation?

**Secondary:** Does plan adherence improve over 30 days compared to the baseline period? Does improved plan adherence reduce sleep debt accumulation?

**Hypothesis (alternative):** Mean absolute bedtime deviation during nights 22–28 is statistically significantly lower than during nights 1–7 (pre-feedback baseline).

**Null hypothesis:** The feedback algorithm produces no statistically significant reduction in bedtime deviation over 30 days.

---

## 2. Study Design

### 2.1 Design Type

**Within-subject, pre-post comparison (AB design):**

```
Day 1–7:    Phase A — Baseline
            Circadian engine generates plans as normal.
            HealthKit records actual sleep.
            Feedback algorithm INACTIVE.
            Discrepancy data is collected but no plan adjustments are made.

Day 8–9:    Buffer / initialization
            Feedback algorithm initializes EMA from Days 1–7 discrepancy data.
            No adjustments applied yet (< 3 valid nights with this structure).
            This transition period is excluded from both baseline and intervention windows.

Day 10–30:  Phase B — Intervention
            Convergence algorithm ACTIVE.
            Plans adjust nightly based on discrepancy EWMA.
            All other app features identical to Phase A.
```

**Why within-subject:**
- Shift worker sleep patterns are highly idiosyncratic — between-subject designs require 5–8x larger samples to detect equivalent effects (paired comparisons reduce required n by factor of `2(1 - r)` where r is within-subject correlation; expected r ≈ 0.7 for same user)
- At TestFlight launch, ShiftWell's user base will be 10–30 initial users — within-subject design extracts maximum statistical power from a small sample
- Ethical simplicity: all participants receive the intervention; no permanent control arm
- Precedent: Tanigawa et al. (2024) used a similar pre/post within-subject design for sleep JITAI validation

### 2.2 Unit of Analysis

- Primary unit: individual night-level bedtime deviation measurement
- Secondary unit: participant-level average deviation across the pre- and post-feedback windows
- The Wilcoxon signed-rank test operates on paired night-level differences within each participant

---

## 3. Primary Success Metrics

### Metric 1 — Convergence Target

**Definition:** Mean absolute bedtime deviation < 15 min, measured across nights 22–28

**Formula:**
```
convergence_achieved[participant] = mean(abs(bedtimeDeviationMinutes), nights 22–28) < 15 min

primary_success = percent(participants where convergence_achieved) >= 70%
```

**Target threshold:** ≥70% of participants achieve convergence within the 30-day study

**Basis:** Skeldon et al. 2016 mathematical model predicts convergence in 5–7 cycles with α=0.3 EMA. The 7-night window (22–28) is the second stability window after feedback activation. The 15-minute threshold reflects the measurement accuracy floor (see LITERATURE-REVIEW.md §4.5).

### Metric 2 — Plan-Level Deviation Reduction

**Definition:** Mean absolute bedtime deviation is statistically significantly lower in nights 22–28 vs. nights 1–7

**Formula:**
```
baseline_deviation[participant]     = mean(abs(bedtimeDeviationMinutes), nights 1–7)
post_feedback_deviation[participant] = mean(abs(bedtimeDeviationMinutes), nights 22–28)

delta[participant] = baseline_deviation - post_feedback_deviation

primary_success = Wilcoxon signed-rank test on delta[] returns p < 0.05 (two-tailed)
                  AND median(delta[]) > 0 (improvement direction confirmed)
```

---

## 4. Secondary Success Metrics

### Metric 3 — Convergence Rate

**Definition:** ≥70% of participants achieve <15 min mean deviation by night 14 (one week post-activation)

**Formula:**
```
early_convergence[participant] = mean(abs(bedtimeDeviationMinutes), nights 12–14) < 15 min
success = percent(early_convergence) >= 70%
```

**Why measure at night 14:** Skeldon 2016 predicts convergence in 5–7 cycles; night 14 is 5 nights post-activation (nights 10–14). This is the minimum viable convergence window.

### Metric 4 — Sleep Debt During Feedback Period

**Definition:** No statistically significant INCREASE in sleep debt accumulation during Phase B (feedback does not disrupt sleep)

**Formula:**
```
baseline_debt_severity    = mean(debtLedger.rollingDebtHours, nights 1–7)
intervention_debt_severity = mean(debtLedger.rollingDebtHours, nights 22–28)

test = Wilcoxon signed-rank on paired debt severity scores
success = p > 0.05 (no significant increase) AND NOT (median_change > +1h)
```

**Rationale:** A feedback algorithm that improves plan adherence at the cost of increasing sleep debt is a clinical failure. This metric is a safety endpoint.

### Metric 5 — Feature Engagement

**Definition:** Feedback algorithm active (not paused) for ≥80% of eligible nights during Phase B

**Formula:**
```
eligible_nights = nights where HealthKit data was available
active_nights   = nights where feedbackActive == true

engagement_rate[participant] = active_nights / eligible_nights
success = mean(engagement_rate) >= 0.80
```

### Metric 6 — Wake Deviation (Secondary)

**Definition:** Same convergence analysis as Metric 1/2, applied to `wakeDeviationMinutes`

**Target:** Mean absolute wake deviation <15 min in nights 22–28 for ≥60% of participants (slightly lower threshold than bedtime, because alarm usage creates external wake control)

---

## 5. Sample and Eligibility

### 5.1 Minimum Sample Size

**Target:** 20 active participants

**Power calculation:**
```
Assumed effect size: d = 0.6 (medium; based on Aji et al. 2022 meta-analysis, 
  d = 0.58 for behavioral feedback + self-monitoring BCT combination)
Desired power: 0.80
Alpha: 0.05 (two-tailed)
Test: Wilcoxon signed-rank (equivalent to paired t-test for power calculation at n ≥ 20)

Required n = 16 participants (standard power formula for paired design)
Adjusted for 20% dropout: required n = 20 participants
```

**With n=20:** The study has 80% power to detect a medium effect size (d=0.6) reduction in bedtime deviation. Smaller effect sizes (d=0.3) would require n=60.

### 5.2 Inclusion Criteria

| Criterion | Requirement | Rationale |
|-----------|-------------|-----------|
| Shift work status | Currently working rotating or night shifts | Target population |
| Apple Watch | Series 8 or later, worn during sleep ≥5 of 7 nights/week | Series 8+ has sleep staging capability; ≥5/7 ensures sufficient data |
| ShiftWell usage | Active daily app use (open app ≥1×/day, per analytics) | Ensures plan awareness — user must know their planned bedtime |
| Calendar sync | At least one calendar connected with shift events detected | Enables automatic plan generation — no manual shift entry |
| Age | 18–65 | Standard adult range |
| Sleep disorders | No diagnosed untreated insomnia or SWSD | Untreated disorders confound deviation patterns; treated SWSD acceptable |

### 5.3 Exclusion Criteria

- Apple Watch data quality score <0.6 on >50% of nights during the baseline window (too much noise for reliable feedback)
- Travel across ≥2 time zones during the study period (confounds circadian signal)
- Start of a new shift rotation during the study period (a protocol would activate, pausing feedback — excludes this participant from primary analysis)
- Pregnancy (altered sleep architecture)
- Use of melatonin or prescription sleep aids started during the study period

### 5.4 Recruitment

At TestFlight launch, ShiftWell will target 30–50 initial users. The study is opt-in via an in-app prompt after 7 days of use. Target: 20 eligible participants opt in. No compensation required (voluntary beta tester population).

---

## 6. Statistical Analysis

### 6.1 Primary Test — Wilcoxon Signed-Rank Test

**Why Wilcoxon (not paired t-test):**

Bedtime deviation distributions are non-normal. Outlier nights (shift transitions, overnight calls, schedule changes) create heavy right tails. The Wilcoxon signed-rank test is:
- Distribution-free (no normality assumption required)
- Robust to outliers (uses ranks, not raw values)
- Appropriate for paired before-after comparisons with non-normal distributions
- Standard for sleep study data (used by Aji et al. 2022, Tanigawa et al. 2024)

**Test setup:**
```
For each participant i:
  x_i = mean(abs(bedtimeDeviationMinutes), nights 1–7)    # baseline
  y_i = mean(abs(bedtimeDeviationMinutes), nights 22–28)  # post-feedback

  d_i = x_i - y_i   # positive = improvement

Wilcoxon signed-rank test on {d_i}:
  H0: median(d_i) = 0
  H1: median(d_i) > 0 (one-tailed, testing improvement direction)

  Or two-tailed with correction: H1: median(d_i) ≠ 0

Alpha = 0.05
```

### 6.2 Effect Size — Cohen's d

**Why Cohen's d:**
Statistical significance (p-value) alone is insufficient — a p=0.03 result on n=20 with d=0.15 is statistically significant but clinically trivial. Cohen's d provides practical significance.

**Formula for paired design:**
```
d = mean(d_i) / sd(d_i)

Interpretation:
  d >= 0.2: small effect (clinically marginal)
  d >= 0.5: medium effect (clinically meaningful — primary target)
  d >= 0.8: large effect (clinically significant)
```

**Decision rule:** Algorithm proceeds to Phase 16 implementation if:
- Wilcoxon p < 0.05 (statistically significant improvement), AND
- Cohen's d > 0.5 (medium effect — clinically meaningful)

### 6.3 Multiple Comparisons

This is a pilot validation study, not a hypothesis-testing study for regulatory approval. No Bonferroni correction is applied to secondary metrics. Secondary metrics are exploratory and reported descriptively with 95% confidence intervals.

### 6.4 Missing Data Handling

- Nights with missing HealthKit data are excluded from per-participant averages (not imputed)
- Participants with <5 valid nights in either the baseline or post-feedback window are excluded from primary analysis
- Report the proportion of excluded nights per participant as a secondary metric (see Metric 5 — engagement)

---

## 7. Data Collection Points

### 7.1 Nightly (Automated — via HealthKit + plan-store)

| Variable | Source | Purpose |
|----------|--------|---------|
| Planned bedtime | plan-store `currentPlan` | Feedback input |
| Actual `asleepStart` | HealthKit | Primary feedback signal |
| `bedtimeDeviationMinutes` | `sleep-comparison.ts` | Primary outcome |
| Planned wake time | plan-store | Feedback input |
| Actual `asleepEnd` | HealthKit | Secondary feedback signal |
| `wakeDeviationMinutes` | `sleep-comparison.ts` | Secondary outcome |
| `feedbackActive` | Feedback engine output | Engagement tracking |
| `feedbackReason` | Feedback engine output | Paused state analysis |
| Current `adjustedBedtimeOffsetMinutes` | plan-store | Algorithm convergence tracking |
| `debtLedger.rollingDebtHours` | `sleep-debt-engine.ts` | Safety endpoint |
| `adherenceScore` | `sleep-comparison.ts` | Composite behavioral adherence |
| Data quality flag | `SleepRecord.source` | Quality stratification |

### 7.2 Weekly (Automated — via adaptive brain scoring)

| Variable | Source | Purpose |
|----------|--------|---------|
| Mean 7-night bedtime deviation | Computed from nightly data | Weekly convergence tracking |
| 7-night debt severity | `debtLedger.severity` | Safety monitoring |
| 7-night average adherence score | Average of `adherenceScore` | Secondary adherence metric |
| Feedback active % | Count of active nights / total nights | Engagement metric |

### 7.3 End of Study — Optional User-Reported

**PSQI-SF (4-item subset):** Four items from the Pittsburgh Sleep Quality Index:
1. Overall sleep quality past 2 weeks (1–5 scale)
2. Difficulty staying awake during daily activities (1–4 scale)
3. Feeling too sleepy during the day (1–5 scale)
4. Trouble falling asleep within 30 minutes (1–5 scale)

**Collection method:** In-app survey prompt on Day 30 (optional, not required for primary analysis)

**Why PSQI-SF (not full PSQI):** Full PSQI has 19 items — too burdensome for voluntary TestFlight users. The 4-item subset captures the most clinically relevant self-reported sleep quality dimensions with <2 minutes completion time.

**Note:** Self-reported data is susceptible to recall bias and social desirability effects. Treat as supplementary, not primary, evidence. Per Belenky et al. 2003: objective tracking outperforms subjective ratings for detecting sleep debt.

---

## 8. Failure Criteria

These criteria trigger algorithm revision before Phase 16 implementation.

### Failure Criterion 1 — Convergence Failure

**Trigger:** < 40% of participants reach <15 min mean deviation by night 14

**Meaning:** The algorithm converges more slowly than the mathematical model predicts. Possible causes:
1. `α = 0.3` is too conservative for this population (shift workers have higher behavioral variance than the modeled populations)
2. The 20-minute dead zone is causing the algorithm to suppress too many real signals
3. Daytime sleep accuracy issues are corrupting the signal beyond the daytime confidence multiplier's correction

**Revision options:**
- Increase α to 0.4 (faster adaptation, more responsive, more noise risk)
- Reduce dead zone to ±15 min (accept more noise in exchange for faster convergence)
- Separate alpha parameters for daytime vs. nighttime sleep

### Failure Criterion 2 — Sleep Debt Regression

**Trigger:** Mean sleep debt increases by >1h average during Phase B compared to Phase A

**Meaning:** The feedback algorithm's plan adjustments are making sleep scheduling worse — possibly by pushing bedtimes in a direction that reduces total sleep time.

**Immediate response:** Pause the algorithm and audit whether the minimum sleep duration guard (Step 7 in §4) is functioning correctly. Check whether bedtime adjustments are being applied without compensating wake time adjustments.

**Revision options:**
- Add hard constraint: `newWakeOffset` must always be ≥ `newBedtimeOffset` (window shifts but never shrinks)
- Increase `MIN_SLEEP_MINUTES` default to 450 min (7.5h) to add buffer

### Failure Criterion 3 — Technical Data Quality

**Trigger:** >20% of eligible nights have missing HealthKit data

**Meaning:** HealthKit background fetch is not reliable enough for nightly feedback. Battery drain, background app refresh settings, and Apple's BGTaskScheduler constraints may be preventing reliable data collection.

**Immediate response:** Audit HealthKit background sync implementation in Phase 14 persistence layer. Investigate whether `HKObserverQuery` or `HKAnchoredObjectQuery` is being used — the latter is more reliable for background delivery.

**Not a Phase 16 blocker:** Technical data quality is an implementation issue, not an algorithm issue. Fix the data pipeline and re-run the study segment.

### Failure Criterion 4 — User Rejection

**Trigger:** >30% of eligible participants opt out of feedback OR turn it off after activating it

**Meaning:** The plan adjustment is perceptible and unwelcome — users feel the algorithm is fighting them or making the plan worse.

**Response:** Qualitative feedback collection (in-app prompt or TestFlight feedback). Potential issues:
- Adjustments are too large or too frequent (consider reducing MAX_ADJUST to 15 min)
- Users want manual control over the adjustment direction
- The algorithm's adjustment is working correctly but users don't understand it (UX transparency fix)

---

## 9. Subgroup Analyses

These are pre-specified exploratory analyses — not hypothesis tests. Results inform Phase 16 personalization decisions.

### 9.1 Night Shift vs. Rotating Shift vs. Day Shift

**Hypothesis:** Night shift workers (daytime sleep) will show slower convergence due to reduced Apple Watch accuracy (Pesonen & Kuula 2018).

**Analysis:** Stratify primary metric by shift type. Compare convergence rate and nights-to-convergence between groups. If night shift subgroup convergence rate is <50% vs. ≥70% for day/rotating workers, dead zone expansion is warranted.

### 9.2 Apple Watch Series Version

**Hypothesis:** Series 8+ users will show faster convergence than Series 4–7 users due to improved sleep algorithm.

**Analysis:** Record Apple Watch model from HealthKit `source` field. Stratify convergence metrics by device generation. If pre-Series 8 devices show substantially worse convergence, consider gating feedback eligibility to Series 8+.

### 9.3 Baseline Deviation Magnitude

**Hypothesis:** Users with large baseline deviations (>45 min average) will converge more slowly than users with small baseline deviations (<30 min average).

**Analysis:** Quartile split on baseline deviation. Confirm that the EMA's effective window (~7 nights at α=0.3) is appropriate for all deviation magnitudes.

---

## 10. Ethical Considerations

### 10.1 Participant Protection

- All participants are shift workers who voluntarily installed ShiftWell and opted into TestFlight
- The study does not involve any deception, control group denial, or clinical risk
- The feedback algorithm can only make sleep scheduling suggestions — it cannot force behavioral change
- Participants may opt out at any time without consequence

### 10.2 Data Privacy

- All study data is stored locally on the participant's device (consistent with ShiftWell's local-first architecture)
- Aggregate anonymized results may be reported in scientific literature
- HealthKit data is processed on-device and not transmitted to any server
- Per ShiftWell's privacy policy: no health data leaves the device without explicit user consent

### 10.3 Informed Consent

In-app opt-in prompt will disclose:
- The algorithm is being evaluated and sleep plan adjustments will occur based on HealthKit data
- Data will be used to improve the algorithm
- Participation is voluntary and can be stopped at any time
- The algorithm adjustments are bounded and safe (max 30 min per night, never below minimum sleep need)

### 10.4 Safety Monitoring

Study is monitored for Failure Criterion 2 (sleep debt increase) on a weekly basis during the study period. If the mean study-wide sleep debt increases by >1h at any weekly check, the feedback algorithm is immediately paused for all participants.

---

## 11. Execution Timeline

| Milestone | Timing | Dependencies |
|-----------|--------|-------------|
| Phase 14 complete — HealthKit persistence layer | After Phase 14 | HealthKit data flowing and stored |
| Phase 15 complete — convergence engine + feedback UI | After Phase 15 | Algorithm live in app |
| TestFlight beta launch | After Apple Developer enrollment | External (LLC + Apple Dev) |
| 7-day baseline period | Week 1 post-launch | 20+ active users |
| Feedback activation | Day 8 post-launch | Baseline complete |
| Interim check (Failure Criterion 2) | Day 14 | Sleep debt monitoring |
| Primary analysis window | Days 22–28 | Feedback active for 2+ weeks |
| Study complete, analysis | Day 31 | All data collected |
| Phase 16 decision | Day 32 | Success metrics reviewed |

**Estimated total time from TestFlight launch to Phase 16 decision:** ~35 days

---

*Document produced during Phase 13 — Sleep Feedback Research sprint, 2026-04-07.*  
*Companion documents: LITERATURE-REVIEW.md (evidence base), ALGORITHM-SPEC.md (algorithm definition).*  
*Statistical methods: Wilcoxon signed-rank test, Cohen's d, n=20 minimum, 30-day within-subject AB design.*
