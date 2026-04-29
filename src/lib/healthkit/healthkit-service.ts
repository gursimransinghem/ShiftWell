/**
 * HealthKit integration service for ShiftWell.
 *
 * Reads sleep data via Apple HealthKit to compare planned circadian schedules
 * against actual sleep behavior.
 *
 * Uses the @kingstinct/react-native-healthkit package which wraps
 * Apple's HKHealthStore API.
 *
 * Scientific context:
 * - Sleep stage classification follows AASM scoring rules (Berry et al., 2017):
 *   Wake, N1 (light), N2 (core), N3 (deep/SWS), REM.
 * - Apple Watch sleep staging maps to HKCategoryValueSleepAnalysis:
 *   inBed, asleepCore, asleepDeep, asleepREM, asleepUnspecified, awake.
 * - Sleep efficiency = total sleep time / time in bed * 100
 *   (Ohayon et al., 2017 — normal range 85-95% for healthy adults).
 *
 * References:
 * - Berry et al. (2017) — AASM Manual for Scoring of Sleep
 * - Ohayon et al. (2017) — National Sleep Foundation sleep quality recommendations
 * - de Zambotti et al. (2019) — Wearable sleep tracking validation
 */

import HealthKit, {
  CategoryTypeIdentifier as HKCategoryTypeIdentifier,
  CategoryValueSleepAnalysis as HKCategoryValueSleepAnalysis,
  QuantityTypeIdentifier as HKQuantityTypeIdentifier,
  StatisticsOptions as HKStatisticsOptions,
} from '@kingstinct/react-native-healthkit';
import { startOfDay, endOfDay, subHours, addHours, differenceInMinutes, subDays } from 'date-fns';

/** A single night's sleep record aggregated from HealthKit samples */
export interface SleepRecord {
  date: Date;
  inBedStart: Date | null;
  inBedEnd: Date | null;
  asleepStart: Date | null;
  asleepEnd: Date | null;
  totalSleepMinutes: number;
  deepSleepMinutes: number;
  remSleepMinutes: number;
  coreSleepMinutes: number;
  /** Percentage of time in bed actually asleep (normal: 85-95%) */
  sleepEfficiency: number;
  /** Device that recorded the data, e.g. 'Apple Watch', 'iPhone' */
  source: string;
}

/**
 * Request HealthKit authorization for sleep-related data.
 *
 * We request read-only access for TestFlight. If planned sleep writes or Sleep
 * Focus integration ship later, update HealthKit copy and permissions together.
 *
 * Heart rate read access is needed for sleeping heart rate analysis.
 */
export async function requestAuthorization(): Promise<boolean> {
  try {
    // Phase 14: Added biometric data types (HK-06 through HK-09)
    // Availability note: appleSleepingWristTemperature requires iOS 16+ and
    // Apple Watch Series 8+. Older devices will simply return no data for that
    // type — the authorization request succeeds regardless of device support.
    const result = await HealthKit.requestAuthorization(
      [
        HKCategoryTypeIdentifier.sleepAnalysis,
        HKQuantityTypeIdentifier.heartRate,
        HKQuantityTypeIdentifier.heartRateVariabilitySDNN,
        HKQuantityTypeIdentifier.restingHeartRate,
        HKQuantityTypeIdentifier.appleSleepingWristTemperature,
        HKQuantityTypeIdentifier.stepCount,
      ],
      [],
    );
    return result;
  } catch (error) {
    console.error('[HealthKit] Authorization request failed:', error);
    return false;
  }
}

/**
 * Check if HealthKit is available on this device.
 *
 * HealthKit is unavailable on iPads and simulators without
 * explicit entitlement.
 */
export async function isAvailable(): Promise<boolean> {
  try {
    return await HealthKit.isHealthDataAvailable();
  } catch {
    return false;
  }
}

