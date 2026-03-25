/**
 * Borbely Two-Process Energy Model — ShiftWell Implementation
 *
 * Ported from ULOS (ulos-engine/modules/energy_model.py).
 *
 * Predicts hourly alertness/energy (0–100) by combining two physiological
 * processes described by Alexander Borbely (1982):
 *
 *   Process S — Homeostatic sleep pressure
 *     Adenosine builds up in the brain during wakefulness (like filling a
 *     bathtub), making you progressively sleepier. Sleep drains it.
 *     Modeled as an exponential approach to a maximum, with time constant ~18h.
 *
 *   Process C — Circadian alertness signal
 *     Your body's internal 24.2-hour clock creates a wave of alertness,
 *     peaking around 4 PM and bottoming out around 4 AM. Night shift workers
 *     have a partially-shifted clock.
 *
 * Additional modifiers:
 *   - Recovery: Scales the overall prediction based on how well you recovered
 *   - Caffeine: Temporarily reduces perceived sleep pressure
 *   - Sleep debt: Carries over extra pressure from insufficient sleep
 *
 * References:
 *   - Borbely (1982). "A two process model of sleep regulation." Human Neurobiology.
 *   - Stone et al. (2021). "Prediction of shiftworker alertness." SLEEP.
 *   - Daan, Beersma & Borbely (1984). "Timing of human sleep." Am J Physiology.
 */

import type { ShiftType } from './types';
import type {
  EnergyPrediction,
  EnergyCurve,
  EnergyModelInput,
  CaffeineEntry,
  EnergyLabel,
} from './energy-types';

// ─── Model constants (from validated ULOS config) ────────────────────────────

/** Amplitude of the circadian wave — controls how much the clock contributes */
const CIRCADIAN_AMPLITUDE = 0.35;

/**
 * Free-running period of the human circadian pacemaker.
 * Slightly longer than 24h because the SCN runs slow without light cues.
 */
const CIRCADIAN_PERIOD_HOURS = 24.2;

/**
 * Time constant (tau) for sleep pressure build-up during wakefulness.
 * After ~18h awake, pressure is ~63% of maximum. After ~36h, ~86%.
 */
const TAU_WAKE_HOURS = 18.2;

/** Maximum homeostatic sleep pressure (normalized to 1.0) */
const S_MAX = 1.0;

/**
 * Recovery score that produces a neutral modifier (no effect).
 * Scores above this boost energy; below this reduce it.
 */
const RECOVERY_NEUTRAL = 50;

/**
 * Scale factor for the recovery modifier.
 * Chosen so that score 100 → +0.3 and score 0 → -0.3.
 * Math: (100 - 50) / 167 ≈ 0.30; (0 - 50) / 167 ≈ -0.30
 */
const RECOVERY_SCALE = 167;

/** Default caffeine half-life in hours (population average) */
const CAFFEINE_HALF_LIFE_HOURS = 5.0;

/**
 * Sigmoid steepness factor for the 0–100 normalization.
 * Controls how quickly the score moves through the middle range.
 * Lower values = flatter; higher values = steeper S-curve.
 */
const SIGMOID_STEEPNESS = 3.5;

/** Energy zone thresholds (matching ULOS config) */
const HIGH_THRESHOLD = 70;
const MODERATE_THRESHOLD = 50;
const LOW_THRESHOLD = 30;

// ─── Process C: Circadian signal ──────────────────────────────────────────────

/**
 * Compute the circadian alertness signal (Process C) for a given time of day.
 *
 * This models the body clock as a cosine wave with a 24.2-hour period:
 * - Peak alertness around 4 PM (the "afternoon peak")
 * - Deepest trough around 3–5 AM (the "circadian nadir" — worst time to be awake)
 * - A secondary dip around 1–3 PM (the famous post-lunch drowsiness — it's real biology,
 *   not caused by food; it exists even in fasted individuals)
 *
 * @param hourOfDay - Time as fractional hours, 0–24 (e.g., 14.5 = 2:30 PM)
 * @param acrophaseHour - Hour of peak circadian alertness (default 16 = 4 PM)
 * @returns Signal value, roughly –0.35 to +0.35
 */
