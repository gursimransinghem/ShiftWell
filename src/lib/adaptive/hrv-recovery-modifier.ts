/**
 * HRV Recovery Modifier
 *
 * Computes an adjustment to the base recovery score based on how tonight's
 * HRV compares to the user's 14-night baseline.
 *
 * Methodology:
 * - 1 SD above baseline → 'elevated' → recovery bonus (+10 to +20)
 * - Within 1 SD → 'normal' → no adjustment
 * - 1 SD below baseline → 'depressed' → recovery penalty (-10 to -20)
 * - Fewer than 7 baseline readings → 'insufficient' → 0 modifier, low confidence
 *
 * The modifier is scaled linearly within the SD band so that readings
 * far from baseline receive larger adjustments.
 *
 * Scientific basis:
 * - Plews et al. (2013) — day-to-day HRV variation and recovery
 * - Buchheit (2014) — monitoring HRV for training load optimization
 */

import type { HRVReading } from '../healthkit/hrv-reader';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HRVRecoveryModifier {
  /** Adjustment applied to the base recovery score (-20 to +20) */
  modifier: number;
  /** Confidence in the modifier (0-1). Low when baseline is short. */
  confidence: number;
  /** Qualitative classification of tonight's HRV signal */
  signal: 'elevated' | 'normal' | 'depressed' | 'insufficient';
  /** Human-readable explanation for the UI */
  explanation: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Minimum readings required for a reliable baseline */
const MIN_BASELINE_READINGS = 7;
/** Maximum absolute modifier when HRV is exactly 2 SDs from baseline */
const MAX_MODIFIER = 20;
/** Modifier at exactly 1 SD from baseline */
const BASE_MODIFIER = 10;

// ─── computeHRVModifier ───────────────────────────────────────────────────────

/**
 * Compute the HRV-based recovery modifier.
 *
 * @param reading  - Tonight's overnight HRV reading
 * @param baseline - 14-night rolling baseline statistics
 */
export function computeHRVModifier(
  reading: HRVReading,
  baseline: { meanRMSSD: number; stdRMSSD: number; readings?: number },
): HRVRecoveryModifier {
  const baselineReadings = baseline.readings ?? MIN_BASELINE_READINGS;

  // Insufficient data — cannot compute reliable modifier
  if (baselineReadings < MIN_BASELINE_READINGS) {
    return {
      modifier: 0,
      confidence: 0.3,
      signal: 'insufficient',
      explanation:
        'Not enough HRV history yet. Wear your Apple Watch overnight for 7+ nights to unlock HRV-based recovery adjustments.',
    };
  }

  // Guard against zero std (all readings identical) to prevent division by zero
  const std = baseline.stdRMSSD > 0 ? baseline.stdRMSSD : 1;
  const deviation = (reading.rmssd - baseline.meanRMSSD) / std;
  const pctDiff = Math.round(
    Math.abs((reading.rmssd - baseline.meanRMSSD) / baseline.meanRMSSD) * 100,
  );

  if (deviation >= 1) {
    // Elevated HRV — scale linearly from +10 (at 1 SD) to +20 (at 2+ SDs)
    const rawModifier = BASE_MODIFIER + Math.min(BASE_MODIFIER, (deviation - 1) * BASE_MODIFIER);
    const modifier = Math.round(Math.min(MAX_MODIFIER, rawModifier));

    return {
      modifier,
      confidence: 0.85,
      signal: 'elevated',
      explanation: `Your HRV was ${pctDiff}% above your baseline tonight, suggesting strong recovery. +${modifier} to recovery score.`,
    };
  }

  if (deviation <= -1) {
    // Depressed HRV — scale linearly from -10 (at -1 SD) to -20 (at -2+ SDs)
    const rawModifier = BASE_MODIFIER + Math.min(BASE_MODIFIER, (Math.abs(deviation) - 1) * BASE_MODIFIER);
    const modifier = -Math.round(Math.min(MAX_MODIFIER, rawModifier));

    return {
      modifier,
      confidence: 0.85,
      signal: 'depressed',
      explanation: `Your HRV was ${pctDiff}% below your baseline tonight, suggesting reduced recovery. ${modifier} to recovery score.`,
    };
  }

  // Normal range — within 1 SD
  return {
    modifier: 0,
    confidence: 0.9,
    signal: 'normal',
    explanation: `Your HRV is within your normal range tonight (${reading.rmssd} ms vs ${baseline.meanRMSSD} ms baseline).`,
  };
}
