/**
 * Google Calendar REST API client.
 *
 * Provides typed wrappers around the Google Calendar v3 REST API.
 * All functions accept an OAuth access token and make fetch calls directly —
 * no dependency on the Google SDK at runtime (SDK is only used for auth).
 *
 * API reference: https://developers.google.com/calendar/api/v3/reference
 */

import type { RawCalendarEvent, CalendarMeta } from './calendar-types';

const GCAL_BASE = 'https://www.googleapis.com/calendar/v3';

// ──────────────────────────────────────────────────────────────────────────────
// Calendar list
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated user's Google Calendar list.
 * Returns all calendars mapped to CalendarMeta with source='google'.
 */
export async function fetchGoogleCalendarList(accessToken: string): Promise<CalendarMeta[]> {
  const res = await fetch(`${GCAL_BASE}/users/me/calendarList`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    return [];
  }

  const data: {
    items: Array<{
      id: string;
      summary: string;
      backgroundColor: string | null;
      accessRole: string;
    }>;
  } = await res.json();

  return (data.items ?? []).map((item) => ({
    id: item.id,
    title: item.summary,
    color: item.backgroundColor ?? '#4285F4',
    enabled: true,
    source: 'google' as const,
    allowsModifications: item.accessRole === 'owner' || item.accessRole === 'writer',
  }));
}

// ──────────────────────────────────────────────────────────────────────────────
// Event fetch helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Map a raw Google Calendar API event item to RawCalendarEvent.
 * Returns null if the event is cancelled or lacks start/end times.
 */
function mapGoogleEventItem(
  item: {
    id: string;
    summary?: string;
    status?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
  },
  calendarId: string,
): RawCalendarEvent | null {
  if (item.status === 'cancelled') return null;

  const isAllDay = !!item.start?.date && !item.start?.dateTime;
  const startStr = item.start?.dateTime ?? item.start?.date;
  const endStr = item.end?.dateTime ?? item.end?.date;

  if (!startStr || !endStr) return null;

  return {
    id: item.id,
    title: item.summary ?? '',
    start: new Date(startStr),
    end: new Date(endStr),
    calendarId,
    source: 'google' as const,
    allDay: isAllDay,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Full fetch
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Fetch Google Calendar events for one or more calendars over a date range.
 *
 * Graceful degradation: if a single calendar returns a non-ok response,
 * logs a warning and continues — does NOT throw.
 */
export async function fetchGoogleEvents(
  calendarIds: string[],
  accessToken: string,
  startDate: Date,
  endDate: Date,
): Promise<RawCalendarEvent[]> {
  const allEvents: RawCalendarEvent[] = [];

  for (const calendarId of calendarIds) {
    const params = new URLSearchParams({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: 'true',
      maxResults: '250',
    });

    const res = await fetch(
      `${GCAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      console.warn(`[GoogleCalendar] Failed to fetch events for calendar ${calendarId}: HTTP ${res.status}`);
      continue;
    }

    const data: { items?: Array<Record<string, unknown>> } = await res.json();
    for (const item of data.items ?? []) {
      const mapped = mapGoogleEventItem(item as Parameters<typeof mapGoogleEventItem>[0], calendarId);
      if (mapped) allEvents.push(mapped);
    }
  }

  return allEvents;
}

// ──────────────────────────────────────────────────────────────────────────────
// Delta sync
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Fetch only changed events since the last sync using a syncToken.
 *
 * On HTTP 410 (syncToken expired), returns { events: [], nextSyncToken: null }
 * — the caller is responsible for doing a full re-fetch in this case.
 */
export async function fetchGoogleEventsDelta(
  calendarId: string,
  accessToken: string,
  syncToken: string,
): Promise<{ events: RawCalendarEvent[]; nextSyncToken: string | null }> {
  const params = new URLSearchParams({
    syncToken,
    singleEvents: 'true',
  });

  const res = await fetch(
    `${GCAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  // HTTP 410 = syncToken expired — caller must do full re-fetch
  if (res.status === 410) {
    return { events: [], nextSyncToken: null };
  }

  if (!res.ok) {
    console.warn(`[GoogleCalendar] Delta sync failed for calendar ${calendarId}: HTTP ${res.status}`);
    return { events: [], nextSyncToken: null };
  }

  const data: {
    items?: Array<Record<string, unknown>>;
    nextSyncToken?: string;
  } = await res.json();

  const events: RawCalendarEvent[] = [];
  for (const item of data.items ?? []) {
    const mapped = mapGoogleEventItem(item as Parameters<typeof mapGoogleEventItem>[0], calendarId);
    if (mapped) events.push(mapped);
  }

  return {
    events,
    nextSyncToken: data.nextSyncToken ?? null,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Write operations
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Create a new event in a Google Calendar.
 * Returns the created event ID.
 *
 * Title format follows D-13: "Sleep — 11:00 PM" or "Nap — 2:30 PM"
 */
export async function createGoogleEvent(
  calendarId: string,
  accessToken: string,
  event: { title: string; start: Date; end: Date; description?: string },
): Promise<string> {
  const res = await fetch(
    `${GCAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: event.title,
        start: { dateTime: event.start.toISOString() },
        end: { dateTime: event.end.toISOString() },
        description: event.description,
      }),
    },
  );

  const data: { id: string } = await res.json();
  return data.id;
}

/**
 * Delete an event from a Google Calendar.
 */
export async function deleteGoogleEvent(
  calendarId: string,
  accessToken: string,
  eventId: string,
): Promise<void> {
  await fetch(
    `${GCAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
}
