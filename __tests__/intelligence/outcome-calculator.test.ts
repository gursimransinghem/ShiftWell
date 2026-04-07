/**
 * Tests for outcome-calculator — Phase 25 (Intelligence Polish)
 *
 * OC-01: Returns zero improvement when fewer than 14 days of data
 * OC-02: Calculates improvement % comparing first 7 vs last 7 days
 * OC-03: Streak = consecutive days with discrepancy < 30 min
 * OC-04: Adherence rate = on-time days / total tracked days
 * OC-05: Handles empty history gracefully
 * OC-06: daysUsing derived from installedAt ISO string
 * OC-07: transitionsHandled counts circadian changeLog entries with timestamps
 * OC-08: currentStreak resets after a miss, bestStreak is preserved
 * OC-09: debtReduction is always non-negative
 * OC-10: Records with null delta are excluded from adherence calculation
 */

import { calculateOutcomes } from '../../src/lib/intelligence/outcome-calculator';
import type { SleepDiscrepancy } from '../../src/lib/feedback/types';
import type { AdaptiveChange } from '../../src/lib/adaptive/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRecord(dateISO: string, startDeltaMinutes: number, durationDeltaMinutes = startDeltaMinutes): SleepDiscrepancy {
  return {
    dateISO,
    planned: {
      start: new Date(`${dateISO}T22:00:00`).toISOString(),
      end: new Date(`${dateISO}T06:00:00`).toISOString(),
      durationHours: 8,
    },
    actual: {
      start: new Date(`${dateISO}T22:00:00`).toISOString(),
      end: new Date(`${dateISO}T06:00:00`).toISOString(),
      durationHours: 8,
    },
    delta: {
      startMinutes: startDeltaMinutes,
      endMinutes: 0,
      durationMinutes: durationDeltaMinutes,
    },
    source: 'healthkit',
    watchWorn: true,
  };
}

function makeNullRecord(dateISO: string): SleepDiscrepancy {
  return {
    dateISO,
    planned: {
      start: new Date(`${dateISO}T22:00:00`).toISOString(),
      end: new Date(`${dateISO}T06:00:00`).toISOString(),
      durationHours: 8,
    },
    actual: null,
    delta: null,
    source: 'healthkit',
    watchWorn: false,
  };
}

