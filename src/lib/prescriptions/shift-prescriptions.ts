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
