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
 * - Crowley et al. (2003) — chronotype modulates circadian shift rate
 * - NIOSH CDC anchor sleep protocol
 */

import { addDays, differenceInDays, startOfDay } from 'date-fns';
import type { ShiftEvent, Chronotype } from '../circadian/types';
import type {
  TransitionType,
  CircadianProtocol,
  ProtocolDayTarget,
} from './types';

// ─── Chronotype modifiers ──────────────────────────────────────────────────────

/**
 * Apply a chronotype modifier to a bedtime adjustment in minutes.
 *
 * Phase delay (shifting sleep later, positive adjustments) is ~1.5x easier
 * for late chronotypes and harder for early chronotypes, because early
 * chronotypes have a stronger homeostatic pull back to their natural phase.
 * Conversely, phase advance (shifting earlier, negative adjustments) is
 * easier for early types.
 *
 * References:
 * - Eastman & Burgess (2009) — phase delay vs advance asymmetry
 * - Crowley et al. (2003) — chronotype modulates shift rate
 *
 * Modifier: ±15% (early/late), 0% (intermediate).
 * Result is rounded to nearest 15 min for practical usability.
 */
function applyChronotypeMod(
  adjustMinutes: number,
  chronotype: Chronotype,
): number {
  if (chronotype === 'intermediate') return adjustMinutes;

  const isDelay = adjustMinutes > 0;

  let factor: number;
  if (chronotype === 'early') {
    // Early types fight delays (harder), assist advances (easier)
    factor = isDelay ? 1.15 : 0.85;
  } else {
    // Late types assist delays (easier), fight advances (harder)
    factor = isDelay ? 0.85 : 1.15;
  }

  const raw = adjustMinutes * factor;
  // Round to nearest 15 minutes
  return Math.round(raw / 15) * 15;
}

/**
 * Build chronotype-specific light guidance addendum.
 * Returns an empty string for intermediate (no change to base text).
 */
function chronotypeLightNote(chronotype: Chronotype, isDelay: boolean): string {
  if (chronotype === 'intermediate') return '';
  if (chronotype === 'early' && isDelay) {
    return ' Your early chronotype makes night shifts harder. Extra discipline on light avoidance after 8 PM.';
  }
  if (chronotype === 'late' && isDelay) {
    return ' Your late chronotype gives you a natural advantage for night shifts.';
  }
  return '';
}

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
 * Dates are computed as offsets from today. Chronotype adjusts the
 * magnitude of bedtime shifts: early chronotypes fight delays harder
 * (±15%), late chronotypes shift more easily in the delay direction.
 *
 * References:
 * - Eastman & Burgess (2009) — phase delay vs advance asymmetry
 * - Crowley et al. (2003) — chronotype modulates shift rate
 */
export function buildProtocol(
  transition: { type: TransitionType; daysUntil: number },
  today: Date,
  chronotype: Chronotype,
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
        const delayNote = chronotypeLightNote(chronotype, true);

        dailyTargets.push({
          date: addDays(today, base - 3),
          bedtimeAdjustMinutes: applyChronotypeMod(90, chronotype),
          lightGuidance:
            `Avoid bright light before noon. Dim lights after 9 PM.${delayNote}`,
        });
        dailyTargets.push({
          date: addDays(today, base - 2),
          bedtimeAdjustMinutes: applyChronotypeMod(180, chronotype),
          lightGuidance:
            `Blue-blockers after 8 PM. No screens after 10 PM.${delayNote}`,
        });
        dailyTargets.push({
          date: addDays(today, base - 1),
          bedtimeAdjustMinutes: applyChronotypeMod(270, chronotype),
          lightGuidance:
            `Melatonin 0.5mg at new target bedtime. Blackout curtains.${delayNote}`,
          napGuidance:
            '90-min prophylactic nap ending 30+ min before shift',
        });
      }
      break;
    }

    case 'night-to-day': {
      // Targets start the morning after the last night shift (day +1 from transition)
      // Night-to-day is a phase advance (negative adjustment)
      const advanceNote = chronotypeLightNote(chronotype, false);

      dailyTargets.push({
        date: addDays(today, daysUntil + 1),
        bedtimeAdjustMinutes: applyChronotypeMod(-120, chronotype),
        lightGuidance:
          `Seek outdoor bright light immediately on waking.${advanceNote}`,
        napGuidance:
          '4h anchor recovery nap (not full sleep \u2014 preserves next-night drive)',
      });
      dailyTargets.push({
        date: addDays(today, daysUntil + 2),
        bedtimeAdjustMinutes: applyChronotypeMod(-240, chronotype),
        lightGuidance:
          `Seek outdoor bright light immediately on waking. Avoid naps after 3 PM.${advanceNote}`,
      });
      dailyTargets.push({
        date: addDays(today, daysUntil + 3),
        bedtimeAdjustMinutes: applyChronotypeMod(-360, chronotype),
        lightGuidance:
          'Normal window \u00b1 30 min. Full re-entrainment begins.',
      });
      break;
    }

    case 'evening-to-night': {
      const delayNote = chronotypeLightNote(chronotype, true);

      dailyTargets.push({
        date: addDays(today, daysUntil - 2),
        bedtimeAdjustMinutes: applyChronotypeMod(90, chronotype),
        lightGuidance: `Dim home lights after 9 PM.${delayNote}`,
      });
      dailyTargets.push({
        date: addDays(today, daysUntil - 1),
        bedtimeAdjustMinutes: applyChronotypeMod(180, chronotype),
        lightGuidance: `No bright light after 8 PM.${delayNote}`,
        napGuidance:
          'Prophylactic nap recommended \u2014 20-90 min in early evening',
      });
      break;
    }

    case 'day-to-evening': {
      dailyTargets.push({
        date: addDays(today, daysUntil - 1),
        bedtimeAdjustMinutes: applyChronotypeMod(60, chronotype),
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
