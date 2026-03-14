/**
 * Meal timing module.
 *
 * Meal timing is critical for shift workers because the circadian system
 * regulates metabolic processes. Eating during the biological night
 * (when melatonin is high) impairs glucose metabolism and increases
 * long-term cardiovascular and metabolic disease risk.
 *
 * Key principles:
 * 1. Eat within the first 10-12 hours of waking (time-restricted eating)
 * 2. Front-load calories: largest meal early, lighter meals later
 * 3. Fast for 3+ hours before sleep (reduces reflux, improves sleep quality)
 * 4. Avoid eating during the circadian nadir (02:00-06:00 for day-oriented people)
 *
 * References:
 * - Manoogian et al. (2022) — Time-restricted eating for shift workers
 * - Chellappa et al. (2021) — Daytime eating prevents mood vulnerability in night work
 * - Grant et al. (2017) — Timing of food intake during simulated night shift
 * - Sato et al. (2014) — Peripheral clocks and meal timing
 */

import { addHours, addMinutes, isBefore, isAfter, setHours, setMinutes } from 'date-fns';
import type { ClassifiedDay, UserProfile, PlanBlock } from './types';

/** Set a specific time on a date */
function setTime(date: Date, hours: number): Date {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return setMinutes(setHours(date, h), m);
}

/**
 * Generate meal timing windows for a classified day.
 *
 * Strategy varies by shift type:
 * - Day shifts: Standard 3-meal pattern aligned with waking hours
 * - Night shifts: Pre-shift meal + small snack during shift, NO large meal during nadir
 * - Evening shifts: Main meal before shift, light snack after
 */
export function generateMealWindows(
  day: ClassifiedDay,
  profile: UserProfile,
  sleepBlocks: PlanBlock[],
): PlanBlock[] {
  const meals: PlanBlock[] = [];
  const date = day.date;
  const dayId = date.toISOString().slice(0, 10);

  // Find the main sleep block to calculate waking period
  const mainSleep = sleepBlocks
    .filter((b) => b.type === 'main-sleep')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (mainSleep.length === 0) return meals;

  const wakeTime = mainSleep[0].end;
  const nextSleepStart = mainSleep.length > 1
    ? mainSleep[1].start
    : addHours(wakeTime, 16); // Assume 16h waking if no next sleep

  // Fasting cutoff: 3 hours before sleep
  const fastingStart = addHours(nextSleepStart, -3);

  switch (day.dayType) {
    case 'work-night': {
      // Night shift meal strategy:
      // 1. Main meal BEFORE the shift (while it's still "daytime" for your body)
      // 2. Small protein-rich snack mid-shift (avoid carb-heavy meals at night)
      // 3. Light snack after shift only if genuinely hungry (before sleep)
      //
      // Key insight: Chellappa et al. (2021) showed eating only during
      // biological daytime (even while working nights) prevents the mood
      // vulnerability typically seen in night workers.

      const shift = day.shift!;

      // Pre-shift main meal: 2-3 hours before shift
      const preShiftMeal = addHours(shift.start, -2.5);
      meals.push({
        id: `${dayId}-meal-pre-shift`,
        type: 'meal-window',
        start: preShiftMeal,
        end: addMinutes(preShiftMeal, 45),
        label: 'Main Meal',
        description: 'Eat your largest meal now, before the night shift. Protein + complex carbs. Your body metabolizes food best while melatonin is still low.',
        priority: 2,
      });

      // Mid-shift snack: halfway through the shift
      const shiftMidpoint = addMinutes(
        shift.start,
        (shift.end.getTime() - shift.start.getTime()) / 2 / 60000
      );
      meals.push({
        id: `${dayId}-meal-mid-shift`,
        type: 'meal-window',
        start: shiftMidpoint,
        end: addMinutes(shiftMidpoint, 20),
        label: 'Light Snack',
        description: 'Small, protein-rich snack only. Avoid heavy carbs — your gut is in "sleep mode" and large meals worsen fatigue and GI symptoms.',
        priority: 3,
      });
      break;
    }

    case 'work-evening': {
      // Evening shift: main meal at lunch, light snack before/during shift
      const mealOne = addHours(wakeTime, 1.5); // Breakfast/brunch
      meals.push({
        id: `${dayId}-meal-1`,
        type: 'meal-window',
        start: mealOne,
        end: addMinutes(mealOne, 30),
        label: 'Breakfast',
        description: 'First meal 1-2 hours after waking. Include protein to sustain energy.',
        priority: 3,
      });

      // Main meal before shift
      const shift = day.shift!;
      const preShiftMeal = addHours(shift.start, -1.5);
      meals.push({
        id: `${dayId}-meal-2`,
        type: 'meal-window',
        start: preShiftMeal,
        end: addMinutes(preShiftMeal, 45),
        label: 'Main Meal',
        description: 'Your largest meal of the day. Eat before the shift so you don\'t rely on vending machines at work.',
        priority: 2,
      });
      break;
    }

    case 'work-day':
    case 'off':
    case 'recovery':
    default: {
      // Standard 3-meal pattern within first 10-12 hours of waking
      // Breakfast: 1-2h after wake
      const breakfast = addHours(wakeTime, 1.5);
      if (isBefore(breakfast, fastingStart)) {
        meals.push({
          id: `${dayId}-meal-breakfast`,
          type: 'meal-window',
          start: breakfast,
          end: addMinutes(breakfast, 30),
          label: 'Breakfast',
          description: 'First meal 1-2 hours after waking. Your metabolic system is most efficient in the morning.',
          priority: 3,
        });
      }

      // Lunch: 5-6h after wake
      const lunch = addHours(wakeTime, 5.5);
      if (isBefore(lunch, fastingStart)) {
        meals.push({
          id: `${dayId}-meal-lunch`,
          type: 'meal-window',
          start: lunch,
          end: addMinutes(lunch, 45),
          label: 'Lunch',
          description: 'Main midday meal. This should be your largest meal if possible — front-loading calories improves metabolic health.',
          priority: 3,
        });
      }

      // Dinner: 9-10h after wake (must be 3h+ before sleep)
      const dinner = addHours(wakeTime, 9.5);
      if (isBefore(dinner, fastingStart)) {
        meals.push({
          id: `${dayId}-meal-dinner`,
          type: 'meal-window',
          start: dinner,
          end: addMinutes(dinner, 45),
          label: 'Dinner',
          description: 'Last meal of the day. Keep it lighter than lunch. Finish 3+ hours before bed to improve sleep quality.',
          priority: 3,
        });
      }
      break;
    }
  }

  return meals;
}
