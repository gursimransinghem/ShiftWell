/**
 * ShiftWell HealthKit Integration — Public API
 *
 * This module bridges Apple HealthKit sleep data with the ShiftWell
 * circadian algorithm, enabling a closed feedback loop:
 *
 *   Plan (circadian algorithm) → Execute (user sleeps) → Measure (HealthKit) → Score (accuracy)
 *
 * Modules:
 * - healthkit-service: Core HealthKit read/write operations
 * - sleep-comparison: Compare planned vs actual sleep for a single night
 * - accuracy-score: Aggregate adherence scoring and trend analysis
 */

// --- HealthKit Service ---
export {
  requestAuthorization,
  isAvailable,
  getLastNightSleep,
  getSleepHistory,
  writePlannedSleep,
  getAverageSleepingHeartRate,
} from './healthkit-service';

export type { SleepRecord } from './healthkit-service';

// --- Sleep Comparison ---
export { comparePlannedVsActual } from './sleep-comparison';

export type { SleepComparison } from './sleep-comparison';

// --- Accuracy Score ---
export {
  calculateAccuracy,
  calculateWeeklyAccuracy,
  generateInsight,
} from './accuracy-score';

export type { PlanAccuracy } from './accuracy-score';

// --- Sleep Focus (WritePlannedSleep) ---
export { writePlannedSleepWindows } from './sleep-focus';
