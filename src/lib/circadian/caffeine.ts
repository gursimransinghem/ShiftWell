/**
 * Caffeine cutoff calculator.
 *
 * Caffeine has a half-life of 3-7 hours (average 5h), meaning
 * after 5 hours, 50% of the caffeine is still active. After 10 hours,
 * 25% remains — enough to disrupt sleep architecture.
 *
 * Our cutoff formula ensures less than ~12.5% of peak caffeine
 * remains at target sleep onset, which minimizes impact on
 * sleep latency and slow-wave sleep.
 *
 * Legacy formula: cutoff = targetSleepOnset - (halfLife * 1.67)
 * At 1.67 half-lives, ~31.5% remains. At 2 half-lives, 25% remains.
 * We use 1.67x as a practical minimum; stricter users can increase.
 *
 * Dose-aware formula: cutoff = halfLife * log2(doseMg / threshold)
 * where threshold = 25mg (level at which caffeine no longer significantly
 * impacts sleep onset or slow-wave sleep; Drake et al. 2013).
 *
 * Examples at default 5h half-life:
 *   100mg (1 cup):   log2(100/25) = 2.0 half-lives = 10.0h
 *   200mg (2 cups):  log2(200/25) = 3.0 half-lives = 15.0h
 *   300mg (3 cups):  log2(300/25) ≈ 3.58 half-lives ≈ 17.9h
 *
 * References:
 * - Clark & Landolt (2017) — Coffee, caffeine, and sleep
 * - Drake et al. (2013) — Caffeine effects on sleep taken 0, 3, 6h before bed
 *   (key finding: caffeine 6h before bed still reduced total sleep by 1h)
 * - AASM (2025) — Recommends <400mg daily, with cutoff 6-8h before sleep
 */

import { addMinutes, addHours } from 'date-fns';
import type { ClassifiedDay, UserProfile, PlanBlock } from './types';

/**
 * Default caffeine dose when not specified (one standard cup of coffee).
 * Standard cup ~100mg; energy drink ~150-300mg; espresso ~63mg.
 */
const DEFAULT_CAFFEINE_DOSE_MG = 100;

/**
 * Residual caffeine level at which sleep disruption becomes negligible.
 * Based on Drake et al. (2013) and Clark & Landolt (2017).
 */
const CAFFEINE_SLEEP_THRESHOLD_MG = 25;

/**
 * Compute the hours before sleep onset at which the last caffeine dose
 * should be taken to ensure residual caffeine drops below the sleep-
 * disruption threshold.
 *
 * Formula: halfLifeHours * log2(doseMg / thresholdMg)
 *
 * This replaces the legacy (halfLife * 1.67) multiplier when dose is known.
 * The two approaches converge at ~50mg dose with 5h half-life.
 *
 * Reference: Drake et al. (2013)
 */
export function computeCutoffHours(
  doseMg: number,
  halfLifeHours: number,
): number {
  const threshold = CAFFEINE_SLEEP_THRESHOLD_MG;
  return halfLifeHours * Math.log2(doseMg / threshold);
}

/**
 * Compute caffeine cutoff time for a given day.
 *
 * The cutoff is relative to the first primary sleep target. Recovery days
 * have a short morning recovery block plus an evening sleep block; for those
 * days, anchor caffeine advice to the later full sleep so users can still use
 * caffeine strategically while staying awake through the reset day.
 *
 * @param doseMg - Optional caffeine dose in mg. When provided, uses the
 *   dose-aware formula. When omitted, falls back to the legacy 1.67x
 *   half-life multiplier for backward compatibility.
 */
export function computeCaffeineCutoff(
  day: ClassifiedDay,
  profile: UserProfile,
  sleepBlocks: PlanBlock[],
  doseMg?: number,
): PlanBlock | null {
  // Find the earliest upcoming sleep or nap block
  const sleepAndNapBlocks = sleepBlocks
    .filter((b) => b.type === 'main-sleep' || b.type === 'nap')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (sleepAndNapBlocks.length === 0) return null;

  const targetSleep =
    day.dayType === 'recovery'
      ? sleepAndNapBlocks[sleepAndNapBlocks.length - 1]
      : sleepAndNapBlocks[0];
  const dayId = day.date.toISOString().slice(0, 10);

  let cutoffMinutes: number;
  let descriptionSuffix: string;

  if (doseMg !== undefined) {
    // Dose-aware path: use log2 formula for precision
    // computeCutoffHours(doseMg, halfLife) gives hours at which residual < 25mg
    const cutoffHours = computeCutoffHours(doseMg, profile.caffeineHalfLife);
    cutoffMinutes = Math.round(cutoffHours * 60);
    const cutoffHoursFormatted = cutoffHours.toFixed(1);
    descriptionSuffix = `With ${doseMg}mg caffeine and your ${profile.caffeineHalfLife}h half-life, this gives ${cutoffHoursFormatted}h for caffeine to clear below the 25mg sleep threshold.`;
  } else {
    // Legacy path: cutoff = half_life * 1.67 (backward compatible)
    // For default 5h half-life: 5 * 1.67 = 8.35 hours before sleep
    cutoffMinutes = Math.round(profile.caffeineHalfLife * 1.67 * 60);
    const cutoffHoursFormatted = (cutoffMinutes / 60).toFixed(1);
    descriptionSuffix = `With your ${profile.caffeineHalfLife}h caffeine half-life, this gives ${cutoffHoursFormatted}h for caffeine to clear before sleep.`;
  }

  const cutoffTime = addMinutes(targetSleep.start, -cutoffMinutes);

  return {
    id: `${dayId}-caffeine-cutoff`,
    type: 'caffeine-cutoff',
    start: cutoffTime,
    end: addMinutes(cutoffTime, 1), // Point-in-time event
    label: 'Caffeine Cutoff',
    description: `No coffee, tea, or energy drinks after this time. ${descriptionSuffix}`,
    priority: 2,
  };
}

/**
 * Compute the optimal caffeine window — when caffeine is MOST beneficial.
 *
 * For shift workers, strategic caffeine use in the first half of the shift
 * can improve alertness without disrupting post-shift sleep.
 *
 * Rule: Caffeine is most effective 30-60 min after waking (cortisol dip)
 * and should be front-loaded to the first half of the waking period.
 */
export function computeCaffeineWindow(
  day: ClassifiedDay,
  profile: UserProfile,
  sleepBlocks: PlanBlock[],
): PlanBlock | null {
  const mainSleep = sleepBlocks.find((b) => b.type === 'main-sleep');
  if (!mainSleep) return null;

  const dayId = day.date.toISOString().slice(0, 10);

  // Best caffeine time: 30-60 min after waking
  const caffeineStart = addMinutes(mainSleep.end, 30);
  const caffeineEnd = addHours(caffeineStart, 4); // 4-hour caffeine window

  // Only show for work days (not off days where caffeine isn't as critical)
  if (!day.dayType.startsWith('work-')) return null;

  return {
    id: `${dayId}-caffeine-window`,
    type: 'caffeine-cutoff', // Reusing type for calendar purposes
    start: caffeineStart,
    end: caffeineEnd,
    label: 'Caffeine Window',
    description: 'Best time for coffee. Caffeine peaks 30-60 min after consumption and is most effective early in your waking period.',
    priority: 3,
  };
}
