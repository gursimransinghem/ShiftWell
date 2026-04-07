---
title: "Biometric Algorithm Spec: HRV Recovery Modifier"
date: 2026-04-07
project: ShiftWell
phase: 32 (HRV + Wearable Research)
domain: Algorithm design, HRV integration, recovery scoring, biometric processing
tags: [algorithm, HRV, SDNN, recovery-modifier, baseline, thresholds, biometrics]
confidence: HIGH (normalization approach), MEDIUM (threshold tuning — requires real user data)
---

# Biometric Algorithm Spec: HRV Recovery Modifier

**Purpose:** Define how HRV and other biometric data from Apple Watch modifies ShiftWell's existing recovery score. This spec extends the current adherence-based recovery calculator (recovery-calculator.ts) with biological signals.

**Design Principle:** HRV data MODIFIES the existing recovery score -- it does not replace it. The adherence-based score remains the foundation; biometrics provide a validation and adjustment layer.

---

## 1. Inputs

### 1.1 Primary Biometric Inputs (from HealthKit)

| Signal | HealthKit Type | Unit | Apple Watch Metric | Priority |
|--------|---------------|------|--------------------|----------|
| **Overnight HRV** | HKQuantityTypeIdentifierHeartRateVariabilitySDNN | ms | SDNN (not RMSSD) | Primary |
| **Resting Heart Rate** | HKQuantityTypeIdentifierRestingHeartRate | bpm | Lowest overnight HR | Primary |
| **Respiratory Rate** | HKQuantityTypeIdentifierRespiratoryRate | breaths/min | Overnight average | Secondary |
| **Sleep Duration** | HKCategoryTypeIdentifierSleepAnalysis | minutes | Total sleep time | Already used |
| **Sleep Stages** | HKCategoryTypeIdentifierSleepAnalysis (staged) | category | Core/Deep/REM/Awake | Secondary |

### 1.2 Existing Recovery Inputs (from recovery-calculator.ts)

| Signal | Source | Current Weight | Notes |
|--------|--------|---------------|-------|
| Plan adherence | score-store.ts | Primary | |actual_bedtime - planned_bedtime| |
| Sleep duration | User report / HealthKit | Secondary | Compared to planned duration |
| Sleep debt | adaptive/context-builder.ts | Modifier | 14-night rolling debt balance |

### 1.3 Data Quality Input

| Signal | Source | Purpose |
|--------|--------|---------|
| Data quality score | computeDataQuality() | Gate: only apply modifier when quality >= 0.6 |
| Watch worn flag | HealthKit sleep session presence | Gate: no biometric modifier without watch data |
| Baseline maturity | Nights of valid data collected | Gate: need 14+ nights before activating modifier |

---

## 2. Baseline Establishment

### 2.1 Initial Baseline (14-Night Calibration)

During the first 14 nights with valid Apple Watch data (quality >= 0.6), ShiftWell collects biometric data without modifying the recovery score. This is the calibration period.

```typescript
interface BiometricBaseline {
  // HRV baseline
  hrvMean60: number;          // 60-day rolling mean of nightly SDNN (ms)
  hrvStdDev60: number;        // 60-day rolling standard deviation
  hrvMean7: number;           // 7-day rolling mean (for trend comparison)
  hrvNightsCollected: number; // Total valid nights in baseline

  // RHR baseline
  rhrMean30: number;          // 30-day rolling mean of nightly minimum RHR (bpm)
  rhrStdDev30: number;        // 30-day rolling standard deviation

  // Respiratory rate baseline
  rrMean30: number;           // 30-day rolling mean (breaths/min)
  rrStdDev30: number;         // 30-day rolling standard deviation

  // Shift-type specific baselines
  nightShiftHrvMean: number;  // HRV baseline for post-night-shift sleep
  nightShiftHrvStdDev: number;
  dayOffHrvMean: number;      // HRV baseline for day-off sleep
  dayOffHrvStdDev: number;

  // Metadata
  baselineReady: boolean;     // true when hrvNightsCollected >= 14
  lastUpdated: Date;
  calibrationStartDate: Date;
}
```

### 2.2 Rolling Baseline Update

