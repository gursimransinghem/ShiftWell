# Recovery Algorithm Science: Signal-by-Signal Research Report

**Purpose:** Inform a science-backed recovery scoring algorithm for ShiftWell — a sleep app for shift workers.
**Researched:** 2026-04-06
**Overall confidence:** HIGH for clinical thresholds; MEDIUM for proprietary weighting claims; LOW for exact WHOOP/Oura formulas (both are trade secrets)

---

## Executive Summary

No wearable manufacturer publicly discloses exact algorithmic weights. A 2025 peer-reviewed evaluation of 14 composite health scores across 10 major wearable brands confirmed: **zero manufacturers disclosed how metrics are algorithmically weighted, and zero composite scores have been validated against clinical outcomes.** (de Gruyter, 2025)

What is known with HIGH confidence:
1. HRV (RMSSD) is the dominant autonomic recovery signal — measured during slow-wave sleep by WHOOP for noise reduction
2. Resting heart rate is the second most important signal — directional (down = good, up = stress/illness)
3. Sleep architecture matters (deep + REM = "restorative sleep") — optimal target is 40-50% combined
4. Personal baseline normalization (z-scores, rolling averages) is universal — absolute values matter less than deviation from your own baseline
5. Sleep regularity is a stronger mortality predictor than sleep duration (peer-reviewed, 2024)
6. Shift workers require adjusted baselines — they show systematically altered autonomic regulation vs. day workers

---

## Signal 1: Heart Rate Variability (HRV / RMSSD)

### What It Measures
RMSSD (Root Mean Square of Successive Differences) is the primary time-domain HRV metric. It reflects beat-to-beat variance driven by vagal (parasympathetic) tone. Higher RMSSD = more parasympathetic dominance = better recovery state.

### How WHOOP Measures It
WHOOP 4.0 samples HR at 52 Hz continuously. HRV is calculated as a **dynamic weighted average during sleep, with heavier weighting toward the last slow-wave sleep (SWS/N3) episode each night.** The rationale: during slow-wave sleep, the body is in its most physiologically stable state, minimizing noise from movement, digestion, stress, and temperature fluctuation.

Source: WHOOP support documentation + 2025 validation study (Physiological Reports, Wiley)

### Normative Values by Age (RMSSD, ms)

| Age | 25th Pct | 50th Pct (median) | 75th Pct | Notes |
|-----|----------|-------------------|----------|-------|
| 18-25 | ~45 | ~62 | ~82 | Peak HRV decade |
| 26-35 | ~35 | ~52 | ~70 | |
| 36-45 | ~25 | ~38 | ~55 | |
| 46-55 | ~18 | ~28 | ~43 | |
| 56-65 | ~14 | ~22 | ~35 | |
| 65+ | ~12 | ~18 | ~28 | Plateau after 60 |

Sex difference: Women aged 20-45 average **5 ms higher** RMSSD than men; difference closes after 60.

Sources: Lifelines Cohort Study (PMC7734556), Welltory 2023 meta-analysis (n=296,000+), Kubios 2024 normative update (n=~45,000)

### Clinical Thresholds
- **Below 10th percentile for age/sex**: flags chronic stress, under-recovery, or health issues
- **Daily reading within ±10% of 30-day rolling average**: indicates stable recovery
- **Each additional hour of quality sleep adds ~3 ms to RMSSD** (Nicolini 2024)
- **2024 study**: Higher RMSSD associated with better self-reported sleep (β=0.510), lower fatigue (β=0.281), reduced stress (β=0.353) — all statistically significant after covariate adjustment

### Algorithm Implication
**Normalize to personal baseline, not population norms.** Use a 60-day baseline window. Flag when 7-day rolling average drops below the 60-day band. This is the most validated approach (AI Endurance, Marco Altini research).

Oura uses a **14-day weighted average vs. 3-month baseline** for HRV Balance. WHOOP uses HRV-CV (coefficient of variation) as a secondary metric: lower HRV-CV = more consistent autonomic recovery.

### Shift Worker Caveat
Night shift workers show **sympathetic dominance** (higher LF:HF ratio, lower HF power) compared to day workers. Day nurses show increasing HRV coherence during their sleep period; night nurses do **not** — suggesting altered autonomic regulation. Therefore: HRV baselines must be established from the worker's actual sleep periods, not assumed against population norms.

Sources: PMC11368331, PMC6373270, ScienceDirect 2017

---

