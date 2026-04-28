/**
 * Core sleep window computation module.
 *
 * Given a classified day (with shift info, personal events, and user profile),
 * computes the optimal main sleep block.
 *
 * Scientific basis:
 * - Two-Process Model (Borbely, 1982): Sleep timing is governed by
 *   homeostatic pressure (Process S) and circadian rhythm (Process C).
 * - Anchor sleep strategy (NIOSH/CDC): For rotating shift workers,
 *   maintain a consistent 4-hour "anchor" sleep block across all schedule types.
 * - Circadian clock shifts ~1h/day with optimal light exposure (Czeisler et al., 1990).
 * - Sleep efficiency is highest when aligned with the circadian nadir
 *   (core body temperature minimum), roughly 2h before habitual wake time.
 *
 * References:
 * - Borbely (1982) — Two-Process Model
 * - Czeisler et al. (1990) — Bright light and circadian adaptation
 * - Eastman & Burgess (2009) — Practical circadian shifting protocols
 * - AASM Clinical Practice Guidelines (2015, updated 2023)
 * - Boivin & Boudreau (2014) — Shift work sleep interventions
 */

import { setHours, setMinutes, addDays, addHours, addMinutes, isAfter, isBefore, differenceInMinutes } from 'date-fns';
import type {
  ClassifiedDay,
  UserProfile,
  PlanBlock,
  Chronotype,
  PersonalEvent,
  CHRONOTYPE_OFFSETS,
} from './types';
import { DEFAULT_PROFILE, CHRONOTYPE_OFFSETS as OFFSETS } from './types';

function intervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA < endB && startB < endA;
}

/** Set a specific time (hours.fraction) on a given date */
function setTime(date: Date, hours: number): Date {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return setMinutes(setHours(date, h), m);
}

/** Align a time to the nearest 90-minute sleep cycle boundary */
function alignToSleepCycle(sleepOnset: Date, sleepNeedHours: number): Date {
  const cycleMinutes = 90;
  const totalMinutes = sleepNeedHours * 60;
  const cycles = Math.round(totalMinutes / cycleMinutes);
  return addMinutes(sleepOnset, cycles * cycleMinutes);
}

/**
 * Check if a sleep block conflicts with any personal events.
 * Returns adjusted times that avoid conflicts.
 */
function avoidConflicts(
  sleepStart: Date,
  sleepEnd: Date,
  personalEvents: PersonalEvent[],
  minSleepHours: number = 5,
): { start: Date; end: Date; wasAdjusted: boolean } {
  for (const event of personalEvents) {
    const eventStart = event.start;
    const eventEnd = event.end;

    // Event overlaps our sleep window, including events that fully cover it.
    if (intervalsOverlap(sleepStart, sleepEnd, eventStart, eventEnd)) {
      const minutesBefore = differenceInMinutes(eventStart, sleepStart);
      const minutesAfter = differenceInMinutes(sleepEnd, eventEnd);

      // If we can sleep before the event and get enough rest
      if (minutesBefore >= minSleepHours * 60) {
        return {
          start: sleepStart,
          end: addMinutes(eventStart, -30), // 30min buffer to get ready
          wasAdjusted: true,
        };
      }

      // If we can sleep after the event
      if (minutesAfter >= minSleepHours * 60) {
        return {
          start: addMinutes(eventEnd, 15), // 15min to wind down after event
          end: sleepEnd,
          wasAdjusted: true,
        };
      }

      // Event takes up most of our sleep window — shift entirely
      return {
        start: addMinutes(eventEnd, 15),
        end: addMinutes(eventEnd, 15 + minSleepHours * 60),
        wasAdjusted: true,
      };
    }
  }

  return { start: sleepStart, end: sleepEnd, wasAdjusted: false };
}

/**
 * Generate the wind-down block before sleep.
 *
 * Evidence: A consistent pre-sleep routine of 30-60 minutes improves
 * sleep onset latency. Includes dimming lights, avoiding screens,
 * and relaxation activities.
 *
 * Reference: Irish et al. (2015) — The role of sleep hygiene in promoting public health
 */
function generateWindDown(sleepStart: Date, dayId: string): PlanBlock {
  const windDownStart = addMinutes(sleepStart, -60);
  return {
    id: `${dayId}-wind-down`,
    type: 'wind-down',
    start: windDownStart,
    end: sleepStart,
    label: 'Wind Down',
    description: 'Dim lights, no screens, relax. Your melatonin is rising — protect it.',
    priority: 2,
  };
}

/**
 * Compute sleep window for a DAY SHIFT worker.
 *
 * Strategy: Sleep at your natural circadian time (chronotype-adjusted).
 * This is the simplest case — minimal circadian disruption.
 */
