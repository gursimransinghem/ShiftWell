/**
 * Tests for complication-data: buildComplicationData.
 *
 * Verifies shift countdown, sleep status, and next action computations
 * across a variety of plan and shift configurations.
 */

import { buildComplicationData } from '../../src/lib/watch/complication-data';
import type { SleepPlan, ShiftEvent, PlanBlock } from '../../src/lib/circadian/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const NOW = new Date('2026-04-10T14:00:00.000Z'); // 2 PM UTC

function makeShift(
  id: string,
  startISO: string,
  endISO: string,
  title = 'ED Shift',
): ShiftEvent {
  return {
    id,
    title,
    start: new Date(startISO),
    end: new Date(endISO),
    shiftType: 'day',
    source: 'manual',
  };
}

function makePlan(blocks: Partial<PlanBlock>[]): SleepPlan {
  const fullBlocks: PlanBlock[] = blocks.map((b, i) => ({
    id: `block-${i}`,
    type: b.type ?? 'main-sleep',
    start: b.start ?? new Date(),
    end: b.end ?? new Date(),
    label: b.label ?? 'Sleep',
    description: '',
    priority: 1,
  }));

  return {
    blocks: fullBlocks,
    startDate: new Date('2026-04-10T00:00:00.000Z'),
    endDate: new Date('2026-04-11T00:00:00.000Z'),
    classifiedDays: [],
    stats: {
      avgSleepHours: 7.5,
      nightShiftCount: 0,
      hardTransitions: 0,
      circadianDebtScore: 10,
    },
  };
}

// ── buildComplicationData — shiftCountdown ────────────────────────────────────

describe('buildComplicationData — shiftCountdown', () => {
  it('returns null shiftCountdown when no shifts', () => {
    const result = buildComplicationData(null, [], null, NOW);
    expect(result.shiftCountdown).toBeNull();
  });

  it('returns null when shift is more than 48h away', () => {
    const farShift = makeShift('s1', '2026-04-15T14:00:00.000Z', '2026-04-16T00:00:00.000Z');
    const result = buildComplicationData(null, [farShift], null, NOW);
    expect(result.shiftCountdown).toBeNull();
  });

  it('returns countdown when shift is within 48h', () => {
    // Shift starts 6 hours from NOW
    const nearShift = makeShift('s1', '2026-04-10T20:00:00.000Z', '2026-04-11T06:00:00.000Z');
    const result = buildComplicationData(null, [nearShift], null, NOW);
    expect(result.shiftCountdown).not.toBeNull();
    expect(result.shiftCountdown!.hours).toBe(6);
    expect(result.shiftCountdown!.minutes).toBe(0);
    expect(result.shiftCountdown!.label).toBe('ED Shift');
  });

  it('uses the nearest upcoming shift', () => {
    const nearShift = makeShift('s1', '2026-04-10T20:00:00.000Z', '2026-04-11T06:00:00.000Z');
    const farShift = makeShift('s2', '2026-04-11T20:00:00.000Z', '2026-04-12T06:00:00.000Z');
    const result = buildComplicationData(null, [farShift, nearShift], null, NOW);
    expect(result.shiftCountdown!.label).toBe('ED Shift');
    expect(result.shiftCountdown!.hours).toBe(6);
  });

  it('ignores past shifts', () => {
    const pastShift = makeShift('s1', '2026-04-09T08:00:00.000Z', '2026-04-09T20:00:00.000Z');
    const result = buildComplicationData(null, [pastShift], null, NOW);
    expect(result.shiftCountdown).toBeNull();
  });
});

// ── buildComplicationData — sleepStatus ───────────────────────────────────────

