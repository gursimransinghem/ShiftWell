/**
 * Watch Complication Data
 *
 * Computes the data model for an Apple Watch complication. This is pure
 * TypeScript logic — no actual WatchKit integration (requires Apple Developer
 * enrollment). The data model is designed to be passed to a future WatchKit
 * extension via Watch Connectivity.
 *
 * Complication slots:
 * - shiftCountdown: hours/minutes until next shift (or null when no shift today)
 * - sleepStatus: current phase in the sleep/wake cycle
 * - recoveryScore: last night's computed recovery score (0-100 or null)
 * - nextAction: short string for the complication subtitle
 */

import type { SleepPlan, ShiftEvent } from '../circadian/types';
import { differenceInMinutes } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComplicationData {
  /** Countdown to the next shift start, or null when no upcoming shift today */
  shiftCountdown: { hours: number; minutes: number; label: string } | null;
  /** Current phase in the circadian cycle */
  sleepStatus: 'awake' | 'wind-down' | 'sleeping' | 'recovery';
  /** Last night's recovery score (0-100), or null if not yet computed */
  recoveryScore: number | null;
  /** Short action label for the complication subtitle */
  nextAction: string;
}

// ─── buildComplicationData ────────────────────────────────────────────────────

/**
 * Build the complication data model from current app state.
 *
 * @param plan          - The active sleep plan (may be null before first generation)
 * @param shifts        - All shift events (used to find next upcoming shift)
 * @param recoveryScore - Last night's recovery score (null if unavailable)
 * @param now           - The current moment (injectable for testing)
 */
export function buildComplicationData(
  plan: SleepPlan | null,
  shifts: ShiftEvent[],
  recoveryScore: number | null,
  now: Date,
): ComplicationData {
  const sleepStatus = computeSleepStatus(plan, now);
  const shiftCountdown = computeShiftCountdown(shifts, now);
  const nextAction = computeNextAction(plan, shifts, now, sleepStatus);

  return {
    shiftCountdown,
    sleepStatus,
    recoveryScore,
    nextAction,
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Determine the current sleep status from the active plan.
 *
 * - sleeping: inside a main-sleep or nap block
 * - wind-down: inside a wind-down block
 * - recovery: first 2 hours after a main-sleep block ends
 * - awake: all other times
 */
function computeSleepStatus(
  plan: SleepPlan | null,
  now: Date,
): ComplicationData['sleepStatus'] {
  if (!plan) return 'awake';

  for (const block of plan.blocks) {
    const blockStart = new Date(block.start);
    const blockEnd = new Date(block.end);

    if (now >= blockStart && now <= blockEnd) {
      if (block.type === 'main-sleep' || block.type === 'nap') {
        return 'sleeping';
      }
      if (block.type === 'wind-down') {
        return 'wind-down';
      }
    }

    // Recovery window: 0-120 min after a main-sleep block ends
    if (block.type === 'main-sleep' && now > blockEnd) {
      const minutesSinceWake = differenceInMinutes(now, blockEnd);
      if (minutesSinceWake <= 120) {
        return 'recovery';
      }
    }
  }

  return 'awake';
}

/**
 * Find the next upcoming shift and compute countdown hours/minutes.
 * Returns null when no shifts are within the next 48 hours.
 */
function computeShiftCountdown(
  shifts: ShiftEvent[],
  now: Date,
): ComplicationData['shiftCountdown'] {
  const upcoming = shifts
    .filter((s) => new Date(s.start) > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const minutesUntil = differenceInMinutes(new Date(next.start), now);

  // Only show countdown for shifts within 48 hours
  if (minutesUntil > 48 * 60) return null;

  const hours = Math.floor(minutesUntil / 60);
  const minutes = minutesUntil % 60;

  return {
    hours,
    minutes,
    label: next.title,
  };
}

/**
 * Generate the short next-action label for the complication subtitle.
 *
 * Priority:
 * 1. Upcoming shift within 12 hours → "Shift in Xh Ym"
 * 2. Next plan block → "Bedtime in Xh" / "Wind-down in Xm"
 * 3. No upcoming action → "No shifts today"
 */
function computeNextAction(
  plan: SleepPlan | null,
  shifts: ShiftEvent[],
  now: Date,
  currentStatus: ComplicationData['sleepStatus'],
): string {
  if (currentStatus === 'sleeping') return 'Currently sleeping';
  if (currentStatus === 'wind-down') return 'Wind-down in progress';
  if (currentStatus === 'recovery') return 'Recovery window';

  // Check for upcoming shift within 12 hours
  const upcoming = shifts
    .filter((s) => new Date(s.start) > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  if (upcoming.length > 0) {
    const minutesUntil = differenceInMinutes(new Date(upcoming[0].start), now);
    if (minutesUntil <= 12 * 60) {
      const h = Math.floor(minutesUntil / 60);
      const m = minutesUntil % 60;
      return h > 0 ? `Shift starts in ${h}h ${m}m` : `Shift starts in ${m}m`;
    }
  }

  // Check for next relevant plan block
  if (plan) {
    const upcomingBlocks = plan.blocks
      .filter(
        (b) =>
          new Date(b.start) > now &&
          (b.type === 'main-sleep' || b.type === 'wind-down' || b.type === 'nap'),
      )
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    if (upcomingBlocks.length > 0) {
      const next = upcomingBlocks[0];
      const minutesUntil = differenceInMinutes(new Date(next.start), now);
      const h = Math.floor(minutesUntil / 60);
      const m = minutesUntil % 60;
      const label =
        next.type === 'wind-down'
          ? 'Wind-down'
          : next.type === 'nap'
          ? 'Nap'
          : 'Bedtime';
      return h > 0 ? `${label} in ${h}h ${m}m` : `${label} in ${m}m`;
    }
  }

  return 'No shifts today';
}