function computeDayShiftSleep(
  day: ClassifiedDay,
  profile: UserProfile,
): PlanBlock[] {
  const blocks: PlanBlock[] = [];
  const date = day.date;
  const dayId = date.toISOString().slice(0, 10);
  const offsets = OFFSETS[profile.chronotype];

  // Sleep onset: natural time based on chronotype
  let sleepOnset = setTime(date, offsets.naturalSleepOnset);
  // If chronotype says after midnight, it's technically next day
  if (offsets.naturalSleepOnset < 12) {
    sleepOnset = setTime(addDays(date, 1), offsets.naturalSleepOnset);
  }

  // Wake time: aligned to 90-min cycle
  let wakeTime = alignToSleepCycle(sleepOnset, profile.sleepNeed);

  // If there's a shift the next day, ensure wake time allows for commute + prep
  if (day.shift) {
    const latestWake = addMinutes(day.shift.start, -(profile.commuteDuration + 60));
    if (isAfter(wakeTime, latestWake)) {
      wakeTime = latestWake;
      // Back-calculate sleep onset to still get enough sleep
      sleepOnset = addMinutes(wakeTime, -(profile.sleepNeed * 60));
    }
  }

  // Adjust for personal event conflicts
  const adjusted = avoidConflicts(sleepOnset, wakeTime, day.personalEvents);

  blocks.push({
    id: `${dayId}-main-sleep`,
    type: 'main-sleep',
    start: adjusted.start,
    end: adjusted.end,
    label: 'Main Sleep',
    description: adjusted.wasAdjusted
      ? 'Adjusted around your schedule. Prioritize this full block.'
      : 'Optimal sleep window aligned with your circadian rhythm.',
    priority: 1,
  });

  blocks.push(generateWindDown(adjusted.start, dayId));

  return blocks;
}

/**
 * Compute sleep window for a NIGHT SHIFT worker.
 *
 * Strategy (Anchor Sleep — NIOSH/CDC):
 * - Do NOT try to fully reverse the circadian clock for a typical 3-4 night stretch.
 *   The clock shifts only ~1h/day even with optimal light management.
 * - Instead, use a "compromise" position:
 *   Main sleep block: ~08:00-15:00 (after night shift ends)
 *   Pre-shift nap: ~18:00-19:00 (if user has nap preference)
 *
 * The main sleep block is timed to capture some of the circadian sleep-permissive
 * zone while being practical for post-shift recovery.
 *
 * Reference: Eastman & Burgess (2009), NIOSH Training for Nurses
 */
function computeNightShiftSleep(
  day: ClassifiedDay,
  profile: UserProfile,
): PlanBlock[] {
  const blocks: PlanBlock[] = [];
  const date = day.date;
  const dayId = date.toISOString().slice(0, 10);
  const shift = day.shift!;

  // Main sleep after the shift ends
  // Typical night shift ends 06:00-08:00. Add commute + wind-down buffer.
  const arriveHome = addMinutes(shift.end, profile.commuteDuration);
  let mainSleepStart = addMinutes(arriveHome, 30); // 30min to wind down, eat, etc.

  // Adjust if there are young children (household wakes around 7-8am typically)
  // In that case, try to get sleep before the household wakes
  if (profile.hasYoungChildren) {
    // If kids are up, morning sleep will be fragmented. Prioritize getting to bed ASAP.
    mainSleepStart = addMinutes(arriveHome, 15);
  }

  let mainSleepEnd = addHours(mainSleepStart, Math.max(profile.sleepNeed - 1, 5));

  // Pets (especially dogs) require morning feeding/walking that can cut daytime recovery short.
  // Cap sleep 30 min earlier to reflect real-world interruption.
  if (profile.hasPets) {
    mainSleepEnd = addMinutes(mainSleepEnd, -30);
  }
  // Reserve 1h of sleep need for pre-shift nap if user wants naps

  // Adjust for personal event conflicts
  const adjusted = avoidConflicts(mainSleepStart, mainSleepEnd, day.personalEvents);

  blocks.push({
    id: `${dayId}-main-sleep`,
    type: 'main-sleep',
    start: adjusted.start,
    end: adjusted.end,
    label: 'Main Sleep',
    description: 'Post-shift recovery sleep. Blackout curtains, cool room, earplugs. This is non-negotiable.',
    priority: 1,
  });

  blocks.push(generateWindDown(adjusted.start, dayId));

  return blocks;
}

