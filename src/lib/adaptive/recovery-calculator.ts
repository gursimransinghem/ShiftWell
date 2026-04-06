/**
 * Recovery Calculator
 *
 * Computes a 0–100 recovery score from a single night's HealthKit sleep record
 * and maps it to a traffic-light zone (green / yellow / red).
 *
 * Scientific basis:
 * - de Zambotti et al. (2019) — Apple Watch sleep staging validation
 * - Chinoy et al. (2021) — Apple Watch deep-sleep overestimation (~43 min)
 * - Ohayon et al. (2017) — Normative sleep stage percentages
 * - Berry et al. (2017) — AASM sleep stage scoring
 *
 * Deep sleep normative midpoint: ~20.5% of TST (Ohayon et al.)
 * REM normative midpoint: ~22.5% of TST (Ohayon et al.)
 *
 * Apple Watch correction:
 *   Deep sleep is overestimated by ~43 min on average.
 *   We subtract 43 min from the reported deepSleepMinutes (floor at 0)
 *   before computing the deep-sleep percentage.
 */

import type { SleepRecord } from '../healthkit/healthkit-service';

// ─── Constants ────────────────────────────────────────────────────────────────

const APPLE_WATCH_DEEP_CORRECTION_MINUTES = 43;
const DEEP_PCT_TARGET = 0.205; // 20.5% of TST
const REM_PCT_TARGET = 0.225;  // 22.5% of TST

// Score weights (must sum to 1.0)
const W_EFFICIENCY = 0.35;
const W_DEEP = 0.30;
const W_REM = 0.25;
const W_DURATION = 0.10;

// ─── computeRecoveryScore ─────────────────────────────────────────────────────

/**
 * Compute a 0–100 recovery score from a single sleep record.
 *
 * Returns null if the source is not an Apple Watch (unreliable stage data).
 * Returns 0 (not null) when totalSleepMinutes is 0 — avoids divide-by-zero.
 *
 * @param record   - Single night's aggregated HealthKit sleep record
 * @param sleepNeed - User's target sleep duration in hours (e.g. 7.5)
 */
export function computeRecoveryScore(
  record: SleepRecord,
  sleepNeed: number,
): number | null {
  // Only compute when Apple Watch data is present (reliable sleep staging)
  if (!record.source.includes('Apple Watch')) {
    return null;
  }

  const total = record.totalSleepMinutes;

  // Apply Apple Watch deep-sleep correction
  const correctedDeep = Math.max(
    0,
    record.deepSleepMinutes - APPLE_WATCH_DEEP_CORRECTION_MINUTES,
  );

  // ── Component 1: Sleep efficiency (0–1) ────────────────────────────────────
  const efficiencyScore = record.sleepEfficiency / 100;

  // ── Component 2: Deep sleep percentage score (0–1) ────────────────────────
  const deepPct = total > 0 ? correctedDeep / total : 0;
  const deepScore = Math.max(
    0,
    Math.min(1, 1 - Math.abs(deepPct - DEEP_PCT_TARGET) / DEEP_PCT_TARGET),
  );

  // ── Component 3: REM sleep percentage score (0–1) ─────────────────────────
  const remPct = total > 0 ? record.remSleepMinutes / total : 0;
  const remScore = Math.max(
    0,
    Math.min(1, 1 - Math.abs(remPct - REM_PCT_TARGET) / REM_PCT_TARGET),
  );

  // ── Component 4: Duration score (0–1, capped at 1) ────────────────────────
  const durationScore = Math.min(1.0, total / 60 / sleepNeed);

  // ── Weighted composite → 0–100 ────────────────────────────────────────────
  const raw =
    (efficiencyScore * W_EFFICIENCY +
      deepScore * W_DEEP +
      remScore * W_REM +
      durationScore * W_DURATION) *
    100;

  return Math.max(0, Math.min(100, Math.round(raw)));
}

// ─── scoreToZone ──────────────────────────────────────────────────────────────

/**
 * Map a numeric recovery score to a traffic-light zone.
 *
 * green  ≥ 67 — well-recovered, proceed normally
 * yellow  34–66 — moderate recovery, consider reducing intensity
 * red    < 34 — poor recovery, rest or light duty only
 */
export function scoreToZone(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 67) return 'green';
  if (score >= 34) return 'yellow';
  return 'red';
}
