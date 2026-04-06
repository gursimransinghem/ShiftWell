/**
 * Sleep Debt Engine
 *
 * Computes a rolling 14-night sleep debt ledger from HealthKit history.
 *
 * Scientific basis: Two-Process Model (Borbely 1982), AASM sleep need
 * guidelines, NIOSH fatigue risk thresholds.
 *
 * Apple Watch correction: Apple Watch overestimates deep sleep by ~43 min
 * on average (Chinoy et al. 2021). We track this flag but use totalSleepMinutes
 * for debt calculation — the correction applies to recovery quality estimation
 * elsewhere in the adaptive brain.
 */

import { differenceInDays, addDays } from 'date-fns';
import type { SleepRecord } from '../healthkit/healthkit-service';
import type { ShiftEvent } from '../circadian/types';
import type { DebtLedger, DebtSeverity } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_HISTORY_NIGHTS = 14;
const MAX_DEBT_HOURS = 10;
const MAX_BANK_HOURS = 2;
const BANKING_WINDOW_MIN_DAYS = 3;
const BANKING_WINDOW_MAX_DAYS = 7;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function classifySeverity(rollingDebt: number): DebtSeverity {
  if (rollingDebt < 0.5) return 'none';
  if (rollingDebt < 2) return 'mild';
  if (rollingDebt < 5) return 'moderate';
  return 'severe';
}

/**
 * Determine whether a sleep banking window is open.
 *
 * Conditions (all must be true):
 *   1. An upcoming night/evening shift exists within 14 days
 *   2. That shift has a type boundary (prior day was different type or off)
 *   3. Days until that shift are between 3 and 7 (inclusive)
 *   4. 7-day average sleep < sleepNeed
 */
function computeBankingWindowOpen(
  upcomingShifts: ShiftEvent[],
  today: Date,
  history: SleepRecord[],
  sleepNeed: number,
): boolean {
  // Sort upcoming shifts by start date, ascending
  const sorted = [...upcomingShifts]
    .filter((s) => {
      const daysAway = differenceInDays(s.start, today);
      return daysAway >= 0 && daysAway <= 14;
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Compute 7-day average sleep from the most recent 7 records
  const recent7 = history.slice(-7);
  const avg7 =
    recent7.length === 0
      ? sleepNeed // no data → assume met (no banking signal)
      : recent7.reduce((sum, r) => sum + r.totalSleepMinutes / 60, 0) /
        recent7.length;

  if (avg7 >= sleepNeed) return false;

  // Check each candidate night/evening shift
  for (const shift of sorted) {
    if (shift.shiftType !== 'night' && shift.shiftType !== 'evening') continue;

    const daysAway = differenceInDays(shift.start, today);
    if (daysAway < BANKING_WINDOW_MIN_DAYS || daysAway > BANKING_WINDOW_MAX_DAYS) continue;

    // Check for a shift-type boundary: prior day has a different shiftType or is off
    const priorDayShift = sorted.find((s) => {
      const priorDate = addDays(shift.start, -1);
      const d = differenceInDays(s.start, priorDate);
      return d === 0;
    });

    const hasBoundary =
      priorDayShift === undefined || priorDayShift.shiftType !== shift.shiftType;

    if (hasBoundary) return true;
  }

  return false;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute a rolling 14-night sleep debt ledger.
 *
 * @param history       SleepRecord array (any length — filtered internally to 14 nights)
 * @param sleepNeed     Target sleep in hours (e.g. 7.5)
 * @param upcomingShifts Shift events for banking-window logic
 * @param today         Reference date (typically new Date())
 * @returns DebtLedger
 */
export function computeDebtLedger(
  history: SleepRecord[],
  sleepNeed: number,
  upcomingShifts: ShiftEvent[],
  today: Date,
): DebtLedger {
  // 1. Keep only the last 14 nights (ignore records older than 14 days)
  const cutoff = addDays(today, -MAX_HISTORY_NIGHTS);
  const relevant = history.filter((r) => r.date >= cutoff);

  // 2. Compute per-night debt and sum
  let rollingDebt = 0;
  for (const record of relevant) {
    // Apple Watch note: the 43-min deep-sleep correction is tracked for
    // recovery-quality scoring; for debt we always use totalSleepMinutes.
    const totalHours = record.totalSleepMinutes / 60;
    const nightlyDebt = sleepNeed - totalHours;
    rollingDebt += nightlyDebt;
  }

  // 3. Cap debt at +10h; surplus is uncapped (can go arbitrarily negative)
  const rollingHours = Math.min(rollingDebt, MAX_DEBT_HOURS);

  // 4. Bank hours: only meaningful when in surplus (negative rolling)
  const bankHours =
    rollingHours < 0 ? Math.min(MAX_BANK_HOURS, Math.abs(rollingHours)) : 0;

  // 5. Severity based on positive debt
  const severity = classifySeverity(rollingHours);

  // 6. Banking window
  const bankingWindowOpen = computeBankingWindowOpen(
    upcomingShifts,
    today,
    relevant,
    sleepNeed,
  );

  return { rollingHours, bankHours, severity, bankingWindowOpen };
}