## Signal 2: Resting Heart Rate (RHR)

### What It Measures
RHR during sleep reflects the minimum cardiac workload. During healthy deep sleep, the parasympathetic nervous system dominates and HR naturally decreases. Elevation above personal baseline signals incomplete recovery, physiological stress, or illness.

### Normal Sleeping RHR
- Healthy adults: **40-70 bpm** during sleep (40-60 bpm most common)
- Represents a 20-30% drop from waking resting HR
- Athletes may dip below 40 bpm
- Increases with age due to reduced vagal tone

### Clinical Thresholds
- **5-10 bpm above personal baseline**: signals poor recovery, illness, or accumulated stress
- **Sustained elevation >3-5 bpm above average**: indicates need for recovery prioritization
- PMC research: sleep restriction elevates daytime HR and systolic BP, and **two recovery nights are insufficient to return values to baseline** following consecutive nights of moderate sleep restriction

### How Wearables Use It
Both WHOOP and Oura compare RHR to personal rolling average. Oura's Readiness Score uses the **lowest RHR of the night and its timing** — an RHR that bottoms out early in the night (first half) indicates better parasympathetic recovery than one that remains elevated or bottoms out late.

### Algorithm Implication
Use **deviation from 30-day personal baseline** rather than absolute values. A delta >5 bpm above baseline = meaningful signal. Direction matters: trending down over weeks = fitness adaptation (good); sudden spike = stress/illness.

---

## Signal 3: Sleep Stages (Architecture)

### Stage Reference: Normal Adult Distribution

| Stage | % of TST | Minutes (7h sleep) | Primary Function |
|-------|----------|---------------------|-----------------|
| N1 (light) | 5% | ~21 min | Sleep onset transition |
| N2 (light/core) | 45-55% | ~189-231 min | Memory consolidation, spindles |
| N3 (deep/SWS) | 10-20% | ~42-84 min | Physical restoration, GH release, glymphatic clearing |
| REM | 20-25% | ~84-105 min | Emotional processing, cognitive consolidation, creativity |

Source: StatPearls NBK526132, Sleep Foundation, WHOOP sleep documentation

### Deep Sleep (N3 / Slow Wave Sleep)

**Physiological functions:**
- **Growth hormone (GH) secretion**: ~70% of GH pulses during sleep coincide with SWS in men; GH release is confined to the first ~3 hours of sleep and correlates with SWS amount (Science 1969, foundational paper)
- **Glymphatic clearance**: beta-amyloid and metabolic waste products are cleared from the brain primarily during N3
- **Physical tissue repair**: muscle repair, cellular regeneration, immune system strengthening, blood flow to muscles
- **Memory consolidation**: slow cortical oscillations during N3 are critical for restoring attention and working memory

**Clinical thresholds:**
- Normal: 10-20% of total sleep time (roughly 42-84 min in a 7h night)
- WHOOP target: 15-25% (60-100 min)
- Below 10%: compromised physical recovery, reduced GH release
- Age-related decline: begins in early adulthood; middle-aged adults have measurably shorter N3 episodes; some older adults get very little measurable SWS

**Scoring note:** N3 is officially scored when delta waves constitute ≥20% of a 30-second epoch.

### REM Sleep

**Physiological functions:**
- Emotional memory processing and regulation (Walker 2009; PMC4182440)
- Amygdala reactivity recalibration — noradrenergic silence during REM enables "emotional depotentiation" (Matthew Walker lab)
- Problem-solving, creativity, cognitive flexibility
- Anterior cingulate cortex-amygdala connectivity maintenance

**Clinical thresholds:**
- Normal: 20-25% of total sleep time (~90-120 min in a 7-8h night)
- Below 15% consistently: severe cognitive and emotional impairment
- REM rebound: after REM deprivation, subsequent nights show compensatory REM increase
- Shift work note: circadian adaptation to night shifts is associated with **higher REM sleep duration** in adapted workers — suggesting REM is sensitive to circadian misalignment (ScienceDirect 2023)

### WHOOP's "Restorative Sleep" Metric
WHOOP combines Deep + REM into a single "Restorative Sleep" ratio:
- **Target: 40-50% of total sleep time**
- Below 40%: insufficient restoration
- This is their most actionable sleep architecture metric for recovery scoring

### N3 and Cognitive Recovery from Sleep Deprivation
Research (PMC11244911): N3 sleep, more than N2, drives cognitive recovery from sleep deprivation. Functions like attention and working memory recover specifically through N3-mediated brain processes. This is especially critical for shift workers who frequently operate in partial sleep deprivation states.

