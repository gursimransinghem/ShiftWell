/**
 * Shift detector module.
 *
 * Provides utilities for detecting and classifying shifts
 * from raw calendar events. Used when importing a user's
 * entire calendar (not just a shift-specific export).
 */

import { classifyShiftType } from '../circadian/classify-shifts';
import type { ShiftEvent, PersonalEvent } from '../circadian/types';

/**
 * Separate a mixed list of calendar events into shifts and personal events.
 *
 * Uses duration and keyword heuristics to classify events.
 * The user should always confirm the classification.
 */
export function separateShiftsFromPersonal(
  events: Array<{ id: string; title: string; start: Date; end: Date }>,
): {
  shifts: ShiftEvent[];
  personal: PersonalEvent[];
} {
  const shifts: ShiftEvent[] = [];
  const personal: PersonalEvent[] = [];

  for (const event of events) {
    const durationMs = event.end.getTime() - event.start.getTime();
    const durationHours = durationMs / (1000 * 3600);

    // Shifts are typically 6-28 hours
    // All-day events (exactly 24h) are usually PTO/holidays
    const isShiftLength = durationHours >= 5.5 && durationHours <= 28 && durationHours !== 24;

    if (isShiftLength) {
      shifts.push({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        shiftType: classifyShiftType(event.start, event.end),
      });
    } else {
      personal.push({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
      });
    }
  }

  return { shifts, personal };
}

/**
 * Create a ShiftEvent from manual entry data.
 */
export function createShiftEvent(
  title: string,
  start: Date,
  end: Date,
  id?: string,
): ShiftEvent {
  return {
    id: id ?? crypto.randomUUID(),
    title,
    start,
    end,
    shiftType: classifyShiftType(start, end),
  };
}
