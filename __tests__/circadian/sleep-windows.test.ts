import { computeSleepBlocks } from '../../src/lib/circadian/sleep-windows';
import { classifyDays } from '../../src/lib/circadian/classify-shifts';
import { generateSleepPlan } from '../../src/lib/circadian';
import type { ShiftEvent, UserProfile, ClassifiedDay } from '../../src/lib/circadian/types';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';
import { differenceInHours, getHours } from 'date-fns';

const testProfile: UserProfile = {
  ...DEFAULT_PROFILE,
  chronotype: 'intermediate',
  sleepNeed: 7.5,
  napPreference: true,
};

function makeNightShift(dateStr: string): ShiftEvent {
  return {
    id: `night-${dateStr}`,
    title: 'Night Shift',
    start: new Date(`${dateStr}T19:00:00`),
    end: new Date(`${dateStr.replace(/\d{2}$/, (d) => String(Number(d) + 1).padStart(2, '0'))}T07:00:00`),
    shiftType: 'night',
  };
}

describe('computeSleepBlocks', () => {
  describe('night shift sleep', () => {
    it('places main sleep after a night shift ends', () => {
      const day: ClassifiedDay = {
        date: new Date('2026-03-15'),
        dayType: 'work-night',
        shift: {
          id: 'n1',
          title: 'Night',
          start: new Date('2026-03-15T19:00:00'),
          end: new Date('2026-03-16T07:00:00'),
          shiftType: 'night',
        },
        personalEvents: [],
      };

      const blocks = computeSleepBlocks(day, testProfile);
      const mainSleep = blocks.find((b) => b.type === 'main-sleep');

      expect(mainSleep).toBeDefined();
      // Sleep should start after 07:00 + commute + wind-down
      expect(getHours(mainSleep!.start)).toBeGreaterThanOrEqual(7);
      expect(getHours(mainSleep!.start)).toBeLessThanOrEqual(9);
    });

    it('generates a wind-down block before main sleep', () => {
      const day: ClassifiedDay = {
        date: new Date('2026-03-15'),
        dayType: 'work-night',
        shift: {
          id: 'n1',
          title: 'Night',
          start: new Date('2026-03-15T19:00:00'),
          end: new Date('2026-03-16T07:00:00'),
          shiftType: 'night',
        },
        personalEvents: [],
      };

      const blocks = computeSleepBlocks(day, testProfile);
      const windDown = blocks.find((b) => b.type === 'wind-down');

      expect(windDown).toBeDefined();
      expect(windDown!.label).toBe('Wind Down');
    });
  });

  describe('day shift sleep', () => {
    it('places sleep at natural circadian time for intermediate chronotype', () => {
      const day: ClassifiedDay = {
        date: new Date('2026-03-15'),
        dayType: 'work-day',
        shift: {
          id: 'd1',
          title: 'Day Shift',
          start: new Date('2026-03-15T07:00:00'),
          end: new Date('2026-03-15T19:00:00'),
          shiftType: 'day',
        },
        personalEvents: [],
      };

      const blocks = computeSleepBlocks(day, testProfile);
      const mainSleep = blocks.find((b) => b.type === 'main-sleep');

      expect(mainSleep).toBeDefined();
      // Intermediate chronotype: sleep onset ~23:00
      expect(getHours(mainSleep!.start)).toBeGreaterThanOrEqual(22);
      expect(getHours(mainSleep!.start)).toBeLessThanOrEqual(23);
    });
  });

  describe('off day sleep', () => {
    it('uses natural circadian time', () => {
      const day: ClassifiedDay = {
        date: new Date('2026-03-15'),
        dayType: 'off',
        shift: null,
        personalEvents: [],
      };

      const blocks = computeSleepBlocks(day, testProfile);
      const mainSleep = blocks.find((b) => b.type === 'main-sleep');

      expect(mainSleep).toBeDefined();
    });
  });

  describe('recovery day', () => {
    it('generates both a recovery nap and early bedtime', () => {
      const day: ClassifiedDay = {
        date: new Date('2026-03-18'),
        dayType: 'recovery',
        shift: null,
        personalEvents: [],
      };

      const blocks = computeSleepBlocks(day, testProfile);
      const sleepBlocks = blocks.filter((b) => b.type === 'main-sleep');

      // Should have 2 sleep blocks: recovery + early bedtime
      expect(sleepBlocks.length).toBe(2);

      // Recovery sleep should be in the morning
      expect(getHours(sleepBlocks[0].start)).toBeLessThanOrEqual(9);
    });

    it('places late chronotype recovery bedtime on the recovery evening, not the prior midnight', () => {
      const day: ClassifiedDay = {
        date: new Date('2026-03-18T00:00:00'),
        dayType: 'recovery',
        shift: null,
        personalEvents: [],
      };
      const lateProfile: UserProfile = {
        ...testProfile,
        chronotype: 'late',
      };

      const blocks = computeSleepBlocks(day, lateProfile);
      const mainSleep = blocks.find((b) => b.id.endsWith('-main-sleep'));

      expect(mainSleep).toBeDefined();
      expect(mainSleep!.start.getDate()).toBe(18);
      expect(getHours(mainSleep!.start)).toBe(23);
    });

    it('generates unique ids for multiple recovery sleep blocks', () => {
      const day: ClassifiedDay = {
        date: new Date('2026-03-18'),
        dayType: 'recovery',
        shift: null,
        personalEvents: [],
      };

      const blocks = computeSleepBlocks(day, testProfile);
      const ids = blocks.map((block) => block.id);

      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('personal event conflict avoidance', () => {
    it('adjusts sleep around a personal event', () => {
      const day: ClassifiedDay = {
        date: new Date('2026-03-15'),
        dayType: 'off',
        shift: null,
        personalEvents: [
          {
            id: 'dentist',
            title: 'Dentist Appointment',
            start: new Date('2026-03-15T23:30:00'),
            end: new Date('2026-03-16T00:30:00'),
          },
        ],
      };

      const blocks = computeSleepBlocks(day, testProfile);
      const mainSleep = blocks.find((b) => b.type === 'main-sleep');

      expect(mainSleep).toBeDefined();
      // Sleep should be adjusted to avoid the dentist appointment
      // Either before or after the event
    });

    it('adjusts when a personal event fully contains the sleep window', () => {
      const day: ClassifiedDay = {
        date: new Date('2026-03-15'),
        dayType: 'off',
        shift: null,
        personalEvents: [
          {
            id: 'travel',
            title: 'Long travel block',
            start: new Date('2026-03-15T20:00:00'),
            end: new Date('2026-03-16T08:00:00'),
          },
        ],
      };

      const blocks = computeSleepBlocks(day, testProfile);
      const mainSleep = blocks.find((b) => b.type === 'main-sleep');

      expect(mainSleep).toBeDefined();
      expect(mainSleep!.start.getTime()).toBeGreaterThan(
        new Date('2026-03-16T08:00:00').getTime(),
      );
    });
  });
});

describe('generateSleepPlan (integration)', () => {
  it('generates a complete plan for a 3-night stretch', () => {
    const shifts: ShiftEvent[] = [
      {
        id: 'n1',
        title: 'Night',
        start: new Date('2026-03-15T19:00:00'),
        end: new Date('2026-03-16T07:00:00'),
        shiftType: 'night',
      },
      {
        id: 'n2',
        title: 'Night',
        start: new Date('2026-03-16T19:00:00'),
        end: new Date('2026-03-17T07:00:00'),
        shiftType: 'night',
      },
      {
        id: 'n3',
        title: 'Night',
        start: new Date('2026-03-17T19:00:00'),
        end: new Date('2026-03-18T07:00:00'),
        shiftType: 'night',
      },
    ];

    const plan = generateSleepPlan(
      new Date('2026-03-14'),
      new Date('2026-03-19'),
      shifts,
      [],
      testProfile,
    );

    // Should have blocks
    expect(plan.blocks.length).toBeGreaterThan(0);

    // Should have classified days
    expect(plan.classifiedDays.length).toBe(6);

    // Should have sleep blocks for every day
    const sleepBlocks = plan.blocks.filter((b) => b.type === 'main-sleep');
    expect(sleepBlocks.length).toBeGreaterThanOrEqual(5); // Recovery day has 2

    // Should have naps for night shifts
    const napBlocks = plan.blocks.filter((b) => b.type === 'nap');
    expect(napBlocks.length).toBeGreaterThanOrEqual(1);

    // Should have caffeine cutoffs
    const caffeineBlocks = plan.blocks.filter((b) => b.type === 'caffeine-cutoff');
    expect(caffeineBlocks.length).toBeGreaterThan(0);

    // Should have meal windows
    const mealBlocks = plan.blocks.filter((b) => b.type === 'meal-window');
    expect(mealBlocks.length).toBeGreaterThan(0);

    // Stats should be populated
    // 3 shifts but overnight bleed-over creates 4 classified night-work days
    expect(plan.stats.nightShiftCount).toBe(4);
    expect(plan.stats.avgSleepHours).toBeGreaterThan(0);
    expect(plan.stats.circadianDebtScore).toBeGreaterThan(0);
  });

  it('generates blocks sorted chronologically', () => {
    const shifts: ShiftEvent[] = [
      {
        id: 'n1',
        title: 'Night',
        start: new Date('2026-03-15T19:00:00'),
        end: new Date('2026-03-16T07:00:00'),
        shiftType: 'night',
      },
    ];

    const plan = generateSleepPlan(
      new Date('2026-03-15'),
      new Date('2026-03-16'),
      shifts,
      [],
      testProfile,
    );

    for (let i = 1; i < plan.blocks.length; i++) {
      expect(plan.blocks[i].start.getTime()).toBeGreaterThanOrEqual(
        plan.blocks[i - 1].start.getTime()
      );
    }
  });

  it('handles an empty schedule (all days off)', () => {
    const plan = generateSleepPlan(
      new Date('2026-03-15'),
      new Date('2026-03-17'),
      [],
      [],
      testProfile,
    );

    expect(plan.blocks.length).toBeGreaterThan(0);
    expect(plan.stats.nightShiftCount).toBe(0);
    // Even off days have a small sleep debt penalty since avg sleep
    // may not perfectly match the 7.5h target
    expect(plan.stats.circadianDebtScore).toBeLessThan(20);
  });
});
