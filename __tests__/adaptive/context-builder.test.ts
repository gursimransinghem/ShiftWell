/**
 * Tests for the Adaptive Context Builder.
 *
 * Verifies that buildAdaptiveContext correctly assembles the AdaptiveContext
 * from HealthKit history, shift schedule, personal calendar, and user profile.
 */

import { buildAdaptiveContext } from '../../src/lib/adaptive/context-builder';
import type { SleepRecord } from '../../src/lib/healthkit/healthkit-service';
import type { ShiftEvent, PersonalEvent, UserProfile } from '../../src/lib/circadian/types';
import { addDays, startOfDay } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = startOfDay(new Date());

const BASE_PROFILE: UserProfile = {
  chronotype: 'intermediate',
  sleepNeed: 7.5,
  caffeineHalfLife: 5,
  napPreference: true,
  householdSize: 1,
  hasYoungChildren: false,
  hasPets: false,
  commuteDuration: 30,
  workAddress: '',
  homeAddress: '',
  amRoutine: [],
  pmRoutine: [],
};

function makeSleepRecord(
  daysAgo: number,
  totalHours: number,
  source = 'Apple Watch Series 9',
): SleepRecord {
  const date = addDays(TODAY, -daysAgo);
  const totalMinutes = Math.round(totalHours * 60);
  return {
    date,
    inBedStart: null,
    inBedEnd: null,
    asleepStart: null,
    asleepEnd: null,
    totalSleepMinutes: totalMinutes,
    deepSleepMinutes: Math.round(totalMinutes * 0.20),
    remSleepMinutes: Math.round(totalMinutes * 0.22),
    coreSleepMinutes: Math.round(totalMinutes * 0.50),
    sleepEfficiency: 88,
    source,
  };
}