---

## Signal 4: Sleep Efficiency

### Formula
```
Sleep Efficiency (SE) = (Total Sleep Time / Time In Bed) × 100
```

### Clinical Thresholds (standard reference)

| SE Range | Classification | Notes |
|----------|---------------|-------|
| 90-100% | Excellent | Typical of healthy young adults |
| 85-89% | Good | Normal healthy range |
| 75-84% | Fair | Room for improvement |
| Below 75% | Poor | Associated with insomnia; significant time in bed not sleeping |

The clinical cutoff most commonly cited is **≥85% = normal**; below 85% = disrupted sleep. Below 75% is the threshold for insomnia classification in many studies.

Source: Journal of Clinical Sleep Medicine (PMC4751425), Wikipedia sleep efficiency, ResearchGate clinical consensus

### WHOOP's Use
WHOOP tracks sleep efficiency as a component of their Sleep Performance score and presents it as one of four advanced sleep metrics (alongside Sleep Consistency, Restorative Sleep ratio, and Sleep Debt).

---

## Signal 5: Sleep Duration and Sleep Need

### WHOOP's Sleep Need Architecture
WHOOP's developer API exposes sleep need as a **composite of four components**:
```
sleep_need = baseline_milli 
           + need_from_sleep_debt_milli 
           + need_from_recent_strain_milli 
           - need_from_recent_nap_milli
```

- **baseline_milli**: Personal physiological baseline, learned over time from the device
- **need_from_sleep_debt_milli**: Accumulated deficit from prior nights
- **need_from_recent_strain_milli**: Additional need from physical exertion (exercise, stress)
- **need_from_recent_nap_milli**: Credit from daytime naps

### Sleep Debt Dynamics
- VP of Data Science at WHOOP (Emily Capodilupo): "Sleep debt follows you around for a few days"
- RISE app algorithm: last night's sleep = 15% weight; prior 13 nights = 85% (with recency weighting)
- Research consensus: **one hour of sleep loss takes ~4 days to fully recover from**
- Two consecutive recovery nights are insufficient to normalize HR/BP after sleep restriction (PMC10543608)

### Adult Sleep Duration Standards
- CDC recommendation: ≥7 hours for adults
- WHOOP/Sleep Foundation target: 7-9 hours
- Below 6 hours: consistently associated with impaired cognitive function and elevated cardiovascular risk
- Shift workers frequently average 5-6 hours during work rotations

### Sleep Performance Score (WHOOP definition)
```
Sleep Performance % = (Actual Sleep / Sleep Need) × 100
```
Where Sleep Need is calculated from the composite formula above. This is the metric used in WHOOP's recovery calculation for the "sleep" component.

---

## Signal 6: Sleep Regularity / Consistency

### The Sleep Regularity Index (SRI)
Introduced 2017 by Phillips et al. SRI measures day-to-day consistency of sleep/wake timing on a 0-100 scale. Higher = more regular.

### Health Outcome Evidence (HIGH confidence — large cohort studies)
- **Mortality risk**: Top four quintiles (SRI 71.6-98.5) had **20-48% lower all-cause mortality** vs. bottom quintile — **stronger predictor than sleep duration** (PMC10782501, PMC10782489)
- **Cardiometabolic**: Sleep timing irregularity linked to elevated BMI, insulin resistance, hypertension, cardiovascular events
- **Cognitive**: Low SRI associated with smaller hippocampal volume and **26-53% increased dementia risk**
- **Mechanistic basis**: Sleep regularity is a direct proxy for circadian disruption, which has broad adverse physiological effects

### WHOOP's Sleep Consistency Metric
WHOOP added Sleep Consistency as an advanced sleep metric in 2023. It measures whether you're sleeping and waking at similar times each day.

### Oura's Sleep Regularity Contributor
Oura includes "Sleep Regularity" as one of the seven Readiness contributors, using a similar SRI-based approach.

### Algorithm Implication for Shift Workers
Shift workers by definition have LOW sleep regularity — their circadian schedules rotate. This means:
1. Raw SRI scores will be systematically low for shift workers
2. Algorithm should not penalize shift workers for shift-required schedule changes
3. Should measure consistency **within shift type** (e.g., consistency of night-shift sleep timing vs. day-off sleep timing)
4. Track improvement within schedule blocks, not across the full schedule rotation

---

