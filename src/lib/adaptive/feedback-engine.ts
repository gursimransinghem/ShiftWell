/**
 * Algorithm Feedback Engine — HealthKit Closed Loop
 *
 * Adjusts planned sleep windows based on systematic deviation between
 * planned and actual sleep timing (from HealthKit data).
 *
 * Algorithm: Exponential Moving Average (EMA) of bedtime deviations.
 * Scientific basis: Process S homeostatic calibration (Borbely 1982),
 * EMA smoothing for noisy actigraphy (Phillips et al. 2017).
 *
 * HK-11 — HRV-calibrated dead zone:
 * When overnight HRV is below the user's 20th percentile, the dead zone
 * expands from 20 to 30 min. Low-HRV nights produce noisier sleep timing
 * data (Phillips et al. 2017), so we suppress adjustments on those nights
 * to prevent the algorithm from adapting to compromised recovery readings.
 *
 * Requirements satisfied:
 *   HK-04 — Reads discrepancy history, adjusts windows
 *   HK-05 — Convergence target: <15 min average discrepancy within 7 nights
 *   HK-11 — HRV-calibrated dead zone expansion on low-recovery nights
 */

import type { SleepComparison } from '../healthkit/sleep-comparison';
import type {
  CircadianProtocol,
  FeedbackResult,
  HRVFeedbackContext,
  ConvergenceStatus,
} from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

/** EMA smoothing factor. 30% weight on latest night, 70% on history. */
const SMOOTHING_ALPHA = 0.3;

/** Standard dead zone — Apple Watch TST measurement error floor (Menghini 2021) */
const DEAD_ZONE_MINUTES = 20;

/** HK-11: expanded dead zone on low-HRV nights (noisy recovery signal) */
const HRV_LOW_DEAD_ZONE_MINUTES = 30;

/** HRV percentile below which dead zone expands */
const HRV_LOW_PERCENTILE_THRESHOLD = 20;

/** Maximum per-cycle adjustment (circadian resetting capacity — Golombek 2010) */
const MAX_DELTA_MINUTES = 30;

/** Minimum valid nights before first adjustment */
const MIN_NIGHTS_REQUIRED = 3;

/** Maximum consecutive missing nights before pausing feedback */
const MAX_GAP_NIGHTS = 3;

/** Convergence target in minutes (Skeldon et al. 2016) */
const CONVERGENCE_TARGET = 15;

/** Stall threshold: if |smoothed| still > this after 14 nights, declare stalled */
const STALL_THRESHOLD = 30;

/** Minimum actual sleep duration to count as valid (filters naps / failed attempts) */
const MIN_SLEEP_DURATION_MINUTES = 60;

/** Proportional gain — move plan 50% toward actual each cycle (Rivera et al. 2018) */
const K_P = 0.5;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Count consecutive missing nights from the most recent record.
 * A missing night has actual=null OR actual.durationMinutes <= MIN_SLEEP_DURATION_MINUTES.
 */
