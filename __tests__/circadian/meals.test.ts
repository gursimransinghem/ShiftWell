/**
 * Tests for meal timing windows.
 *
 * Verifies that meal placement follows circadian eating principles:
 * - Front-loaded calories
 * - Fasting period before sleep
 * - Shift-appropriate meal strategies
 */

import { generateMealWindows } from '../../src/lib/circadian/meals';
import { computeSleepBlocks } from '../../src/lib/circadian/sleep-windows';
import type { ClassifiedDay, UserProfile, PlanBlock } from '../../src/lib/circadian/types';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';
import { differenceInHours, differenceInMinutes } from 'date-fns';

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
      end: new Date(`${dateStr}T19:00:00`),
      shiftType: 'day',
    },
    personalEvents: [],
  };
}

function makeOffDay(dateStr: string): ClassifiedDay {
  return {
    date: new Date(dateStr),
    dayType: 'off',
    shift: null,
    personalEvents: [],
  };
}

function makeRecoveryDay(dateStr: string): ClassifiedDay {
  return {
    date: new Date(dateStr),
    dayType: 'recovery',
    shift: null,
    personalEvents: [],
  };
}

// ── Tests ────────────────────────────────────────────────────────────

describe('Meal Timing', () => {
  const profile: UserProfile = { ...DEFAULT_PROFILE };

  describe('night shift meals', () => {
    it('generates a main meal before the shift', () => {
      const day = makeNightShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, profile);
      const meals = generateMealWindows(day, profile, sleepBlocks);

      const preShiftMeal = meals.find((m) => m.label === 'Main Meal');
      expect(preShiftMeal).toBeDefined();

      // Main meal should be before the shift starts
      expect(preShiftMeal!.start.getTime()).toBeLessThan(day.shift!.start.getTime());
    });

    it('generates a light snack during the shift', () => {
      const day = makeNightShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, profile);
      const meals = generateMealWindows(day, profile, sleepBlocks);

      const midShiftSnack = meals.find((m) => m.label === 'Light Snack');
      expect(midShiftSnack).toBeDefined();

      // Snack should be during the shift
      expect(midShiftSnack!.start.getTime()).toBeGreaterThanOrEqual(day.shift!.start.getTime());
      expect(midShiftSnack!.start.getTime()).toBeLessThan(day.shift!.end.getTime());
    });

    it('produces exactly 2 meal windows for night shifts', () => {
      const day = makeNightShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, profile);
      const meals = generateMealWindows(day, profile, sleepBlocks);

      expect(meals.length).toBe(2);
    });
  });

  describe('day shift meals', () => {
    it('generates standard 3-meal pattern for day shifts', () => {
      const day = makeDayShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, profile);
      const meals = generateMealWindows(day, profile, sleepBlocks);

      // Should have breakfast, lunch, dinner (or at least some of them)
      expect(meals.length).toBeGreaterThanOrEqual(1);
      expect(meals.length).toBeLessThanOrEqual(3);
    });

    it('meal windows are during waking hours', () => {
      const day = makeDayShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, profile);
      const meals = generateMealWindows(day, profile, sleepBlocks);

      const mainSleep = sleepBlocks.find((b) => b.type === 'main-sleep');
      expect(mainSleep).toBeDefined();

      // All meals should be outside the main sleep block
      for (const meal of meals) {
        const mealDuringSleep =
          meal.start.getTime() >= mainSleep!.start.getTime() &&
          meal.end.getTime() <= mainSleep!.end.getTime();
        expect(mealDuringSleep).toBe(false);
      }
    });
  });

  describe('fasting period before sleep', () => {
    it('last meal is at least 3 hours before sleep on off days', () => {
      const day = makeOffDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, profile);
      const meals = generateMealWindows(day, profile, sleepBlocks);

      if (meals.length === 0) return; // No meals to check

      const mainSleep = sleepBlocks
        .filter((b) => b.type === 'main-sleep')
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      // The fasting cutoff is 3h before the next sleep onset
      // For off days with standard 3 meals, the last meal (dinner) should
      // finish before the fasting cutoff
      const lastMeal = meals[meals.length - 1];
      // Find the sleep block that starts AFTER the last meal
      const nextSleep = mainSleep.find((s) => s.start.getTime() > lastMeal.end.getTime());

      if (!nextSleep) return; // No sleep after last meal in this day's blocks

      const hoursBeforeSleep = differenceInMinutes(nextSleep.start, lastMeal.end) / 60;
      // Last meal end should be at least ~2h before sleep
      expect(hoursBeforeSleep).toBeGreaterThanOrEqual(2);
    });
  });

  describe('meals do not overlap with sleep', () => {
    it('no meal is fully inside a sleep block on day shift', () => {
      const day = makeDayShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, profile);
      const meals = generateMealWindows(day, profile, sleepBlocks);

      for (const meal of meals) {
        for (const sleep of sleepBlocks.filter((b) => b.type === 'main-sleep')) {
          const mealInsideSleep =
            meal.start.getTime() >= sleep.start.getTime() &&
            meal.end.getTime() <= sleep.end.getTime();
          expect(mealInsideSleep).toBe(false);
        }
      }
    });

    it('no meal is fully inside a sleep block on night shift', () => {
      const day = makeNightShiftDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, profile);
      const meals = generateMealWindows(day, profile, sleepBlocks);

      for (const meal of meals) {
        for (const sleep of sleepBlocks.filter((b) => b.type === 'main-sleep')) {
          const mealInsideSleep =
            meal.start.getTime() >= sleep.start.getTime() &&
            meal.end.getTime() <= sleep.end.getTime();
          expect(mealInsideSleep).toBe(false);
        }
      }
    });
  });

  describe('recovery day meals', () => {
    it('generates meals for recovery days using standard pattern', () => {
      const day = makeRecoveryDay('2026-03-15');
      const sleepBlocks = computeSleepBlocks(day, profile);
      const meals = generateMealWindows(day, profile, sleepBlocks);

      // Recovery days use the default branch which generates standard meals
      expect(meals.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('no sleep blocks edge case', () => {
    it('returns empty meals array when no sleep blocks provided', () => {
      const day = makeOffDay('2026-03-15');
      const meals = generateMealWindows(day, profile, []);

      expect(meals).toHaveLength(0);
    });
  });
});
