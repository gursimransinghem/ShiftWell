/**
 * HealthKit Sleep Reader — Phase 14
 *
 * Reads HealthKit sleep samples for a date range and filters to
 * "main sleep" sessions (longest continuous block per night, ignoring
 * naps shorter than 90 minutes).
 *
 * Mirrors the patterns in src/lib/healthkit/healthkit-service.ts.
 */

import { differenceInMinutes, subHours, addHours, endOfDay, startOfDay } from 'date-fns';
import { isAvailable, getLastNightSleep } from '../healthkit/healthkit-service';
import type { SleepRecord } from '../healthkit/healthkit-service';

/** Minimum duration in minutes to be considered "main sleep" (not a nap) */
const MIN_MAIN_SLEEP_MINUTES = 90;

/**
 * A simplified sleep window record for the feedback pipeline.
 * Contains only the start, end, duration, and source metadata
 * needed by the comparator.
 */
export interface SleepWindow {
  start: Date;
  end: Date;
  durationMinutes: number;
  /** Whether the reading came from an Apple Watch (watch was worn) */
  watchWorn: boolean;
  /** Device that recorded the data */
  source: string;
}

/**
 * Read the main sleep window for a given night from HealthKit.
 *
 * "Main sleep" is defined as the longest continuous asleep session
 * on the night. Naps < 90 min are excluded.
 *
 * @param date - Calendar date of the night (sleep starting that evening)
 * @returns SleepWindow when HealthKit data is available, null otherwise
 */
export async function readMainSleepForNight(date: Date): Promise<SleepWindow | null> {
  try {
    const available = await isAvailable();
    if (!available) {
      return null;
    }

    const record = await getLastNightSleep(date);
    if (!record) {
      return null;
    }

    return sleepRecordToWindow(record);
  } catch (error) {
    console.error('[HealthKitSleepReader] Failed to read sleep:', error);
    return null;
  }
}

/**
 * Read main sleep windows for a range of dates.
 *
 * Returns one entry per night that has qualifying sleep data.
 * Nights with no data (no watch, permissions denied) are omitted.
 *
 * @param startDate - First date in the range (inclusive)
 * @param endDate - Last date in the range (inclusive)
 * @returns Map of dateISO -> SleepWindow
 */
export async function readSleepWindowsForRange(
  startDate: Date,
  endDate: Date,
): Promise<Map<string, SleepWindow>> {
  const results = new Map<string, SleepWindow>();

  try {
    const available = await isAvailable();
    if (!available) {
      return results;
    }

    const current = new Date(startDate);
    while (current <= endDate) {
      const dateISO = current.toISOString().slice(0, 10);
      const window = await readMainSleepForNight(new Date(current));
      if (window) {
        results.set(dateISO, window);
      }
      current.setDate(current.getDate() + 1);
    }
  } catch (error) {
    console.error('[HealthKitSleepReader] Failed to read sleep range:', error);
  }

  return results;
}

/**
 * Check if sleep was recorded for a given date at all.
 * Used to distinguish "watch not worn" from "user did not sleep".
 */
export async function hasSleepDataForNight(date: Date): Promise<boolean> {
  try {
    const available = await isAvailable();
    if (!available) return false;

    const record = await getLastNightSleep(date);
    return record !== null && record.totalSleepMinutes > 0;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Convert a SleepRecord from the HealthKit service into a SleepWindow.
 *
 * Returns null when the record has no qualifying asleep window,
 * or the total sleep is below the minimum threshold (nap detection).
 */
function sleepRecordToWindow(record: SleepRecord): SleepWindow | null {
  const { asleepStart, asleepEnd, totalSleepMinutes, source } = record;

  // Must have actual asleep timestamps (not just inBed) and exceed the nap threshold
  if (!asleepStart || !asleepEnd) {
    return null;
  }

  if (totalSleepMinutes < MIN_MAIN_SLEEP_MINUTES) {
    return null;
  }

  // Apple Watch devices contain "Watch" in source name
  const watchWorn = source.toLowerCase().includes('watch');

  return {
    start: asleepStart,
    end: asleepEnd,
    durationMinutes: totalSleepMinutes,
    watchWorn,
    source,
  };
}
