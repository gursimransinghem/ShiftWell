/**
 * Tests: src/lib/growth/reengagement.ts
 * Coverage: recordAppOpen, isUserInactive, scheduleReengagementSequence,
 * cancelReengagementSequence, handleAppOpen flow.
 */

import {
  recordAppOpen,
  getLastAppOpen,
  isUserInactive,
  scheduleReengagementSequence,
  cancelReengagementSequence,
  getStoredReengagementIds,
  handleAppOpen,
  REENGAGEMENT_MESSAGES,
} from '../../src/lib/growth/reengagement';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// expo-notifications is already mocked globally in __mocks__/expo-notifications.ts
// We add a custom cancelScheduledNotificationAsync mock here
const mockCancelSingle = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notif-id'),
  cancelScheduledNotificationAsync: (...args: unknown[]) => mockCancelSingle(...args),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
}));

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

beforeEach(() => {
  jest.clearAllMocks();
  (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('mock-notif-id');
});

// ---------------------------------------------------------------------------
// recordAppOpen / getLastAppOpen
// ---------------------------------------------------------------------------

describe('recordAppOpen', () => {
  test('writes current timestamp to AsyncStorage', async () => {
    const before = Date.now();
    await recordAppOpen();
    const after = Date.now();

    const call = (AsyncStorage.setItem as jest.Mock).mock.calls[0] as [string, string];
    expect(call[0]).toBe('shiftwell:last-open');
    const written = new Date(call[1]).getTime();
    expect(written).toBeGreaterThanOrEqual(before);
    expect(written).toBeLessThanOrEqual(after);
  });
});

describe('getLastAppOpen', () => {
  test('returns null when nothing stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    expect(await getLastAppOpen()).toBeNull();
  });

  test('returns parsed Date when stored', async () => {
    const iso = '2026-04-01T10:00:00.000Z';
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(iso);
    const result = await getLastAppOpen();
    expect(result?.toISOString()).toBe(iso);
  });
});

// ---------------------------------------------------------------------------
// isUserInactive
// ---------------------------------------------------------------------------

describe('isUserInactive', () => {
  test('returns false when no last-open recorded', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    expect(await isUserInactive(new Date())).toBe(false);
  });

  test('returns false when last open was less than 24h ago', async () => {
    const lastOpen = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12h ago
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(lastOpen.toISOString());
    expect(await isUserInactive(new Date())).toBe(false);
  });

  test('returns true when last open was more than 24h ago', async () => {
    const lastOpen = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25h ago
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(lastOpen.toISOString());
    expect(await isUserInactive(new Date())).toBe(true);
  });

  test('boundary: exactly 24h returns false (not strictly greater)', async () => {
    const now = new Date();
    const lastOpen = new Date(now.getTime() - ONE_DAY_MS);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(lastOpen.toISOString());
    expect(await isUserInactive(now)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// scheduleReengagementSequence
// ---------------------------------------------------------------------------

describe('scheduleReengagementSequence', () => {
  test('schedules exactly 3 notifications (D1, D3, D7)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const ids = await scheduleReengagementSequence(new Date());

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
    expect(ids).toHaveLength(3);
  });

  test('notification bodies match the REENGAGEMENT_MESSAGES catalogue', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await scheduleReengagementSequence(new Date());

    const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls as Array<
      [{ content: { body: string }; trigger: unknown }]
    >;
    const bodies = calls.map((c) => c[0].content.body);
    expect(bodies).toContain(REENGAGEMENT_MESSAGES[0].body);
    expect(bodies).toContain(REENGAGEMENT_MESSAGES[1].body);
    expect(bodies).toContain(REENGAGEMENT_MESSAGES[2].body);
  });

  test('persists notification IDs to AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (Notifications.scheduleNotificationAsync as jest.Mock)
      .mockResolvedValueOnce('id-1')
      .mockResolvedValueOnce('id-2')
      .mockResolvedValueOnce('id-3');

    await scheduleReengagementSequence(new Date());

    const stored = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
      (c: [string, string]) => c[0] === 'shiftwell:reengagement-ids',
    );
    expect(stored).toBeDefined();
    const ids = JSON.parse(stored[1]) as string[];
    expect(ids).toEqual(['id-1', 'id-2', 'id-3']);
  });

  test('trigger dates are spaced at D1, D3, D7 from base', async () => {
    const base = new Date('2026-04-06T12:00:00.000Z');
    await scheduleReengagementSequence(base);

    const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls as Array<
      [{ trigger: { date: Date } }]
    >;
    const delayDays = REENGAGEMENT_MESSAGES.map((m) => m.delayDays);
    calls.forEach((c, i) => {
      const expectedMs = base.getTime() + delayDays[i] * ONE_DAY_MS;
      const actualMs = new Date(c[0].trigger.date).getTime();
      expect(Math.abs(actualMs - expectedMs)).toBeLessThan(1000);
    });
  });
});

// ---------------------------------------------------------------------------
// cancelReengagementSequence
// ---------------------------------------------------------------------------

describe('cancelReengagementSequence', () => {
  test('cancels each stored notification ID', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(['id-a', 'id-b', 'id-c']),
    );

    await cancelReengagementSequence();

    expect(mockCancelSingle).toHaveBeenCalledTimes(3);
    expect(mockCancelSingle).toHaveBeenCalledWith('id-a');
    expect(mockCancelSingle).toHaveBeenCalledWith('id-b');
    expect(mockCancelSingle).toHaveBeenCalledWith('id-c');
  });

  test('removes the stored IDs from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['id-1']));

    await cancelReengagementSequence();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('shiftwell:reengagement-ids');
  });

  test('does nothing when no IDs stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await cancelReengagementSequence();

    expect(mockCancelSingle).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// handleAppOpen — integration
// ---------------------------------------------------------------------------

describe('handleAppOpen', () => {
  test('cancels existing sequence and records open when user is active', async () => {
    // No stored IDs, user was active (< 24h)
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'shiftwell:reengagement-ids') return Promise.resolve(null);
      if (key === 'shiftwell:last-open') {
        return Promise.resolve(new Date(Date.now() - 60 * 60 * 1000).toISOString()); // 1h ago
      }
      return Promise.resolve(null);
    });

    const now = new Date();
    await handleAppOpen(now);

    // Should NOT schedule new notifications
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    // Should record open
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'shiftwell:last-open',
      expect.any(String),
    );
  });

  test('schedules sequence when user is inactive (> 24h)', async () => {
    const lastOpen = new Date(Date.now() - 25 * 60 * 60 * 1000);
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'shiftwell:reengagement-ids') return Promise.resolve(null);
      if (key === 'shiftwell:last-open') return Promise.resolve(lastOpen.toISOString());
      return Promise.resolve(null);
    });

    await handleAppOpen(new Date());

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
  });

  test('does not schedule when user has no last-open record (new install)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await handleAppOpen(new Date());

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getStoredReengagementIds
// ---------------------------------------------------------------------------

describe('getStoredReengagementIds', () => {
  test('returns stored IDs', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['x', 'y']));
    const ids = await getStoredReengagementIds();
    expect(ids).toEqual(['x', 'y']);
  });

  test('returns empty array when nothing stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const ids = await getStoredReengagementIds();
    expect(ids).toEqual([]);
  });
});