/**
 * Read sleep analysis samples for a given night and aggregate
 * into a single SleepRecord.
 *
 * Apple stores sleep data as overlapping HKCategorySamples.
 * Each sample has a value indicating the sleep stage:
 * - inBed: user is in bed (may or may not be asleep)
 * - asleepCore: NREM N2 equivalent (largest portion of sleep)
 * - asleepDeep: NREM N3 / slow-wave sleep
 * - asleepREM: REM sleep
 * - asleepUnspecified: asleep but stage unknown (older devices)
 * - awake: detected wakefulness during the night
 *
 * We query from 6 PM on the target date to noon the next day
 * to capture both early sleepers and shift workers.
 *
 * @param date - The calendar date of the night (sleep starting evening)
 */
export async function getLastNightSleep(date: Date): Promise<SleepRecord | null> {
  const queryStart = subHours(endOfDay(date), 6); // 6 PM
  const queryEnd = addHours(startOfDay(date), 36); // noon next day

  try {
    const samples = await HealthKit.queryCategorySamples(
      HKCategoryTypeIdentifier.sleepAnalysis,
      { from: queryStart, to: queryEnd },
    );

    if (!samples || samples.length === 0) {
      return null;
    }

    return aggregateSleepSamples(date, samples);
  } catch (error) {
    console.error('[HealthKit] Failed to read sleep data:', error);
    return null;
  }
}

/**
 * Read sleep data for a date range.
 *
 * Returns one SleepRecord per night. Useful for weekly/monthly
 * trend analysis and accuracy scoring.
 *
 * @param startDate - First date in the range (inclusive)
 * @param endDate - Last date in the range (inclusive)
 */
export async function getSleepHistory(
  startDate: Date,
  endDate: Date,
): Promise<SleepRecord[]> {
  const records: SleepRecord[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const record = await getLastNightSleep(current);
    if (record) {
      records.push(record);
    }
    current.setDate(current.getDate() + 1);
  }

  return records;
}

/**
 * Read sleep records for the last N nights (for discrepancy history).
 * Returns up to 30 records. Uses asleepStart (not inBedStart) per Phase 13
 * research: asleepStart is more accurate for feedback timing (avoids
 * pre-sleep reading-in-bed latency skewing the deviation calculation).
 *
 * Returns empty array when HealthKit is unavailable — never throws.
 *
 * @param nights - Number of nights to look back (default: 30, max: 30)
 */
export async function getSleepHistoryForRange(nights: number = 30): Promise<SleepRecord[]> {
  const available = await isAvailable();
  if (!available) return [];

  const endDate = new Date();
  const startDate = subDays(endDate, Math.min(nights, 30));

  try {
    const records = await getSleepHistory(startDate, endDate);
    // Filter to records with asleepStart (required for feedback timing accuracy)
    return records.filter(r => r.asleepStart !== null);
  } catch {
    return [];
  }
}

/**
 * Write a planned sleep schedule to HealthKit.
 *
 * Writing sleep schedule samples to HealthKit triggers the iOS
 * Sleep Focus mode, which silences notifications and dims the
 * lock screen during the planned sleep window.
 *
 * This bridges the ShiftWell circadian algorithm with iOS system
 * behavior — the user's phone cooperates with the plan.
 *
 * @param bedtime - Planned bedtime
 * @param wakeTime - Planned wake time
 */
export async function writePlannedSleep(
  bedtime: Date,
  wakeTime: Date,
): Promise<boolean> {
  try {
    await HealthKit.saveCategorySample(
      HKCategoryTypeIdentifier.sleepAnalysis,
      HKCategoryValueSleepAnalysis.inBed,
      bedtime,
      wakeTime,
    );
    return true;
  } catch (error) {
    console.error('[HealthKit] Failed to write planned sleep:', error);
    return false;
  }
}

/**
 * Read average heart rate during the sleep window for a given night.
 *
 * Sleeping heart rate is a useful proxy for recovery quality:
 * - Lower sleeping HR correlates with better cardiovascular recovery.
 * - Elevated sleeping HR may indicate sleep debt, stress, or illness.
 *
 * Reference: Herzig et al. (2017) — Resting heart rate and sleep quality
 *
 * @param date - The calendar date of the night
 * @returns Average heart rate in BPM, or null if no data
 */