function countConsecutiveMissingFromEnd(history: SleepComparison[]): number {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const r = history[i];
    if (!r.actual || r.actual.durationMinutes <= MIN_SLEEP_DURATION_MINUTES) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Compute EMA of an array of values.
 * Seeds the EMA from the first element.
 */
function computeEMA(values: number[], alpha = SMOOTHING_ALPHA): number {
  if (values.length === 0) return 0;
  let ema = values[0];
  for (let i = 1; i < values.length; i++) {
    ema = alpha * values[i] + (1 - alpha) * ema;
  }
  return ema;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute a composite recovery score for a single night.
 *
 * Formula: 0.4 × timing_accuracy + 0.3 × duration_accuracy + 0.3 × hrv_component
 *
 * timing_accuracy  = clamp(1 - |bedtimeDeviation| / 60, 0, 1) × 100
 * duration_accuracy = clamp(1 - |durationDeviation| / 60, 0, 1) × 100
 * hrv_component    = 0–100 (from HRVFeedbackContext.percentile; defaults to 50)
 *
 * @param comparison - The planned-vs-actual comparison for the night
 * @param hrvPercentile - User's HRV percentile for the night (0–100), optional
 * @returns Recovery score 0–100, rounded to 1 decimal
 */
export function computeRecoveryScore(
  comparison: SleepComparison,
  hrvPercentile?: number,
): number {
  const timingAccuracy =
    clamp(1 - Math.abs(comparison.bedtimeDeviationMinutes) / 60, 0, 1) * 100;
  const durationAccuracy =
    clamp(1 - Math.abs(comparison.durationDeviationMinutes) / 60, 0, 1) * 100;
  const hrvComponent = hrvPercentile ?? 50; // neutral when not available

  const score =
    0.4 * timingAccuracy + 0.3 * durationAccuracy + 0.3 * hrvComponent;

  return Math.round(score * 10) / 10;
}

/**
 * Compute the feedback offset to apply to the next sleep plan.
 *
 * Uses EMA (α=0.3) over recent bedtime deviations to estimate the systematic
 * offset between the algorithm's plan and the user's actual sleep timing.
 * Applies guards for insufficient data, active protocols, and data gaps.
 *
 * HK-11: When overnight HRV < user's 20th percentile, the dead zone expands
 * from 20 to 30 min to suppress spurious adjustments on noisy-recovery nights.
 *
 * @param discrepancyHistory - Last 30 nights of planned-vs-actual comparisons
 * @param protocol           - Active circadian protocol (null or transitionType='none' = none active)
 * @param previousOffset     - Previous cumulative offset from the plan-store
 * @param hrvContext         - Tonight's HRV vs. user baseline (optional)
 * @returns FeedbackResult with new offsets and status
 */
export function computeFeedbackOffset(
  discrepancyHistory: SleepComparison[],
  protocol: CircadianProtocol | null | undefined,
  previousOffset?: { bedtimeMinutes: number; wakeMinutes: number },
  hrvContext?: HRVFeedbackContext,
): FeedbackResult {
  const prevBedtime = previousOffset?.bedtimeMinutes ?? 0;
  const prevWake = previousOffset?.wakeMinutes ?? 0;

  const inactive = (
    feedbackReason: string,
    convergenceStatus: ConvergenceStatus = 'converging',
    deadZone = DEAD_ZONE_MINUTES,
    smoothed = 0,
  ): FeedbackResult => ({
    adjustedBedtimeOffsetMinutes: prevBedtime,
    adjustedWakeOffsetMinutes: prevWake,
    feedbackActive: false,
    feedbackReason,
    smoothedBedtimeDeviation: smoothed,
    convergenceStatus,
    activeDeadZoneMinutes: deadZone,
  });

  // ── Guard 1: Active circadian protocol ──────────────────────────────────────
  if (protocol && protocol.transitionType !== 'none') {
    return inactive(
      `Paused — circadian protocol active (${protocol.transitionType})`,
      'converging',
    );
  }

  // ── Guard 2: Filter valid nights ─────────────────────────────────────────────
  const validNights = discrepancyHistory.filter(
    (r) => r.actual !== null && r.actual.durationMinutes > MIN_SLEEP_DURATION_MINUTES,
  );

  if (validNights.length < MIN_NIGHTS_REQUIRED) {
    return inactive(
      `Initializing — need ${MIN_NIGHTS_REQUIRED} nights before first adjustment (have ${validNights.length})`,
      'insufficient_data',
    );
  }

  // ── Guard 3: Consecutive missing nights ─────────────────────────────────────
  const consecutiveMissing = countConsecutiveMissingFromEnd(discrepancyHistory);
  if (consecutiveMissing >= MAX_GAP_NIGHTS) {
    return inactive(
      `Paused — HealthKit data missing for ${consecutiveMissing} consecutive nights`,
      'converging',
    );
  }

  // ── HK-11: Dead zone selection ────────────────────────────────────────────────
  const isLowHRVNight =
    hrvContext !== undefined &&
    hrvContext.currentRMSSD < hrvContext.p20RMSSD;

  const deadZone = isLowHRVNight ? HRV_LOW_DEAD_ZONE_MINUTES : DEAD_ZONE_MINUTES;

  // ── EMA computation ───────────────────────────────────────────────────────────
  // Use last 7 valid nights for EMA
  const recentNights = validNights.slice(-7);

  // Apply noise floor: deviations within dead zone are zeroed before EMA
  const bedtimeInputs = recentNights.map((r) =>
    Math.abs(r.bedtimeDeviationMinutes) < deadZone ? 0 : r.bedtimeDeviationMinutes,
  );
  const wakeInputs = recentNights.map((r) =>
    Math.abs(r.wakeDeviationMinutes) < deadZone ? 0 : r.wakeDeviationMinutes,
  );

  const smoothedBedtime = computeEMA(bedtimeInputs);
  const smoothedWake = computeEMA(wakeInputs);

  // ── Per-cycle adjustment ──────────────────────────────────────────────────────
  // Apply dead zone to smoothed signal as well (prevents micro-oscillations)
  const bedtimeDelta =
    Math.abs(smoothedBedtime) < deadZone
      ? 0
      : clamp(smoothedBedtime * K_P, -MAX_DELTA_MINUTES, MAX_DELTA_MINUTES);

  const wakeDelta =
    Math.abs(smoothedWake) < deadZone
      ? 0
      : clamp(smoothedWake * K_P, -MAX_DELTA_MINUTES, MAX_DELTA_MINUTES);

  // ── Cumulative offset update ─────────────────────────────────────────────────
  const newBedtimeOffset = prevBedtime + bedtimeDelta;
  const newWakeOffset = prevWake + wakeDelta;

  // ── Convergence status ───────────────────────────────────────────────────────
  const avgAbsDeviation =
    recentNights.reduce((s, r) => s + Math.abs(r.bedtimeDeviationMinutes), 0) /
    recentNights.length;

  let convergenceStatus: ConvergenceStatus;
  if (avgAbsDeviation <= CONVERGENCE_TARGET) {
    convergenceStatus = 'converged';
  } else if (validNights.length >= 14 && avgAbsDeviation > STALL_THRESHOLD) {
    convergenceStatus = 'stalled';
  } else {
    convergenceStatus = 'converging';
  }

  // ── Reason string ────────────────────────────────────────────────────────────
  const feedbackReason =
    convergenceStatus === 'converged'
      ? `Stable — discrepancy within noise floor (avg ${avgAbsDeviation.toFixed(1)} min)`
      : convergenceStatus === 'stalled'
      ? `Stalled — high variability after ${validNights.length} nights (avg ${avgAbsDeviation.toFixed(1)} min)`
      : `Active — adjusting based on ${validNights.length}-night history${isLowHRVNight ? ' (HRV-expanded dead zone)' : ''}`;

  return {
    adjustedBedtimeOffsetMinutes: newBedtimeOffset,
    adjustedWakeOffsetMinutes: newWakeOffset,
    feedbackActive: true,
    feedbackReason,
    smoothedBedtimeDeviation: Math.round(smoothedBedtime * 10) / 10,
    convergenceStatus,
    activeDeadZoneMinutes: deadZone,
  };
}
