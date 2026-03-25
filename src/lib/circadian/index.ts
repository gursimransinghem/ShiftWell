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

// ─── Borbely Two-Process Energy Model ────────────────────────────────────────
export {
  // Core math functions (exported for testing + ULOS interop)
  circadianSignal,
  sleepPressure,
  recoveryModifier,
  caffeineEffect,
  calculateAcrophase,
  normalizeTo100,
  getEnergyLabel,
  // Main prediction functions
  predictEnergy,
  getEnergyWindows,
} from './energy-model';

export type {
  EnergyLabel,
  EnergyPrediction,
  EnergyCurve,
  CaffeineEntry,
  EnergyModelInput,
} from './energy-types';

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

  // Step 8: Resolve overlapping sleep blocks across day boundaries
  // Each day's planner runs independently, so adjacent days can produce
  // overlapping main-sleep blocks (e.g., day→night transition, late chronotype).
  const resolvedBlocks = resolveOverlaps(allBlocks);

  // Sort all blocks chronologically
  resolvedBlocks.sort((a, b) => a.start.getTime() - b.start.getTime());

  return {
    blocks: resolvedBlocks,
    startDate,
    endDate,
    classifiedDays,
    stats,
  };
}

/**
 * Resolve overlapping blocks produced by independent per-day planners.
 *
 * Strategy:
 * 1. Deduplicate exact duplicates (same type + start + end).
 * 2. For overlapping main-sleep blocks, keep the one with higher priority
 *    (lower number = higher priority). If equal priority, keep the earlier one
 *    and truncate the later one to start after the earlier one ends.
 * 3. Wind-down blocks that overlap with sleep blocks from an adjacent day
 *    are removed (they belong to the dropped/truncated sleep block).
 *
 * This preserves the per-day planner's intent while ensuring the final plan
 * has no overlapping blocks of the same type.
 */
function resolveOverlaps(blocks: PlanBlock[]): PlanBlock[] {
  // Step 1: Exact dedup
  const seen = new Set<string>();
  let deduped = blocks.filter((b) => {
    const key = `${b.type}-${b.start.getTime()}-${b.end.getTime()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Step 2: Resolve overlapping main-sleep blocks
  const sleepBlocks = deduped
    .filter((b) => b.type === 'main-sleep')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const droppedSleepIds = new Set<string>();
  const truncatedSleep = new Map<string, PlanBlock>();

  for (let i = 1; i < sleepBlocks.length; i++) {
    const prev = truncatedSleep.get(sleepBlocks[i - 1].id) ?? sleepBlocks[i - 1];
    const curr = sleepBlocks[i];

    if (curr.start.getTime() < prev.end.getTime()) {
      // Overlap detected
      if (curr.priority > prev.priority) {
        // Current has lower priority — drop it
        droppedSleepIds.add(curr.id);
      } else if (curr.priority < prev.priority) {
        // Current has higher priority — truncate previous
        const truncated = { ...prev, end: new Date(curr.start.getTime()) };
        // Only keep if remaining duration >= 2 hours
        if (truncated.end.getTime() - truncated.start.getTime() >= 2 * 60 * 60 * 1000) {
          truncatedSleep.set(prev.id, truncated);
        } else {
          droppedSleepIds.add(prev.id);
        }
      } else {
        // Same priority — truncate the later one to start after the earlier one ends
        const adjusted = { ...curr, start: new Date(prev.end.getTime()) };
        if (adjusted.end.getTime() - adjusted.start.getTime() >= 2 * 60 * 60 * 1000) {
          truncatedSleep.set(curr.id, adjusted);
        } else {
          droppedSleepIds.add(curr.id);
        }
      }
    }
  }

  // Apply truncations and drops
  deduped = deduped
    .filter((b) => !droppedSleepIds.has(b.id))
    .map((b) => truncatedSleep.get(b.id) ?? b);

  // Step 3: Remove orphaned wind-down blocks whose parent sleep was dropped
  // Wind-down IDs follow the pattern "{dayId}-wind-down" and their parent sleep
  // is "{dayId}-main-sleep". If the parent was dropped, remove the wind-down.
  const remainingSleepIds = new Set(
    deduped.filter((b) => b.type === 'main-sleep').map((b) => b.id)
  );
  deduped = deduped.filter((b) => {
    if (b.type !== 'wind-down') return true;
    // Wind-down ID: "YYYY-MM-DD-wind-down", parent: "YYYY-MM-DD-main-sleep"
    const parentId = b.id.replace('-wind-down', '-main-sleep');
    return remainingSleepIds.has(parentId);
  });

  // Step 4: Resolve overlapping nap blocks using the same approach
  const napBlocks = deduped
    .filter((b) => b.type === 'nap')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const droppedNapIds = new Set<string>();
  for (let i = 1; i < napBlocks.length; i++) {
    const prev = napBlocks[i - 1];
    const curr = napBlocks[i];
    if (curr.start.getTime() < prev.end.getTime()) {
      droppedNapIds.add(curr.id);
    }
  }

  // Also drop naps that overlap with (remaining) sleep blocks
  const finalSleepBlocks = deduped
    .filter((b) => b.type === 'main-sleep')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  for (const nap of napBlocks) {
    if (droppedNapIds.has(nap.id)) continue;
    for (const sleep of finalSleepBlocks) {
      if (nap.start.getTime() < sleep.end.getTime() && nap.end.getTime() > sleep.start.getTime()) {
        droppedNapIds.add(nap.id);
        break;
      }
    }
  }

  deduped = deduped.filter((b) => !droppedNapIds.has(b.id));

  return deduped;
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
