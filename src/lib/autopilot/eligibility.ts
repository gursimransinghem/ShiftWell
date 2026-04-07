/**
 * Autopilot Eligibility Check — Phase 34 (30-Day Autopilot)
 *
 * Determines whether a user has accumulated enough data for autopilot to be
 * meaningful. Both conditions must be met:
 *   1. 30+ days since app install (installedAt)
 *   2. 20+ score records in the daily history
 *
 * This prevents premature autopilot activation on insufficient data, which
 * would produce unreliable adjustments.
 */

import { differenceInDays, parseISO } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EligibilityResult {
  eligible: boolean;
  daysInstalled: number;
  scoreRecords: number;
  /** Human-readable reason when not eligible. Undefined when eligible. */
  reason?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_DAYS_INSTALLED = 30;
const MIN_SCORE_RECORDS = 20;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Determine whether autopilot is eligible for the user.
 *
 * @param installedAt        - ISO date string when the app was first installed
 *                             (use trialStartedAt from premium-store as proxy)
 * @param scoreHistoryCount  - Count of finalized daily score records in score-store
 */
export function isEligibleForAutopilot(
  installedAt: string,
  scoreHistoryCount: number,
): EligibilityResult {
  let daysInstalled = 0;
  try {
    daysInstalled = differenceInDays(new Date(), parseISO(installedAt));
  } catch {
    // Malformed date — treat as day 0
    daysInstalled = 0;
  }

  const daysMet = daysInstalled >= MIN_DAYS_INSTALLED;
  const recordsMet = scoreHistoryCount >= MIN_SCORE_RECORDS;

  if (daysMet && recordsMet) {
    return {
      eligible: true,
      daysInstalled,
      scoreRecords: scoreHistoryCount,
    };
  }

  // Build a human-readable reason
  if (!daysMet && !recordsMet) {
    const daysLeft = MIN_DAYS_INSTALLED - daysInstalled;
    const recordsLeft = MIN_SCORE_RECORDS - scoreHistoryCount;
    return {
      eligible: false,
      daysInstalled,
      scoreRecords: scoreHistoryCount,
      reason: `Need ${daysLeft} more day${daysLeft !== 1 ? 's' : ''} and ${recordsLeft} more night${recordsLeft !== 1 ? 's' : ''} of data`,
    };
  }

  if (!daysMet) {
    const daysLeft = MIN_DAYS_INSTALLED - daysInstalled;
    return {
      eligible: false,
      daysInstalled,
      scoreRecords: scoreHistoryCount,
      reason: `Need ${daysLeft} more day${daysLeft !== 1 ? 's' : ''} before Autopilot can activate`,
    };
  }

  // !recordsMet
  const recordsLeft = MIN_SCORE_RECORDS - scoreHistoryCount;
  return {
    eligible: false,
    daysInstalled,
    scoreRecords: scoreHistoryCount,
    reason: `Need ${recordsLeft} more night${recordsLeft !== 1 ? 's' : ''} of data before Autopilot can activate`,
  };
}
