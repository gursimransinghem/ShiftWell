/**
 * plan-store.test.ts
 *
 * Tests for plan-store extensions:
 * - PLAN-01: generateSleepPlan called with correct profile/shift data
 * - PLAN-02: writeChangedBlocks called after regeneratePlan
 * - PLAN-03: commuteDuration from profile passes through to algorithm
 * - PLAN-04: Off-day produces no priority-1 main-sleep block
 * - PLAN-06: recalculationNeeded subscription triggers regen + clears flag
 * - PLAN-06: Debounce — rapid changes trigger only one regen
 */

import { usePlanStore } from '../../src/store/plan-store';
import { useShiftsStore } from '../../src/store/shifts-store';
import { useUserStore } from '../../src/store/user-store';
import { useCalendarStore } from '../../src/lib/calendar/calendar-store';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';
import type { SleepPlan, PlanBlock } from '../../src/lib/circadian/types';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../src/lib/circadian/index', () => ({
  generateSleepPlan: jest.fn(),
}));

jest.mock('../../src/lib/calendar/plan-write-service', () => ({
  writeChangedBlocks: jest.fn().mockResolvedValue(undefined),
  writePlanBlock: jest.fn().mockResolvedValue('mock-event-id'),
  blockChanged: jest.fn().mockReturnValue(false),
  buildPlanBlockTitle: jest.fn().mockReturnValue('Mock Title'),
}));

jest.mock('../../src/lib/notifications/notification-service', () => ({
  schedulePlanNotifications: jest.fn().mockResolvedValue(undefined),
}));

import { generateSleepPlan } from '../../src/lib/circadian/index';
import { writeChangedBlocks } from '../../src/lib/calendar/plan-write-service';

// ── Mock Plan ─────────────────────────────────────────────────────────────────

const MOCK_PLAN: SleepPlan = {
  blocks: [
    {
      id: '2026-04-10-main-sleep',
      type: 'main-sleep',
      start: new Date('2026-04-10T22:00:00'),
      end: new Date('2026-04-11T06:00:00'),
      label: 'Main Sleep',
      description: 'Core sleep window',
      priority: 1,
    } as PlanBlock,
    {
      id: '2026-04-10-caffeine-cutoff',
      type: 'caffeine-cutoff',
      start: new Date('2026-04-10T14:00:00'),
      end: new Date('2026-04-10T14:30:00'),
      label: 'Caffeine Cutoff',
      description: 'No caffeine after this point',
      priority: 3,
    } as PlanBlock,
  ],
  startDate: new Date('2026-04-10'),
  endDate: new Date('2026-04-24'),
  classifiedDays: [],
  stats: { avgSleepHours: 7.5, nightShiftCount: 0, hardTransitions: 0, circadianDebtScore: 10 },
};

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.useRealTimers();

  // Default: generateSleepPlan returns MOCK_PLAN
  (generateSleepPlan as jest.Mock).mockReturnValue(MOCK_PLAN);

  // Reset stores — use setState directly to avoid triggering subscriptions
  // Note: Zustand subscriptions DO fire on setState calls. We reset mocks AFTER
  // store reset so that any subscription-triggered calls during setup are discarded.
  usePlanStore.setState({
    plan: null,
    isGenerating: false,
    error: null,
    lastGeneratedAt: null,
    lastResetAt: null,
    changeLog: [],
    pendingChanges: [],
  } as any);

  useShiftsStore.setState({ shifts: [], personalEvents: [], recalculationNeeded: [] });

  useUserStore.setState({
    profile: { ...DEFAULT_PROFILE },
    onboardingComplete: false,
    healthkitConnected: false,
  });

  useCalendarStore.setState({
    shiftWellCalendarId: 'test-shiftwell-cal-id',
    eventIdMap: {},
  } as any);

  // Clear mocks AFTER store resets so subscription-triggered calls are discarded
  jest.clearAllMocks();
  (generateSleepPlan as jest.Mock).mockReturnValue(MOCK_PLAN);
  (writeChangedBlocks as jest.Mock).mockResolvedValue(undefined);

  // Reset plan to null AFTER clearing mocks — subscription may have set a plan during reset
  usePlanStore.setState({ plan: null, lastGeneratedAt: null, lastResetAt: null, changeLog: [], pendingChanges: [] } as any);
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('usePlanStore — plan generation wiring', () => {
  it('PLAN-01: regeneratePlan calls generateSleepPlan with shifts and profile from stores', async () => {
    const shift = {
      id: 'shift-1',
      title: 'Day Shift',
      start: new Date('2026-04-10T07:00:00'),
      end: new Date('2026-04-10T19:00:00'),
      shiftType: 'day' as const,
      source: 'manual' as const,
    };

    // Use setState to set both values atomically, then clear mocks to discard subscription-triggered calls
    useShiftsStore.setState({ shifts: [shift] });
    useUserStore.setState({ profile: { ...DEFAULT_PROFILE, chronotype: 'late' } });
    jest.clearAllMocks();
    (generateSleepPlan as jest.Mock).mockReturnValue(MOCK_PLAN);

    await usePlanStore.getState().regeneratePlan();

    expect(generateSleepPlan).toHaveBeenCalledTimes(1);
    const callArgs = (generateSleepPlan as jest.Mock).mock.calls[0];
    // callArgs: [startDate, endDate, shifts, personalEvents, profile]
    expect(callArgs[2]).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'shift-1' })]));
    expect(callArgs[4]).toMatchObject({ chronotype: 'late' });
  });

  it('PLAN-02: After regeneratePlan, writeChangedBlocks is called with the new plan and calendarStore', async () => {
    await usePlanStore.getState().regeneratePlan();

    // writeChangedBlocks is called non-blocking — wait for microtasks
    await Promise.resolve();

    expect(writeChangedBlocks).toHaveBeenCalledTimes(1);
    const [oldPlan, newPlan, calStore] = (writeChangedBlocks as jest.Mock).mock.calls[0];
    expect(newPlan).toBe(MOCK_PLAN);
    expect(calStore).toMatchObject({ shiftWellCalendarId: 'test-shiftwell-cal-id' });
    expect(oldPlan).toBeNull(); // no plan before first generation
  });

  it('PLAN-03: commuteDuration=45 in profile passes through to generateSleepPlan', async () => {
    // Set profile via setState to avoid triggering subscription; then explicitly call regeneratePlan
    useUserStore.setState({ profile: { ...DEFAULT_PROFILE, commuteDuration: 45 } });
    jest.clearAllMocks();
    (generateSleepPlan as jest.Mock).mockReturnValue(MOCK_PLAN);

    await usePlanStore.getState().regeneratePlan();

    expect(generateSleepPlan).toHaveBeenCalledTimes(1);
    const callArgs = (generateSleepPlan as jest.Mock).mock.calls[0];
    const profile = callArgs[4];
    expect(profile.commuteDuration).toBe(45);
  });

  it('PLAN-04: Plan with off-day classifiedDay produces no priority-1 main-sleep block for that date', async () => {
    const offDayPlan: SleepPlan = {
      ...MOCK_PLAN,
      blocks: [
        {
          id: '2026-04-11-main-sleep',
          type: 'main-sleep',
          start: new Date('2026-04-11T23:00:00'),
          end: new Date('2026-04-12T07:00:00'),
          label: 'Main Sleep',
          description: 'Core sleep window',
          priority: 2, // Off day: no alarm — priority NOT 1
        } as PlanBlock,
      ],
      classifiedDays: [
        {
          date: new Date('2026-04-11'),
          dayType: 'off',
          shift: null,
          personalEvents: [],
        },
      ],
    };

    (generateSleepPlan as jest.Mock).mockReturnValue(offDayPlan);

    await usePlanStore.getState().regeneratePlan();

    const { plan } = usePlanStore.getState();
    expect(plan).not.toBeNull();

    const offDayMainSleepBlocks = plan!.blocks.filter(
      (b) =>
        b.type === 'main-sleep' &&
        b.priority === 1 &&
        b.start.toISOString().startsWith('2026-04-11'),
    );
    expect(offDayMainSleepBlocks).toHaveLength(0);
  });
});

