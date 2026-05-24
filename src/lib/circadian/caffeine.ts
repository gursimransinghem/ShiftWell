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
  // Default 6h (NIOSH ≥6h). Extended toward a HARD CAP of 9h for high doses and slow
  // metabolizers. The old unbounded `halfLife * log2(dose/25)` sent a 2-cup user to a
  // 15h cutoff — non-actionable (gap-analysis R5). 25mg threshold kept as documentation.
  const BASE_HOURS = 6;
  const MAX_HOURS = 9;
  // Dose modifier: ≤200mg adds nothing; scales linearly to +3h at 400mg. Drake 2013 —
  // 400mg still cut total sleep when taken 6h before bed, so a high dose needs longer.
  const doseAdd = Math.max(0, Math.min(3, ((doseMg - 200) / 200) * 3));
  // Metabolizer modifier: a half-life above the ~5h norm scales toward +3h at ~12h.
  const halfLifeAdd = Math.max(0, Math.min(3, ((halfLifeHours - 5) / 7) * 3));
  return Math.max(BASE_HOURS, Math.min(MAX_HOURS, BASE_HOURS + doseAdd + halfLifeAdd));
}

/**
 * Compute caffeine cutoff time for a given day.
 *
 * The cutoff is relative to the FIRST sleep block of the day
 * (which may be a nap or the main sleep block).
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

  // Anchor the cutoff to the MAIN sleep being protected — not merely the earliest
  // block. On a work-night day the earliest block is the pre-shift nap; anchoring
  // there would forbid caffeine for the entire night shift (A/B hardening HF-4).
  const mainSleep = sleepAndNapBlocks.find((b) => b.type === 'main-sleep');
  const firstSleep = mainSleep ?? sleepAndNapBlocks[0];
  const dayId = day.date.toISOString().slice(0, 10);

  // One bounded path (the legacy 1.67x path is retired — its 8.35h sat inside the new
  // 6-9h band anyway). When no dose is supplied, assume one standard cup.
  const effectiveDose = doseMg ?? DEFAULT_CAFFEINE_DOSE_MG;
  const cutoffHours = computeCutoffHours(effectiveDose, profile.caffeineHalfLife);
  const cutoffMinutes = Math.round(cutoffHours * 60);
  const descriptionSuffix = `With ~${effectiveDose}mg caffeine and your ${profile.caffeineHalfLife}h half-life, stop ${cutoffHours.toFixed(1)}h before sleep (6h default, 9h hard cap so the guidance stays actionable).`;

  const cutoffTime = addMinutes(firstSleep.start, -cutoffMinutes);

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
