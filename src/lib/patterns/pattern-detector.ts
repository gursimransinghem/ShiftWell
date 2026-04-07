/**
 * Pattern Recognition Engine — Phase 23
 *
 * Detects behavioral and physiological patterns from sleep history, shift history,
 * and debt trends. Returns actionable pattern insights with severity levels.
 *
 * Pattern types:
 *   1. consecutive-night-impact  — 3+ nights → debt spike
 *   2. recovery-debt-trend       — rolling 4-week debt trend
 *   3. weekend-compensation      — 2+ extra hours on off-days consistently
 *   4. chronic-late-sleep        — avg start delta > 30 min late for 2+ weeks
 *   5. improving-adherence       — avg discrepancy decreasing over 2 weeks
 *
 * Scientific basis:
 *   Drake et al. (2004) SWSD prevalence, Gander et al. (2011) fatigue risk,
 *   Ruggiero & Redeker (2014) napping in shift work.
 */

import { parseISO, differenceInDays, getDay, formatISO } from 'date-fns';
import type { SleepDiscrepancy } from '../feedback/types';
import type { ShiftEvent } from '../circadian/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PatternType =
  | 'consecutive-night-impact'
  | 'recovery-debt-trend'
  | 'weekend-compensation'
  | 'chronic-late-sleep'
  | 'improving-adherence';

