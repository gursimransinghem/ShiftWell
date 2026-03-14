/**
 * Shift classification module.
 *
 * Takes raw calendar events and classifies each day in the schedule
 * as a specific DayType (work-day, work-night, transition, etc.).
 *
 * This classification drives all downstream sleep scheduling decisions.
 */

import {
  startOfDay,
  endOfDay,
  addDays,
  differenceInHours,
  getHours,
  isWithinInterval,
  isSameDay,
  eachDayOfInterval,
} from 'date-fns';
import type {
  ShiftEvent,
  ShiftType,
  DayType,
  ClassifiedDay,
  PersonalEvent,
} from './types';

/**
 * Classify a shift's type based on its start/end times.
 *
 * Categories based on standard shift work research:
 * - Day: start 05:00-13:59 (primary work hours during daylight)
 * - Evening: start 14:00-17:59 (swing shift)
 * - Night: start 18:00-04:59 (overnight work, crosses midnight)
 * - Extended: duration > 16 hours (24h shifts, double shifts)
 *
 * Reference: NIOSH Training for Nurses on Shift Work and Long Work Hours
 */
export function classifyShiftType(start: Date, end: Date): ShiftType {
  const durationHours = differenceInHours(end, start);

  if (durationHours > 16) {
    return 'extended';
  }

  const startHour = getHours(start);

  if (startHour >= 5 && startHour < 14) {
    return 'day';
  }
  if (startHour >= 14 && startHour < 18) {
    return 'evening';
  }
  // 18:00-04:59
  return 'night';
}

/**
 * For a given date, find the shift that "belongs" to that day.
 *
 * Night shifts are tricky: a shift from 19:00 Mar 14 to 07:00 Mar 15
 * "belongs" to Mar 14 (the day it started). But we also need to know
 * that Mar 15 morning is occupied by the tail end of the shift.
 */
function findShiftForDay(date: Date, shifts: ShiftEvent[]): ShiftEvent | null {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  // First: shift that starts on this day
  const startingShift = shifts.find((s) =>
    isWithinInterval(s.start, { start: dayStart, end: dayEnd })
  );
  if (startingShift) return startingShift;

  // Second: shift that started yesterday but extends into this day
  // (e.g., night shift 19:00-07:00, the 07:00 end is on "today")
  const overnightShift = shifts.find(
    (s) =>
      s.start < dayStart &&
      s.end > dayStart &&
      isWithinInterval(s.end, { start: dayStart, end: dayEnd })
  );
  if (overnightShift) return overnightShift;

  return null;
}

/**
 * Classify a single day's type based on its shift and surrounding context.
 */
function classifyDayType(
  date: Date,
  shift: ShiftEvent | null,
  prevDayShift: ShiftEvent | null,
  nextDayShift: ShiftEvent | null,
): DayType {
  if (shift) {
    switch (shift.shiftType) {
      case 'day':
        return 'work-day';
      case 'evening':
        return 'work-evening';
      case 'night':
        return 'work-night';
      case 'extended':
        return 'work-extended';
    }
  }

  // This is a day off — but what kind?
  const prevWasNight = prevDayShift?.shiftType === 'night' || prevDayShift?.shiftType === 'extended';
  const nextIsNight = nextDayShift?.shiftType === 'night' || nextDayShift?.shiftType === 'extended';

  // Just came off nights → recovery day
  if (prevWasNight && !nextIsNight) {
    return 'recovery';
  }

  // Day off before nights start → transition to nights
  if (!prevWasNight && nextIsNight) {
    return 'transition-to-nights';
  }

  // Came off nights AND going back to days → transition to days
  if (prevWasNight && nextIsNight) {
    // Still in a night stretch, but no shift today — likely mid-stretch off
    return 'off';
  }

  return 'off';
}

/**
 * Get personal events that fall on a specific day.
 */
function getPersonalEventsForDay(date: Date, events: PersonalEvent[]): PersonalEvent[] {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return events.filter(
    (e) =>
      isWithinInterval(e.start, { start: dayStart, end: dayEnd }) ||
      isWithinInterval(e.end, { start: dayStart, end: dayEnd }) ||
      (e.start <= dayStart && e.end >= dayEnd)
  );
}

/**
 * Main classification function.
 *
 * Takes a date range, shifts, and personal events, and produces
 * a ClassifiedDay for each day in the range.
 *
 * The classification considers:
 * 1. What shift (if any) falls on this day
 * 2. What shift was on the previous day (for transition detection)
 * 3. What shift is on the next day (for pre-shift preparation)
 * 4. Personal events that may conflict with sleep windows
 */
export function classifyDays(
  startDate: Date,
  endDate: Date,
  shifts: ShiftEvent[],
  personalEvents: PersonalEvent[] = [],
): ClassifiedDay[] {
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Pre-compute shift assignments for each day (including buffer days)
  const bufferStart = addDays(startDate, -1);
  const bufferEnd = addDays(endDate, 1);
  const allDays = eachDayOfInterval({ start: bufferStart, end: bufferEnd });

  const shiftsByDay = new Map<string, ShiftEvent | null>();
  for (const day of allDays) {
    shiftsByDay.set(day.toISOString(), findShiftForDay(day, shifts));
  }

  return days.map((date) => {
    const prevDay = addDays(date, -1);
    const nextDay = addDays(date, 1);

    const shift = shiftsByDay.get(date.toISOString()) ?? null;
    const prevShift = shiftsByDay.get(prevDay.toISOString()) ?? null;
    const nextShift = shiftsByDay.get(nextDay.toISOString()) ?? null;

    const dayType = classifyDayType(date, shift, prevShift, nextShift);
    const dayPersonalEvents = getPersonalEventsForDay(date, personalEvents);

    return {
      date,
      dayType,
      shift,
      personalEvents: dayPersonalEvents,
    };
  });
}

/**
 * Detect shift patterns in a list of classified days.
 * Useful for summary stats and the sleep intelligence report.
 */
export function detectPatterns(classifiedDays: ClassifiedDay[]): {
  nightStretchLengths: number[];
  hardTransitions: number;
  consecutiveWorkDays: number;
} {
  let nightStretchLengths: number[] = [];
  let currentNightStreak = 0;
  let hardTransitions = 0;
  let consecutiveWorkDays = 0;
  let maxConsecutiveWork = 0;

  for (let i = 0; i < classifiedDays.length; i++) {
    const day = classifiedDays[i];
    const prevDay = i > 0 ? classifiedDays[i - 1] : null;

    // Track night stretches
    if (day.dayType === 'work-night') {
      currentNightStreak++;
    } else if (currentNightStreak > 0) {
      nightStretchLengths.push(currentNightStreak);
      currentNightStreak = 0;
    }

    // Track hard transitions (night → day or day → night with only 1 day off)
    if (day.dayType === 'transition-to-nights' || day.dayType === 'recovery') {
      hardTransitions++;
    }

    // Track consecutive work days
    if (day.dayType.startsWith('work-')) {
      consecutiveWorkDays++;
      maxConsecutiveWork = Math.max(maxConsecutiveWork, consecutiveWorkDays);
    } else {
      consecutiveWorkDays = 0;
    }
  }

  // Don't forget the last streak
  if (currentNightStreak > 0) {
    nightStretchLengths.push(currentNightStreak);
  }

  return {
    nightStretchLengths,
    hardTransitions,
    consecutiveWorkDays: maxConsecutiveWork,
  };
}
