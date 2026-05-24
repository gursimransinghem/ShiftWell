/**
 * Circadian Protocols
 *
 * Detects upcoming shift transitions and builds day-by-day circadian adjustment
 * protocols (bedtime shifting, light guidance, nap timing).
 *
 * v1 hardening (gap-analysis R1/R2/R3): all transition logic now routes through the
 * single shared authority in `circadian/transition-planner.ts` —
 *   - selectMode()       — the consecutive-night gate. 1-3 nights → Hold (no clock
 *                          shift); ≥4 → Adapt (partial shift toward the compromise phase).
 *   - clampDailyShift()  — every per-day delta is capped at +120 (delay) / −60 (advance).
 * This module keeps NO private rate numbers and NO private isolated-night rule.
 *
 * Scientific basis:
 * - Eastman & Burgess (2009) — phase shifting, delay>advance asymmetry, rate ceilings
 * - Smith & Eastman — the consecutive-night gate for rotating workers
 * - Smith, Fogg & Eastman (2009) — compromise phase position (DLMO 03:00)
 * - Crowley et al. (2003) — chronotype modulates shift rate
 * - Burgess melatonin PRC — melatonin guidance corrected to PRC-honest wording
 */

import { addDays, differenceInDays, startOfDay } from 'date-fns';
import type { ShiftEvent, Chronotype } from '../circadian/types';
import type {
  TransitionType,
  CircadianProtocol,
  ProtocolDayTarget,
} from './types';
import {
  selectMode,
  clampDailyShift,
  consecutiveNightsForDate,
  type TransitionMode,
} from '../circadian/transition-planner';
import { circadianTelemetry } from '../circadian/telemetry';

/** Detection result — now carries the consecutive-night count that drives the mode gate. */
export interface TransitionDetection {
  type: TransitionType;
  daysUntil: number;
  /** Consecutive nights in the associated night block (0 for non-night transitions). */
  consecutiveNights: number;
}

// ─── Chronotype modifiers ──────────────────────────────────────────────────────

/**
 * Apply a ±15% chronotype modifier to a per-day bedtime delta.
 * Delay is easier for late types, advance easier for early types (Crowley 2003).
 * The result is rounded to 15 min; callers then clampDailyShift() to physiology.
 */
function applyChronotypeMod(adjustMinutes: number, chronotype: Chronotype): number {
  if (chronotype === 'intermediate') return adjustMinutes;
  const isDelay = adjustMinutes > 0;
  let factor: number;
  if (chronotype === 'early') {
    factor = isDelay ? 1.15 : 0.85;
  } else {
    factor = isDelay ? 0.85 : 1.15;
  }
  return Math.round((adjustMinutes * factor) / 15) * 15;
}

/** Chronotype-specific light-guidance addendum (empty for intermediate). */
function chronotypeLightNote(chronotype: Chronotype, isDelay: boolean): string {
  if (chronotype === 'intermediate') return '';
  if (chronotype === 'early' && isDelay) {
    return ' Your early chronotype makes night shifts harder — extra discipline on light avoidance after 8 PM.';
  }
  if (chronotype === 'late' && isDelay) {
    return ' Your late chronotype gives you a natural advantage for night shifts.';
  }
  return '';
}

// ─── detectTransition ──────────────────────────────────────────────────────────

/**
 * Scan upcoming shifts (next 14 days) and find the first shift-type boundary.
 * Returns the transition type, days until it, and — for night-bound transitions —
 * the consecutive-night count of the night block it leads into.
 */