export function circadianSignal(hourOfDay: number, acrophaseHour = 16.0): number {
  // Main wave: 24.2-hour cosine centered at the acrophase
  const phase = (2 * Math.PI * (hourOfDay - acrophaseHour)) / CIRCADIAN_PERIOD_HOURS;
  const mainSignal = CIRCADIAN_AMPLITUDE * Math.cos(phase);

  // Secondary harmonic: 12-hour cosine with trough at ~2 PM
  // Creates the "two peaks" pattern seen in human performance data
  const dipPhase = (2 * Math.PI * (hourOfDay - 14.0)) / 12.0;
  const dipSignal = 0.08 * Math.cos(dipPhase);

  return mainSignal - dipSignal;
}

// ─── Process S: Homeostatic sleep pressure ────────────────────────────────────

/**
 * Compute homeostatic sleep pressure (Process S) based on time since last sleep.
 *
 * Models the build-up of adenosine during wakefulness as an exponential curve.
 * At 18h awake → ~63% of S_max (noticeably impaired)
 * At 24h awake → ~74% of S_max (significantly impaired)
 * At 36h awake → ~86% of S_max (severely impaired)
 *
 * @param hoursAwake - Hours since last sleep ended (0 = just woke up)
 * @returns Pressure from 0 (just woke up) to ~1.0 (extreme sleep deprivation)
 */
export function sleepPressure(hoursAwake: number): number {
  if (hoursAwake <= 0) return 0;
  return S_MAX * (1 - Math.exp(-hoursAwake / TAU_WAKE_HOURS));
}

// ─── Recovery modifier ────────────────────────────────────────────────────────

/**
 * Compute the recovery modifier from a 0–100 recovery score.
 *
 * Recovery reflects how well the body repaired overnight (HRV, resting HR,
 * sleep quality). A good night scales up predicted energy; a bad night scales
 * it down. Maps linearly:
 *   Score 100 → +0.30 (everything feels better)
 *   Score  50 →  0.00 (neutral — no modifier)
 *   Score   0 → –0.30 (everything feels worse)
 *
 * @param recoveryScore - Recovery score 0–100 (from WHOOP, HealthKit HRV, etc.)
 * @returns Modifier from roughly –0.30 to +0.30
 */
export function recoveryModifier(recoveryScore: number): number {
  return (recoveryScore - RECOVERY_NEUTRAL) / RECOVERY_SCALE;
}

// ─── Caffeine effect ──────────────────────────────────────────────────────────

/**
 * Compute the current caffeine stimulant effect from one or more doses.
 *
 * Caffeine works by blocking adenosine receptors — it doesn't eliminate
 * sleep pressure, just masks it temporarily. Each dose decays with a
 * half-life of ~5 hours (varies 3–7h by individual).
 *
 * Reference amounts:
 *   Drip coffee (8 oz) ≈ 95mg | Espresso (1 oz) ≈ 63mg
 *   Energy drink (8 oz) ≈ 80mg | Green tea (8 oz) ≈ 28mg
 *
 * @param entries - Caffeine doses consumed today
 * @param atTime - The time to evaluate the caffeine level
 * @param halfLifeHours - Individual caffeine half-life (default 5h)
 * @returns Boost from 0 (no caffeine) to ~0.2 (maximum effect, capped)
 */
export function caffeineEffect(
  entries: CaffeineEntry[],
  atTime: Date,
  halfLifeHours = CAFFEINE_HALF_LIFE_HOURS,
): number {
  if (entries.length === 0) return 0;

  // Sum the remaining mg across all doses using exponential decay
  const totalRemainingMg = entries.reduce((sum, entry) => {
    const hoursElapsed =
      (atTime.getTime() - entry.consumedAt.getTime()) / 3_600_000;
    if (hoursElapsed < 0) return sum; // dose in the future — doesn't count yet
    return sum + entry.doseMg * Math.pow(0.5, hoursElapsed / halfLifeHours);
  }, 0);

  // Scale to energy modifier: ~100mg → 0.15 boost
  // Cap at 0.2 to prevent overclaiming caffeine's effect
  return Math.min(0.2, totalRemainingMg / 650);
}

// ─── Acrophase estimation ─────────────────────────────────────────────────────

/**
 * Estimate the hour of peak circadian alertness (the acrophase) based on
 * when the person woke up and what kind of shift they're working.
 *
 * For day-oriented schedules: peak is ~10 hours after waking.
 * (Wake at 7 AM → peak ~5 PM, which matches observed human performance data.)
 *
 * For night shift: the circadian clock partially shifts over multiple nights
 * (~1–2h per night). We use a conservative estimate assuming partial adaptation.
 * Full inversion takes 3–5 nights of consistent night work + light exposure.
 *
 * @param wakeHour - Hour of waking, 0–24 (fractional OK)
 * @param shiftType - Type of shift being worked today
 * @returns Hour of day (0–24) for peak circadian alertness
 */
