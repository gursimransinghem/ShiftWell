/**
 * ShiftWell Circadian Algorithm — Public API
 *
 * This module is the single entry point for generating a complete sleep plan
 * from a list of shifts, personal events, and a user profile.
 *
 * The algorithm pipeline:
 * 1. Classify each day (shift type, transitions, off days)
 * 2. Compute main sleep windows for each day
 * 3. Place strategic naps in gaps
 * 4. Compute caffeine cutoffs relative to sleep/nap times
 * 5. Generate meal timing windows
 * 6. Generate light exposure/avoidance protocols
 * 7. Aggregate stats
 *
 * All modules are pure functions with no side effects.
 * The entire algorithm runs locally — no network calls, no LLM, no API costs.
 */

import { differenceInHours } from 'date-fns';
import { classifyDays, detectPatterns } from './classify-shifts';
import { computeSleepBlocks } from './sleep-windows';
import { generateNaps } from './nap-engine';
import { computeCaffeineCutoff, computeCaffeineWindow } from './caffeine';
import { generateMealWindows } from './meals';
import { generateLightProtocol } from './light-protocol';
import type {
  ShiftEvent,
  PersonalEvent,
  UserProfile,
  SleepPlan,
  PlanBlock,
  PlanStats,
} from './types';
import { DEFAULT_PROFILE } from './types';

export type {
  ShiftEvent,
  PersonalEvent,
  UserProfile,
  SleepPlan,
  PlanBlock,
  PlanStats,
  Chronotype,
  ShiftType,
  DayType,
  SleepBlockType,
  ClassifiedDay,
} from './types';

export { DEFAULT_PROFILE, CHRONOTYPE_OFFSETS } from './types';
export { classifyShiftType, classifyDays, detectPatterns } from './classify-shifts';
export { computeSleepBlocks } from './sleep-windows';
export { generateNaps } from './nap-engine';
export { computeCaffeineCutoff, computeCaffeineWindow } from './caffeine';
export { generateMealWindows } from './meals';
export { generateLightProtocol } from './light-protocol';

/**
 * Generate a complete sleep plan for a date range.
 *
 * This is the main function you call from the UI layer.
 *
 * @param startDate - Start of the planning period
 * @param endDate - End of the planning period
 * @param shifts - Shift events from calendar import or manual entry
 * @param personalEvents - Non-shift calendar events (optional)
 * @param profile - User profile from onboarding (optional, uses defaults)
 * @returns Complete SleepPlan with all blocks and stats
 */
export function generateSleepPlan(
  startDate: Date,
  endDate: Date,
  shifts: ShiftEvent[],
  personalEvents: PersonalEvent[] = [],
  profile: UserProfile = DEFAULT_PROFILE,
): SleepPlan {
  // Step 1: Classify each day
  const classifiedDays = classifyDays(startDate, endDate, shifts, personalEvents);

  // Step 2-6: Generate all blocks for each day
  const allBlocks: PlanBlock[] = [];

  for (const day of classifiedDays) {
    // Step 2: Main sleep windows
    const sleepBlocks = computeSleepBlocks(day, profile);
    allBlocks.push(...sleepBlocks);

    // Step 3: Strategic naps
    const napBlocks = generateNaps(day, profile, sleepBlocks);
    allBlocks.push(...napBlocks);

    // Combine sleep + naps for downstream calculations
    const allSleepBlocks = [...sleepBlocks, ...napBlocks];

    // Step 4: Caffeine cutoff
    const caffeineCutoff = computeCaffeineCutoff(day, profile, allSleepBlocks);
    if (caffeineCutoff) allBlocks.push(caffeineCutoff);

    const caffeineWindow = computeCaffeineWindow(day, profile, allSleepBlocks);
    if (caffeineWindow) allBlocks.push(caffeineWindow);

    // Step 5: Meal timing
    const mealBlocks = generateMealWindows(day, profile, sleepBlocks);
    allBlocks.push(...mealBlocks);

    // Step 6: Light protocol
    const lightBlocks = generateLightProtocol(day, profile, sleepBlocks);
    allBlocks.push(...lightBlocks);
  }

  // Step 7: Compute stats
  const stats = computeStats(classifiedDays, allBlocks);

  // Sort all blocks chronologically
  allBlocks.sort((a, b) => a.start.getTime() - b.start.getTime());

  return {
    blocks: allBlocks,
    startDate,
    endDate,
    classifiedDays,
    stats,
  };
}

/**
 * Compute summary statistics for the plan.
 */
function computeStats(
  classifiedDays: ReturnType<typeof classifyDays>,
  blocks: PlanBlock[],
): PlanStats {
  const sleepBlocks = blocks.filter(
    (b) => b.type === 'main-sleep' || b.type === 'nap'
  );

  const totalSleepHours = sleepBlocks.reduce(
    (sum, b) => sum + differenceInHours(b.end, b.start),
    0
  );

  const totalDays = classifiedDays.length || 1;
  const avgSleepHours = totalSleepHours / totalDays;

  const nightShiftCount = classifiedDays.filter(
    (d) => d.dayType === 'work-night'
  ).length;

  const patterns = detectPatterns(classifiedDays);

  // Circadian debt score: 0 = perfect alignment, 100 = severe disruption
  // Heuristic based on number of night shifts, hard transitions, and consecutive work days
  const nightPenalty = nightShiftCount * 8;
  const transitionPenalty = patterns.hardTransitions * 12;
  const consecutivePenalty = Math.max(0, patterns.consecutiveWorkDays - 3) * 5;
  const sleepDebtPenalty = Math.max(0, (7.5 - avgSleepHours) * 10);
  const circadianDebtScore = Math.min(
    100,
    nightPenalty + transitionPenalty + consecutivePenalty + sleepDebtPenalty
  );

  return {
    avgSleepHours: Math.round(avgSleepHours * 10) / 10,
    nightShiftCount,
    hardTransitions: patterns.hardTransitions,
    circadianDebtScore: Math.round(circadianDebtScore),
  };
}