describe('usePlanStore — recalculationNeeded subscription (PLAN-06)', () => {
  it('PLAN-06: recalculationNeeded becoming non-empty triggers regeneratePlan and clears the flag', async () => {
    // Trigger subscription by changing recalculationNeeded
    useShiftsStore.setState({ recalculationNeeded: ['shift-abc'] });

    // Wait for debounce (500ms) + async regenerate
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Plan was regenerated
    expect(generateSleepPlan).toHaveBeenCalledTimes(1);

    // Flag was cleared
    expect(useShiftsStore.getState().recalculationNeeded).toEqual([]);

    // lastResetAt was set (Circadian Reset marker)
    expect(usePlanStore.getState().lastResetAt).toBeInstanceOf(Date);
  });

  it('PLAN-06: Rapid recalculationNeeded changes within 500ms trigger only one regeneratePlan call', async () => {
    jest.useFakeTimers();

    useShiftsStore.setState({ recalculationNeeded: ['shift-1'] });
    useShiftsStore.setState({ recalculationNeeded: ['shift-1', 'shift-2'] });
    useShiftsStore.setState({ recalculationNeeded: ['shift-1', 'shift-2', 'shift-3'] });

    // Advance timers past debounce window
    jest.advanceTimersByTime(600);

    // Flush pending promises
    await Promise.resolve();

    expect(generateSleepPlan).toHaveBeenCalledTimes(1);
  });
});

// ── changeLog persistence tests (BRAIN-06) ─────────────────────────────────────

import type { AdaptiveChange } from '../../src/lib/adaptive/types';

const MOCK_CHANGE: AdaptiveChange = {
  type: 'bedtime-shifted',
  factor: 'debt',
  magnitudeMinutes: 30,
  humanReadable: 'Bedtime shifted 30min earlier',
  reason: 'High sleep debt',
};

