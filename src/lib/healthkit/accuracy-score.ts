/**
 * Calculate plan adherence (accuracy) over time.
 *
 * This module tracks how well users follow their circadian sleep plan
 * across multiple nights. Consistent adherence is the single most
 * important factor for circadian adaptation in shift workers.
 *
 * Key insight: timing regularity matters more than duration.
 * A shift worker who consistently sleeps at the planned time (even if
 * slightly short) adapts faster than one who sleeps erratically.
 *
 * Scientific basis:
 * - Regular sleep-wake timing stabilizes circadian phase markers
 *   (melatonin onset, cortisol peak) within 3-5 days.
 *   (Eastman & Burgess, 2009 — How to travel the world without jet lag)
 * - Shift workers with <30 min bedtime variability report 40% fewer
 *   fatigue-related incidents.
 *   (Sallinen et al., 2020 — Fatigue in shift workers)
 * - Streak-based motivation (consecutive adherent days) leverages
 *   the "endowed progress effect" to maintain behavior change.
 *   (Nunes & Dreze, 2006 — Endowed progress effect)
 *
 * References:
 * - Eastman & Burgess (2009) — Circadian adaptation strategies
 * - Sallinen et al. (2020) — Fatigue management in shift work
 * - Bei et al. (2016) — Sleep variability and sleep quality
 * - Phillips et al. (2017) — Irregular sleep and academic performance
 */

import type { SleepComparison } from './sleep-comparison';

/** Accuracy metrics for a single night or aggregated period */
export interface PlanAccuracy {
  /** How close actual sleep timing was to the plan (0-100) */
  timingAccuracy: number;
  /** How close actual sleep duration was to the plan (0-100) */
  durationAccuracy: number;
  /** Weighted composite: timing 60%, duration 40% */
  overallScore: number;
  /** Human-readable, encouraging insight */
  insight: string;
  /** Direction of adherence over the period */
  weeklyTrend: 'improving' | 'stable' | 'declining';
  /**
   * Consecutive days with >80% adherence.
   * Streaks reinforce habit formation — the app highlights these.
   */
  streakDays: number;
}

/** Threshold above which a day counts toward the streak */
const STREAK_THRESHOLD = 80;

/** Weight for timing in the overall score (60%) */
const TIMING_WEIGHT = 0.6;

/** Weight for duration in the overall score (40%) */
const DURATION_WEIGHT = 0.4;

/**
 * Calculate accuracy for a single night's comparison.
 *
 * Timing accuracy is derived from bedtime and wake deviations.
 * Duration accuracy is derived from how close actual duration
 * matched the planned duration.
 *
 * Both use a graduated penalty curve — small deviations (<15 min)
 * incur no penalty, reflecting normal biological variability
 * (Bei et al., 2016).
 *
 * @param planned - The planned sleep window
 * @param actual - The comparison result from sleep-comparison module
 */
export function calculateAccuracy(
  planned: { start: Date; end: Date },
  actual: SleepComparison,
): PlanAccuracy {
  // No actual data — cannot calculate meaningful accuracy
  if (!actual.actual) {
    return {
      timingAccuracy: 0,
      durationAccuracy: 0,
      overallScore: 0,
      insight: 'No sleep data available for this night.',
      weeklyTrend: 'stable',
      streakDays: 0,
    };
  }

  const timingAccuracy = calculateTimingAccuracy(
    actual.bedtimeDeviationMinutes,
    actual.wakeDeviationMinutes,
  );

  const durationAccuracy = calculateDurationAccuracy(
    actual.durationDeviationMinutes,
    actual.planned.durationMinutes,
  );

  const overallScore = Math.round(
    timingAccuracy * TIMING_WEIGHT + durationAccuracy * DURATION_WEIGHT,
  );

  const accuracy: PlanAccuracy = {
    timingAccuracy,
    durationAccuracy,
    overallScore,
    insight: '',
    weeklyTrend: 'stable',
    streakDays: overallScore >= STREAK_THRESHOLD ? 1 : 0,
  };

  accuracy.insight = generateInsight(accuracy);

  return accuracy;
}

/**
 * Calculate aggregate accuracy for a week of comparisons.
 *
 * Weekly aggregation smooths out single-night anomalies and
 * gives a more meaningful picture of adherence patterns.
 *
 * The weekly trend is calculated by comparing the first half
 * of the week to the second half — a simple but effective
 * approach that avoids over-fitting to noise.
 *
 * @param comparisons - Array of nightly SleepComparison results
 */
