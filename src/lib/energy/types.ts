/**
 * Types for the simplified Energy Curve Engine.
 *
 * This module provides a 24-value hourly interface (0-23) that wraps the
 * Borbely Two-Process Model implementation in src/lib/circadian/energy-model.ts.
 *
 * The circadian energy-model.ts uses time-range-based prediction (wakeTime to
 * sleepTime). This wrapper provides a simpler hour-indexed interface for
 * use in the Today screen, notification scheduling, and HK-based coaching.
 */

/**
 * Energy prediction for a specific hour of the day (0-23).
 */
export interface EnergyPrediction {
  /** Hour of the day (0-23, where 0=midnight, 14=2PM) */
  hour: number;
  /** Alertness score 0-100 (higher = more alert) */
  score: number;
  /** Human-readable zone label derived from score */
  zone: 'peak' | 'good' | 'low' | 'critical';
  /** Process C component: circadian signal contribution */
  circadianComponent: number;
  /** Process S component: homeostatic sleep pressure (applied as negative) */
  sleepPressureComponent: number;
  /** Recovery modifier applied to this hour (-0.3 to +0.3) */
  recoveryModifier: number;
  /** Caffeine boost for this hour (0 to ~0.2) */
  caffeineEffect: number;
}

/**
 * A single caffeine dose for the energy curve computation.
 */
export interface CaffeineDose {
  /** ISO timestamp when the dose was consumed */
  timeISO: string;
  /** Caffeine amount in mg (reference: 1 drip coffee ≈ 95mg, espresso ≈ 63mg) */
  mgCaffeine: number;
}
