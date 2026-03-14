/**
 * Tests for the nap placement engine.
 *
 * Verifies strategic nap placement for different shift types,
 * conflict avoidance, and user preference handling.
 */

import { generateNaps } from '../../src/lib/circadian/nap-engine';
import { computeSleepBlocks } from '../../src/lib/circadian/sleep-windows';
import type { ClassifiedDay, UserProfile, PlanBlock } from '../../src/lib/circadian/types';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';
import { differenceInMinutes } from 'date-fns';

// ── Helpers ──────────────────────────────────────────────────────────

function makeNightShiftDay(dateStr: string): ClassifiedDay {
  return {
    date: new Date(dateStr),
    dayType: 'work-night',
    shift: {
      id: `night-${dateStr}`,
      title: 'Night Shift',
      start: new Date(`${dateStr}T19:00:00`),
      end: new Date(`${dateStr.replace(/(\d{2})$/, (d) => String(Number(d) + 1).padStart(2, '0'))}T07:00:00`),
      shiftType: 'night',
    },
    personalEvents: [],
  };
}

function makeDayShiftDay(dateStr: string): ClassifiedDay {
  return {
    date: new Date(dateStr),
    dayType: 'work-day',
    shift: {
      id: `day-${dateStr}`,
      title: 'Day Shift',
      start: new Date(`${dateStr}T07:00:00`),
      end: new Date(`${dateStr}T15:00:00`),
      shiftType: 'day',
    },
    personalEvents: [],
  };
}

function makeTransitionDay(dateStr: string): ClassifiedDay {
  return {
    date: new Date(dateStr),
    dayType: 'transition-to-nights',
    shift: null,
    personalEvents: [],
  };
}

function hasOverlap(a: PlanBlock, b: PlanBlock): boolean {
  return a.start.getTime() < b.end.getTime() && a.end.getTime() > b.start.getTime();
}

const napProfile: UserProfile = { ...DEFAULT_PROFILE, napPreference: true };
const noNapProfile: UserProfile = { ...DEFAULT_PROFILE, napPreference: false };

// ── Tests ────────────────────────────────────────────────────────────

describe('Nap Engine', () => {
  describe('night shift naps', () => {
    it('places a pre-shift prophylactic nap of 90 minutes for night shifts', () => {
      const day = makeNightShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, napProfile);
      const naps = generateNaps(day, napProfile, sleepBlocks);

      expect(naps.length).toBeGreaterThanOrEqual(1);
      const preShiftNap = naps.find((n) => n.label === 'Pre-Shift Nap');
      expect(preShiftNap).toBeDefined();

      // Should be 90 minutes
      const duration = differenceInMinutes(preShiftNap!.end, preShiftNap!.start);
      expect(duration).toBe(90);
    });

    it('places pre-shift nap in the afternoon/evening before the night shift', () => {
      const day = makeNightShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, napProfile);
      const naps = generateNaps(day, napProfile, sleepBlocks);
      const preShiftNap = naps.find((n) => n.label === 'Pre-Shift Nap');

      expect(preShiftNap).toBeDefined();
      // Nap should end before shift start (with buffer for commute + wake)
      expect(preShiftNap!.end.getTime()).toBeLessThan(day.shift!.start.getTime());
    });
  });

  describe('day shift naps', () => {
    it('places a power nap of 25 minutes for day shifts ending before 3pm', () => {
      const day = makeDayShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, napProfile);
      const naps = generateNaps(day, napProfile, sleepBlocks);

      // Day shift ending at 15:00 qualifies for a post-lunch nap
      const powerNap = naps.find((n) => n.label.includes('Power Nap'));
      expect(powerNap).toBeDefined();

      const duration = differenceInMinutes(powerNap!.end, powerNap!.start);
      expect(duration).toBe(25);
    });

    it('places the day-shift power nap around 2 PM (post-lunch dip)', () => {
      const day = makeDayShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, napProfile);
      const naps = generateNaps(day, napProfile, sleepBlocks);
      const powerNap = naps.find((n) => n.label.includes('Power Nap'));

      expect(powerNap).toBeDefined();
      // Should be around 14:00
      expect(powerNap!.start.getHours()).toBe(14);
    });
  });

  describe('nap preference', () => {
    it('returns no naps when user has napPreference: false', () => {
      const day = makeNightShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, noNapProfile);
      const naps = generateNaps(day, noNapProfile, sleepBlocks);

      expect(naps).toHaveLength(0);
    });

    it('returns naps when user has napPreference: true', () => {
      const day = makeNightShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, napProfile);
      const naps = generateNaps(day, napProfile, sleepBlocks);

      expect(naps.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('conflict avoidance', () => {
    it('nap does not overlap with the shift', () => {
      const day = makeNightShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, napProfile);
      const naps = generateNaps(day, napProfile, sleepBlocks);

      for (const nap of naps) {
        expect(nap.end.getTime()).toBeLessThanOrEqual(day.shift!.start.getTime());
      }
    });

    it('nap does not overlap with sleep blocks', () => {
      const day = makeNightShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, napProfile);
      const naps = generateNaps(day, napProfile, sleepBlocks);

      for (const nap of naps) {
        for (const sleep of sleepBlocks) {
          expect(hasOverlap(nap, sleep)).toBe(false);
        }
      }
    });
  });

  describe('transition nap', () => {
    it('places a 90-minute transition nap at 3 PM on transition-to-nights day', () => {
      const day = makeTransitionDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, napProfile);
      const naps = generateNaps(day, napProfile, sleepBlocks);

      const transitionNap = naps.find((n) => n.label === 'Transition Nap');
      expect(transitionNap).toBeDefined();

      const duration = differenceInMinutes(transitionNap!.end, transitionNap!.start);
      expect(duration).toBe(90);

      // Should start at 15:00
      expect(transitionNap!.start.getHours()).toBe(15);
    });

    it('transition nap does not overlap with sleep blocks', () => {
      const day = makeTransitionDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, napProfile);
      const naps = generateNaps(day, napProfile, sleepBlocks);

      for (const nap of naps) {
        for (const sleep of sleepBlocks) {
          expect(hasOverlap(nap, sleep)).toBe(false);
        }
      }
    });
  });

  describe('off and recovery days', () => {
    it('does not generate naps for off days', () => {
      const day: ClassifiedDay = {
        date: new Date('2026-03-15'),
        dayType: 'off',
        shift: null,
        personalEvents: [],
      };
      const sleepBlocks = computeSleepBlocks(day, napProfile);
      const naps = generateNaps(day, napProfile, sleepBlocks);
      expect(naps).toHaveLength(0);
    });

    it('does not generate naps for recovery days', () => {
      const day: ClassifiedDay = {
        date: new Date('2026-03-15'),
        dayType: 'recovery',
        shift: null,
        personalEvents: [],
      };
      const sleepBlocks = computeSleepBlocks(day, napProfile);
      const naps = generateNaps(day, napProfile, sleepBlocks);
      expect(naps).toHaveLength(0);
    });
  });
});
