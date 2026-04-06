/**
 * Adaptive Context Builder
 *
 * Assembles the AdaptiveContext each morning from HealthKit history,
 * shift schedule, personal calendar, and user profile.
 *
 * Scientific basis: docs/superpowers/specs/2026-04-06-adaptive-brain-design.md
 */

import { differenceInDays, startOfDay } from 'date-fns';
import type { ShiftEvent, PersonalEvent, UserProfile } from '../circadian/types';
import type { SleepRecord } from '../healthkit/healthkit-service';
import { computeDebtLedger } from './sleep-debt-engine';
import { detectTransition, buildProtocol } from './circadian-protocols';
import { computeRecoveryScore, scoreToZone } from './recovery-calculator';
import type {
  AdaptiveContext,
  PatternAlert,
  TransitionType,
} from './types';

// ─── Pattern Alert Helpers ────────────────────────────────────────────────────

/**
 * Build pattern alerts from upcoming shifts.
 * Checks a 7-day window for mixed shift patterns and a 3-day window for
 * imminent night shifts or consecutive night clusters.
 */
function buildPatternAlerts(shifts: ShiftEvent[], today: Date): PatternAlert[] {
  const alerts: PatternAlert[] = [];

  const todayStart = startOfDay(today);
  const window3 = shifts.filter(
    (s) => s.start >= todayStart && differenceInDays(s.start, today) < 3,
  );
  const window7 = shifts.filter(
    (s) => s.start >= todayStart && differenceInDays(s.start, today) < 7,
  );

  // 'night-soon': any night shift within 3 days
  const nightSoon = window3.some((s) => s.shiftType === 'night');
  if (nightSoon) {
    alerts.push({
      id: 'night-soon',
      type: 'night-soon',
      message: 'Night shift within 3 days — start shifting your sleep now.',
      color: '#F59E0B', // amber
    });
  }

  // 'consecutive-nights': 2 or more consecutive night shifts in next 7 days
  const nightsIn7 = window7
    .filter((s) => s.shiftType === 'night')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  let consecutiveNights = false;
  for (let i = 1; i < nightsIn7.length; i++) {
    const gap = differenceInDays(nightsIn7[i].start, nightsIn7[i - 1].start);
    if (gap === 1) {
      consecutiveNights = true;
      break;
    }
  }
  if (consecutiveNights) {
    alerts.push({
      id: 'consecutive-nights',
      type: 'consecutive-nights',
      message: 'Consecutive night shifts detected — consider anchor sleep strategy.',
      color: '#EF4444', // red
    });
  }

  // 'mixed-week': both night and day shifts in next 7 days
  const hasNight = window7.some((s) => s.shiftType === 'night');
  const hasDay = window7.some((s) => s.shiftType === 'day');
  if (hasNight && hasDay) {
    alerts.push({
      id: 'mixed-week',
      type: 'mixed-week',
      message: 'Mixed day/night schedule this week — prioritize sleep consistency.',
      color: '#8B5CF6', // purple
    });
  }

  return alerts;
}

/**
 * Find personal events that conflict with the protocol's sleep windows.
 *
 * v1 heuristic: any personal event starting between midnight and 10 AM
 * on a day that has a protocol daily target is considered a conflict
 * (likely during sleep time for shift workers).
 */
function findCalendarConflicts(
  personalEvents: PersonalEvent[],
  dailyTargetDates: Date[],
): PersonalEvent[] {
  if (dailyTargetDates.length === 0) return [];

  return personalEvents.filter((evt) => {
    const evtHour = evt.start.getHours();
    const isSleepHour = evtHour >= 0 && evtHour < 10;
    if (!isSleepHour) return false;

    // Check if the event date matches any daily target date
    return dailyTargetDates.some(
      (targetDate) => differenceInDays(evt.start, targetDate) === 0,
    );
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Assemble an AdaptiveContext from pre-fetched data sources.
 *
 * This is the single entry point for the adaptive brain's morning assembly.
 * Called once per day (or on demand) before generating the sleep plan.
 *
 * @param deps.shifts        - All upcoming shift events (full calendar range)
 * @param deps.personalEvents - Non-shift calendar events
 * @param deps.profile       - User profile (chronotype, sleepNeed, etc.)
 * @param deps.history       - Pre-fetched 14-night HealthKit sleep records
 * @param deps.today         - Reference date (typically new Date())
 */
export function buildAdaptiveContext(deps: {
  shifts: ShiftEvent[];
  personalEvents: PersonalEvent[];
  profile: UserProfile;
  history: SleepRecord[];
  today: Date;
}): AdaptiveContext {
  const { shifts, personalEvents, profile, history, today } = deps;

  // ── 1. Circadian transition detection ───────────────────────────────────────
  const transition = detectTransition(shifts, today);
  const protocol = buildProtocol(transition, today, profile.chronotype);
  const maintenanceMode = transition.type === 'none';

  // Phase offset is informational for v1 (full implementation compares
  // current plan's bedtime to the circadian optimum for the chronotype).
  const phaseOffsetMinutes = 0;

  // ── 2. Sleep debt ledger ─────────────────────────────────────────────────────
  const ledger = computeDebtLedger(history, profile.sleepNeed, shifts, today);

  // ── 3. Recovery score from most recent history record ────────────────────────
  // Sort history descending by date so index 0 is the most recent night.
  const sorted = [...history].sort((a, b) => b.date.getTime() - a.date.getTime());
  const mostRecent = sorted[0] ?? null;

  const recoveryScore =
    mostRecent !== null
      ? computeRecoveryScore(mostRecent, profile.sleepNeed)
      : null;

  const recoveryZone =
    recoveryScore !== null ? scoreToZone(recoveryScore) : null;

  // Baseline matures after 30 nights with a non-null score
  const scorableCount = history.filter(
    (r) => computeRecoveryScore(r, profile.sleepNeed) !== null,
  ).length;
  const baselineMature = scorableCount >= 30;

  // ── 4. Meta ──────────────────────────────────────────────────────────────────
  const daysTracked = history.length;
  const learningPhase = daysTracked < 30;

  // ── 5. Pattern alerts ────────────────────────────────────────────────────────
  const patternAlerts = buildPatternAlerts(shifts, today);

  // ── 6. Calendar conflicts ─────────────────────────────────────────────────────
  const targetDates = protocol.dailyTargets.map((t) => t.date);
  const calendarConflicts = findCalendarConflicts(personalEvents, targetDates);

  // ── 7. Assemble ──────────────────────────────────────────────────────────────
  return {
    circadian: {
      protocol: protocol.dailyTargets.length > 0 ? protocol : null,
      phaseOffsetMinutes,
      maintenanceMode,
    },
    debt: {
      rollingHours: ledger.rollingHours,
      bankHours: ledger.bankHours,
      severity: ledger.severity,
    },
    schedule: {
      transitionType: transition.type !== 'none' ? (transition.type as TransitionType) : null,
      daysUntilTransition: transition.daysUntil,
      calendarConflicts,
      patternAlerts,
      bankingWindowOpen: ledger.bankingWindowOpen,
    },
    recovery: {
      score: recoveryScore,
      zone: recoveryZone,
      baselineMature,
    },
    meta: {
      learningPhase,
      daysTracked,
      lastUpdated: today,
    },
  };
}