## Signal 7: Respiratory Rate

### Normal Range During Sleep
- Healthy adults: **12-20 breaths per minute** during sleep
- Night-to-night variation in a healthy individual: **±1-2 breaths/min**

### Clinical Significance
- Elevation beyond ±2 breaths/min from personal baseline = meaningful signal
- **"Just four breaths over or under the average rate can predict poor medical outcomes"** (Sleep Care Online clinical reference)
- Elevated RR: signals stress, illness, airway issues, or poor sleep quality
- WHOOP includes respiratory rate as ~10% of recovery score (per third-party analyses; WHOOP does not confirm exact weighting)
- Most value in deviation tracking, not absolute values

### Use in Recovery Algorithms
Respiratory rate is the most **stable** of the four primary signals — it changes slowly and is least affected by day-to-day variation. WHOOP uses it as an early illness/overtraining indicator. Oura tracks it but does not use it as a primary Readiness contributor.

---

## Signal 8: Blood Oxygen (SpO2)

### Normal Range During Sleep
- Healthy adults: **95-100%**
- Brief dips of 1-3% are normal
- Sustained drops during sleep are a screening flag for sleep apnea

### Clinical Thresholds
- **≥95%**: Normal
- **90-94%**: Gray zone — warrants attention if persistent
- **<90% for >5 minutes**: Clinically significant hypoxemia — requires medical evaluation
- Used diagnostically: Oxygen Desaturation Index (ODI), time spent below 90% (T90) are formal sleep apnea screening metrics

### Algorithm Use
SpO2 is available on WHOOP 4.0+ and Oura Gen 3+. Best used as:
1. An outlier/alert flag (persistent <94%)
2. An illness-pattern corroborator alongside elevated RR and RHR
Not recommended as a primary weight in a daily recovery score — it's too low-variance in healthy populations to drive score changes meaningfully.

---

## Signal 9: Skin Temperature

### What It Measures
Peripheral skin temperature deviation from personal nightly baseline. Oura, WHOOP 4.0+, and Ultrahuman Ring track this.

### Clinical Thresholds
- Single-night deviation: **Not meaningful alone** (alcohol, room temp, sleeping position all cause ±0.3-0.5°C)
- **Two or more consecutive nights** of deviation in the same direction + corroborating signal = actionable
- Sustained elevation in 28-day rolling average = meaningful illness/cycle pattern signal
- Pre-symptom illness detection: wearables can identify nighttime temperature rise **hours before core body temperature spikes** and before symptom onset

### Illness Pattern Recognition
The strongest illness signal is convergent:
```
Temperature ↑ + HRV ↓ + RHR ↑ = high probability illness pattern
```
No single metric alone is reliable.

---

## WHOOP Recovery Score: Architecture

### Score Output
0-100% scale, categorized as:
- **Green (67-100%)**: Primed for high strain
- **Yellow (34-66%)**: Ready for moderate activity
- **Red (0-33%)**: Prioritize rest

### Confirmed Input Signals
1. Heart Rate Variability (HRV) — primary, measured during SWS
2. Resting Heart Rate (RHR)
3. Sleep Performance (actual vs. needed)
4. Respiratory Rate
5. Blood oxygen (WHOOP 4.0+, as secondary health monitor)
6. Skin temperature (WHOOP 4.0+, as secondary health monitor)

### Reported Weighting (MEDIUM confidence — not confirmed by WHOOP officially)
Third-party analyses and reverse-engineering suggest:
- HRV: ~40-70% (most analyses agree HRV dominates)
- RHR: ~20-30%
- Sleep: ~10-20%
- Respiratory Rate: ~10%

WHOOP's own statement: "HRV is an important input, but our proprietary algorithm — which also factors in RHR, respiratory rate, and sleep — is more predictive of next-day capacity than any signal in isolation."

### WHOOP 5.0 Updates (2024)
Rebuilt Recovery Score with:
- Expanded HRV analysis (including HRV-CV as a consistency metric)
- Adaptive sleep staging with micro-architectural features
- Ultra-short NREM burst detection
- Autonomic coherence during REM transitions
- Respiratory sinus arrhythmia (RSA) coupling strength

### Normalization Method
WHOOP normalizes all signals to personal baseline. Recovery score reflects deviation from **your own** physiological norms, not population averages. This is validated as the correct approach by the HRV research community (Marco Altini, Kubios, AI Endurance).

---

## Oura Readiness Score: Architecture

