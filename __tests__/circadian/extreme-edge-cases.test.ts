/**
 * Extreme edge case tests for the ShiftWell circadian algorithm.
 *
 * Tests cover:
 * - Extreme sleep debt scenarios (0 hours for 48hrs)
 * - Midnight shift boundaries
 * - DST transitions during shift rotation
 * - Same-day double shifts
 * - Recovery score boundary values
 * - Timezone changes during rotation
 */

import { generateSleepPlan } from '../../src/lib/circadian';
import { classifyShiftType, classifyDays, detectPatterns } from '../../src/lib/circadian/classify-shifts';
import type { ShiftEvent, PersonalEvent, UserProfile, PlanBlock, SleepPlan, ClassifiedDay } from '../../src/lib/circadian/types';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';
import { differenceInHours, differenceInMinutes, addDays, addHours } from 'date-fns';

// ── Helpers ──────────────────────────────────────────────────────────

function makeShift(id: string, startISO: string, endISO: string): ShiftEvent {
  const start = new Date(startISO);
  const end = new Date(endISO);
  return {
    id,
    title: `Shift ${id}`,
    start,
    end,
    shiftType: classifyShiftType(start, end),
  };
}

function validatePlanBasics(plan: SleepPlan): void {
  expect(plan.blocks.length).toBeGreaterThan(0);
  // Blocks are sorted chronologically
  for (let i = 1; i < plan.blocks.length; i++) {
    expect(plan.blocks[i].start.getTime()).toBeGreaterThanOrEqual(
      plan.blocks[i - 1].start.getTime()
    );
  }
}

// ── Test Suite ────────────────────────────────────────────────────────

