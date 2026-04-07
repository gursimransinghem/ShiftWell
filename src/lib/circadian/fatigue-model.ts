/**
 * Cumulative Fatigue Model — ShiftWell
 *
 * Models cumulative fatigue across multi-day shift blocks, tracking
 * how sleep deficit compounds over consecutive night shifts.
 *
 * Scientific basis:
 * - Folkard & Tucker (2003) — Risk of accidents increases with successive night shifts:
 *   relative risk multipliers for nights 1-4: 1.00 / 1.08 / 1.17 / 1.28
 * - Belenky et al. (2003) — Sleep restriction and sustained attention:
 *   recovery requires approximately 1-2 additional nights of recovery sleep
 *   per night of restriction
 * - Van Dongen et al. (2003) — Cumulative sleep debt and cognitive impairment
 * - NIOSH CDC shift work guidance — fatigue risk management
 */

import { differenceInCalendarDays, startOfDay } from 'date-fns';
import type { ShiftEvent, UserProfile } from './types';
import type { SleepRecord } from '../healthkit/healthkit-service';

// ─── Risk level thresholds ────────────────────────────────────────────────────

/** Cumulative sleep debt thresholds in hours (Van Dongen et al. 2003) */
const RISK_MODERATE_HOURS = 2;
const RISK_HIGH_HOURS = 4;
const RISK_CRITICAL_HOURS = 6;

/**
 * Folkard & Tucker (2003) night-shift risk multipliers for nights 1-4+.
 * Index 0 = night 1, index 1 = night 2, etc. Nights beyond index 3 use
 * the last value (1.28) — risk plateaus after night 4.
 */
const FOLKARD_NIGHT_RISK_MULTIPLIERS = [1.00, 1.08, 1.17, 1.28];

/**
 * Base hourly sleep deficit added per consecutive night shift.
 * Each consecutive night adds ~0.5h of base deficit because night workers
 * on average sleep 1-2h less than day workers per sleep opportunity.
 *
 * Reference: Folkard & Tucker (2003)
 */
const BASE_DEFICIT_PER_NIGHT_HOURS = 0.5;

/**
 * Recovery rate: estimated hours of debt recovered per off-day.
 * Based on Belenky et al. (2003) — full recovery after restriction
 * requires approximately 2 additional nights of adequate sleep.
 */
const RECOVERY_HOURS_PER_OFF_DAY = 2;

// ─── Public API ───────────────────────────────────────────────────────────────

export interface FatigueState {
  /** Total hours of cumulative sleep debt across the current shift block */
  cumulativeHours: number;
  /** Which day (1-indexed) in the block has the worst predicted fatigue */
  peakFatigueDay: number;
  /** Estimated off-days needed to return to baseline (Belenky et al. 2003) */
  recoveryDaysNeeded: number;
  /** Risk tier based on cumulative debt */
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  /** Specific, actionable guidance for the current risk level */
  recommendations: string[];
}

/**
 * Model cumulative fatigue across the current shift block.
 *
 * A "shift block" is a run of consecutive same-type shifts (typically nights).
 * The function identifies the block that today falls in (or the nearest
 * upcoming block), accumulates sleep deficit across it, and returns a
 * FatigueState describing risk and recovery.
 *
 * Algorithm:
 * 1. Identify the current night-shift block (or nearest upcoming block)
 * 2. For each shift in the block, compute the expected sleep deficit:
 *    - Use actual HealthKit sleep data when available
 *    - Fall back to profile.sleepNeed vs typical night-worker sleep (sleepNeed - 0.5h)
 * 3. Apply Folkard & Tucker (2003) night multipliers to weight the deficit
 * 4. Sum to get cumulativeHours, derive risk level and recommendations
 *
 * @param shifts - Upcoming/current shift schedule
 * @param sleepHistory - HealthKit sleep records (may be empty)
 * @param profile - User profile (chronotype, sleepNeed, etc.)
 * @param today - Reference date (caller-supplied for testability)
 * @returns FatigueState describing cumulative fatigue for the current block
 */