export function detectTransition(
  shifts: ShiftEvent[],
  today: Date,
): TransitionDetection {
  const windowEnd = addDays(today, 14);
  const todayStart = startOfDay(today);
  const upcoming = shifts
    .filter((s) => s.start >= todayStart && s.start <= windowEnd)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (upcoming.length === 0) {
    return { type: 'none', daysUntil: 999, consecutiveNights: 0 };
  }

  // ── Step 1: isolated-night ──────────────────────────────────────────────────
  const nightShifts = upcoming.filter((s) => s.shiftType === 'night');
  for (const nightShift of nightShifts) {
    const nightDay = differenceInDays(nightShift.start, today);
    const nightBefore = upcoming.find(
      (s) => s !== nightShift && s.shiftType === 'night' &&
        differenceInDays(nightShift.start, s.start) > 0 &&
        differenceInDays(nightShift.start, s.start) <= 5,
    );
    const nightAfter = upcoming.find(
      (s) => s !== nightShift && s.shiftType === 'night' &&
        differenceInDays(s.start, nightShift.start) > 0 &&
        differenceInDays(s.start, nightShift.start) <= 5,
    );
    const nonNightBefore = upcoming.find(
      (s) => s !== nightShift && s.shiftType !== 'night' && s.start < nightShift.start,
    );
    const nonNightAfter = upcoming.find(
      (s) => s !== nightShift && s.shiftType !== 'night' && s.start > nightShift.start,
    );
    if (!nightBefore && !nightAfter && nonNightBefore && nonNightAfter) {
      // An isolated night is always a 1-night block → Hold.
      return { type: 'isolated-night', daysUntil: nightDay, consecutiveNights: 1 };
    }
  }

  // ── Step 2: first shift-type boundary ───────────────────────────────────────
  for (let i = 1; i < upcoming.length; i++) {
    const prev = upcoming[i - 1];
    const curr = upcoming[i];
    if (prev.shiftType === curr.shiftType) continue;
    const daysUntil = differenceInDays(curr.start, today);

    if (prev.shiftType === 'day' && curr.shiftType === 'night') {
      return { type: 'day-to-night', daysUntil,
        consecutiveNights: consecutiveNightsForDate(shifts, curr.start) };
    }
    if (prev.shiftType === 'night' && curr.shiftType === 'day') {
      return { type: 'night-to-day', daysUntil, consecutiveNights: 0 };
    }
    if (prev.shiftType === 'evening' && curr.shiftType === 'night') {
      return { type: 'evening-to-night', daysUntil,
        consecutiveNights: consecutiveNightsForDate(shifts, curr.start) };
    }
    if (prev.shiftType === 'day' && curr.shiftType === 'evening') {
      return { type: 'day-to-evening', daysUntil, consecutiveNights: 0 };
    }
  }

  return { type: 'none', daysUntil: 999, consecutiveNights: 0 };
}

// ─── detectAllTransitions ──────────────────────────────────────────────────────

/**
 * Scan ALL shift-type boundaries in the 14-day window, sorted by daysUntil ascending.
 * Each entry carries its consecutive-night count (for the mode gate).
 */
