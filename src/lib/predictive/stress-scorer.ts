/**
 * Transition Stress Scorer — Phase 22
 *
 * Scores upcoming shift transitions by circadian stress level.
 * Scans the next 14 days and returns stress points for each detected transition.
 *
 * Scoring formula:
 *   Base score from transition type:
 *     day-to-night=60, night-to-day=40, evening-to-night=50,
 *     isolated-night=30, day-to-evening=20
 *   Modifiers:
 *     +20 if sleep debt > 3h
 *     +15 if consecutive nights > 3
 *     -10 per recovery day available
 *     +10 if < 48h between rotations
 *   Severity: 0–25=low, 26–50=medium, 51–75=high, 76–100=critical
 *
 * Scientific basis: NIOSH fatigue risk, Gander et al. (2011), St. Hilaire et al. (2017).
 */

import { addDays, differenceInHours } from 'date-fns';
import type { ShiftEvent, ShiftType } from '../circadian/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StressSeverity = 'low' | 'medium' | 'high' | 'critical';

export type TransitionType =
  | 'day-to-night'
  | 'night-to-day'
  | 'evening-to-night'
  | 'isolated-night'
  | 'day-to-evening';

export interface TransitionStressPoint {
  date: Date;
  transitionType: TransitionType;
  severity: StressSeverity;
  /** 0–100 stress score */
  score: number;
  /** Human-readable factors contributing to the score */
  factors: string[];
  /** Number of days from today until this transition */
  daysUntil: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_SCORES: Record<TransitionType, number> = {
  'day-to-night': 60,
  'night-to-day': 40,
  'evening-to-night': 50,
  'isolated-night': 30,
  'day-to-evening': 20,
};

const SCAN_DAYS = 14;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function severityFromScore(score: number): StressSeverity {
  if (score <= 25) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Detect the transition type between two consecutive shift types.
 * Returns null if no noteworthy transition.
 */
function detectTransitionType(
  prev: ShiftType | null,
  curr: ShiftType,
): TransitionType | null {
  if (curr === 'night' && prev === null) return 'isolated-night';
  if (curr === 'night' && prev === 'day') return 'day-to-night';
  if (curr === 'night' && prev === 'evening') return 'evening-to-night';
  if (curr === 'day' && prev === 'night') return 'night-to-day';
  if (curr === 'evening' && prev === 'day') return 'day-to-evening';
  return null;
}

/**
 * Count consecutive night shifts ending at (and including) the given index.
 */
function countConsecutiveNightsEndingAt(
  sorted: ShiftEvent[],
  index: number,
): number {
  let count = 1;
  for (let i = index - 1; i >= 0; i--) {
    if (sorted[i].shiftType !== 'night') break;
    count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Score transition stress for upcoming shifts over the next 14 days.
 *
 * @param shifts                All shifts (will be filtered to 14-day window)
 * @param debtHours             Current sleep debt in hours
 * @param recoveryDaysAvailable Number of off-days before the next transition
 * @param consecutiveNights     Number of current consecutive night shifts
 * @param today                 Reference date (defaults to now)
 */
export function scoreTransitionStress(
  shifts: ShiftEvent[],
  debtHours: number,
  recoveryDaysAvailable: number,
  consecutiveNights: number,
  today: Date = new Date(),
): TransitionStressPoint[] {
  const windowEnd = addDays(today, SCAN_DAYS);

  // Filter and sort shifts within the scan window
  const upcoming = shifts
    .filter((s) => s.start >= today && s.start <= windowEnd)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (upcoming.length === 0) return [];

  const stressPoints: TransitionStressPoint[] = [];

  for (let i = 0; i < upcoming.length; i++) {
    const curr = upcoming[i];
    const prev = i > 0 ? upcoming[i - 1] : null;
    const prevType = prev ? prev.shiftType : null;

    const transitionType = detectTransitionType(prevType, curr.shiftType);
    if (!transitionType) continue;

    const factors: string[] = [];
    let score = BASE_SCORES[transitionType];

    // Modifier: sleep debt
    if (debtHours > 3) {
      score += 20;
      factors.push(`Sleep debt ${debtHours.toFixed(1)}h (>${3}h threshold)`);
    }

    // Modifier: consecutive nights > 3
    const consec = countConsecutiveNightsEndingAt(upcoming, i);
    const effectiveConsec = Math.max(consecutiveNights, consec);
    if (effectiveConsec > 3) {
      score += 15;
      factors.push(`${effectiveConsec} consecutive nights (>${3} threshold)`);
    }

    // Modifier: recovery days (each off-day reduces stress by 10)
    if (recoveryDaysAvailable > 0) {
      const reduction = Math.min(recoveryDaysAvailable, 3) * 10;
      score -= reduction;
      factors.push(`${recoveryDaysAvailable} recovery day(s) available (-${reduction})`);
    }

    // Modifier: < 48h between rotations
    if (prev) {
      const hoursBetween = differenceInHours(curr.start, prev.end);
      if (hoursBetween < 48) {
        score += 10;
        factors.push(`Only ${hoursBetween}h between shifts (<48h threshold)`);
      }
    }

    score = clamp(score, 0, 100);

    const daysUntil = Math.floor(
      (curr.start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    stressPoints.push({
      date: curr.start,
      transitionType,
      severity: severityFromScore(score),
      score,
      factors,
      daysUntil,
    });
  }

  return stressPoints;
}
