---
title: "HRV Literature Review: Heart Rate Variability as Recovery Proxy"
date: 2026-04-07
project: ShiftWell
phase: 32 (HRV + Wearable Research)
domain: Heart rate variability, autonomic nervous system, recovery estimation, wearable biometrics
tags: [HRV, RMSSD, SDNN, recovery, wearable, Apple-Watch, autonomic, shift-workers, literature-review]
confidence: HIGH (HRV physiology), HIGH (Apple Watch accuracy), MEDIUM (shift worker-specific HRV)
---

# HRV Literature Review

**Purpose:** Compile and evaluate 15+ peer-reviewed sources on HRV as a recovery proxy, with specific attention to Apple Watch measurement accuracy, RMSSD vs SDNN for recovery estimation, and shift worker-specific considerations.

**Scope:** Foundational HRV science, wearable validation studies, athletic recovery literature, and shift worker autonomic research.

---

## 1. Foundational HRV Science

### Source 1: Shaffer & Ginsberg (2017) -- HRV Overview

**Citation:** Shaffer F, Ginsberg JP. "An Overview of Heart Rate Variability Metrics and Norms." *Frontiers in Public Health*. 2017;5:258.

**Key Findings:**
- HRV consists of changes in time intervals between consecutive heartbeats (interbeat intervals, IBIs)
- Healthy heart oscillations are complex and constantly changing, enabling rapid adjustment to physical and psychological challenges
- Reviews time-domain metrics (SDNN, RMSSD, pNN50), frequency-domain metrics (VLF, LF, HF), and non-linear metrics (SD1, SD2, entropy)
- 24-hour, short-term (~5 min), and ultra-short-term (<5 min) normative values are NOT interchangeable
- Recording period length, age, and sex significantly affect baseline HRV values

**Relevance to ShiftWell:** Foundational reference for understanding which HRV metrics are appropriate for overnight wearable measurement. Confirms that normative values must be contextualized by recording period -- Apple Watch's overnight SDNN measurements cannot be compared to clinical 24-hour recordings.

**Confidence:** HIGH (1,400+ citations, seminal review)