export function detectAllTransitions(
  shifts: ShiftEvent[],
  today: Date,
): TransitionDetection[] {
  const windowEnd = addDays(today, 14);
  const todayStart = startOfDay(today);
  const upcoming = shifts
    .filter((s) => s.start >= todayStart && s.start <= windowEnd)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (upcoming.length === 0) return [];

  const results: TransitionDetection[] = [];
  const reportedShiftIds = new Set<string>();

  const nightShifts = upcoming.filter((s) => s.shiftType === 'night');
  for (const nightShift of nightShifts) {
    const nightDay = differenceInDays(nightShift.start, today);
    const nightBefore = upcoming.find(
      (s) => s !== nightShift && s.shiftType === 'night' &&
        differenceInDays(nightShift.start, s.start) > 0 &&
        differenceInDays(nightShift.start, s.start) <= 5,
    );
    const nightAfter = upcoming.find(
      (s) => s !== nightShift && s.shiftType === 'night' &&
        differenceInDays(s.start, nightShift.start) > 0 &&
        differenceInDays(s.start, nightShift.start) <= 5,
    );
    const nonNightBefore = upcoming.find(
      (s) => s !== nightShift && s.shiftType !== 'night' && s.start < nightShift.start,
    );
    const nonNightAfter = upcoming.find(
      (s) => s !== nightShift && s.shiftType !== 'night' && s.start > nightShift.start,
    );
    if (!nightBefore && !nightAfter && nonNightBefore && nonNightAfter) {
      results.push({ type: 'isolated-night', daysUntil: nightDay, consecutiveNights: 1 });
      reportedShiftIds.add(nightShift.id);
    }
  }

  for (let i = 1; i < upcoming.length; i++) {
    const prev = upcoming[i - 1];
    const curr = upcoming[i];
    if (reportedShiftIds.has(prev.id) || reportedShiftIds.has(curr.id)) continue;
    if (prev.shiftType === curr.shiftType) continue;

    const daysUntil = differenceInDays(curr.start, today);
    let type: TransitionType | null = null;
    let consecutiveNights = 0;

    if (prev.shiftType === 'day' && curr.shiftType === 'night') {
      type = 'day-to-night';
      consecutiveNights = consecutiveNightsForDate(shifts, curr.start);
    } else if (prev.shiftType === 'night' && curr.shiftType === 'day') {
      type = 'night-to-day';
    } else if (prev.shiftType === 'evening' && curr.shiftType === 'night') {
      type = 'evening-to-night';
      consecutiveNights = consecutiveNightsForDate(shifts, curr.start);
    } else if (prev.shiftType === 'day' && curr.shiftType === 'evening') {
      type = 'day-to-evening';
    }

    if (type !== null) results.push({ type, daysUntil, consecutiveNights });
  }

  results.sort((a, b) => a.daysUntil - b.daysUntil);
  return results;
}

// ─── buildProtocol ─────────────────────────────────────────────────────────────

/**
 * Build one ProtocolDayTarget per ramp day. Each per-day delta gets the chronotype
 * modifier and is then clampDailyShift()'d to the physiological ceiling, so no target
 * can ever encode a clock move the body cannot make.
 */
function rampTargets(
  numDays: number,
  perDayRaw: number,
  chronotype: Chronotype,
  firstDate: Date,
  light: (dayIndex: number, cumulative: number) => string,
  napFor?: (dayIndex: number) => string | undefined,
): ProtocolDayTarget[] {
  const targets: ProtocolDayTarget[] = [];
  let cumulative = 0;
  for (let i = 0; i < numDays; i++) {
    const delta = clampDailyShift(applyChronotypeMod(perDayRaw, chronotype));
    cumulative += delta;
    targets.push({
      date: addDays(firstDate, i),
      bedtimeAdjustMinutes: cumulative,
      lightGuidance: light(i, cumulative),
      napGuidance: napFor ? napFor(i) : undefined,
    });
  }
  return targets;
}

/**
 * Build a CircadianProtocol with daily bedtime targets for the given transition.
 *
 * The consecutive-night gate (R1) decides everything for night-bound transitions:
 * a 1-3 night block produces a Hold protocol (bedtimeAdjustMinutes 0 — no clock shift);
 * a ≥4 night block produces an Adapt protocol (a capped, partial delay ramp).
 */