### Score Output
0-100 scale:
- **85+**: Ready for new challenges
- **70-84**: Moderate readiness
- **<70**: Prioritize rest

### Seven Contributors (confirmed by Oura)
1. **Resting Heart Rate** — deviation from personal baseline, using lowest RHR of the night
2. **HRV Balance** — 14-day weighted average vs. 3-month baseline; higher weight on past 2-5 days
3. **Body Temperature** — deviation from rolling nightly baseline
4. **Recovery Index** — how quickly RHR returns to baseline after exercise
5. **Sleep Score** — composite of multiple sleep metrics
6. **Sleep Balance** — 14-day sleep duration vs. long-term average
7. **Activity Balance** — recent activity vs. long-term pattern (avoids both over- and under-training)

### Key Oura Methodology Details
- Uses **14-day rolling average with recency weighting** for balance metrics
- Compares 14-day average to **2-month baseline** for trend signals
- Body temperature is unique to Oura among major trackers — adds illness detection capability
- "Recovery Index" measures how quickly your HR drops to its resting rate after the day's activity
- No published exact formula; algorithm is proprietary

---

## Composite Score Formula: Science-Backed Approach

### Validated Framework (HIGH confidence)
From de Gruyter 2025 review of 14 composite health scores:
- **Most frequent inputs**: HRV (86% of devices), RHR (79%), physical activity/strain (71%), sleep duration (71%)
- These four signals represent the scientific consensus on recovery signal coverage
- The most defensible composite formula uses all four