/**
 * Compute sleep window for an EVENING SHIFT worker.
 *
 * Strategy: Evening shifts (14:00-23:00) are less disruptive than nights.
 * Sleep is delayed but still occurs during the biological night.
 * Main sleep: ~01:00-09:00 (after shift + commute + wind-down)
 */
function computeEveningShiftSleep(
  day: ClassifiedDay,
  profile: UserProfile,
): PlanBlock[] {
  const blocks: PlanBlock[] = [];
  const date = day.date;
  const dayId = date.toISOString().slice(0, 10);
  const shift = day.shift!;

  const arriveHome = addMinutes(shift.end, profile.commuteDuration);
  let mainSleepStart = addMinutes(arriveHome, 45); // More wind-down time since coming off work
  let mainSleepEnd = addHours(mainSleepStart, profile.sleepNeed);

  // Align to 90-min cycle
  mainSleepEnd = alignToSleepCycle(mainSleepStart, profile.sleepNeed);

  const adjusted = avoidConflicts(mainSleepStart, mainSleepEnd, day.personalEvents);

  blocks.push({
    id: `${dayId}-main-sleep`,
    type: 'main-sleep',
    start: adjusted.start,
    end: adjusted.end,
    label: 'Main Sleep',
    description: 'Post-evening-shift sleep. Still within your biological night — good alignment.',
    priority: 1,
  });

  blocks.push(generateWindDown(adjusted.start, dayId));

  return blocks;
}

/**
 * Compute sleep window for a TRANSITION TO NIGHTS day.
 *
 * Strategy: Gradually delay sleep by ~2 hours to begin shifting
 * the circadian clock toward the night schedule.
 *
 * Reference: Eastman & Burgess (2009) — gradual delay protocol
 */
function computeTransitionToNightsSleep(
  day: ClassifiedDay,
  profile: UserProfile,
): PlanBlock[] {
  const blocks: PlanBlock[] = [];
  const date = day.date;
  const dayId = date.toISOString().slice(0, 10);
  const offsets = OFFSETS[profile.chronotype];

  // Delay sleep onset by 2-3 hours from natural time
  let delayedOnset = offsets.naturalSleepOnset + 2.5;
  let sleepStart = setTime(date, delayedOnset);
  if (delayedOnset >= 24) {
    sleepStart = setTime(addDays(date, 1), delayedOnset - 24);
  }

  const sleepEnd = alignToSleepCycle(sleepStart, profile.sleepNeed);

  const adjusted = avoidConflicts(sleepStart, sleepEnd, day.personalEvents);

  blocks.push({
    id: `${dayId}-main-sleep`,
    type: 'main-sleep',
    start: adjusted.start,
    end: adjusted.end,
    label: 'Main Sleep (Delayed)',
    description: 'Deliberately staying up later to pre-shift your clock toward nights. Sleep in tomorrow — this is the plan.',
    priority: 1,
  });

  blocks.push(generateWindDown(adjusted.start, dayId));

  return blocks;
}

/**
 * Compute sleep window for a RECOVERY day (first day off after nights).
 *
 * Strategy: Split sleep approach.
 * 1. Short recovery sleep immediately after the last night shift (~4-5h)
 * 2. Stay awake through the afternoon with bright light exposure
 * 3. Go to bed at a slightly early but near-normal time
 *
 * This accelerates the clock's return to a day-aligned schedule.
 *
 * Reference: Boivin & Boudreau (2014)
 */
function computeRecoverySleep(
  day: ClassifiedDay,
  profile: UserProfile,
): PlanBlock[] {
  const blocks: PlanBlock[] = [];
  const date = day.date;
  const dayId = date.toISOString().slice(0, 10);
  const offsets = OFFSETS[profile.chronotype];

  // Morning recovery nap: 08:00-12:00 (4 hours)
  const recoveryStart = setTime(date, 8);
  const recoveryEnd = setTime(date, 12);

  blocks.push({
    id: `${dayId}-recovery-sleep`,
    type: 'main-sleep',
    start: recoveryStart,
    end: recoveryEnd,
    label: 'Recovery Sleep',
    description: 'Short recovery block after nights. Do NOT sleep past noon — you need afternoon light to reset your clock.',
    priority: 1,
  });

  // Early bedtime to reclaim normal schedule
  const earlyBedtime = offsets.naturalSleepOnset - 1; // 1h earlier than usual
  let normalSleepStart = setTime(date, earlyBedtime);
  if (earlyBedtime < 12) {
    // Would be next day for late chronotypes
    normalSleepStart = setTime(date, earlyBedtime);
  }
  const normalSleepEnd = alignToSleepCycle(normalSleepStart, profile.sleepNeed);

  blocks.push({
    id: `${dayId}-main-sleep`,
    type: 'main-sleep',
    start: normalSleepStart,
    end: normalSleepEnd,
    label: 'Main Sleep (Early)',
    description: 'Slightly earlier bedtime to help reset your clock. You earned this full block.',
    priority: 1,
  });

  blocks.push(generateWindDown(normalSleepStart, dayId));

  return blocks;
}

