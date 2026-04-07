/**
 * Plan-vs-Reality Comparator — Phase 14
 *
 * Computes the delta between a planned sleep window (from plan-store)
 * and the actual sleep window read from HealthKit.
 *
 * All time deltas are in signed minutes:
 *   positive = later/more than planned
 *   negative = earlier/less than planned
 */

import { differenceInMinutes, format } from 'date-fns';
import type { SleepDiscrepancy } from './types';
import type { SleepWindow } from './healthkit-sleep-reader';

/** Planned sleep window (from a PlanBlock with type 'main-sleep') */
export interface PlannedSleepWindow {
  start: Date;
  end: Date;
}

/**
 * Compute the discrepancy between a planned sleep window and actual HealthKit data.
 *
 * @param dateISO - Calendar date of the night (yyyy-MM-dd)
 * @param planned - The planned sleep window from the circadian plan
 * @param actual - The HealthKit sleep window, or null if unavailable
 * @returns SleepDiscrepancy record with signed deltas
 */
export function computeDiscrepancy(
  dateISO: string,
  planned: PlannedSleepWindow,
  actual: SleepWindow | null,
): SleepDiscrepancy {
  const plannedDurationMinutes = differenceInMinutes(planned.end, planned.start);
  const plannedDurationHours = plannedDurationMinutes / 60;

  if (!actual) {
    return {
      dateISO,
      planned: {
        start: planned.start.toISOString(),
        end: planned.end.toISOString(),
        durationHours: plannedDurationHours,
      },
      actual: null,
      delta: null,
      source: 'healthkit',
      watchWorn: false,
    };
  }

  const actualDurationHours = actual.durationMinutes / 60;

  // Signed deltas: positive = later/more than planned
  const startMinutes = differenceInMinutes(actual.start, planned.start);
  const endMinutes = differenceInMinutes(actual.end, planned.end);
  const durationMinutes = actual.durationMinutes - plannedDurationMinutes;

  return {
    dateISO,
    planned: {
      start: planned.start.toISOString(),
      end: planned.end.toISOString(),
      durationHours: plannedDurationHours,
    },
    actual: {
      start: actual.start.toISOString(),
      end: actual.end.toISOString(),
      durationHours: actualDurationHours,
    },
    delta: {
      startMinutes,
      endMinutes,
      durationMinutes,
    },
    source: 'healthkit',
    watchWorn: actual.watchWorn,
  };
}

/**
 * Extract the planned sleep window for a given date from the plan's blocks.
 *
 * Looks for the main-sleep block matching the given date.
 * Returns null when no main-sleep block exists for that date (off-day, etc.)
 */
export function getPlannedSleepForDate(
  dateISO: string,
  blocks: Array<{ type: string; start: Date; end: Date }>,
): PlannedSleepWindow | null {
  // Find main-sleep blocks whose start date matches the dateISO
  const mainSleepBlocks = blocks.filter((b) => {
    if (b.type !== 'main-sleep') return false;
    // Use local date (date-fns format) to avoid UTC offset mismatch
    const blockDateISO = format(b.start, 'yyyy-MM-dd');
    // Account for sleep starting in the evening of the previous day
    const blockEndDateISO = format(b.end, 'yyyy-MM-dd');
    return blockDateISO === dateISO || blockEndDateISO === dateISO;
  });

  if (mainSleepBlocks.length === 0) {
    return null;
  }

  // If multiple blocks match (edge case), take the longest one
  const longest = mainSleepBlocks.reduce((best, b) => {
    const dur = differenceInMinutes(b.end, b.start);
    const bestDur = differenceInMinutes(best.end, best.start);
    return dur > bestDur ? b : best;
  });

  return { start: longest.start, end: longest.end };
}
