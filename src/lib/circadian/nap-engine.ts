/**
 * Strategic nap placement module.
 *
 * Naps are a critical tool for shift workers to manage sleep debt
 * and maintain alertness, especially during night shifts.
 *
 * Scientific basis:
 * - A 20-30 minute nap improves alertness without significant sleep inertia
 *   (Milner & Cote, 2009)
 * - Pre-shift "prophylactic" napping reduces fatigue during night shifts
 *   (Ruggiero & Redeker, 2014)
 * - Nap timing should avoid the "sleep inertia window" — waking from
 *   deep sleep (stages N3) causes 15-30 min of grogginess. Keep naps
 *   under 30 min OR extend to 90 min (full cycle) to avoid this.
 * - The circadian alertness dip at ~14:00-16:00 (post-lunch dip) is
 *   an ideal window for a short nap, even for day workers.
 *
 * References:
 * - Milner & Cote (2009) — Benefits of napping in healthy adults
 * - Ruggiero & Redeker (2014) — Napping and shift work
 * - AASM Clinical Practice Guidelines (2015)
 * - Ficca et al. (2010) — Nap and circadian rhythm
 */

import { addMinutes, addHours, isBefore, isAfter, setHours, setMinutes } from 'date-fns';
import type { ClassifiedDay, UserProfile, PlanBlock, CircadianPhase } from './types';
import { cbtMinDate } from './phase-model';
import { circadianTelemetry } from './telemetry';

/** On-shift nap: 25 min (mid of the 20-30 min evidence band). */
const ON_SHIFT_NAP_MINUTES = 25;
/** Sleep-inertia buffer after the on-shift nap (Hilditch et al.). */
const ON_SHIFT_INERTIA_BUFFER = 30;

/**
 * Flexible nap duration tiers.
 *
 * - power (20 min): below N2/N3 threshold — alertness boost, minimal inertia
 *   (Milner & Cote, 2009: 10-20 min maximises performance, avoids inertia)
 * - short (30 min): enters N2 for deeper rest, brief inertia possible
 * - full  (90 min): complete NREM/REM cycle — maximum restoration
 *
 * Sleep inertia buffers (time needed before performance-critical activity):
 * - power nap: 5 min
 * - short nap: 10 min
 * - full nap:  15 min
 */
export type NapDuration = 'power' | 'short' | 'full';

export const NAP_DURATIONS: Record<NapDuration, number> = {
  power: 20,
  short: 30,
  full: 90,
};

const INERTIA_BUFFER: Record<NapDuration, number> = {
  power: 5,
  short: 10,
  full: 15,
};

/** Legacy constants preserved for backward compatibility */
const NAP_SHORT = 25;  // Power nap: alertness boost, no inertia
const NAP_FULL_CYCLE = 90;  // Full sleep cycle: deep restoration

/**
 * Resolve the user's nap preference to a duration in minutes.
 *
 * profile.napPreference may be a boolean (legacy) or a NapDuration string.
 * - boolean true → use the caller-supplied legacyMinutes (preserves pre-existing behaviour)
 * - NapDuration string ('power' | 'short' | 'full') → use NAP_DURATIONS lookup
 *
 * Returns { durationMinutes, inertiaBufMinutes }.
 */
function resolveNapDuration(
  napPreference: boolean | string,
  legacyMinutes: number,
): { durationMinutes: number; inertiaBufMinutes: number } {
  if (typeof napPreference === 'string') {
    const tier = napPreference as NapDuration;
    if (tier === 'power' || tier === 'short' || tier === 'full') {
      return { durationMinutes: NAP_DURATIONS[tier], inertiaBufMinutes: INERTIA_BUFFER[tier] };
    }
  }
  // boolean true → use the legacy constant with 0 extra inertia buffer (legacy had no buffer concept)
  return { durationMinutes: legacyMinutes, inertiaBufMinutes: 0 };
}

/** Set a specific time on a date */
function setTime(date: Date, hours: number): Date {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return setMinutes(setHours(date, h), m);
}

/**
 * Check if a nap window conflicts with existing plan blocks.
 */
function hasConflict(
  napStart: Date,
  napEnd: Date,
  existingBlocks: PlanBlock[],
): boolean {
  return existingBlocks.some(
    (block) =>
      (isAfter(napStart, block.start) && isBefore(napStart, block.end)) ||
      (isAfter(napEnd, block.start) && isBefore(napEnd, block.end)) ||
      (isBefore(napStart, block.start) && isAfter(napEnd, block.end))
  );
}