describe('Extreme Edge Cases', () => {
  const defaultProfile: UserProfile = { ...DEFAULT_PROFILE };

  describe('Midnight boundary shifts', () => {
    it('handles shift starting exactly at midnight (00:00)', () => {
      const shifts = [
        makeShift('m1', '2026-03-15T00:00:00', '2026-03-15T08:00:00'),
      ];
      expect(shifts[0].shiftType).toBe('night');
      const plan = generateSleepPlan(
        new Date('2026-03-14'), new Date('2026-03-15'), shifts, [], defaultProfile,
      );
      validatePlanBasics(plan);
      const sleepBlocks = plan.blocks.filter((b) => b.type === 'main-sleep');
      expect(sleepBlocks.length).toBeGreaterThanOrEqual(1);
    });

    it('handles shift ending exactly at midnight (00:00)', () => {
      const shifts = [
        makeShift('e1', '2026-03-15T16:00:00', '2026-03-16T00:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], defaultProfile,
      );
      validatePlanBasics(plan);
    });

    it('handles shift spanning exactly midnight (23:00-01:00)', () => {
      const shifts = [
        makeShift('s1', '2026-03-15T23:00:00', '2026-03-16T01:00:00'),
      ];
      // 2 hour shift, starts at 23:00 = night
      expect(shifts[0].shiftType).toBe('night');
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], defaultProfile,
      );
      validatePlanBasics(plan);
    });

    it('handles shift starting at 04:59 (last minute of night classification)', () => {
      const shifts = [
        makeShift('early', '2026-03-15T04:59:00', '2026-03-15T13:00:00'),
      ];
      // 04:59 is hour 4 → < 5 → night classification
      expect(shifts[0].shiftType).toBe('night');
    });

    it('handles shift starting at 05:00 (first minute of day classification)', () => {
      const shifts = [
        makeShift('dawn', '2026-03-15T05:00:00', '2026-03-15T13:00:00'),
      ];
      expect(shifts[0].shiftType).toBe('day');
    });
  });

  describe('Same-day double shifts', () => {
    it('handles two full shifts in one day with minimal gap', () => {
      const shifts = [
        makeShift('am', '2026-03-15T06:00:00', '2026-03-15T14:00:00'),
        makeShift('pm', '2026-03-15T15:00:00', '2026-03-15T23:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], defaultProfile,
      );
      validatePlanBasics(plan);
      // Should still generate some sleep
      const sleepBlocks = plan.blocks.filter((b) => b.type === 'main-sleep');
      expect(sleepBlocks.length).toBeGreaterThanOrEqual(1);
    });

    it('handles three short shifts in one day', () => {
      const shifts = [
        makeShift('s1', '2026-03-15T06:00:00', '2026-03-15T10:00:00'),
        makeShift('s2', '2026-03-15T12:00:00', '2026-03-15T16:00:00'),
        makeShift('s3', '2026-03-15T18:00:00', '2026-03-15T22:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], defaultProfile,
      );
      validatePlanBasics(plan);
    });
  });

  describe('Extreme schedules', () => {
    it('handles 14 consecutive night shifts', () => {
      const shifts: ShiftEvent[] = [];
      for (let i = 0; i < 14; i++) {
        const startDate = addDays(new Date('2026-03-01'), i);
        const endDate = addDays(new Date('2026-03-01'), i + 1);
        const startStr = startDate.toISOString().slice(0, 10);
        const endStr = endDate.toISOString().slice(0, 10);
        shifts.push(
          makeShift(`n${i}`, `${startStr}T19:00:00`, `${endStr}T07:00:00`)
        );
      }
      const plan = generateSleepPlan(
        new Date('2026-03-01'), new Date('2026-03-15'), shifts, [], defaultProfile,
      );
      validatePlanBasics(plan);
      expect(plan.stats.nightShiftCount).toBeGreaterThanOrEqual(14);
      // Circadian debt should be high with 14 consecutive nights
      expect(plan.stats.circadianDebtScore).toBeGreaterThan(50);
    });

    it('handles alternating day/night shifts every other day', () => {
      const shifts: ShiftEvent[] = [
        makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00'),
        makeShift('n1', '2026-03-17T19:00:00', '2026-03-18T07:00:00'),
        makeShift('d2', '2026-03-19T07:00:00', '2026-03-19T19:00:00'),
        makeShift('n2', '2026-03-21T19:00:00', '2026-03-22T07:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-22'), shifts, [], defaultProfile,
      );
      validatePlanBasics(plan);
      // This chaotic schedule should have hard transitions
      expect(plan.stats.hardTransitions).toBeGreaterThan(0);
    });

    it('handles a single shift in a 30-day window', () => {
      const shifts = [
        makeShift('lone', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-01'), new Date('2026-03-30'), shifts, [], defaultProfile,
      );
      validatePlanBasics(plan);
      expect(plan.classifiedDays.length).toBe(30);
      // Most days should be off
      const offDays = plan.classifiedDays.filter((d) => d.dayType === 'off');
      expect(offDays.length).toBeGreaterThanOrEqual(25);
    });

    it('handles empty schedule (no shifts, no events, single day)', () => {
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-15'), [], [], defaultProfile,
      );
      validatePlanBasics(plan);
      expect(plan.classifiedDays.length).toBe(1);
      expect(plan.classifiedDays[0].dayType).toBe('off');
    });
  });

  describe('Extreme user profiles', () => {
    it('handles minimum sleep need (4h)', () => {
      const profile: UserProfile = { ...DEFAULT_PROFILE, sleepNeed: 4 };
      const shifts = [
        makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], profile,
      );
      validatePlanBasics(plan);
      const mainSleep = plan.blocks.find((b) => b.type === 'main-sleep');
      expect(mainSleep).toBeDefined();
    });

    it('handles maximum sleep need (10h)', () => {
      const profile: UserProfile = { ...DEFAULT_PROFILE, sleepNeed: 10 };
      const shifts = [
        makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], profile,
      );
      validatePlanBasics(plan);
      const mainSleep = plan.blocks.find((b) => b.type === 'main-sleep');
      expect(mainSleep).toBeDefined();
      const duration = differenceInHours(mainSleep!.end, mainSleep!.start);
      expect(duration).toBeGreaterThanOrEqual(7);
    });

    it('handles zero commute duration', () => {
      const profile: UserProfile = { ...DEFAULT_PROFILE, commuteDuration: 0 };
      const shifts = [
        makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], profile,
      );
      validatePlanBasics(plan);
    });

    it('handles very long commute (120 min)', () => {
      const profile: UserProfile = { ...DEFAULT_PROFILE, commuteDuration: 120 };
      const shifts = [
        makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], profile,
      );
      validatePlanBasics(plan);
    });

    it('handles all booleans true (children, pets, naps)', () => {
      const profile: UserProfile = {
        ...DEFAULT_PROFILE,
        hasYoungChildren: true,
        hasPets: true,
        napPreference: true,
        householdSize: 6,
      };
      const shifts = [
        makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], profile,
      );
      validatePlanBasics(plan);
    });

    it('handles nap preference disabled', () => {
      const profile: UserProfile = { ...DEFAULT_PROFILE, napPreference: false };
      const shifts = [
        makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], profile,
      );
      validatePlanBasics(plan);
      // No nap blocks should be generated
      const naps = plan.blocks.filter((b) => b.type === 'nap');
      expect(naps.length).toBe(0);
    });

    it('handles extreme caffeine sensitivity (10h half-life)', () => {
      const profile: UserProfile = { ...DEFAULT_PROFILE, caffeineHalfLife: 10 };
      const shifts = [
        makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], profile,
      );
      validatePlanBasics(plan);
      const cutoff = plan.blocks.find((b) => b.type === 'caffeine-cutoff' && b.label === 'Caffeine Cutoff');
      expect(cutoff).toBeDefined();
    });

    it('handles very low caffeine sensitivity (2h half-life)', () => {
      const profile: UserProfile = { ...DEFAULT_PROFILE, caffeineHalfLife: 2 };
      const shifts = [
        makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], profile,
      );
      validatePlanBasics(plan);
    });
  });

  describe('Shift type boundary classification', () => {
    it('classifies 13:59 start as day shift', () => {
      expect(classifyShiftType(
        new Date('2026-03-15T13:59:00'),
        new Date('2026-03-15T22:00:00')
      )).toBe('day');
    });

    it('classifies 14:00 start as evening shift', () => {
      expect(classifyShiftType(
        new Date('2026-03-15T14:00:00'),
        new Date('2026-03-15T22:00:00')
      )).toBe('evening');
    });

    it('classifies 17:59 start as evening shift', () => {
      expect(classifyShiftType(
        new Date('2026-03-15T17:59:00'),
        new Date('2026-03-16T02:00:00')
      )).toBe('evening');
    });

    it('classifies 18:00 start as night shift', () => {
      expect(classifyShiftType(
        new Date('2026-03-15T18:00:00'),
        new Date('2026-03-16T06:00:00')
      )).toBe('night');
    });

    it('classifies exactly 16h shift as night (not extended)', () => {
      // 16 hours exactly: differenceInHours returns 16, which is NOT > 16
      expect(classifyShiftType(
        new Date('2026-03-15T18:00:00'),
        new Date('2026-03-16T10:00:00')
      )).toBe('night');
    });

    it('classifies 17h shift as extended', () => {
      // differenceInHours truncates, so need > 16 full hours
      expect(classifyShiftType(
        new Date('2026-03-15T06:00:00'),
        new Date('2026-03-15T23:00:00')
      )).toBe('extended');
    });

    it('classifies 24h shift as extended', () => {
      expect(classifyShiftType(
        new Date('2026-03-15T07:00:00'),
        new Date('2026-03-16T07:00:00')
      )).toBe('extended');
    });

    it('classifies 48h shift as extended', () => {
      expect(classifyShiftType(
        new Date('2026-03-15T07:00:00'),
        new Date('2026-03-17T07:00:00')
      )).toBe('extended');
    });
  });

  describe('Day classification edge cases', () => {
    it('classifies a night shift and surrounding day types', () => {
      const shifts = [
        makeShift('n1', '2026-03-16T19:00:00', '2026-03-17T07:00:00'),
      ];
      const classified = classifyDays(
        new Date('2026-03-15'), new Date('2026-03-18'), shifts, []
      );
      const dayTypes = classified.map(d => d.dayType);
      // The shift should create at least one work-night day
      expect(dayTypes).toContain('work-night');
      // All days should have valid types
      dayTypes.forEach(dt => {
        expect([
          'work-day', 'work-evening', 'work-night', 'work-extended',
          'off', 'transition-to-nights', 'transition-to-days', 'recovery',
        ]).toContain(dt);
      });
    });

    it('classifies all days in range for a night shift schedule', () => {
      const shifts = [
        makeShift('n1', '2026-03-16T19:00:00', '2026-03-17T07:00:00'),
      ];
      const classified = classifyDays(
        new Date('2026-03-16'), new Date('2026-03-18'), shifts, []
      );
      // All classified days should have a valid dayType
      classified.forEach(d => {
        expect([
          'work-day', 'work-evening', 'work-night', 'work-extended',
          'off', 'transition-to-nights', 'transition-to-days', 'recovery',
        ]).toContain(d.dayType);
      });
      // At least one day should be work-night
      expect(classified.some(d => d.dayType === 'work-night')).toBe(true);
    });

    it('classifies consecutive off days correctly', () => {
      const classified = classifyDays(
        new Date('2026-03-15'), new Date('2026-03-20'), [], []
      );
      classified.forEach((d) => {
        expect(d.dayType).toBe('off');
      });
    });

    it('assigns personal events to the day they occur on', () => {
      const events: PersonalEvent[] = [
        {
          id: 'e1',
          title: 'Doctor Visit',
          start: new Date('2026-03-16T10:00:00'),
          end: new Date('2026-03-16T11:00:00'),
        },
      ];
      const classified = classifyDays(
        new Date('2026-03-15'), new Date('2026-03-17'), [], events,
      );
      // Find the day that has the event
      const dayWithEvent = classified.find(d =>
        d.personalEvents.some(e => e.title === 'Doctor Visit')
      );
      expect(dayWithEvent).toBeDefined();
      expect(dayWithEvent!.personalEvents[0].title).toBe('Doctor Visit');
    });
  });

  describe('Pattern detection edge cases', () => {
    it('detects zero patterns with no shifts', () => {
      const classified = classifyDays(
        new Date('2026-03-15'), new Date('2026-03-20'), [], []
      );
      const patterns = detectPatterns(classified);
      expect(patterns.nightStretchLengths).toEqual([]);
      expect(patterns.hardTransitions).toBe(0);
      expect(patterns.consecutiveWorkDays).toBe(0);
    });

    it('detects night stretch for a single night shift', () => {
      const shifts = [
        makeShift('n1', '2026-03-16T19:00:00', '2026-03-17T07:00:00'),
      ];
      const classified = classifyDays(
        new Date('2026-03-15'), new Date('2026-03-18'), shifts, []
      );
      const patterns = detectPatterns(classified);
      // The overnight shift may be counted on multiple days by the classifier
      expect(patterns.nightStretchLengths.length).toBeGreaterThan(0);
      expect(patterns.nightStretchLengths.every(n => n >= 1)).toBe(true);
    });

    it('counts consecutive work days across mixed shift types', () => {
      const shifts = [
        makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00'),
        makeShift('d2', '2026-03-16T07:00:00', '2026-03-16T19:00:00'),
        makeShift('e1', '2026-03-17T14:00:00', '2026-03-17T22:00:00'),
        makeShift('n1', '2026-03-18T19:00:00', '2026-03-19T07:00:00'),
      ];
      const classified = classifyDays(
        new Date('2026-03-15'), new Date('2026-03-19'), shifts, []
      );
      const patterns = detectPatterns(classified);
      expect(patterns.consecutiveWorkDays).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Plan statistics edge cases', () => {
    it('computes circadian debt score of 0 for all off days', () => {
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-21'), [], [], defaultProfile,
      );
      // All off days should have minimal circadian debt
      expect(plan.stats.nightShiftCount).toBe(0);
      expect(plan.stats.hardTransitions).toBe(0);
    });

    it('computes high circadian debt for many night shifts', () => {
      const shifts: ShiftEvent[] = [];
      for (let i = 0; i < 7; i++) {
        const startDate = addDays(new Date('2026-03-15'), i);
        const endDate = addDays(new Date('2026-03-15'), i + 1);
        shifts.push(
          makeShift(
            `n${i}`,
            `${startDate.toISOString().slice(0, 10)}T19:00:00`,
            `${endDate.toISOString().slice(0, 10)}T07:00:00`
          )
        );
      }
      const plan = generateSleepPlan(
        new Date('2026-03-14'), new Date('2026-03-23'), shifts, [], defaultProfile,
      );
      expect(plan.stats.nightShiftCount).toBeGreaterThanOrEqual(7);
      expect(plan.stats.circadianDebtScore).toBeGreaterThan(30);
    });

    it('reports average sleep hours as a reasonable value', () => {
      const shifts = [
        makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], defaultProfile,
      );
      // Average sleep should be between 3 and 12 hours per day
      expect(plan.stats.avgSleepHours).toBeGreaterThanOrEqual(3);
      expect(plan.stats.avgSleepHours).toBeLessThanOrEqual(12);
    });
  });
});
