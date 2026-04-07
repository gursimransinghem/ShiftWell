/**
 * Types for the sleep feedback pipeline (Phase 14).
 *
 * Captures the delta between planned sleep windows and actual
 * HealthKit-recorded sleep, enabling long-term adherence analysis
 * and adaptive algorithm improvement.
 */

export interface SleepDiscrepancy {
  /** Calendar date of the sleep night (yyyy-MM-dd) */
  dateISO: string;
  /** The planned sleep window from the circadian plan */
  planned: { start: string; end: string; durationHours: number };
  /**
   * The actual sleep window recorded by HealthKit.
   * Null when HealthKit is unavailable or no sleep was detected.
   */
  actual: { start: string; end: string; durationHours: number } | null;
  /**
   * Signed deltas relative to plan.
   * Positive = later/more than planned.
   * Null when actual is null.
   */
  delta: {
    /** How many minutes later/earlier sleep actually started vs planned */
    startMinutes: number;
    /** How many minutes later/earlier sleep actually ended vs planned */
    endMinutes: number;
    /** How many minutes more/less sleep was obtained vs planned */
    durationMinutes: number;
  } | null;
  /** Data source — healthkit for watch/phone, manual for user entry */
  source: 'healthkit' | 'manual';
  /** Whether the Apple Watch was worn during this sleep period */
  watchWorn: boolean;
}

export interface DiscrepancyHistory {
  /** All stored discrepancy records, oldest first */
  records: SleepDiscrepancy[];
  /** ISO timestamp of the last time records were updated */
  lastUpdated: string;
}