export function modelCumulativeFatigue(
  shifts: ShiftEvent[],
  sleepHistory: SleepRecord[],
  profile: UserProfile,
  today: Date,
): FatigueState {
  // ── Step 1: Find the current shift block ──────────────────────────────────
  // Look at shifts within a 21-day window centered on today (7 days back,
  // 14 days forward) so we can detect blocks that started before today.
  const windowStart = startOfDay(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
  const windowEnd = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  const relevantShifts = shifts
    .filter((s) => s.start >= windowStart && s.start <= windowEnd)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Find the block of night shifts that contains today or is nearest upcoming
  const nightBlock = findNightShiftBlock(relevantShifts, today);

  if (nightBlock.length === 0) {
    // No night block — return minimal fatigue
    return {
      cumulativeHours: 0,
      peakFatigueDay: 1,
      recoveryDaysNeeded: 0,
      riskLevel: 'low',
      recommendations: getRecommendations('low', 0),
    };
  }

  // ── Step 2: Compute sleep deficit for each shift in the block ─────────────
  const sleepHistoryMap = buildSleepHistoryMap(sleepHistory);
  let cumulativeDeficit = 0;
  let peakDeficit = 0;
  let peakFatigueDay = 1;

  for (let i = 0; i < nightBlock.length; i++) {
    const shift = nightBlock[i];
    const shiftDate = startOfDay(shift.start);
    const dateKey = formatDateKey(shiftDate);

    // Determine actual sleep hours for this day
    const actualSleep = sleepHistoryMap.get(dateKey);
    const actualSleepHours = actualSleep
      ? actualSleep.totalSleepMinutes / 60
      : null;

    // Night workers typically get sleepNeed - 0.5h per day (Folkard & Tucker 2003)
    const typicalNightSleep = Math.max(0, profile.sleepNeed - BASE_DEFICIT_PER_NIGHT_HOURS);
    const sleepObtained = actualSleepHours ?? typicalNightSleep;
    const rawDeficit = Math.max(0, profile.sleepNeed - sleepObtained);

    // Apply Folkard & Tucker (2003) multiplier for cumulative risk
    const multiplierIndex = Math.min(i, FOLKARD_NIGHT_RISK_MULTIPLIERS.length - 1);
    const multiplier = FOLKARD_NIGHT_RISK_MULTIPLIERS[multiplierIndex];
    const weightedDeficit = rawDeficit * multiplier;

    cumulativeDeficit += weightedDeficit;

    // Track which day in the block has the worst cumulative fatigue
    if (cumulativeDeficit > peakDeficit) {
      peakDeficit = cumulativeDeficit;
      peakFatigueDay = i + 1; // 1-indexed
    }
  }

  // Round to 1 decimal for readability
  cumulativeDeficit = Math.round(cumulativeDeficit * 10) / 10;

  // ── Step 3: Risk classification ───────────────────────────────────────────
  const riskLevel = classifyRisk(cumulativeDeficit);

  // ── Step 4: Recovery estimate (Belenky et al. 2003) ──────────────────────
  const recoveryDaysNeeded = Math.ceil(cumulativeDeficit / RECOVERY_HOURS_PER_OFF_DAY);

  return {
    cumulativeHours: cumulativeDeficit,
    peakFatigueDay,
    recoveryDaysNeeded,
    riskLevel,
    recommendations: getRecommendations(riskLevel, cumulativeDeficit),
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Find the night-shift block containing today, or the nearest upcoming block.
 *
 * A block is a consecutive sequence of night shifts with no more than 1
 * off-day gap (to handle split schedules like 3-on/1-off/3-on patterns).
 */
function findNightShiftBlock(
  sortedShifts: ShiftEvent[],
  today: Date,
): ShiftEvent[] {
  const nightShifts = sortedShifts.filter((s) => s.shiftType === 'night');
  if (nightShifts.length === 0) return [];

  // Group consecutive night shifts into blocks (gap <= 1 day = same block)
  const blocks: ShiftEvent[][] = [];
  let currentBlock: ShiftEvent[] = [nightShifts[0]];

  for (let i = 1; i < nightShifts.length; i++) {
    const prev = nightShifts[i - 1];
    const curr = nightShifts[i];
    const gap = differenceInCalendarDays(curr.start, prev.start);

    if (gap <= 2) {
      // Within 2 calendar days = same block (handles back-to-back nights)
      currentBlock.push(curr);
    } else {
      blocks.push(currentBlock);
      currentBlock = [curr];
    }
  }
  blocks.push(currentBlock);

  const todayStart = startOfDay(today);

  // Prefer the block that contains today
  for (const block of blocks) {
    const blockStart = startOfDay(block[0].start);
    const blockEnd = startOfDay(block[block.length - 1].start);
    if (blockStart <= todayStart && blockEnd >= todayStart) {
      return block;
    }
  }

  // Fall back to the nearest future block
  for (const block of blocks) {
    const blockStart = startOfDay(block[0].start);
    if (blockStart > todayStart) {
      return block;
    }
  }

  // Fall back to most recent past block
  return blocks[blocks.length - 1];
}

/**
 * Build a map from date key (yyyy-MM-dd) to SleepRecord for fast lookup.
 */
function buildSleepHistoryMap(
  sleepHistory: SleepRecord[],
): Map<string, SleepRecord> {
  const map = new Map<string, SleepRecord>();
  for (const record of sleepHistory) {
    const key = formatDateKey(startOfDay(record.date));
    map.set(key, record);
  }
  return map;
}

/** Format a Date as a yyyy-MM-dd key for map lookups */
function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Classify cumulative sleep debt into a risk tier.
 *
 * Thresholds (Van Dongen et al. 2003 / Belenky et al. 2003):
 * - <2h: low — within normal variation
 * - 2-4h: moderate — measurable cognitive decline
 * - 4-6h: high — significant impairment, similar to 24h sleep deprivation
 * - >6h: critical — severe impairment, patient safety concern
 */
function classifyRisk(
  cumulativeHours: number,
): 'low' | 'moderate' | 'high' | 'critical' {
  if (cumulativeHours >= RISK_CRITICAL_HOURS) return 'critical';
  if (cumulativeHours >= RISK_HIGH_HOURS) return 'high';
  if (cumulativeHours >= RISK_MODERATE_HOURS) return 'moderate';
  return 'low';
}

/**
 * Generate specific, actionable recommendations for the current risk level.
 * Higher risk levels include all lower-level recommendations plus escalated guidance.
 */
function getRecommendations(
  riskLevel: 'low' | 'moderate' | 'high' | 'critical',
  cumulativeHours: number,
): string[] {
  switch (riskLevel) {
    case 'low':
      return [
        'Maintain consistent sleep schedule on off-days.',
        'Prioritize sleep on nights before shifts.',
      ];

    case 'moderate':
      return [
        `Cumulative debt ~${cumulativeHours.toFixed(1)}h — use upcoming off-days to recover.`,
        'Consider a 20-30 min prophylactic nap before each shift.',
        'Avoid caffeine within 6 hours of planned sleep.',
        'Prioritize sleep environment (blackout curtains, temperature ~65-68°F).',
      ];

    case 'high':
      return [
        `High fatigue (${cumulativeHours.toFixed(1)}h deficit) — prioritize recovery sleep.`,
        'Schedule at least one 8h+ sleep opportunity in the next 2 days.',
        '90-min pre-shift nap strongly recommended.',
        'Avoid driving after shift — fatigue impairs driving as much as 0.08 BAC.',
        'Discuss schedule intensity with charge nurse if persisting >3 nights.',
      ];

    case 'critical':
      return [
        `Critical fatigue level (${cumulativeHours.toFixed(1)}h deficit) — patient safety risk.`,
        'Consider requesting a schedule modification with your supervisor.',
        'Mandatory recovery: aim for 9+ hours sleep at next opportunity.',
        'Do not drive after shift — use rideshare or carpool.',
        'Fatigue at this level matches performance of blood alcohol 0.10+ (Dawson & Reid 1997).',
        `Recovery will require ~${Math.ceil(cumulativeHours / RECOVERY_HOURS_PER_OFF_DAY)} off-days to return to baseline.`,
      ];
  }
}
