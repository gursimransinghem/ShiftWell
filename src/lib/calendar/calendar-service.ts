/**
 * Apple Calendar service.
 *
 * Provides read + write operations for Apple Calendar via expo-calendar.
 * All functions are pure async — no side effects on Zustand store.
 * Store updates are the responsibility of the caller.
 */

import * as ExpoCalendar from 'expo-calendar';
import { format } from 'date-fns';
import type { RawCalendarEvent, CalendarMeta } from './calendar-types';
import type { PlanBlock } from '../circadian/types';

/**
 * Request full calendar access permission.
 * Returns true if granted, false otherwise.
 */
export async function requestCalendarAccess(): Promise<boolean> {
  const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

/**
 * Fetch all Apple calendars and return as CalendarMeta[].
 * All calendars start with enabled=true.
 */
export async function fetchAppleCalendars(): Promise<CalendarMeta[]> {
  const rawCalendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
  return rawCalendars.map((cal: any) => ({
    id: cal.id,
    title: cal.title,
    color: cal.color ?? '#888888',
    enabled: true,
    source: 'apple' as const,
    allowsModifications: cal.allowsModifications ?? false,
  }));
}

/**
 * Fetch Apple Calendar events for the given calendar IDs and date range.
 * Filters out all-day events.
 */
export async function fetchAppleEvents(
  calendarIds: string[],
  startDate: Date,
  endDate: Date,
): Promise<RawCalendarEvent[]> {
  const rawEvents = await ExpoCalendar.getEventsAsync(calendarIds, startDate, endDate);
  return rawEvents
    .filter((evt: any) => !evt.allDay)
    .map((evt: any) => ({
      id: evt.id,
      title: evt.title ?? '',
      start: new Date(evt.startDate),
      end: new Date(evt.endDate),
      calendarId: evt.calendarId,
      source: 'apple' as const,
      allDay: evt.allDay ?? false,
    }));
}

/**
 * Get the existing ShiftWell calendar ID, or create one if it doesn't exist.
 * Uses the brand purple (#6B5CE7) as the calendar color.
 */
export async function getOrCreateShiftWellCalendar(): Promise<string> {
  const allCalendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
  const existing = allCalendars.find((cal: any) => cal.title === 'ShiftWell');

  if (existing) {
    return existing.id;
  }

  const defaultCalendar = await ExpoCalendar.getDefaultCalendarAsync();

  const newCalendarId = await ExpoCalendar.createCalendarAsync({
    title: 'ShiftWell',
    color: '#6B5CE7',
    entityType: ExpoCalendar.EntityTypes.EVENT,
    sourceId: (defaultCalendar as any).source?.id,
    source: (defaultCalendar as any).source,
    name: 'ShiftWell',
    ownerAccount: 'personal',
    accessLevel: ExpoCalendar.CalendarAccessLevel.OWNER,
  });

  return newCalendarId;
}

/**
 * Format a block start time as "h:mm A" (e.g. "11:00 PM", "2:30 PM").
 */
function formatBlockTime(date: Date): string {
  return format(date, 'h:mm a').replace('am', 'AM').replace('pm', 'PM');
}

/**
 * Build the calendar event title for a sleep block per D-13:
 * - main-sleep: "Sleep — 11:00 PM"
 * - nap: "Nap — 2:30 PM"
 */
function buildSleepBlockTitle(block: PlanBlock): string {
  const timeStr = formatBlockTime(block.start);
  if (block.type === 'nap') {
    return `Nap — ${timeStr}`;
  }
  return `Sleep — ${timeStr}`;
}

/**
 * Write a sleep block to the Apple Calendar.
 * Returns the created event ID.
 */
export async function writeSleepBlock(block: PlanBlock, calendarId: string): Promise<string> {
  const title = buildSleepBlockTitle(block);
  const eventId = await ExpoCalendar.createEventAsync(calendarId, {
    title,
    startDate: block.start,
    endDate: block.end,
    notes: block.description,
    alarms: block.priority === 1 ? [{ relativeOffset: -15 }] : [],
  });
  return eventId;
}

/**
 * Update an existing sleep block in Apple Calendar.
 * Returns the updated event ID.
 */
export async function updateSleepBlock(
  eventId: string,
  block: PlanBlock,
  calendarId: string,
): Promise<string> {
  const title = buildSleepBlockTitle(block);
  const updatedId = await ExpoCalendar.updateEventAsync(eventId, {
    title,
    startDate: block.start,
    endDate: block.end,
    notes: block.description,
    alarms: block.priority === 1 ? [{ relativeOffset: -15 }] : [],
  });
  return updatedId;
}

/**
 * Delete a sleep block from Apple Calendar.
 */
export async function deleteSleepBlock(eventId: string, _calendarId: string): Promise<void> {
  await ExpoCalendar.deleteEventAsync(eventId);
}
