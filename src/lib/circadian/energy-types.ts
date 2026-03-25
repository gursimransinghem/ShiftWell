/**
 * Types for the Borbely Two-Process Energy Model.
 *
 * These types are used by energy-model.ts to represent hourly alertness
 * predictions. They mirror the Python data classes in ULOS (models/energy.py)
 * but are adapted for TypeScript and ShiftWell's conventions.
 */

import type { ShiftType } from './types';

// ─── Output types ─────────────────────────────────────────────────────────────

/**
 * Energy zone label derived from score.
 * Matches ULOS energy zone thresholds: HIGH ≥ 70, MODERATE ≥ 50, LOW ≥ 30.
 */
export type EnergyLabel = 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';

/**
 * Energy prediction for a single point in time.
 *
 * Each field in `components` is stored separately so the UI can show
 * "why" the score is what it is — e.g., "High sleep pressure is dragging
 * your score down despite a good circadian signal."
 */
export interface EnergyPrediction {
  /** The datetime of this prediction */
  time: Date;
  /** Alertness score 0–100 (higher = more alert) */
  score: number;
  /** Zone label derived from score thresholds */
  label: EnergyLabel;
  /** Individual components that contributed to the score */
  components: {
    /** Process C: circadian signal, roughly –0.35 to +0.35 */
    circadian: number;
    /** Process S: homeostatic sleep pressure, 0 to 1.0 (applied as negative) */
    sleepPressure: number;
    /** Recovery modifier, roughly –0.3 to +0.3 */
    recovery: number;
    /** Caffeine boost, 0 to ~0.2 */
    caffeine: number;
  };
}

/**
 * Full energy prediction curve from wake to sleep.
 * Contains one EnergyPrediction per resolution step (default: hourly).
 */
export interface EnergyCurve {
  /** Ordered predictions from wakeTime to sleepTime */
  predictions: EnergyPrediction[];
  /** The wakeTime used to generate this curve */
  wakeTime: Date;
  /** The targetSleepTime used to generate this curve */
  sleepTime: Date;
  /** Time of the highest-scoring prediction (null if no predictions) */
  peakTime: Date | null;
  /** Time of the lowest-scoring prediction (null if no predictions) */
  troughTime: Date | null;
  /** Mean score across all predictions */
  averageScore: number;
  /** Highest score in the curve */
  peakScore: number;
}

// ─── Input types ──────────────────────────────────────────────────────────────

/**
 * A single caffeine consumption event.
 * Caffeine decays exponentially with an individual-specific half-life (~5h average).
 */
export interface CaffeineEntry {
  /** When the dose was consumed */
  consumedAt: Date;
  /**
   * Caffeine amount in mg.
   * Rough reference: 1 cup drip coffee ≈ 95mg, espresso ≈ 63mg,
   * energy drink (8 oz) ≈ 80mg, green tea ≈ 28mg.
   */
  doseMg: number;
}

/**
 * All inputs needed to generate an energy prediction curve.
 */
export interface EnergyModelInput {
  /** When the person woke up (or will wake up) */
  wakeTime: Date;
  /** Planned bedtime */
  targetSleepTime: Date;
  /**
   * Recovery score 0–100.
   * Can come from WHOOP recovery, HealthKit-estimated HRV, or manual entry.
   * A score of 50 is neutral — no modifier applied.
   */
  recoveryScore: number;
  /** Actual sleep hours achieved last night (used to calculate sleep debt) */
  sleepHoursLastNight: number;
  /** Caffeine doses consumed today (optional — omit if none taken) */
  caffeineEntries?: CaffeineEntry[];
  /**
   * Type of shift being worked today.
   * Affects the circadian acrophase estimate (night shifts partially shift
   * the alertness peak). If omitted, defaults to day-oriented scheduling.
   */
  shiftType?: ShiftType;
  /**
   * How often to generate a prediction, in minutes.
   * Default: 60 (hourly). Use 30 for finer resolution.
   */
  resolutionMinutes?: number;
}