/**
 * Build the on-shift nap (gap-analysis R8) — a 20-30 min nap targeted so the worker
 * clears sleep inertia right as the circadian nadir (estimated CBTmin) hits.
 *
 * Anchored to estimated CBTmin (A/B audit AF-11), not a literal 03:00 — and falls back
 * to ~65% through the shift when CBTmin lands outside the shift. Returns null when the
 * shift is too short to safely contain a nap with alert time on both sides.
 */
function buildOnShiftNap(
  shift: { start: Date; end: Date },
  dayId: string,
  existingBlocks: PlanBlock[],
  phase?: CircadianPhase,
): PlanBlock | null {
  const shiftMs = shift.end.getTime() - shift.start.getTime();
  if (shiftMs < 6 * 3600000) return null; // too short for a safe on-shift nap

  const earliestStart = addMinutes(shift.start, 60);
  const latestEnd = addMinutes(shift.end, -60);

  // Target: nap ends one inertia-buffer BEFORE estimated CBTmin.
  let napEnd: Date = phase
    ? addMinutes(cbtMinDate(phase, shift.start), -ON_SHIFT_INERTIA_BUFFER)
    : new Date(shift.start.getTime() + shiftMs * 0.65);
  let napStart = addMinutes(napEnd, -ON_SHIFT_NAP_MINUTES);

  // Fall back to ~65% through the shift when the CBTmin window is out of band.
  if (napStart.getTime() < earliestStart.getTime() || napEnd.getTime() > latestEnd.getTime()) {
    napEnd = new Date(shift.start.getTime() + shiftMs * 0.65);
    napStart = addMinutes(napEnd, -ON_SHIFT_NAP_MINUTES);
  }
  if (napStart.getTime() < earliestStart.getTime() || napEnd.getTime() > latestEnd.getTime()) {
    return null;
  }
  if (hasConflict(napStart, napEnd, existingBlocks)) return null;

  circadianTelemetry.emit('circadian_caffeine_nap_suggested', {
    shiftLengthHours: Math.round((shiftMs / 3600000) * 10) / 10,
    napEndHour: napEnd.getHours() + napEnd.getMinutes() / 60,
  });

  return {
    id: `${dayId}-on-shift-nap`,
    type: 'nap',
    start: napStart,
    end: napEnd,
    label: 'On-Shift Nap',
    description:
      'A 25-min nap targeted at your circadian low — the deepest alertness dip of the shift. Set an alarm; keep it short to avoid grogginess. Caffeine-nap option: if your next real sleep is still 6+ hours away, take 150-200 mg caffeine right before lying down — it peaks (~20-30 min) just as you wake.',
    priority: 2,
  };
}

/**
 * Generate nap blocks for a classified day.
 *
 * Called AFTER sleep-windows has generated main sleep blocks.
 * Naps are placed in the gaps between sleep and shift blocks.
 *
 * @param phase Estimated circadian phase — anchors the on-shift nap to CBTmin.
 *
 * If shift starts in < 3 hours, forces 'power' nap regardless of preference
 * to avoid sleep inertia at shift start (Milner & Cote, 2009).
 */
