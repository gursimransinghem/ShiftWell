/**
 * Pre-Adaptation Protocol Generator — Phase 22
 *
 * Generates a multi-day pre-adaptation plan for upcoming high-stress transitions.
 * References the existing circadian light/meal protocol approach.
 *
 * Rules:
 *   - high/critical stress: start 5 days before
 *   - medium stress: start 3 days before
 *   - low stress: return null (no pre-adaptation needed)
 *
 * Scientific basis:
 *   Eastman & Burgess (2009) — gradual clock shifting (30–60 min/day achievable)
 *   Boivin & Boudreau (2014) — structured pre-adaptation protocols
 */

import { addDays, addMinutes, subDays } from 'date-fns';
import type { TransitionStressPoint } from './stress-scorer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DailyAdaptationAction {
  date: Date;
  /** Minutes to shift bedtime (positive = later, negative = earlier) */
  bedtimeShift: number;
  /** Light exposure guidance for this day */
  lightGuidance: string;
  /** Optional nap recommendation */
  napGuidance?: string;
}

export interface PreAdaptationPlan {
  stressPoint: TransitionStressPoint;
  /** When pre-adaptation begins (3–5 days before transition) */
  startDate: Date;
  dailyActions: DailyAdaptationAction[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY_AHEAD_BY_SEVERITY = {
  high: 5,
  critical: 5,
  medium: 3,
  low: 0,
};

/**
 * Generate daily bedtime shifts for a day-to-night transition.
 * Goal: delay bedtime progressively so night shift sleep is natural.
 */
function generateDelayActions(
  startDate: Date,
  daysAhead: number,
  currentBedtime: Date,
): DailyAdaptationAction[] {
  const actions: DailyAdaptationAction[] = [];
  // Shift bedtime ~30 min later each day
  const shiftPerDay = 30;

  for (let i = 0; i < daysAhead; i++) {
    const date = addDays(startDate, i);
    const dayNumber = i + 1;
    const cumulative = shiftPerDay * dayNumber;

    let lightGuidance: string;
    if (i < 2) {
      lightGuidance = 'Seek bright light in the evening (8–10 PM) to begin delaying your clock. Dim all lights after 10 PM.';
    } else {
      lightGuidance = `Bright light exposure 9 PM–11 PM. Wear blue-blocking glasses after midnight. Protect the new ${Math.round(cumulative / 60 * 10) / 10}h shift.`;
    }

    const napGuidance = i === daysAhead - 1
      ? 'Consider a 20-min nap before your first night shift to top up alertness.'
      : undefined;

    actions.push({
      date,
      bedtimeShift: shiftPerDay,
      lightGuidance,
      napGuidance,
    });
  }

  return actions;
}

/**
 * Generate daily bedtime shifts for a night-to-day transition.
 * Goal: advance bedtime progressively so morning schedule is natural.
 */
function generateAdvanceActions(
  startDate: Date,
  daysAhead: number,
  currentBedtime: Date,
): DailyAdaptationAction[] {
  const actions: DailyAdaptationAction[] = [];
  // Shift bedtime ~30 min earlier each day
  const shiftPerDay = -30;

  for (let i = 0; i < daysAhead; i++) {
    const date = addDays(startDate, i);

    let lightGuidance: string;
    if (i === 0) {
      lightGuidance = 'Get bright sunlight within 30 min of waking. This is the single most powerful clock-advance signal.';
    } else {
      lightGuidance = 'Morning bright light immediately after waking. Avoid light after 9 PM to protect melatonin onset.';
    }

    const napGuidance = i === 0
      ? 'A short 20–30 min nap in early afternoon is OK. Avoid napping after 3 PM.'
      : undefined;

    actions.push({
      date,
      bedtimeShift: shiftPerDay,
      lightGuidance,
      napGuidance,
    });
  }

  return actions;
}

/**
 * Generate general pre-adaptation actions for other transition types.
 */
function generateGeneralActions(
  startDate: Date,
  daysAhead: number,
  transitionType: string,
): DailyAdaptationAction[] {
  const actions: DailyAdaptationAction[] = [];

  for (let i = 0; i < daysAhead; i++) {
    const date = addDays(startDate, i);
    const isDelaying = transitionType === 'evening-to-night' || transitionType === 'day-to-evening';
    const shiftPerDay = isDelaying ? 20 : -20;

    actions.push({
      date,
      bedtimeShift: shiftPerDay,
      lightGuidance: isDelaying
        ? 'Extend evening light exposure and dim lights earlier the next morning.'
        : 'Seek morning bright light within 30 min of waking. Limit evening screen time.',
    });
  }

  return actions;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a pre-adaptation plan for a given stress point.
 *
 * Returns null when:
 *   - severity is 'low' (no pre-adaptation needed)
 *   - the stress point is too soon to start pre-adaptation (< 1 day away)
 *
 * @param stressPoint    The transition to prepare for
 * @param currentBedtime The user's current baseline bedtime
 * @param today          Reference date (defaults to now)
 */
export function generatePreAdaptation(
  stressPoint: TransitionStressPoint,
  currentBedtime: Date,
  today: Date = new Date(),
): PreAdaptationPlan | null {
  if (stressPoint.severity === 'low') return null;

  const daysAhead = DAY_AHEAD_BY_SEVERITY[stressPoint.severity];
  const startDate = subDays(stressPoint.date, daysAhead);

  // If pre-adaptation would have started in the past, use today as start
  // but only if there's still at least 1 day remaining
  const effectiveStart = startDate < today ? today : startDate;
  const remainingDays = Math.floor(
    (stressPoint.date.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (remainingDays < 1) return null;

  let dailyActions: DailyAdaptationAction[];

  switch (stressPoint.transitionType) {
    case 'day-to-night':
    case 'isolated-night':
      dailyActions = generateDelayActions(effectiveStart, remainingDays, currentBedtime);
      break;
    case 'night-to-day':
      dailyActions = generateAdvanceActions(effectiveStart, remainingDays, currentBedtime);
      break;
    default:
      dailyActions = generateGeneralActions(effectiveStart, remainingDays, stressPoint.transitionType);
  }

  return {
    stressPoint,
    startDate: effectiveStart,
    dailyActions,
  };
}