export interface DetectedPattern {
  type: PatternType;
  severity: 'info' | 'warning' | 'alert';
  /** Natural language description of the pattern */
  message: string;
  /** Data that supports the pattern detection */
  evidence: string;
  /** Actionable suggestion */
  recommendation: string;
  /** ISO date when this pattern was detected */
  detectedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Check if a date string represents a weekend day (Saturday or Sunday).
 * Uses the ISO date string directly — no timezone shift needed.
 */
function isOffDay(dateISO: string, shiftDates: Set<string>): boolean {
  return !shiftDates.has(dateISO);
}

// ---------------------------------------------------------------------------
// Pattern detectors
// ---------------------------------------------------------------------------

/**
 * Pattern 1: consecutive-night-impact
 * Detects if 3+ consecutive night shifts are followed by a spike in sleep debt.
 */
function detectConsecutiveNightImpact(
  shiftHistory: ShiftEvent[],
  debtHistory: { dateISO: string; hours: number }[],
): DetectedPattern | null {
  if (shiftHistory.length < 3 || debtHistory.length < 1) return null;

  const sorted = [...shiftHistory].sort((a, b) => a.start.getTime() - b.start.getTime());
  const nightShifts = sorted.filter((s) => s.shiftType === 'night');

  if (nightShifts.length < 3) return null;

  // Find runs of 3+ consecutive night shifts
  let consecutiveCount = 1;
  let maxRun = 1;
  let runEndDate: Date | null = null;

  for (let i = 1; i < nightShifts.length; i++) {
    const daysBetween = differenceInDays(nightShifts[i].start, nightShifts[i - 1].start);
    if (daysBetween <= 2) {
      consecutiveCount++;
      if (consecutiveCount > maxRun) {
        maxRun = consecutiveCount;
        runEndDate = nightShifts[i].start;
      }
    } else {
      consecutiveCount = 1;
    }
  }

  if (maxRun < 3 || !runEndDate) return null;

  // Check if debt spiked after the run
  const runEndISO = formatISO(runEndDate, { representation: 'date' });
  const afterRunDebt = debtHistory.find((d) => d.dateISO >= runEndISO);

  if (!afterRunDebt || afterRunDebt.hours < 2) return null;

  return {
    type: 'consecutive-night-impact',
    severity: afterRunDebt.hours >= 4 ? 'alert' : 'warning',
    message: `${maxRun} consecutive night shifts causing sleep debt buildup`,
    evidence: `${maxRun} night shifts detected in a row. Post-run debt: ${afterRunDebt.hours.toFixed(1)}h`,
    recommendation: 'Schedule a 90-min anchor nap between nights 2 and 3 of any multi-night stretch.',
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Pattern 2: recovery-debt-trend
 * Computes a rolling 4-week debt trend (improving / stable / worsening).
 */
function detectRecoveryDebtTrend(
  debtHistory: { dateISO: string; hours: number }[],
): DetectedPattern | null {
  if (debtHistory.length < 14) return null;

  const sorted = [...debtHistory].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const recent = sorted.slice(-14);
  const firstHalf = recent.slice(0, 7);
  const secondHalf = recent.slice(7);

  const firstAvg = average(firstHalf.map((d) => d.hours));
  const secondAvg = average(secondHalf.map((d) => d.hours));
  const delta = secondAvg - firstAvg;

  if (Math.abs(delta) < 0.5) {
    // Stable — only report if debt is high
    if (secondAvg >= 3) {
      return {
        type: 'recovery-debt-trend',
        severity: 'warning',
        message: 'Persistent sleep debt with no improvement trend',
        evidence: `Avg debt last 2 weeks: ${firstAvg.toFixed(1)}h → ${secondAvg.toFixed(1)}h (stable, high)`,
        recommendation: 'Add a 90-min recovery block on your next day off. Prioritize sleep over social obligations.',
        detectedAt: new Date().toISOString(),
      };
    }
    return null;
  }

  if (delta > 0.5) {
    return {
      type: 'recovery-debt-trend',
      severity: delta > 1.5 ? 'alert' : 'warning',
      message: 'Sleep debt is worsening week over week',
      evidence: `Avg debt increased from ${firstAvg.toFixed(1)}h to ${secondAvg.toFixed(1)}h (+${delta.toFixed(1)}h)`,
      recommendation: 'Protect at least one full 8-hour sleep opportunity this week. Avoid scheduling extras on off-days.',
      detectedAt: new Date().toISOString(),
    };
  }

  // Improving
  return {
    type: 'recovery-debt-trend',
    severity: 'info',
    message: 'Sleep debt is improving — keep it up',
    evidence: `Avg debt decreased from ${firstAvg.toFixed(1)}h to ${secondAvg.toFixed(1)}h (-${Math.abs(delta).toFixed(1)}h)`,
    recommendation: 'Maintain your current sleep schedule. Consistency is the key driver of this improvement.',
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Pattern 3: weekend-compensation
 * Detects sleeping 2+ hours more on off-days vs work days consistently.
 */
function detectWeekendCompensation(
  discrepancyHistory: SleepDiscrepancy[],
  shiftHistory: ShiftEvent[],
): DetectedPattern | null {
  if (discrepancyHistory.length < 7) return null;

  const shiftDates = new Set(
    shiftHistory.map((s) => formatISO(s.start, { representation: 'date' })),
  );

  const withActual = discrepancyHistory.filter((d) => d.actual !== null);
  const workDaySleep = withActual
    .filter((d) => !isOffDay(d.dateISO, shiftDates))
    .map((d) => d.actual!.durationHours);
  const offDaySleep = withActual
    .filter((d) => isOffDay(d.dateISO, shiftDates))
    .map((d) => d.actual!.durationHours);

  if (workDaySleep.length < 3 || offDaySleep.length < 2) return null;

  const workAvg = average(workDaySleep);
  const offAvg = average(offDaySleep);
  const diff = offAvg - workAvg;

  if (diff < 2) return null;

  return {
    type: 'weekend-compensation',
    severity: diff >= 3 ? 'alert' : 'warning',
    message: `Sleeping ${diff.toFixed(1)}h more on off-days — a sign of chronic shift-day under-sleep`,
    evidence: `Avg work-day sleep: ${workAvg.toFixed(1)}h. Avg off-day sleep: ${offAvg.toFixed(1)}h. Delta: +${diff.toFixed(1)}h`,
    recommendation: 'Increase shift-day sleep opportunity by 30–45 min. Consider a pre-shift nap instead of weekend oversleeping.',
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Pattern 4: chronic-late-sleep
 * Detects if the user consistently starts sleep 30+ min later than planned.
 */
function detectChronicLateSleep(
  discrepancyHistory: SleepDiscrepancy[],
): DetectedPattern | null {
  if (discrepancyHistory.length < 14) return null;

  const recent = discrepancyHistory
    .filter((d) => d.delta !== null)
    .slice(-14);

  if (recent.length < 10) return null;

  const avgDelta = average(recent.map((d) => d.delta!.startMinutes));

  if (avgDelta <= 30) return null;

  return {
    type: 'chronic-late-sleep',
    severity: avgDelta > 60 ? 'alert' : 'warning',
    message: `Consistently starting sleep ${Math.round(avgDelta)} min later than planned`,
    evidence: `14-day average start delta: +${Math.round(avgDelta)} min (>${30} min threshold)`,
    recommendation: 'Your planned bedtime may be too early for your chronotype. The algorithm will auto-adjust, but you can also shift your target bedtime 30 min later in settings.',
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Pattern 5: improving-adherence
 * Detects if sleep discrepancy (absolute) is decreasing over the last 2 weeks.
 */
function detectImprovingAdherence(
  discrepancyHistory: SleepDiscrepancy[],
): DetectedPattern | null {
  if (discrepancyHistory.length < 14) return null;

  const withDelta = discrepancyHistory
    .filter((d) => d.delta !== null)
    .slice(-14);

  if (withDelta.length < 10) return null;

  const firstHalf = withDelta.slice(0, 7);
  const secondHalf = withDelta.slice(7);

  const firstAvgAbs = average(firstHalf.map((d) => Math.abs(d.delta!.startMinutes)));
  const secondAvgAbs = average(secondHalf.map((d) => Math.abs(d.delta!.startMinutes)));
  const improvement = firstAvgAbs - secondAvgAbs;

  if (improvement < 10) return null;

  return {
    type: 'improving-adherence',
    severity: 'info',
    message: 'Sleep adherence is improving — your schedule is becoming more consistent',
    evidence: `Avg discrepancy dropped from ${Math.round(firstAvgAbs)} min to ${Math.round(secondAvgAbs)} min (-${Math.round(improvement)} min)`,
    recommendation: 'Keep it up. Consistency within 15 min of target is the goal for optimal circadian stability.',
    detectedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run all pattern detectors and return any patterns found.
 *
 * @param discrepancyHistory  Sleep discrepancy records from the feedback pipeline
 * @param shiftHistory        All historical shifts
 * @param debtHistory         Daily sleep debt records
 */
export function detectPatterns(
  discrepancyHistory: SleepDiscrepancy[],
  shiftHistory: ShiftEvent[],
  debtHistory: { dateISO: string; hours: number }[],
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  const p1 = detectConsecutiveNightImpact(shiftHistory, debtHistory);
  if (p1) patterns.push(p1);

  const p2 = detectRecoveryDebtTrend(debtHistory);
  if (p2) patterns.push(p2);

  const p3 = detectWeekendCompensation(discrepancyHistory, shiftHistory);
  if (p3) patterns.push(p3);

  const p4 = detectChronicLateSleep(discrepancyHistory);
  if (p4) patterns.push(p4);

  const p5 = detectImprovingAdherence(discrepancyHistory);
  if (p5) patterns.push(p5);

  return patterns;
}
