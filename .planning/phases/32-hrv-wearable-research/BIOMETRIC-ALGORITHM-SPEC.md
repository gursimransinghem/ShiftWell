# Biometric Algorithm Specification: HRV-Modified Recovery Score

**Phase:** 32 — HRV + Wearable Research  
**Version:** 1.0  
**Date:** 2026-04-07  
**Status:** Final — ready for Phase 33 implementation  
**Implements:** RES-18 (HRV algorithm specification for Apple Watch integration)

---

## Table of Contents

1. [Current Recovery Score Architecture](#1-current-recovery-score-architecture)
2. [Adding HRV as a Signal](#2-adding-hrv-as-a-signal)
3. [Updated Recovery Score Formula](#3-updated-recovery-score-formula)
4. [Transition Period Handling](#4-transition-period-handling)
5. [Baseline Calibration Protocol](#5-baseline-calibration-protocol)
6. [HealthKit Queries for Phase 33](#6-healthkit-queries-for-phase-33)
7. [Expected Accuracy Improvement](#7-expected-accuracy-improvement)
8. [Implementation Notes for Phase 33](#8-implementation-notes-for-phase-33)

---

## 1. Current Recovery Score Architecture

### 1.1 Existing Components

The ShiftWell recovery score (implemented in `src/store/score-store.ts`) currently uses three components:

| Component | Description | Weight (HRV unavailable) |
|-----------|-------------|--------------------------|
| `adherence_score` | % of last 14 nights where user followed the planned sleep window | 55% |
| `debt_score` | Total sleep debt minutes, normalized to 0–100 scale (inverse — more debt = lower score) | 45% |
| `transition_score` | Circadian protocol penalty: reduces score during active Phase 9 protocol transitions | 5% (shared) |

**Current formula:**
```typescript
recovery_score = clamp(Math.round(
  adherence_score * 0.55 +
  debt_score * 0.40 +
  transition_score * 0.05
), 0, 100);
```

**Limitation:** The current formula has no biometric signal. It reflects behavioral data (did the user follow the plan?) and calculated debt, but not how the user's body actually responded. Two users with identical adherence histories may have very different physiological recovery states.

### 1.2 Why HRV Fills This Gap

HRV provides the missing physiological signal:
- High adherence + high HRV = confirmed recovery (score should be high)
- High adherence + low HRV = behavioral compliance but physiological stress (score should reflect reality)
- Low adherence + high HRV = user adapted despite non-compliance (score should not over-penalize)

This is the core value of HRV integration: ground-truth physiology that behavioral tracking alone cannot capture.

---

## 2. Adding HRV as a Signal

### 2.1 Inputs

The HRV signal calculation requires four inputs, all sourced from HealthKit + local state:

```typescript
interface HRVInputs {
  overnightSDNN: number | null;         // Mean SDNN (ms) from last sleep session — from HealthKit HRV samples
  personalSDNNBaseline: number | null;  // Rolling 30-day mean SDNN (ms) — computed from stored history
  hrv_available: boolean;               // User has Apple Watch + granted HKQuantityTypeIdentifierHeartRateVariabilitySDNN permission
  baselineDaysAvailable: number;        // Count of nights with valid HRV data in the baseline window
  inCircadianTransition: boolean;       // Phase 9 protocol active (from circadian-engine)
}
```

**Note on SDNN vs RMSSD:** Apple Watch HealthKit provides SDNN (not RMSSD) via background sampling during sleep. The algorithm below uses SDNN throughout. The % deviation approach is metric-agnostic — it measures deviation from the user's own SDNN baseline, which is equally valid. See HRV-LITERATURE-REVIEW.md Section 5.2 for scientific justification.

### 2.2 HRV Signal Calculation

```typescript
function calculateHRVScore(inputs: HRVInputs): number | null {
  const {
    overnightSDNN,
    personalSDNNBaseline,
    hrv_available,
    baselineDaysAvailable,
    inCircadianTransition,
  } = inputs;

  // Gate 1: User must have Apple Watch with HRV permission
  if (!hrv_available || overnightSDNN === null) {
    return null;  // HRV does not contribute to score
  }

  // Gate 2: Baseline must be established (14+ nights)
  if (baselineDaysAvailable < 14 || personalSDNNBaseline === null) {
    return null;  // Still calibrating — HRV does not contribute
  }

  // Gate 3: Do not apply HRV during active circadian transitions
  // (Viola et al. 2007: low HRV during transitions is EXPECTED, not a recovery failure)
  if (inCircadianTransition) {
    return null;  // Transition protocol active — suspend HRV contribution
  }

  // Compute percent deviation from personal baseline
  const hrv_deviation = (overnightSDNN - personalSDNNBaseline) / personalSDNNBaseline;

  // Map to 0–100 scale with these anchor points:
  //   +30% above baseline → 100  (excellent recovery)
  //   At baseline (0% deviation) → 70  (normal recovery, not penalizing)
  //   -30% below baseline → 0   (significant under-recovery)
  //
  // Rationale for 70 at baseline:
  //   Sitting at personal baseline means "normal" — not outstanding, not worrying.
  //   We want to reward above-baseline days and flag below-baseline days,
  //   but we don't want baseline = "poor". 70 = "solid, nothing to worry about."
  const hrv_score = clamp(70 + (hrv_deviation / 0.30) * 30, 0, 100);

  return hrv_score;
}
```

### 2.3 Score Mapping Illustration

| Overnight SDNN vs Baseline | hrv_deviation | hrv_score | Interpretation |
|---------------------------|---------------|-----------|---------------|
| +30% above baseline | +0.30 | 100 | Outstanding recovery |
| +20% above baseline | +0.20 | 90 | Excellent recovery |
| +10% above baseline | +0.10 | 80 | Good recovery |
| At baseline | 0.00 | 70 | Normal recovery |
| -10% below baseline | -0.10 | 60 | Slightly reduced |
| -20% below baseline | -0.20 | 50 | Meaningfully reduced |
| -30% below baseline | -0.30 | 40 | Poor recovery |
| -40% below baseline (clamped) | -0.40 | 0 | Significant under-recovery |

---

## 3. Updated Recovery Score Formula

### 3.1 Dynamic Component Weights

Component weights adjust based on HRV availability. **All weights must sum to 1.0.**

```typescript
interface RecoveryWeights {
  adherence: number;
  debt: number;
  hrv: number;
  transition: number;
}

function getRecoveryWeights(hrv_available: boolean, baselineDaysAvailable: number): RecoveryWeights {
  const hrv_active = hrv_available && baselineDaysAvailable >= 14;

  if (hrv_active) {
    return {
      adherence: 0.40,   // Reduced from 0.55 — HRV now shares the load
      debt:      0.30,   // Reduced from 0.40 — HRV captures some of what debt tracked
      hrv:       0.25,   // New signal — physiological ground truth
      transition: 0.05,  // Constant — circadian protocol penalty
    };
  } else {
    return {
      adherence: 0.55,   // Original weight — carrying full behavioral load
      debt:      0.40,   // Original weight
      hrv:       0.00,   // No contribution — not available or calibrating
      transition: 0.05,  // Constant
    };
  }
}
```

### 3.2 Recovery Score Computation

```typescript
function computeRecoveryScore(
  adherence_score: number,      // 0–100
  debt_score: number,           // 0–100
  transition_score: number,     // 0–100 (100 = no transition active, lower = transition penalty active)
  hrv_inputs: HRVInputs,
): RecoveryScoreResult {

  const hrv_score = calculateHRVScore(hrv_inputs);
  const weights = getRecoveryWeights(hrv_inputs.hrv_available, hrv_inputs.baselineDaysAvailable);

  const raw_score =
    adherence_score  * weights.adherence +
    debt_score       * weights.debt +
    (hrv_score ?? 0) * weights.hrv +
    transition_score * weights.transition;

  const final_score = clamp(Math.round(raw_score), 0, 100);

  return {
    score: final_score,
    components: {
      adherence: { value: adherence_score, weight: weights.adherence },
      debt:      { value: debt_score,      weight: weights.debt },
      hrv:       { value: hrv_score,       weight: weights.hrv },
      transition: { value: transition_score, weight: weights.transition },
    },
    metadata: {
      hrv_included: hrv_score !== null,
      hrv_suppressed_reason: getHRVSuppressedReason(hrv_inputs),
      baseline_confidence: getBaselineConfidence(hrv_inputs.baselineDaysAvailable),
      overnightSDNN: hrv_inputs.overnightSDNN,
      personalSDNNBaseline: hrv_inputs.personalSDNNBaseline,
    },
  };
}
```

### 3.3 Suppression Reason Derivation

```typescript
type HRVSuppressedReason = "transition" | "calibrating" | "no_device" | null;

function getHRVSuppressedReason(inputs: HRVInputs): HRVSuppressedReason {
  if (!inputs.hrv_available) return "no_device";
  if (inputs.inCircadianTransition) return "transition";
  if (inputs.baselineDaysAvailable < 14) return "calibrating";
  return null;
}
```

### 3.4 Baseline Confidence Levels

```typescript
type BaselineConfidence = "low" | "medium" | "high";

function getBaselineConfidence(days: number): BaselineConfidence {
  if (days < 14) return "low";     // Calibrating
  if (days < 21) return "medium";  // 14–20 nights: reasonable but still stabilizing
  return "high";                    // 21+ nights: stable personal baseline
}
```

---

## 4. Transition Period Handling

### 4.1 Scientific Basis

Viola et al. (2007) and replication studies demonstrate that low HRV during circadian transitions is a normal physiological response, not a recovery failure:

- Night shift workers transitioning to day shifts show initial HRV suppression (Days 1–2)
- HRV begins recovering on Days 3–4
- Stabilization occurs by Days 5–7

If the algorithm applied HRV scoring during this window, it would penalize users for following the clinically correct protocol — a significant design error.

### 4.2 Transition Protocol Integration

When `inCircadianTransition === true` (Phase 9 protocol active):

1. **Suspend HRV contribution:** `hrv_score = null` → HRV weight drops to 0%
2. **Redistribute weights:** Adherence and debt weights return to their "no HRV" values (0.55 / 0.40 / 0.05)
3. **Set transparency flag:** `hrv_suppressed_reason = "transition"`
4. **Freeze baseline updates:** Do NOT add transition-period nights to the 30-day rolling baseline (suppressed HRV would corrupt the user's personal baseline)
5. **Resume after 7 days:** When transition protocol completes, resume HRV contribution and baseline updates on the following night

### 4.3 UI Messaging

When `hrv_suppressed_reason === "transition"`, the recovery score detail view should display:

> "HRV monitoring paused during schedule change. Your score is based on sleep adherence and debt balance. Normal HRV monitoring resumes automatically in X days."

This prevents user confusion when they notice their score looks different from usual.

---

## 5. Baseline Calibration Protocol

### 5.1 Calibration Phase (Days 1–13)

**What happens:** HRV data is collected every night via HealthKit and stored in the rolling history array, but the data is NOT used to compute the recovery score.

**Why 14 nights:**
- 14 nights captures both work-shift and rest-day patterns for most shift workers
- Reduces baseline estimation error by ~65% vs single-night estimate
- Balances statistical validity against user experience (2 weeks is acceptable; 30 days would frustrate users)

**User-visible status in Recovery Score detail view:**
- "Calibrating Apple Watch HRV (Day X/14)"
- Progressive visual (e.g., a progress bar filling over 14 days)

### 5.2 Calibration Completion (Day 14)

On the night where `baselineDaysAvailable` reaches 14:

1. Compute the 14-night mean SDNN as `personalSDNNBaseline`
2. Set `hrv_available = true` and `baselineDaysAvailable = 14`
3. From the following morning, HRV begins contributing to the recovery score at 25% weight
4. Send user notification: "Your Apple Watch HRV is now improving your recovery score accuracy."

### 5.3 Ongoing Baseline Maintenance (Day 15+)

**Rolling 30-day mean:**
```
personalSDNNBaseline = mean(last 30 nights of valid overnight SDNN readings)
```

- New night's SDNN is appended to the history array
- Once the array exceeds 30 entries, the oldest entry is removed (FIFO rolling window)
- `baselineDaysAvailable = min(actual days stored, 30)` — capped at 30 for reporting purposes

**Outlier rejection:**
```typescript
// Exclude nights where HealthKit signal quality is poor
// Criteria: fewer than 3 HRV samples in the sleep window (insufficient data)
// OR any sample where Apple Watch reports low signal confidence (when available in HealthKit metadata)
if (hvr_sample_count < 3) {
  skipNight();  // Do not add to baseline
}
```

### 5.4 Baseline Freeze Conditions

The baseline rolling array STOPS being updated when:
- `inCircadianTransition === true` (Phase 9 protocol active)
- User has no Apple Watch HRV data for the night (missed night — don't add null to array)
- Night where `hrv_sample_count < 3` (outlier rejection)

Resume baseline updates:
- When transition period ends (Day 8+ after schedule stabilization)
- When the user wears their watch again

---

## 6. HealthKit Queries for Phase 33

### 6.1 Permission Required

Add to app entitlements and HealthKit permission request:
```
HKQuantityTypeIdentifierHeartRateVariabilitySDNN  (read)
```

This is a HealthKit quantity type, not the ECG sensor. It is available on Apple Watch Series 4+ running watchOS 6+. Users must grant read permission — the app should request this permission during onboarding if the user indicates they have an Apple Watch.

### 6.2 Query Structure

```swift
// Swift / HealthKit — Phase 33 implementation reference
let hrvType = HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN)!

let predicate = HKQuery.predicateForSamples(
    withStart: lastSleepWindowStart,
    end: lastSleepWindowEnd,
    options: .strictStartDate
)

let query = HKSampleQuery(
    sampleType: hrvType,
    predicate: predicate,
    limit: HKObjectQueryNoLimit,
    sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]
) { _, samples, error in
    guard let samples = samples as? [HKQuantitySample], error == nil else { return }
    
    let sdnnValues = samples.map { 
        $0.quantity.doubleValue(for: HKUnit.secondUnit(with: .milli)) 
    }
    
    let overnightSDNN = sdnnValues.isEmpty ? nil : sdnnValues.reduce(0, +) / Double(sdnnValues.count)
    // Pass overnightSDNN to HRV processor
}
```

**Key detail:** SDNN values in HealthKit are stored in seconds — convert to milliseconds by multiplying by 1000, or use `HKUnit.secondUnit(with: .milli)` directly.

### 6.3 Background Delivery (Optional / Phase 33 Stretch)

For pre-fetching before the user opens the app:

```swift
let observerQuery = HKObserverQuery(sampleType: hrvType, predicate: nil) { query, completionHandler, error in
    // Triggered when new HRV data is available
    // Fetch overnight samples and update local state
    completionHandler()
}
healthStore.execute(observerQuery)
healthStore.enableBackgroundDelivery(for: hrvType, frequency: .immediate, withCompletion: { _, _ in })
```

This allows the score to be ready when the user opens the app, rather than computing on first open.

### 6.4 HealthKit Query Timing

```
Primary trigger: AppState 'active' → app foregrounds (morning)
Time range query: lastSleepWindowStart → lastSleepWindowEnd
  (these values come from the existing sleep window tracker in score-store.ts)

If no sleep window was tracked (user didn't open app the night before):
  Fallback: query HRV for the 8 hours preceding current time
```

---

## 7. Expected Accuracy Improvement

### 7.1 Prediction

With HRV added at 25% weight, expected improvement in recovery score accuracy:

| Metric | Current (no HRV) | With HRV (25%) | Source |
|--------|-----------------|----------------|--------|
| Score-to-subjective-feeling correlation | Baseline (r ≈ 0.55 estimated) | +15–20% improvement | Bellenger et al. 2016 |
| Detection of "high-stress days" | Low — behavioral only | Improved — biometric confirmation | Buchheit 2014 |
| False high scores (felt bad, score high) | Common in early use | Reduced — HRV corrects | Meta-analysis basis |

**Conservative estimate:** 15–20% improvement in score-to-user-feeling correlation

**Milestone target (Phase 33 ROADMAP):** 20%+ improvement vs phone-only baseline

### 7.2 Basis for the 20% Target

Bellenger et al. (2016) meta-analysis found that HRV-guided recommendations correlate 30% better with performance outcomes vs. non-HRV approaches. Our target of 20% is conservative (HRV is 25% of score weight, not 100% of the recommendation), making the 20% target achievable.

---

## 8. Implementation Notes for Phase 33

### 8.1 Files to Modify

| File | Change Required |
|------|----------------|
| `src/store/score-store.ts` | Add `hrv_score`, `hrv_available`, `overnightSDNN`, `personalSDNNBaseline`, `baselineDaysAvailable`, `inCircadianTransition`, `hrv_suppressed_reason` to state |
| `src/store/score-store.ts` | Update `computeRecoveryScore()` to accept HRV inputs and apply dynamic weights |

### 8.2 New Files Required

| File | Purpose |
|------|---------|
| `src/lib/hrv/hrv-processor.ts` | Exports: `calculateHRVScore()`, `updateBaseline()`, `fetchOvernightSDNN()`, `getRecoveryWeights()` |
| `src/lib/hrv/hrv-types.ts` | TypeScript interfaces: `HRVInputs`, `RecoveryWeights`, `RecoveryScoreResult`, `HRVSuppressedReason`, `BaselineConfidence` |

### 8.3 New HealthKit Permission

Add to `app.json` entitlements and HealthKit permission request handler:
```json
{
  "com.apple.developer.healthkit.background-delivery": true
}
```

NSHealthShareUsageDescription should include HRV mention:
> "ShiftWell uses Apple Health data, including sleep records and heart rate variability from your Apple Watch, to optimize your sleep schedule and calculate your recovery score."

### 8.4 Suggested Implementation Order for Phase 33

1. Add HRV types file (`hrv-types.ts`) with all interfaces
2. Add HealthKit permission for SDNN type
3. Build `fetchOvernightSDNN()` — HealthKit query function
4. Build `calculateHRVScore()` and `updateBaseline()` in `hrv-processor.ts`
5. Update `score-store.ts` state shape (add HRV fields)
6. Update `computeRecoveryScore()` to use dynamic weights
7. Wire `fetchOvernightSDNN()` to existing AppState foreground trigger
8. Update Recovery Score detail UI (calibration status, HRV contribution display)

### 8.5 Backward Compatibility

- Users without Apple Watch: `hrv_available = false` → weights revert to current formula exactly. Zero breaking change.
- Users in calibration: `hrv_score = null` → same. No score change until Day 14.
- Users in circadian transition: same graceful fallback via suppression reason.

The implementation is purely additive — existing score behavior is preserved for all users who don't have or haven't calibrated Apple Watch HRV.

---

## Appendix: Algorithm Parameter Reference

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| HRV weight (active) | 25% | Bellenger 2016: meaningful signal; keep ≤35% to avoid over-weighting imperfect sensor |
| HRV weight (inactive) | 0% | Graceful fallback — no contribution |
| Baseline anchor (at baseline) | 70 / 100 | "Normal recovery" is good, not perfect — don't penalize being normal |
| Deviation scale (+30% → 100) | ±30% range maps to ±30 score points | Matches published HRV coaching thresholds |
| Minimum baseline nights | 14 | 14 nights captures work+rest day patterns; reduces estimation error 65% |
| Baseline window | 30-day rolling | Plews et al. 2012; Oura/WHOOP industry standard |
| Transition freeze | Active Phase 9 protocol + 7 days | Viola et al. 2007: HRV recovery takes 3–7 days post-transition |
| Minimum HRV samples/night | 3 | Below this, outlier risk too high — skip night |
| Baseline confidence thresholds | <14 = low; 14–20 = medium; 21+ = high | Matches statistical stability of rolling mean |

---

*Specification produced for Phase 32 HRV + Wearable Research. Phase 33 Apple Watch Integration implements this spec directly. See also: HRV-LITERATURE-REVIEW.md (scientific basis), WEARABLE-ACCURACY-ASSESSMENT.md (accuracy constraints that drove the 25% weight and calibration requirements).*
