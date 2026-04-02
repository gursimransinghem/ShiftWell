/**
 * Tests for notification-service.ts
 *
 * Tests warm emoji copy, morning brief function, and notification-store
 * preference integration.
 */

import type { PlanBlock } from '../../../lib/circadian/types';

// Mock expo-notifications inline (04-01 creates the module-level mock;
// we mock inline here so this test is self-contained)
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
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
}));

// Mock notification-store — default all enabled with standard lead times
const mockGetState = jest.fn().mockReturnValue({
  windDownEnabled: true,
  windDownLeadMinutes: 45,
  caffeineCutoffEnabled: true,
  caffeineCutoffLeadMinutes: 30,
  morningBriefEnabled: true,
});

jest.mock('@/src/store/notification-store', () => ({
  useNotificationStore: {
    getState: mockGetState,
  },
}));

import {
  scheduleSleepReminder,
  scheduleCaffeineCutoff,
  scheduleWakeReminder,
  schedulePlanNotifications,
  scheduleMorningBrief,
} from '../notification-service';

// Helper to create a future Date offset by minutes
function futureDate(minutesFromNow: number): Date {
  return new Date(Date.now() + minutesFromNow * 60 * 1000);
}

describe('notification copy — warm emoji tone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetState.mockReturnValue({
      windDownEnabled: true,
      windDownLeadMinutes: 45,
      caffeineCutoffEnabled: true,
      caffeineCutoffLeadMinutes: 30,
      morningBriefEnabled: true,
    });
  });

  it('scheduleSleepReminder uses 🌙 title and mentions sleep window', async () => {
    const bedtime = futureDate(120); // 2 hours from now
    await scheduleSleepReminder(bedtime, 'Main Sleep');
    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringContaining('🌙'),
          body: expect.stringContaining('sleep window opens in'),
        }),
      }),
    );
  });

  it('scheduleCaffeineCutoff uses ☕ title and warm body copy', async () => {
    const cutoff = futureDate(60);
    await scheduleCaffeineCutoff(cutoff);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringContaining('☕'),
          body: expect.stringContaining('Caffeine cutoff in 30 minutes'),
        }),
      }),
    );
  });

  it('scheduleWakeReminder uses ⏰ title and morning message', async () => {
    const wake = futureDate(60);
    await scheduleWakeReminder(wake);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringContaining('⏰'),
          body: expect.stringContaining('morning routine'),
        }),
      }),
    );
  });
});

describe('scheduleMorningBrief', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('schedules with ☀️ title and firstBlockLabel in body', async () => {
    const wake = futureDate(60);
    const id = await scheduleMorningBrief(wake, 'Light therapy');
    expect(id).toBe('mock-id-123');
    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: '☀️ Good morning!',
          body: 'First up: Light therapy',
          data: { type: 'morning-brief' },
        }),
      }),
    );
  });

  it('returns null if wakeTime is in the past', async () => {
    const pastWake = new Date(Date.now() - 1000);
    const id = await scheduleMorningBrief(pastWake, 'Light therapy');
    expect(id).toBeNull();
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('returns null if wakeTime equals now', async () => {
    // Exactly now — should be skipped
    const exactlyNow = new Date(Date.now() - 1);
    const id = await scheduleMorningBrief(exactlyNow, 'Workout');
    expect(id).toBeNull();
  });
});

