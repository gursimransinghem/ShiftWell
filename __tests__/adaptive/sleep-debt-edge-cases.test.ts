/**
 * Sleep debt engine edge case tests.
 *
 * Tests cover:
 * - Extreme sleep debt (0 hours for multiple nights)
 * - Banking window logic edge cases
 * - Severity classification boundaries
 * - Empty history
 * - Records older than 14 days
 */

import { computeDebtLedger } from '../../src/lib/adaptive/sleep-debt-engine';
import type { SleepRecord } from '../../src/lib/healthkit/healthkit-service';
import type { ShiftEvent } from '../../src/lib/circadian/types';
import { addDays, subDays } from 'date-fns';

// ── Helpers ──────────────────────────────────────────────────────────

function makeSleepRecord(
  date: Date,
  totalSleepMinutes: number,
  overrides?: Partial<SleepRecord>,
): SleepRecord {
  return {
    date,
    inBedStart: null,
    inBedEnd: null,
    asleepStart: null,
    asleepEnd: null,
    totalSleepMinutes,
    deepSleepMinutes: totalSleepMinutes * 0.2,
    remSleepMinutes: totalSleepMinutes * 0.22,
    coreSleepMinutes: totalSleepMinutes * 0.58,
    sleepEfficiency: 85,
    source: 'Apple Watch',
    ...overrides,
  };
}

function makeNightShift(startDate: Date): ShiftEvent {
  const endDate = addDays(startDate, 1);
  return {
    id: `night-${startDate.toISOString().slice(0, 10)}`,
    title: 'Night Shift',
    start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 19, 0),
    end: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 7, 0),
    shiftType: 'night',
  };
}

// ── Test Suite ────────────────────────────────────────────────────────

