# Wearable Accuracy Assessment: Apple Watch vs Polysomnography

**Phase:** 32 — HRV + Wearable Research  
**Version:** 1.0  
**Date:** 2026-04-07  
**Purpose:** Define the accuracy limitations of Apple Watch HRV and sleep stage data relative to the gold standard (polysomnography), and recommend a processing architecture for ShiftWell's Adaptive Brain.

---

## Table of Contents

1. [Apple Watch HRV Measurement Method](#1-apple-watch-hrv-measurement-method)
2. [HRV Accuracy vs Gold Standard](#2-hrv-accuracy-vs-gold-standard)
3. [Sleep Stage Detection Accuracy](#3-sleep-stage-detection-accuracy)
4. [Confidence Weight Recommendation](#4-confidence-weight-recommendation)
5. [Processing Recommendation: Batch vs Real-Time](#5-processing-recommendation-batch-vs-real-time)
6. [Summary: Apple Watch as a "Good Enough" Signal](#6-summary)

---

## 1. Apple Watch HRV Measurement Method

### 1.1 Sensor Technology: PPG

Apple Watch measures cardiac timing using **photoplethysmography (PPG)** — a green LED optical sensor on the wrist. The sensor shines green light into the skin and measures the variation in reflected light as blood volume changes with each heartbeat. The timing of these volume pulses is used to estimate RR intervals (inter-beat intervals), from which HRV metrics are derived.

**How this differs from ECG-based HRV (gold standard):**
- ECG measures the electrical activation of the heart muscle directly (millisecond precision, RR interval accuracy: ±1–2 ms)
- PPG measures blood volume changes downstream of the heart — peak detection adds noise (typical precision: ±5–15 ms per interval)
- PPG peak detection is affected by: skin tone, tattoos, body hair, wrist tightness, motion, ambient light, peripheral vasoconstriction (cold conditions)

### 1.2 What Apple Watch Actually Reports in HealthKit

There is an important distinction between the two HRV values Apple Watch reports:

| HealthKit Type | Metric | When Collected | Typical Usage |
|---------------|--------|---------------|---------------|
| `HKQuantityTypeIdentifierHeartRateVariabilitySDNN` | SDNN (Standard Deviation of all NN intervals) | Background, throughout the day and during sleep | Continuous overnight monitoring |
| Breathe app / Mindfulness session | RMSSD (explicit) | Only during active Breathe or Mindfulness session | Not available passively |

**ShiftWell implication:** For passive overnight monitoring via HealthKit background delivery, we work with **SDNN**, not RMSSD. SDNN and RMSSD are correlated (r ≈ 0.85–0.92) but are distinct metrics — do NOT apply RMSSD-specific population thresholds to SDNN readings.

### 1.3 Background HRV Measurement During Sleep

Apple Watch collects HRV samples opportunistically during sleep (every 10–30 minutes depending on watchOS version and user activity level). These samples are:

- Triggered when the watch detects minimal movement (maximizing accuracy)
- Stored as discrete sample points in HealthKit with timestamps
- Available for batch query via `HKSampleQuery` or `HKStatisticsCollectionQuery`

**Best practice for ShiftWell:** Query all HRV samples within the detected sleep window and average them. This averages over ~12–18 sample points for a typical 7-hour sleep, reducing the influence of any single noisy reading.

---

## 2. HRV Accuracy vs Gold Standard

### 2.1 Primary Comparison Studies

**Hernando et al. (2018)** — Apple Watch vs simultaneous ECG:
- During rest conditions: PPG-derived HRV within **±5–10%** of ECG-derived RMSSD
- Mean Absolute Error (MAE) at rest: approximately 3–8 ms for RMSSD equivalent
- During light activity: MAE increases to 15–25 ms (signal-to-noise ratio drops sharply)
- **Conclusion:** Sleep period is the ideal measurement window for Apple Watch HRV accuracy

**de Zambotti et al. (2019)** — Consumer wearable vs polysomnography (PSG):
- Population studied: multiple consumer wearables including Apple Watch-generation devices
- Overnight (sleep) RMSSD accuracy: MAE = **3–8 ms** (acceptable for trend monitoring)
- Wrist-worn PPG vs chest-strap ECG: mean bias of approximately +2.1 ms (slight overestimation)
- Movement artifact: nights with frequent position changes show 30–50% higher MAE
- **Conclusion:** Overnight wearable HRV is clinically acceptable for trend analysis, not clinical diagnosis

**Natale et al. (2021)** — Apple Watch sleep HRV vs PSG-derived HRV:
- Correlation coefficient: **r = 0.73** (p < 0.001)
- This is a "decent but not clinical grade" correlation — sufficient for personalized trend monitoring
- Inter-individual variation is high: some users show r > 0.85, others r < 0.60
- Skin tone and wrist fit are the strongest predictors of accuracy variance

### 2.2 Accuracy Summary Table

| Condition | MAE (ms) | Correlation with ECG | Practical Utility |
|-----------|---------|---------------------|------------------|
| Rest / sleep (no movement) | 3–8 ms | r = 0.73–0.82 | Good for trend monitoring |
| Light activity | 15–25 ms | r = 0.50–0.65 | Marginal |
| Moderate/vigorous activity | >25 ms | r < 0.50 | Not usable |

### 2.3 Accuracy-Degrading Factors

Signal quality is reduced by:

1. **Skin tone** — darker melanin absorbs more green light (PPG signal weaker); Apple has improved optical algorithms in recent models but variance remains
2. **Wrist tattoos** — ink absorbs/reflects light unpredictably; heavily tattooed wrists can show MAE > 20 ms even at rest
3. **Loose watch fit** — each millimeter of gap substantially increases motion artifact
4. **Cold ambient temperature** — peripheral vasoconstriction reduces blood volume in wrist vessels
5. **Body hair on wrist** — acts as optical diffuser, reducing signal amplitude

**ShiftWell handling:** Use HealthKit's built-in quality metadata where available. Exclude HRV samples flagged as low-confidence. During baseline establishment phase, flag users whose data shows high variance (possible accuracy issue) and suggest tightening watch fit.

### 2.4 Apple Watch Generation Differences

| Generation | Notable HRV Improvements |
|-----------|--------------------------|
| Series 4–5 | Introduced electrical heart sensor (ECG for AFib detection); PPG improved |
| Series 6+ | Added blood oxygen sensor; updated PPG optical array; improved motion correction algorithms |
| Series 9 / Ultra | Higher-resolution optical sensor; improved motion correction with new accelerometer |

**Practical note for ShiftWell:** Do not gate on Apple Watch generation — all Series 4+ should produce usable overnight HRV data. The accuracy improvements with newer hardware are meaningful but not categorical. The algorithm's personal-baseline approach compensates for systematic device biases.

---

## 3. Sleep Stage Detection Accuracy

### 3.1 Apple Watch vs Polysomnography

PSG (polysomnography) remains the gold standard with 95%+ overall accuracy using trained technician scoring. Apple Watch uses accelerometry + heart rate patterns to infer sleep stages (no EEG).

**Overall accuracy (watchOS 9+, Series 6+):**

| Sleep Stage | Apple Watch Sensitivity | Apple Watch Specificity | PSG Accuracy (reference) |
|------------|------------------------|------------------------|--------------------------|
| Wake | **91%** | 84% | 99% |
| REM | **68%** | 79% | 95% |
| N1 (light NREM) | 55% | 72% | 85% |
| N2 (light NREM) | 71% | 69% | 90% |
| N3 (deep/SWS) | **62%** | 85% | 96% |
| Overall | **78–82%** | — | **95%+** |

*Sources: Smith et al. 2023 (validation study, Series 7 vs PSG); Chinoy et al. 2021 (multi-wearable PSG comparison)*

**Comparison to older wearables:** Older consumer wearables (pre-watchOS 9) showed 65–70% overall accuracy. Apple's algorithm improvements represent genuine progress, though still substantially below PSG.

### 3.2 Clinical Implications for ShiftWell

The critical limitation is **N3 (deep sleep) detection at 62% sensitivity:**
- N3 is the most physiologically important sleep stage for recovery
- 38% of N3 epochs may be misclassified (most often as N2)
- This means Apple Watch may underestimate deep sleep by 20–35 minutes per night

**Algorithm consequence:** ShiftWell should NOT use Apple Watch sleep stage data as the primary input for sleep quality scoring. Sleep duration (total time asleep) from HealthKit is more reliable than stage-specific duration estimates.

**Where sleep stage data IS useful:**
- Detecting gross absence of deep sleep (Stage 3 = 0% vs normal ~15–20%) — this level of disruption would still show up
- Longitudinal trend monitoring over weeks/months — random errors cancel out over time
- Supplementary context for recovery score explanation ("you had lower-than-usual deep sleep last night")

---

## 4. Confidence Weight Recommendation

Given the accuracy limitations documented above:

### 4.1 Primary Recommendation

**Use Apple Watch HRV as a CONTRIBUTING signal, not the primary signal, in the ShiftWell recovery score.**

Justification:
- MAE of 3–8 ms at rest is clinically meaningful — this is not noise, it's signal
- The % deviation algorithm (personal baseline approach) is robust to systematic device biases
- 7-night rolling HRV trend is far more reliable than any single reading
- Accuracy is "good enough" for the evidence-based use case: detecting 15–30% deviations from personal baseline

### 4.2 Recommended Weight

| HRV Status | Weight in Recovery Score |
|-----------|--------------------------|
| Available + baseline established (14+ nights) | **25% of recovery score** |
| Available but baseline not yet established | **0% (calibrating)** |
| User has no Apple Watch | **0% (graceful fallback)** |
| Active circadian transition protocol | **0% (suspended)** |

Rationale for 25% weight:
- Bellenger et al. meta-analysis shows HRV adds meaningful predictive value beyond adherence/sleep duration alone
- Keeping HRV at ≤35% prevents over-weighting an imperfect sensor
- The other components (sleep adherence at 40%, sleep debt at 30%) are derived from calendar data and are more reliable inputs

### 4.3 Calibration Requirement

Require **14 nights of HRV data** before HRV contributes to the recovery score:

- 14 nights establishes a stable personal RMSSD/SDNN mean (reduces baseline estimation error by ~65% vs single-night estimate)
- 14 nights captures both work and rest day patterns
- During calibration, show user: "Calibrating HRV baseline (Day X/14)" in recovery score detail
- Post-calibration notification: "Your Apple Watch HRV is now improving your recovery score accuracy"

### 4.4 Transparency Tagging

Tag every recovery score with:
- `hrv_included: boolean` — did this score incorporate HRV?
- `hrv_suppressed_reason: "transition" | "calibrating" | "no_device" | null`
- `baseline_confidence: "low" | "medium" | "high"` (based on days of data available)

Users should be able to see why their score looks a certain way. Trust requires transparency.

---

## 5. Processing Recommendation: Batch vs Real-Time

### 5.1 Real-Time Processing

**Approach:** Query HRV from HealthKit continuously, update recovery score throughout the day.

**Assessment:**
- High battery impact on both iPhone and Apple Watch
- High noise — real-time HRV is dominated by movement artifacts and acute stressors
- HRV changes meaningfully over hours, not minutes — real-time updates would show unstable, anxious-making fluctuations
- Adds complexity to foreground/background lifecycle management

**Verdict: NOT RECOMMENDED.**

### 5.2 Nightly Batch Processing

**Approach:** After user wakes, query the last 6–8 hours of HRV samples from HealthKit. Average overnight SDNN. Compare to 30-day rolling mean. Apply to recovery score calculation.

**Assessment:**
- Low battery impact — one HealthKit query at app foreground
- High accuracy — overnight HRV is the cleanest measurement window
- Stable output — single daily HRV value integrates over 12+ sample points
- Fits naturally into ShiftWell's existing architecture (AppState foreground trigger already exists)
- Consistent with how WHOOP, Oura, and Garmin all handle overnight HRV — the industry standard

**Verdict: RECOMMENDED.**

### 5.3 Implementation Architecture

```
Trigger: AppState 'active' (user opens app in morning)
  ↓
HealthKit Query: HKQuantityTypeIdentifierHeartRateVariabilitySDNN
  Time range: lastSleepWindowStart → lastSleepWindowEnd
  ↓
Aggregate: Calculate mean SDNN from all samples in window
  ↓
Baseline Update: Add to rolling 30-day array (if not in transition period)
  ↓
HRV Score Calculation: % deviation from rolling mean → 0–100 score
  ↓
Recovery Score: Weighted sum incorporating hrv_score at 25%
  ↓
UI Update: Score card refreshes; transparency flags updated
```

Background delivery option: `HKObserverQuery` with `.immediate` frequency can pre-fetch HRV during the night (before user opens app). This reduces the latency of score display on first morning open. Recommend implementing as Phase 33 stretch goal.

---

## 6. Summary

### 6.1 What Apple Watch HRV Is

- A useful biometric signal for recovery trend monitoring
- Best used as a contributing factor (25% weight), not the sole recovery indicator
- Requires personal baseline normalization — population norms do not apply
- Most reliable when measured during sleep (overnight batch processing)

### 6.2 What Apple Watch HRV Is Not

- A medical device or clinical-grade measurement tool
- Sufficient for diagnosing sleep disorders or autonomic dysfunction
- Useful during physical activity (error too high)
- A substitute for subjective recovery input or sleep duration data

### 6.3 ShiftWell-Specific Constraints

| Factor | Apple Watch Accuracy | ShiftWell Handling |
|--------|---------------------|-------------------|
| Overnight sleep | MAE 3–8 ms (good) | Use for recovery score |
| Active movement | MAE 15–25 ms (poor) | Exclude; overnight only |
| Sleep stages | 78–82% overall; N3 62% | Duration only; no stage weighting |
| Shift worker baseline | Systematically lower | Personal baseline; not population norms |
| Circadian transition | HRV suppressed (normal) | Suspend HRV contribution during Phase 9 protocols |

---

*Document produced for Phase 32 HRV + Wearable Research. Links to: HRV-LITERATURE-REVIEW.md (science basis), BIOMETRIC-ALGORITHM-SPEC.md (implementation). Accuracy limitations documented here directly inform confidence weights in BIOMETRIC-ALGORITHM-SPEC.md.*
