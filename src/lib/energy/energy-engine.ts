/**
 * Energy Curve Engine — 24-Hour Hourly Interface
 *
 * Wraps the Borbely Two-Process Model (src/lib/circadian/energy-model.ts)
 * with a simplified 24-value array interface keyed by hour (0-23).
 *
 * This abstraction is used by:
 *   - Today screen energy chart
 *   - Caffeine cutoff recommendations
 *   - HK-based adaptive coaching
 *
 * Scientific basis: Two-Process Model (Borbely 1982), Stone et al. 2021,
 * Daan, Beersma & Borbely 1984.
 *
 * ENERGY-01 requirement satisfied.
 */

import {
  circadianSignal,
  sleepPressure,
  caffeineEffect as computeCaffeineEffect,
  recoveryModifier as computeRecoveryModifier,
  normalizeTo100,
  calculateAcrophase,
  getEnergyLabel,
} from '../circadian/energy-model';
import type { CaffeineEntry } from '../circadian/energy-types';
import type { EnergyPrediction, CaffeineDose } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

const CAFFEINE_HALF_LIFE_HOURS = 5.0;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Map EnergyLabel from the circadian model to the energy-engine zone strings.
 * circadian model: 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW'
 * energy-engine:   'peak' | 'good'     | 'low' | 'critical'
 */
function labelToZone(label: string): 'peak' | 'good' | 'low' | 'critical' {
  switch (label) {
    case 'HIGH':
      return 'peak';
    case 'MODERATE':
      return 'good';
    case 'LOW':
      return 'low';
    default:
      return 'critical';
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Map a score to an energy zone label.
 *
 * Thresholds:
 *   peak     > 80
 *   good     60-80
 *   low      40-60
 *   critical < 40
 */
export function zoneFromScore(score: number): 'peak' | 'good' | 'low' | 'critical' {
  if (score > 80) return 'peak';
  if (score >= 60) return 'good';
  if (score >= 40) return 'low';
  return 'critical';
}

/**
 * Calculate the latest hour at which caffeine should be consumed.
 *
 * Recommendation: stop caffeine at least 2x half-life before planned sleep.
 * This ensures <12% of caffeine remains at sleep onset.
 *
 * @param plannedSleepHour - Hour of planned bedtime (0-23)
 * @param halfLife         - Caffeine half-life in hours (default 5h)
 * @returns Hour of day (0-23) for last safe caffeine dose
 */
export function calculateCaffeineCutoff(
  plannedSleepHour: number,
  halfLife = CAFFEINE_HALF_LIFE_HOURS,
): number {
  const cutoff = plannedSleepHour - 2 * halfLife;
  return ((Math.round(cutoff) % 24) + 24) % 24;
}

/**
 * Generate a 24-hour energy prediction curve (one entry per clock hour, 0-23).
 *
 * Models the body's alertness by combining:
 *   1. Process C (circadian signal) — the body clock wave
 *   2. Process S (homeostatic sleep pressure) — adenosine build-up since wake
 *   3. Recovery modifier — quality of last night's sleep (HRV, duration)
 *   4. Caffeine effect — temporary adenosine receptor blockade
 *
 * @param sleepEndHour       - Hour when the person woke up (0-23)
 * @param sleepDurationHours - How many hours they slept last night
 * @param recoveryScore      - Recovery score 0-100 (default 50 = neutral)
 * @param caffeineDoses      - Caffeine doses consumed today (optional)
 * @returns Array of 24 EnergyPrediction entries, one per hour (0-23 in order)
 */
export function predictEnergyCurve(
  sleepEndHour: number,
  sleepDurationHours: number,
  recoveryScore = 50,
  caffeineDoses: CaffeineDose[] = [],
): EnergyPrediction[] {
  // Compute constants for the day
  const acrophase = calculateAcrophase(sleepEndHour);
  const rMod = computeRecoveryModifier(recoveryScore);

  // Sleep debt modifier (same formula as energy-model.ts)
  const sleepNeedBaseline = 7.63;
  const sleepDeficit = Math.max(0, sleepNeedBaseline - sleepDurationHours);
  const debtModifier = -0.1 * Math.min(sleepDeficit / sleepNeedBaseline, 1.0);

  // Convert CaffeineDose[] → CaffeineEntry[] for the circadian module
  // Use a fixed reference date (today at hour 0) for consistent relative timing
  const refDate = new Date();
  refDate.setHours(0, 0, 0, 0);

  const caffeineEntries: CaffeineEntry[] = caffeineDoses.map((dose) => ({
    consumedAt: new Date(dose.timeISO),
    doseMg: dose.mgCaffeine,
  }));

  // Build a reference time for each hour
  const predictions: EnergyPrediction[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const timeForHour = new Date(refDate.getTime() + hour * 3_600_000);

    // Hours awake since waking up
    let hoursAwake = hour - sleepEndHour;
    if (hoursAwake < 0) hoursAwake += 24; // handles night shift workers

    // Component calculations
    const cSignal = circadianSignal(hour, acrophase);
    const sPressure = sleepPressure(hoursAwake);
    const caffBoost = computeCaffeineEffect(caffeineEntries, timeForHour);

    // Combine
    const raw = cSignal - sPressure + rMod + caffBoost + debtModifier;
    let score = normalizeTo100(raw);

    // Sleep inertia: first hour after waking
    if (hoursAwake < 1.0) {
      const inertiaFactor = 0.5 + 0.5 * hoursAwake;
      score *= inertiaFactor;
    }

    // Clamp to [0, 100]
    score = Math.max(0, Math.min(100, score));
    score = Math.round(score * 10) / 10;

    const zone = zoneFromScore(score);

    predictions.push({
      hour,
      score,
      zone,
      circadianComponent: Math.round(cSignal * 10000) / 10000,
      sleepPressureComponent: Math.round(sPressure * 10000) / 10000,
      recoveryModifier: Math.round(rMod * 10000) / 10000,
      caffeineEffect: Math.round(caffBoost * 10000) / 10000,
    });
  }

  return predictions;
}
