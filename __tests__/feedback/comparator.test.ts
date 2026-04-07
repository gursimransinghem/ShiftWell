/**
 * TDD: comparator — plan-vs-reality delta computation
 *
 * Tests:
 * - COMP-01: Positive delta when sleep is later than planned
 * - COMP-02: Negative delta when sleep is earlier than planned
 * - COMP-03: Null delta when actual is null (no HealthKit data)
 * - COMP-04: Duration delta computed correctly
 * - COMP-05: Watch worn flag propagated from actual
 * - COMP-06: getPlannedSleepForDate finds correct block
 * - COMP-07: getPlannedSleepForDate returns null for no main-sleep
 * - COMP-08: getPlannedSleepForDate matches on end date (night crossover)
 * - COMP-09: getPlannedSleepForDate picks longest block when multiple match
 */

import { computeDiscrepancy, getPlannedSleepForDate } from '../../src/lib/feedback/comparator';
import type { SleepWindow } from '../../src/lib/feedback/healthkit-sleep-reader';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWindow(
  startISO: string,
  endISO: string,
  watchWorn = true,
): SleepWindow {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  return { start, end, durationMinutes, watchWorn, source: 'Apple Watch' };
}

// ---------------------------------------------------------------------------
// computeDiscrepancy
// ---------------------------------------------------------------------------

describe('computeDiscrepancy', () => {
  const DATE_ISO = '2026-04-05';

  // Planned: 22:00 → 06:00 (8h)
  const planned = {
    start: new Date('2026-04-05T22:00:00'),
    end: new Date('2026-04-06T06:00:00'),
  };

  it('COMP-01: positive delta when sleep starts later than planned', () => {
    // Actual: 22:30 → 06:30 (8h, +30 min start, +30 min end)
    const actual = makeWindow('2026-04-05T22:30:00', '2026-04-06T06:30:00');
    const result = computeDiscrepancy(DATE_ISO, planned, actual);

    expect(result.delta).not.toBeNull();
    expect(result.delta!.startMinutes).toBe(30);
    expect(result.delta!.endMinutes).toBe(30);
    expect(result.delta!.durationMinutes).toBe(0);
  });

  it('COMP-02: negative delta when sleep starts earlier than planned', () => {
    // Actual: 21:45 → 05:45 (8h, -15 min start, -15 min end)
    const actual = makeWindow('2026-04-05T21:45:00', '2026-04-06T05:45:00');
    const result = computeDiscrepancy(DATE_ISO, planned, actual);

    expect(result.delta!.startMinutes).toBe(-15);
    expect(result.delta!.endMinutes).toBe(-15);
    expect(result.delta!.durationMinutes).toBe(0);
  });

  it('COMP-03: delta is null when actual is null', () => {
    const result = computeDiscrepancy(DATE_ISO, planned, null);

    expect(result.actual).toBeNull();
    expect(result.delta).toBeNull();
  });

  it('COMP-04: duration delta reflects more/less sleep', () => {
    // Actual: 22:00 → 05:00 (7h = -60 min vs planned 8h)
    const actual = makeWindow('2026-04-05T22:00:00', '2026-04-06T05:00:00');
    const result = computeDiscrepancy(DATE_ISO, planned, actual);

    expect(result.delta!.durationMinutes).toBe(-60);
  });

  it('COMP-05: watchWorn is false when actual reports watch not worn', () => {
    const actual = makeWindow('2026-04-05T22:00:00', '2026-04-06T06:00:00', false);
    const result = computeDiscrepancy(DATE_ISO, planned, actual);

    expect(result.watchWorn).toBe(false);
  });

  it('COMP-05b: watchWorn is true when actual reports watch worn', () => {
    const actual = makeWindow('2026-04-05T22:00:00', '2026-04-06T06:00:00', true);
    const result = computeDiscrepancy(DATE_ISO, planned, actual);

    expect(result.watchWorn).toBe(true);
  });

  it('COMP-03b: watchWorn defaults to false when actual is null', () => {
    const result = computeDiscrepancy(DATE_ISO, planned, null);
    expect(result.watchWorn).toBe(false);
  });

  it('stores the dateISO, planned hours, and source correctly', () => {
    const actual = makeWindow('2026-04-05T22:00:00', '2026-04-06T06:00:00');
    const result = computeDiscrepancy(DATE_ISO, planned, actual);

    expect(result.dateISO).toBe(DATE_ISO);
    expect(result.planned.durationHours).toBeCloseTo(8, 1);
    expect(result.source).toBe('healthkit');
  });
});

// ---------------------------------------------------------------------------
// getPlannedSleepForDate
// ---------------------------------------------------------------------------

describe('getPlannedSleepForDate', () => {
  const blocks = [
    {
      type: 'main-sleep',
      start: new Date('2026-04-05T22:00:00'),
      end: new Date('2026-04-06T06:00:00'),
    },
    {
      type: 'wind-down',
      start: new Date('2026-04-05T21:00:00'),
      end: new Date('2026-04-05T22:00:00'),
    },
    {
      type: 'nap',
      start: new Date('2026-04-06T13:00:00'),
      end: new Date('2026-04-06T13:20:00'),
    },
  ];

  it('COMP-06: finds main-sleep block by start date', () => {
    const result = getPlannedSleepForDate('2026-04-05', blocks);
    expect(result).not.toBeNull();
    expect(result!.start).toEqual(new Date('2026-04-05T22:00:00'));
  });

  it('COMP-08: finds main-sleep block by end date (night crossover)', () => {
    // Sleep starts Apr 5, ends Apr 6 — searching for Apr 6 should still find it
    const result = getPlannedSleepForDate('2026-04-06', blocks);
    expect(result).not.toBeNull();
    expect(result!.start).toEqual(new Date('2026-04-05T22:00:00'));
  });

  it('COMP-07: returns null when no main-sleep block exists for date', () => {
    const result = getPlannedSleepForDate('2026-04-07', blocks);
    expect(result).toBeNull();
  });

  it('ignores non-main-sleep block types', () => {
    // Apr 6 has wind-down and nap but the main-sleep ends on Apr 6
    // Just verify nap doesn't match as main sleep
    const noMainBlocks = [
      {
        type: 'nap',
        start: new Date('2026-04-07T13:00:00'),
        end: new Date('2026-04-07T13:20:00'),
      },
    ];
    const result = getPlannedSleepForDate('2026-04-07', noMainBlocks);
    expect(result).toBeNull();
  });

  it('COMP-09: picks longest block when multiple main-sleep blocks match', () => {
    const multiBlocks = [
      {
        type: 'main-sleep',
        start: new Date('2026-04-05T22:00:00'),
        end: new Date('2026-04-06T06:00:00'), // 8h
      },
      {
        type: 'main-sleep',
        start: new Date('2026-04-05T23:00:00'),
        end: new Date('2026-04-06T04:00:00'), // 5h
      },
    ];
    const result = getPlannedSleepForDate('2026-04-05', multiBlocks);
    expect(result).not.toBeNull();
    // Should pick the 8h block
    expect(result!.start).toEqual(new Date('2026-04-05T22:00:00'));
  });
});
