/**
 * Shift Prescriptions — Phases 22 + 23
 *
 * Behavioral protocol functions for shift workers:
 *   1. Pre-shift nap reminder with timing (Phase 22)
 *   2. Caffeine cutoff calculation (Phase 22)
 *   3. Light exposure timing by shift type (Phase 22)
 *   4. Workout intensity suggestion by shift/recovery context (Phase 23)
 *   5. Meal plan generation by shift type (Phase 23)
 *
 * Scientific basis:
 *   - Milner & Cote (2009) — napping in shift workers, 90 min pre-shift nap
 *   - Drake et al. (2013) PMID:23370574 — caffeine timing and half-life (2x rule)
 *   - Eastman & Burgess (2009) PMID:19346453 — light exposure timing
 *   - Manoogian et al. (2022) — time-restricted eating for night workers
 *   - Chellappa et al. (2021) — daytime eating in night work
 */

import { calculateCaffeineCutoff as calcCutoffHour } from '@/src/lib/energy/energy-engine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PreShiftNapReminder {
  napTime: string;            // ISO time string for nap start
  napDurationMin: number;     // 90 min (Milner & Cote 2009)
  melatoninDoseMg: number;    // 0.5-1mg
  melatoninTimingMin: number; // minutes before nap start
}

export interface LightExposureRecommendation {
  timing: string;              // human-readable timing description
  durationMin: number;         // minutes of exposure
  direction: 'bright' | 'dim' | 'avoid'; // type of light
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addMinutesToISO(isoString: string, minutes: number): string {
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

function subtractMinutesFromISO(isoString: string, minutes: number): string {
  return addMinutesToISO(isoString, -minutes);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a pre-shift nap reminder.
 *
 * Rule: Start nap 5 hours before shift start, 90 min duration.
 * Melatonin: 0.5-1mg taken 30 min before nap start.
 *
 * Scientific basis:
 *   - Milner & Cote (2009): 90 min pre-shift nap improves alertness by 3.5h
 *   - Ruggiero & Redeker (2014): 5h pre-shift window avoids sleep inertia on shift start
 *   - Lewy et al. (2006): 0.5mg melatonin is pharmacologically equivalent to 5mg for sleep onset
 *
 * @param shiftStartISO ISO datetime of shift start
 */
export function generatePreShiftNapReminder(shiftStartISO: string): PreShiftNapReminder {
  const NAP_LEAD_HOURS = 5;
  const NAP_DURATION_MIN = 90;
  const MELATONIN_DOSE_MG = 0.5;
  const MELATONIN_LEAD_MIN = 30;

  const napStartISO = subtractMinutesFromISO(shiftStartISO, NAP_LEAD_HOURS * 60);
  const melatoninTimeISO = subtractMinutesFromISO(napStartISO, MELATONIN_LEAD_MIN);

  return {
    napTime: napStartISO,
    napDurationMin: NAP_DURATION_MIN,
    melatoninDoseMg: MELATONIN_DOSE_MG,
    melatoninTimingMin: MELATONIN_LEAD_MIN,
  };
}

/**
 * Calculate the last safe caffeine intake time before planned sleep.
 *
 * Uses 2x half-life rule: caffeine should be cleared to < 25% by sleep time.
 * Default half-life: 5 hours. Cutoff = plannedSleepTime - 2 * halfLife.
 *
 * Scientific basis:
 *   - Drake et al. (2013): caffeine taken 6h before bed reduces sleep by 1h
 *   - Landolt et al. (2004): 2x half-life reduces plasma levels to ~25%
 *
 * @param plannedSleepISO ISO datetime of planned sleep onset
 * @param halfLifeHours   Caffeine half-life in hours (default: 5h)
 * @returns ISO time string of last safe caffeine dose
 */
export function calculateCaffeineCutoff(
  plannedSleepISO: string,
  halfLifeHours = 5,
): string {
  const sleepDate = new Date(plannedSleepISO);
  const sleepHour = sleepDate.getHours() + sleepDate.getMinutes() / 60;

  // Use energy engine's hour-based cutoff calculation
  const cutoffHour = calcCutoffHour(sleepHour, halfLifeHours);

  // Map cutoff hour back to an ISO date
  // If cutoffHour < sleepHour, cutoff is same day as sleep
  // If cutoffHour > sleepHour, cutoff must be a day before
  const cutoffDate = new Date(plannedSleepISO);
  cutoffDate.setHours(Math.floor(cutoffHour), Math.round((cutoffHour % 1) * 60), 0, 0);

  if (cutoffDate > sleepDate) {
    // Wrapped around midnight — cutoff is actually the previous day
    cutoffDate.setDate(cutoffDate.getDate() - 1);
  }

  return cutoffDate.toISOString();
}

/**
 * Suggest light exposure timing for circadian adaptation.
 *
 * Strategy:
 *   - Day shift workers: bright morning light (6-8 AM) to maintain day alignment
 *   - Night shift workers: bright evening light (8-10 PM) to delay clock; avoid morning light
 *   - Evening shift workers: moderate evening light delay
 *
 * Scientific basis:
 *   - Eastman & Burgess (2009): evening bright light delays clock 1.5-2h/day
 *   - Czeisler et al. (1990): morning bright light is the dominant zeitgeber for day workers
 *   - Boivin & Boudreau (2014): structured light avoidance critical for night shift workers
 *
 * @param shiftType  'day' | 'evening' | 'night' | 'off'
 * @param sunriseISO ISO datetime of local sunrise
 * @param sunsetISO  ISO datetime of local sunset
 */
export function suggestLightExposure(
  shiftType: string,
  sunriseISO: string,
  sunsetISO: string,
): LightExposureRecommendation {
  switch (shiftType) {
    case 'night':
      // Night workers: seek bright light in evening to delay clock; avoid morning light
      return {
        timing: `Evening bright light 8–10 PM. Wear blue-blocking glasses after midnight.`,
        durationMin: 30,
        direction: 'bright',
      };

    case 'evening':
      // Evening workers: moderate delay — light in late afternoon/evening
      return {
        timing: `Seek bright light 5–7 PM. Dim all lights after 10 PM.`,
        durationMin: 20,
        direction: 'bright',
      };

    case 'day':
    default:
      // Day workers: morning bright light to reinforce day alignment
      return {
        timing: `Morning bright light within 30 min of waking. Seek sunlight or use a 10,000 lux lamp.`,
        durationMin: 30,
        direction: 'bright',
      };
  }
}

// ---------------------------------------------------------------------------
// Phase 23: Workout & Meal Planning
// ---------------------------------------------------------------------------

export type WorkoutIntensity = 'rest' | 'light' | 'moderate' | 'full';

export interface WorkoutSuggestion {
  intensity: WorkoutIntensity;
  durationMin: number;
  type: string;
  note: string;
}

export interface MealWindow {
  label: string;
  timeISO: string;
  macroFocus: string;
}

export interface MealPlan {
  meals: MealWindow[];
  mealPrepReminder?: string;
}

/**
 * Suggest workout intensity based on shift type, recovery position, and score.
 *
 * Rules (from SimVault fitness protocol):
 *   - Recovery Day 1 post-night: rest only — no exercise regardless of score
 *   - Night shift day: light only (walk, gentle stretch)
 *   - Low recovery score (< 50): light only
 *   - Good recovery (>= 70) on off days: full session (45-60 min)
 *   - Moderate recovery (50-69) or day/evening shift day: moderate (30-45 min)
 *
 * @param shiftType       'day' | 'evening' | 'night' | 'off' | 'extended'
 * @param isRecoveryDay1  True if today is the first day after completing a night block
 * @param recoveryScore   0-100 score from score-store, or null if not yet available
 */
export function suggestWorkout(
  shiftType: string,
  isRecoveryDay1: boolean,
  recoveryScore: number | null,
): WorkoutSuggestion {
  // Recovery Day 1 post-night: always rest
  if (isRecoveryDay1) {
    return {
      intensity: 'rest',
      durationMin: 0,
      type: 'Rest',
      note: 'First recovery day after nights — full rest. Light walk only if you feel well by evening.',
    };
  }

  // Night shift day: light only
  if (shiftType === 'night') {
    return {
      intensity: 'light',
      durationMin: 20,
      type: 'Walk or gentle stretch',
      note: 'Night shift day — light movement only. Save energy for your shift.',
    };
  }

  // Low recovery: light only
  if (recoveryScore !== null && recoveryScore < 50) {
    return {
      intensity: 'light',
      durationMin: 20,
      type: 'Walk or yoga',
      note: `Recovery score ${recoveryScore} — light session only. Prioritize sleep tonight.`,
    };
  }

  // Off day with good recovery: full session
  if (shiftType === 'off' && (recoveryScore === null || recoveryScore >= 70)) {
    return {
      intensity: 'full',
      durationMin: 50,
      type: 'Strength, cardio, or sport',
      note: recoveryScore !== null
        ? `Recovery score ${recoveryScore} — great day for a full training session.`
        : 'Off day — no restriction. Train as planned.',
    };
  }

  // Default: moderate
  const noteByShift =
    shiftType === 'day'
      ? 'Day shift — moderate workout after work or in the morning before shift.'
      : shiftType === 'evening'
      ? 'Evening shift — morning workout recommended before fatigue builds.'
      : 'Moderate session — listen to your body.';

  return {
    intensity: 'moderate',
    durationMin: 35,
    type: 'Cardio or moderate strength',
    note: noteByShift,
  };
}

/**
 * Generate a meal timing plan based on shift type.
 *
 * Scientific basis:
 *   - Manoogian et al. (2022): eating aligned to waking hours improves metabolic health
 *   - Chellappa et al. (2021): daytime eating reduces metabolic disruption for night workers
 *
 * @param shiftType     'day' | 'evening' | 'night' | 'off' | 'extended'
 * @param shiftStartISO ISO datetime of shift start (required for night shift timing)
 */
export function suggestMealPlan(
  shiftType: string,
  shiftStartISO: string | null,
): MealPlan {
  const refDate = shiftStartISO ? new Date(shiftStartISO) : new Date();
  const todayDate = refDate.toISOString().slice(0, 10);

  function isoAt(hour: number): string {
    const normalizedHour = ((hour % 24) + 24) % 24;
    const d = new Date(`${todayDate}T00:00:00`);
    d.setHours(Math.floor(normalizedHour), Math.round((normalizedHour % 1) * 60), 0, 0);
    return d.toISOString();
  }

  if (shiftType === 'night') {
    // Night shift meal timing: pre-shift (~5:30 PM), mid-shift (~midnight), late (~3 AM)
    // Scientific: front-load calories before the night work period
    const shiftStartDate = shiftStartISO ? new Date(shiftStartISO) : null;
    const shiftHour = shiftStartDate ? shiftStartDate.getHours() + shiftStartDate.getMinutes() / 60 : 19;
    const preShiftHour = shiftHour - 1.5;   // ~1.5h before shift
    const midShiftHour = shiftHour + 4;     // ~4h into shift
    const lateHour = shiftHour + 7;         // ~7h into shift

    return {
      meals: [
        {
          label: 'Pre-shift meal',
          timeISO: isoAt(preShiftHour),
          macroFocus: 'High protein + complex carbs (chicken, rice, vegetables)',
        },
        {
          label: 'Mid-shift meal',
          timeISO: isoAt(midShiftHour),
          macroFocus: 'Moderate protein + fiber (turkey wrap, salad)',
        },
        {
          label: 'Late-shift snack',
          timeISO: isoAt(lateHour),
          macroFocus: 'Light protein (Greek yogurt, nuts, boiled egg)',
        },
      ],
    };
  }

  if (shiftType === 'evening') {
    return {
      meals: [
        {
          label: 'Breakfast',
          timeISO: isoAt(7.5),
          macroFocus: 'Balanced — protein + complex carbs',
        },
        {
          label: 'Lunch',
          timeISO: isoAt(12.5),
          macroFocus: 'High protein + vegetables (main meal before shift)',
        },
        {
          label: 'Pre-shift snack',
          timeISO: isoAt(14.5),
          macroFocus: 'Light carbs for sustained energy (banana, oats)',
        },
      ],
    };
  }

  // Day shift or off day: standard timing
  return {
    meals: [
      {
        label: 'Breakfast',
        timeISO: isoAt(7),
        macroFocus: 'Protein + healthy fats to sustain morning energy',
      },
      {
        label: 'Lunch',
        timeISO: isoAt(12.5),
        macroFocus: 'Balanced macros — protein, carbs, vegetables',
      },
      {
        label: 'Dinner',
        timeISO: isoAt(18),
        macroFocus: 'High protein + vegetables, lighter carbs',
      },
    ],
  };
}

/**
 * Check if a meal prep reminder should be shown.
 *
 * Rule: Show reminder 4-5 days before an upcoming night block starts.
 *
 * @param upcomingNightBlockStartISO  ISO date of the first night shift in an upcoming block (or null)
 * @param todayISO                    Today's date ISO string
 * @returns Reminder text, or undefined if no reminder needed
 */
export function getMealPrepReminder(
  upcomingNightBlockStartISO: string | null,
  todayISO: string,
): string | undefined {
  if (!upcomingNightBlockStartISO) return undefined;

  const today = new Date(todayISO);
  const blockStart = new Date(upcomingNightBlockStartISO);
  const daysUntil = Math.floor((blockStart.getTime() - today.getTime()) / 86400000);

  if (daysUntil >= 4 && daysUntil <= 5) {
    const blockDateStr = blockStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Meal prep by ${blockDateStr} for upcoming night block`;
  }

  return undefined;
}