describe('usePlanStore — changeLog persistence (BRAIN-06)', () => {
  it('BRAIN-06-01: dismissChanges moves pendingChanges to changeLog with ISO timestamp', () => {
    usePlanStore.setState({ pendingChanges: [MOCK_CHANGE], changeLog: [] } as any);

    usePlanStore.getState().dismissChanges();

    const { changeLog, pendingChanges } = usePlanStore.getState();
    expect(pendingChanges).toHaveLength(0);
    expect(changeLog).toHaveLength(1);
    expect(changeLog[0].humanReadable).toBe('Bedtime shifted 30min earlier');
    expect(typeof changeLog[0].timestamp).toBe('string');
    expect(changeLog[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('BRAIN-06-02: dismissChanges with empty pendingChanges does NOT add entries to changeLog', () => {
    usePlanStore.setState({ pendingChanges: [], changeLog: [] } as any);

    usePlanStore.getState().dismissChanges();

    const { changeLog } = usePlanStore.getState();
    expect(changeLog).toHaveLength(0);
  });

  it('BRAIN-06-03: changeLog caps at 30 entries — oldest trimmed', () => {
    // Build 29 existing entries
    const existingEntries: AdaptiveChange[] = Array.from({ length: 29 }, (_, i) => ({
      ...MOCK_CHANGE,
      humanReadable: `Change ${i}`,
      timestamp: new Date(Date.now() - (29 - i) * 1000).toISOString(),
    }));

    // 3 new pending changes
    const newChanges: AdaptiveChange[] = [
      { ...MOCK_CHANGE, humanReadable: 'New Change A' },
      { ...MOCK_CHANGE, humanReadable: 'New Change B' },
      { ...MOCK_CHANGE, humanReadable: 'New Change C' },
    ];

    usePlanStore.setState({ pendingChanges: newChanges, changeLog: existingEntries } as any);

    usePlanStore.getState().dismissChanges();

    const { changeLog } = usePlanStore.getState();
    // 29 + 3 = 32, capped at 30 => oldest 2 trimmed
    expect(changeLog).toHaveLength(30);
    // The newest entries should be the new changes
    expect(changeLog[29].humanReadable).toBe('New Change C');
    expect(changeLog[28].humanReadable).toBe('New Change B');
    expect(changeLog[27].humanReadable).toBe('New Change A');
  });

  it('BRAIN-06-04: changeLog entries from dismiss have valid ISO timestamp', () => {
    const before = new Date();
    usePlanStore.setState({ pendingChanges: [MOCK_CHANGE], changeLog: [] } as any);

    usePlanStore.getState().dismissChanges();

    const after = new Date();
    const { changeLog } = usePlanStore.getState();
    const ts = new Date(changeLog[0].timestamp!);
    expect(ts.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(ts.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('BRAIN-06-05: partialize returns only changeLog, daysUntilTransition, snapshotTimestamp', () => {
    const store = usePlanStore as any;
    if (!store.persist) {
      // persist not yet added — this test is a sentinel for the RED phase
      throw new Error('usePlanStore does not have persist middleware yet');
    }
    const partialize = store.persist.getOptions().partialize;
    const fullState = {
      plan: { blocks: [] },
      planSnapshot: { blocks: [] },
      adaptiveContext: { meta: {} },
      pendingChanges: [MOCK_CHANGE],
      isGenerating: true,
      error: 'some error',
      changeLog: [{ ...MOCK_CHANGE, timestamp: '2026-01-01T00:00:00.000Z' }],
      daysUntilTransition: 5,
      snapshotTimestamp: '2026-01-01T00:00:00.000Z',
    };
    const result = partialize(fullState);
    const resultKeys = Object.keys(result).sort();
    expect(resultKeys).toEqual(['autopilot', 'changeLog', 'daysUntilTransition', 'feedbackAdjustment', 'snapshotTimestamp', 'transparencyLog'].sort());
    expect(result).not.toHaveProperty('plan');
    expect(result).not.toHaveProperty('planSnapshot');
    expect(result).not.toHaveProperty('adaptiveContext');
    expect(result).not.toHaveProperty('pendingChanges');
    expect(result).not.toHaveProperty('isGenerating');
    expect(result).not.toHaveProperty('error');
  });

  it('BRAIN-06-06: undoPlan still works correctly — clears pendingChanges without affecting existing changeLog', () => {
    const existingLog: AdaptiveChange[] = [
      { ...MOCK_CHANGE, humanReadable: 'Old change', timestamp: new Date().toISOString() },
    ];
    const snapshot = { ...MOCK_PLAN };
    usePlanStore.setState({
      plan: MOCK_PLAN,
      planSnapshot: snapshot,
      snapshotTimestamp: new Date(),
      pendingChanges: [MOCK_CHANGE],
      changeLog: existingLog,
    } as any);

    usePlanStore.getState().undoPlan();

    const { changeLog, pendingChanges } = usePlanStore.getState();
    expect(pendingChanges).toHaveLength(0);
    // changeLog should be untouched by undoPlan
    expect(changeLog).toHaveLength(1);
    expect(changeLog[0].humanReadable).toBe('Old change');
  });
});
