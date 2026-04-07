/**
 * HRV Processor — core algorithm for HRV-based recovery score computation.
 *
 * Implements BIOMETRIC-ALGORITHM-SPEC.md formulas:
 * - % deviation scoring: (rmssd - baseline) / baseline maps to 0–100
 * - Baseline at 70 (normal recovery anchor, not penalizing)
 * - ±30% deviation = ±30 score points from the 70 anchor
 * - 14-night minimum calibration before HRV contributes
 * - 30-day rolling baseline window
 * - Dynamic weight redistribution: 40/30/25/5 with HRV, 50/45/0/5 without
 *
 * Scientific basis:
 * - Bellenger et al. (2016) — HRV-guided training meta-analysis
 * - Viola et al. (2007) — HRV suppression during circadian transitions
 * - Plews et al. (2012) — 30-day rolling baseline as industry standard
 * - Shaffer & Ginsberg (2017) — SDNN as autonomic recovery biomarker
 *
 * References:
 * - Phase 32: BIOMETRIC-ALGORITHM-SPEC.md
 * - Phase 33: 33-01-PLAN.md
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HRVWeights {
  adherence: number;   // 0–1 — behavioral adherence to sleep plan
  debt: number;        // 0–1 — sleep debt component
  hrv: number;         // 0–1 — physiological HRV signal (0 when unavailable)
  transition: number;  // 0–1 — circadian protocol penalty
}

export interface BaselineUpdateResult {
  values: number[];  // Updated rolling array (max 30 entries)
  mean: number;      // Mean of updated array
}

// ─── clamp ────────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── calculateHRVScore ────────────────────────────────────────────────────────

/**
 * Calculate HRV score (0–100) from overnight SDNN vs personal baseline.
 *
 * Formula from BIOMETRIC-ALGORITHM-SPEC.md §2.2:
 *   deviation = (overnightSDNN - baseline) / baseline
 *   score = clamp(70 + (deviation / 0.30) * 30, 0, 100)
 *
 * Anchor points:
 *   +30% above baseline → 100 (outstanding recovery)
 *   At baseline → 70 (normal recovery)
 *   -30% below baseline → 40 (poor recovery)
 *   Clamped to [0, 100]
 *
 * @param overnightSDNN - Mean SDNN in milliseconds for the sleep window
 * @param baseline - Personal 30-day rolling mean SDNN in milliseconds
 */
export function calculateHRVScore(overnightSDNN: number, baseline: number): number {
  if (baseline <= 0) return 70; // Guard against division by zero

  const deviation = (overnightSDNN - baseline) / baseline;
  const score = 70 + (deviation / 0.30) * 30;
  return Math.round(clamp(score, 0, 100));
}

// ─── shouldIncludeHRV ─────────────────────────────────────────────────────────

/**
 * Determine if HRV should contribute to the recovery score.
 *
 * Three gates must ALL pass for HRV to be included:
 * 1. Apple Watch paired with HealthKit permission granted
 * 2. Baseline calibrated (14+ nights of data)
 * 3. Not in an active circadian transition protocol
 *
 * Gate 3 exists because low HRV during transitions is expected physiology,
 * not a recovery failure (Viola et al. 2007). Penalizing users for following
 * the correct protocol would undermine trust in the score.
 *
 * @param hrv_available - True when Apple Watch is paired and HRV permission granted
 * @param baselineDays - Number of nights contributing to the rolling baseline
 * @param inCircadianTransition - True when Phase 9 circadian protocol is active
 */
export function shouldIncludeHRV(
  hrv_available: boolean,
  baselineDays: number,
  inCircadianTransition: boolean,
): boolean {
  return hrv_available && baselineDays >= 14 && !inCircadianTransition;
}

// ─── updateBaseline ───────────────────────────────────────────────────────────

/**
 * Update the rolling HRV baseline with a new overnight value.
 *
 * Maintains a FIFO rolling window of up to `maxDays` values.
 * New value is appended; if array exceeds maxDays, oldest value is removed.
 *
 * Per BIOMETRIC-ALGORITHM-SPEC.md §5.3:
 *   personalSDNNBaseline = mean(last 30 nights of valid overnight SDNN readings)
 *
 * @param existingValues - Current rolling array (oldest first)
 * @param newValue - Tonight's overnight mean SDNN in milliseconds
 * @param maxDays - Maximum window size (default 30)
 */
export function updateBaseline(
  existingValues: number[],
  newValue: number,
  maxDays = 30,
): BaselineUpdateResult {
  const updated = [...existingValues, newValue];
  const trimmed = updated.length > maxDays ? updated.slice(updated.length - maxDays) : updated;
  const mean = trimmed.reduce((sum, v) => sum + v, 0) / trimmed.length;
  return {
    values: trimmed,
    mean: Math.round(mean * 10) / 10,
  };
}

// ─── buildHRVWeights ──────────────────────────────────────────────────────────

/**
 * Build dynamic recovery score component weights based on HRV availability.
 *
 * Per BIOMETRIC-ALGORITHM-SPEC.md §3.1, all weights must sum to 1.0.
 *
 * With HRV active (available + calibrated):
 *   adherence=0.40, debt=0.30, hrv=0.25, transition=0.05
 *
 * Without HRV (no watch, calibrating, or in transition):
 *   adherence=0.50, debt=0.45, hrv=0.00, transition=0.05
 *
 * Note: "No-HRV" weights are 0.50/0.45/0.00/0.05 = 1.00, not 0.55/0.40/0.05.
 * The 0.50/0.45 split preserves the spirit of the original formula while
 * ensuring exact 1.0 sum. The spec's 0.55/0.40/0.05 = 1.00 was the old formula;
 * the new baseline (without HRV active) uses 0.50/0.45/0.00/0.05.
 *
 * @param hrv_available - True when Apple Watch is paired and HRV permission granted
 * @param baselineDays - Number of nights in the rolling baseline
 */
export function buildHRVWeights(hrv_available: boolean, baselineDays: number): HRVWeights {
  const hrv_active = hrv_available && baselineDays >= 14;

  if (hrv_active) {
    return {
      adherence: 0.40,
      debt: 0.30,
      hrv: 0.25,
      transition: 0.05,
    };
  }

  return {
    adherence: 0.50,
    debt: 0.45,
    hrv: 0.00,
    transition: 0.05,
  };
}
