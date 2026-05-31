/**
 * Tests for the nap placement engine.
 *
 * Verifies strategic nap placement for different shift types,
 * conflict avoidance, and user preference handling.
 */

import { generateNaps, NAP_DURATIONS } from '../../src/lib/circadian/nap-engine';
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

function makeEveningShiftDay(dateStr: string): ClassifiedDay {
  return {
    date: new Date(dateStr),
    dayType: 'work-evening',
    shift: {
      id: `evening-${dateStr}`,
      title: 'Evening Shift',
      start: new Date(`${dateStr}T14:00:00`),
      end: new Date(`${dateStr}T22:00:00`),
      shiftType: 'evening',
    },
    personalEvents: [],
  };
}

function makeExtendedShiftDay(dateStr: string): ClassifiedDay {
  return {
    date: new Date(dateStr),
    dayType: 'work-extended',
    shift: {
      id: `extended-${dateStr}`,
      title: 'Extended Shift',
      start: new Date(`${dateStr}T07:00:00`),
      end: new Date(`${dateStr.replace(/(\d{2})$/, (d) => String(Number(d) + 1).padStart(2, '0'))}T07:00:00`),
      shiftType: 'extended',
    },
    personalEvents: [],
  };
}

function makeShortNightShiftDay(dateStr: string): ClassifiedDay {
  return {
    date: new Date(dateStr),
    dayType: 'work-night',
    shift: {
      id: `short-night-${dateStr}`,
      title: 'Short Night Shift',
      start: new Date(`${dateStr}T19:00:00`),
      end: new Date(`${dateStr}T23:30:00`),
      shiftType: 'night',
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
    // B7: a work-night day now also produces an ON-shift nap (id `*-on-shift-nap`) that
    // sits INSIDE the shift by design. The pre-shift nap still ends before shift start;
    // the on-shift nap is constrained to fall fully within the shift bounds.
    it('the pre-shift nap ends before the shift; the on-shift nap stays inside it', () => {
      const day = makeNightShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, napProfile);
      const naps = generateNaps(day, napProfile, sleepBlocks);

      const preShiftNap = naps.find((n) => n.id.endsWith('-pre-shift-nap'));
      expect(preShiftNap).toBeDefined();
      // Pre-shift nap must finish before the shift starts.
      expect(preShiftNap!.end.getTime()).toBeLessThanOrEqual(day.shift!.start.getTime());

      const onShiftNap = naps.find((n) => n.id.endsWith('-on-shift-nap'));
      expect(onShiftNap).toBeDefined();
      // The on-shift nap is deliberately within the shift — both ends inside the shift.
      expect(onShiftNap!.start.getTime()).toBeGreaterThanOrEqual(day.shift!.start.getTime());
      expect(onShiftNap!.end.getTime()).toBeLessThanOrEqual(day.shift!.end.getTime());
    });

    it('a work-night day produces a 25-min on-shift nap labelled "On-Shift Nap"', () => {
      const day = makeNightShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, napProfile);
      const naps = generateNaps(day, napProfile, sleepBlocks);

      const onShiftNap = naps.find((n) => n.id.endsWith('-on-shift-nap'));
      expect(onShiftNap).toBeDefined();
      expect(onShiftNap!.label).toBe('On-Shift Nap');
      expect(differenceInMinutes(onShiftNap!.end, onShiftNap!.start)).toBe(25);
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

  describe('flexible nap durations', () => {
    it("napPreference='power' produces a 20-min nap for night shifts", () => {
      const day = makeNightShiftDay('2026-03-15');
      const powerProfile: UserProfile = { ...DEFAULT_PROFILE, napPreference: 'power' as unknown as boolean };
      const sleepBlocks = computeSleepBlocks(day, powerProfile);
      const naps = generateNaps(day, powerProfile, sleepBlocks);

      const preShiftNap = naps.find((n) => n.label === 'Pre-Shift Nap');
      expect(preShiftNap).toBeDefined();

      const duration = differenceInMinutes(preShiftNap!.end, preShiftNap!.start);
      expect(duration).toBe(NAP_DURATIONS.power);
    });

    it("napPreference='short' produces a 30-min nap for night shifts", () => {
      const day = makeNightShiftDay('2026-03-15');
      const shortProfile: UserProfile = { ...DEFAULT_PROFILE, napPreference: 'short' as unknown as boolean };
      const sleepBlocks = computeSleepBlocks(day, shortProfile);
      const naps = generateNaps(day, shortProfile, sleepBlocks);

      const preShiftNap = naps.find((n) => n.label === 'Pre-Shift Nap');
      expect(preShiftNap).toBeDefined();

      const duration = differenceInMinutes(preShiftNap!.end, preShiftNap!.start);
      expect(duration).toBe(NAP_DURATIONS.short);
    });

    it("napPreference='full' produces a 90-min nap for night shifts", () => {
      const day = makeNightShiftDay('2026-03-15');
      const fullProfile: UserProfile = { ...DEFAULT_PROFILE, napPreference: 'full' as unknown as boolean };
      const sleepBlocks = computeSleepBlocks(day, fullProfile);
      const naps = generateNaps(day, fullProfile, sleepBlocks);

      const preShiftNap = naps.find((n) => n.label === 'Pre-Shift Nap');
      expect(preShiftNap).toBeDefined();

      const duration = differenceInMinutes(preShiftNap!.end, preShiftNap!.start);
      expect(duration).toBe(NAP_DURATIONS.full);
    });

    it("napPreference='full' produces a 90-min transition nap", () => {
      const day = makeTransitionDay('2026-03-15');
      const fullProfile: UserProfile = { ...DEFAULT_PROFILE, napPreference: 'full' as unknown as boolean };
      const sleepBlocks = computeSleepBlocks(day, fullProfile);
      const naps = generateNaps(day, fullProfile, sleepBlocks);

      const transitionNap = naps.find((n) => n.label === 'Transition Nap');
      expect(transitionNap).toBeDefined();

      const duration = differenceInMinutes(transitionNap!.end, transitionNap!.start);
      expect(duration).toBe(NAP_DURATIONS.full);
    });

    it("napPreference='power' produces a 20-min transition nap", () => {
      const day = makeTransitionDay('2026-03-15');
      const powerProfile: UserProfile = { ...DEFAULT_PROFILE, napPreference: 'power' as unknown as boolean };
      const sleepBlocks = computeSleepBlocks(day, powerProfile);
      const naps = generateNaps(day, powerProfile, sleepBlocks);

      const transitionNap = naps.find((n) => n.label === 'Transition Nap');
      expect(transitionNap).toBeDefined();

      const duration = differenceInMinutes(transitionNap!.end, transitionNap!.start);
      expect(duration).toBe(NAP_DURATIONS.power);
    });

    it('NAP_DURATIONS constants have correct values (power=20, short=30, full=90)', () => {
      expect(NAP_DURATIONS.power).toBe(20);
      expect(NAP_DURATIONS.short).toBe(30);
      expect(NAP_DURATIONS.full).toBe(90);
    });
  });

  describe('audited shift-type branches', () => {
    it('places a pre-shift Power Nap for work-evening shifts', () => {
      const day = makeEveningShiftDay('2026-03-15');
      const naps = generateNaps(day, napProfile, []);
      const powerNap = naps.find((n) => n.label === 'Power Nap');

      expect(powerNap).toBeDefined();
      expect(powerNap!.type).toBe('nap');
      expect(differenceInMinutes(powerNap!.end, powerNap!.start)).toBe(25);
    });

    it('work-evening pre-shift nap ends 45 minutes before leave time', () => {
      const day = makeEveningShiftDay('2026-03-15');
      const naps = generateNaps(day, napProfile, []);
      const powerNap = naps.find((n) => n.label === 'Power Nap');
      const leaveTime = new Date('2026-03-15T13:30:00');

      expect(powerNap).toBeDefined();
      expect(differenceInMinutes(leaveTime, powerNap!.end)).toBe(45);
    });

    it('places a Sleep Banking Nap for work-extended shifts', () => {
      const day = makeExtendedShiftDay('2026-03-15');
      const naps = generateNaps(day, napProfile, []);
      const bankingNap = naps.find((n) => n.label === 'Sleep Banking Nap');

      expect(bankingNap).toBeDefined();
      expect(bankingNap!.type).toBe('nap');
      expect(differenceInMinutes(bankingNap!.end, bankingNap!.start)).toBe(90);
    });

    it("forces a 20-minute power pre-shift nap when a night shift starts within 3 hours", () => {
      const day = {
        ...makeNightShiftDay('2026-03-15'),
        date: new Date('2026-03-15T17:00:00'),
      };
      const fullProfile: UserProfile = { ...DEFAULT_PROFILE, napPreference: 'full' as unknown as boolean };
      const naps = generateNaps(day, fullProfile, []);
      const preShiftNap = naps.find((n) => n.label === 'Pre-Shift Nap');

      expect(preShiftNap).toBeDefined();
      expect(differenceInMinutes(preShiftNap!.end, preShiftNap!.start)).toBe(NAP_DURATIONS.power);
    });

    it('does not place an on-shift nap when the night shift is shorter than 6 hours', () => {
      const day = makeShortNightShiftDay('2026-03-15');
      const naps = generateNaps(day, napProfile, []);

      expect(naps.some((n) => n.id.endsWith('-on-shift-nap'))).toBe(false);
      expect(naps.some((n) => n.id.endsWith('-pre-shift-nap'))).toBe(true);
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