describe('schedulePlanNotifications — preference flags', () => {
  const makeBlock = (
    type: PlanBlock['type'],
    minutesFromNow: number,
    label: string = type,
  ): PlanBlock => ({
    type,
    start: futureDate(minutesFromNow),
    end: futureDate(minutesFromNow + 30),
    label,
    id: `block-${type}-${minutesFromNow}`,
    description: `Test block: ${label}`,
    priority: 2,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('schedules wind-down notification when windDownEnabled=true', async () => {
    mockGetState.mockReturnValue({
      windDownEnabled: true,
      windDownLeadMinutes: 45,
      caffeineCutoffEnabled: true,
      caffeineCutoffLeadMinutes: 30,
      morningBriefEnabled: false,
    });

    const blocks: PlanBlock[] = [
      makeBlock('wind-down', 60, 'Wind Down'),
    ];

    await schedulePlanNotifications(blocks);
    const calls = mockScheduleNotificationAsync.mock.calls;
    const windDownCall = calls.find((c) =>
      (c[0] as any).content.title.includes('🌙'),
    );
    expect(windDownCall).toBeDefined();
  });

  it('skips wind-down notification when windDownEnabled=false', async () => {
    mockGetState.mockReturnValue({
      windDownEnabled: false,
      windDownLeadMinutes: 45,
      caffeineCutoffEnabled: true,
      caffeineCutoffLeadMinutes: 30,
      morningBriefEnabled: false,
    });

    const blocks: PlanBlock[] = [
      makeBlock('wind-down', 60, 'Wind Down'),
    ];

    await schedulePlanNotifications(blocks);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('skips caffeine-cutoff notification when caffeineCutoffEnabled=false', async () => {
    mockGetState.mockReturnValue({
      windDownEnabled: false,
      windDownLeadMinutes: 45,
      caffeineCutoffEnabled: false,
      caffeineCutoffLeadMinutes: 30,
      morningBriefEnabled: false,
    });

    const blocks: PlanBlock[] = [
      makeBlock('caffeine-cutoff', 60),
    ];

    await schedulePlanNotifications(blocks);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('calls scheduleMorningBrief for wake blocks when morningBriefEnabled=true', async () => {
    mockGetState.mockReturnValue({
      windDownEnabled: false,
      windDownLeadMinutes: 45,
      caffeineCutoffEnabled: false,
      caffeineCutoffLeadMinutes: 30,
      morningBriefEnabled: true,
    });

    const wakeTime = futureDate(120);
    const lightTherapyTime = futureDate(150);
    const blocks: PlanBlock[] = [
      {
        type: 'wake',
        start: wakeTime,
        end: new Date(wakeTime.getTime() + 5 * 60 * 1000),
        label: 'Wake',
        id: 'block-wake',
        description: 'Wake up',
        priority: 1,
      },
      {
        type: 'light-seek',
        start: lightTherapyTime,
        end: new Date(lightTherapyTime.getTime() + 30 * 60 * 1000),
        label: 'Light therapy',
        id: 'block-light',
        description: 'Light therapy session',
        priority: 2,
      },
    ];

    await schedulePlanNotifications(blocks);

    // Should have called scheduleNotificationAsync for morning brief
    const morningBriefCall = mockScheduleNotificationAsync.mock.calls.find((c) =>
      (c[0] as any).content.data?.type === 'morning-brief',
    );
    expect(morningBriefCall).toBeDefined();
    expect((morningBriefCall![0] as any).content.body).toContain('Light therapy');
  });

  it('uses "your schedule" as firstBlockLabel when no next block found', async () => {
    mockGetState.mockReturnValue({
      windDownEnabled: false,
      windDownLeadMinutes: 45,
      caffeineCutoffEnabled: false,
      caffeineCutoffLeadMinutes: 30,
      morningBriefEnabled: true,
    });

    const wakeTime = futureDate(120);
    const blocks: PlanBlock[] = [
      {
        type: 'wake',
        start: wakeTime,
        end: new Date(wakeTime.getTime() + 5 * 60 * 1000),
        label: 'Wake',
        id: 'block-wake',
        description: 'Wake up',
        priority: 1,
      },
    ];

    await schedulePlanNotifications(blocks);

    const morningBriefCall = mockScheduleNotificationAsync.mock.calls.find((c) =>
      (c[0] as any).content.data?.type === 'morning-brief',
    );
    expect(morningBriefCall).toBeDefined();
    expect((morningBriefCall![0] as any).content.body).toContain('your schedule');
  });

  it('skips morning brief when morningBriefEnabled=false', async () => {
    mockGetState.mockReturnValue({
      windDownEnabled: false,
      windDownLeadMinutes: 45,
      caffeineCutoffEnabled: false,
      caffeineCutoffLeadMinutes: 30,
      morningBriefEnabled: false,
    });

    const blocks: PlanBlock[] = [
      makeBlock('wake', 120),
    ];

    await schedulePlanNotifications(blocks);

    // morning-brief type should NOT be scheduled
    const morningBriefCall = mockScheduleNotificationAsync.mock.calls.find((c) =>
      (c[0] as any).content.data?.type === 'morning-brief',
    );
    expect(morningBriefCall).toBeUndefined();
  });

  it('uses windDownLeadMinutes from store (not hardcoded 30)', async () => {
    mockGetState.mockReturnValue({
      windDownEnabled: true,
      windDownLeadMinutes: 60,
      caffeineCutoffEnabled: false,
      caffeineCutoffLeadMinutes: 30,
      morningBriefEnabled: false,
    });

    const blocks: PlanBlock[] = [
      makeBlock('wind-down', 90, 'Evening Wind Down'),
    ];

    await schedulePlanNotifications(blocks);

    const windDownCall = mockScheduleNotificationAsync.mock.calls.find((c) =>
      (c[0] as any).content.title.includes('🌙'),
    );
    expect(windDownCall).toBeDefined();
    // Body should reference 60 minutes from store
    expect((windDownCall![0] as any).content.body).toContain('60');
  });
});