describe('buildComplicationData — sleepStatus', () => {
  it('returns awake when no plan', () => {
    const result = buildComplicationData(null, [], null, NOW);
    expect(result.sleepStatus).toBe('awake');
  });

  it('returns sleeping when inside a main-sleep block', () => {
    const plan = makePlan([
      {
        type: 'main-sleep',
        start: new Date('2026-04-10T13:00:00.000Z'),
        end: new Date('2026-04-10T21:00:00.000Z'),
      },
    ]);
    const result = buildComplicationData(plan, [], null, NOW); // NOW = 14:00
    expect(result.sleepStatus).toBe('sleeping');
  });

  it('returns sleeping when inside a nap block', () => {
    const plan = makePlan([
      {
        type: 'nap',
        start: new Date('2026-04-10T13:30:00.000Z'),
        end: new Date('2026-04-10T14:30:00.000Z'),
      },
    ]);
    const result = buildComplicationData(plan, [], null, NOW);
    expect(result.sleepStatus).toBe('sleeping');
  });

  it('returns wind-down when inside a wind-down block', () => {
    const plan = makePlan([
      {
        type: 'wind-down',
        start: new Date('2026-04-10T13:30:00.000Z'),
        end: new Date('2026-04-10T14:30:00.000Z'),
      },
    ]);
    const result = buildComplicationData(plan, [], null, NOW);
    expect(result.sleepStatus).toBe('wind-down');
  });

  it('returns recovery within 2h of main-sleep ending', () => {
    // Sleep ended 1h ago at 13:00
    const plan = makePlan([
      {
        type: 'main-sleep',
        start: new Date('2026-04-10T06:00:00.000Z'),
        end: new Date('2026-04-10T13:00:00.000Z'),
      },
    ]);
    const result = buildComplicationData(plan, [], null, NOW); // NOW = 14:00 (1h after)
    expect(result.sleepStatus).toBe('recovery');
  });

  it('returns awake more than 2h after main-sleep ends', () => {
    // Sleep ended 3h ago at 11:00
    const plan = makePlan([
      {
        type: 'main-sleep',
        start: new Date('2026-04-10T04:00:00.000Z'),
        end: new Date('2026-04-10T11:00:00.000Z'),
      },
    ]);
    const result = buildComplicationData(plan, [], null, NOW); // NOW = 14:00 (3h after)
    expect(result.sleepStatus).toBe('awake');
  });
});

// ── buildComplicationData — recoveryScore ─────────────────────────────────────

describe('buildComplicationData — recoveryScore', () => {
  it('passes null recoveryScore through', () => {
    const result = buildComplicationData(null, [], null, NOW);
    expect(result.recoveryScore).toBeNull();
  });

  it('passes numeric recoveryScore through', () => {
    const result = buildComplicationData(null, [], 78, NOW);
    expect(result.recoveryScore).toBe(78);
  });
});

// ── buildComplicationData — nextAction ────────────────────────────────────────

describe('buildComplicationData — nextAction', () => {
  it('returns "No shifts today" with no plan and no shifts', () => {
    const result = buildComplicationData(null, [], null, NOW);
    expect(result.nextAction).toBe('No shifts today');
  });

  it('returns shift countdown when shift within 12h', () => {
    // Shift in 3h
    const shift = makeShift('s1', '2026-04-10T17:00:00.000Z', '2026-04-11T03:00:00.000Z');
    const result = buildComplicationData(null, [shift], null, NOW);
    expect(result.nextAction).toContain('Shift starts in');
    expect(result.nextAction).toContain('3h');
  });

  it('returns bedtime label from plan when no shift within 12h', () => {
    const plan = makePlan([
      {
        type: 'main-sleep',
        start: new Date('2026-04-10T22:00:00.000Z'), // 8h from NOW
        end: new Date('2026-04-11T06:00:00.000Z'),
      },
    ]);
    const result = buildComplicationData(plan, [], null, NOW);
    expect(result.nextAction).toContain('Bedtime');
    expect(result.nextAction).toContain('8h');
  });

  it('returns "Currently sleeping" when inside sleep block', () => {
    const plan = makePlan([
      {
        type: 'main-sleep',
        start: new Date('2026-04-10T06:00:00.000Z'),
        end: new Date('2026-04-10T20:00:00.000Z'),
      },
    ]);
    const result = buildComplicationData(plan, [], null, NOW);
    expect(result.nextAction).toBe('Currently sleeping');
  });

  it('returns "Wind-down in progress" when inside wind-down block', () => {
    const plan = makePlan([
      {
        type: 'wind-down',
        start: new Date('2026-04-10T13:30:00.000Z'),
        end: new Date('2026-04-10T14:30:00.000Z'),
      },
    ]);
    const result = buildComplicationData(plan, [], null, NOW);
    expect(result.nextAction).toBe('Wind-down in progress');
  });

  it('shows minutes-only when next block is under 1h away', () => {
    const plan = makePlan([
      {
        type: 'wind-down',
        start: new Date('2026-04-10T14:30:00.000Z'), // 30 min away
        end: new Date('2026-04-10T15:00:00.000Z'),
      },
    ]);
    const result = buildComplicationData(plan, [], null, NOW);
    expect(result.nextAction).toContain('30m');
    expect(result.nextAction).not.toContain('0h');
  });
});