export function calculateWeeklyAccuracy(
  comparisons: SleepComparison[],
): PlanAccuracy {
  if (comparisons.length === 0) {
    return {
      timingAccuracy: 0,
      durationAccuracy: 0,
      overallScore: 0,
      insight: 'No comparison data available for this period.',
      weeklyTrend: 'stable',
      streakDays: 0,
    };
  }

  // Filter to nights that have actual data
  const withData = comparisons.filter((c) => c.actual !== null);

  if (withData.length === 0) {
    return {
      timingAccuracy: 0,
      durationAccuracy: 0,
      overallScore: 0,
      insight: 'No sleep data was recorded this week. Wear your Apple Watch to bed to start tracking.',
      weeklyTrend: 'stable',
      streakDays: 0,
    };
  }

  // Calculate per-night accuracies
  const nightlyAccuracies = comparisons.map((c) =>
    calculateAccuracy({ start: c.planned.start, end: c.planned.end }, c),
  );

  // Average timing and duration accuracy across nights with data
  const nightsWithData = nightlyAccuracies.filter((a) => a.overallScore > 0);
  const count = nightsWithData.length;

  const timingAccuracy = Math.round(
    nightsWithData.reduce((sum, a) => sum + a.timingAccuracy, 0) / count,
  );

  const durationAccuracy = Math.round(
    nightsWithData.reduce((sum, a) => sum + a.durationAccuracy, 0) / count,
  );

  const overallScore = Math.round(
    timingAccuracy * TIMING_WEIGHT + durationAccuracy * DURATION_WEIGHT,
  );

  // Calculate streak: consecutive days with >80% adherence, counting from most recent
  const streakDays = calculateStreak(nightlyAccuracies);

  // Calculate weekly trend by comparing first half vs second half
  const weeklyTrend = calculateTrend(nightsWithData);

  const accuracy: PlanAccuracy = {
    timingAccuracy,
    durationAccuracy,
    overallScore,
    insight: '',
    weeklyTrend,
    streakDays,
  };

  accuracy.insight = generateInsight(accuracy);

  return accuracy;
}

/**
 * Generate a helpful, encouraging insight string.
 *
 * Tone principles (aligned with ShiftWell's supportive design):
 * - Always lead with what's going well
 * - Frame deviations as opportunities, not failures
 * - Reference the science briefly to build trust
 * - Keep it to 1-2 sentences max
 *
 * @param accuracy - The accuracy metrics to describe
 */
