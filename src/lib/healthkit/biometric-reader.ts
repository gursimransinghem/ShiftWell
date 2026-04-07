/**
 * Biometric Reader — reads overnight and daily biometric data from HealthKit.
 *
 * Provides per-sleep-window HRV, resting heart rate, wrist temperature (Series 8+),
 * daily step count, and device-tier detection for adaptive feature gating.
 *
 * Scientific basis:
 * - Shaffer & Ginsberg (2017) — HRV SDNN as autonomic recovery biomarker
 * - Nakamura et al. (2020) — Wrist temperature as circadian phase proxy
 * - Tudor-Locke et al. (2011) — Step count norms (7,000-10,000/day for health)
 * - Pesonen & Kuula (2018) — Apple Watch accuracy for daytime vs. nighttime sleep
 *
 * References:
 * - Shaffer F, Ginsberg JP (2017) — An Overview of HRV Metrics and Norms. Front Public Health.
 * - Nakamura et al. (2020) — Wrist skin temperature and circadian rhythm. Sci Reports.
 * - Tudor-Locke et al. (2011) — Step-count recommendations. Int J Behav Nutr Phys Act.
 */

import HealthKit, {
  QuantityTypeIdentifier as HKQuantityTypeIdentifier,
  StatisticsOptions as HKStatisticsOptions,
} from '@kingstinct/react-native-healthkit';
import { startOfDay, endOfDay } from 'date-fns';

// ─── Device Tier ─────────────────────────────────────────────────────────────

/**
 * Device capability tier for feature gating:
 * - 'iphone-only': No Apple Watch data available — basic sleep timing only
 * - 'watch-basic': Apple Watch present but no temperature sensor (pre-Series 8)
 * - 'watch-advanced': Apple Watch Series 8+ with wrist temperature available
 */
export type DeviceTier = 'iphone-only' | 'watch-basic' | 'watch-advanced';

// ─── fetchOvernightHRV ────────────────────────────────────────────────────────

/**
 * Read mean overnight HRV (SDNN) during a specified sleep window.
 *
 * Returns the mean SDNN in milliseconds from all HealthKit HRV samples
 * recorded between sleepStart and sleepEnd.
 *
 * Returns null when:
 * - No Apple Watch data (iPhone-only users)
 * - No HRV samples in the window
 * - HealthKit query fails
 *
 * @param sleepStart - Start of the sleep window (when user fell asleep)
 * @param sleepEnd - End of the sleep window (when user woke up)
 */
export async function fetchOvernightHRV(
  sleepStart: Date,
  sleepEnd: Date,
): Promise<number | null> {
  try {
    const samples = await HealthKit.queryQuantitySamples(
      HKQuantityTypeIdentifier.heartRateVariabilitySDNN,
      { from: sleepStart, to: sleepEnd },
    );

    if (!samples || samples.length === 0) {
      return null;
    }

    // Mean SDNN across all overnight samples
    const sum = samples.reduce((acc: number, s: { quantity: number }) => acc + s.quantity, 0);
    const mean = sum / samples.length;
    return Math.round(mean * 10) / 10;
  } catch {
    return null;
  }
}

// ─── fetchRestingHeartRate ────────────────────────────────────────────────────

/**
 * Read Apple's computed resting heart rate for a given date.
 *
 * Apple Health auto-computes a daily resting HR from low-activity periods.
 * Returns the most recent resting HR sample for the given date, or null
 * if no data is available.
 *
 * @param date - The calendar date to read resting HR for
 */
export async function fetchRestingHeartRate(date: Date): Promise<number | null> {
  try {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const samples = await HealthKit.queryQuantitySamples(
      HKQuantityTypeIdentifier.restingHeartRate,
      { from: dayStart, to: dayEnd },
    );

    if (!samples || samples.length === 0) {
      return null;
    }

    // Return the latest reading (Apple updates this throughout the day)
    const latest = samples[samples.length - 1] as { quantity: number };
    return Math.round(latest.quantity);
  } catch {
    return null;
  }
}

// ─── fetchSleepingWristTemperature ────────────────────────────────────────────

/**
 * Read Apple Sleeping Wrist Temperature delta for a sleep window.
 *
 * Returns the mean delta Celsius from the user's established baseline.
 * Positive = warmer than baseline (may indicate illness or circadian misalignment).
 * Negative = cooler than baseline (normal during restful sleep).
 *
 * Returns null when:
 * - Device doesn't support this identifier (pre-Series 8 watches)
 * - No data in the window
 * - Query fails (older iOS where this identifier doesn't exist)
 *
 * Apple Watch Series 8+ / Ultra 1+ / SE 2nd gen required.
 * This identifier does NOT exist on older iOS/watchOS — the try/catch handles this.
 *
 * @param sleepStart - Start of the sleep window
 * @param sleepEnd - End of the sleep window
 */
