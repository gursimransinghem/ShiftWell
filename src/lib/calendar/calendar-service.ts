/**
 * Apple Calendar service.
 *
 * Provides read + write operations for Apple Calendar via expo-calendar.
 * All functions are pure async — no side effects on Zustand store.
 * Store updates are the responsibility of the caller.
 */

import * as ExpoCalendar from 'expo-calendar';
import { format, addDays } from 'date-fns';
import type { RawCalendarEvent, CalendarMeta } from './calendar-types';
import type { PlanBlock } from '../circadian/types';
import { useCalendarStore } from './calendar-store';
import { useShiftsStore } from '../../store/shifts-store';
import { shiftConfidence } from './shift-detector';
import { fetchGoogleEvents, fetchGoogleEventsDelta } from './google-calendar-api';

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

// ──────────────────────────────────────────────────────────────────────────────
// Sync orchestrator
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Compute event duration in hours.
 */
function durationInHours(evt: RawCalendarEvent): number {
  return (evt.end.getTime() - evt.start.getTime()) / (1000 * 3600);
}

/**
 * Full calendar sync orchestrator.
 *
 * Handles:
 * - Apple Calendar full fetch
 * - Google Calendar delta sync (with 410/syncToken expiry fallback)
 * - Additive path: newly detected shifts are added to shifts-store
 * - Deletion path (D-16): shifts no longer in calendar are removed from store,
 *   orphaned sleep block events are cleaned up, and a recalculation flag is
 *   set for Phase 3's Circadian Reset algorithm
 *
 * NOTE on D-10 (two-tier write strategy): Phase 2 only writes sleep blocks
 * (main-sleep, nap) to the ShiftWell calendar. Full plan items — caffeine
 * cutoff, meal timing, light protocols — are intentionally deferred to Phase 3
 * when the circadian algorithm produces them.
 */
export async function runCalendarSync(): Promise<void> {
  const calStore = useCalendarStore.getState();
  const shiftsStore = useShiftsStore.getState();
  const now = new Date();
  const endDate = addDays(now, 28);

  // ── 1. Fetch current calendar events ────────────────────────────────────────
  let allEvents: RawCalendarEvent[] = [];

  if (calStore.appleConnected) {
    const appleIds = calStore.getEnabledAppleCalendarIds();
    if (appleIds.length > 0) {
      const appleEvents = await fetchAppleEvents(appleIds, now, endDate);
      allEvents.push(...appleEvents);
    }
  }

  if (calStore.googleConnected && calStore.googleAccessToken) {
    const googleIds = calStore.getEnabledGoogleCalendarIds();
    for (const gCalId of googleIds) {
      const syncToken = calStore.googleSyncTokens[gCalId];
      if (syncToken) {
        const delta = await fetchGoogleEventsDelta(gCalId, calStore.googleAccessToken, syncToken);
        if (delta.nextSyncToken) {
          calStore.updateGoogleSyncToken(gCalId, delta.nextSyncToken);
          allEvents.push(...delta.events);
        } else {
          // 410 Gone — syncToken expired, fall back to full fetch
          const events = await fetchGoogleEvents([gCalId], calStore.googleAccessToken, now, endDate);
          allEvents.push(...events);
        }
      } else {
        const events = await fetchGoogleEvents([gCalId], calStore.googleAccessToken, now, endDate);
        allEvents.push(...events);
      }
    }
  }

  // ── 2. Run shift detection on fetched events ─────────────────────────────────
  const workCalId = calStore.workCalendarId;
  const scoredEvents = allEvents.map((evt) => ({
    ...evt,
    confidence: shiftConfidence(evt.title, durationInHours(evt), {
      isWorkCalendar: !!workCalId && evt.calendarId === workCalId,
    }),
  }));

  const detectedShiftIds = new Set(
    scoredEvents.filter((e) => e.confidence >= 0.80).map((e) => e.id),
  );

  // ── 3. Additive path — add newly detected shifts ─────────────────────────────
  const existingShiftIds = new Set(shiftsStore.shifts.map((s) => s.id));
  for (const evt of scoredEvents) {
    if (evt.confidence >= 0.80 && !existingShiftIds.has(evt.id)) {
      shiftsStore.addShift({
        id: evt.id,
        title: evt.title,
        start: evt.start,
        end: evt.end,
        shiftType: 'day', // classifyShiftType is called inside addShift
        source: 'calendar',
      } as Parameters<typeof shiftsStore.addShift>[0]);
    }
  }

  // ── 4. Deletion path (D-16) ──────────────────────────────────────────────────
  // Compare: calendar-synced shifts in store vs. shifts still present in calendar
  const previousCalendarShiftIds = shiftsStore.getCalendarSyncedShiftIds();
  const removedShiftIds = previousCalendarShiftIds.filter((id) => !detectedShiftIds.has(id));

  for (const removedId of removedShiftIds) {
    // 4a. Remove shift from shifts-store
    shiftsStore.removeShift(removedId);

    // 4b. Clean up orphaned sleep block calendar events
    // planBlockId convention: "{shiftId}-sleep-{n}" or "{shiftId}-nap-{n}" — match prefix
    const eventIdMap = calStore.eventIdMap;
    for (const [calEventId, planBlockId] of Object.entries(eventIdMap)) {
      if (planBlockId.startsWith(removedId)) {
        try {
          const swCalId = calStore.shiftWellCalendarId;
          if (swCalId) await deleteSleepBlock(calEventId, swCalId);
          calStore.removeEventId(calEventId);
        } catch {
          // Best-effort cleanup — log but don't fail sync
          console.warn(`[CalendarSync] Failed to delete orphaned sleep block event ${calEventId}`);
        }
      }
    }

    // 4c. Set recalculation flag for Phase 3's Circadian Reset algorithm (D-16)
    // Phase 3 will check recalculationNeeded and optimize sleep for the freed time
    shiftsStore.markRecalculationNeeded(removedId);
  }

  // ── 5. Update sync timestamp ─────────────────────────────────────────────────
  calStore.setLastSyncedAt(now.toISOString());
}