/**
 * Compute sleep window for a regular OFF day.
 *
 * Strategy: Sleep at natural circadian time. This is the anchor
 * that everything else shifts relative to.
 */
function computeOffDaySleep(
  day: ClassifiedDay,
  profile: UserProfile,
): PlanBlock[] {
  const blocks: PlanBlock[] = [];
  const date = day.date;
  const dayId = date.toISOString().slice(0, 10);
  const offsets = OFFSETS[profile.chronotype];

  let sleepOnset = setTime(date, offsets.naturalSleepOnset);
  if (offsets.naturalSleepOnset < 12) {
    sleepOnset = setTime(addDays(date, 1), offsets.naturalSleepOnset);
  }
  const wakeTime = alignToSleepCycle(sleepOnset, profile.sleepNeed);

  const adjusted = avoidConflicts(sleepOnset, wakeTime, day.personalEvents);

  blocks.push({
    id: `${dayId}-main-sleep`,
    type: 'main-sleep',
    start: adjusted.start,
    end: adjusted.end,
    label: 'Main Sleep',
    description: 'Natural circadian sleep window. Consistency here is your anchor.',
    priority: 1,
  });

  blocks.push(generateWindDown(adjusted.start, dayId));

  return blocks;
}

/**
 * Compute sleep window for an EXTENDED shift day (24h+).
 *
 * Strategy: These require pre-shift banking and post-shift recovery.
 * Pre-shift: nap 2-3h before the shift.
 * Post-shift: extended recovery sleep of 8-10h.
 */
function computeExtendedShiftSleep(
  day: ClassifiedDay,
  profile: UserProfile,
): PlanBlock[] {
  const blocks: PlanBlock[] = [];
  const date = day.date;
  const dayId = date.toISOString().slice(0, 10);
  const shift = day.shift!;

  // Post-shift recovery (this is the priority)
  const arriveHome = addMinutes(shift.end, profile.commuteDuration);
  const recoverySleepStart = addMinutes(arriveHome, 30);
  const recoverySleepEnd = addHours(recoverySleepStart, Math.min(profile.sleepNeed + 1.5, 10));

  blocks.push({
    id: `${dayId}-main-sleep`,
    type: 'main-sleep',
    start: recoverySleepStart,
    end: recoverySleepEnd,
    label: 'Recovery Sleep',
    description: 'Extended recovery after a 24+ hour shift. Sleep as long as your body needs. Do not set an alarm unless required.',
    priority: 1,
  });

  blocks.push(generateWindDown(recoverySleepStart, dayId));

  return blocks;
}

/**
 * Main entry point: compute sleep blocks for a single classified day.
 *
 * @param options.bedtimeOffsetMinutes - Cumulative shift from chronotype baseline.
 *   Positive = later bedtime (Day→Night protocol), negative = earlier.
 *   Applied by shifting the computed sleepOnset and wakeTime together.
 *   Used by the Adaptive Brain circadian protocol engine.
 */
export function computeSleepBlocks(
  day: ClassifiedDay,
  profile: UserProfile = DEFAULT_PROFILE,
  options?: { bedtimeOffsetMinutes?: number },
): PlanBlock[] {
  const offset = options?.bedtimeOffsetMinutes ?? 0;
  const blocks = (() => {
    switch (day.dayType) {
      case 'work-day':
        return computeDayShiftSleep(day, profile);
      case 'work-evening':
        return computeEveningShiftSleep(day, profile);
      case 'work-night':
        return computeNightShiftSleep(day, profile);
      case 'work-extended':
        return computeExtendedShiftSleep(day, profile);
      case 'transition-to-nights':
        return computeTransitionToNightsSleep(day, profile);
      case 'transition-to-days':
      case 'recovery':
        return computeRecoverySleep(day, profile);
      case 'off':
        return computeOffDaySleep(day, profile);
      default:
        return computeOffDaySleep(day, profile);
    }
  })();

  // Apply adaptive bedtime offset (circadian protocol engine)
  if (offset === 0) return blocks;

  return blocks.map((block) => {
    if (block.type !== 'main-sleep' && block.type !== 'wind-down') return block;
    return {
      ...block,
      start: addMinutes(block.start, offset),
      end: addMinutes(block.end, offset),
    };
  });
}