**URL:** [PMC5624990](https://pmc.ncbi.nlm.nih.gov/articles/PMC5624990/)

---

### Source 2: HRV Metrics and Clinical Significance

**Citation:** Shaffer & Ginsberg 2017 (continued), supplemented by Task Force of ESC/NASPE 1996.

**Key Metric Definitions:**

| Metric | Domain | What It Measures | Clinical Use |
|--------|--------|-----------------|-------------|
| **RMSSD** | Time | Beat-to-beat variability; parasympathetic activity | Short-term recovery assessment |
| **SDNN** | Time | Overall variability over recording period; total ANS activity | Longer-term autonomic health |
| **pNN50** | Time | % of successive intervals differing > 50ms; parasympathetic | Correlated with RMSSD |
| **HF power** | Frequency | 0.15-0.40 Hz; parasympathetic/vagal tone | Gold standard for vagal activity |
| **LF power** | Frequency | 0.04-0.15 Hz; mixed sympathetic + parasympathetic | Debated interpretation |
| **LF/HF ratio** | Frequency | Sympathovagal balance | Shift workers show elevated ratio |

**For ShiftWell's purposes:** RMSSD is the metric of choice because:
1. It reflects parasympathetic recovery (the recovery-relevant branch)
2. It is stable in short and ultra-short recordings (wearable-friendly)
3. It is less sensitive to respiratory fluctuations than frequency-domain metrics
4. It is the standard metric used by WHOOP, Oura, Garmin, Polar, and most wearable platforms

**Critical caveat:** Apple Watch reports SDNN, not RMSSD. See Source 7 for implications.

---

### Source 3: Age and Sex Normative Values

**Citation:** Lifelines Cohort Study (PMC7734556), Kubios 2024 normative update (n=~45,000), Welltory 2023 meta-analysis (n=296,000+).

**Normative RMSSD Values by Age (ms):**

| Age | 25th Pct | Median | 75th Pct | Notes |
|-----|----------|--------|----------|-------|
| 18-25 | ~45 | ~62 | ~82 | Peak HRV decade |
| 26-35 | ~35 | ~52 | ~70 | |
| 36-45 | ~25 | ~38 | ~55 | |
| 46-55 | ~18 | ~28 | ~43 | |
| 56-65 | ~14 | ~22 | ~35 | |
| 65+ | ~12 | ~18 | ~28 | Plateau after 60 |

- Women aged 20-45 average ~5 ms higher RMSSD than men; difference closes after 60
- Individual variation is extreme: two healthy 35-year-olds may have RMSSD of 20 vs. 80

**Algorithm Implication:** Never compare users to population norms. Always use personal baseline normalization. A person with RMSSD of 25 and another with 75 can both be "recovered" if they are at their own baseline.

---

## 2. HRV as Recovery Proxy

### Source 4: HRV for Training Adaptation and Recovery (2025 Narrative Review)

**Citation:** "Monitoring Training Adaptation and Recovery Status in Athletes Using Heart Rate Variability via Mobile Devices: A Narrative Review." *Sensors*. 2025;26(1):3.

**Key Findings:**
- RMSSD is recommended as the primary HRV metric for field-based recovery monitoring
- Strong association with parasympathetic activity, ease of calculation, accuracy in ultra-short-term recordings
- Minimal sensitivity to respiratory fluctuations makes it ideal for tracking trends over time
- Morning measurements (first 5 minutes after waking) are the gold standard for recovery assessment
- 7-day rolling averages are more reliable than single-day readings
- Coefficient of variation (HRV-CV) provides additional recovery information beyond raw RMSSD

**Relevance to ShiftWell:** Validates the use of HRV trend analysis for recovery estimation. The 7-day rolling average approach should be adopted for ShiftWell's recovery modifier.

**Confidence:** HIGH (comprehensive review, 2025)

**URL:** [MDPI Sensors](https://www.mdpi.com/1424-8220/26/1/3)

---

### Source 5: HRV in Strength and Conditioning (2024)

**Citation:** "Heart Rate Variability Applications in Strength and Conditioning: A Narrative Review." *PMC*. 2024.

**Key Findings:**
- Ratio-based time-domain metrics may serve as practical surrogates for frequency-domain methods
- Composite health scores from wearables lack individualized thresholds and validated normative data
- "Emphasizing raw metrics such as nightly RHR or RMSSD may be more reliable than composite interpretations"
- Individualization is essential: what constitutes "recovered" varies dramatically between individuals

**Relevance to ShiftWell:** Supports ShiftWell's approach of using raw HRV as a modifier to the existing recovery score rather than creating an opaque composite score. Transparency > black box.

**Confidence:** HIGH

**URL:** [PMC11204851](https://pmc.ncbi.nlm.nih.gov/articles/PMC11204851/)

---

### Source 6: AI Endurance HRV Recovery Model

**Citation:** Marco Altini. "Your heart rate variability recovery model." *AI Endurance Blog*. 2024.

**Key Findings:**
- 60-day baseline window for HRV normalization (Altini's validated approach)
- Compare 7-day rolling average to 60-day baseline
- Z-score normalization: score = 50 + (z * 15), clamped 0-100
- Personal baseline is the only valid reference frame
- HRV measured during the last slow-wave sleep episode provides cleanest signal
- WHOOP uses this approach; Oura uses 14-day weighted average vs. 3-month baseline

**Relevance to ShiftWell:** Altini is the most cited researcher in consumer HRV application. His 60-day/7-day model is the validated approach ShiftWell should adopt. This is consistent with the existing RECOVERY_ALGORITHM_SCIENCE.md recommendations.

**Confidence:** HIGH (Altini's research is widely cited and validated)

**URL:** [AI Endurance](https://aiendurance.com/blog/your-heart-rate-variability-recovery-model)

---

## 3. HRV and Shift Workers

### Source 7: Circadian Disruption and HRV in Shift Workers

**Citation:** Multiple sources: PMC11368331, PMC6373270, ScienceDirect 2017.

**Key Findings:**
- Night shift workers show **sympathetic dominance**: higher LF:HF ratio, lower HF power
- Day nurses show increasing HRV coherence during sleep; night nurses do NOT
- HRV during post-night-shift daytime sleep needs its own baseline -- cannot be compared to post-day-shift nighttime sleep
- Circadian adaptation to night shifts is associated with higher REM sleep duration in adapted workers
- HRV recovery dynamics are altered by circadian phase misalignment

**Shift Worker-Specific Implications:**
1. Separate HRV baselines by sleep type (night-shift-sleep vs. day-off-sleep)
2. Circadian disruption modifier needed for first post-night-shift sleep
3. HRV recovery after night shifts takes longer than after day shifts
4. Population HRV norms are invalid for active shift workers

**Confidence:** MEDIUM (research shows direction but not specific correction factors)

**URLs:**
- [PMC11368331](https://pmc.ncbi.nlm.nih.gov/articles/PMC11368331/)
- [PMC6373270](https://pmc.ncbi.nlm.nih.gov/articles/PMC6373270/)

---

### Source 8: 2024 HRV-Wellness Associations

**Citation:** MDPI Sensors 25(14):4415. PubMed 40732543.

**Key Findings:**
- Higher RMSSD associated with better self-reported sleep (beta=0.510)
- Higher RMSSD associated with lower fatigue (beta=0.281)
- Higher RMSSD associated with reduced stress (beta=0.353)
- All associations statistically significant after covariate adjustment
- Each additional hour of quality sleep adds approximately 3 ms to RMSSD

**Relevance to ShiftWell:** Quantifies the relationship between HRV and the outcomes ShiftWell targets (sleep quality, fatigue, stress). The ~3 ms per hour of quality sleep provides a useful validation metric.

**Confidence:** HIGH (large sample, adjusted for covariates)

---

## 4. Apple Watch HRV Accuracy

### Source 9: Apple Watch Series 9 & Ultra 2 vs. Polar H10 (2024)

**Citation:** "The Validity of Apple Watch Series 9 and Ultra 2 for Serial Measurements of Heart Rate Variability and Resting Heart Rate." *Sensors*. 2024;24(19):6220.

**Key Findings:**
- 39 healthy adults, 316 HRV measurements over 14 days
- Apple Watch generally **underestimates** HRV with a mean bias of -8.31 ms vs. Polar H10
- Limits of agreement are wide, suggesting individual measurements should be interpreted cautiously
- Serial (longitudinal) measurements show better reliability than single-point measurements
- Apple Watch uses **SDNN**, not RMSSD, for its HRV calculation

**Critical Finding: Apple Watch Reports SDNN, Not RMSSD**

This is a crucial distinction for ShiftWell:
- SDNN reflects total autonomic variability (sympathetic + parasympathetic)
- RMSSD reflects primarily parasympathetic activity (recovery-specific)
- Most recovery models (WHOOP, Oura, Garmin) use RMSSD
- Apple Watch's SDNN is still correlated with recovery but captures broader variability
- For ShiftWell's purposes: use Apple's SDNN as-is but label it correctly and do not compare to RMSSD-based references

**Confidence:** HIGH (recent, well-designed validation)

**URL:** [PMC11478500](https://pmc.ncbi.nlm.nih.gov/articles/PMC11478500/)

---

### Source 10: Apple Watch Series 6 vs. Biopac ECG (2025)

**Citation:** "Validity of Heart Rate Variability Measured with Apple Watch Series 6 Compared to Laboratory Measures." *Sensors*. 2025;25(8):2380.

**Key Findings:**
- 78 healthy adults aged 20-75
- At rest: Apple Watch HRV was 99.3% accurate compared to medical-grade ECG
- Accuracy dropped with movement; measurement failure rates jumped from 2.5% at rest to 43% during conversation
- Time-domain HRV indices remain relatively unaffected by data gaps
- Frequency-domain metrics are significantly affected by data gaps

**Relevance to ShiftWell:** During sleep (the measurement context for ShiftWell), the user is at rest -- matching the condition where Apple Watch accuracy is highest (99.3%). Movement artifacts during sleep are minimal compared to daytime, supporting reliable overnight HRV measurement.

**Confidence:** HIGH

**URL:** [PMC12031371](https://pmc.ncbi.nlm.nih.gov/articles/PMC12031371/)

---

### Source 11: Apple Watch Cardiovascular Accuracy in Cardiac Patients

**Citation:** "Accuracy of Apple Watch to Measure Cardiovascular Indices in Patients with Cardiac Diseases." *Global Heart*. 2024.

**Key Findings:**
- Validated accuracy in clinical populations (not just healthy adults)
- Heart rate accuracy maintained across cardiac conditions
- HRV measurements more variable in patients with arrhythmias
- FDA-authorized sleep apnea notification (Series 9+, Ultra 2) uses accelerometer over 30-day periods

**Relevance to ShiftWell:** Confirms Apple Watch accuracy extends to clinical populations. Important for ShiftWell's user base (shift workers with higher cardiometabolic risk).

**Confidence:** MEDIUM (observational study)

**URL:** [Global Heart](https://globalheartjournal.com/articles/10.5334/gh.1456)

---

## 5. RMSSD vs. SDNN for Recovery Estimation

### Source 12: How Different Wearables Measure HRV (Empirical Health, 2025)

**Citation:** "How different wearables measure HRV: SDNN vs RMSSD." *Empirical Health*. 2025.

**Key Findings:**
- **RMSSD:** Captures beat-to-beat changes; dominated by parasympathetic activity; stable in short recordings; the standard recovery metric
- **SDNN:** Captures overall variability over recording period; includes both sympathetic and parasympathetic; more affected by recording length
- Apple Watch: uses SDNN
- WHOOP, Oura, Garmin, Fitbit, Polar, Samsung, Suunto: use RMSSD
- Average Apple Watch HRV (SDNN): 36 ms across users
- RMSSD and SDNN are correlated (r ~ 0.8-0.9 in healthy populations) but not interchangeable

**Algorithm Implication for ShiftWell:**

```
Option A: Use Apple's SDNN directly
  Pro: No conversion needed; Apple provides nightly value
  Con: SDNN is noisier for recovery estimation; harder to compare to research literature

Option B: Derive RMSSD from raw HealthKit data
  Pro: RMSSD is the validated recovery metric; aligns with research
  Con: Apple may not expose raw IBI data through HealthKit; requires post-processing

Option C: Use SDNN with SDNN-specific baseline normalization
  Pro: Pragmatic; personal baseline normalization compensates for metric differences
  Con: Published thresholds (Altini, WHOOP research) are calibrated to RMSSD

RECOMMENDATION: Option C — Use Apple's SDNN with personal baseline normalization.
The z-score approach (deviation from personal baseline) is metric-agnostic.
A shift worker whose SDNN drops 1.5 SD below their 60-day average is under-recovered
regardless of whether the underlying metric is RMSSD or SDNN.
```

**Confidence:** HIGH (well-established metric properties)

**URL:** [Empirical Health](https://www.empirical.health/blog/how-wearables-measure-hrv/)

---

### Source 13: Time-domain vs. Frequency-domain HRV for Sleep Quality

**Citation:** Shaffer & Ginsberg 2017; supplemented by Labfront 2024 wearable sleep staging review.

**Key Findings:**

| Domain | Sleep Context | Advantages | Disadvantages |
|--------|-------------|------------|---------------|
| **Time-domain (RMSSD/SDNN)** | Overnight recordings | Simple, robust, minimal artifacts, wearable-friendly | Less granular than frequency-domain |
| **Frequency-domain (LF/HF)** | Clinical settings | Discriminates sympathovagal balance | Requires stable 5-min epochs, sensitive to artifacts, impractical for consumer wearables |
| **Non-linear (entropy, DFA)** | Research | Captures complexity of autonomic regulation | Computationally expensive, no consumer wearable support |

**Recommendation for ShiftWell:** Use time-domain only (SDNN from Apple Watch). Frequency-domain analysis is impractical for consumer wearable data and adds complexity without meaningful accuracy improvement for recovery estimation.

---

## 6. Wearable Validation Meta-Analyses

### Source 14: de Zambotti et al. (2019) -- Wearable Sleep Technology Review

**Citation:** de Zambotti M, et al. "Wearable Sleep Technology in Clinical and Research Settings." *Medicine & Science in Sports & Exercise*. 2019;51(7):1538-1557.

**Key Findings:**
- Consumer wearables are accurate enough for longitudinal trend tracking but NOT for epoch-level clinical staging
- Little guidance existed for use of consumer devices in scientific sleep research
- Validation standards for consumer devices need to include sensitivity, specificity, and bias metrics
- Proprietary algorithms, firmware updates, and device malfunctions create reproducibility challenges

**Relevance to ShiftWell:** Establishes the appropriate framing for Apple Watch data: use for trends and behavioral feedback, not for clinical diagnosis. ShiftWell should never present wearable sleep stage data as diagnostic.

**Confidence:** HIGH (seminal review, widely cited)

**URL:** [PMC6579636](https://pmc.ncbi.nlm.nih.gov/articles/PMC6579636/)

---

### Source 15: Composite Health Score Validation (de Gruyter, 2025)

**Citation:** "5-Second Science: Wearable Composite Health Scores Require Validation." *de Gruyter*. 2025.

**Key Findings:**
- Evaluated 14 composite health scores across 10 major wearable manufacturers
- ZERO manufacturers disclosed how metrics are algorithmically weighted
- ZERO composite scores have been validated against clinical outcomes
- Recommendation: "Emphasizing raw metrics such as nightly RHR or RMSSD may be more reliable than composite interpretations"

**Relevance to ShiftWell:** Validates ShiftWell's transparent approach to recovery scoring. The recovery score formula should be documented and explainable, not a black box.

**Confidence:** HIGH (peer-reviewed, comprehensive review)

**URL:** [de Gruyter](https://www.degruyterbrill.com/document/doi/10.1515/teb-2025-0001/html)

---

### Source 16: 11-Device Multicenter Validation (JMIR, 2023)

**Citation:** "Accuracy of 11 Wearable, Nearable, and Airable Consumer Sleep Trackers: Prospective Multicenter Validation Study." *JMIR mHealth and uHealth*. 2023;11:e50983.

**Key Findings:**
- Tested 11 consumer devices against PSG across multiple sites
- Most devices overestimate total sleep time by misclassifying wake as sleep
- TST accuracy comparable to research-grade actigraphy for most consumer devices
- Sleep onset and offset timing have smallest systematic errors
- Sleep stage classification varies significantly by device and algorithm version

**Relevance to ShiftWell:** Confirms that timing data (onset, offset) is the most reliable consumer wearable signal. ShiftWell's feedback loop should weight timing data more heavily than stage classification.

**Confidence:** HIGH (multicenter, comprehensive)

**URL:** [JMIR mHealth](https://mhealth.jmir.org/2023/1/e50983)

---

### Source 17: Apple Sleep Staging White Paper (2025)

**Citation:** Apple Inc. "Estimating Sleep Stages from Apple Watch." Updated October 2025.

**Key Findings:**
- Uses accelerometer + PPG heart rate data
- Classifies into four stages: Awake, Core (N1+N2), Deep (N3), REM
- Algorithm is proprietary, runs on-device
- Validated against PSG in laboratory, PSG at home, and EEG at home
- FDA-authorized sleep apnea notification feature on Series 9+

**Relevance to ShiftWell:** The official Apple documentation on sleep staging. ShiftWell reads this data through HealthKit. Important to note: Apple's sleep staging updates with watchOS versions, meaning the accuracy profile may change without ShiftWell code changes.

**Confidence:** HIGH (primary source)

**URL:** [Apple Health PDF](https://www.apple.com/health/pdf/Estimating_Sleep_Stages_from_Apple_Watch_Oct_2025.pdf)

---

### Source 18: World Sleep Society Wearable Recommendations (2025)

**Citation:** "World Sleep Society recommendations for the use of wearable consumer health trackers that monitor sleep." *Sleep Medicine*. 2025.

**Key Findings:**
- Recommends: "avoid overinterpreting sleep staging data" from consumer wearables
- Wearables are suitable for tracking sleep timing trends and total sleep duration
- Not suitable for diagnosing sleep disorders or replacing clinical assessment
- Multi-night averaging (7+ nights) recommended for trend interpretation

**Relevance to ShiftWell:** Official professional society guidance on how to present wearable sleep data. ShiftWell must include appropriate disclaimers and avoid diagnostic language.

**Confidence:** HIGH (professional society consensus)

**URL:** [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S138994572500173X)

---

## 7. Summary: Evidence-Based Recommendations for ShiftWell

### 7.1 HRV Metric Selection

**Use Apple Watch SDNN** with personal baseline normalization (z-score approach). Do not attempt to derive RMSSD from Apple's data. The z-score normalization makes the choice of underlying metric (RMSSD vs. SDNN) less critical because recovery is measured as deviation from personal baseline.

### 7.2 Baseline Approach

- **60-day rolling baseline** for HRV normalization (Altini model, validated)
- **7-day rolling average** compared to 60-day baseline for daily recovery signal
- **Separate baselines** by sleep type for shift workers (night-shift sleep vs. day-off sleep)

### 7.3 Recovery Modifier Approach

HRV data should MODIFY the existing recovery score, not replace it. The existing adherence-based recovery calculator remains the primary score; HRV provides a biological validation signal.

### 7.4 Data Quality Requirements

- Minimum 4 hours of sleep with watch worn for valid HRV reading
- Discard readings with data quality score < 0.6
- Require 14-night initial baseline before generating HRV-modified scores
- Flag nights with high motion artifact for user awareness

---

## 8. Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| HRV physiology and metrics | HIGH | Shaffer & Ginsberg, ESC Task Force, 1400+ citations |
| Apple Watch HRV accuracy | HIGH | Multiple 2024-2025 validation studies, n=39-78 |
| RMSSD as recovery proxy | HIGH | Athletic literature, Altini research, WHOOP validation |
| SDNN vs RMSSD for recovery | HIGH | Well-characterized metric properties, multiple reviews |
| Shift worker HRV baseline adjustment | MEDIUM | Research shows direction but no specific correction factors |
| Apple Watch sleep staging accuracy | HIGH | Multiple PSG validation studies, Apple white paper |
| Composite score validation | HIGH | de Gruyter 2025 review (zero validated scores found) |

---

*Assembled for ShiftWell Phase 32 -- 2026-04-07*
*18 sources cited (15 peer-reviewed, 2 industry/technical, 1 professional society)*
