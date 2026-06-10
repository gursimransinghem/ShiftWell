/**
 * Push notification scheduling integration tests.
 *
 * Tests cover:
 * - Notification scheduling from plan blocks
 * - Past time filtering (no scheduling past events)
 * - Preference gating (caffeine, wind-down, morning brief)
 * - Cancel all before rescheduling
 * - Individual notification types
 */

import type { PlanBlock } from '../../src/lib/circadian/types';

// Mock expo-notifications inline before imports
const mockScheduleNotificationAsync = jest.fn().mockResolvedValue('mock-id-123');
const mockCancelAllScheduledNotificationsAsync = jest.fn().mockResolvedValue(undefined);
const mockGetAllScheduledNotificationsAsync = jest.fn().mockResolvedValue([]);
const mockGetPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
const mockRequestPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: mockScheduleNotificationAsync,
  cancelAllScheduledNotificationsAsync: mockCancelAllScheduledNotificationsAsync,
  getAllScheduledNotificationsAsync: mockGetAllScheduledNotificationsAsync,
  getPermissionsAsync: mockGetPermissionsAsync,
  requestPermissionsAsync: mockRequestPermissionsAsync,
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const mockGetState = jest.fn().mockReturnValue({
  windDownEnabled: true,
  windDownLeadMinutes: 45,
  caffeineCutoffEnabled: true,
  morningBriefEnabled: true,
});

jest.mock('@/src/store/notification-store', () => ({
  useNotificationStore: { getState: mockGetState },
}));

import {
  requestPermissions,
  scheduleSleepReminder,
  scheduleCaffeineCutoff,
  scheduleWakeReminder,
  scheduleMorningBrief,
  schedulePlanNotifications,
  cancelAllNotifications,
} from '../../src/lib/notifications/notification-service';

// ── Helpers ──────────────────────────────────────────────────────────

function makeFutureDate(hoursFromNow: number): Date {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
}

function makePastDate(hoursAgo: number): Date {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
}

function makePlanBlock(
  type: string,
  hoursFromNow: number,
  durationHours: number = 1,
): PlanBlock {
  const start = makeFutureDate(hoursFromNow);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  return {
    id: `block-${type}-${hoursFromNow}`,
    type: type as any,
    start,
    end,
    label: `Test ${type}`,
    description: 'Test block',
    priority: 1,
  };
}

// ── Test Suite ────────────────────────────────────────────────────────

describe('Notification Scheduling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetState.mockReturnValue({
      windDownEnabled: true,
      windDownLeadMinutes: 45,
      caffeineCutoffEnabled: true,
      morningBriefEnabled: true,
    });
  });

  describe('requestPermissions', () => {
    it('returns true when already granted', async () => {
      mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
      const result = await requestPermissions();
      expect(result).toBe(true);
    });

    it('requests permissions when not yet granted', async () => {
      mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
      mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      const result = await requestPermissions();
      expect(result).toBe(true);
      expect(mockRequestPermissionsAsync).toHaveBeenCalled();
    });

    it('returns false when permissions denied', async () => {
      mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
      mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });
      const result = await requestPermissions();
      expect(result).toBe(false);
    });
  });

  describe('scheduleSleepReminder', () => {
    it('schedules reminder for future bedtime', async () => {
      const futureTime = makeFutureDate(3);
      const id = await scheduleSleepReminder(futureTime, 'Main Sleep');
      expect(id).toBe('mock-id-123');
      expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: expect.stringContaining('Wind-down'),
          }),
        })
      );
    });

    it('returns null for past bedtime', async () => {
      const pastTime = makePastDate(1);
      const id = await scheduleSleepReminder(pastTime, 'Main Sleep');
      expect(id).toBeNull();
      expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('scheduleCaffeineCutoff', () => {
    it('schedules cutoff for future time', async () => {
      const futureTime = makeFutureDate(4);
      const id = await scheduleCaffeineCutoff(futureTime);
      expect(id).toBe('mock-id-123');
    });

    it('returns null for past cutoff time', async () => {
      const pastTime = makePastDate(1);
      const id = await scheduleCaffeineCutoff(pastTime);
      expect(id).toBeNull();
    });
  });

  describe('scheduleWakeReminder', () => {
    it('schedules wake for future time', async () => {
      const futureTime = makeFutureDate(8);
      const id = await scheduleWakeReminder(futureTime);
      expect(id).toBe('mock-id-123');
    });

    it('returns null for past wake time', async () => {
      const pastTime = makePastDate(1);
      const id = await scheduleWakeReminder(pastTime);
      expect(id).toBeNull();
    });
  });

  describe('scheduleMorningBrief', () => {
    it('schedules morning brief with first block label', async () => {
      const futureTime = makeFutureDate(8);
      const id = await scheduleMorningBrief(futureTime, 'Light Seek');
      expect(id).toBe('mock-id-123');
      expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            body: expect.stringContaining('Light Seek'),
          }),
        })
      );
    });

    it('returns null for past wake time', async () => {
      const pastTime = makePastDate(1);
      const id = await scheduleMorningBrief(pastTime, 'Light Seek');
      expect(id).toBeNull();
    });
  });

  describe('cancelAllNotifications', () => {
    it('calls cancelAllScheduledNotificationsAsync', async () => {
      await cancelAllNotifications();
      expect(mockCancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('schedulePlanNotifications', () => {
    it('cancels existing notifications before scheduling', async () => {
      const blocks = [makePlanBlock('main-sleep', 2)];
      await schedulePlanNotifications(blocks);
      expect(mockCancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('schedules notifications for sleep blocks', async () => {
      const blocks = [makePlanBlock('main-sleep', 2, 8)];
      const ids = await schedulePlanNotifications(blocks);
      expect(ids.length).toBeGreaterThan(0);
    });

    it('skips blocks more than 24 hours out', async () => {
      const blocks = [makePlanBlock('main-sleep', 30)];
      const ids = await schedulePlanNotifications(blocks);
      expect(ids.length).toBe(0);
    });

    it('skips past blocks', async () => {
      const pastBlock: PlanBlock = {
        id: 'past-block',
        type: 'main-sleep',
        start: makePastDate(2),
        end: makePastDate(1),
        label: 'Past Sleep',
        description: 'Test',
        priority: 1,
      };
      const ids = await schedulePlanNotifications([pastBlock]);
      expect(ids.length).toBe(0);
    });

    it('does not schedule for meal-window blocks', async () => {
      const blocks = [makePlanBlock('meal-window', 2)];
      const ids = await schedulePlanNotifications(blocks);
      expect(ids.length).toBe(0);
    });

    it('respects caffeineCutoffEnabled preference', async () => {
      mockGetState.mockReturnValue({
        windDownEnabled: true,
        windDownLeadMinutes: 45,
        caffeineCutoffEnabled: false,
        morningBriefEnabled: true,
      });
      const blocks = [makePlanBlock('caffeine-cutoff', 4)];
      const ids = await schedulePlanNotifications(blocks);
      expect(ids.length).toBe(0);
    });

    it('respects windDownEnabled preference', async () => {
      mockGetState.mockReturnValue({
        windDownEnabled: false,
        windDownLeadMinutes: 45,
        caffeineCutoffEnabled: true,
        morningBriefEnabled: true,
      });
      const blocks = [makePlanBlock('wind-down', 1)];
      const ids = await schedulePlanNotifications(blocks);
      expect(ids.length).toBe(0);
    });
  });
});
