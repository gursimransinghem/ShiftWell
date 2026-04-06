/**
 * Tests for the Sleep Debt Engine.
 *
 * Verifies rolling debt computation, severity tiers, bank hour capping,
 * and the banking-window-open flag logic.
 */

import { computeDebtLedger } from '../../src/lib/adaptive/sleep-debt-engine';
import type { SleepRecord } from '../../src/lib/healthkit/healthkit-service';
import type { ShiftEvent } from '../../src/lib/circadian/types';
import { addDays } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSleepRecord(totalHours: number, source = 'iPhone', daysAgo = 0): SleepRecord {
  const date = addDays(new Date(), -daysAgo);
  return {
    date,
    inBedStart: null,
    inBedEnd: null,
    asleepStart: null,
    asleepEnd: null,
    totalSleepMinutes: Math.round(totalHours * 60),
    deepSleepMinutes: 0,
    remSleepMinutes: 0,
    coreSleepMinutes: 0,
    sleepEfficiency: 85,
    source,
  };
}

function makeShiftEvent(
  daysFromNow: number,
  shiftType: ShiftEvent['shiftType'],
  id: string,
): ShiftEvent {
  const start = addDays(new Date(), daysFromNow);
  start.setHours(19, 0, 0, 0);
  const end = addDays(start, 1);
  end.setHours(7, 0, 0, 0);
  return { id, title: 'Test Shift', start, end, shiftType, source: 'calendar' };
}

const TODAY = new Date();

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('computeDebtLedger', () => {
  describe('empty history', () => {
    it('returns zeroed ledger when no sleep records exist', () => {
      const result = computeDebtLedger([], 7.5, [], TODAY);
      expect(result).toEqual({
        rollingHours: 0,
        bankHours: 0,
        severity: 'none',
        bankingWindowOpen: false,
      });
    });
  });

  describe('moderate debt', () => {
    it('computes 3.5h debt from 7 nights × 7h sleep with 7.5h need', () => {
      // 7 nights of 7h each → 7 × (7.5 - 7) = 7 × 0.5 = 3.5h debt
      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(7, 'iPhone', i),
      );
      const result = computeDebtLedger(history, 7.5, [], TODAY);
      expect(result.rollingHours).toBeCloseTo(3.5, 5);
      expect(result.severity).toBe('moderate');
      expect(result.bankHours).toBe(0);
      expect(result.bankingWindowOpen).toBe(false);
    });
  });

  describe('surplus and bank hours', () => {
    it('caps bankHours at 2 when surplus exceeds 2h', () => {
      // 7 nights × 9h = surplus: 7 × (7.5 - 9) = 7 × -1.5 = -10.5h
      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(9, 'iPhone', i),
      );
      const result = computeDebtLedger(history, 7.5, [], TODAY);
      expect(result.rollingHours).toBeCloseTo(-10.5, 5);
      expect(result.bankHours).toBe(2); // capped at 2h
      expect(result.severity).toBe('none');
    });
  });

  describe('severe debt with 10h cap', () => {
    it('caps rollingHours at 10h and reports severe severity', () => {
      // 5 nights × 5h → 5 × (7.5 - 5) = 5 × 2.5 = 12.5h → capped to 10h
      const history = Array.from({ length: 5 }, (_, i) =>
        makeSleepRecord(5, 'iPhone', i),
      );
      const result = computeDebtLedger(history, 7.5, [], TODAY);
      expect(result.rollingHours).toBe(10); // hard cap
      expect(result.severity).toBe('severe');
      expect(result.bankHours).toBe(0);
    });
  });

  describe('no debt when sleep need exactly met', () => {
    it('returns severity=none and bankHours=0 when every night matches sleepNeed', () => {
      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(7.5, 'iPhone', i),
      );
      const result = computeDebtLedger(history, 7.5, [], TODAY);
      expect(result.rollingHours).toBeCloseTo(0, 5);
      expect(result.severity).toBe('none');
      expect(result.bankHours).toBe(0);
    });
  });

  describe('bankingWindowOpen — true scenario', () => {
    it('returns true when a night shift is 4 days away with boundary and sleep deficit', () => {
      // Prior day (3 days from now) is a day shift → boundary exists
      // Target shift (4 days from now) is night → qualifies
      const priorShift = makeShiftEvent(3, 'day', 'shift-day-3');
      const nightShift = makeShiftEvent(4, 'night', 'shift-night-4');

      // 7 nights of sleep below need (6h vs 7.5h need → deficit)
      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(6, 'iPhone', i),
      );

      const result = computeDebtLedger(history, 7.5, [priorShift, nightShift], TODAY);
      expect(result.bankingWindowOpen).toBe(true);
    });
  });

  describe('bankingWindowOpen — false when shift is too soon', () => {
    it('returns false when the night shift is only 2 days away', () => {
      // 2 days away is outside the 3–7 day window
      const nightShift = makeShiftEvent(2, 'night', 'shift-night-2');

      const history = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(6, 'iPhone', i),
      );

      const result = computeDebtLedger(history, 7.5, [nightShift], TODAY);
      expect(result.bankingWindowOpen).toBe(false);
    });
  });
});
