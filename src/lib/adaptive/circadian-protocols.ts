/**
 * Circadian Protocols
 *
 * Detects upcoming shift transitions and builds day-by-day circadian
 * adjustment protocols (bedtime shifting, light guidance, nap timing).
 *
 * Scientific basis:
 * - Eastman & Burgess (2009) — circadian phase shifting for shift workers
 * - Czeisler et al. (1990) — bright light phase shifting
 * - Boivin & Boudreau (2014) — shift work interventions
 * - Milner & Cote (2009) — napping for shift workers
 * - NIOSH CDC anchor sleep protocol
 */

import { addDays, differenceInDays, startOfDay } from 'date-fns';
import type { ShiftEvent, Chronotype } from '../circadian/types';
import type {
  TransitionType,
  CircadianProtocol,
  ProtocolDayTarget,
} from './types';

// ─── detectTransition ──────────────────────────────────────────────────────────

/**
 * Scan upcoming shifts (next 14 days) and find the first shift-type boundary.
 *
 * Returns the transition type and how many days until the first shift of
 * the new type. Returns { type: 'none', daysUntil: 999 } when stable.
 */
export function detectTransition(
  shifts: ShiftEvent[],
  today: Date,
): { type: TransitionType; daysUntil: number } {
  const windowEnd = addDays(today, 14);

  // Filter to shifts starting within the next 14 days (from start of today), sorted ascending.
  // Use startOfDay so shifts that started earlier today are included.
  const todayStart = startOfDay(today);
  const upcoming = shifts
    .filter((s) => s.start >= todayStart && s.start <= windowEnd)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (upcoming.length === 0) {
    return { type: 'none', daysUntil: 999 };
  }

  // ── Step 1: Check for isolated-night ────────────────────────────────────────
  // A night shift is isolated when:
  //   (a) No other night shift appears within 5 days on either side, AND
  //   (b) There are non-night shifts on BOTH sides within the upcoming window.
  //       (If surrounded on only one side it could be the start of a night block.)
  const nightShifts = upcoming.filter((s) => s.shiftType === 'night');
  for (const nightShift of nightShifts) {
    const nightDay = differenceInDays(nightShift.start, today);

    // No other night shift within 5 days before
    const nightBefore = upcoming.find(
      (s) =>
        s !== nightShift &&
        s.shiftType === 'night' &&
        differenceInDays(nightShift.start, s.start) > 0 &&
        differenceInDays(nightShift.start, s.start) <= 5,
    );

    // No other night shift within 5 days after
    const nightAfter = upcoming.find(
      (s) =>
        s !== nightShift &&
        s.shiftType === 'night' &&
        differenceInDays(s.start, nightShift.start) > 0 &&
        differenceInDays(s.start, nightShift.start) <= 5,
    );

    // Non-night shift before this night shift
    const nonNightBefore = upcoming.find(
      (s) => s !== nightShift && s.shiftType !== 'night' && s.start < nightShift.start,
    );

    // Non-night shift after this night shift
    const nonNightAfter = upcoming.find(
      (s) => s !== nightShift && s.shiftType !== 'night' && s.start > nightShift.start,
    );

    if (!nightBefore && !nightAfter && nonNightBefore && nonNightAfter) {
      return { type: 'isolated-night', daysUntil: nightDay };
    }
  }

  // ── Step 2: Scan consecutive pairs for a shift-type boundary ────────────────
  for (let i = 1; i < upcoming.length; i++) {
    const prev = upcoming[i - 1];
    const curr = upcoming[i];

    if (prev.shiftType === curr.shiftType) continue;

    const daysUntil = differenceInDays(curr.start, today);

    // Map boundary pair to TransitionType
    if (prev.shiftType === 'day' && curr.shiftType === 'night') {
      return { type: 'day-to-night', daysUntil };
    }
    if (prev.shiftType === 'night' && curr.shiftType === 'day') {
      return { type: 'night-to-day', daysUntil };
    }
    if (prev.shiftType === 'evening' && curr.shiftType === 'night') {
      return { type: 'evening-to-night', daysUntil };
    }
    if (prev.shiftType === 'day' && curr.shiftType === 'evening') {
      return { type: 'day-to-evening', daysUntil };
    }
  }

  return { type: 'none', daysUntil: 999 };
}

