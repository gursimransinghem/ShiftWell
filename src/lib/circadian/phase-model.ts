/**
 * Circadian Phase Model — R6-core (seed-sourced)
 *
 * Estimates where the user's body clock sits: an estimated DLMO (dim-light melatonin
 * onset) and CBTmin (core body temperature minimum), each carrying an explicit
 * confidence band. This is the structural spine the gap-analysis audit (G1) called for —
 * downstream light/nap/melatonin logic anchors to phase instead of to clock time.
 *
 * SCOPE (honest, per A/B audit AF-8): v1 ships the phase-model CORE — the estimator,
 * projection, and date resolvers — seeded from the 3-band chronotype enum, with an
 * optional user-tuned override. The wearable prediction-vs-actual refinement loop is a
 * documented v2 extension point (the `wearable-refined` source value).
 *
 * KEY RELATIONSHIPS (all verified against the literature, 2026-05-24):
 *   - CBTmin = DLMO + 7h        — Smith, Fogg & Eastman 2009 (PMC2768954). CANONICAL —
 *                                 CBTmin is ALWAYS derived from DLMO, never from wake.
 *   - DLMO  ≈ MSFsc − 6h        — Kantermann/Sung/Burgess 2015 (rough seed heuristic).
 *   - estimate carries ±2h      — Kantermann 2015: questionnaire→DLMO error is ~±2h
 *                                 (up to a 4h spread). Confidence is propagated, never 0.
 *
 * PURITY: this module is pure and deterministic — no Date.now(), no argument-free
 * `new Date()`. All calendar context is passed in. (A/B audit AF-9; audit M11.)
 */

import { addDays, startOfDay, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import type { Chronotype, CircadianPhase, UserProfile } from './types';
import { CHRONOTYPE_OFFSETS } from './types';
import { circadianTelemetry } from './telemetry';

/** Smith/Fogg/Eastman 2009 — the canonical DLMO→CBTmin interval. */
export const DLMO_TO_CBTMIN_HOURS = 7;
/** Kantermann 2015 — rough MSFsc→DLMO seed heuristic. */
const MSFSC_TO_DLMO_HOURS = 6;
/** ±2h questionnaire→DLMO uncertainty (Kantermann 2015). */
const SEED_CONFIDENCE_HOURS = 2.0;
/** A user-supplied/measured DLMO is tighter but still not exact. */
const TUNED_CONFIDENCE_HOURS = 1.0;
const MIN_CONFIDENCE_HOURS = 1.5;
const MAX_CONFIDENCE_HOURS = 4.0;
/** Uncertainty compounds ~0.5h per projected day. */
const CONFIDENCE_WIDEN_PER_DAY = 0.5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Wrap an hour value into [0, 24). dlmoHour/cbtMinHour are circular. */
export function mod24(hour: number): number {
  return ((hour % 24) + 24) % 24;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Sleep-corrected mid-sleep (an MSFsc proxy) from a chronotype's natural sleep window.
 * Circular midpoint — if wake reads "before" onset on the clock it is the next day.
 */
function midSleepFromChronotype(chronotype: Chronotype): number {
  const { naturalSleepOnset, naturalWake } = CHRONOTYPE_OFFSETS[chronotype];
  const wake = naturalWake < naturalSleepOnset ? naturalWake + 24 : naturalWake;
  return mod24((naturalSleepOnset + wake) / 2);
}

/** Set a fractional hour-of-day on a date (minute precision, zeroed seconds/ms). */
function setFractionalHour(date: Date, hour: number): Date {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return setMilliseconds(setSeconds(setMinutes(setHours(date, h), m), 0), 0);
}

/**
 * Resolve an hour-of-day to the concrete occurrence NEAREST a reference instant.
 * This removes all "which calendar day" ambiguity for small-hours phases relative to
 * a night shift that itself crosses midnight (A/B audit AF-7).
 */
function resolveNearestOccurrence(hour: number, reference: Date): Date {
  const base = startOfDay(reference);
  const refMs = reference.getTime();
  let best = setFractionalHour(base, hour);
  let bestDist = Math.abs(best.getTime() - refMs);
  for (const dayShift of [-1, 1]) {
    const candidate = setFractionalHour(addDays(base, dayShift), hour);
    const dist = Math.abs(candidate.getTime() - refMs);
    if (dist < bestDist) {
      best = candidate;
      bestDist = dist;
    }
  }
  return best;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * The baseline (un-shifted) circadian phase for a user.
 * Uses `profile.measuredDlmoHour` when present, otherwise seeds from chronotype.
 */
export function estimateBaselinePhase(profile: UserProfile): CircadianPhase {
  let phase: CircadianPhase;

  if (typeof profile.measuredDlmoHour === 'number') {
    const dlmoHour = mod24(profile.measuredDlmoHour);
    phase = {
      dlmoHour,
      cbtMinHour: mod24(dlmoHour + DLMO_TO_CBTMIN_HOURS),
      confidenceHours: TUNED_CONFIDENCE_HOURS,
      source: 'user-tuned',
    };
  } else {
    const msFsc = midSleepFromChronotype(profile.chronotype);
    const dlmoHour = mod24(msFsc - MSFSC_TO_DLMO_HOURS);
    phase = {
      dlmoHour,
      cbtMinHour: mod24(dlmoHour + DLMO_TO_CBTMIN_HOURS),
      confidenceHours: SEED_CONFIDENCE_HOURS,
      source: 'chronotype-seed',
    };
  }

  circadianTelemetry.emit('circadian_phase_estimated', {
    dlmoHour: round1(phase.dlmoHour),
    cbtMinHour: round1(phase.cbtMinHour),
    confidenceHours: phase.confidenceHours,
    source: phase.source,
  });

  return phase;
}

/**
 * Project a baseline phase forward by a cumulative shift (from the transition planner).
 * Positive minutes = phase delay (later). Confidence widens with each projected day.
 *
 * @param cumulativeShiftMinutes signed total shift applied to baseline DLMO
 * @param daysProjected number of days the projection spans (widens the band)
 */
export function projectPhase(
  baseline: CircadianPhase,
  cumulativeShiftMinutes: number,
  daysProjected: number,
): CircadianPhase {
  const dlmoHour = mod24(baseline.dlmoHour + cumulativeShiftMinutes / 60);
  const widened =
    baseline.confidenceHours + CONFIDENCE_WIDEN_PER_DAY * Math.max(0, daysProjected);
  return {
    dlmoHour,
    cbtMinHour: mod24(dlmoHour + DLMO_TO_CBTMIN_HOURS),
    confidenceHours: clamp(widened, MIN_CONFIDENCE_HOURS, MAX_CONFIDENCE_HOURS),
    source: baseline.source,
  };
}

/** The CBTmin occurrence nearest a reference instant (e.g. a night shift's start). */
export function cbtMinDate(phase: CircadianPhase, referenceInstant: Date): Date {
  return resolveNearestOccurrence(phase.cbtMinHour, referenceInstant);
}

/** The DLMO occurrence nearest a reference instant. */
export function dlmoDate(phase: CircadianPhase, referenceInstant: Date): Date {
  return resolveNearestOccurrence(phase.dlmoHour, referenceInstant);
}