export function calculateAcrophase(wakeHour: number, shiftType?: ShiftType): number {
  if (shiftType === 'night') {
    // Night shift: conservative partial adaptation — peak ~8h after wake
    // (not the full 10h shift, because most shift workers aren't fully adapted)
    return (wakeHour + 8) % 24;
  }
  // Day, evening, extended, or unknown: classic 10h post-wake peak
  return (wakeHour + 10) % 24;
}

// ─── Score normalization ──────────────────────────────────────────────────────

/**
 * Map a raw combined score to a 0–100 scale using a sigmoid transformation.
 *
 * Raw scores typically range from about –1.3 (worst case: high sleep pressure,
 * circadian nadir, low recovery) to +0.7 (best case: low pressure, peak
 * circadian, full recovery + caffeine).
 *
 * The sigmoid (S-curve) maps this range to 0–100 smoothly, with the steepness
 * factor controlling how much contrast there is between states.
 *
 * @param raw - Combined raw score (unbounded float)
 * @returns Score from 0 to 100
 */
export function normalizeTo100(raw: number): number {
  const sigmoid = 1 / (1 + Math.exp(-SIGMOID_STEEPNESS * raw));
  return sigmoid * 100;
}

// ─── Zone labeling ────────────────────────────────────────────────────────────

/**
 * Convert a numeric score to a human-readable energy zone label.
 *
 * Thresholds:
 *   HIGH (≥70)     — Peak performance window; ideal for complex tasks
 *   MODERATE (≥50) — Functional; routine tasks OK
 *   LOW (≥30)      — Impaired; simple/familiar tasks only
 *   VERY_LOW (<30) — Dangerous for clinical work; rest/nap strongly recommended
 */
export function getEnergyLabel(score: number): EnergyLabel {
  if (score >= HIGH_THRESHOLD) return 'HIGH';
  if (score >= MODERATE_THRESHOLD) return 'MODERATE';
  if (score >= LOW_THRESHOLD) return 'LOW';
  return 'VERY_LOW';
}

// ─── Main prediction function ─────────────────────────────────────────────────

/**
 * Generate a complete hourly energy prediction curve from wake to sleep.
 *
 * This is the main function to call from the UI or other modules.
 * It combines all four components into a single energy score for each
 * time step between wakeTime and targetSleepTime:
 *
 *   raw(t) = circadianSignal(t)
 *            − sleepPressure(hoursAwake at t)
 *            + recoveryModifier(recoveryScore)
 *            + caffeineEffect(caffeineEntries, t)
 *            + debtModifier
 *
 *   score(t) = sigmoid(raw(t)) × 100
 *
 * Special adjustments:
 *   - Sleep inertia: score is dampened for the first hour post-wake
 *   - Floor/ceiling: score is clamped to [5, 95] (extreme values are rare)
 *
 * @param input - All parameters (see EnergyModelInput)
 * @returns EnergyCurve with predictions, peak/trough times, and summary stats
 *
 * @example
 * ```ts
 * const curve = predictEnergy({
 *   wakeTime: new Date('2026-03-15T07:00:00'),
 *   targetSleepTime: new Date('2026-03-15T23:00:00'),
 *   recoveryScore: 72,
 *   sleepHoursLastNight: 7.5,
 * });
 * console.log(`Peak at ${curve.peakTime}, score ${curve.peakScore}`);
 * ```
 */
