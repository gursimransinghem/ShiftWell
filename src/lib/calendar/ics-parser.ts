/**
 * ICS file parser.
 *
 * Parses .ics (iCalendar RFC 5545) files into ShiftEvent arrays.
 * Uses ical.js for robust parsing of recurring events, timezones,
 * and various calendar vendor quirks (Google, Apple, QGenda, etc.).
 */

import ICAL from 'ical.js';
import { classifyShiftType } from '../circadian/classify-shifts';
import type { ShiftEvent, PersonalEvent } from '../circadian/types';

type RawCalendarEvent = {
  uid: string;
  summary: string;
  start: Date;
  end: Date;
  durationHours: number;
};

/**
 * Parse an ICS string into raw calendar events.
 */
function parseICSToEvents(icsString: string): RawCalendarEvent[] {
  let jcalData: ReturnType<typeof ICAL.parse>;
  try {
    jcalData = ICAL.parse(icsString);
  } catch {
    return [];
  }
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');

  const events: RawCalendarEvent[] = [];

  for (const vevent of vevents) {
    try {
      const event = new ICAL.Event(vevent);
      const uid = event.uid || crypto.randomUUID();
      const summary = event.summary || 'Untitled Event';

      if (event.isRecurring()) {
        // Expand recurring events for the next 4 weeks
        const iterator = event.iterator();
        const fourWeeksFromNow = new Date();
        fourWeeksFromNow.setDate(fourWeeksFromNow.getDate() + 28);

        let occurrence = iterator.next();
        let count = 0;
        const maxOccurrences = 100; // Safety limit

        while (occurrence && count < maxOccurrences) {
          const start = occurrence.toJSDate();
          if (!start || isNaN(start.getTime())) { occurrence = iterator.next(); count++; continue; }
          if (start > fourWeeksFromNow) break;

          const duration = event.duration;
          const durationMs = duration
            ? (duration.weeks * 7 * 24 * 3600 + duration.days * 24 * 3600 + duration.hours * 3600 + duration.minutes * 60) * 1000
            : event.endDate && event.startDate
            ? event.endDate.toJSDate().getTime() - event.startDate.toJSDate().getTime()
            : 0;
          if (durationMs <= 0) { occurrence = iterator.next(); count++; continue; }
          const end = new Date(start.getTime() + durationMs);
          const durationHours = durationMs / (1000 * 3600);

          if (start >= new Date()) {
            events.push({
              uid: `${uid}-${count}`,
              summary,
              start,
              end,
              durationHours,
            });
          }

          occurrence = iterator.next();
          count++;
        }
      } else {
        if (!event.startDate || !event.endDate) continue;
        const start = event.startDate.toJSDate();
        const end = event.endDate.toJSDate();
        if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 3600);

        events.push({ uid, summary, start, end, durationHours });
      }
    } catch {
      // Skip malformed events — don't let one bad event abort the whole parse
      continue;
    }
  }

  return events;
}

/**
 * Keywords that suggest an event is a work shift.
 * Case-insensitive matching.
 */
const SHIFT_KEYWORDS = [
  'shift', 'ed', 'er', 'icu', 'nicu', 'picu', 'operating room', 'night',
  'day shift', 'night shift', 'evening shift', 'swing',
  'on call', 'on-call', 'oncall', 'coverage', 'clinical',
  'hospital', 'clinic', 'rounds', 'trauma', 'code',
  'qgenda', 'amion', 'schedule',
  // Common abbreviations
  'ns', 'ds', 'es',
];

const NEGATIVE_SHIFT_KEYWORDS = [
  'flight',
  'conference',
  'vacation',
  'pto',
  'holiday',
  'travel',
  'wedding',
  'birthday',
  'concert',
  'training',
  'workshop',
  'seminar',
  'appointment',
];

/**
 * Determine if an event is likely a work shift based on heuristics.
 *
 * Heuristics:
 * 1. Duration >= 6 hours (most shifts are 8-12h+)
 * 2. Title contains shift-related keywords
 * 3. NOT an all-day event (those are usually holidays, PTO)
 */
export function isLikelyShift(
  summary: string,
  durationHours: number,
): boolean {
  // All-day events (24h exactly) are usually not shifts
  if (durationHours === 24) return false;

  // Short events are not shifts
  if (durationHours < 5.5) return false;

  // If duration is 6-28h, it's shift-length
  if (durationHours >= 6 && durationHours <= 28) {
    const lowerSummary = summary.toLowerCase();
    const hasNegativeKeyword = NEGATIVE_SHIFT_KEYWORDS.some((kw) => lowerSummary.includes(kw));
    if (hasNegativeKeyword) return false;

    const hasKeyword = SHIFT_KEYWORDS.some((kw) => lowerSummary.includes(kw));

    return hasKeyword;
  }

  return false;
}

/**
 * Parse an ICS file and extract detected shifts.
 *
 * Returns both detected shifts and non-shift events so the user
 * can confirm which are actually shifts.
 */
export function parseICSForShifts(icsString: string): {
  detectedShifts: ShiftEvent[];
  otherEvents: PersonalEvent[];
  allEvents: Array<{
    uid: string;
    summary: string;
    start: Date;
    end: Date;
    durationHours: number;
    isLikelyShift: boolean;
  }>;
} {
  const rawEvents = parseICSToEvents(icsString);

  const detectedShifts: ShiftEvent[] = [];
  const otherEvents: PersonalEvent[] = [];

  const allEvents = rawEvents.map((e) => {
    const likely = isLikelyShift(e.summary, e.durationHours);
    return { ...e, isLikelyShift: likely };
  });

  for (const event of allEvents) {
    if (event.isLikelyShift) {
      detectedShifts.push({
        id: event.uid,
        title: event.summary,
        start: event.start,
        end: event.end,
        shiftType: classifyShiftType(event.start, event.end),
      });
    } else {
      otherEvents.push({
        id: event.uid,
        title: event.summary,
        start: event.start,
        end: event.end,
      });
    }
  }

  return { detectedShifts, otherEvents, allEvents };
}
