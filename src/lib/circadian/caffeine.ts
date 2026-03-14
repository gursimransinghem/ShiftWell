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
 * Formula: cutoff = targetSleepOnset - (halfLife * 1.67)
 * At 1.67 half-lives, ~31.5% remains. At 2 half-lives, 25% remains.
 * We use 1.67x as a practical minimum; stricter users can increase.
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
 * Compute caffeine cutoff time for a given day.
 *
 * The cutoff is relative to the FIRST sleep block of the day
 * (which may be a nap or the main sleep block).
 */
export function computeCaffeineCutoff(
  day: ClassifiedDay,
  profile: UserProfile,
  sleepBlocks: PlanBlock[],
): PlanBlock | null {
  // Find the earliest upcoming sleep or nap block
  const sleepAndNapBlocks = sleepBlocks
    .filter((b) => b.type === 'main-sleep' || b.type === 'nap')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (sleepAndNapBlocks.length === 0) return null;

  const firstSleep = sleepAndNapBlocks[0];
  const dayId = day.date.toISOString().slice(0, 10);

  // Cutoff = sleep onset - (half_life * 1.67)
  // For default 5h half-life: 5 * 1.67 = 8.35 hours before sleep
  const cutoffMinutes = Math.round(profile.caffeineHalfLife * 1.67 * 60);
  const cutoffTime = addMinutes(firstSleep.start, -cutoffMinutes);

  // Format hours for the description
  const cutoffHours = (cutoffMinutes / 60).toFixed(1);

  return {
    id: `${dayId}-caffeine-cutoff`,
    type: 'caffeine-cutoff',
    start: cutoffTime,
    end: addMinutes(cutoffTime, 1), // Point-in-time event
    label: 'Caffeine Cutoff',
    description: `No coffee, tea, or energy drinks after this time. With your ${profile.caffeineHalfLife}h caffeine half-life, this gives ${cutoffHours}h for caffeine to clear before sleep.`,
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