After the initial 14-night calibration:

```
Every night with valid data (quality >= 0.6):
  1. Add tonight's values to the rolling windows
  2. Recalculate 60-day HRV mean and SD (dropping values older than 60 days)
  3. Recalculate 30-day RHR mean and SD
  4. Recalculate 30-day RR mean and SD
  5. Recalculate 7-day HRV mean (for trend)
  6. Update shift-type-specific baselines based on sleep context
```

### 2.3 Shift-Type Baseline Separation

Shift workers have systematically different HRV during different sleep contexts. ShiftWell must maintain separate baselines:

```
Sleep context classification:
  - "night-shift-sleep": Daytime sleep following a night shift
  - "day-off-sleep": Nighttime sleep on a non-working day
  - "day-shift-sleep": Nighttime sleep following a day shift
  - "transition-sleep": First sleep after switching shift types

Recovery modifier uses the context-appropriate baseline:
  If tonight is post-night-shift → compare to nightShiftHrvMean
  If tonight is a day off → compare to dayOffHrvMean
  If context unknown → compare to overall hrvMean60
```

---

## 3. Recovery Modifier Calculation

### 3.1 Individual Signal Scores (Z-Score Normalization)

Each biometric signal is converted to a 0-100 score using z-score normalization against personal baseline:

```typescript
function signalToScore(
  tonightValue: number,
  baselineMean: number,
  baselineStdDev: number,
  isInverted: boolean = false  // true for RHR (lower is better)
): number {
  if (baselineStdDev === 0) return 50; // No variance yet

  let z = (tonightValue - baselineMean) / baselineStdDev;

  // For inverted signals (RHR), flip the z-score
  // Higher RHR = worse recovery, so invert
  if (isInverted) z = -z;

  // Map z-score to 0-100 scale
  // 50 = at your baseline
  // 65 = 1 SD above (good direction)
  // 35 = 1 SD below (bad direction)
  // 80 = 2 SD above
  // 20 = 2 SD below
  const score = 50 + (z * 15);

  return Math.max(0, Math.min(100, score));
}
```

### 3.2 Composite Biometric Score

Combine individual signal scores with evidence-based weights:

```typescript
function computeBiometricScore(
  hrvScore: number,      // SDNN z-score normalized
  rhrScore: number,      // RHR z-score normalized (inverted)
  rrScore: number | null, // Respiratory rate z-score (inverted), null if unavailable
  sleepScore: number     // Sleep architecture score (from existing calculator)
): number {

  if (rrScore !== null) {
    // Full biometric score (all signals available)
    return (
      hrvScore   * 0.40 +    // HRV is dominant recovery signal
      rhrScore   * 0.25 +    // RHR is second most important
      sleepScore * 0.25 +    // Sleep quality composite
      rrScore    * 0.10      // Respiratory rate (illness flag)
    );
  } else {
    // Partial biometric score (no respiratory rate)
    return (
      hrvScore   * 0.45 +
      rhrScore   * 0.30 +
      sleepScore * 0.25
    );
  }
}
```

**Weight Rationale:**
- HRV (40%): Dominant recovery signal per research consensus (Shaffer & Ginsberg 2017, WHOOP methodology, Altini)
- RHR (25%): Second most important; consistent directional signal (PMC research)
- Sleep (25%): Composite of efficiency, duration, architecture (already computed)
- Respiratory Rate (10%): Stable signal; primary value as illness/stress corroborator

### 3.3 Recovery Modifier (How Biometrics Adjust the Existing Score)

The biometric score does NOT replace the adherence-based recovery score. It modifies it:

```typescript
function applyBiometricModifier(
  adherenceScore: number,   // Existing recovery score (0-100)
  biometricScore: number,   // Computed above (0-100)
  dataQuality: number,      // 0.0-1.0
  baselineReady: boolean    // Has 14+ nights of valid data
): number {

  // Gate: No modification if baseline not established
  if (!baselineReady) return adherenceScore;

  // Gate: No modification if data quality too low
  if (dataQuality < 0.6) return adherenceScore;

  // Modifier weight scales with data quality
  // At quality 1.0: biometric modifier has 30% influence
  // At quality 0.6: biometric modifier has 18% influence
  const modifierWeight = 0.30 * dataQuality;
  const adherenceWeight = 1.0 - modifierWeight;

  const modifiedScore = (
    adherenceScore * adherenceWeight +
    biometricScore * modifierWeight
  );

  return Math.round(Math.max(0, Math.min(100, modifiedScore)));
}
```