export function buildProtocol(
  transition: TransitionDetection,
  today: Date,
  chronotype: Chronotype,
): CircadianProtocol {
  const { type, daysUntil, consecutiveNights } = transition;
  const dailyTargets: ProtocolDayTarget[] = [];

  const isNightBound =
    type === 'day-to-night' || type === 'evening-to-night' || type === 'isolated-night';
  const mode: TransitionMode = isNightBound ? selectMode(consecutiveNights) : 'adapt';

  switch (type) {
    case 'day-to-night': {
      if (daysUntil <= 3) {
        const delayNote = chronotypeLightNote(chronotype, true);
        if (mode === 'hold') {
          // R1 Hold — 1-3 night block, do NOT shift the clock.
          dailyTargets.push({
            date: addDays(today, daysUntil),
            bedtimeAdjustMinutes: 0,
            lightGuidance:
              'Short night block — hold your normal day schedule. Use bright light for ALERTNESS through the whole shift (this is not a clock-shift). Dark sunglasses on the commute home.',
            napGuidance: '90-min prophylactic nap ending 30+ min before shift',
          });
        } else {
          // R1 Adapt — ≥4 nights, partial delay toward the compromise phase.
          dailyTargets.push(
            ...rampTargets(3, 90, chronotype, addDays(today, daysUntil - 3),
              (i) => i === 0
                ? `Avoid bright light before noon. Dim lights after 9 PM.${delayNote}`
                : i === 1
                ? `Blue-blockers after 8 PM. No screens after 10 PM.${delayNote}`
                : `Optional: 0.3-0.5 mg melatonin ~30 min before target sleep as an onset aid — light timing, not melatonin, is the clock-shift lever. Blackout curtains.${delayNote}`,
              (i) => (i === 2 ? '90-min prophylactic nap ending 30+ min before shift' : undefined),
            ),
          );
        }
      }
      break;
    }

    case 'night-to-day': {
      // Phase advance (recovery). Per-day delta capped at −60 min (advance ceiling).
      const advanceNote = chronotypeLightNote(chronotype, false);
      dailyTargets.push(
        ...rampTargets(3, -60, chronotype, addDays(today, daysUntil + 1),
          (i) => i === 0
            ? `Seek outdoor bright light immediately on waking.${advanceNote}`
            : i === 1
            ? `Seek outdoor bright light immediately on waking. Avoid naps after 3 PM.${advanceNote}`
            : 'Normal window ± 30 min. Full re-entrainment begins.',
          (i) => (i === 0
            ? '4h anchor recovery nap (not full sleep — preserves next-night drive)'
            : undefined),
        ),
      );
      break;
    }

    case 'evening-to-night': {
      const delayNote = chronotypeLightNote(chronotype, true);
      if (mode === 'hold') {
        dailyTargets.push({
          date: addDays(today, daysUntil),
          bedtimeAdjustMinutes: 0,
          lightGuidance:
            'Short night block — hold your schedule. Bright light for alertness through the shift; dark sunglasses on the commute home.',
          napGuidance: 'Prophylactic nap recommended — 20-90 min in early evening',
        });
      } else {
        dailyTargets.push(
          ...rampTargets(2, 90, chronotype, addDays(today, daysUntil - 2),
            (i) => (i === 0
              ? `Dim home lights after 9 PM.${delayNote}`
              : `No bright light after 8 PM.${delayNote}`),
            (i) => (i === 1
              ? 'Prophylactic nap recommended — 20-90 min in early evening'
              : undefined),
          ),
        );
      }
      break;
    }

    case 'day-to-evening': {
      dailyTargets.push(
        ...rampTargets(1, 60, chronotype, addDays(today, daysUntil - 1),
          () => 'Light exposure later in afternoon. Normal morning routine.',
        ),
      );
      break;
    }

    case 'isolated-night': {
      // A single isolated night is always Hold — never shift the clock for one night.
      dailyTargets.push({
        date: addDays(today, daysUntil),
        bedtimeAdjustMinutes: 0,
        lightGuidance:
          'Single night — hold your day schedule. Bright light for alertness the whole shift. Dark sunglasses on the commute home.',
        napGuidance: '90-min prophylactic nap ending 30+ min before shift',
      });
      break;
    }

    case 'none':
    default:
      break;
  }

  if (isNightBound) {
    circadianTelemetry.emit('circadian_protocol_selected', {
      mode,
      consecutiveNights,
      transitionType: type,
      targetCount: dailyTargets.length,
    });
  }

  return {
    transitionType: type,
    daysUntilTransition: daysUntil,
    dailyTargets,
  };
}