// ─── buildProtocol ─────────────────────────────────────────────────────────────

/**
 * Build a CircadianProtocol with daily bedtime targets and guidance
 * for the given transition type.
 *
 * Dates are computed as offsets from today. The chronotype parameter
 * is accepted for future personalization; the current protocol targets
 * are derived from the scientific literature without per-chronotype
 * deviation (the shift direction is the same regardless of chronotype).
 */
export function buildProtocol(
  transition: { type: TransitionType; daysUntil: number },
  today: Date,
  _chronotype: Chronotype,
): CircadianProtocol {
  const { type, daysUntil } = transition;
  const dailyTargets: ProtocolDayTarget[] = [];

  switch (type) {
    case 'day-to-night': {
      // Only build active targets when within 3 days of the transition
      if (daysUntil <= 3) {
        // daysUntil is how many days until the night shift starts.
        // Day -3 relative to transition = today + (daysUntil - 3)
        const base = daysUntil;

        dailyTargets.push({
          date: addDays(today, base - 3),
          bedtimeAdjustMinutes: 90,
          lightGuidance:
            'Avoid bright light before noon. Dim lights after 9 PM.',
        });
        dailyTargets.push({
          date: addDays(today, base - 2),
          bedtimeAdjustMinutes: 180,
          lightGuidance:
            'Blue-blockers after 8 PM. No screens after 10 PM.',
        });
        dailyTargets.push({
          date: addDays(today, base - 1),
          bedtimeAdjustMinutes: 270,
          lightGuidance:
            'Melatonin 0.5mg at new target bedtime. Blackout curtains.',
          napGuidance:
            '90-min prophylactic nap ending 30+ min before shift',
        });
      }
      break;
    }

    case 'night-to-day': {
      // Targets start the morning after the last night shift (day +1 from transition)
      dailyTargets.push({
        date: addDays(today, daysUntil + 1),
        bedtimeAdjustMinutes: -120,
        lightGuidance:
          'Seek outdoor bright light immediately on waking.',
        napGuidance:
          '4h anchor recovery nap (not full sleep \u2014 preserves next-night drive)',
      });
      dailyTargets.push({
        date: addDays(today, daysUntil + 2),
        bedtimeAdjustMinutes: -240,
        lightGuidance:
          'Seek outdoor bright light immediately on waking. Avoid naps after 3 PM.',
      });
      dailyTargets.push({
        date: addDays(today, daysUntil + 3),
        bedtimeAdjustMinutes: -360,
        lightGuidance:
          'Normal window \u00b1 30 min. Full re-entrainment begins.',
      });
      break;
    }

    case 'evening-to-night': {
      dailyTargets.push({
        date: addDays(today, daysUntil - 2),
        bedtimeAdjustMinutes: 90,
        lightGuidance: 'Dim home lights after 9 PM.',
      });
      dailyTargets.push({
        date: addDays(today, daysUntil - 1),
        bedtimeAdjustMinutes: 180,
        lightGuidance: 'No bright light after 8 PM.',
        napGuidance:
          'Prophylactic nap recommended \u2014 20-90 min in early evening',
      });
      break;
    }

    case 'day-to-evening': {
      dailyTargets.push({
        date: addDays(today, daysUntil - 1),
        bedtimeAdjustMinutes: 60,
        lightGuidance:
          'Light exposure later in afternoon. Normal morning routine.',
      });
      break;
    }

    case 'isolated-night': {
      // Do not shift the clock for a single isolated night.
      // Provide only a nap target for the pre-shift day.
      dailyTargets.push({
        date: addDays(today, daysUntil),
        bedtimeAdjustMinutes: 0,
        lightGuidance:
          'Bright light first half of shift. Blue-blockers for commute home after.',
        napGuidance:
          '90-min prophylactic nap ending 30+ min before shift',
      });
      break;
    }

    case 'none':
    default:
      // Maintenance mode — no targets needed
      break;
  }

  return {
    transitionType: type,
    daysUntilTransition: daysUntil,
    dailyTargets,
  };
}