**Design Decisions:**

1. **30% maximum influence:** Biometrics can move the score by at most 30%. The adherence-based score (what the user actually DID) always dominates. This prevents a good HRV reading from masking poor sleep behavior.

2. **Quality-weighted influence:** Lower data quality reduces biometric influence proportionally. A marginal-quality reading (0.6) has only 18% influence.

3. **Gradual introduction:** Users see the biometric modifier take effect after 14 nights, not abruptly. This builds trust and avoids confusing score changes.

---

## 4. Threshold Definitions

### 4.1 HRV Recovery Thresholds

| HRV Status | Z-Score Range | Score Range | Meaning | User Message |
|------------|---------------|-------------|---------|-------------|
| **Optimal** | > +1.0 SD | 65-100 | Above personal baseline | "Your body is well-recovered" |
| **Normal** | -0.5 to +1.0 SD | 42-65 | Within baseline range | "Recovery is on track" |
| **Below baseline** | -1.0 to -0.5 SD | 35-42 | Slightly below baseline | "Recovery is lower than usual" |
| **Significantly low** | -1.5 to -1.0 SD | 27-35 | Well below baseline | "Your body needs more recovery time" |
| **Very low** | < -1.5 SD | 0-27 | Far below baseline | "Prioritize rest today" |

### 4.2 RHR Recovery Thresholds

| RHR Status | Delta from Baseline | Meaning |
|------------|-------------------|---------|
| **Normal** | Within +/- 3 bpm | Expected range |
| **Elevated** | +3 to +5 bpm | Mild stress/incomplete recovery |
| **Significantly elevated** | > +5 bpm | Stress, illness, or alcohol effect |
| **Trending down** | -3+ bpm below 30-day avg | Fitness adaptation (positive) |

### 4.3 Illness Detection Pattern

When multiple signals converge, flag potential illness:

```typescript
function detectIllnessPattern(
  hrvZScore: number,
  rhrDelta: number,    // bpm above 30-day baseline
  rrDelta: number,     // breaths/min above 30-day baseline
  tempDelta: number | null  // degrees above baseline (if available)
): 'none' | 'possible' | 'likely' {

  const signals = [
    hrvZScore < -1.0,          // HRV significantly below baseline
    rhrDelta > 5,              // RHR elevated 5+ bpm
    rrDelta > 2,               // Respiratory rate elevated 2+ breaths/min
    tempDelta !== null && tempDelta > 0.5  // Temperature elevated (if available)
  ];

  const positiveSignals = signals.filter(Boolean).length;

  if (positiveSignals >= 3) return 'likely';
  if (positiveSignals >= 2) return 'possible';
  return 'none';
}
```

**User-facing messages for illness detection:**
- "possible": "Multiple recovery signals are below baseline. Monitor how you feel and consider extra rest."
- "likely": "Your recovery signals suggest your body may be fighting something. Prioritize rest and hydration."

**Never use diagnostic language.** ShiftWell is not a medical device.

---

## 5. Integration with Existing Recovery Calculator

### 5.1 Current Recovery Calculator Flow (recovery-calculator.ts)

```
Current: Plan adherence → adherence score → recovery score display
```

### 5.2 Modified Flow with Biometric Modifier

```
New:
  Plan adherence → adherence score ─────────────┐
                                                  ├─→ applyBiometricModifier() → final recovery score
  HealthKit data → biometric baseline check ──┐ │
                   ├→ signal z-scores ───────┤ │
                   ├→ composite biometric score─┘
                   └→ data quality score ──────┘
```

### 5.3 Code Integration Points

