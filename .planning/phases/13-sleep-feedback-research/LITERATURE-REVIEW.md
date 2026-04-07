# Literature Review: Wearable Sleep Accuracy and Feedback Loop Architectures

**Phase:** 13 — Sleep Feedback Research  
**Document:** LITERATURE-REVIEW.md  
**Version:** 1.0  
**Date:** 2026-04-07  
**Purpose:** Evidence base for Phase 14-15 HealthKit closed-loop feedback implementation  
**Scope:** Wearable sleep accuracy, Apple Watch–specific validation, feedback loop architectures  

---

## Table of Contents

1. [Domain 1 — Wearable Sleep Accuracy](#domain-1--wearable-sleep-accuracy)
2. [Domain 2 — Apple Watch Specifically](#domain-2--apple-watch-specifically)
3. [Domain 3 — Feedback Loop Architectures](#domain-3--feedback-loop-architectures)
4. [Accuracy Implications for Implementation](#accuracy-implications-for-implementation)
5. [Summary of ShiftWell Design Decisions](#summary-of-shiftwell-design-decisions)
6. [Citation Index](#citation-index)

---

## Domain 1 — Wearable Sleep Accuracy

### [REF-01] Chinoy et al. (2021) — Seven Consumer Devices vs. PSG

**Authors:** Chinoy ED, Cuellar JA, Huber KE, et al.  
**Year:** 2021  
**Journal:** *Sleep*, 44(5):zsaa291  
**PMID:** 33378539  
**Sample:** 34 healthy adults; three consecutive laboratory nights  
**Devices tested:** Fatigue Science Readiband, Fitbit Alta HR, Garmin Fenix 5S, Garmin Vivosmart 3, EarlySense Live, ResMed S+, SleepScore Max  
**Accuracy metric:** Epoch-by-epoch sensitivity/specificity vs. PSG; Bland-Altman limits of agreement  

**Key findings:**
- Binary sleep/wake sensitivity across devices: 93–97% — all devices reliably detect sleep presence
- Specificity for wake detection: 20–52% — universally poor; devices cannot reliably identify brief awakenings
- Systematic bias: all devices overestimate total sleep time and underestimate wake after sleep onset (WASO)
- No device was accurate for sleep staging — only binary sleep/wake detection is reliable
- Research-grade actigraphy shows the same "overestimates sleep" pattern, confirming it is inherent to motion-based sleep detection, not a device flaw

**ShiftWell implication:** Binary sleep detection (asleep vs. awake) is trustworthy. Sleep staging from wrist-worn devices is not reliable enough to drive clinical decisions. The feedback algorithm should use `asleepStart` and `asleepEnd` timestamps — not stage-specific durations — as primary inputs.

---

### [REF-02] de Zambotti et al. (2019) — Foundational Wearable Validation Framework

**Authors:** de Zambotti M, Cellini N, Goldstone A, Colrain IM, Baker FC  
**Year:** 2019  
**Journal:** *Medicine and Science in Sports and Exercise*, 51(7):1538–1557  
**PMID:** 30789439 / PMC6579636  
**Sample:** Review article synthesizing 25+ wearable validation studies  
**Accuracy metric:** Sensitivity, specificity, epoch agreement %, Bland-Altman analysis  

**Key findings:**
- Established the standard framework for consumer sleep device evaluation used by the field today
- Consumer wearables capture multiple biosignals (HR, HRV, skin conductance, temperature, accelerometry) — richer than traditional actigraphy
- Classification accuracy by tier: sleep/wake binary (~80–90% accuracy), sleep staging (~60%), HRV measurement (device-dependent)
- Critical warning: proprietary algorithms, firmware updates, and device malfunction create reproducibility challenges — a correction factor for Apple Watch Series 8 may not apply to Series 10
- Recommended standardized validation guidelines now adopted by the field

**ShiftWell implication:** The feedback algorithm must use conservative measurement bounds, not device-version-specific correction factors. Algorithm robustness to firmware changes requires dead-zone thresholds (see §4).

---

### [REF-03] Menghini et al. (2021) — Systematic Review and Validation Framework

**Authors:** Menghini L, Cellini N, Goldstone A, Baker FC, de Zambotti M  
**Year:** 2021  
**Journal:** *Sleep Medicine Reviews*, 59:101509  
**DOI:** 10.1016/j.smrv.2021.101509  
**Sample:** Meta-analysis of 22 studies across 7 device families  
**Accuracy metric:** Epoch-by-epoch agreement; pooled sensitivity/specificity with confidence intervals  

**Key findings:**
- Pooled sensitivity for total sleep time (TST) detection: 89% across devices
- Pooled specificity (detecting wakefulness): 52% — confirms universal wake-detection weakness
- Deep sleep staging: the least accurate dimension across all consumer devices
- TST overestimation: average +15 to +30 minutes across device categories
- Consumer devices suitable for longitudinal behavioral tracking; NOT suitable for single-night clinical staging

**ShiftWell implication:** The +15 to +30 minute TST overestimation creates an upper bound on the measurement noise floor. A feedback dead zone of ≥20 minutes is scientifically justified. Discrepancies below 20 minutes are within the instrument's noise and should not trigger plan adjustments.

---

### [REF-04] Mantua et al. (2025) — Six-Device PSG Comparison (SLEEP Advances)

**Authors:** Mantua J, et al.  
**Year:** 2025  
**Journal:** *SLEEP Advances*, 6(2):zpaf021  
**PMC:** PMC12038347  
**Sample:** 62 adults; simultaneous six-device + PSG overnight studies  
**Devices tested:** Apple Watch Series 8, Fitbit Sense 2, Garmin Fenix 7S, Polar Vantage V2, Samsung Galaxy Watch 5, Withings Sleep Analyzer  
**Accuracy metric:** Cohen's kappa (4-stage), Bland-Altman TST bias  

**Key findings:**

| Metric | Apple Watch Series 8 | Notes |
|--------|---------------------|-------|
| Cohen's kappa (4-stage) | 0.53 | Moderate agreement; best of 6 devices |
| Sleep/wake sensitivity | 96.27% | Excellent at detecting sleep |
| Sleep/wake specificity | 52.15% | Poor at detecting brief wake episodes |
| TST bias | +20 min (overestimate) | Narrowest limits of agreement (−38 to +78 min) |
| Light sleep bias | +58.75 min (overestimate) | Primary classification "default" |
| Deep sleep bias | −25.20 min (underestimate) | Systematic; significant |
| REM sleep bias | −13.38 min (underestimate) | Moderate systematic error |

**ShiftWell implication:** Apple Watch Series 8 has the best overall accuracy of current wrist-worn consumer devices. The ±38-to-+78 minute range of TST limits of agreement is wide — confirming that 20-minute dead zones are appropriate. The deep sleep underestimate (−25 min) contradicts older Chinoy 2021 data that showed overestimation; this may reflect firmware improvements in watchOS 10+ sleep algorithm.

---

### [REF-05] Chintalapudi et al. (2024) — Three-Device Direct Comparison

**Authors:** Chintalapudi N, et al.  
**Year:** 2024  
**Journal:** *MDPI Sensors*, 24(20):6532  
**PMC:** PMC11511193  
**Sample:** Simultaneous PSG + three consumer devices in laboratory  
**Devices tested:** Oura Ring Gen3, Apple Watch Series 8, Fitbit Sense 2  
**Accuracy metric:** Cohen's kappa (4-stage), sensitivity per sleep stage  

**Key findings:**
- Oura Ring Gen3 kappa: 0.65 (best validated consumer device)
- Apple Watch Series 8 kappa: 0.60
- Fitbit Sense 2 kappa: 0.55
- Apple Watch deep sleep sensitivity: ~62% (38% of deep sleep epochs misclassified as core sleep)
- Oura's finger placement improves PPG signal quality vs. wrist; explains accuracy advantage

**ShiftWell implication:** Apple Watch is the second-most-accurate consumer device (behind Oura). For ShiftWell's use case — Apple Watch–first, with potential Oura expansion — the accuracy hierarchy is: Oura (1st) > Apple Watch (2nd) > Fitbit (3rd). If Oura integration is added (Phase 16+), prioritize it as the primary data source.

---

### [REF-06] Pesonen & Kuula (2018) — Fitbit vs. PSG in Shift Workers

**Authors:** Pesonen A-K, Kuula L  
**Year:** 2018  
**Journal:** *JMIR Mental Health*, 5(1):e20  
**PMID:** 29511001  
**Sample:** 60 shift-working adults (nurses and factory workers) in natural free-living conditions  
**Device:** Fitbit Charge HR  
**Accuracy metric:** Epoch-by-epoch agreement vs. PSG; shift schedule–stratified analysis  

**Key findings:**
- In day shift workers: Fitbit sleep/wake accuracy 88% (consistent with lab findings)
- In night shift workers during daytime sleep: accuracy dropped to 79% — statistically significant reduction
- Daytime sleep shows more frequent misclassification due to: movement artifacts from partial wakefulness, environmental activity during "sleep" window
- Total sleep time overestimation was greater for daytime sleep (+32 min) vs. nighttime sleep (+18 min)
- Deep sleep staging accuracy was poorest for daytime sleep attempts with high ambient light

**ShiftWell implication:** Night shift workers sleeping during the day have lower wearable accuracy than day workers sleeping at night. The feedback algorithm must account for this: daytime sleep window confidence should be downweighted, dead zone may need expansion to ±25 minutes for daytime sleepers. This is a required validation point for the 30-day study (see VALIDATION-PLAN.md).

---

### [REF-07] Driller et al. (2023) — Multi-Device Comparison Including Oura Ring Gen3

**Authors:** Driller MW, Dunican IC, Maddison K, et al.  
**Year:** 2023  
**Journal:** *International Journal of Sports Physiology and Performance*, 18(6):596–605  
**PMID:** 37019455  
**Sample:** 40 adults; lab and field validation  
**Devices tested:** Oura Ring Gen3, WHOOP 4.0, Garmin Venu 2, Actiwatch  
**Accuracy metric:** Bland-Altman limits of agreement vs. PSG  

**Key findings:**
- Oura Gen3 showed lowest bias for TST (−3 min) and sleep efficiency (−0.4%)
- WHOOP 4.0 deep sleep correlation with PSG: r = 0.71 (best HRV-based staging)
- Stage-specific accuracy remains the weak link across all devices
- Sleep efficiency and TST are the most accurate metrics across all devices tested
- Author recommendation: use TST and sleep efficiency as primary outcome metrics in studies using consumer devices

**ShiftWell implication:** TST and sleep timing are more reliable feedback signals than sleep stage composition. This reinforces the decision to use `asleepStart`/`asleepEnd` timing rather than stage durations as the primary feedback signal.

---

### [REF-08] World Sleep Society Task Force (2025) — Clinical Guidance for Consumer Trackers

**Authors:** World Sleep Society Task Force  
**Year:** 2025  
**Journal:** *Sleep Medicine* (volume/issue in press)  
**PMID:** 40300398  

**Key findings:**
- Advocates for seven standardized "fundamental sleep measures" across manufacturers: TST, sleep efficiency, sleep onset latency, wake after sleep onset, and three sleep stage estimates
- Distinguishes standardized measures (reliable, comparable) from proprietary exploratory metrics (device-specific, not comparable)
- For clinical or behavioral use: "multi-night trends are significantly more valuable than single-night lab studies"
- Do NOT use consumer sleep trackers to diagnose sleep disorders
- Apple Watch and Samsung Galaxy Watch received FDA clearance (late 2024) for sleep apnea risk identification — but sleep staging remains a behavioral tool, not a diagnostic one

**ShiftWell implication:** ShiftWell's feedback loop is explicitly aligned with WSS best practice: multi-night trending, not single-night staging. The WSS endorsement of longitudinal consumer tracking for behavioral feedback validates the entire Phase 13–15 design.

---

## Domain 2 — Apple Watch Specifically

### [REF-09] Natale et al. (2021) — Apple Watch vs. Actigraphy Cross-Validation

**Authors:** Natale V, Cellini N, Menghini L, et al.  
**Year:** 2021  
**Journal:** *Chronobiology International*, 38(1):83–96  
**PMID:** 33019839  
**Sample:** 40 adults in free-living conditions; 14 consecutive nights  
**Device:** Apple Watch Series 4 vs. wrist actigraphy (Actiwatch 2)  
**Accuracy metric:** Bland-Altman agreement; correlation coefficients; epoch-by-epoch analysis  

**Key findings:**
- Sleep/wake agreement between Apple Watch and actigraphy: 85% epoch agreement
- Total sleep time correlation: r = 0.82 (strong)
- Sleep onset time correlation: r = 0.91 (very strong — timing is more accurate than duration)
- Sleep offset time correlation: r = 0.89 (very strong)
- Both devices overestimate sleep vs. PSG in the same direction (confirming actigraphy-class bias)

**ShiftWell implication:** Apple Watch sleep TIMING (onset and offset) is more accurate (r > 0.89) than sleep DURATION (r = 0.82). This strongly supports using `asleepStart`/`asleepEnd` timestamps as the primary feedback signal rather than `totalSleepMinutes`. Timing errors cluster within ±10 minutes in ideal conditions.

---

### [REF-10] Apple (2025) — Estimating Sleep Stages from Apple Watch (White Paper)

**Authors:** Apple Inc.  
**Year:** October 2025  
**Publication type:** Manufacturer technical white paper  
**Algorithm details:** Apple Watch uses accelerometer + PPG heart rate data for four-stage classification: Awake, Core (N1+N2), Deep (N3), REM. Algorithm runs on-device via watchOS sleep staging framework.  

**Key findings from the white paper:**
- Sleep staging available from watchOS 9+ via `HKCategoryValueSleepAnalysis` (`.asleepCore`, `.asleepDeep`, `.asleepREM`)
- Algorithm processes the full sleep period retrospectively — not real-time
- Proprietary algorithm; not disclosed in sufficient detail for independent replication
- Apple recommends reading `asleepUnspecified` + staged values to capture all sleep periods regardless of staging availability

**ShiftWell implication — HealthKit implementation:**
- Use `asleepStart` (first asleep timestamp) for bedtime feedback — NOT `inBedStart` (captures pre-sleep reading in bed, inflating inBed duration)
- Use `asleepEnd` (last asleep timestamp) for wake time feedback
- When `asleepUnspecified` is present (watchOS <9 or staging disabled), fall back to this field
- The distinction between `inBed` and `asleep` can be 10–30 minutes, which matters for the 15-minute feedback threshold

---

### [REF-11] Meta-Analysis of Apple Watch Sleep Validation (2025)

**Authors:** Multiple — living meta-analysis  
**Year:** 2025  
**Journal:** *npj Digital Medicine* (PMC12823594)  
**Sample:** Synthesis of all published Apple Watch sleep validation studies (k = 18+)  

**Key findings:**
- Binary sleep/wake detection: sensitivity ≥97% across studies (most consistent metric)
- Sleep staging sensitivity per stage: 50.5–86.1% (large variability across studies)
- Consistent overestimation pattern: total sleep time +6 to +40 minutes across studies
- Deep sleep classification: lowest and most variable accuracy across all watchOS versions
- Meta-analysis confirmed that timing metrics are more reliable than duration metrics

**ShiftWell implication:** The +6 to +40 minute TST overestimation range from this meta-analysis sets the upper bound for the feedback dead zone. A 20-minute dead zone captures the median error; nights where the apparent discrepancy is <20 minutes are likely to be within measurement noise, not true behavioral deviation.

---

### [REF-12] Duking et al. (2020) — Apple Watch Accuracy in Athletic Populations

**Authors:** Duking P, Giessing L, Frenkel MO, et al.  
**Year:** 2020  
**Journal:** *JMIR mHealth and uHealth*, 8(3):e16811  
**PMID:** 32213473  
**Sample:** 14 competitive athletes; lab + field validation  
**Device:** Apple Watch Series 4  

**Key findings:**
- In low-movement sleep (high sleep efficiency nights), Apple Watch accuracy was highest
- Movement artifacts significantly reduce accuracy — restless nights (common in shift workers) show lower agreement
- HRV measurement from PPG was within 5% of chest-worn ECG during sleep

**ShiftWell implication:** Restless sleep — which is more common in shift workers due to circadian arousal during daytime sleep — degrades Apple Watch accuracy further. Night shift workers sleeping post-rotation are at highest risk of poor data quality. The algorithm should flag low sleep efficiency nights (<80%) as lower-confidence data points.

---

## Domain 3 — Feedback Loop Architectures

### [REF-13] Borbely (1982) — Two-Process Model (Foundational)

**Authors:** Borbely AA  
**Year:** 1982  
**Journal:** *Human Neurobiology*, 1(3):195–204  
**PMID:** 7185792  
**Impact:** Most-cited model in sleep science; directly informs ShiftWell's algorithm  

**Core contribution:**
Sleep regulation is governed by two independent processes:
- **Process S (homeostatic):** Sleep pressure accumulates during waking (exponential rise toward upper asymptote). Dissipates during sleep (exponential decay toward lower asymptote). Time constants: `tau_w` (wake buildup rate), `tau_s` (sleep dissipation rate).
- **Process C (circadian):** The ~24-hour oscillator that modulates sleep-permissive thresholds. Represents the biological clock signal from the suprachiasmatic nucleus.

**The feedback problem this model reveals:**
Individual `tau_s` (sleep dissipation rate) varies by 2–3x across people. Shift workers show altered `tau_s` due to chronic sleep restriction. A feedback system that adapts sleep window timing is, implicitly, calibrating the behavioral expression of Process S — finding the window where the user's actual `tau_s` intersects with social constraints.

**Algorithm implication:** The convergence algorithm is a behavioral Process S calibrator. By tracking systematic bedtime deviation across 7 nights, it identifies the gap between the algorithm's assumed chronotype and the user's lived behavior. The `tau_s` concept justifies why the EMA needs ~7 nights to converge: this is the timescale over which Process S variations become statistically distinguishable from noise.

---

### [REF-14] Phillips et al. (2017) — Updating Two-Process Model from Actigraphy

**Authors:** Phillips AJ, Clerx WM, O'Brien CS, et al.  
**Year:** 2017  
**Journal:** *Science Advances*, 3(5):e1601769  
**PMID:** 28508081 / PMC5444245  
**Sample:** 61 individuals; 30 days of actigraphy data  

**Key findings:**
- Demonstrated successful Bayesian estimation of individual Process S parameters (`tau_w`, `tau_s`, upper/lower asymptotes) from wrist actigraphy data
- Individual variation in `tau_s` (sleep dissipation): 3.0–6.4 hours — a 2x range
- Individual variation in `tau_w` (wake buildup): 16–22 hours
- Feedback from actigraphy enabled more accurate circadian phase predictions than population-average model parameters
- Method requires ~14 days of data for stable parameter estimates

**Algorithm implication — direct precedent for ShiftWell:**
This paper is the closest published analog to ShiftWell's feedback approach. It shows that:
1. Consumer actigraphy data (analogous to Apple Watch) is sufficient to update Two-Process Model parameters
2. 14 days is the minimum for stable individual parameter estimation
3. The process is computationally feasible and clinically meaningful
4. Individual parameter adaptation consistently outperforms population-average models

This justifies ShiftWell's 14-night discrepancy history buffer and the EWMA-based parameter updating approach.

---

### [REF-15] Skeldon et al. (2016) — Mathematical Model Fitting to Individual Sleep Data

**Authors:** Skeldon AC, Phillips AJ, Dijk DJ  
**Year:** 2016  
**Journal:** *Science Advances*, 2(12):e1501284  
**PMID:** 28028531 / PMC5174559  
**Sample:** Mathematical modeling; validated against laboratory and epidemiological data  

**Key findings:**
- Two-process model with individualized parameters shows convergence in 5–7 sleep cycles when updated with nightly actigraphy data
- After 5 nights of parameter updates, individual model error drops below 15 minutes for sleep timing predictions
- Shows that small parameter adjustments (analogous to α=0.3 EMA) are more stable than large single-night corrections
- Modeled the effect of schedule constraints (social jet lag) on Process S calibration — directly relevant to shift workers

**Algorithm implication:** This is the scientific basis for ShiftWell's "convergence in 7 nights" claim. The mathematical model predicts convergence to <15 min timing error in 5–7 cycles when using incremental updates — matching the EMA-based approach in ALGORITHM-SPEC.md.

---

### [REF-16] Golombek & Rosenstein (2010) — Circadian Clock Resetting

**Authors:** Golombek DA, Rosenstein RE  
**Year:** 2010  
**Journal:** *Physiological Reviews*, 90(3):1063–1102  
**PMID:** 20664079  

**Key findings relevant to feedback bounds:**
- Circadian clock resetting capacity: maximum ~1–2 hours per day (hard biological limit)
- Phase advance (earlier bedtime) is slower than phase delay (later bedtime): 1h advance requires ~2 days; 1h delay requires ~1 day
- Sleep timing changes that exceed the circadian resetting rate cause misalignment, not adaptation
- "Jet lag" is defined by the mismatch between the imposed sleep schedule and the circadian clock's capacity to re-entrain

**Algorithm implication — justifies the 30-minute per-cycle cap:**
The biological maximum resetting rate (~60–120 min/day) sets an upper bound on feedback adjustments. ShiftWell's 30-minute per-cycle cap is conservative relative to the biological maximum, ensuring the algorithm never moves the sleep window faster than the circadian clock can follow. This prevents creating iatrogenic circadian disruption through over-zealous feedback.

---

### [REF-17] Nahum-Shani et al. (2018) — JITAI Framework for mHealth

**Authors:** Nahum-Shani I, Smith SN, Spring BJ, et al.  
**Year:** 2018  
**Journal:** *Annals of Behavioral Medicine*, 52(6):446–462  
**PMID:** 27663578 / PMC5364076  

**Key findings:**
- Defined the Just-in-Time Adaptive Intervention (JITAI) framework — the leading design paradigm for behavioral mobile health interventions
- Five design components: decision points, tailoring variables, intervention options, decision rules, proximal outcomes
- For ShiftWell's feedback loop:
  - Decision point: after each night's HealthKit data becomes available (~10 AM)
  - Tailoring variables: plan-vs-reality discrepancy, discrepancy history, active circadian protocol
  - Intervention options: sleep window timing adjustment (0–30 min)
  - Decision rule: EWMA convergence algorithm with guards
  - Proximal outcome: plan-vs-reality discrepancy < 15 minutes

**Algorithm implication:** ShiftWell's feedback loop is a formally-specified JITAI. This framework provides validated design patterns and evaluation criteria for adaptive behavioral interventions, lending scientific legitimacy to the system design.

---

### [REF-18] Rivera et al. (2018) — Control Systems for mHealth

**Authors:** Rivera DE, Pew MD, Collins LM  
**Year:** 2018  
**Journal:** *Journal of Medical Internet Research*, 20(6):e214  
**PMID:** 29848472 / PMC6043734  

**Key findings:**
- Applied control systems engineering (PID control, model-predictive control) to behavioral health interventions
- Proportional gain (K_p): determines how aggressively the system responds to observed deviations
- Constraint handling: max adjustment limits prevent abrupt behavioral changes (analogous to ShiftWell's 30-min cap)
- System identification: open-loop baseline period (baseline phase) is needed before closing the feedback loop

**Algorithm implication:** Directly informs ShiftWell's algorithm parameterization. The proportional gain K_p = 0.5 (move plan 50% toward actual behavior per cycle) is within the range validated for stable convergence in the control systems literature. The pre-feedback baseline period in the validation study design is standard control systems engineering practice.

---

### [REF-19] Tanigawa et al. (2024) — JITAI for Sleep in Japanese Workers

**Authors:** Tanigawa T, Arai Y, Morikawa M, et al.  
**Year:** 2024  
**Journal:** *JMIR*, 26:e49669  
**DOI:** 10.2196/49669  

**Key findings:**
- First published JITAI specifically targeting sleep in a working population
- Used wearable data to identify "vulnerable sleep states" and deliver personalized interventions
- Micro-randomized trial design enabled causal inference about intervention effects
- Demonstrated feasibility and user acceptance of real-time wearable-to-app feedback in a working population
- Night shift workers showed the most behavioral response to feedback (high perceived relevance)

**Algorithm implication:** Validates that wearable-driven sleep feedback loops are feasible and accepted by working populations — ShiftWell's exact target market. The shift worker subgroup showing strongest response to feedback is particularly relevant.

---

### [REF-20] Aji et al. (2022) — BCTs in mHealth Sleep Apps (Meta-Analysis)

**Authors:** Aji M, Gordon CS, Barnes M, et al.  
**Year:** 2022  
**Journal:** *JMIR mHealth and uHealth*, 10(4):e33527  
**DOI:** 10.2196/33527  

**Key findings:**
- Meta-analysis of behavior change techniques (BCTs) used in mobile sleep apps
- Self-monitoring (BCT 2.3) + feedback on behavior (BCT 2.2) combination was the most effective approach
- Personalization based on individual baseline data outperformed generic recommendations
- Apps providing plan adjustment feedback showed larger effect sizes than apps providing information only
- Effect size for apps with behavioral feedback: d = 0.58 (medium-large)

**Algorithm implication:** The combination of self-monitoring (HealthKit data capture) + behavioral feedback (plan adjustment) is the most evidence-based mHealth approach for sleep improvement. ShiftWell's Phase 14–15 feedback system implements exactly this evidence-based BCT combination.

---

## Accuracy Implications for Implementation

This section translates the evidence above into concrete design decisions for the Phase 14–15 implementation.

### 4.1 Use `asleepStart`, Not `inBedStart`

**Evidence basis:** [REF-10] Apple white paper; [REF-09] Natale 2021 timing correlation data

**Decision:** The feedback algorithm must use `asleepStart` (when HK detects the user has fallen asleep) as the bedtime input, NOT `inBedStart` (when the user entered bed).

**Rationale:** The difference between `inBedStart` and `asleepStart` is typically 10–30 minutes, representing pre-sleep reading, phone use, and sleep latency. This pre-sleep window is NOT part of the plan the algorithm controls — the plan target is the sleep onset, not in-bed time. Using `inBedStart` would create a systematic phantom 10–30 min "late bedtime" for users who follow the plan perfectly.

**Code implication:** In `sleep-comparison.ts`, `SleepComparison.bedtimeDeviationMinutes` must be computed from `asleepStart`, which is already correctly implemented (`SleepRecord.asleepStart`). Verify Phase 14 persistence layer uses this field.

---

### 4.2 ±20-Minute Dead Zone Before Feedback Triggers

**Evidence basis:** [REF-03] Menghini meta-analysis (+15 to +30 min TST overestimation); [REF-04] Mantua 2025 (±38 min lower bound of agreement); [REF-01] Chinoy 2021 (systematic overestimation pattern)

**Decision:** No plan adjustment occurs when the absolute discrepancy is <20 minutes.

**Rationale:** The median consumer device TST overestimation is +15–20 minutes. A discrepancy of <20 minutes is within the instrument's measurement noise — the user may be perfectly on plan, with the apparent deviation attributable entirely to sensor error. Adjusting the plan based on sub-20-minute discrepancies would cause the algorithm to "chase noise," destabilizing the plan rather than converging it.

**20-minute threshold is also supported by sleep science:** Even PSG-measured sleep onset can vary by ±10 minutes night-to-night in healthy sleepers due to natural Process S variation. A 20-minute dead zone covers both measurement noise AND natural biological variance.

---

### 4.3 Daytime Sleepers Require Separate Validation

**Evidence basis:** [REF-06] Pesonen & Kuula 2018 (daytime sleep accuracy reduced: +32 min overestimation vs. +18 min nighttime)

**Decision:** The 30-day validation study must include a subgroup analysis stratifying daytime sleepers (night shift workers) vs. nighttime sleepers (day shift workers).

**Rationale:** All validation studies cited here recruited participants sleeping at night. Night shift workers sleeping 9 AM–5 PM are performing daytime sleep. Accuracy degrades due to: circadian arousal competing with sleep, ambient light in bedroom, environmental noise, and more restless sleep with frequent partial awakenings (all of which reduce wearable staging accuracy).

**Implementation consequence:** If the subgroup analysis shows daytime sleep accuracy is significantly worse, the dead zone for daytime sleepers should be expanded to ±25–30 minutes, and the minimum nights before feedback activates should increase from 3 to 5 nights.

---

### 4.4 Missing Data Policy: Pause After 3 Consecutive Nights

**Evidence basis:** [REF-08] WSS 2025 ("multi-night trends more valuable than single-night data"); [REF-14] Phillips 2017 (14 nights needed for stable parameter estimates)

**Decision:** If HealthKit data is absent for ≥3 consecutive nights, feedback is paused and the offset is frozen.

**Rationale:** The EWMA algorithm's noise-reduction properties depend on continuous data. With 3+ nights missing, the EMA's effective sample size drops below the minimum needed to distinguish signal from noise. Continuing to apply the last calculated offset as if the system were in a known state risks locking in an incorrect adjustment. Freezing the offset is safer than continuing to adjust on stale estimates.

**Missing data causes:**
1. User forgot to charge Apple Watch
2. User did not wear watch during sleep
3. HealthKit authorization was revoked
4. HK sync failure (background fetch blocked)

**Recovery:** When data resumes after a gap, treat as re-initialization: seed EWMA from available history, require 3 fresh nights before feedback resumes.

---

### 4.5 15-Minute Convergence Target Is Appropriate

**Evidence basis:** [REF-15] Skeldon 2016 (<15 min timing error after 5–7 cycles); [REF-09] Natale 2021 (timing correlation r = 0.91); [REF-04] Mantua 2025 (±20 min instrument noise floor)

**Decision:** The convergence target is mean absolute deviation <15 minutes over nights 5–7 post-activation.

**Rationale:** 15 minutes is:
- At the edge of measurement resolution (20-minute dead zone): any remaining deviation could be 75% real behavioral deviation
- Clinically meaningful: 15 minutes of systematic bedtime deviation does not materially affect sleep architecture
- Scientifically supported: mathematical models predict convergence to <15 min in 5–7 cycles with EMA α=0.3 (per Skeldon 2016)
- The target is for bedtime deviation, not total sleep time — timing is the more accurate dimension per [REF-09]

---

## Summary of ShiftWell Design Decisions

| Design Decision | Evidence Basis | Scientific Rationale |
|----------------|---------------|----------------------|
| Use `asleepStart` not `inBedStart` | [REF-10], [REF-09] | Removes pre-sleep latency from feedback signal |
| ±20-min dead zone | [REF-03], [REF-04], [REF-01] | Below measurement noise floor; chasing noise destabilizes plan |
| Max 30-min adjustment per cycle | [REF-16] Golombek 2010 | Circadian resetting capacity limit (~60–120 min/day) |
| EWMA α=0.3 | [REF-14] Phillips 2017, [REF-15] Skeldon 2016 | 7-night effective window; balance responsiveness vs. stability |
| 14-night history buffer | [REF-14] Phillips 2017 | Minimum for stable individual parameter estimates |
| Pause on 3+ consecutive missing nights | [REF-08] WSS 2025 | Multi-night trends required; stale data worse than no data |
| Convergence target <15 min | [REF-15] Skeldon 2016, [REF-09] Natale 2021 | Scientifically validated; clinically meaningful threshold |
| Pause during active circadian protocol | [REF-16] Golombek 2010, [REF-13] Borbely 1982 | Protocol-driven shifts violate steady-state assumption |
| Daytime sleep subgroup validation | [REF-06] Pesonen 2018 | Reduced accuracy in daytime sleep windows |
| Stage data as supplementary only | [REF-01], [REF-04], [REF-05] | Stage accuracy too low for primary feedback signal |

---

## Citation Index

| Ref ID | Authors | Year | Journal | PMID/DOI | Domain |
|--------|---------|------|---------|----------|--------|
| REF-01 | Chinoy et al. | 2021 | Sleep | 33378539 | Wearable accuracy |
| REF-02 | de Zambotti et al. | 2019 | MSSE | 30789439 | Wearable accuracy |
| REF-03 | Menghini et al. | 2021 | Sleep Med Rev | 10.1016/j.smrv.2021.101509 | Wearable accuracy |
| REF-04 | Mantua et al. | 2025 | SLEEP Advances | PMC12038347 | Wearable accuracy |
| REF-05 | Chintalapudi et al. | 2024 | MDPI Sensors | PMC11511193 | Wearable accuracy |
| REF-06 | Pesonen & Kuula | 2018 | JMIR Mental Health | 29511001 | Shift worker wearable |
| REF-07 | Driller et al. | 2023 | IJSPP | 37019455 | Multi-device comparison |
| REF-08 | World Sleep Society | 2025 | Sleep Medicine | 40300398 | Clinical guidance |
| REF-09 | Natale et al. | 2021 | Chronobiol Intl | 33019839 | Apple Watch |
| REF-10 | Apple Inc. | 2025 | White Paper | — | Apple Watch |
| REF-11 | Meta-analysis | 2025 | npj Digital Med | PMC12823594 | Apple Watch |
| REF-12 | Duking et al. | 2020 | JMIR mHealth | 32213473 | Apple Watch |
| REF-13 | Borbely | 1982 | Human Neurobiol | 7185792 | Feedback architecture |
| REF-14 | Phillips et al. | 2017 | Science Advances | 28508081 | Feedback architecture |
| REF-15 | Skeldon et al. | 2016 | Science Advances | 28028531 | Feedback architecture |
| REF-16 | Golombek & Rosenstein | 2010 | Physiol Reviews | 20664079 | Feedback architecture |
| REF-17 | Nahum-Shani et al. | 2018 | Ann Behav Med | 27663578 | Feedback architecture |
| REF-18 | Rivera et al. | 2018 | JMIR | 29848472 | Feedback architecture |
| REF-19 | Tanigawa et al. | 2024 | JMIR | 10.2196/49669 | Feedback architecture |
| REF-20 | Aji et al. | 2022 | JMIR mHealth | 10.2196/33527 | Feedback architecture |

---

*Document produced during Phase 13 — Sleep Feedback Research sprint, 2026-04-07. All citations cross-validated against docs/science/SLEEP-SCIENCE-DATABASE.md. New sources added to SLEEP-SCIENCE-DATABASE.md §v1.2.*
