/**
 * Outcome Calculator — Phase 25 (Intelligence Polish)
 *
 * Computes personal outcome metrics from sleep discrepancy history
 * and adaptive change history. Used by the OutcomeDashboardCard.
 *
 * Surfaces improvement %, streaks, adherence rate, and transitions handled.
 */

import type { SleepDiscrepancy } from '../feedback/types';
import type { AdaptiveChange } from '../adaptive/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PersonalOutcome {
  daysUsing: number;
  sleepImprovement: number;     // percentage vs first week (positive = better)
  debtReduction: number;        // hours reduced
  adherenceRate: number;        // percentage of days with discrepancy < 30 min
  bestStreak: number;           // consecutive days of good adherence
  currentStreak: number;        // current consecutive days of good adherence
  transitionsHandled: number;   // shift transitions with pre-adaptation changes
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GOOD_ADHERENCE_THRESHOLD_MINUTES = 30;
const FIRST_WEEK_DAYS = 7;
const MIN_DAYS_FOR_IMPROVEMENT = 14;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Average absolute duration delta (in minutes) for a set of discrepancy records.
 * Returns null when no records with actual data are available.
 */
function avgAbsoluteDurationDelta(records: SleepDiscrepancy[]): number | null {
  const valid = records.filter((r) => r.delta !== null);
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, r) => acc + Math.abs(r.delta!.durationMinutes), 0);
  return sum / valid.length;
}

/**
 * Whether a single discrepancy record represents "good adherence"
 * (start-time deviation < GOOD_ADHERENCE_THRESHOLD_MINUTES).
 */
function isGoodAdherence(record: SleepDiscrepancy): boolean {
  if (record.delta === null) return false;
  return Math.abs(record.delta.startMinutes) < GOOD_ADHERENCE_THRESHOLD_MINUTES;
}

/**
 * Compute the best and current consecutive-day streaks of good adherence.
 * Records are assumed sorted oldest-first.
 */
function computeStreaks(records: SleepDiscrepancy[]): { best: number; current: number } {
  let best = 0;
  let current = 0;
  let running = 0;

  for (const record of records) {
    if (isGoodAdherence(record)) {
      running += 1;
      if (running > best) best = running;
    } else {
      running = 0;
    }
  }

  // "current" is the running streak at the end of the array
  current = running;

  return { best, current };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calculate personal outcome metrics from history data.
 *
 * @param discrepancyHistory - All stored sleep discrepancy records, sorted oldest-first
 * @param changeLog          - Persisted adaptive change log from plan-store
 * @param installedAt        - ISO string from AsyncStorage (shiftwell:installed-at), or null
 */
export function calculateOutcomes(
  discrepancyHistory: SleepDiscrepancy[],
  changeLog: AdaptiveChange[],
  installedAt: string | null,
): PersonalOutcome {
  // ── Days using ────────────────────────────────────────────────────────────
  let daysUsing = 0;
  if (installedAt) {
    const installedDate = new Date(installedAt);
    const now = new Date();
    const diffMs = now.getTime() - installedDate.getTime();
    daysUsing = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  // ── Adherence rate ────────────────────────────────────────────────────────
  const tracked = discrepancyHistory.filter((r) => r.delta !== null);
  const adherentDays = tracked.filter(isGoodAdherence).length;
  const adherenceRate = tracked.length > 0
    ? Math.round((adherentDays / tracked.length) * 100)
    : 0;

  // ── Sleep improvement % (first 7 days vs most recent 7 days) ─────────────
  let sleepImprovement = 0;
  if (discrepancyHistory.length >= MIN_DAYS_FOR_IMPROVEMENT) {
    const firstWeek = discrepancyHistory.slice(0, FIRST_WEEK_DAYS);
    const lastWeek = discrepancyHistory.slice(-FIRST_WEEK_DAYS);

    const firstAvg = avgAbsoluteDurationDelta(firstWeek);
    const lastAvg = avgAbsoluteDurationDelta(lastWeek);

    if (firstAvg !== null && lastAvg !== null && firstAvg > 0) {
      // Improvement = reduction in deviation, expressed as positive %
      const improvement = ((firstAvg - lastAvg) / firstAvg) * 100;
      sleepImprovement = Math.round(improvement);
    }
  }

  // ── Streaks ───────────────────────────────────────────────────────────────
  const { best: bestStreak, current: currentStreak } = computeStreaks(discrepancyHistory);

  // ── Debt reduction (hours) ────────────────────────────────────────────────
  // Estimated from first week vs last week average deficit
  const firstWeekRecords = discrepancyHistory.slice(0, FIRST_WEEK_DAYS);
  const lastWeekRecords = discrepancyHistory.slice(-FIRST_WEEK_DAYS);
  const firstDebt = avgAbsoluteDurationDelta(firstWeekRecords);
  const lastDebt = avgAbsoluteDurationDelta(lastWeekRecords);
  const debtReduction = firstDebt !== null && lastDebt !== null
    ? Math.max(0, Math.round(((firstDebt - lastDebt) / 60) * 10) / 10)
    : 0;

  // ── Transitions handled ───────────────────────────────────────────────────
  // Count change log entries that are circadian-factor changes (proxy for transitions)
  const transitionsHandled = changeLog.filter(
    (c) => c.factor === 'circadian' && c.timestamp !== undefined,
  ).length;

  return {
    daysUsing,
    sleepImprovement,
    debtReduction,
    adherenceRate,
    bestStreak,
    currentStreak,
    transitionsHandled,
  };
}