export function generateNaps(
  day: ClassifiedDay,
  profile: UserProfile,
  existingBlocks: PlanBlock[],
  phase?: CircadianPhase,
): PlanBlock[] {
  if (!profile.napPreference) return [];

  const naps: PlanBlock[] = [];
  const date = day.date;
  const dayId = date.toISOString().slice(0, 10);

  switch (day.dayType) {
    case 'work-night': {
      // Pre-shift prophylactic nap: best bang-for-buck intervention for night shift alertness
      // (Ruggiero & Redeker, 2014)
      const shift = day.shift!;
      const leaveTime = addMinutes(shift.start, -profile.commuteDuration);

      // Force 'power' if shift starts within 3 hours — no time for a full cycle
      // and sleep inertia would impair performance at shift start (Milner & Cote, 2009)
      const timeToShiftMinutes = (shift.start.getTime() - date.getTime()) / 60000;
      const forcePower = timeToShiftMinutes < 180 && typeof profile.napPreference === 'string';

      const { durationMinutes, inertiaBufMinutes } = forcePower
        ? { durationMinutes: NAP_DURATIONS.power, inertiaBufMinutes: INERTIA_BUFFER.power }
        : resolveNapDuration(profile.napPreference, NAP_FULL_CYCLE);

      const napEnd = addMinutes(leaveTime, -(30 + inertiaBufMinutes));
      const napStart = addMinutes(napEnd, -durationMinutes);

      if (!hasConflict(napStart, napEnd, existingBlocks)) {
        naps.push({
          id: `${dayId}-pre-shift-nap`,
          type: 'nap',
          start: napStart,
          end: napEnd,
          label: 'Pre-Shift Nap',
          description: durationMinutes === 90
            ? 'Full 90-minute sleep cycle before your night shift. This is the #1 evidence-based intervention for night shift alertness.'
            : durationMinutes === 30
            ? '30-minute nap for deeper rest before your night shift. Set an alarm to avoid oversleeping.'
            : `${durationMinutes}-minute power nap before your night shift — alertness boost with minimal inertia.`,
          priority: 2,
        });
      } else {
        // The prophylactic pre-shift nap could not be placed (calendar conflict).
        // Warn instead of silently losing it — the main sleep block is then sized to
        // the full sleep need (R4), but the worker should know the nap was dropped.
        circadianTelemetry.emit('circadian_dropped_nap_warning', {
          dayType: 'work-night',
          reason: 'calendar-conflict',
        });
      }

      // On-shift nap at the circadian nadir (gap-analysis R8).
      const onShiftNap = buildOnShiftNap(shift, dayId, [...existingBlocks, ...naps], phase);
      if (onShiftNap) naps.push(onShiftNap);
      break;
    }

    case 'work-evening': {
      // Afternoon nap before an evening shift
      const shift = day.shift!;
      const leaveTime = addMinutes(shift.start, -profile.commuteDuration);

      const { durationMinutes: eveningDur, inertiaBufMinutes: eveningBuf } =
        resolveNapDuration(profile.napPreference, NAP_SHORT);
      // More buffer for evening shifts — need to arrive fully alert
      const napEnd = addMinutes(leaveTime, -(eveningBuf + 45));
      const napStart = addMinutes(napEnd, -eveningDur);

      if (!hasConflict(napStart, napEnd, existingBlocks)) {
        naps.push({
          id: `${dayId}-pre-shift-nap`,
          type: 'nap',
          start: napStart,
          end: napEnd,
          label: 'Power Nap',
          description: `${eveningDur}-minute nap. Set an alarm — do NOT oversleep into deep sleep or you will feel groggy.`,
          priority: 3,
        });
      }
      break;
    }

    case 'work-extended': {
      // Pre-shift nap before a 24h shift — bank sleep
      const shift = day.shift!;
      const leaveTime = addMinutes(shift.start, -profile.commuteDuration);

      const { durationMinutes: extDur, inertiaBufMinutes: extBuf } =
        resolveNapDuration(profile.napPreference, NAP_FULL_CYCLE);
      const napEnd = addMinutes(leaveTime, -(extBuf + 30));
      const napStart = addMinutes(napEnd, -extDur);

      if (!hasConflict(napStart, napEnd, existingBlocks)) {
        naps.push({
          id: `${dayId}-pre-shift-nap`,
          type: 'nap',
          start: napStart,
          end: napEnd,
          label: 'Sleep Banking Nap',
          description: `${extDur}-min nap to bank sleep before your extended shift. Critical for maintaining performance at hour 20+.`,
          priority: 2,
        });
      }
      break;
    }

    case 'transition-to-nights': {
      // Afternoon nap to begin delaying the sleep phase
      const napStart = setTime(date, 15); // 3:00 PM
      const { durationMinutes: transitionDur } =
        resolveNapDuration(profile.napPreference, NAP_FULL_CYCLE);
      const napEnd = addMinutes(napStart, transitionDur);

      if (!hasConflict(napStart, napEnd, existingBlocks)) {
        naps.push({
          id: `${dayId}-transition-nap`,
          type: 'nap',
          start: napStart,
          end: napEnd,
          label: 'Transition Nap',
          description: 'Afternoon nap to start shifting your clock. This extra rest buffers the sleep debt from tonight\'s delayed bedtime.',
          priority: 2,
        });
      }
      break;
    }

    case 'work-day': {
      // Post-lunch dip nap (if schedule allows)
      // The circadian alertness dip at ~14:00-16:00 is biologically real
      // Only if there's a gap between shift end and next commitment
      const shift = day.shift;
      if (shift) {
        const shiftEndHour = shift.end.getHours();
        // Only suggest if shift ends by early afternoon
        if (shiftEndHour <= 15) {
          const { durationMinutes: dayDur } =
            resolveNapDuration(profile.napPreference, NAP_SHORT);
          const napStart = setTime(date, 14); // 2:00 PM
          const napEnd = addMinutes(napStart, dayDur);

          if (!hasConflict(napStart, napEnd, existingBlocks)) {
            naps.push({
              id: `${dayId}-afternoon-nap`,
              type: 'nap',
              start: napStart,
              end: napEnd,
              label: 'Power Nap (Optional)',
              description: `Your body naturally dips in alertness around 2-3 PM. A quick ${dayDur}-min nap here boosts the rest of your day.`,
              priority: 3,
            });
          }
        }
      }
      break;
    }

    default:
      // No naps for off days or recovery (they get full sleep blocks)
      break;
  }

  return naps;
}
