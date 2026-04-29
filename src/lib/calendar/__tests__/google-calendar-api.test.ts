/**
 * Tests for Google Calendar REST API client.
 *
 * Mocks global fetch — no network calls in tests.
 */

import {
  fetchGoogleCalendarList,
  fetchGoogleEvents,
  fetchGoogleEventsDelta,
  createGoogleEvent,
  deleteGoogleEvent,
} from '../google-calendar-api';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function makeFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

const ACCESS_TOKEN = 'test-access-token';

// ──────────────────────────────────────────────────────────────────────────────
// fetchGoogleCalendarList
// ──────────────────────────────────────────────────────────────────────────────

describe('fetchGoogleCalendarList', () => {
  const calendarListResponse = {
    items: [
      {
        id: 'primary',
        summary: 'Primary Calendar',
        backgroundColor: '#4285F4',
        accessRole: 'owner',
      },
      {
        id: 'work@example.com',
        summary: 'Work Calendar',
        backgroundColor: '#DB4437',
        accessRole: 'writer',
      },
      {
        id: 'shared@example.com',
        summary: 'Shared Calendar',
        backgroundColor: null,
        accessRole: 'reader',
      },
    ],
  };

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(makeFetchResponse(calendarListResponse));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Test 1: returns CalendarMeta[] from REST response', async () => {
    const result = await fetchGoogleCalendarList(ACCESS_TOKEN);
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      id: 'primary',
      title: 'Primary Calendar',
      color: '#4285F4',
      enabled: true,
    });
  });

  it('Test 2: sets source="google" on all returned items', async () => {
    const result = await fetchGoogleCalendarList(ACCESS_TOKEN);
    expect(result.every((cal) => cal.source === 'google')).toBe(true);
  });

  it('uses the default color when backgroundColor is null', async () => {
    const result = await fetchGoogleCalendarList(ACCESS_TOKEN);
    expect(result[2].color).toBe('#4285F4');
  });

  it('sets allowsModifications=true for owner/writer roles', async () => {
    const result = await fetchGoogleCalendarList(ACCESS_TOKEN);
    expect(result[0].allowsModifications).toBe(true); // owner
    expect(result[1].allowsModifications).toBe(true); // writer
    expect(result[2].allowsModifications).toBe(false); // reader
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// fetchGoogleEvents
// ──────────────────────────────────────────────────────────────────────────────

describe('fetchGoogleEvents', () => {
  const startDate = new Date('2026-04-01T00:00:00Z');
  const endDate = new Date('2026-04-29T00:00:00Z');

  const eventsResponse = {
    items: [
      {
        id: 'evt1',
        summary: 'Night Shift',
        status: 'confirmed',
        start: { dateTime: '2026-04-10T19:00:00Z' },
        end: { dateTime: '2026-04-11T07:00:00Z' },
      },
      {
        id: 'evt2',
        summary: 'Day Off',
        status: 'cancelled',
        start: { dateTime: '2026-04-12T00:00:00Z' },
        end: { dateTime: '2026-04-12T23:59:00Z' },
      },
      {
        id: 'evt3',
        summary: 'PTO',
        status: 'confirmed',
        start: { date: '2026-04-15' },
        end: { date: '2026-04-16' },
      },
    ],
  };

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(makeFetchResponse(eventsResponse));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Test 3: returns RawCalendarEvent[] for a date range', async () => {
    const result = await fetchGoogleEvents(['cal1'], ACCESS_TOKEN, startDate, endDate);
    // 1 confirmed timed event + 1 all-day event = 2 (cancelled is skipped)
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toMatchObject({
      id: 'evt1',
      title: 'Night Shift',
      source: 'google',
      calendarId: 'cal1',
    });
  });

  it('Test 4: skips cancelled events (status === "cancelled")', async () => {
    const result = await fetchGoogleEvents(['cal1'], ACCESS_TOKEN, startDate, endDate);
    const ids = result.map((e) => e.id);
    expect(ids).not.toContain('evt2');
  });

  it('Test 5: filters all-day events (date instead of dateTime)', async () => {
    const result = await fetchGoogleEvents(['cal1'], ACCESS_TOKEN, startDate, endDate);
    const allDay = result.find((e) => e.id === 'evt3');
    expect(allDay).toBeUndefined();
  });

  it('Test 8: gracefully returns [] on non-ok response per calendar (no throw)', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeFetchResponse({ error: 'Unauthorized' }, 401));
    const result = await fetchGoogleEvents(['cal1'], ACCESS_TOKEN, startDate, endDate);
    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// fetchGoogleEventsDelta
// ──────────────────────────────────────────────────────────────────────────────

describe('fetchGoogleEventsDelta', () => {
  const SYNC_TOKEN = 'sync-token-abc';

  const deltaResponse = {
    items: [
      {
        id: 'evt4',
        summary: 'ER Shift',
        status: 'confirmed',
        start: { dateTime: '2026-04-20T07:00:00Z' },
        end: { dateTime: '2026-04-20T19:00:00Z' },
      },
    ],
    nextSyncToken: 'new-sync-token-xyz',
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Test 6: returns events and nextSyncToken', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeFetchResponse(deltaResponse));
    const result = await fetchGoogleEventsDelta('cal1', ACCESS_TOKEN, SYNC_TOKEN);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].id).toBe('evt4');
    expect(result.nextSyncToken).toBe('new-sync-token-xyz');
  });

  it('Test 7: returns { events: [], nextSyncToken: null } on HTTP 410 (token expired)', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeFetchResponse({ error: 'Gone' }, 410));
    const result = await fetchGoogleEventsDelta('cal1', ACCESS_TOKEN, SYNC_TOKEN);
    expect(result).toEqual({ events: [], nextSyncToken: null });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// createGoogleEvent
// ──────────────────────────────────────────────────────────────────────────────

describe('createGoogleEvent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Test 9: sends POST with correct title format "Sleep — 11:00 PM"', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeFetchResponse({ id: 'new-event-id' }));

    const start = new Date('2026-04-10T23:00:00Z');
    const end = new Date('2026-04-11T07:00:00Z');
    await createGoogleEvent('cal1', ACCESS_TOKEN, {
      title: 'Sleep — 11:00 PM',
      start,
      end,
      description: 'Main sleep block',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('cal1/events'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Sleep — 11:00 PM'),
      }),
    );
  });

  it('returns the created event ID', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeFetchResponse({ id: 'new-event-id' }));

    const result = await createGoogleEvent('cal1', ACCESS_TOKEN, {
      title: 'Sleep — 11:00 PM',
      start: new Date('2026-04-10T23:00:00Z'),
      end: new Date('2026-04-11T07:00:00Z'),
    });
    expect(result).toBe('new-event-id');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// deleteGoogleEvent
// ──────────────────────────────────────────────────────────────────────────────

describe('deleteGoogleEvent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Test 10: sends DELETE request', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeFetchResponse(null, 204));

    await deleteGoogleEvent('cal1', ACCESS_TOKEN, 'evt-to-delete');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('evt-to-delete'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
