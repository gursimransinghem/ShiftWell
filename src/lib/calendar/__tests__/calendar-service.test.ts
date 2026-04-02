/**
 * calendar-service.test.ts
 *
 * Tests for the Apple CalendarService — permission, fetch, create, write, delete.
 * Uses the Jest mock for expo-calendar.
 */

import * as ExpoCalendar from 'expo-calendar';
import {
  requestCalendarAccess,
  fetchAppleCalendars,
  fetchAppleEvents,
  getOrCreateShiftWellCalendar,
  writeSleepBlock,
  deleteSleepBlock,
} from '../calendar-service';
import type { PlanBlock } from '../../circadian/types';

// ExpoCalendar is auto-mocked via moduleNameMapper in jest.config.js
const mockExpo = ExpoCalendar as jest.Mocked<typeof ExpoCalendar>;

beforeEach(() => {
  jest.clearAllMocks();
  // Reset default mock return values
  (mockExpo.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  (mockExpo.getCalendarsAsync as jest.Mock).mockResolvedValue([]);
  (mockExpo.getEventsAsync as jest.Mock).mockResolvedValue([]);
  (mockExpo.getDefaultCalendarAsync as jest.Mock).mockResolvedValue({
    id: 'default-cal-id',
    source: { id: 'default-source', name: 'iCloud', type: 'caldav' },
  });
  (mockExpo.createCalendarAsync as jest.Mock).mockResolvedValue('new-cal-id');
  (mockExpo.createEventAsync as jest.Mock).mockResolvedValue('new-event-id');
  (mockExpo.updateEventAsync as jest.Mock).mockResolvedValue('updated-event-id');
  (mockExpo.deleteEventAsync as jest.Mock).mockResolvedValue(undefined);
});

describe('requestCalendarAccess', () => {
  test('Test 1: calls requestCalendarPermissionsAsync and returns true on granted', async () => {
    const result = await requestCalendarAccess();
    expect(mockExpo.requestCalendarPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  test('Test 2: returns false on denied', async () => {
    (mockExpo.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });
    const result = await requestCalendarAccess();
    expect(result).toBe(false);
  });
});

describe('fetchAppleCalendars', () => {
  test('Test 3: returns CalendarMeta[] from getCalendarsAsync', async () => {
    (mockExpo.getCalendarsAsync as jest.Mock).mockResolvedValue([
      {
        id: 'cal-1',
        title: 'Work',
        color: '#FF0000',
        allowsModifications: true,
        source: { name: 'iCloud', type: 'caldav' },
      },
      {
        id: 'cal-2',
        title: 'Personal',
        color: '#00FF00',
        allowsModifications: false,
        source: { name: 'iCloud', type: 'caldav' },
      },
    ]);

    const calendars = await fetchAppleCalendars();

    expect(calendars).toHaveLength(2);
    expect(calendars[0].id).toBe('cal-1');
    expect(calendars[0].source).toBe('apple');
    expect(calendars[0].enabled).toBe(true);
    expect(calendars[0].allowsModifications).toBe(true);
    expect(calendars[1].allowsModifications).toBe(false);
  });
});

describe('fetchAppleEvents', () => {
  test('Test 4: maps expo-calendar events to RawCalendarEvent[]', async () => {
    const startDate = new Date('2026-04-01T00:00:00');
    const endDate = new Date('2026-04-07T23:59:59');

    (mockExpo.getEventsAsync as jest.Mock).mockResolvedValue([
      {
        id: 'evt-1',
        title: 'ER Night',
        startDate: '2026-04-01T19:00:00',
        endDate: '2026-04-02T07:00:00',
        calendarId: 'cal-1',
        allDay: false,
      },
      {
        id: 'evt-2',
        title: 'Vacation',
        startDate: '2026-04-03T00:00:00',
        endDate: '2026-04-04T00:00:00',
        calendarId: 'cal-1',
        allDay: true, // should be filtered out
      },
    ]);

    const events = await fetchAppleEvents(['cal-1'], startDate, endDate);

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('evt-1');
    expect(events[0].source).toBe('apple');
    expect(events[0].start).toBeInstanceOf(Date);
    expect(events[0].end).toBeInstanceOf(Date);
  });
});

describe('getOrCreateShiftWellCalendar', () => {
  test('Test 5: returns existing ID if ShiftWell calendar found', async () => {
    (mockExpo.getCalendarsAsync as jest.Mock).mockResolvedValue([
      { id: 'existing-shiftwell-id', title: 'ShiftWell', color: '#6B5CE7', allowsModifications: true },
    ]);

    const id = await getOrCreateShiftWellCalendar();

    expect(id).toBe('existing-shiftwell-id');
    expect(mockExpo.createCalendarAsync).not.toHaveBeenCalled();
  });

  test('Test 6: creates new calendar with color #6B5CE7 if not found', async () => {
    (mockExpo.getCalendarsAsync as jest.Mock).mockResolvedValue([
      { id: 'other-cal', title: 'Personal', color: '#FF0000', allowsModifications: true },
    ]);

    const id = await getOrCreateShiftWellCalendar();

    expect(id).toBe('new-cal-id');
    expect(mockExpo.createCalendarAsync).toHaveBeenCalledWith(
      expect.objectContaining({ color: '#6B5CE7', title: 'ShiftWell' }),
    );
  });
});

describe('writeSleepBlock', () => {
  const basePlanBlock: PlanBlock = {
    id: 'block-1',
    type: 'main-sleep',
    start: new Date('2026-04-02T23:00:00'),
    end: new Date('2026-04-03T07:00:00'),
    label: 'Main Sleep',
    description: 'Primary sleep period',
    priority: 1,
  };

  test('Test 7: creates event with title "Sleep — 11:00 PM" format (D-13)', async () => {
    const eventId = await writeSleepBlock(basePlanBlock, 'cal-1');

    expect(eventId).toBe('new-event-id');
    expect(mockExpo.createEventAsync).toHaveBeenCalledWith(
      'cal-1',
      expect.objectContaining({ title: 'Sleep — 11:00 PM' }),
    );
  });

  test('Test 8: nap creates event with title "Nap — 2:30 PM" format (D-13)', async () => {
    const napBlock: PlanBlock = {
      ...basePlanBlock,
      id: 'block-2',
      type: 'nap',
      start: new Date('2026-04-02T14:30:00'),
      end: new Date('2026-04-02T15:30:00'),
      label: 'Pre-shift Nap',
    };

    await writeSleepBlock(napBlock, 'cal-1');

    expect(mockExpo.createEventAsync).toHaveBeenCalledWith(
      'cal-1',
      expect.objectContaining({ title: 'Nap — 2:30 PM' }),
    );
  });
});

describe('deleteSleepBlock', () => {
  test('Test 9: calls deleteEventAsync with the event ID', async () => {
    await deleteSleepBlock('event-to-delete', 'cal-1');
    expect(mockExpo.deleteEventAsync).toHaveBeenCalledWith('event-to-delete');
  });
});
