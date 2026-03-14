/**
 * Strategic nap placement module.
 *
 * Naps are a critical tool for shift workers to manage sleep debt
 * and maintain alertness, especially during night shifts.
 *
 * Scientific basis:
 * - A 20-30 minute nap improves alertness without significant sleep inertia
 *   (Milner & Cote, 2009)
 * - Pre-shift "prophylactic" napping reduces fatigue during night shifts
 *   (Ruggiero & Redeker, 2014)
 * - Nap timing should avoid the "sleep inertia window" — waking from
 *   deep sleep (stages N3) causes 15-30 min of grogginess. Keep naps
 *   under 30 min OR extend to 90 min (full cycle) to avoid this.
 * - The circadian alertness dip at ~14:00-16:00 (post-lunch dip) is
 *   an ideal window for a short nap, even for day workers.
 *
 * References:
 * - Milner & Cote (2009) — Benefits of napping in healthy adults
 * - Ruggiero & Redeker (2014) — Napping and shift work
 * - AASM Clinical Practice Guidelines (2015)
 * - Ficca et al. (2010) — Nap and circadian rhythm
 */

import { addMinutes, addHours, isBefore, isAfter, setHours, setMinutes } from 'date-fns';
import type { ClassifiedDay, UserProfile, PlanBlock } from './types';

/** Nap duration options in minutes */
const NAP_SHORT = 25;  // Power nap: alertness boost, no inertia
const NAP_FULL_CYCLE = 90;  // Full sleep cycle: deep restoration

/** Set a specific time on a date */
function setTime(date: Date, hours: number): Date {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return setMinutes(setHours(date, h), m);
}

/**
 * Check if a nap window conflicts with existing plan blocks.
 */
function hasConflict(
  napStart: Date,
  napEnd: Date,
  existingBlocks: PlanBlock[],
): boolean {
  return existingBlocks.some(
    (block) =>
      (isAfter(napStart, block.start) && isBefore(napStart, block.end)) ||
      (isAfter(napEnd, block.start) && isBefore(napEnd, block.end)) ||
      (isBefore(napStart, block.start) && isAfter(napEnd, block.end))
  );
}

/**
 * Generate nap blocks for a classified day.
 *
 * Called AFTER sleep-windows has generated main sleep blocks.
 * Naps are placed in the gaps between sleep and shift blocks.
 */
export function generateNaps(
  day: ClassifiedDay,
  profile: UserProfile,
  existingBlocks: PlanBlock[],
): PlanBlock[] {
  if (!profile.napPreference) return [];

  const naps: PlanBlock[] = [];
  const date = day.date;
  const dayId = date.toISOString().slice(0, 10);

  switch (day.dayType) {
    case 'work-night': {
      // Pre-shift prophylactic nap: 90 min before leaving for work
      // This is the single most effective intervention for night shift alertness
      const shift = day.shift!;
      const leaveTime = addMinutes(shift.start, -profile.commuteDuration);
      const napEnd = addMinutes(leaveTime, -30); // 30 min buffer to fully wake
      const napStart = addMinutes(napEnd, -NAP_FULL_CYCLE);

      if (!hasConflict(napStart, napEnd, existingBlocks)) {
        naps.push({
          id: `${dayId}-pre-shift-nap`,
          type: 'nap',
          start: napStart,
          end: napEnd,
          label: 'Pre-Shift Nap',
          description: 'Full 90-minute sleep cycle before your night shift. This is the #1 evidence-based intervention for night shift alertness.',
          priority: 2,
        });
      }
      break;
    }

    case 'work-evening': {
      // Afternoon power nap before an evening shift
      const shift = day.shift!;
      const leaveTime = addMinutes(shift.start, -profile.commuteDuration);
      const napEnd = addMinutes(leaveTime, -45); // More buffer — need to be fully alert
      const napStart = addMinutes(napEnd, -NAP_SHORT);

      if (!hasConflict(napStart, napEnd, existingBlocks)) {
        naps.push({
          id: `${dayId}-pre-shift-nap`,
          type: 'nap',
          start: napStart,
          end: napEnd,
          label: 'Power Nap',
          description: '25-minute power nap. Set an alarm — do NOT oversleep into deep sleep or you will feel groggy.',
          priority: 3,
        });
      }
      break;
    }

    case 'work-extended': {
      // Pre-shift nap before a 24h shift — bank sleep
      const shift = day.shift!;
      const leaveTime = addMinutes(shift.start, -profile.commuteDuration);
      const napEnd = addMinutes(leaveTime, -30);
      const napStart = addMinutes(napEnd, -NAP_FULL_CYCLE);

      if (!hasConflict(napStart, napEnd, existingBlocks)) {
        naps.push({
          id: `${dayId}-pre-shift-nap`,
          type: 'nap',
          start: napStart,
          end: napEnd,
          label: 'Sleep Banking Nap',
          description: 'Full 90-min cycle to bank sleep before your extended shift. Critical for maintaining performance at hour 20+.',
          priority: 2,
        });
      }
      break;
    }

    case 'transition-to-nights': {
      // Afternoon nap to begin delaying the sleep phase
      const napStart = setTime(date, 15); // 3:00 PM
      const napEnd = addMinutes(napStart, NAP_FULL_CYCLE);

      if (!hasConflict(napStart, napEnd, existingBlocks)) {
        naps.push({
          id: `${dayId}-transition-nap`,
          type: 'nap',
          start: napStart,
          end: napEnd,
          label: 'Transition Nap',
          description: 'Afternoon nap to start shifting your clock. This extra rest buffers the sleep debt from tonight\'s delayed bedtime.',
          priority: 2,
        });
      }
      break;
    }

    case 'work-day': {
      // Post-lunch dip nap (if schedule allows)
      // The circadian alertness dip at ~14:00-16:00 is biologically real
      // Only if there's a gap between shift end and next commitment
      const shift = day.shift;
      if (shift) {
        const shiftEndHour = shift.end.getHours();
        // Only suggest if shift ends by early afternoon
        if (shiftEndHour <= 15) {
          const napStart = setTime(date, 14); // 2:00 PM
          const napEnd = addMinutes(napStart, NAP_SHORT);

          if (!hasConflict(napStart, napEnd, existingBlocks)) {
            naps.push({
              id: `${dayId}-afternoon-nap`,
              type: 'nap',
              start: napStart,
              end: napEnd,
              label: 'Power Nap (Optional)',
              description: 'Your body naturally dips in alertness around 2-3 PM. A quick 25-min nap here boosts the rest of your day.',
              priority: 3,
            });
          }
        }
      }
      break;
    }

    default:
      // No naps for off days or recovery (they get full sleep blocks)
      break;
  }

  return naps;
}