function makeShiftEvent(
  daysFromNow: number,
  shiftType: ShiftEvent['shiftType'],
  id = `shift-${daysFromNow}`,
): ShiftEvent {
  const start = addDays(TODAY, daysFromNow);
  start.setHours(19, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setHours(7, 0, 0, 0);
  return { id, title: 'ER Shift', start, end, shiftType, source: 'calendar' };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('buildAdaptiveContext', () => {
  describe('empty inputs — no history, no shifts', () => {
    it('sets learningPhase=true and daysTracked=0', () => {
      const ctx = buildAdaptiveContext({
        shifts: [],
        personalEvents: [],
        profile: BASE_PROFILE,
        history: [],
        today: TODAY,
      });

      expect(ctx.meta.learningPhase).toBe(true);
      expect(ctx.meta.daysTracked).toBe(0);
    });

    it('sets debt severity to none', () => {
      const ctx = buildAdaptiveContext({
        shifts: [],
        personalEvents: [],
        profile: BASE_PROFILE,
        history: [],
        today: TODAY,
      });

      expect(ctx.debt.severity).toBe('none');
    });

    it('returns null recovery score when no history', () => {
      const ctx = buildAdaptiveContext({
        shifts: [],
        personalEvents: [],
        profile: BASE_PROFILE,
        history: [],
        today: TODAY,
      });

      expect(ctx.recovery.score).toBeNull();
      expect(ctx.recovery.zone).toBeNull();
    });

    it('sets maintenanceMode=true when no transitions detected', () => {
      const ctx = buildAdaptiveContext({
        shifts: [],
        personalEvents: [],
        profile: BASE_PROFILE,
        history: [],
        today: TODAY,
      });

      expect(ctx.circadian.maintenanceMode).toBe(true);
      expect(ctx.circadian.protocol).toBeNull();
    });
  });

  describe('30+ Apple Watch records', () => {
    it('sets baselineMature=true and learningPhase=false', () => {
      // 30 Apple Watch records — computeRecoveryScore returns non-null for each
      const history: SleepRecord[] = Array.from({ length: 30 }, (_, i) =>
        makeSleepRecord(i + 1, 7.5, 'Apple Watch Series 9'),
      );

      const ctx = buildAdaptiveContext({
        shifts: [],
        personalEvents: [],
        profile: BASE_PROFILE,
        history,
        today: TODAY,
      });

      expect(ctx.recovery.baselineMature).toBe(true);
      expect(ctx.meta.learningPhase).toBe(false);
      expect(ctx.meta.daysTracked).toBe(30);
    });
  });

  describe('night shift 3 days out', () => {
    it('sets transitionType to day-to-night', () => {
      const shifts: ShiftEvent[] = [
        makeShiftEvent(0, 'day', 'day-1'),
        makeShiftEvent(3, 'night', 'night-1'),
      ];

      const ctx = buildAdaptiveContext({
        shifts,
        personalEvents: [],
        profile: BASE_PROFILE,
        history: [],
        today: TODAY,
      });

      expect(ctx.schedule.transitionType).toBe('day-to-night');
    });

    it('bankingWindowOpen reflects debt ledger output', () => {
      // No history → avg < sleepNeed is false (engine treats no data as need met)
      // So bankingWindowOpen should be false when history is empty
      const shifts: ShiftEvent[] = [
        makeShiftEvent(0, 'day', 'day-1'),
        makeShiftEvent(4, 'night', 'night-1'),
      ];

      const ctx = buildAdaptiveContext({
        shifts,
        personalEvents: [],
        profile: BASE_PROFILE,
        history: [],
        today: TODAY,
      });

      // Without sleep deficit, banking window should not open
      expect(ctx.schedule.bankingWindowOpen).toBe(false);
    });

    it('bankingWindowOpen is true when deficit exists and night shift is 3-7 days out', () => {
      // Undershoot by 2h/night for the past 7 nights → avg well below sleepNeed
      const history: SleepRecord[] = Array.from({ length: 7 }, (_, i) =>
        makeSleepRecord(i + 1, 5.5, 'iPhone'),
      );

      // Night shift 4 days out with a day-type boundary (prior day is different type)
      const shifts: ShiftEvent[] = [
        makeShiftEvent(3, 'day', 'day-boundary'),
        makeShiftEvent(4, 'night', 'night-1'),
      ];

      const ctx = buildAdaptiveContext({
        shifts,
        personalEvents: [],
        profile: BASE_PROFILE,
        history,
        today: TODAY,
      });

      expect(ctx.schedule.bankingWindowOpen).toBe(true);
    });
  });

  describe('pattern alerts', () => {
    it('adds night-soon alert when a night shift is within 3 days', () => {
      const shifts: ShiftEvent[] = [
        makeShiftEvent(2, 'night', 'night-1'),
      ];

      const ctx = buildAdaptiveContext({
        shifts,
        personalEvents: [],
        profile: BASE_PROFILE,
        history: [],
        today: TODAY,
      });

      const alert = ctx.schedule.patternAlerts.find((a) => a.type === 'night-soon');
      expect(alert).toBeDefined();
      expect(alert?.type).toBe('night-soon');
    });

    it('does NOT add night-soon alert when the only night shift is 4+ days away', () => {
      const shifts: ShiftEvent[] = [
        makeShiftEvent(5, 'night', 'night-1'),
      ];

      const ctx = buildAdaptiveContext({
        shifts,
        personalEvents: [],
        profile: BASE_PROFILE,
        history: [],
        today: TODAY,
      });

      const alert = ctx.schedule.patternAlerts.find((a) => a.type === 'night-soon');
      expect(alert).toBeUndefined();
    });

    it('adds consecutive-nights alert for back-to-back night shifts', () => {
      const shifts: ShiftEvent[] = [
        makeShiftEvent(1, 'night', 'night-1'),
        makeShiftEvent(2, 'night', 'night-2'),
      ];

      const ctx = buildAdaptiveContext({
        shifts,
        personalEvents: [],
        profile: BASE_PROFILE,
        history: [],
        today: TODAY,
      });

      const alert = ctx.schedule.patternAlerts.find(
        (a) => a.type === 'consecutive-nights',
      );
      expect(alert).toBeDefined();
    });

    it('adds mixed-week alert when both day and night shifts exist in 7 days', () => {
      const shifts: ShiftEvent[] = [
        makeShiftEvent(1, 'day', 'day-1'),
        makeShiftEvent(4, 'night', 'night-1'),
      ];

      const ctx = buildAdaptiveContext({
        shifts,
        personalEvents: [],
        profile: BASE_PROFILE,
        history: [],
        today: TODAY,
      });

      const alert = ctx.schedule.patternAlerts.find((a) => a.type === 'mixed-week');
      expect(alert).toBeDefined();
    });
  });

  describe('meta fields', () => {
    it('lastUpdated matches the today param', () => {
      const ctx = buildAdaptiveContext({
        shifts: [],
        personalEvents: [],
        profile: BASE_PROFILE,
        history: [],
        today: TODAY,
      });

      expect(ctx.meta.lastUpdated).toEqual(TODAY);
    });

    it('daysTracked equals history.length', () => {
      const history = [
        makeSleepRecord(1, 7.0),
        makeSleepRecord(2, 6.5),
        makeSleepRecord(3, 8.0),
      ];

      const ctx = buildAdaptiveContext({
        shifts: [],
        personalEvents: [],
        profile: BASE_PROFILE,
        history,
        today: TODAY,
      });

      expect(ctx.meta.daysTracked).toBe(3);
    });
  });
});
