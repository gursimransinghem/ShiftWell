/**
 * Shift detector module.
 *
 * Provides utilities for detecting and classifying shifts
 * from raw calendar events. Used when importing a user's
 * entire calendar (not just a shift-specific export).
 *
 * Extended with confidence scoring (0.0-1.0) for probabilistic
 * shift detection using keyword + duration + negative keyword heuristics.
 */

import { classifyShiftType } from '../circadian/classify-shifts';
import type { ShiftEvent, PersonalEvent } from '../circadian/types';

/**
 * Keywords that strongly suggest a work shift.
 */
export const SHIFT_KEYWORDS: string[] = [
  'shift', 'er', 'icu', 'nicu', 'picu', 'or', 'ed',
  'night', 'day shift', 'evening', 'coverage', 'on call',
  'on-call', 'oncall', 'float', 'charge', 'triage', 'trauma',
  'code', 'rapid', 'resus',
];

/**
 * Keywords that strongly suggest this is NOT a work shift.
 */
export const NEGATIVE_KEYWORDS: string[] = [
  'appointment', 'flight', 'travel', 'vacation', 'trip',
  'conference', 'meeting', 'lunch', 'dinner',
  'wedding', 'doctor', 'dentist', 'therapy', 'class', 'lecture',
];

/**
 * Compute a confidence score (0.0–1.0) that a calendar event is a work shift.
 *
 * Rules:
 * - isWorkCalendar=true → 1.0 (D-07 heuristic bypass)
 * - All-day events (24h exactly) → 0 (PTO / holiday)
 * - Duration < 5.5h → 0 (too short for a clinical shift)
 * - Negative keyword match → 0
 * - Duration in shift range (6–28h) + keyword match → 0.95
 * - Duration in shift range (6–28h), no keyword → 0.70
 */
export function shiftConfidence(
  summary: string,
  durationHours: number,
  options?: { isWorkCalendar?: boolean },
): number {
  if (options?.isWorkCalendar) return 1.0;
  if (durationHours === 24) return 0;   // All-day = not a shift
  if (durationHours < 5.5) return 0;    // Too short

  const lower = summary.toLowerCase();
  const hasNegative = NEGATIVE_KEYWORDS.some((kw) => lower.includes(kw));
  if (hasNegative) return 0;

  const hasKeyword = SHIFT_KEYWORDS.some((kw) => lower.includes(kw));
  const isShiftLength = durationHours >= 6 && durationHours <= 28;

  if (isShiftLength && hasKeyword) return 0.95;
  if (isShiftLength) return 0.70;
  return 0;
}

/**
 * Separate events into shifts and personal with attached confidence scores.
 *
 * @param events - Raw calendar events to classify
 * @param options.workCalendarId - If set, events from this calendar get confidence 1.0
 * @param options.eventCalendarIds - Map of eventId → calendarId for work calendar check
 */
export function separateShiftsFromPersonalWithConfidence(
  events: Array<{ id: string; title: string; start: Date; end: Date }>,
  options?: {
    workCalendarId?: string | null;
    eventCalendarIds?: Record<string, string>;
  },
): {
  shifts: ShiftEvent[];
  personal: PersonalEvent[];
  confidenceMap: Record<string, number>;
} {
  const shifts: ShiftEvent[] = [];
  const personal: PersonalEvent[] = [];
  const confidenceMap: Record<string, number> = {};

  for (const event of events) {
    const durationMs = event.end.getTime() - event.start.getTime();
    const durationHours = durationMs / (1000 * 3600);

    const eventCalendarId = options?.eventCalendarIds?.[event.id];
    const isWorkCalendar =
      !!options?.workCalendarId &&
      !!eventCalendarId &&
      eventCalendarId === options.workCalendarId;

    const confidence = shiftConfidence(event.title, durationHours, { isWorkCalendar });
    confidenceMap[event.id] = confidence;

    if (confidence >= 0.50 || isWorkCalendar) {
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

  return { shifts, personal, confidenceMap };
}

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