export function predictEnergy(input: EnergyModelInput): EnergyCurve {
  const {
    wakeTime,
    targetSleepTime,
    recoveryScore,
    sleepHoursLastNight,
    caffeineEntries = [],
    shiftType,
    resolutionMinutes = 60,
  } = input;

  // Calculate the hour of peak circadian alertness for today
  const wakeHour = wakeTime.getHours() + wakeTime.getMinutes() / 60;
  const acrophase = calculateAcrophase(wakeHour, shiftType);

  // Sleep debt modifier: if you slept less than the WHOOP population baseline
  // (~7.63h), carry over extra sleep pressure. This reduces the day's energy
  // ceiling proportionally to the deficit.
  const sleepNeedBaseline = 7.63; // hours (WHOOP population average)
  const sleepDeficit = Math.max(0, sleepNeedBaseline - sleepHoursLastNight);
  const debtModifier = -0.1 * Math.min(sleepDeficit / sleepNeedBaseline, 1.0);

  // Recovery modifier is constant throughout the day
  const rMod = recoveryModifier(recoveryScore);

  const predictions: EnergyPrediction[] = [];
  const stepMs = resolutionMinutes * 60_000;
  let current = new Date(wakeTime);

  while (current.getTime() <= targetSleepTime.getTime()) {
    const hoursAwake =
      (current.getTime() - wakeTime.getTime()) / 3_600_000;
    const hourOfDay = current.getHours() + current.getMinutes() / 60;

    // Calculate each component separately (stored for UI transparency)
    const cSignal = circadianSignal(hourOfDay, acrophase);
    const sPressure = sleepPressure(hoursAwake);
    const caffBoost = caffeineEffect(caffeineEntries, current);

    // Combine and normalize
    const raw = cSignal - sPressure + rMod + caffBoost + debtModifier;
    let score = normalizeTo100(raw);

    // Sleep inertia: for the first hour after waking, alertness ramps up.
    // At t=0 (just woke up): 50% of predicted score.
    // At t=1h (fully awake): 100% of predicted score.
    // This reflects the grogginess of transitioning from deep sleep.
    if (hoursAwake < 1.0) {
      const inertiaFactor = 0.5 + 0.5 * hoursAwake;
      score *= inertiaFactor;
    }

    // Clamp to [5, 95] — extreme theoretical values are clinically meaningless
    score = Math.max(5, Math.min(95, score));
    score = Math.round(score * 10) / 10;

    predictions.push({
      time: new Date(current),
      score,
      label: getEnergyLabel(score),
      components: {
        circadian: Math.round(cSignal * 10_000) / 10_000,
        sleepPressure: Math.round(sPressure * 10_000) / 10_000,
        recovery: Math.round(rMod * 10_000) / 10_000,
        caffeine: Math.round(caffBoost * 10_000) / 10_000,
      },
    });

    current = new Date(current.getTime() + stepMs);
  }

  // Compute curve-level summary stats
  const scores = predictions.map((p) => p.score);
  const peakScore = scores.length > 0 ? Math.max(...scores) : 0;
  const troughScore = scores.length > 0 ? Math.min(...scores) : 0;
  const averageScore =
    scores.length > 0
      ? Math.round(
          (scores.reduce((s, v) => s + v, 0) / scores.length) * 10,
        ) / 10
      : 0;

  // Find the first prediction that matches the peak/trough score
  const peakPrediction = predictions.find((p) => p.score === peakScore) ?? null;
  const troughPrediction =
    predictions.find((p) => p.score === troughScore) ?? null;

  return {
    predictions,
    wakeTime: new Date(wakeTime),
    sleepTime: new Date(targetSleepTime),
    peakTime: peakPrediction?.time ?? null,
    troughTime: troughPrediction?.time ?? null,
    averageScore,
    peakScore,
  };
}

// ─── Utility: energy windows ──────────────────────────────────────────────────

/**
 * Find contiguous time windows where energy stays above (or below) a threshold.
 *
 * Useful for the UI to highlight:
 *   - High-focus windows (≥70): schedule demanding tasks here
 *   - Crash risk periods (<50): protect these with naps or light duty
 *
 * @param curve - Output from predictEnergy()
 * @param threshold - Score cutoff (e.g., 70 for high, 50 for low)
 * @param above - If true, finds windows ≥ threshold; if false, finds windows < threshold
 * @returns Array of {start, end} Date pairs for each contiguous window
 */
export function getEnergyWindows(
  curve: EnergyCurve,
  threshold: number,
  above = true,
): Array<{ start: Date; end: Date }> {
  const windows: Array<{ start: Date; end: Date }> = [];
  let windowStart: Date | null = null;

  for (const pred of curve.predictions) {
    const inWindow = above ? pred.score >= threshold : pred.score < threshold;

    if (inWindow && windowStart === null) {
      windowStart = pred.time;
    } else if (!inWindow && windowStart !== null) {
      windows.push({ start: windowStart, end: pred.time });
      windowStart = null;
    }
  }

  // Close any open window at the end
  if (windowStart !== null && curve.predictions.length > 0) {
    windows.push({
      start: windowStart,
      end: curve.predictions[curve.predictions.length - 1].time,
    });
  }

  return windows;
}