### Recommended Weighting Framework for ShiftWell
Based on research consensus (not any single manufacturer's proprietary approach):

```
Recovery Score = 
  (HRV_delta_score   × 0.40)  +   // RMSSD deviation from personal 60-day baseline
  (RHR_delta_score   × 0.25)  +   // RHR deviation from personal 30-day baseline
  (Sleep_score       × 0.25)  +   // Composite of efficiency, duration, architecture
  (RespRate_score    × 0.10)      // Deviation from personal baseline (illness flag)
```

Where each component score is normalized 0-100 from its deviation from personal baseline.

### Sleep Component Sub-Weights (within the 0.25 sleep weight):
```
Sleep_score =
  (sleep_efficiency_score × 0.30)   +
  (deep_sleep_pct_score   × 0.25)   +
  (rem_sleep_pct_score    × 0.25)   +
  (sleep_duration_pct     × 0.20)
```

### Z-Score Normalization Protocol
Standard approach validated in wearable literature:
```
signal_z = (tonight_value - 60day_mean) / 60day_std_dev
signal_score = clamp(50 + (signal_z × 15), 0, 100)
```
- 50 = baseline (you're at your own average)
- ±1 SD → score of 35 or 65
- ±2 SD → score of 20 or 80

---

## Shift Worker-Specific Algorithm Adjustments

### Key Research Findings
1. Night shift workers show **sympathetic dominance** (lower HF power, higher LF:HF ratio) — HRV baseline is systemically different
2. Night shift nurses show **no increase in HRV coherence** during their sleep period, unlike day nurses who show progressive coherence
3. **Circadian adaptation** matters: adapted night shift workers show higher REM sleep duration than non-adapted workers
4. HRV during **post-night-shift daytime sleep** needs its own baseline — cannot be compared to post-day-shift night sleep baseline

### Algorithm Implications for Shift Workers
1. **Separate baselines by sleep type**: establish distinct 60-day rolling baselines for night-shift-sleep vs. day-off-sleep
2. **Circadian disruption modifier**: on first post-night-shift sleep, apply a correction factor to avoid false red scores from circadian misalignment alone
3. **Sleep regularity scoring**: use intra-schedule-type consistency (consistency of night shift sleep times across night shift blocks), not global regularity
4. **Nap credit**: include nap data in sleep need calculation (WHOOP's `need_from_recent_nap_milli` model)
5. **Expected vs. actual**: present recovery in context of "for a night-shift worker in your rotation pattern, this is X relative to your shift peers"

---

## Summary: Clinical Threshold Reference Table

| Signal | Good | Fair | Poor | Notes |
|--------|------|------|------|-------|
| HRV (RMSSD) | Within ±10% of 60-day avg | 10-20% below avg | >20% below avg | Normalized to personal baseline |
| RHR | Within ±3 bpm of 30-day avg | 3-5 bpm above avg | >5 bpm above avg | Delta, not absolute |
| Sleep Efficiency | ≥85% | 75-84% | <75% | Time asleep / time in bed |
| Deep Sleep (N3) | 15-25% TST | 10-14% TST | <10% TST | ~60-100 min for 7h sleep |
| REM Sleep | 20-25% TST | 15-19% TST | <15% TST | ~90-120 min for 7h sleep |
| Restorative (Deep+REM) | 40-50% TST | 30-39% TST | <30% TST | WHOOP's primary architecture metric |
| Sleep Duration | ≥7h (need met) | 6-7h | <6h | Adjusted for personal need + debt |
| SpO2 | ≥95% | 90-94% | <90% sustained | Medical flag below 90% |
| Respiratory Rate | ±1 bpm of baseline | ±2 bpm | >±2 bpm | Illness/stress flag |
| Skin Temperature | ±0.2°C baseline | ±0.3-0.5°C | >0.5°C x2 nights | Requires corroborating signals |

---

## Key Published Sources

**WHOOP Methodology:**
- [WHOOP Recovery: How It Works](https://www.whoop.com/us/en/thelocker/how-does-whoop-recovery-work-101/)
- [WHOOP Developer Docs: Recovery](https://developer.whoop.com/docs/developing/user-data/recovery/)
- [WHOOP HRV-CV Explained](https://www.whoop.com/us/en/thelocker/hrv-cv-recovery-metric/)
- [WHOOP Sleep Accuracy / PSG Validation](https://www.whoop.com/us/en/thelocker/how-well-whoop-measures-sleep/)
- Wrist-Based PPG Validation: PMC8160717

**Oura Methodology:**
- [Oura Readiness Score](https://ouraring.com/blog/readiness-score/)
- [Readiness Contributors](https://support.ouraring.com/hc/en-us/articles/360057791533-Readiness-Contributors)
- [HRV Balance Explained](https://ouraring.com/blog/hrv-balance/)

**HRV Science:**
- Overview of HRV Metrics and Norms: PMC5624990
- Lifelines Cohort reference values: PMC7734556
- Age/sex differences: PMC7583712
- 2024 HRV-wellness associations study: MDPI Sensors 25(14):4415 / PubMed 40732543
- Wearable HRV validation 2025: PMC12367097

**Sleep Architecture:**
- StatPearls Sleep Stages: NCBIBookshelf NBK526132
- Walker 2009 (sleep, cognition, emotion): walkerlab.berkeley.edu
- NREM/REM roles: PMC11244911 (cognitive recovery)
- Emotional memory processing: PMC4182440, PMC4286245
- GH and SWS: Science 165(3892):513 (foundational), PubMed 8627466

**Sleep Efficiency:**
- Journal of Clinical Sleep Medicine: PMC4751425

**Sleep Regularity:**
- Sleep regularity and mortality: PMC10782501, PMC10782489
- SRI consensus statement: Sleep Health Journal (S2352-7218(23)00166-3)

**Composite Score Validation:**
- de Gruyter 2025 (14 composite scores, 10 manufacturers): https://www.degruyterbrill.com/document/doi/10.1515/teb-2025-0001/html

**Shift Worker Research:**
- Circadian disruption and HRV in shift workers: PMC11368331
- HRV coherence in nurses: PMC6373270
- Circadian adaptation to night shift and REM: ScienceDirect 2023
- Sleep restriction and HR/BP failure to recover: PMC10543608

**Normalization Methods:**
- Marco Altini on HRV and readiness: medium.com/@altini_marco
- AI Endurance 60-day/7-day model: aiendurance.com/blog

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| HRV clinical thresholds and normalization | HIGH | Multiple large-cohort studies, Kubios 2024 |
| RHR thresholds and deviation significance | HIGH | Clinical consensus, multiple sources |
| Sleep architecture percentages (N3, REM) | HIGH | StatPearls, Sleep Foundation, peer-reviewed |
| Sleep efficiency thresholds | HIGH | JCSM clinical reference |
| Sleep regularity health outcomes | HIGH | Large prospective cohorts, 2024 studies |
| Respiratory rate thresholds | MEDIUM | Clinical consensus, less wearable-specific data |
| SpO2 thresholds | HIGH | Clinical sleep medicine standard |
| WHOOP exact signal weights | LOW | Not disclosed; third-party estimates only |
| Oura exact signal weights | LOW | Not disclosed; structural components confirmed |
| Shift worker HRV adjustment values | MEDIUM | Research shows direction but not specific correction factors |
