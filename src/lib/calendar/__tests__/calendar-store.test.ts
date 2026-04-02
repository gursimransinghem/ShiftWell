/**
 * calendar-store.test.ts
 *
 * Tests for the calendar Zustand store — connection state, toggles, and preferences.
 */

import type { CalendarMeta } from '../calendar-types';

// We test the store imperatively by accessing state directly
// (avoids needing React hooks test infrastructure for unit tests)
import { useCalendarStore } from '../calendar-store';

const mockAppleCalendars: CalendarMeta[] = [
  {
    id: 'cal-1',
    title: 'Work',
    color: '#FF0000',
    enabled: true,
    source: 'apple',
    allowsModifications: true,
  },
  {
    id: 'cal-2',
    title: 'Personal',
    color: '#00FF00',
    enabled: true,
    source: 'apple',
    allowsModifications: false,
  },
];

const mockGoogleCalendars: CalendarMeta[] = [
  {
    id: 'gcal-1',
    title: 'Google Work',
    color: '#0000FF',
    enabled: true,
    source: 'google',
    allowsModifications: true,
  },
];

// Reset store state between tests
beforeEach(() => {
  useCalendarStore.setState({
    appleConnected: false,
    appleCalendars: [],
    shiftWellCalendarId: null,
    googleConnected: false,
    googleCalendars: [],
    googleAccessToken: null,
    googleTokenExpiry: null,
    workCalendarId: null,
    googleSyncTokens: {},
    lastSyncedAt: null,
    writeToNativeCalendar: true,
    nativeWriteCalendarId: null,
    changeNotificationMode: 'silent',
    eventIdMap: {},
  });
});

describe('useCalendarStore — initial state', () => {
  test('Test 1: initial state is all disconnected with correct defaults', () => {
    const state = useCalendarStore.getState();

    expect(state.appleConnected).toBe(false);
    expect(state.googleConnected).toBe(false);
    expect(state.writeToNativeCalendar).toBe(true);
    expect(state.changeNotificationMode).toBe('silent');
    expect(state.appleCalendars).toEqual([]);
    expect(state.googleCalendars).toEqual([]);
    expect(state.shiftWellCalendarId).toBeNull();
    expect(state.workCalendarId).toBeNull();
    expect(state.googleAccessToken).toBeNull();
    expect(state.googleTokenExpiry).toBeNull();
    expect(state.lastSyncedAt).toBeNull();
  });
});

describe('useCalendarStore — Apple connection', () => {
  test('Test 2: connectApple sets appleConnected=true and populates appleCalendars', () => {
    const { connectApple } = useCalendarStore.getState();

    connectApple(mockAppleCalendars, 'shiftwell-cal-id');

    const state = useCalendarStore.getState();
    expect(state.appleConnected).toBe(true);
    expect(state.appleCalendars).toHaveLength(2);
    expect(state.appleCalendars[0].id).toBe('cal-1');
    expect(state.appleCalendars[1].id).toBe('cal-2');
    expect(state.shiftWellCalendarId).toBe('shiftwell-cal-id');
  });

  test('Test 5: disconnectApple resets all Apple-related state', () => {
    const { connectApple, disconnectApple } = useCalendarStore.getState();
    connectApple(mockAppleCalendars, 'shiftwell-cal-id');

    disconnectApple();

    const state = useCalendarStore.getState();
    expect(state.appleConnected).toBe(false);
    expect(state.appleCalendars).toEqual([]);
    expect(state.shiftWellCalendarId).toBeNull();
  });
});

describe('useCalendarStore — calendar toggle', () => {
  test('Test 3: toggleCalendar flips enabled state for a specific calendar ID', () => {
    useCalendarStore.getState().connectApple(mockAppleCalendars, 'shiftwell-cal-id');

    const { toggleCalendar } = useCalendarStore.getState();
    toggleCalendar('cal-1');

    const state = useCalendarStore.getState();
    const cal1 = state.appleCalendars.find((c) => c.id === 'cal-1');
    const cal2 = state.appleCalendars.find((c) => c.id === 'cal-2');
    expect(cal1?.enabled).toBe(false);
    expect(cal2?.enabled).toBe(true); // unchanged
  });
});

describe('useCalendarStore — work calendar tag', () => {
  test('Test 4: setWorkCalendarId stores a calendar ID for heuristic bypass (D-07)', () => {
    const { setWorkCalendarId } = useCalendarStore.getState();
    setWorkCalendarId('work-cal-id');

    expect(useCalendarStore.getState().workCalendarId).toBe('work-cal-id');

    setWorkCalendarId(null);
    expect(useCalendarStore.getState().workCalendarId).toBeNull();
  });
});

describe('useCalendarStore — Google connection', () => {
  test('Test 6: disconnectGoogle resets all Google-related state and clears sync tokens', () => {
    const { connectGoogle, updateGoogleSyncToken, disconnectGoogle } =
      useCalendarStore.getState();

    connectGoogle(mockGoogleCalendars, 'access-token-123', Date.now() + 3600000);
    updateGoogleSyncToken('gcal-1', 'sync-token-abc');

    disconnectGoogle();

    const state = useCalendarStore.getState();
    expect(state.googleConnected).toBe(false);
    expect(state.googleCalendars).toEqual([]);
    expect(state.googleAccessToken).toBeNull();
    expect(state.googleTokenExpiry).toBeNull();
    expect(state.googleSyncTokens).toEqual({});
  });
});

describe('useCalendarStore — derived selectors', () => {
  test('getEnabledAppleCalendarIds returns only enabled calendar IDs', () => {
    useCalendarStore.getState().connectApple(mockAppleCalendars, 'shiftwell-cal-id');
    useCalendarStore.getState().toggleCalendar('cal-1'); // disable cal-1

    const ids = useCalendarStore.getState().getEnabledAppleCalendarIds();
    expect(ids).toEqual(['cal-2']);
  });

  test('getEnabledGoogleCalendarIds returns only enabled google calendar IDs', () => {
    useCalendarStore
      .getState()
      .connectGoogle(mockGoogleCalendars, 'token', Date.now() + 3600000);

    const ids = useCalendarStore.getState().getEnabledGoogleCalendarIds();
    expect(ids).toEqual(['gcal-1']);
  });
});

describe('useCalendarStore — event ID mapping', () => {
  test('mapEventId and removeEventId manage the event-to-block ID map', () => {
    const { mapEventId, removeEventId } = useCalendarStore.getState();

    mapEventId('evt-abc', 'block-123');
    expect(useCalendarStore.getState().eventIdMap['evt-abc']).toBe('block-123');

    removeEventId('evt-abc');
    expect(useCalendarStore.getState().eventIdMap['evt-abc']).toBeUndefined();
  });
});