export async function getAverageSleepingHeartRate(
  date: Date,
): Promise<number | null> {
  const sleepRecord = await getLastNightSleep(date);
  if (!sleepRecord || !sleepRecord.asleepStart || !sleepRecord.asleepEnd) {
    return null;
  }

  try {
    const statistics = await HealthKit.queryStatisticsForQuantity(
      HKQuantityTypeIdentifier.heartRate,
      [HKStatisticsOptions.discreteAverage],
      sleepRecord.asleepStart,
      sleepRecord.asleepEnd,
    );

    return statistics?.averageQuantity?.quantity ?? null;
  } catch (error) {
    console.error('[HealthKit] Failed to read sleeping heart rate:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface SleepSample {
  startDate: string | Date;
  endDate: string | Date;
  value: number;
  sourceRevision?: { source?: { name?: string } };
}

/**
 * Aggregate raw HealthKit sleep samples into a single SleepRecord.
 *
 * Apple Watch generates multiple overlapping samples per night,
 * one per sleep stage. We merge them to produce a coherent record.
 */
function aggregateSleepSamples(
  date: Date,
  samples: SleepSample[],
): SleepRecord {
  let inBedStart: Date | null = null;
  let inBedEnd: Date | null = null;
  let asleepStart: Date | null = null;
  let asleepEnd: Date | null = null;

  let deepSleepMinutes = 0;
  let remSleepMinutes = 0;
  let coreSleepMinutes = 0;
  let unspecifiedSleepMinutes = 0;
  let source = 'Unknown';

  for (const sample of samples) {
    const sampleStart = new Date(sample.startDate);
    const sampleEnd = new Date(sample.endDate);
    const durationMinutes = differenceInMinutes(sampleEnd, sampleStart);

    // Track source from the first sample with a name
    if (sample.sourceRevision?.source?.name && source === 'Unknown') {
      source = sample.sourceRevision.source.name;
    }

    // Track overall in-bed window
    if (
      sample.value === HKCategoryValueSleepAnalysis.inBed ||
      isAsleepValue(sample.value)
    ) {
      if (!inBedStart || sampleStart < inBedStart) inBedStart = sampleStart;
      if (!inBedEnd || sampleEnd > inBedEnd) inBedEnd = sampleEnd;
    }

    // Track asleep window (excludes inBed-only and awake)
    if (isAsleepValue(sample.value)) {
      if (!asleepStart || sampleStart < asleepStart) asleepStart = sampleStart;
      if (!asleepEnd || sampleEnd > asleepEnd) asleepEnd = sampleEnd;
    }

    // Accumulate stage durations
    switch (sample.value) {
      case HKCategoryValueSleepAnalysis.asleepDeep:
        deepSleepMinutes += durationMinutes;
        break;
      case HKCategoryValueSleepAnalysis.asleepREM:
        remSleepMinutes += durationMinutes;
        break;
      case HKCategoryValueSleepAnalysis.asleepCore:
        coreSleepMinutes += durationMinutes;
        break;
      case HKCategoryValueSleepAnalysis.asleepUnspecified:
        unspecifiedSleepMinutes += durationMinutes;
        break;
    }
  }

  const totalSleepMinutes =
    deepSleepMinutes + remSleepMinutes + coreSleepMinutes + unspecifiedSleepMinutes;

  // Sleep efficiency: time asleep / time in bed * 100
  const timeInBedMinutes =
    inBedStart && inBedEnd ? differenceInMinutes(inBedEnd, inBedStart) : 0;
  const sleepEfficiency =
    timeInBedMinutes > 0
      ? Math.round((totalSleepMinutes / timeInBedMinutes) * 100)
      : 0;

  return {
    date,
    inBedStart,
    inBedEnd,
    asleepStart,
    asleepEnd,
    totalSleepMinutes,
    deepSleepMinutes,
    remSleepMinutes,
    coreSleepMinutes,
    sleepEfficiency,
    source,
  };
}

/** Check if a HKCategoryValueSleepAnalysis value represents an asleep stage */
function isAsleepValue(value: number): boolean {
  return (
    value === HKCategoryValueSleepAnalysis.asleepCore ||
    value === HKCategoryValueSleepAnalysis.asleepDeep ||
    value === HKCategoryValueSleepAnalysis.asleepREM ||
    value === HKCategoryValueSleepAnalysis.asleepUnspecified
  );
}
