/**
 * Light exposure and avoidance protocol.
 *
 * Light is the most powerful zeitgeber for the circadian clock. The human light
 * phase-response curve (Khalsa et al. 2003) pivots on CBTmin: light BEFORE CBTmin
 * delays the clock, light AFTER CBTmin advances it.
 *
 * v1 hardening (gap-analysis R7): the night-shift light sequence is now
 *   - ANCHORED TO ESTIMATED CBTmin, not to "half the shift". Bright light runs until
 *     3h before CBTmin (the 3h buffer absorbs the ±2h phase-estimate error so light
 *     never crosses CBTmin and reverses the intended delay).
 *   - GATED ON TRANSITION MODE. In Hold mode (a 1-3 night block the worker is NOT
 *     adapting to) bright light stays up the WHOLE shift — purely for alertness — and
 *     there is no delay-oriented dimming.
 *
 * References:
 * - Khalsa et al. (2003) — human light phase-response curve
 * - Eastman & Burgess (2009) — practical light/dark schedules
 * - Working Time Society 2019 consensus — light interventions
 * - Luna-Rangel et al. (2025) — blue-blocking glasses meta-analysis (no sleep benefit)
 */

import { addMinutes, addHours } from 'date-fns';
import type { ClassifiedDay, UserProfile, PlanBlock, CircadianPhase } from './types';
import { cbtMinDate } from './phase-model';
import type { TransitionMode } from './transition-planner';

/** Bright light must stop this long before CBTmin for a clean phase delay (Khalsa 2003;
 *  3h, not 2h, so the ±2h phase-estimate error cannot push light past CBTmin). */
const BRIGHT_LIGHT_PRE_CBTMIN_MINUTES = 180;

/**
 * Generate light exposure/avoidance blocks for a classified day.
 *
 * @param phase Estimated circadian phase — when provided, the work-night bright-light
 *   cutoff is anchored to CBTmin. When omitted, falls back to the shift midpoint.
 * @param mode Transition mode for a work-night day. 'hold' → bright light all shift
 *   (alertness only, no dimming). 'adapt' / undefined → delay-oriented CBTmin sequence.
 */