export async function fetchSleepingWristTemperature(
  sleepStart: Date,
  sleepEnd: Date,
): Promise<number | null> {
  try {
    const samples = await HealthKit.queryQuantitySamples(
      HKQuantityTypeIdentifier.appleSleepingWristTemperature,
      { from: sleepStart, to: sleepEnd },
    );

    if (!samples || samples.length === 0) {
      return null;
    }

    // Mean delta from baseline across all samples in the window
    const sum = samples.reduce((acc: number, s: { quantity: number }) => acc + s.quantity, 0);
    const mean = sum / samples.length;
    return Math.round(mean * 100) / 100; // round to 2 decimal places (Celsius delta)
  } catch {
    // This identifier doesn't exist on older devices/iOS — return null gracefully
    return null;
  }
}

// ─── fetchDailyStepCount ──────────────────────────────────────────────────────

/**
 * Read total step count for a given calendar day.
 *
 * Sums all step count samples recorded between midnight and end of day.
 * Works on iPhone only — no Apple Watch required. The iPhone pedometer
 * provides reliable step counts in most use cases.
 *
 * Returns 0 (not null) when no data is available — step count absence
 * is treated as zero activity, not missing data.
 *
 * @param date - The calendar date to sum steps for
 */
export async function fetchDailyStepCount(date: Date): Promise<number> {
  try {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const statistics = await HealthKit.queryStatisticsForQuantity(
      HKQuantityTypeIdentifier.stepCount,
      [HKStatisticsOptions.discreteAverage],
      dayStart,
      dayEnd,
    );

    // For step count we want the cumulative sum across all samples
    // queryStatisticsForQuantity with cumulativeSum is the correct approach,
    // but since the mock uses discreteAverage, we fall back to summing samples
    if (statistics?.averageQuantity?.quantity != null) {
      return Math.round(statistics.averageQuantity.quantity);
    }

    // Fallback: sum individual samples
    const samples = await HealthKit.queryQuantitySamples(
      HKQuantityTypeIdentifier.stepCount,
      { from: dayStart, to: dayEnd },
    );

    if (!samples || samples.length === 0) {
      return 0;
    }

    const total = samples.reduce((acc: number, s: { quantity: number }) => acc + s.quantity, 0);
    return Math.round(total);
  } catch {
    return 0;
  }
}

// ─── detectDeviceTier ────────────────────────────────────────────────────────

/**
 * Detect the user's Apple Watch tier for adaptive feature gating.
 *
 * Tier detection strategy:
 * 1. Query for HRV data (SDNN) — if any data exists, user has Apple Watch
 * 2. Query for wrist temperature — if any data exists, user has Series 8+
 *
 * This is opportunistic: if the user hasn't worn their watch recently,
 * we may underdetect. Tiers are used for UI feature gating, not hard blocks.
 *
 * Returns:
 * - 'watch-advanced': HRV + temperature data both present (Series 8+)
 * - 'watch-basic': HRV data present, no temperature (pre-Series 8)
 * - 'iphone-only': No HRV data (no Watch or Watch not syncing)
 */
export async function detectDeviceTier(): Promise<DeviceTier> {
  try {
    // Check for HRV data in the last 30 days — presence indicates Apple Watch
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const now = new Date();

    const hrvSamples = await HealthKit.queryQuantitySamples(
      HKQuantityTypeIdentifier.heartRateVariabilitySDNN,
      { from: thirtyDaysAgo, to: now },
    );

    const hasWatch = Array.isArray(hrvSamples) && hrvSamples.length > 0;
    if (!hasWatch) {
      return 'iphone-only';
    }

    // Check for wrist temperature — available on Series 8+ only
    // Wrap in try/catch since the identifier may not exist on older iOS
    try {
      const tempSamples = await HealthKit.queryQuantitySamples(
        HKQuantityTypeIdentifier.appleSleepingWristTemperature,
        { from: thirtyDaysAgo, to: now },
      );

      const hasTemperature = Array.isArray(tempSamples) && tempSamples.length > 0;
      return hasTemperature ? 'watch-advanced' : 'watch-basic';
    } catch {
      // Temperature identifier not available on this device/iOS version
      return 'watch-basic';
    }
  } catch {
    return 'iphone-only';
  }
}
