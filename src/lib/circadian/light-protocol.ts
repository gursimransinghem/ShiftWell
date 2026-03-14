/**
 * Light exposure and avoidance protocol.
 *
 * Light is the most powerful zeitgeber (time-giver) for the circadian clock.
 * Correctly timed bright light exposure can shift the clock by ~1 hour/day.
 * Incorrectly timed light does the opposite — locking the clock in misalignment.
 *
 * Core principles:
 * 1. Bright light (>2500 lux) in the first 2h after wake → advances the clock
 *    (good for transitioning from nights back to days)
 * 2. Bright light in the evening → delays the clock
 *    (good for transitioning to night shifts)
 * 3. Avoid bright light (especially blue-spectrum) in the 3-4h before sleep
 *    (protects melatonin onset)
 * 4. Blue-blocking glasses on the commute home after a night shift
 *    (prevents morning light from sabotaging daytime sleep)
 *
 * References:
 * - Czeisler et al. (1990) — Bright light resets human circadian pacemaker
 * - Eastman & Burgess (2009) — Practical light/dark schedules
 * - Boivin & Boudreau (2014) — Timed light exposure for shift workers
 * - Smith et al. (2009) — Moderate light as effective as bright light
 */

import { addMinutes, addHours } from 'date-fns';
import type { ClassifiedDay, UserProfile, PlanBlock } from './types';

/**
 * Generate light exposure/avoidance blocks for a classified day.
 */
export function generateLightProtocol(
  day: ClassifiedDay,
  profile: UserProfile,
  sleepBlocks: PlanBlock[],
): PlanBlock[] {
  const blocks: PlanBlock[] = [];
  const date = day.date;
  const dayId = date.toISOString().slice(0, 10);

  // Find main sleep blocks
  const mainSleepBlocks = sleepBlocks.filter((b) => b.type === 'main-sleep');
  if (mainSleepBlocks.length === 0) return blocks;

  const firstSleep = mainSleepBlocks[0];
  const lastSleep = mainSleepBlocks[mainSleepBlocks.length - 1];

  switch (day.dayType) {
    case 'work-night': {
      // After waking from daytime sleep: NO bright light initially
      // Wear blue-blockers if going outside
      const wakeTime = firstSleep.end;
      blocks.push({
        id: `${dayId}-light-avoid-wake`,
        type: 'light-avoid',
        start: wakeTime,
        end: addHours(wakeTime, 1),
        label: 'Avoid Bright Light',
        description: 'Keep lights dim after waking. If you go outside, wear blue-blocking glasses. Morning light would fight your clock shift.',
        priority: 3,
      });

      // During first half of night shift: seek bright light
      const shift = day.shift!;
      const shiftFirstHalf = addMinutes(
        shift.start,
        (shift.end.getTime() - shift.start.getTime()) / 2 / 60000
      );
      blocks.push({
        id: `${dayId}-light-seek-shift`,
        type: 'light-seek',
        start: shift.start,
        end: shiftFirstHalf,
        label: 'Bright Light (Work)',
        description: 'Keep your work area as bright as possible during the first half of your shift. This helps delay your clock.',
        priority: 3,
      });

      // Second half of shift: dim light
      blocks.push({
        id: `${dayId}-light-avoid-shift`,
        type: 'light-avoid',
        start: shiftFirstHalf,
        end: shift.end,
        label: 'Dim Light (Work)',
        description: 'Reduce light exposure in the second half of your shift if possible. Avoid overhead fluorescents — use task lighting.',
        priority: 3,
      });

      // Commute home: blue-blocking glasses
      blocks.push({
        id: `${dayId}-light-avoid-commute`,
        type: 'light-avoid',
        start: shift.end,
        end: addMinutes(shift.end, profile.commuteDuration),
        label: 'Blue-Blockers (Commute)',
        description: 'Wear blue-blocking sunglasses on the drive/ride home. Morning sunlight will tell your brain it\'s daytime and sabotage your sleep.',
        priority: 2,
      });
      break;
    }

    case 'transition-to-nights': {
      // Evening bright light to start delaying the clock
      blocks.push({
        id: `${dayId}-light-seek-evening`,
        type: 'light-seek',
        start: addHours(lastSleep.start, -4), // 4h before delayed bedtime
        end: addHours(lastSleep.start, -2),   // Until 2h before bed
        label: 'Bright Light (Evening)',
        description: 'Seek bright light in the evening to start delaying your clock. Go outside or use a light therapy lamp (>2500 lux).',
        priority: 2,
      });

      // Dim light before bed
      blocks.push({
        id: `${dayId}-light-avoid-pre-sleep`,
        type: 'light-avoid',
        start: addHours(lastSleep.start, -2),
        end: lastSleep.start,
        label: 'Dim Light',
        description: 'Dim all lights and screens. Melatonin onset begins ~2h before your target sleep time.',
        priority: 2,
      });
      break;
    }

    case 'recovery': {
      // After recovery nap: SEEK bright light to advance clock back to normal
      const wakeTime = firstSleep.end;
      blocks.push({
        id: `${dayId}-light-seek-recovery`,
        type: 'light-seek',
        start: wakeTime,
        end: addHours(wakeTime, 2),
        label: 'Bright Light (Reset)',
        description: 'Get outside in bright sunlight immediately after your recovery nap. This is the most powerful signal to reset your clock back to a day schedule.',
        priority: 1,
      });
      break;
    }

    case 'work-day':
    case 'off': {
      // Standard: morning light after wake, dim before bed
      const wakeTime = mainSleepBlocks.length > 0 ? lastSleep.end : firstSleep.end;
      blocks.push({
        id: `${dayId}-light-seek-morning`,
        type: 'light-seek',
        start: wakeTime,
        end: addMinutes(wakeTime, 30),
        label: 'Morning Light',
        description: 'Get bright light within 30 min of waking. Go outside or open curtains wide. This anchors your circadian clock.',
        priority: 3,
      });

      // Dim before sleep
      const sleepOnset = lastSleep.start;
      blocks.push({
        id: `${dayId}-light-avoid-pre-sleep`,
        type: 'light-avoid',
        start: addHours(sleepOnset, -2),
        end: sleepOnset,
        label: 'Dim Light',
        description: 'Dim screens and room lights. Consider blue-blocking glasses if you must use devices.',
        priority: 3,
      });
      break;
    }
  }

  return blocks;
}