export function generateLightProtocol(
  day: ClassifiedDay,
  profile: UserProfile,
  sleepBlocks: PlanBlock[],
  phase?: CircadianPhase,
  mode?: TransitionMode,
): PlanBlock[] {
  const blocks: PlanBlock[] = [];
  const date = day.date;
  const dayId = date.toISOString().slice(0, 10);

  const mainSleepBlocks = sleepBlocks.filter((b) => b.type === 'main-sleep');
  if (mainSleepBlocks.length === 0) return blocks;

  const firstSleep = mainSleepBlocks[0];
  const lastSleep = mainSleepBlocks[mainSleepBlocks.length - 1];

  switch (day.dayType) {
    case 'work-night': {
      const shift = day.shift!;

      // After waking from daytime sleep: avoid bright light, wear dark sunglasses out.
      const wakeTime = firstSleep.end;
      blocks.push({
        id: `${dayId}-light-avoid-wake`,
        type: 'light-avoid',
        start: wakeTime,
        end: addHours(wakeTime, 1),
        label: 'Avoid Bright Light',
        description:
          'Keep lights dim after waking. If you go outside, wear dark sunglasses. Bright light now would fight tonight’s plan.',
        priority: 3,
      });

      if (mode === 'hold') {
        // HOLD — 1-3 night block. Bright light the whole shift, for ALERTNESS only.
        blocks.push({
          id: `${dayId}-light-seek-shift`,
          type: 'light-seek',
          start: shift.start,
          end: shift.end,
          label: 'Bright Light (Alertness)',
          description:
            'Keep your work area bright the entire shift. This is for alertness — on a short night block you are holding your day schedule, not shifting your clock.',
          priority: 3,
        });
      } else {
        // ADAPT (or unknown) — delay-oriented sequence anchored to estimated CBTmin.
        const brightEnd = phase
          ? addMinutes(cbtMinDate(phase, shift.start), -BRIGHT_LIGHT_PRE_CBTMIN_MINUTES)
          : addMinutes(
              shift.start,
              (shift.end.getTime() - shift.start.getTime()) / 2 / 60000,
            );

        if (brightEnd.getTime() <= shift.start.getTime()) {
          // CBTmin so early the bright-light window has already closed — all dim.
          blocks.push({
            id: `${dayId}-light-avoid-shift`,
            type: 'light-avoid',
            start: shift.start,
            end: shift.end,
            label: 'Dim Light (Work)',
            description:
              'Your estimated body-clock low is early tonight — keep light low the whole shift and use task lighting only.',
            priority: 3,
          });
        } else {
          const seekEnd =
            brightEnd.getTime() < shift.end.getTime() ? brightEnd : shift.end;
          blocks.push({
            id: `${dayId}-light-seek-shift`,
            type: 'light-seek',
            start: shift.start,
            end: seekEnd,
            label: 'Bright Light (Work)',
            description:
              'Keep your work area as bright as possible until about 3h before your estimated body-clock low. This drives a clean phase delay.',
            priority: 3,
          });
          if (brightEnd.getTime() < shift.end.getTime()) {
            blocks.push({
              id: `${dayId}-light-avoid-shift`,
              type: 'light-avoid',
              start: brightEnd,
              end: shift.end,
              label: 'Dim Light (Work)',
              description:
                'Reduce light now — you are within ~3h of your body-clock low. Bright light past it would advance your clock the wrong way. Task lighting only.',
              priority: 3,
            });
          }
        }
      }

      // Commute home: dark wraparound sunglasses (NOT amber blue-blockers, which pass
      // too much light — gap-analysis G6).
      blocks.push({
        id: `${dayId}-light-avoid-commute`,
        type: 'light-avoid',
        start: shift.end,
        end: addMinutes(shift.end, profile.commuteDuration),
        label: 'Dark Sunglasses (Commute)',
        description:
          'Wear dark, wraparound sunglasses on the way home. Morning daylight is the single biggest cause of failed daytime sleep — block it hard.',
        priority: 2,
      });
      break;
    }

    case 'transition-to-nights': {
      blocks.push({
        id: `${dayId}-light-seek-evening`,
        type: 'light-seek',
        start: addHours(lastSleep.start, -4),
        end: addHours(lastSleep.start, -2),
        label: 'Bright Light (Evening)',
        description:
          'Seek bright light in the evening to start delaying your clock. Go outside or use a light therapy lamp (>2500 lux).',
        priority: 2,
      });
      blocks.push({
        id: `${dayId}-light-avoid-pre-sleep`,
        type: 'light-avoid',
        start: addHours(lastSleep.start, -2),
        end: lastSleep.start,
        label: 'Dim Light',
        description:
          'Dim all lights and screens. Melatonin onset begins ~2h before your target sleep time.',
        priority: 2,
      });
      break;
    }

    case 'recovery': {
      const recoveryWake = firstSleep.end;
      blocks.push({
        id: `${dayId}-light-seek-recovery`,
        type: 'light-seek',
        start: recoveryWake,
        end: addHours(recoveryWake, 2),
        label: 'Bright Light (Reset)',
        description:
          'Get outside in bright sunlight immediately after your recovery sleep. This is the most powerful signal to reset your clock back to a day schedule.',
        priority: 1,
      });
      break;
    }

    case 'work-day':
    case 'off': {
      const dayWake = lastSleep.end;
      blocks.push({
        id: `${dayId}-light-seek-morning`,
        type: 'light-seek',
        start: dayWake,
        end: addMinutes(dayWake, 30),
        label: 'Morning Light',
        description:
          'Get bright light within 30 min of waking. Go outside or open curtains wide. This anchors your circadian clock.',
        priority: 3,
      });
      const sleepOnset = lastSleep.start;
      blocks.push({
        id: `${dayId}-light-avoid-pre-sleep`,
        type: 'light-avoid',
        start: addHours(sleepOnset, -2),
        end: sleepOnset,
        label: 'Dim Light',
        description:
          'Dim screens and room lights before bed. (Amber blue-blocking glasses for screens have weak evidence — dimming the room and cutting screen time matter more.)',
        priority: 3,
      });
      break;
    }
  }

  return blocks;
}
