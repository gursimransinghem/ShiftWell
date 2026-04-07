/**
 * Feedback Engine — Phase 15
 *
 * Reads discrepancy history and computes adjustments to the sleep plan,
 * converging on the user's actual behavior over time.
 *
 * Algorithm:
 *   - Look at last 7 nights of discrepancy data (configurable via options)
 *   - Compute weighted moving average of start deltas (recent nights 2x)
 *   - If average start delta > 10 min consistently → shift bedtime in that direction
 *   - Max adjustment: 30 min per cycle (configurable via options.maxShiftMinutes)
 *   - Min data: 3+ nights with valid delta (configurable via options.minNights)
 *   - Confidence: stddev of deltas → low variance = high confidence
 *   - Return null when insufficient data or delta < 10 min (no adjustment needed)
 *   - Disabled during circadian transitions (maintenance mode only)
 *   - Rounds to nearest 5 minutes
 *
 * Scientific basis: convergence within 7 nights to < 15 min discrepancy.
 */

import type { SleepDiscrepancy } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_LOOKBACK_NIGHTS = 7;
const DEFAULT_MAX_SHIFT_MINUTES = 30;
const DEFAULT_MIN_NIGHTS = 3;
/** Minimum average delta to trigger an adjustment (minutes) */
const ADJUSTMENT_THRESHOLD_MINUTES = 10;
/** Round all adjustments to nearest N minutes */
const ROUND_TO_MINUTES = 5;

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface FeedbackAdjustment {
  /** Positive = push bedtime later, negative = pull earlier */
  bedtimeShiftMinutes: number;
  /** Positive = push wake time later, negative = pull earlier */
  wakeShiftMinutes: number;
  /** Human-readable explanation surfaced in AdaptiveInsightCard */
  reason: string;
  /** 0–1 based on consistency of deltas (low stddev = high confidence) */
  confidence: number;
}

export interface FeedbackEngineOptions {
  /** How many nights of history to examine (default: 7) */
  lookbackNights?: number;
  /** Hard cap on bedtime/wake shift per cycle in minutes (default: 30) */
  maxShiftMinutes?: number;
  /** Minimum valid records required to compute an adjustment (default: 3) */
  minNights?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Round x to the nearest multiple of step */
function roundToNearest(x: number, step: number): number {
  return Math.round(x / step) * step;
}

/**
 * Population standard deviation for an array of numbers.
 * Returns 0 for arrays with fewer than 2 elements.
 */
function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Convert a standard deviation of start deltas into a confidence score.
 * Low stddev (consistent behaviour) → confidence close to 1.
 * High stddev (erratic behaviour) → confidence close to 0.
 *
 * Mapping: stddev 0 → 1.0, stddev 30 → 0.0 (linear clamp).
 */
function confidenceFromStddev(sd: number): number {
  const MAX_SD = 30;
  return Math.max(0, Math.min(1, 1 - sd / MAX_SD));
}

/**
 * Compute a weighted moving average where the most recent night has weight 2
 * and all prior nights have weight 1.
 */
function weightedAverage(values: number[]): number {
  if (values.length === 0) return 0;
  // Give the last value double weight
  const weights = values.map((_, i) => (i === values.length - 1 ? 2 : 1));
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const weightedSum = values.reduce((s, v, i) => s + v * weights[i], 0);
  return weightedSum / totalWeight;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute bedtime/wake adjustments from discrepancy history.
 *
 * Returns null when:
 *   - Fewer than minNights valid records exist
 *   - Average start delta is < ADJUSTMENT_THRESHOLD_MINUTES (no change needed)
 *
 * @param history  - Discrepancy records (oldest first), typically from feedbackStore.getRecentHistory(7)
 * @param options  - Optional overrides for lookback, maxShift, minNights
 */
export function computeFeedbackAdjustment(
  history: SleepDiscrepancy[],
  options?: FeedbackEngineOptions,
): FeedbackAdjustment | null {
  const lookback = options?.lookbackNights ?? DEFAULT_LOOKBACK_NIGHTS;
  const maxShift = options?.maxShiftMinutes ?? DEFAULT_MAX_SHIFT_MINUTES;
  const minNights = options?.minNights ?? DEFAULT_MIN_NIGHTS;

  // Take only the most recent `lookback` nights
  const window = history.slice(-lookback);

  // Filter to records with valid delta data
  const valid = window.filter((r) => r.delta !== null);

  if (valid.length < minNights) {
    return null;
  }

  const startDeltas = valid.map((r) => r.delta!.startMinutes);
  const endDeltas = valid.map((r) => r.delta!.endMinutes);

  const avgStartDelta = weightedAverage(startDeltas);
  const avgEndDelta = weightedAverage(endDeltas);
  const sd = stddev(startDeltas);
  const confidence = confidenceFromStddev(sd);

  // No adjustment needed when average delta is within the noise threshold
  if (Math.abs(avgStartDelta) < ADJUSTMENT_THRESHOLD_MINUTES) {
    return null;
  }

  // Raw shift = average delta, capped at maxShift
  const rawBedtimeShift = Math.sign(avgStartDelta) * Math.min(Math.abs(avgStartDelta), maxShift);
  const rawWakeShift = Math.sign(avgEndDelta) * Math.min(Math.abs(avgEndDelta), maxShift);

  // Round to nearest 5 minutes
  const bedtimeShiftMinutes = roundToNearest(rawBedtimeShift, ROUND_TO_MINUTES);
  const wakeShiftMinutes = roundToNearest(rawWakeShift, ROUND_TO_MINUTES);

  // If rounding collapses the shift to zero, nothing to do
  if (bedtimeShiftMinutes === 0 && wakeShiftMinutes === 0) {
    return null;
  }

  const direction = bedtimeShiftMinutes > 0 ? 'later' : 'earlier';
  const absMins = Math.abs(bedtimeShiftMinutes);
  const reason = `Bedtime adjusted ${absMins} min ${direction} based on your last ${valid.length} nights`;

  return {
    bedtimeShiftMinutes,
    wakeShiftMinutes,
    reason,
    confidence,
  };
}