| File | Change | Description |
|------|--------|-------------|
| `src/lib/adherence/adherence-calculator.ts` | Export adherence score separately | Allow biometric modifier to access raw adherence score |
| `src/lib/biometric/biometric-baseline.ts` | **New file** | Baseline management: rolling means, SD, shift-type separation |
| `src/lib/biometric/biometric-scorer.ts` | **New file** | Z-score normalization, composite score, modifier application |
| `src/lib/biometric/illness-detector.ts` | **New file** | Multi-signal convergence detection |
| `src/lib/biometric/data-quality.ts` | **New file** | Data quality scoring for nightly readings |
| `src/store/score-store.ts` | Add biometric modifier | Call applyBiometricModifier after adherence score |
| `src/lib/adaptive/context-builder.ts` | Add biometric context | Feed biometric scores to Adaptive Brain |
| `src/hooks/useRecoveryScore.ts` | Display biometric modifier | Show whether score includes biometric data |

---

## 6. Edge Cases and Safety

### 6.1 Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Watch not worn | Score = adherence-only (no modifier). Display "No watch data for last night." |
| Watch worn < 4 hours | Data quality < 0.6. No modifier applied. |
| First 14 nights (calibration) | No modifier. Display "Calibrating biometrics (X/14 nights)." |
| Baseline too short (< 14 nights of valid data in 60-day window) | Reset baseline. Revert to adherence-only scoring. |
| User starts beta-blockers | Onboarding flag for medications affecting HR/HRV. Exclude HRV from modifier (use RHR + sleep only). |
| Arrhythmia detected | Apple Watch irregular rhythm notification. Exclude HRV entirely. |
| Circadian transition night | Use transition-specific baseline if available; otherwise use overall baseline with reduced modifier weight (15% instead of 30%). |
| Alcohol consumption | Not detectable directly. The elevated RHR and reduced HRV are valid recovery signals (alcohol genuinely impairs recovery). No special handling needed. |

### 6.2 Safety Guardrails

1. **No medical claims:** Never say "your heart is healthy/unhealthy." Say "your recovery signals are above/below your baseline."
2. **No diagnosis:** Illness detection pattern says "your body may be fighting something," never "you are sick."
3. **Encourage medical consultation:** If illness pattern persists 3+ days, suggest "Consider talking to your doctor."
4. **Score bounds:** Recovery score always 0-100. Biometric modifier cannot push score below 0 or above 100.
5. **User control:** User can disable biometric modifier in Settings and revert to adherence-only scoring.

---

## 7. Validation Metrics

### 7.1 How to Know the Modifier is Working

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Biometric score correlation with self-reported fatigue | r > 0.3 | Compare daily biometric score with optional morning fatigue rating (1-5) |
| Score stability | Day-to-day variance < 15 points | Track rolling variance of modified score |
| Modifier direction accuracy | > 70% correct direction | Does the modifier move the score in the direction the user reports feeling? |
| Illness detection precision | > 50% true positives | When illness pattern triggers, does the user subsequently report illness? |
| Data quality gate effectiveness | < 5% false accepts | How often does low-quality data produce a modifier that meaningfully changes the score? |

### 7.2 A/B Testing Plan

Before full rollout, test with a subset of users:
- **Control:** Adherence-only recovery score (current system)
- **Treatment:** Biometric-modified recovery score
- **Metric:** Self-reported trust in recovery score accuracy (1-5 scale)
- **Duration:** 30 days
- **Minimum N:** 50 users per group (if available)

---

## 8. Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Z-score normalization approach | HIGH | Validated by Altini, WHOOP, Kubios, academic literature |
| Weight distribution (40/25/25/10) | MEDIUM | Based on research consensus; exact weights need tuning with real data |
| 30% modifier ceiling | MEDIUM | Design decision; may need adjustment based on user feedback |
| 14-night calibration period | HIGH | Industry standard (Oura: 14-day, WHOOP: similar) |
| Shift-type baseline separation | MEDIUM | Research supports direction; no published correction factors |
| Illness detection thresholds | MEDIUM | Based on clinical thresholds; requires real-world validation |
| Integration architecture | HIGH | Aligns with existing Adaptive Brain pattern |

---

*Assembled for ShiftWell Phase 32 -- 2026-04-07*
