# Algorithm Specification: HealthKit Feedback Loop Convergence Engine

**Phase:** 13 — Sleep Feedback Research  
**Document:** ALGORITHM-SPEC.md  
**Version:** 1.0  
**Date:** 2026-04-07  
**Purpose:** Define the convergence formula, inputs, outputs, guards, and integration points for the HealthKit-driven sleep plan feedback engine  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Inputs](#2-inputs)
3. [Outputs](#3-outputs)
4. [Convergence Formula](#4-convergence-formula)
5. [Thresholds and Guards](#5-thresholds-and-guards)
6. [Convergence Target](#6-convergence-target)
7. [Integration Points](#7-integration-points)
8. [Edge Cases](#8-edge-cases)
9. [Parameter Reference](#9-parameter-reference)

---

## 1. Overview

The HealthKit Feedback Engine adjusts planned sleep windows based on systematic deviation between planned and actual sleep timing. It implements an Exponential Moving Average (EMA) to smooth noisy HealthKit data, converging on the user's true behavioral sleep pattern within 7 nights.

**The problem it solves:** ShiftWell generates sleep plans from a deterministic circadian algorithm calibrated to the user's chronotype input at onboarding. Over time, real behavior diverges from the plan: a user may consistently go to bed 35 minutes later than planned, not because they are non-adherent, but because the algorithm's initial chronotype estimate is slightly off. The feedback engine detects and corrects this systematic offset without requiring the user to manually adjust anything.

**What it does NOT do:**
- Does not override active circadian transition protocols (protocol takes priority)
- Does not adjust plans during the first 3 nights (insufficient data)
- Does not adjust plans when HealthKit data has been absent for ≥3 consecutive nights
- Does not reduce sleep duration below the user's configured minimum need

**Scientific basis:**
- Process S homeostatic calibration (Borbely 1982) — justifies behavioral chronotype updating
- EMA smoothing for noisy actigraphy data (Phillips et al. 2017) — justifies α=0.3 parameter
- Mathematical convergence in 5–7 cycles (Skeldon et al. 2016) — validates the 7-night convergence target
- Circadian resetting capacity limits (Golombek & Rosenstein 2010) — justifies 30-min per-cycle cap
- JITAI design principles (Nahum-Shani et al. 2018) — validates the overall adaptive framework

---

## 2. Inputs

### 2.1 `discrepancyHistory: SleepComparison[]`

The last 7–14 nights of sleep comparison records from the Phase 14 persistence layer.

Each record contains:
```typescript
// From src/lib/healthkit/sleep-comparison.ts — SleepComparison interface
interface SleepComparison {
  planned: { start: Date; end: Date; durationMinutes: number };
  actual: { start: Date; end: Date; durationMinutes: number } | null;
  /** Positive = went to bed late, negative = went to bed early */
  bedtimeDeviationMinutes: number;
  /** Positive = woke up late, negative = woke up early */
  wakeDeviationMinutes: number;
  /** Positive = slept longer than planned, negative = shorter */
  durationDeviationMinutes: number;
  /** Composite adherence score (0-100, higher is better) */
  adherenceScore: number;
  insight: string;
}
```

**Critical implementation note:** `bedtimeDeviationMinutes` must be derived from `SleepRecord.asleepStart` (when HK detects sleep onset) NOT from `SleepRecord.inBedStart` (when user entered bed). The pre-sleep in-bed period is 10–30 minutes of reading/phone use that the algorithm cannot and should not target. See LITERATURE-REVIEW.md §4.1.

**Data quality gate:** Before using a `SleepComparison` record, verify that `actual` is not null and that `actual.durationMinutes > 60` (filter out failed sleep attempts and nap misclassifications).

### 2.2 `currentPlan: SleepPlan`

The currently active sleep plan from the plan-store. Used to read the current planned bedtime and wake time before applying adjustment.

### 2.3 `circadianProtocol: CircadianProtocol | null`

The active transition protocol from `adaptiveContext.protocol` (computed in `src/lib/adaptive/context-builder.ts`). When non-null, feedback is suspended.

A `CircadianProtocol` represents a structured shift transition (night-to-day, day-to-night) where the algorithm is actively moving the sleep window through a science-prescribed sequence. Feedback would interfere with this sequence by reading the user's transitional sleep timing as "behavioral deviation" when it is actually protocol-prescribed displacement.

---

## 3. Outputs

### 3.1 `adjustedBedtimeOffsetMinutes: number`

Cumulative offset from the chronotype baseline bedtime (positive = later than baseline). This is the total drift accumulated since the feedback engine was first activated.

Example: if the baseline plan has bedtime at 22:00 and `adjustedBedtimeOffsetMinutes = +25`, the next plan will target bedtime at 22:25.

### 3.2 `adjustedWakeOffsetMinutes: number`

Cumulative offset from the algorithm-computed wake time. Applies independently from the bedtime offset, allowing the algorithm to separately calibrate sleep onset and wake timing.

### 3.3 `feedbackActive: boolean`

`false` when feedback is paused for any reason. When `false`, the current offsets are frozen — not zeroed, not updated. The plan continues to apply the last computed offset but does not calculate new adjustments.

### 3.4 `feedbackReason: string`

Human-readable reason for the current feedback state. Used for debugging, logs, and optional user-facing transparency ("Your plan is currently adapting to your sleep pattern").

Examples:
- `"Active — adjusting bedtime based on 7-night history"`
- `"Paused — circadian protocol active (night-to-day transition)"`
- `"Paused — HealthKit data missing for 4 consecutive nights"`
- `"Initializing — need 3 nights before first adjustment"`
- `"Stable — discrepancy within noise floor, no adjustment needed"`

---

## 4. Convergence Formula

The algorithm runs once per night, after HealthKit sleep data becomes available (typically by 10 AM).

```
// ─── STEP 0: Guard checks ─────────────────────────────────────────────────────

// 1. Active circadian protocol → suspend immediately
if circadianProtocol !== null:
  return { feedbackActive: false, feedbackReason: "Paused — circadian protocol active" }

// 2. Insufficient history → initializing
validRecords = discrepancyHistory.filter(r => r.actual !== null && r.actual.durationMinutes > 60)
if validRecords.length < 3:
  return { feedbackActive: false, feedbackReason: "Initializing — need 3 nights before first adjustment" }

// 3. Missing data gap check
consecutiveMissingNights = countConsecutiveMissingFromToday(discrepancyHistory)
if consecutiveMissingNights >= 3:
  return { feedbackActive: false, feedbackReason: "Paused — HealthKit data missing for N consecutive nights" }


// ─── STEP 1: Read latest deviation ────────────────────────────────────────────

// Use asleepStart, not inBedStart (see LITERATURE-REVIEW.md §4.1)
actualBedtimeDeviation  = latest.bedtimeDeviationMinutes  // positive = user went to bed later than planned
actualWakeDeviation     = latest.wakeDeviationMinutes      // positive = user woke later than planned


// ─── STEP 2: Noise floor check ────────────────────────────────────────────────

// If latest deviation is within measurement noise, don't update the EMA from this night
// (literature: ±20 min Apple Watch error floor; see LITERATURE-REVIEW.md §4.2)

if abs(actualBedtimeDeviation) < 20:
  bedtimeDeltaInput = 0  // within noise floor — no signal
else:
  bedtimeDeltaInput = actualBedtimeDeviation

if abs(actualWakeDeviation) < 20:
  wakeDeltaInput = 0
else:
  wakeDeltaInput = actualWakeDeviation


// ─── STEP 3: Exponential Moving Average update ────────────────────────────────

// α = 0.3: 30% weight on latest night, 70% on prior history
// Effective window: ~7 nights (1/α approximation)
// Scientific basis: Phillips et al. 2017, Skeldon et al. 2016

α = 0.3

smoothedBedtimeDeviation = α * bedtimeDeltaInput + (1 - α) * previousSmoothedBedtimeDeviation
smoothedWakeDeviation    = α * wakeDeltaInput    + (1 - α) * previousSmoothedWakeDeviation


// ─── STEP 4: Compute per-cycle adjustment ─────────────────────────────────────

// Proportional gain K_p = 0.5: move plan 50% toward actual behavior each cycle
// This prevents oscillation (K_p > 0.8) and sluggishness (K_p < 0.3)
// Scientific basis: Rivera et al. 2018 control theory parameterization

K_p = 0.5

bedtimeAdjustment = K_p * smoothedBedtimeDeviation
wakeAdjustment    = K_p * smoothedWakeDeviation


// ─── STEP 5: Apply per-cycle cap ─────────────────────────────────────────────

// MAX_ADJUST = 30 min: circadian clock can reset maximum ~1-2h/day
// 30 min is conservative — ensures algorithm never moves faster than biology
// Scientific basis: Golombek & Rosenstein 2010

MAX_ADJUST = 30  // minutes

bedtimeAdjustment = clamp(bedtimeAdjustment, -MAX_ADJUST, +MAX_ADJUST)
wakeAdjustment    = clamp(wakeAdjustment,    -MAX_ADJUST, +MAX_ADJUST)


// ─── STEP 6: Update cumulative offsets ────────────────────────────────────────

newBedtimeOffset = previousBedtimeOffset + bedtimeAdjustment
newWakeOffset    = previousWakeOffset    + wakeAdjustment


// ─── STEP 7: Minimum sleep need guard ─────────────────────────────────────────

// After computing offsets, verify the resulting sleep window still meets minimum need
newPlannedBedtime = baselineBedtime + newBedtimeOffset
newPlannedWake    = baselineWake    + newWakeOffset
newDuration       = newPlannedWake - newPlannedBedtime

MIN_SLEEP_MINUTES = userProfile.sleepNeedHours * 60  // default: 420 min (7h)

if newDuration < MIN_SLEEP_MINUTES:
  // Preserve duration: shift window earlier rather than shrink it
  newPlannedBedtime = newPlannedWake - MIN_SLEEP_MINUTES
  newBedtimeOffset  = newPlannedBedtime - baselineBedtime


// ─── STEP 8: Return result ────────────────────────────────────────────────────

return {
  adjustedBedtimeOffsetMinutes: newBedtimeOffset,
  adjustedWakeOffsetMinutes:    newWakeOffset,
  feedbackActive:               true,
  feedbackReason:               "Active — adjusting based on " + validRecords.length + "-night history",
}
```

---

## 5. Thresholds and Guards

| Condition | Behavior | Rationale |
|-----------|----------|-----------|
| `circadianProtocol !== null` | Feedback PAUSED — protocol takes priority | Protocol prescribes a moving target; feedback would treat movement as deviation |
| `validRecords.length < 3` | Feedback PAUSED — initializing | EMA seeded from <3 nights is statistically unreliable |
| `consecutiveMissingNights >= 3` | Feedback PAUSED — offset frozen at last value | Stale EWMA is worse than frozen state; avoids drift on absent data |
| `abs(latestDeviation) < 20 min` | No EMA update from this night — noise floor | ±20 min is Apple Watch measurement error (Menghini 2021, Mantua 2025) |
| `abs(adjustment) > 30 min` | Capped at 30 min per cycle | Circadian resetting capacity limit (Golombek 2010) |
| `newDuration < MIN_SLEEP_NEED` | Window shifted earlier; no duration shrinkage | Algorithm cannot produce a plan shorter than minimum sleep need |
| User overrode plan manually (Phase 15 tracking) | Feedback PAUSED for 7 days after manual override | Respect user autonomy; avoid fighting the user's explicit choice |
| Post 14-night sustained failure (see §6) | Surface failure alert to UI | Feedback alone cannot solve a structural behavioral mismatch |

---

## 6. Convergence Target

**Primary target:** `mean(abs(bedtimeDeviationMinutes), nights 5–7 post-activation) < 15 min`

**Expected convergence timeline:**

Based on Skeldon et al. 2016 mathematical modeling with α=0.3 EMA:

| Scenario | Initial Discrepancy | Expected Convergence |
|----------|--------------------|--------------------|
| Consistent 30–45 min late bedtime | ~40 min | ~5–6 nights |
| Consistent 15–30 min late bedtime | ~22 min | ~3–4 nights |
| Inconsistent discrepancy (high variance) | 20–60 min | ~7–10 nights |
| Daytime sleeper with reduced HK accuracy | +5–10 min more | ~8–12 nights |
| User on irregular schedule (high noise) | N/A | May not converge; failure condition |

**Failure condition:** If `mean(abs(bedtimeDeviationMinutes), nights 8–14) > 30 min`, the algorithm has not converged. Two possible causes:
1. The user's behavioral sleep timing is genuinely chaotic (no stable pattern) — feedback cannot help
2. There is a structural mismatch between the algorithm's circadian assumptions and the user's chronotype — requires manual review

**Failure response (Phase 15 UI):** Surface an adaptive insight card: "Your sleep timing varies a lot night-to-night — consider reviewing your sleep preferences." Do NOT continue applying adjustments that are not converging.

---

## 7. Integration Points

### 7.1 Called From

- `src/lib/adaptive/context-builder.ts` — after Phase 15 integration
- Specifically: after `computeDebtLedger` and `buildProtocol` run (the debt and protocol state must be known before feedback is computed)
- The `computeDebtLedger` function in `src/lib/adaptive/sleep-debt-engine.ts` uses the same `discrepancyHistory` input — the two modules share this data source

### 7.2 Reads From

- `discrepancyHistory` stored in plan-store (Phase 14 persistence layer)
- `adaptiveContext.protocol` — from `buildProtocol()` in `src/lib/adaptive/circadian-protocols.ts`
- `SleepComparison.bedtimeDeviationMinutes` — via `src/lib/healthkit/sleep-comparison.ts`
- Note: `bedtimeDeviationMinutes` is derived from `SleepRecord.asleepStart` — verify this before Phase 14 wiring

### 7.3 Writes To

- `plan-store.setBedtimeOffset(offsetMinutes: number)` — new action to be added in Phase 15
- `plan-store.setWakeOffset(offsetMinutes: number)` — new action to be added in Phase 15
- Feedback state log (Phase 14 persistence layer) — for debugging and validation study data collection

### 7.4 Code Pattern — `computeDebtLedger` (existing reference)

The `computeDebtLedger` function in `src/lib/adaptive/sleep-debt-engine.ts` provides the model for how to consume `SleepRecord[]` history:

```typescript
// Pattern to follow:
export function computeFeedbackAdjustment(
  discrepancyHistory: SleepComparison[],
  currentPlan: SleepPlan,
  circadianProtocol: CircadianProtocol | null,
  previousState: FeedbackState,
): FeedbackResult
```

This signature mirrors the existing adaptive engine pattern: pure function, no side effects, takes history + state → returns new state. The plan-store action applies the result.

### 7.5 Blocked By

Active `circadianProtocol` (checked via `adaptiveContext.protocol`). The feedback engine must check for an active protocol as its first guard — before any computation.

---

## 8. Edge Cases

### 8.1 First 3 Nights — Seeding the EMA

**Situation:** User has just activated HealthKit feedback. `discrepancyHistory` has 1–2 valid records.

**Behavior:** Feedback is paused (`feedbackActive: false`). The EMA is seeded from the first available deviation but no adjustment is applied until the third valid night. This prevents a single outlier night from driving a large initial adjustment.

**EMA seeding formula (nights 1–3):**
```
// Night 1: seed directly
previousSmoothedDeviation = firstNightDeviation

// Night 2: apply EMA update but do not emit adjustment
smoothedDeviation = 0.3 * secondNightDeviation + 0.7 * firstNightDeviation

// Night 3: emit first adjustment
smoothedDeviation = 0.3 * thirdNightDeviation + 0.7 * smoothedDeviation
delta = K_p * smoothedDeviation
// Apply delta, check guards, return adjustment
```

### 8.2 Night Shift Users — Daytime Sleep Windows

**Situation:** User is a night shift worker. Their "main sleep" window is 9 AM–5 PM.

**Behavior:** The algorithm treats daytime and nighttime sleep windows identically in terms of the convergence formula. The input to the algorithm is always `bedtimeDeviationMinutes` and `wakeDeviationMinutes` — not the absolute time of day.

**Known accuracy concern:** Apple Watch accuracy is lower for daytime sleep (Pesonen & Kuula 2018: +32 min overestimation vs. +18 min at night). The dead zone threshold of ±20 min may be insufficient. The 30-day validation study will test whether the dead zone needs to expand to ±25–30 min for daytime sleepers.

**Temporary conservative approach:** Until validation data is available, apply a `daytimeSleepConfidenceMultiplier = 0.75` to the EMA update weight for nights flagged as daytime sleep (user's `shiftType === 'night'`). This effectively makes α = 0.3 × 0.75 = 0.225 for night shift workers — slightly more conservative.

### 8.3 Split Nights — Multiple Sleep Blocks

**Situation:** User slept 3 hours post-night-shift, then 4 hours later in the day.

**Behavior:** Use the primary sleep block only — defined as the longest contiguous `asleepStart`/`asleepEnd` segment that overlaps with the algorithm's planned sleep window. If multiple segments exist, sum them for `totalSleepMinutes` but use only the primary block's `asleepStart` for bedtime feedback.

**Rationale:** The feedback algorithm targets the planned primary sleep window. Split sleep is a recovery behavior, not the primary behavioral target. Treating the second sleep fragment's onset time as "actual bedtime" would corrupt the signal.

### 8.4 Manual Plan Override — 7-Day Pause

**Situation:** User manually edits their sleep preference settings after Phase 15 UI is built.

**Behavior:** When a manual override is detected, pause feedback for 7 calendar days. After 7 days, resume with the current deviation history (do not reset the EMA).

**Rationale:** A manual override represents the user explicitly correcting the algorithm's estimate. Immediately running feedback on top of the override would fight the user's choice. The 7-day pause allows the user's correction to stabilize before feedback resumes.

### 8.5 Recovery After Data Gap

**Situation:** HealthKit data was missing for 5 consecutive nights (user forgot to charge watch). Now data resumes.

**Behavior:**
1. Do NOT resume feedback immediately — treat as a partial re-initialization
2. Require 3 consecutive valid nights before resuming adjustment
3. EMA is re-seeded from the first valid night after the gap (do not carry forward stale pre-gap EMA)
4. The cumulative offset (`adjustedBedtimeOffsetMinutes`) is preserved — do not reset the plan to baseline just because data was missing

**Rationale:** The EMA becomes unreliable after a multi-day gap. The cumulative offset represents real behavioral calibration that should not be discarded. But new adjustments must be grounded in fresh data.

---

## 9. Parameter Reference

| Parameter | Value | Adjustable | Scientific Basis |
|-----------|-------|-----------|-----------------|
| `α` (EMA smoothing factor) | 0.3 | Phase 16 tuning | Phillips et al. 2017; Skeldon 2016 — 7-night effective window |
| `K_p` (proportional gain) | 0.5 | Phase 16 tuning | Rivera et al. 2018 — stable convergence without overshoot |
| `MAX_ADJUST` | 30 min | Not tunable | Golombek 2010 — circadian resetting cap |
| `NOISE_FLOOR` | 20 min | Possible subgroup tuning | Menghini 2021 + Mantua 2025 measurement error floor |
| `MIN_HISTORY_NIGHTS` | 3 | Not tunable | Minimum for EMA statistical validity |
| `MAX_MISSING_NIGHTS` | 3 consecutive | Not tunable | WSS 2025 — multi-night trending required |
| `MANUAL_OVERRIDE_PAUSE_DAYS` | 7 | UX tuning | User autonomy principle |
| `DAYTIME_SLEEP_CONFIDENCE_MULTIPLIER` | 0.75 | Validation-driven | Pesonen 2018 — daytime accuracy reduction; pending validation |
| `MIN_SLEEP_MINUTES` | 420 (7h) default | User-configurable | AASM/CDC adult minimum recommendation |
| `CONVERGENCE_TARGET_MINUTES` | 15 min | Not tunable | Skeldon 2016 mathematical model; WSS clinical threshold |

---

*Document produced during Phase 13 — Sleep Feedback Research sprint, 2026-04-07.*  
*Companion documents: LITERATURE-REVIEW.md (evidence base), VALIDATION-PLAN.md (study design).*  
*Implementation starts Phase 14 (persistence layer) and Phase 15 (convergence engine + UI).*
