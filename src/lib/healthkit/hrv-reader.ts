/**
 * HRV Reader — reads overnight Heart Rate Variability (HRV) samples from HealthKit.
 *
 * Uses HKQuantityType heartRateVariabilitySDNN (RMSSD approximation reported by
 * Apple Watch). Filters for overnight readings (10 PM – 8 AM window) to capture
 * sleep-time HRV which is the most clinically meaningful signal.
 *
 * Scientific basis:
 * - Shaffer & Ginsberg (2017) — HRV as a biomarker of autonomic recovery
 * - Plews et al. (2013) — RMSSD as optimal HRV metric for athletes
 * - Apple Watch reports SDNN from HealthKit but the overnight average closely
 *   approximates RMSSD for circadian recovery assessment.
 *
 * References:
 * - Shaffer F, Ginsberg JP (2017) — An Overview of HRV Metrics and Norms
 * - Plews et al. (2013) — HRV and training
 */

import HealthKit, {
  QuantityTypeIdentifier as HKQuantityTypeIdentifier,
  StatisticsOptions as HKStatisticsOptions,
} from '@kingstinct/react-native-healthkit';
import { subDays, format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HRVReading {
  /** 'YYYY-MM-DD' representing the night (start of overnight window) */
  dateISO: string;
  /** Root mean square of successive differences in ms (RMSSD proxy) */
  rmssd: number;
  /** Resting heart rate in bpm during overnight window */
  heartRate: number;
  /** Respiratory rate in breaths/min (optional — not always available) */
  respiratoryRate?: number;
  /** Device name, e.g. 'Apple Watch Series 9' */
  source: string;
  /** ISO timestamp when this reading was recorded */
  timestamp: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Overnight window start hour (10 PM = 22) */
const OVERNIGHT_START_HOUR = 22;
/** Overnight window end hour (8 AM = 8, next day) */
const OVERNIGHT_END_HOUR = 8;

// ─── getOvernightHRV ──────────────────────────────────────────────────────────

/**
 * Get the overnight HRV reading for the given date.
 *
 * Queries HealthKit for HRV samples in the overnight window starting at
 * 10 PM on `date` through 8 AM the following morning.
 *
 * Returns null when:
 * - HealthKit is unavailable (simulator, iPad without entitlement)
 * - No Apple Watch data exists for the night
 * - The query fails
 *
 * @param date - The calendar date of the overnight (sleep starting that evening)
 */
export async function getOvernightHRV(date: Date): Promise<HRVReading | null> {
  try {
    const windowStart = new Date(date);
    windowStart.setHours(OVERNIGHT_START_HOUR, 0, 0, 0);

    const windowEnd = new Date(date);
    windowEnd.setDate(windowEnd.getDate() + 1);
    windowEnd.setHours(OVERNIGHT_END_HOUR, 0, 0, 0);

    // Query HRV samples (SDNN, Apple Watch's reported HRV metric)
    const hrvSamples = await HealthKit.queryQuantitySamples(
      HKQuantityTypeIdentifier.heartRateVariabilitySDNN,
      { from: windowStart, to: windowEnd },
    );

    if (!hrvSamples || hrvSamples.length === 0) {
      return null;
    }

    // Average all overnight HRV samples
    const totalRMSSD = hrvSamples.reduce(
      (sum: number, s: { quantity: number }) => sum + s.quantity,
      0,
    );
    const rmssd = totalRMSSD / hrvSamples.length;

    // Get average heart rate for the same window
    const hrStats = await HealthKit.queryStatisticsForQuantity(
      HKQuantityTypeIdentifier.heartRate,
      [HKStatisticsOptions.discreteAverage],
      windowStart,
      windowEnd,
    );
    const heartRate = hrStats?.averageQuantity?.quantity ?? 60;

    // Source from the first sample
    const firstSample = hrvSamples[0] as {
      sourceRevision?: { source?: { name?: string } };
      startDate: string | Date;
    };
    const source = firstSample.sourceRevision?.source?.name ?? 'Apple Watch';

    return {
      dateISO: format(date, 'yyyy-MM-dd'),
      rmssd: Math.round(rmssd * 10) / 10,
      heartRate: Math.round(heartRate),
      source,
      timestamp: new Date(firstSample.startDate).toISOString(),
    };
  } catch (error) {
    console.error('[HRVReader] Failed to read overnight HRV:', error);
    return null;
  }
}

// ─── getHRVBaseline ───────────────────────────────────────────────────────────

/**
 * Compute a rolling HRV baseline from the past N nights.
 *
 * Returns the mean and standard deviation of overnight RMSSD readings,
 * along with the count of valid readings found.
 *
 * Returns null when no readings are found at all.
 *
 * @param days - Number of nights to look back (default use: 14)
 */
export async function getHRVBaseline(
  days: number,
): Promise<{ meanRMSSD: number; stdRMSSD: number; readings: number } | null> {
  const readings: number[] = [];
  const today = new Date();

  for (let i = 1; i <= days; i++) {
    const night = subDays(today, i);
    const reading = await getOvernightHRV(night);
    if (reading !== null) {
      readings.push(reading.rmssd);
    }
  }

  if (readings.length === 0) {
    return null;
  }

  const mean = readings.reduce((s, v) => s + v, 0) / readings.length;
  const variance =
    readings.reduce((s, v) => s + (v - mean) ** 2, 0) / readings.length;
  const std = Math.sqrt(variance);

  return {
    meanRMSSD: Math.round(mean * 10) / 10,
    stdRMSSD: Math.round(std * 10) / 10,
    readings: readings.length,
  };
}
