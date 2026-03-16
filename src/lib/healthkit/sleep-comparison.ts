/**
 * Compare planned sleep (from the circadian algorithm) with actual
 * HealthKit sleep data.
 *
 * This module is the feedback loop that lets ShiftWell learn how well
 * users follow the plan and adapt recommendations over time.
 *
 * Key metrics:
 * - Bedtime deviation: how far off the actual bedtime was from planned
 * - Wake deviation: same for wake time
 * - Duration deviation: planned vs actual sleep duration
 * - Adherence score: composite 0-100 score
 *
 * Scientific basis:
 * - Schedule adherence (low social jet lag) is a stronger predictor of
 *   health outcomes than total sleep duration alone.
 *   (Wittmann et al., 2006 — Social jet lag and obesity)
 * - Even 30-minute deviations from planned bedtime increase next-day
 *   cognitive impairment in shift workers.
 *   (Roach et al., 2021 — Sleep variability in shift workers)
 *
 * References:
 * - Wittmann et al. (2006) — Social jet lag: misalignment of social and biological time
 * - Roach et al. (2021) — Sleep variability and performance in shift workers
 * - Phillips et al. (2017) — Irregular sleep/wake patterns and academic performance
 */

import { differenceInMinutes } from 'date-fns';
import type { SleepRecord } from './healthkit-service';

/** Result of comparing a single night's planned vs actual sleep */
export interface SleepComparison {
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
  /** Human-readable insight about this night's adherence */
  insight: string;
}

/**
 * Compare a planned sleep window against actual HealthKit data.
 *
 * Adherence scoring:
 * - Bedtime accuracy: 40% weight (most controllable by the user)
 * - Wake accuracy: 30% weight (alarm helps, but sleep inertia is real)
 * - Duration accuracy: 30% weight (getting enough total sleep)
 *
 * Each component starts at 100 and loses points per minute of deviation:
 * - 0-15 min deviation: no penalty (normal variance)
 * - 15-30 min: -1 point per minute
 * - 30-60 min: -1.5 points per minute
 * - 60+ min: -2 points per minute
 *
 * @param planned - The planned sleep window from the circadian algorithm
 * @param actual - The actual sleep record from HealthKit (null if no data)
 */
export function comparePlannedVsActual(
  planned: { start: Date; end: Date },
  actual: SleepRecord | null,
): SleepComparison {
  const plannedDuration = differenceInMinutes(planned.end, planned.start);

  // No actual data — user either didn't wear the watch or didn't sleep
  if (!actual || !actual.asleepStart || !actual.asleepEnd) {
    return {
      planned: {
        start: planned.start,
        end: planned.end,
        durationMinutes: plannedDuration,
      },
      actual: null,
      bedtimeDeviationMinutes: 0,
      wakeDeviationMinutes: 0,
      durationDeviationMinutes: 0,
      adherenceScore: 0,
      insight: 'No sleep data recorded. Make sure your Apple Watch is charged and worn to bed.',
    };
  }

  const bedtimeDev = differenceInMinutes(actual.asleepStart, planned.start);
  const wakeDev = differenceInMinutes(actual.asleepEnd, planned.end);
  const actualDuration = actual.totalSleepMinutes;
  const durationDev = actualDuration - plannedDuration;

  // Score each component
  const bedtimeScore = deviationToScore(Math.abs(bedtimeDev));
  const wakeScore = deviationToScore(Math.abs(wakeDev));
  const durationScore = deviationToScore(Math.abs(durationDev));

  // Weighted composite
  const adherenceScore = Math.round(
    bedtimeScore * 0.4 + wakeScore * 0.3 + durationScore * 0.3,
  );

  const insight = generateComparisonInsight(bedtimeDev, wakeDev, durationDev, adherenceScore);

  return {
    planned: {
      start: planned.start,
      end: planned.end,
      durationMinutes: plannedDuration,
    },
    actual: {
      start: actual.asleepStart,
      end: actual.asleepEnd,
      durationMinutes: actualDuration,
    },
    bedtimeDeviationMinutes: bedtimeDev,
    wakeDeviationMinutes: wakeDev,
    durationDeviationMinutes: durationDev,
    adherenceScore,
    insight,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Convert an absolute deviation in minutes to a 0-100 score.
 *
 * Tolerances are based on research showing that <15 minutes of
 * bedtime variability is normal and not associated with measurable
 * performance decrements (Bei et al., 2016).
 */
function deviationToScore(absMinutes: number): number {
  if (absMinutes <= 15) return 100;

  let score = 100;
  const tiers = [
    { threshold: 15, rate: 1.0, cap: 30 },
    { threshold: 30, rate: 1.5, cap: 60 },
    { threshold: 60, rate: 2.0, cap: Infinity },
  ];

  let remaining = absMinutes;

  for (const tier of tiers) {
    if (remaining <= tier.threshold) break;
    const minutesInTier = Math.min(remaining, tier.cap) - tier.threshold;
    score -= minutesInTier * tier.rate;
    remaining = remaining;
  }

  return Math.max(0, Math.round(score));
}

/**
 * Generate a human-readable insight for a single night's comparison.
 *
 * Tone: encouraging and actionable, never judgmental.
 * Shift workers already face enough pressure — the app should be
 * a supportive coach, not a harsh critic.
 */
function generateComparisonInsight(
  bedtimeDev: number,
  wakeDev: number,
  durationDev: number,
  score: number,
): string {
  if (score >= 90) {
    return 'Excellent adherence. Your body clock is getting a consistent signal — this compounds over time.';
  }

  if (score >= 75) {
    const parts: string[] = ['Good adherence overall.'];
    if (Math.abs(bedtimeDev) > 30) {
      parts.push(
        bedtimeDev > 0
          ? `You went to bed ${bedtimeDev} minutes later than planned. Try starting your wind-down routine earlier.`
          : `You went to bed ${Math.abs(bedtimeDev)} minutes early — that's fine as long as you felt sleepy.`,
      );
    }
    return parts.join(' ');
  }

  if (score >= 50) {
    if (Math.abs(bedtimeDev) > 45) {
      return bedtimeDev > 0
        ? `Bedtime was ${bedtimeDev} minutes late. Life happens — try to protect the planned bedtime tomorrow. Even partial consistency helps.`
        : `You went to bed ${Math.abs(bedtimeDev)} minutes early. If you weren't sleepy, this can fragment sleep. Wait for drowsiness cues.`;
    }
    if (Math.abs(durationDev) > 60) {
      return durationDev < 0
        ? `You slept ${Math.abs(durationDev)} minutes less than planned. If this is a pattern, consider whether noise or light is disrupting you.`
        : `You slept ${durationDev} minutes more than planned. Extra sleep after a deficit is normal — your body is catching up.`;
    }
    return 'Moderate adherence. Small improvements in bedtime consistency will make a measurable difference.';
  }

  // score < 50
  return 'Sleep was significantly different from the plan. This happens — especially during shift transitions. Tomorrow is a fresh start.';
}