describe('Sleep Debt Engine Edge Cases', () => {
  const today = new Date('2026-03-20');
  const sleepNeed = 7.5;

  describe('Extreme sleep debt', () => {
    it('handles zero sleep for 2 nights', () => {
      const history = [
        makeSleepRecord(subDays(today, 2), 0),
        makeSleepRecord(subDays(today, 1), 0),
      ];
      const ledger = computeDebtLedger(history, sleepNeed, [], today);
      // 2 * 7.5 = 15h debt, but capped at 10
      expect(ledger.rollingHours).toBe(10);
      expect(ledger.severity).toBe('severe');
      expect(ledger.bankHours).toBe(0);
    });

    it('handles zero sleep for 7 nights', () => {
      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(subDays(today, i + 1), 0)
      );
      const ledger = computeDebtLedger(history, sleepNeed, [], today);
      // 7 * 7.5 = 52.5h debt, capped at 10
      expect(ledger.rollingHours).toBe(10);
      expect(ledger.severity).toBe('severe');
    });

    it('handles slightly under sleep need for 14 nights', () => {
      const history = Array.from({ length: 14 }, (_, i) =>
        makeSleepRecord(subDays(today, i + 1), 7 * 60) // 7h per night, need 7.5
      );
      const ledger = computeDebtLedger(history, sleepNeed, [], today);
      // 14 * 0.5 = 7h debt
      expect(ledger.rollingHours).toBeCloseTo(7, 0);
      expect(ledger.severity).toBe('severe');
    });
  });

  describe('Sleep surplus / banking', () => {
    it('computes bank hours when sleeping more than needed', () => {
      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(subDays(today, i + 1), 9 * 60) // 9h per night, need 7.5
      );
      const ledger = computeDebtLedger(history, sleepNeed, [], today);
      // 7 * (7.5 - 9) = -10.5h → surplus, capped at bank of 2h
      expect(ledger.rollingHours).toBeLessThan(0);
      expect(ledger.bankHours).toBe(2); // capped at 2
      expect(ledger.severity).toBe('none');
    });

    it('computes zero bank hours when in debt', () => {
      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(subDays(today, i + 1), 6 * 60) // 6h per night
      );
      const ledger = computeDebtLedger(history, sleepNeed, [], today);
      expect(ledger.rollingHours).toBeGreaterThan(0);
      expect(ledger.bankHours).toBe(0);
    });
  });

  describe('Severity classification boundaries', () => {
    it('classifies none when debt < 0.5h', () => {
      // Need 7.5h, sleep 7.4h → 0.1h debt per night, 1 night = 0.1h
      const history = [makeSleepRecord(subDays(today, 1), 7.4 * 60)];
      const ledger = computeDebtLedger(history, sleepNeed, [], today);
      expect(ledger.severity).toBe('none');
    });

    it('classifies mild when debt between 0.5 and 2h', () => {
      // 1 night of 6.5h = 1h debt
      const history = [makeSleepRecord(subDays(today, 1), 6.5 * 60)];
      const ledger = computeDebtLedger(history, sleepNeed, [], today);
      expect(ledger.rollingHours).toBeCloseTo(1, 0);
      expect(ledger.severity).toBe('mild');
    });

    it('classifies moderate when debt between 2 and 5h', () => {
      // 3 nights of 6h = 3 * 1.5 = 4.5h debt
      const history = Array.from({ length: 3 }, (_, i) =>
        makeSleepRecord(subDays(today, i + 1), 6 * 60)
      );
      const ledger = computeDebtLedger(history, sleepNeed, [], today);
      expect(ledger.severity).toBe('moderate');
    });

    it('classifies severe when debt >= 5h', () => {
      // 5 nights of 5h = 5 * 2.5 = 12.5h debt (capped to 10)
      const history = Array.from({ length: 5 }, (_, i) =>
        makeSleepRecord(subDays(today, i + 1), 5 * 60)
      );
      const ledger = computeDebtLedger(history, sleepNeed, [], today);
      expect(ledger.severity).toBe('severe');
    });
  });

  describe('History filtering', () => {
    it('ignores records older than 14 days', () => {
      const history = [
        makeSleepRecord(subDays(today, 20), 0), // 20 days ago — should be ignored
        makeSleepRecord(subDays(today, 1), 7.5 * 60), // yesterday — included
      ];
      const ledger = computeDebtLedger(history, sleepNeed, [], today);
      // Only the recent record should be counted: 0h debt
      expect(ledger.rollingHours).toBeCloseTo(0, 0);
      expect(ledger.severity).toBe('none');
    });

    it('handles empty history', () => {
      const ledger = computeDebtLedger([], sleepNeed, [], today);
      // No records → no debt calculated
      expect(ledger.rollingHours).toBe(0);
      expect(ledger.severity).toBe('none');
    });

    it('handles records exactly on the 14-day boundary', () => {
      const history = [
        makeSleepRecord(subDays(today, 14), 5 * 60), // exactly 14 days ago
      ];
      const ledger = computeDebtLedger(history, sleepNeed, [], today);
      // Should be included (>= cutoff)
      expect(ledger.rollingHours).toBeGreaterThan(0);
    });
  });

  describe('Banking window logic', () => {
    it('opens banking window when night shift is 3-7 days out and avg < need', () => {
      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(subDays(today, i + 1), 6.5 * 60) // under sleep need
      );
      const upcomingShifts = [
        makeNightShift(addDays(today, 5)), // 5 days out
      ];
      const ledger = computeDebtLedger(history, sleepNeed, upcomingShifts, today);
      expect(ledger.bankingWindowOpen).toBe(true);
    });

    it('keeps banking window closed when night shift is too far (> 7 days)', () => {
      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(subDays(today, i + 1), 6.5 * 60)
      );
      const upcomingShifts = [
        makeNightShift(addDays(today, 10)), // 10 days out — too far
      ];
      const ledger = computeDebtLedger(history, sleepNeed, upcomingShifts, today);
      expect(ledger.bankingWindowOpen).toBe(false);
    });

    it('keeps banking window closed when night shift is too soon (< 3 days)', () => {
      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(subDays(today, i + 1), 6.5 * 60)
      );
      const upcomingShifts = [
        makeNightShift(addDays(today, 1)), // 1 day out — too soon
      ];
      const ledger = computeDebtLedger(history, sleepNeed, upcomingShifts, today);
      expect(ledger.bankingWindowOpen).toBe(false);
    });

    it('keeps banking window closed when already meeting sleep need', () => {
      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(subDays(today, i + 1), 8 * 60) // above sleep need
      );
      const upcomingShifts = [
        makeNightShift(addDays(today, 5)),
      ];
      const ledger = computeDebtLedger(history, sleepNeed, upcomingShifts, today);
      expect(ledger.bankingWindowOpen).toBe(false);
    });

    it('keeps banking window closed with no upcoming shifts', () => {
      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(subDays(today, i + 1), 6 * 60)
      );
      const ledger = computeDebtLedger(history, sleepNeed, [], today);
      expect(ledger.bankingWindowOpen).toBe(false);
    });

    it('keeps banking window closed when only day shifts upcoming', () => {
      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(subDays(today, i + 1), 6 * 60)
      );
      const upcomingShifts: ShiftEvent[] = [{
        id: 'day-1',
        title: 'Day Shift',
        start: new Date(addDays(today, 5).getFullYear(), addDays(today, 5).getMonth(), addDays(today, 5).getDate(), 7, 0),
        end: new Date(addDays(today, 5).getFullYear(), addDays(today, 5).getMonth(), addDays(today, 5).getDate(), 19, 0),
        shiftType: 'day',
      }];
      const ledger = computeDebtLedger(history, sleepNeed, upcomingShifts, today);
      expect(ledger.bankingWindowOpen).toBe(false);
    });
  });
});