function makeChangeLog(
  count: number,
  factor: AdaptiveChange['factor'] = 'circadian',
  withTimestamp = true,
): AdaptiveChange[] {
  return Array.from({ length: count }, (_, i) => ({
    type: 'bedtime-shifted' as const,
    factor,
    magnitudeMinutes: 30,
    humanReadable: `Bedtime shifted 30 min later`,
    reason: 'Night shift starts tomorrow',
    timestamp: withTimestamp ? `2026-04-0${i + 1}T08:00:00.000Z` : undefined,
  }));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('calculateOutcomes', () => {
  // OC-05: empty history
  it('OC-05: handles empty history gracefully', () => {
    const result = calculateOutcomes([], [], null);
    expect(result.sleepImprovement).toBe(0);
    expect(result.adherenceRate).toBe(0);
    expect(result.bestStreak).toBe(0);
    expect(result.currentStreak).toBe(0);
    expect(result.daysUsing).toBe(0);
    expect(result.transitionsHandled).toBe(0);
  });

  // OC-01: no improvement when fewer than 14 days
  it('OC-01: returns zero improvement with fewer than 14 records', () => {
    const records = Array.from({ length: 10 }, (_, i) =>
      makeRecord(`2026-03-${String(i + 1).padStart(2, '0')}`, 20)
    );
    const result = calculateOutcomes(records, [], null);
    expect(result.sleepImprovement).toBe(0);
  });

  // OC-02: improvement % calculated from first vs last week
  it('OC-02: calculates improvement % correctly', () => {
    // First 7: large deviation (60 min avg); last 7: small deviation (10 min avg)
    const firstWeek = Array.from({ length: 7 }, (_, i) =>
      makeRecord(`2026-03-${String(i + 1).padStart(2, '0')}`, 0, 60)
    );
    const lastWeek = Array.from({ length: 7 }, (_, i) =>
      makeRecord(`2026-03-${String(i + 8).padStart(2, '0')}`, 0, 10)
    );
    const result = calculateOutcomes([...firstWeek, ...lastWeek], [], null);
    // Improvement = (60 - 10) / 60 * 100 = 83%
    expect(result.sleepImprovement).toBe(83);
  });

  // OC-03: streak counts consecutive good-adherence days
  it('OC-03: streak counts consecutive days with startDelta < 30 min', () => {
    // 5 good days in a row
    const records = [
      makeRecord('2026-03-01', 10),  // good
      makeRecord('2026-03-02', 20),  // good
      makeRecord('2026-03-03', 25),  // good
      makeRecord('2026-03-04', 15),  // good
      makeRecord('2026-03-05', 5),   // good
    ];
    const result = calculateOutcomes(records, [], null);
    expect(result.currentStreak).toBe(5);
    expect(result.bestStreak).toBe(5);
  });

  // OC-08: currentStreak resets after a miss, bestStreak preserved
  it('OC-08: currentStreak resets after a miss', () => {
    const records = [
      makeRecord('2026-03-01', 10),  // good
      makeRecord('2026-03-02', 10),  // good
      makeRecord('2026-03-03', 10),  // good
      makeRecord('2026-03-04', 60),  // miss — resets
      makeRecord('2026-03-05', 15),  // good
      makeRecord('2026-03-06', 20),  // good
    ];
    const result = calculateOutcomes(records, [], null);
    expect(result.currentStreak).toBe(2);
    expect(result.bestStreak).toBe(3);
  });

  // OC-04: adherence rate calculation
  it('OC-04: adherence rate is on-time days divided by total tracked days', () => {
    const records = [
      makeRecord('2026-03-01', 10),  // good
      makeRecord('2026-03-02', 45),  // miss
      makeRecord('2026-03-03', 20),  // good
      makeRecord('2026-03-04', 50),  // miss
    ];
    const result = calculateOutcomes(records, [], null);
    // 2 good out of 4 = 50%
    expect(result.adherenceRate).toBe(50);
  });

  // OC-06: daysUsing from installedAt
  it('OC-06: daysUsing derived from installedAt ISO string', () => {
    const now = new Date();
    // Installed 10 days ago
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const result = calculateOutcomes([], [], tenDaysAgo.toISOString());
    expect(result.daysUsing).toBe(10);
  });

  // OC-07: transitionsHandled counts circadian entries with timestamps
  it('OC-07: counts only circadian changeLog entries with timestamps', () => {
    const changeLog: AdaptiveChange[] = [
      ...makeChangeLog(3, 'circadian', true),   // 3 with timestamp → count
      ...makeChangeLog(2, 'circadian', false),  // 2 without timestamp → skip
      ...makeChangeLog(2, 'debt', true),        // 2 debt factor → skip
    ];
    const result = calculateOutcomes([], changeLog, null);
    expect(result.transitionsHandled).toBe(3);
  });

  // OC-09: debtReduction is always non-negative
  it('OC-09: debtReduction is non-negative even when debt increased', () => {
    // First week: low deviation; last week: high deviation (debt increased)
    const firstWeek = Array.from({ length: 7 }, (_, i) =>
      makeRecord(`2026-03-${String(i + 1).padStart(2, '0')}`, 0, 10)
    );
    const lastWeek = Array.from({ length: 7 }, (_, i) =>
      makeRecord(`2026-03-${String(i + 8).padStart(2, '0')}`, 0, 60)
    );
    const result = calculateOutcomes([...firstWeek, ...lastWeek], [], null);
    expect(result.debtReduction).toBeGreaterThanOrEqual(0);
  });

  // OC-10: null-delta records excluded from adherence
  it('OC-10: null-delta records excluded from adherence calculation', () => {
    const records = [
      makeRecord('2026-03-01', 10),      // good
      makeNullRecord('2026-03-02'),      // no data → excluded
      makeRecord('2026-03-03', 50),      // miss
      makeNullRecord('2026-03-04'),      // no data → excluded
    ];
    const result = calculateOutcomes(records, [], null);
    // 1 good out of 2 tracked = 50%
    expect(result.adherenceRate).toBe(50);
  });
});