export function generateInsight(accuracy: PlanAccuracy): string {
  const { overallScore, timingAccuracy, durationAccuracy, weeklyTrend, streakDays } = accuracy;

  // Excellent adherence
  if (overallScore >= 90) {
    if (streakDays >= 5) {
      return `Outstanding — ${streakDays}-day streak! Your circadian rhythm is locking in. Research shows 3-5 days of consistency is when adaptation accelerates.`;
    }
    return 'Excellent plan adherence. Your body clock is getting a strong, consistent signal.';
  }

  // Good adherence
  if (overallScore >= 75) {
    if (weeklyTrend === 'improving') {
      return 'Good and getting better. Your adherence trend is heading in the right direction — keep it up.';
    }
    if (timingAccuracy < durationAccuracy) {
      return 'Good sleep duration, but timing could be tighter. Even 15 fewer minutes of bedtime variability makes a measurable difference.';
    }
    if (durationAccuracy < timingAccuracy) {
      return 'Great timing consistency. Try to protect your full planned sleep duration — your body needs those last cycles for memory consolidation.';
    }
    return 'Good adherence overall. Consistency is the strongest lever for circadian adaptation.';
  }

  // Moderate adherence
  if (overallScore >= 50) {
    if (weeklyTrend === 'improving') {
      return 'Making progress — your adherence is trending upward. Small, steady improvements compound over time.';
    }
    if (weeklyTrend === 'declining') {
      return 'Adherence has dipped this week. Shift transitions are hard — focus on protecting just the bedtime, and let the rest follow.';
    }
    if (timingAccuracy < 50) {
      return 'Sleep timing has been variable. Try setting a wind-down alarm 30 minutes before planned bedtime — it\'s the simplest change with the biggest impact.';
    }
    return 'Moderate adherence. Even partial consistency helps — your body starts adapting as soon as you give it a regular signal.';
  }

  // Low adherence
  if (overallScore >= 25) {
    if (weeklyTrend === 'improving') {
      return 'Tough week, but the trend is positive. Every night closer to the plan counts.';
    }
    return 'This was a challenging week for sleep consistency. That\'s normal during shift transitions. Start with one goal: hit the planned bedtime tonight.';
  }

  // Very low adherence
  return 'Sleep was significantly off-plan this week. This happens — especially during back-to-back transitions. Tomorrow is a fresh start.';
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Calculate timing accuracy from bedtime and wake deviations.
 *
 * Bedtime is weighted more heavily (60/40) because it's more
 * controllable by the user — wake time is often dictated by
 * alarms and shift start times.
 */
function calculateTimingAccuracy(
  bedtimeDevMinutes: number,
  wakeDevMinutes: number,
): number {
  const bedtimeScore = deviationToScore(Math.abs(bedtimeDevMinutes));
  const wakeScore = deviationToScore(Math.abs(wakeDevMinutes));

  return Math.round(bedtimeScore * 0.6 + wakeScore * 0.4);
}

/**
 * Calculate duration accuracy from the deviation and planned duration.
 *
 * We're more lenient with oversleeping than undersleeping, because:
 * - Sleep debt recovery (oversleeping) is physiologically appropriate
 * - Chronic undersleeping compounds cognitive impairment
 *
 * Reference: Van Dongen et al. (2003) — Cumulative cost of sleep restriction
 */
function calculateDurationAccuracy(
  durationDevMinutes: number,
  plannedDurationMinutes: number,
): number {
  // Oversleeping gets a 50% penalty reduction (it's recovery, not failure)
  const effectiveDeviation = durationDevMinutes > 0
    ? Math.abs(durationDevMinutes) * 0.5
    : Math.abs(durationDevMinutes);

  // Scale deviation relative to planned duration for fairness
  // (30 min off on a 6h plan is worse than 30 min off on a 9h plan)
  const scaleFactor = plannedDurationMinutes > 0
    ? Math.max(1, plannedDurationMinutes / 480) // normalize to 8-hour baseline
    : 1;

  return deviationToScore(effectiveDeviation / scaleFactor);
}

/**
 * Convert an absolute deviation in minutes to a 0-100 score.
 *
 * Uses the same graduated penalty curve as sleep-comparison.ts
 * for consistency across the app.
 *
 * Tolerance: <15 min = no penalty (Bei et al., 2016 — normal variability)
 */
function deviationToScore(absMinutes: number): number {
  if (absMinutes <= 15) return 100;

  let score = 100;

  if (absMinutes > 15) {
    // 15-30 min: -1 point per minute
    const minutesInTier1 = Math.min(absMinutes, 30) - 15;
    score -= minutesInTier1 * 1.0;
  }

  if (absMinutes > 30) {
    // 30-60 min: -1.5 points per minute
    const minutesInTier2 = Math.min(absMinutes, 60) - 30;
    score -= minutesInTier2 * 1.5;
  }

  if (absMinutes > 60) {
    // 60+ min: -2 points per minute
    const minutesInTier3 = absMinutes - 60;
    score -= minutesInTier3 * 2.0;
  }

  return Math.max(0, Math.round(score));
}

/**
 * Calculate the current adherence streak (consecutive days >= threshold).
 *
 * Counts backward from the most recent night to find the longest
 * unbroken run of adherent nights.
 */
function calculateStreak(accuracies: PlanAccuracy[]): number {
  let streak = 0;

  // Count from the end (most recent night) backward
  for (let i = accuracies.length - 1; i >= 0; i--) {
    if (accuracies[i].overallScore >= STREAK_THRESHOLD) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Determine weekly trend by comparing first half vs second half scores.
 *
 * A 5-point difference threshold avoids over-reporting trends
 * from normal night-to-night variability.
 */
function calculateTrend(
  accuracies: PlanAccuracy[],
): 'improving' | 'stable' | 'declining' {
  if (accuracies.length < 3) return 'stable';

  const midpoint = Math.floor(accuracies.length / 2);
  const firstHalf = accuracies.slice(0, midpoint);
  const secondHalf = accuracies.slice(midpoint);

  const firstAvg =
    firstHalf.reduce((sum, a) => sum + a.overallScore, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, a) => sum + a.overallScore, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}
