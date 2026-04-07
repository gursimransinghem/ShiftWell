/**
 * Timezone & Daylight Saving Time Handler — ShiftWell
 *
 * Detects DST transitions and timezone changes within a lookahead window,
 * then adjusts sleep plan blocks to account for the clock shift.
 *
 * Scientific basis:
 * - Kantermann et al. (2007) — DST spring-forward costs ~40 min of social
 *   jetlag; fall-back is generally better tolerated
 * - Harrison (2013) — DST transitions correlate with increased workplace
 *   injuries, traffic accidents, and cardiac events in the week following
 *   spring-forward
 * - Circadian adaptation to 1h shift takes ~5-7 days (Eastman & Burgess 2009)
 *
 * Implementation notes:
 * - Uses Intl.DateTimeFormat().resolvedOptions().timeZone for local timezone
 * - Compares UTC offsets across days to detect when clocks change
 * - Does NOT depend on any timezone database library — pure V8/Hermes intrinsics
 */

import type { PlanBlock } from './types';

// ─── Public types ──────────────────────────────────────────────────────────────

export interface TimezoneAdjustment {
  /** 'dst-spring' = clocks forward, 'dst-fall' = clocks back, 'timezone-change' = manual zone change */
  type: 'dst-spring' | 'dst-fall' | 'timezone-change';
  /** Amount clocks move: positive = forward (spring), negative = back (fall). In minutes. */
  shiftMinutes: number;
  /** The date on which the clock change occurs */
  date: Date;
  /** Human-readable guidance for the user */
  recommendation: string;
}

// ─── detectTimezoneChanges ────────────────────────────────────────────────────

/**
 * Detect DST transitions (or timezone changes) occurring within a lookahead
 * window starting from today.
 *
 * Algorithm:
 * 1. Determine the local timezone via Intl.DateTimeFormat
 * 2. For each day in [today, today + lookaheadDays), compute the UTC offset
 *    at noon (avoids DST boundary edge cases from midnight checks)
 * 3. When the offset changes between day N and day N+1, record the transition
 *
 * Returns an array sorted by date ascending (earliest transition first).
 *
 * @param today - Reference date (caller-supplied for testability)
 * @param lookaheadDays - How many days to scan ahead (e.g. 30)
 */
export function detectTimezoneChanges(
  today: Date,
  lookaheadDays: number,
): TimezoneAdjustment[] {
  const adjustments: TimezoneAdjustment[] = [];

  // Compute UTC offset for a given date at noon local time.
  // We use noon to avoid ambiguity at the DST boundary itself.
  const getOffsetMinutes = (date: Date): number => {
    // Build a "noon on this calendar date" by using Date's local methods
    const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
    // UTC offset = (local time) - (UTC time). getTimezoneOffset() returns
    // the negative of this in minutes — we invert for clarity.
    return -noon.getTimezoneOffset();
  };

  let prevOffset = getOffsetMinutes(today);

  for (let i = 1; i <= lookaheadDays; i++) {
    const checkDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + i,
    );
    const currentOffset = getOffsetMinutes(checkDate);

    if (currentOffset !== prevOffset) {
      const shiftMinutes = currentOffset - prevOffset;
      const type = classifyTransitionType(shiftMinutes);
      const recommendation = buildRecommendation(type, shiftMinutes, checkDate);

      adjustments.push({
        type,
        shiftMinutes,
        date: checkDate,
        recommendation,
      });
    }

    prevOffset = currentOffset;
  }

  return adjustments;
}

// ─── adjustPlanForDST ─────────────────────────────────────────────────────────

/**
 * Shift all plan block times by the DST delta.
 *
 * Spring forward (+60 min): sleep window effectively shrinks by 1 hour.
 *   The plan times shift forward, which means you'd go to bed 1h "later"
 *   by the new clock. Recommendation is to start the sleep wind-down
 *   earlier to preserve total sleep time.
 *
 * Fall back (-60 min): sleep window gains 1 hour.
 *   The plan times shift back. Recommendation is to maintain consistency
 *   rather than using the extra hour for later bedtime.
 *
 * Each block's start and end are shifted by adjustment.shiftMinutes.
 * The block IDs and all other fields are preserved unchanged.
 *
 * @param planBlocks - The sleep plan blocks to adjust
 * @param adjustment - The DST/timezone change to apply
 * @returns New array of PlanBlocks with shifted times
 */
export function adjustPlanForDST(
  planBlocks: PlanBlock[],
  adjustment: TimezoneAdjustment,
): PlanBlock[] {
  const shiftMs = adjustment.shiftMinutes * 60 * 1000;

  return planBlocks.map((block) => ({
    ...block,
    start: new Date(block.start.getTime() + shiftMs),
    end: new Date(block.end.getTime() + shiftMs),
  }));
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Classify a clock shift (in minutes) into a transition type.
 * ±60 is the typical DST amount; other values indicate a manual timezone change.
 */
function classifyTransitionType(
  shiftMinutes: number,
): TimezoneAdjustment['type'] {
  if (shiftMinutes > 0 && Math.abs(shiftMinutes) <= 60) return 'dst-spring';
  if (shiftMinutes < 0 && Math.abs(shiftMinutes) <= 60) return 'dst-fall';
  return 'timezone-change';
}

/**
 * Build a human-readable recommendation for a DST or timezone transition.
 *
 * References:
 * - Kantermann et al. (2007) — spring-forward impact on social jetlag
 * - Harrison (2013) — increased adverse events following spring-forward
 */
function buildRecommendation(
  type: TimezoneAdjustment['type'],
  shiftMinutes: number,
  date: Date,
): string {
  const dateStr = formatDateStr(date);
  const absMin = Math.abs(shiftMinutes);
  const absHours = absMin / 60;

  switch (type) {
    case 'dst-spring':
      return (
        `Clocks spring forward ${absHours}h on ${dateStr}. ` +
        `Your sleep window shrinks by ${absHours}h. ` +
        `Start your sleep wind-down ${absHours}h earlier the evening before ` +
        `to protect total sleep time. ` +
        `(Kantermann et al. 2007: spring-forward increases social jetlag ~40 min on average)`
      );

    case 'dst-fall':
      return (
        `Clocks fall back ${absHours}h on ${dateStr}. ` +
        `Your sleep window gains ${absHours}h. ` +
        `Maintain your usual sleep schedule — do not shift bedtime later. ` +
        `Consistency preserves circadian stability (Eastman & Burgess 2009).`
      );

    case 'timezone-change':
      if (shiftMinutes > 0) {
        return (
          `Timezone changes forward ${absMin} min on ${dateStr}. ` +
          `Shift bedtime ${absMin} min earlier over 2-3 nights to re-entrain.`
        );
      }
      return (
        `Timezone changes back ${absMin} min on ${dateStr}. ` +
        `Gradually shift bedtime ${absMin} min later over 2-3 nights to re-entrain.`
      );
  }
}

/** Format a Date as "Month Day, Year" (locale-independent) */
function formatDateStr(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
